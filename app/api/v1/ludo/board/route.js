import { renderLudoBoard } from "../../../../../lib/ludo-board"
import { normalizeRoom } from "../../../../../lib/ludo-core"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const PREFIX = "arunika:ludo:v1:room:"

function requiredKey(request, payload = {}) {
  const expected = String(process.env.LUDO_API_KEY || process.env.API_KEY || "").trim()
  if (!expected) return true
  const provided = String(payload.apikey || request.headers.get("x-api-key") || "").trim()
  return provided === expected
}

async function getRoom(roomId) {
  const url = String(process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/$/, "")
  const token = String(process.env.UPSTASH_REDIS_REST_TOKEN || "")
  if (!url || !token) throw new Error("Upstash belum dikonfigurasi di Vercel.")
  const res = await fetch(url + "/pipeline", {
    method: "POST",
    headers: { authorization: "Bearer " + token, "content-type": "application/json" },
    body: JSON.stringify([["GET", PREFIX + roomId]]),
    cache: "no-store"
  })
  const data = await res.json()
  const raw = data?.[0]?.result
  if (!raw) return null
  return normalizeRoom(JSON.parse(raw))
}

export async function GET(request) {
  try {
    const url = new URL(request.url)
    const query = Object.fromEntries(url.searchParams.entries())
    if (!requiredKey(request, query)) return Response.json({ ok: false, message: "Invalid API key" }, { status: 401 })
    const roomId = String(query.room || "").trim()
    if (!roomId) return Response.json({ ok: false, message: "Parameter room wajib diisi." }, { status: 400 })
    const room = await getRoom(roomId)
    if (!room) return Response.json({ ok: false, message: "Room tidak ditemukan." }, { status: 404 })
    const png = renderLudoBoard(room)
    return new Response(png, {
      headers: {
        "content-type": "image/png",
        "cache-control": "no-store, max-age=0"
      }
    })
  } catch (error) {
    return Response.json({ ok: false, message: error.message || "Gagal merender Ludo board" }, { status: 500 })
  }
}
