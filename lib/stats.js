import { Redis } from "@upstash/redis"

let redisClient

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  if (!redisClient) redisClient = new Redis({ url, token })
  return redisClient
}

function dateKey() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date())
}

export function statsEnabled() {
  return Boolean(getRedis())
}

export async function recordRequest(endpoint) {
  const redis = getRedis()
  if (!redis) return
  const day = dateKey()
  try {
    await redis.pipeline()
      .incr("arunika:stats:total")
      .incr(`arunika:stats:${endpoint}`)
      .incr(`arunika:stats:day:${day}`)
      .exec()
  } catch {
    return
  }
}

export async function getApiStats() {
  const redis = getRedis()
  const dayLabel = dateKey()
  if (!redis) return { connected: false, total: 0, ignote: 0, today: 0, dayLabel }
  try {
    const [total, ignote, today] = await redis.mget(
      "arunika:stats:total",
      "arunika:stats:ignote",
      `arunika:stats:day:${dayLabel}`
    )
    return {
      connected: true,
      total: Number(total || 0),
      ignote: Number(ignote || 0),
      today: Number(today || 0),
      dayLabel
    }
  } catch {
    return { connected: false, total: 0, ignote: 0, today: 0, dayLabel }
  }
}
