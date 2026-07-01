import { Redis } from "@upstash/redis"
import { normalizeRoom } from "../../../../../lib/monopoly-core"
import { renderMonopolyBoard } from "../../../../../lib/monopoly-render"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const KEY_PREFIX = "arunika:monopoly:v1:room:"
let redisClient

function getRedis() {
  const url = String(process.env.UPSTASH_REDIS_REST_URL || "").trim()
  const token = String(process.env.UPSTASH_REDIS_REST_TOKEN || "").trim()
  if (!url || !token) throw new Error("Upstash belum dikonfigurasi di Vercel.")
  if (!redisClient) redisClient = new Redis({ url, token })
  return redisClient
}

function authorized(request) {
  const expected = String(process.env.MONOPOLY_API_KEY || process.env.API_KEY || "").trim()
  if (!expected) return true
  const url = new URL(request.url)
  return String(url.searchParams.get("apikey") || request.headers.get("x-api-key") || "").trim() === expected
}

export async function GET(request) {
  try {
    if (!authorized(request)) return Response.json({ ok: false, message: "API key tidak valid." }, { status: 401 })
    const url = new URL(request.url)
    const roomId = String(url.searchParams.get("room") || "").trim()
    if (!roomId) return Response.json({ ok: false, message: "Parameter room wajib diisi." }, { status: 400 })
    const room = normalizeRoom(await getRedis().get(KEY_PREFIX + roomId))
    if (!room) return Response.json({ ok: false, message: "Room Monopoli tidak ditemukan." }, { status: 404 })
    const png = renderMonopolyBoard(room)
    return new Response(png, {
      headers: {
        "content-type": "image/png",
        "content-length": String(png.length),
        "cache-control": "public, max-age=30",
        "access-control-allow-origin": "*",
        "content-disposition": "inline; filename=monopoly-board.png"
      }
    })
  } catch (error) {
    console.error("MONOPOLY_BOARD_ERROR", error)
    return Response.json({ ok: false, message: "Gagal membuat gambar board Monopoli." }, { status: 500 })
  }
}
