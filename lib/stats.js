import { Redis } from "@upstash/redis"

let redisClient

export const STAT_FEATURES = [
  { key: "ignote", label: "IG Note", category: "Maker" },
  { key: "ignote_json", label: "IG Note JSON", category: "Maker" },
  { key: "fakereact", label: "Fake React", category: "Maker" },
  { key: "monopoly", label: "Monopoly", category: "Game" },
  { key: "monopoly_board", label: "Monopoly Board", category: "Game" },
  { key: "monopoly_card", label: "Monopoly Card", category: "Game" },
  { key: "ludo", label: "Ludo", category: "Game" },
  { key: "ludo_board", label: "Ludo Board", category: "Game" },
  { key: "spy", label: "Who Is The Spy", category: "Game" },
  { key: "absen", label: "Absensi Group", category: "Game" }
]

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

function safeKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 80)
}

export function statsEnabled() {
  return Boolean(getRedis())
}

export async function recordRequest(endpoint) {
  const redis = getRedis()
  const feature = safeKey(endpoint)
  if (!redis || !feature) return

  const day = dateKey()

  try {
    await redis.pipeline()
      .incr("arunika:stats:total")
      .incr(`arunika:stats:day:${day}`)
      .incr(`arunika:stats:feature:${feature}`)
      .exec()
  } catch {
    return
  }
}

export async function getApiStats() {
  const redis = getRedis()
  const dayLabel = dateKey()
  const emptyFeatures = Object.fromEntries(STAT_FEATURES.map((feature) => [feature.key, 0]))

  if (!redis) {
    return { connected: false, total: 0, today: 0, dayLabel, features: emptyFeatures }
  }

  try {
    const keys = [
      "arunika:stats:total",
      `arunika:stats:day:${dayLabel}`,
      ...STAT_FEATURES.map((feature) => `arunika:stats:feature:${feature.key}`)
    ]
    const values = await redis.mget(...keys)
    const features = Object.fromEntries(
      STAT_FEATURES.map((feature, index) => [feature.key, Number(values[index + 2] || 0)])
    )

    return {
      connected: true,
      total: Number(values[0] || 0),
      today: Number(values[1] || 0),
      dayLabel,
      features
    }
  } catch {
    return { connected: false, total: 0, today: 0, dayLabel, features: emptyFeatures }
  }
}
