import { lookup } from "node:dns/promises"
import { isIP } from "node:net"
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
    if (isForbiddenIp(host)) throw new Error("imageUrl tidak boleh mengarah ke jaringan internal.")
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
  return clean(response.headers.get("content-type") || "", 120).toLowerCase().split(";", 1)[0]
}

async function readBytes(response) {
  const declared = Number(response.headers.get("content-length") || 0)

  if (Number.isFinite(declared) && declared > MAX_INPUT_BYTES) {
    throw new Error("Ukuran gambar maksimal 8 MB.")
  }

  if (!response.body) throw new Error("Respons gambar kosong.")

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

  if (!total) throw new Error("Respons gambar kosong.")

  return Buffer.concat(chunks, total)
}

async function fetchMedia(value) {
  let current = await assertPublicUrl(value)

  for (let redirects = 0; redirects < 4; redirects += 1) {
    const response = await fetch(current, {
      method: "GET",
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
      headers: {
        Accept: "image/png,image/jpeg,image/webp,*/*;q=0.2",
        "User-Agent": "ArunikaAPI/1.0 FakeReact"
      }
    })

    if (response.status >= 300 && response.status < 400) {
      const next = response.headers.get("location")
      if (!next) throw new Error("Redirect media tidak memiliki URL tujuan.")
      current = await assertPublicUrl(new URL(next, current).toString())
      continue
    }

    if (!response.ok) {
      throw new Error("Gagal mengambil media sumber. Server merespons " + response.status + ".")
    }

    const mime = responseMime(response)

    if (!ALLOWED_MIME.has(mime)) {
      throw new Error("Format media harus JPG, PNG, atau WEBP.")
    }

    return { mime, bytes: await readBytes(response) }
  }

  throw new Error("Terlalu banyak redirect saat mengambil media.")
}

export async function POST(request) {
  const limited = await verifyRateLimit(request)
  if (limited) return limited

  let body

  try {
    body = await request.json()
  } catch {
    return fail("Body request harus berupa JSON yang valid.")
  }

  const imageUrl = clean(body?.imageUrl || body?.url || "", 2048)
  const mode = clean(body?.mode || body?.type || "image", 20).toLowerCase() === "sticker"
    ? "sticker"
    : "image"

  if (!imageUrl) return fail("imageUrl wajib diisi.")

  try {
    const source = await fetchMedia(imageUrl)
    const png = await renderFakeReact({ bytes: source.bytes, mime: source.mime, mode })

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
