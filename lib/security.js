import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

let rateLimiter

function getLimiter() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  if (!rateLimiter) {
    rateLimiter = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(30, "60 s"),
      analytics: false,
      prefix: "arunika:ratelimit"
    })
  }
  return rateLimiter
}

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key",
      ...extraHeaders
    }
  })
}

export function optionsResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key",
      "Access-Control-Max-Age": "86400"
    }
  })
}

export function verifyApiKey(request) {
  const expected = String(process.env.API_KEY || "").trim()
  if (!expected) return null
  const url = new URL(request.url)
  const received = String(url.searchParams.get("apikey") || request.headers.get("x-api-key") || "")
  if (received === expected) return null
  return json({ status: false, message: "API key tidak valid." }, 401)
}

export async function verifyRateLimit(request) {
  const limiter = getLimiter()
  if (!limiter) return null
  const forwarded = request.headers.get("x-forwarded-for") || ""
  const ip = forwarded.split(",")[0].trim() || request.headers.get("x-real-ip") || "anonymous"
  try {
    const result = await limiter.limit(ip)
    if (result.success) return null
    return json(
      { status: false, message: "Terlalu banyak request. Coba lagi sebentar." },
      429,
      { "Retry-After": String(Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))) }
    )
  } catch {
    return null
  }
}
