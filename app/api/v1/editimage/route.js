import { lookup } from "node:dns/promises"
import { isIP } from "node:net"
import { optionsResponse, verifyRateLimit, json } from "../../../../lib/security"
import { recordRequest } from "../../../../lib/stats"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

const MAX_INPUT_BYTES = 8 * 1024 * 1024
const MAX_OUTPUT_BYTES = 8 * 1024 * 1024
const MAX_PROMPT_LENGTH = 1200
const REQUEST_TIMEOUT_MS = 55_000
const ALLOWED_SIZES = new Set([
  "1024x1024",
  "1536x1024",
  "1024x1536",
  "1792x1024",
  "1024x1792"
])
const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp"
])

export function OPTIONS() {
  return optionsResponse()
}

function fail(message, status = 400) {
  return json({ status: false, message }, status)
}

function cleanText(value, max = 0) {
  const text = String(value == null ? "" : value)
    .replace(/\u0000/g, "")
    .trim()

  return max > 0 ? text.slice(0, max) : text
}

function isForbiddenIp(ip) {
  const type = isIP(ip)

  if (type === 4) {
    const parts = ip.split(".").map(Number)
    const [a, b] = parts

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

function contentTypeOf(response) {
  return cleanText(response.headers.get("content-type") || "", 120)
    .toLowerCase()
    .split(";", 1)[0]
}

function extensionForMime(mime) {
  if (mime === "image/png") return "png"
  if (mime === "image/webp") return "webp"
  return "jpg"
}

async function readResponseBytes(response, maxBytes) {
  const contentLength = Number(response.headers.get("content-length") || 0)

  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new Error("Ukuran gambar melebihi batas yang diizinkan.")
  }

  if (!response.body) {
    throw new Error("Respons gambar kosong.")
  }

  const chunks = []
  let total = 0

  for await (const chunk of response.body) {
    const bytes = Buffer.from(chunk)
    total += bytes.length

    if (total > maxBytes) {
      throw new Error("Ukuran gambar melebihi batas yang diizinkan.")
    }

    chunks.push(bytes)
  }

  if (!total) {
    throw new Error("Respons gambar kosong.")
  }

  return Buffer.concat(chunks, total)
}

async function fetchPublicImage(value, maxBytes = MAX_INPUT_BYTES) {
  let current = await assertPublicUrl(value)

  for (let redirect = 0; redirect < 4; redirect += 1) {
    const response = await fetch(current, {
      method: "GET",
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
      headers: {
        Accept: "image/png,image/jpeg,image/webp,*/*;q=0.2",
        "User-Agent": "ArunikaAPI/1.0 ImageEdit"
      }
    })

    if (response.status >= 300 && response.status < 400) {
      const next = response.headers.get("location")

      if (!next) {
        throw new Error("Redirect gambar tidak memiliki URL tujuan.")
      }

      current = await assertPublicUrl(new URL(next, current).toString())
      continue
    }

    if (!response.ok) {
      throw new Error("Gagal mengambil gambar sumber. Server gambar merespons " + response.status + ".")
    }

    const mime = contentTypeOf(response)

    if (!IMAGE_MIME_TYPES.has(mime)) {
      throw new Error("Format gambar harus JPG, PNG, atau WEBP.")
    }

    const bytes = await readResponseBytes(response, maxBytes)
    return { bytes, mime }
  }

  throw new Error("Terlalu banyak redirect saat mengambil gambar sumber.")
}

function proxyUrl() {
  const value = cleanText(process.env.LITELLM_PROXY_URL || "", 500).replace(/\/+$/, "")

  if (!value) {
    throw new Error("LITELLM_PROXY_URL belum dikonfigurasi di server.")
  }

  let parsed

  try {
    parsed = new URL(value)
  } catch {
    throw new Error("LITELLM_PROXY_URL tidak valid.")
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("LITELLM_PROXY_URL harus memakai http atau https.")
  }

  return value
}

function proxyKey() {
  const value = cleanText(process.env.LITELLM_PROXY_KEY || "", 500)

  if (!value) {
    throw new Error("LITELLM_PROXY_KEY belum dikonfigurasi di server.")
  }

  return value
}

function upstreamMessage(payload, fallback) {
  const candidate =
    payload?.error?.message ||
    payload?.error?.detail ||
    payload?.message ||
    payload?.detail ||
    fallback

  return cleanText(candidate, 500) || fallback
}

function decodeBase64Image(value) {
  const base64 = cleanText(value, MAX_OUTPUT_BYTES * 2)
    .replace(/^data:image\/[a-z0-9.+-]+;base64,/i, "")

  if (!base64) {
    throw new Error("LiteLLM tidak mengembalikan gambar hasil.")
  }

  const bytes = Buffer.from(base64, "base64")

  if (!bytes.length || bytes.length > MAX_OUTPUT_BYTES) {
    throw new Error("Ukuran gambar hasil tidak valid.")
  }

  return bytes
}

function outputMime(data) {
  const candidate = cleanText(
    data?.mime_type || data?.mimeType || data?.content_type || "",
    100
  ).toLowerCase()

  return IMAGE_MIME_TYPES.has(candidate) ? candidate : "image/png"
}

async function resultFromUrl(value) {
  return fetchPublicImage(value, MAX_OUTPUT_BYTES)
}

export async function POST(request) {
  const limited = await verifyRateLimit(request)
  if (limited) return limited

  let payload

  try {
    payload = await request.json()
  } catch {
    return fail("Body request harus berupa JSON yang valid.")
  }


  const imageUrl = cleanText(payload?.imageUrl || payload?.url || "", 2048)
  const prompt = cleanText(payload?.prompt || "", MAX_PROMPT_LENGTH)
  const requestedSize = cleanText(payload?.size || "1024x1024", 30)
  const size = ALLOWED_SIZES.has(requestedSize) ? requestedSize : ""

  if (!imageUrl) return fail("imageUrl wajib diisi.")
  if (prompt.length < 3) return fail("prompt minimal 3 karakter.")
  if (!size) {
    return fail("size harus salah satu dari: 1024x1024, 1536x1024, 1024x1536, 1792x1024, atau 1024x1792.")
  }

  try {
    const source = await fetchPublicImage(imageUrl)
    const form = new FormData()
    const model = cleanText(process.env.LITELLM_EDIT_MODEL || "gemini-image-edit", 160)
    const image = new Blob([source.bytes], { type: source.mime })

    form.set("model", model)
    form.set("prompt", prompt)
    form.set("image", image, "source." + extensionForMime(source.mime))
    form.set("n", "1")
    form.set("size", size)
    form.set("response_format", "b64_json")

    const response = await fetch(proxyUrl() + "/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + proxyKey(),
        Accept: "application/json"
      },
      body: form,
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    })

    const raw = await response.text()
    let upstream

    try {
      upstream = raw ? JSON.parse(raw) : {}
    } catch {
      upstream = { message: raw }
    }

    if (!response.ok) {
      const message = upstreamMessage(upstream, "LiteLLM gagal mengedit gambar.")
      const status = response.status >= 400 && response.status < 600 ? response.status : 502
      return fail("LiteLLM: " + message, status)
    }

    const item = Array.isArray(upstream?.data) ? upstream.data[0] : null

    if (!item) {
      return fail("LiteLLM tidak mengembalikan data gambar.", 502)
    }

    let result

    if (item.b64_json) {
      result = {
        bytes: decodeBase64Image(item.b64_json),
        mime: outputMime(item)
      }
    } else if (item.url) {
      result = await resultFromUrl(String(item.url))
    } else {
      return fail("LiteLLM tidak mengembalikan gambar hasil.", 502)
    }

    await recordRequest("editimage")

    return new Response(result.bytes, {
      status: 200,
      headers: {
        "Content-Type": result.mime,
        "Content-Length": String(result.bytes.length),
        "Content-Disposition": "inline; filename=arunika-edit." + extensionForMime(result.mime),
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
        "X-Content-Type-Options": "nosniff"
      }
    })
  } catch (error) {
    const message = cleanText(error?.message || "Gagal mengedit gambar.", 500)

    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      return fail("Proses edit gambar terlalu lama. Coba ulangi.", 504)
    }

    console.error("EDITIMAGE_ERROR", error)
    return fail(message || "Gagal mengedit gambar.", 502)
  }
}
