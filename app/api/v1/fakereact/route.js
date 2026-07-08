import { lookup } from "node:dns/promises"
import { isIP } from "node:net"
import sharp from "sharp"
import { verifyRateLimit, json } from "../../../../lib/security"
import { recordRequest } from "../../../../lib/stats"
import { renderFakeReact } from "../../../../lib/fakereact"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

const MAX_INPUT_BYTES = 8 * 1024 * 1024
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"])

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    }
  })
}

function fail(message, status = 400) {
  return json({ status: false, message }, status)
}

function clean(value, max = 0) {
  const text = String(value == null ? "" : value).replace(/\u0000/g, "").trim()
  return max > 0 ? text.slice(0, max) : text
}

function cleanMime(value) {
  return clean(value, 160).toLowerCase().split(";", 1)[0].trim()
}

function isAllowedMime(value) {
  return ALLOWED_MIME.has(cleanMime(value))
}

function extToMime(value) {
  const ext = clean(value, 40)
    .toLowerCase()
    .replace(/^\./, "")
    .split(/[?#]/, 1)[0]

  if (ext === "jpg" || ext === "jpeg") return "image/jpeg"
  if (ext === "png") return "image/png"
  if (ext === "webp") return "image/webp"

  return ""
}

function extFromUrl(value) {
  try {
    const url = new URL(value)
    const last = url.pathname.split("/").pop() || ""
    const dot = last.lastIndexOf(".")
    return dot >= 0 ? last.slice(dot + 1) : ""
  } catch {
    return ""
  }
}

function sniffImageMime(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length < 12) return ""

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg"
  }

  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png"
  }

  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp"
  }

  return ""
}

function looksLikeTextPayload(bytes) {
  if (!Buffer.isBuffer(bytes) || !bytes.length) return false

  const head = bytes.slice(0, 160).toString("utf8").trim().toLowerCase()

  return (
    head.startsWith("<!doctype") ||
    head.startsWith("<html") ||
    head.includes("<html") ||
    head.startsWith("{") ||
    head.startsWith("[") ||
    head.includes("cloudflare") ||
    head.includes("access denied") ||
    head.includes("not found")
  )
}

async function sharpMime(bytes) {
  try {
    const meta = await sharp(bytes, { failOn: "none" }).metadata()

    if (meta?.format === "jpeg") return "image/jpeg"
    if (meta?.format === "png") return "image/png"
    if (meta?.format === "webp") return "image/webp"
  } catch {}

  return ""
}

async function detectRealMime({ headerMime = "", hintMime = "", extHint = "", url = "", bytes }) {
  const byBytes = sniffImageMime(bytes)
  if (isAllowedMime(byBytes)) return byBytes

  const bySharp = await sharpMime(bytes)
  if (isAllowedMime(bySharp)) return bySharp

  if (looksLikeTextPayload(bytes)) {
    return ""
  }

  const byHeader = cleanMime(headerMime)
  if (isAllowedMime(byHeader)) return byHeader

  const byHint = cleanMime(hintMime)
  if (isAllowedMime(byHint)) return byHint

  const byExtHint = extToMime(extHint)
  if (isAllowedMime(byExtHint)) return byExtHint

  const byUrlExt = extToMime(extFromUrl(url))
  if (isAllowedMime(byUrlExt)) return byUrlExt

  return ""
}

function isForbiddenIp(ip) {
  const type = isIP(ip)

  if (type === 4) {
    const [a, b] = ip.split(".").map(Number)

    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 0) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    )
  }

  if (type === 6) {
    const normalized = ip.toLowerCase()
    const mappedV4 = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)

    if (mappedV4) return isForbiddenIp(mappedV4[1])

    return (
      normalized === "::" ||
      normalized === "::1" ||
      normalized.startsWith("fe80:") ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("ff")
    )
  }

  return true
}

async function assertPublicUrl(value) {
  let url

  try {
    url = new URL(value)
  } catch {
    throw new Error("imageUrl harus berupa URL http atau https yang valid.")
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("imageUrl hanya boleh memakai http atau https.")
  }

  if (url.username || url.password) {
    throw new Error("imageUrl tidak boleh memuat username atau password.")
  }

  const host = url.hostname.toLowerCase()

  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
    throw new Error("imageUrl harus mengarah ke host publik.")
  }

  if (isIP(host)) {
    if (isForbiddenIp(host)) {
      throw new Error("imageUrl tidak boleh mengarah ke jaringan internal.")
    }

    return url
  }

  let records

  try {
    records = await lookup(host, { all: true, verbatim: true })
  } catch {
    throw new Error("Host imageUrl tidak dapat ditemukan.")
  }

  if (!records.length || records.some((record) => isForbiddenIp(record.address))) {
    throw new Error("imageUrl harus mengarah ke host publik.")
  }

  return url
}

function responseMime(response) {
  return cleanMime(response.headers.get("content-type") || "")
}

async function readBytes(response) {
  const declared = Number(response.headers.get("content-length") || 0)

  if (Number.isFinite(declared) && declared > MAX_INPUT_BYTES) {
    throw new Error("Ukuran gambar maksimal 8 MB.")
  }

  if (!response.body) {
    throw new Error("Respons gambar kosong.")
  }

  const chunks = []
  let total = 0

  for await (const chunk of response.body) {
    const bytes = Buffer.from(chunk)
    total += bytes.length

    if (total > MAX_INPUT_BYTES) {
      throw new Error("Ukuran gambar maksimal 8 MB.")
    }

    chunks.push(bytes)
  }

  if (!total) {
    throw new Error("Respons gambar kosong.")
  }

  return Buffer.concat(chunks, total)
}

