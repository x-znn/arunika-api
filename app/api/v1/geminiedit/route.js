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

const SIZE_TO_ASPECT_RATIO = {
  "1024x1024": "1:1",
  "1536x1024": "3:2",
  "1024x1536": "2:3",
  "1792x1024": "16:9",
  "1024x1792": "9:16"
}

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

async function fetchPublicImage(value) {
  let current = await assertPublicUrl(value)

  for (let redirect = 0; redirect < 4; redirect += 1) {
    const response = await fetch(current, {
      method: "GET",
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
      headers: {
        Accept: "image/png,image/jpeg,image/webp,*/*;q=0.2",
        "User-Agent": "ArunikaAPI/1.0 GeminiImageEdit"
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

    const bytes = await readResponseBytes(response, MAX_INPUT_BYTES)
    return { bytes, mime }
  }

  throw new Error("Terlalu banyak redirect saat mengambil gambar sumber.")
}

function geminiKey() {
  const value = cleanText(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "", 500)

  if (!value) {
    throw new Error("GEMINI_API_KEY belum dikonfigurasi di server.")
  }

  return value
}

function geminiModel() {
  return cleanText(process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image", 160)
}

function geminiMessage(payload, fallback) {
  const candidate =
    payload?.error?.message ||
    payload?.message ||
    payload?.error?.status ||
    fallback

  return cleanText(candidate, 500) || fallback
}

function findGeneratedImage(data) {
  const candidates = Array.isArray(data?.candidates) ? data.candidates : []

  for (const candidate of candidates) {
    const parts = Array.isArray(candidate?.content?.parts) ? candidate.content.parts : []

    for (const part of parts) {
      const inline = part?.inlineData || part?.inline_data
      const base64 = cleanText(inline?.data || "", MAX_OUTPUT_BYTES * 2)
      const mime = cleanText(inline?.mimeType || inline?.mime_type || "", 100).toLowerCase()

      if (base64 && IMAGE_MIME_TYPES.has(mime)) {
        const bytes = Buffer.from(base64, "base64")

        if (!bytes.length || bytes.length > MAX_OUTPUT_BYTES) {
          throw new Error("Ukuran gambar hasil tidak valid.")
        }

        return { bytes, mime }
      }
    }
  }

  return null
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
  const aspectRatio = SIZE_TO_ASPECT_RATIO[requestedSize]

  if (!imageUrl) return fail("imageUrl wajib diisi.")
  if (prompt.length < 3) return fail("prompt minimal 3 karakter.")
  if (!aspectRatio) {
    return fail("size harus salah satu dari: 1024x1024, 1536x1024, 1024x1536, 1792x1024, atau 1024x1792.")
  }

  try {
    const source = await fetchPublicImage(imageUrl)

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/" + encodeURIComponent(geminiModel()) + ":generateContent",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": geminiKey(),
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text:
                    prompt +
                    "\n\nOutput instruction: preserve the main subject and create the edited result in a " +
                    aspectRatio +
                    " canvas ratio when possible. Return the edited image."
                },
                {
                  inlineData: {
                    mimeType: source.mime,
                    data: source.bytes.toString("base64")
                  }
                }
              ]
            }
          ],
          // Gemini 2.5 Flash Image accepts image + text directly. Keep the
          // request schema minimal for compatibility across API versions.
          // The requested ratio is expressed in the prompt instead of an
          // unsupported generationConfig field.
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      }
    )

    const raw = await response.text()
    let upstream

    try {
      upstream = raw ? JSON.parse(raw) : {}
    } catch {
      upstream = { message: raw }
    }

    if (!response.ok) {
      const message = geminiMessage(upstream, "Gemini gagal mengedit gambar.")
      const status = response.status >= 400 && response.status < 600 ? response.status : 502
      return fail("Gemini: " + message, status)
    }

    const result = findGeneratedImage(upstream)

    if (!result) {
      return fail("Gemini tidak mengembalikan gambar hasil. Coba ubah prompt atau gambar sumber.", 502)
    }

    await recordRequest("geminiedit")

    return new Response(result.bytes, {
      status: 200,
      headers: {
        "Content-Type": result.mime,
        "Content-Length": String(result.bytes.length),
        "Content-Disposition": "inline; filename=arunika-gemini-edit." + extensionForMime(result.mime),
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
        "X-Content-Type-Options": "nosniff"
      }
    })
  } catch (error) {
    const message = cleanText(error?.message || "Gagal mengedit gambar.", 500)

    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      return fail("Proses edit Gemini terlalu lama. Coba ulangi.", 504)
    }

    console.error("GEMINIEDIT_ERROR", error)
    return fail(message || "Gagal mengedit gambar.", 502)
  }
}
