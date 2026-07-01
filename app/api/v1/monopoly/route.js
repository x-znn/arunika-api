import { Redis } from "@upstash/redis"
import {
  clean,
  createRoom,
  createPlayer,
  currentPlayer,
  leaveRoom,
  log,
  normalizeRoom,
  playerIndex,
  publicRoom,
  rollRoom,
  startRoom,
  buyRoom
} from "../../../../lib/monopoly-core"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const KEY_PREFIX = "arunika:monopoly:v1:room:"
let redisClient

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "Content-Type, X-API-Key"
  }
}

function json(body, status = 200) {
  return Response.json(body, { status, headers: corsHeaders() })
}

function getRedis() {
  const url = String(process.env.UPSTASH_REDIS_REST_URL || "").trim()
  const token = String(process.env.UPSTASH_REDIS_REST_TOKEN || "").trim()
  if (!url || !token) throw new Error("Upstash belum dikonfigurasi di Vercel.")
  if (!redisClient) redisClient = new Redis({ url, token })
  return redisClient
}

function keyFor(room) {
  return KEY_PREFIX + String(room || "")
}

function allowed(request, payload = {}) {
  const expected = String(process.env.MONOPOLY_API_KEY || process.env.API_KEY || "").trim()
  if (!expected) return true
  const given = String(payload.apikey || request.headers.get("x-api-key") || "").trim()
  return given === expected
}

function fail(message, status = 400) {
  return json({ ok: false, message: clean(message, 220) || "Request gagal." }, status)
}

async function readRoom(roomId) {
  const value = await getRedis().get(keyFor(roomId))
  return normalizeRoom(value)
}

async function writeRoom(room) {
  room.updatedAt = Math.floor(Date.now() / 1000)
  await getRedis().set(keyFor(room.chatId), room, { ex: 60 * 60 * 24 * 14 })
}

async function deleteRoom(roomId) {
  await getRedis().del(keyFor(roomId))
}

function eventResponse(room, event) {
  return {
    ok: true,
    room: publicRoom(room),
    event: event || room.lastEvent || null,
    message: event?.message || room.lastEvent?.message || "OK"
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}

export async function GET(request) {
  try {
    const url = new URL(request.url)
    const roomId = String(url.searchParams.get("room") || "").trim()
    if (!roomId) return fail("Parameter room wajib diisi.")
    if (!allowed(request, { apikey: url.searchParams.get("apikey") })) return fail("API key tidak valid.", 401)
    const room = await readRoom(roomId)
    if (!room) return fail("Room Monopoli tidak ditemukan.", 404)
    return eventResponse(room, room.lastEvent)
  } catch (error) {
    console.error("MONOPOLY_GET_ERROR", error)
    return fail("Gagal membaca room Monopoli.", 500)
  }
}

export async function POST(request) {
  let payload = {}
  try {
    payload = await request.json()
  } catch {
    return fail("Body request harus JSON.")
  }

  try {
    if (!allowed(request, payload)) return fail("API key tidak valid.", 401)

    const action = String(payload.action || "").trim().toLowerCase()
    const roomId = String(payload.room || "").trim()
    const sender = String(payload.sender || "").trim()
    const name = clean(payload.name, 22) || "Pemain"

    if (!roomId || !sender) return fail("Data room atau pemain tidak lengkap.")
    if (!action) return fail("Aksi Monopoli belum dipilih.")

    let room = await readRoom(roomId)

    if (action === "create") {
      if (room) return fail("Room Monopoli sudah ada. Gunakan monopoly join atau monopoly reset.")
      room = createRoom(roomId, sender, name)
      await writeRoom(room)
      return eventResponse(room, { type: "create", actor: room.players[0], next: room.players[0], message: "Room Monopoli dibuat." })
    }

    if (!room) return fail("Room Monopoli belum dibuat. Ketik #monopoly create.")

    if (action === "join") {
      if (room.status !== "waiting") return fail("Permainan sudah dimulai. Tidak bisa bergabung sekarang.")
      const existing = playerIndex(room, sender)
      if (existing >= 0) return fail("Kamu sudah berada di room ini.")
      if (room.players.length >= 4) return fail("Room sudah penuh.")
      const colors = ["red", "green", "yellow", "blue"]
      const color = colors[room.players.length]
      room.players.push(createPlayer(sender, name, color))
      log(room, name + " bergabung sebagai " + room.players[room.players.length - 1].color + ".")
      room.lastEvent = { type: "join", actor: room.players[room.players.length - 1], next: currentPlayer(room), message: name + " bergabung." }
      await writeRoom(room)
      return eventResponse(room, room.lastEvent)
    }

    if (action === "start") {
      if (String(room.host) !== sender) return fail("Hanya host yang dapat memulai permainan.")
      if (room.status !== "waiting") return fail("Permainan sudah dimulai.")
      const result = startRoom(room)
      if (!result.ok) return fail(result.message)
      room.boardVersion += 1
      await writeRoom(room)
      return eventResponse(room, result.event)
    }

    if (action === "roll") {
      const result = rollRoom(room, sender)
      if (!result.ok) return fail(result.message)
      await writeRoom(room)
      return eventResponse(room, result.event)
    }

    if (action === "buy") {
      const result = buyRoom(room, sender, true)
      if (!result.ok) return fail(result.message)
      await writeRoom(room)
      return eventResponse(room, result.event)
    }

    if (action === "pass") {
      const result = buyRoom(room, sender, false)
      if (!result.ok) return fail(result.message)
      await writeRoom(room)
      return eventResponse(room, result.event)
    }

    if (action === "leave") {
      const result = leaveRoom(room, sender)
      if (!result.ok) return fail(result.message)
      await writeRoom(room)
      return eventResponse(room, result.event)
    }

    if (action === "reset") {
      if (String(room.host) !== sender) return fail("Hanya host yang dapat mereset room.")
      await deleteRoom(roomId)
      return json({ ok: true, deleted: true, message: "Room Monopoli dihapus." })
    }

    if (action === "status" || action === "board") {
      return eventResponse(room, room.lastEvent)
    }

    return fail("Aksi Monopoli tidak dikenal.")
  } catch (error) {
    console.error("MONOPOLY_POST_ERROR", error)
    return fail("Gagal memproses permainan Monopoli.", 500)
  }
}