async function fetchMedia(value, hints = {}) {
  let current = await assertPublicUrl(value)

  for (let redirects = 0; redirects < 4; redirects += 1) {
    const response = await fetch(current, {
      method: "GET",
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
      headers: {
        Accept: "image/jpeg,image/png,image/webp,application/octet-stream,*/*;q=0.2",
        "User-Agent": "Mozilla/5.0 (compatible; ArunikaAPI/1.0; +https://arunika-api-3xqp.vercel.app)"
      }
    })

    if (response.status >= 300 && response.status < 400) {
      const next = response.headers.get("location")

      if (!next) {
        throw new Error("Redirect media tidak memiliki URL tujuan.")
      }

      current = await assertPublicUrl(new URL(next, current).toString())
      continue
    }

    if (!response.ok) {
      throw new Error("Gagal mengambil media sumber. Server merespons " + response.status + ".")
    }

    const bytes = await readBytes(response)

    const mime = await detectRealMime({
      headerMime: responseMime(response),
      hintMime: hints.mimeHint,
      extHint: hints.extHint,
      url: current.toString(),
      bytes
    })

    if (!mime) {
      if (looksLikeTextPayload(bytes)) {
        throw new Error("URL media mengembalikan halaman HTML/teks, bukan file gambar.")
      }

      throw new Error("Format media harus JPG, PNG, atau WEBP.")
    }

    return { mime, bytes }
  }

  throw new Error("Terlalu banyak redirect saat mengambil media.")
}

function decodeBase64Image(value) {
  let raw = clean(value)

  if (!raw) {
    throw new Error("imageBase64 kosong.")
  }

  let mime = ""

  const dataUrl = raw.match(/^data:([^;]+);base64,(.+)$/i)

  if (dataUrl) {
    mime = cleanMime(dataUrl[1])
    raw = dataUrl[2]
  }

  raw = raw.replace(/\s+/g, "")

  if (!raw) {
    throw new Error("imageBase64 kosong.")
  }

  const bytes = Buffer.from(raw, "base64")

  if (!bytes.length) {
    throw new Error("imageBase64 tidak valid.")
  }

  if (bytes.length > MAX_INPUT_BYTES) {
    throw new Error("Ukuran gambar maksimal 8 MB.")
  }

  return { mime, bytes }
}

async function sourceFromBase64(body) {
  const base64 = clean(
    body?.imageBase64 ||
      body?.base64 ||
      body?.fileBase64 ||
      body?.mediaBase64 ||
      "",
    0
  )

  if (!base64) return null

  const decoded = decodeBase64Image(base64)

  const mime = await detectRealMime({
    headerMime: decoded.mime,
    hintMime: body?.mimeHint,
    extHint: body?.extHint,
    bytes: decoded.bytes
  })

  if (!mime) {
    throw new Error("Format media harus JPG, PNG, atau WEBP.")
  }

  return {
    mime,
    bytes: decoded.bytes
  }
}

async function parseRequest(request) {
  const contentType = cleanMime(request.headers.get("content-type") || "")

  if (contentType.startsWith("multipart/form-data")) {
    const form = await request.formData()
    const file = form.get("file") || form.get("image") || form.get("media")

    const mode =
      clean(form.get("mode") || form.get("type") || "image", 20).toLowerCase() === "sticker"
        ? "sticker"
        : "image"

    if (!file || typeof file.arrayBuffer !== "function") {
      throw new Error("Form data wajib berisi file, image, atau media.")
    }

    const bytes = Buffer.from(await file.arrayBuffer())

    if (!bytes.length) {
      throw new Error("File kosong.")
    }

    if (bytes.length > MAX_INPUT_BYTES) {
      throw new Error("Ukuran gambar maksimal 8 MB.")
    }

    const mime = await detectRealMime({
      headerMime: file.type || "",
      hintMime: form.get("mimeHint") || "",
      extHint: form.get("extHint") || file.name || "",
      bytes
    })

    if (!mime) {
      throw new Error("Format media harus JPG, PNG, atau WEBP.")
    }

    return {
      mode,
      source: {
        mime,
        bytes
      }
    }
  }

  let body

  try {
    body = await request.json()
  } catch {
    throw new Error("Body request harus berupa JSON yang valid.")
  }

  const mode =
    clean(body?.mode || body?.type || "image", 20).toLowerCase() === "sticker"
      ? "sticker"
      : "image"

  const base64Source = await sourceFromBase64(body)

  if (base64Source) {
    return {
      mode,
      source: base64Source
    }
  }

  const imageUrl = clean(body?.imageUrl || body?.url || "", 2048)

  if (!imageUrl) {
    throw new Error("imageUrl wajib diisi.")
  }

  return {
    mode,
    source: await fetchMedia(imageUrl, {
      mimeHint: body?.mimeHint || "",
      extHint: body?.extHint || ""
    })
  }
}

export async function POST(request) {
  const limited = await verifyRateLimit(request)
  if (limited) return limited

  try {
    const { mode, source } = await parseRequest(request)

    const png = await renderFakeReact({
      bytes: source.bytes,
      mime: source.mime,
      mode
    })

    await recordRequest("fakereact")

    return new Response(png, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": String(png.length),
        "Content-Disposition": "inline; filename=fakereact.png",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
        "X-Content-Type-Options": "nosniff"
      }
    })
  } catch (error) {
    const message = clean(error?.message || "Gagal membuat fake react.", 500)
    console.error("FAKEREACT_ERROR", error)

    return fail(message || "Gagal membuat fake react.", 502)
  }
}
