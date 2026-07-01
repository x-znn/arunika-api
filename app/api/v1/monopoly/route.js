import {
  buyRoom,
  clean,
  createPlayer,
  createRoom,
  currentPlayer,
  leaveRoom,
  log,
  normalizeRoom,
  passRoom,
  payRentRoom,
  playerIndex,
  publicRoom,
  rollRoom,
  startRoom,
  upgradeRoom
} from "../../../../lib/monopoly-core"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const KEY_PREFIX = "arunika:monopoly:v2:room:"
const ROOM_TTL_SECONDS = 60 * 60 * 24 * 14

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

function fail(message, status = 400) {
  return json({ ok: false, message: clean(message, 220) || "Request gagal." }, status)
}

function apiAllowed(request, payload = {}) {
  const expected = String(process.env.MONOPOLY_API_KEY || process.env.API_KEY || "").trim()
  if (!expected) return true
  const supplied = String(payload.apikey || request.headers.get("x-api-key") || "").trim()
  return supplied === expected
}

function redisConfig() {
  const url = String(process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/$/, "")
  const token = String(process.env.UPSTASH_REDIS_REST_TOKEN || "")
  if (!url || !token) throw new Error("Upstash belum dikonfigurasi di Vercel.")
  return { url, token }
}

async function redis(command, args = []) {
  const { url, token } = redisConfig()
  const response = await fetch(url + "/pipeline", {
    method: "POST",
    headers: {
      authorization: "Bearer " + token,
      "content-type": "application/json"
    },
    body: JSON.stringify([[command, ...args]]),
    cache: "no-store"
  })

  const data = await response.json().catch(() => null)
  if (!response.ok || !Array.isArray(data) || data[0]?.error) {
    throw new Error(data?.[0]?.error || "Upstash request gagal.")
  }
  return data[0]?.result ?? null
}

function roomKey(room) {
  return KEY_PREFIX + String(room || "")
}

async function readRoom(room) {
  const raw = await redis("GET", [roomKey(room)])
  if (!raw) return null
  try {
    return normalizeRoom(typeof raw === "string" ? JSON.parse(raw) : raw)
  } catch {
    return null
  }
}

async function saveRoom(room) {
  room.updatedAt = Math.floor(Date.now() / 1000)
  await redis("SET", [roomKey(room.chatId), JSON.stringify(room), "EX", String(ROOM_TTL_SECONDS)])
  return room
}

async function removeRoom(room) {
  await redis("DEL", [roomKey(room)])
}

function respondRoom(room, event = null) {
  return json({
    ok: true,
    room: publicRoom(room),
    event: event || room.lastEvent || null,
    message: event?.message || room.lastEvent?.message || "OK"
  })
}

function actorEvent(type, actor, message, extra = {}) {
  return {
    type,
    actor: actor ? {
      jid: actor.jid,
      name: actor.name,
      color: actor.color,
      money: actor.money,
      position: actor.position,
      positionName: actor.positionName
    } : null,
    message,
    ...extra
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
    if (!apiAllowed(request, { apikey: url.searchParams.get("apikey") })) return fail("API key tidak valid.", 401)
    const room = await readRoom(roomId)
    if (!room) return fail("Room Monopoli tidak ditemukan.", 404)
    return respondRoom(room, room.lastEvent)
  } catch (error) {
    console.error("MONOPOLY_GET_ERROR", error)
    return fail(error?.message || "Gagal membaca room Monopoli.", 500)
  }
}

export async function POST(request) {
  try {
    const payload = await request.json().catch(() => ({}))
    if (!apiAllowed(request, payload)) return fail("API key tidak valid.", 401)

    const action = String(payload.action || "").trim().toLowerCase()
    const roomId = String(payload.room || payload.chatId || "").trim()
    const sender = String(payload.sender || "").trim()
    const name = clean(payload.name, 22) || "Pemain"

    if (!roomId || !sender) return fail("Data room atau pemain tidak lengkap.")
    if (!action) return fail("Aksi Monopoli belum dipilih.")

    let room = await readRoom(roomId)

    if (action === "create") {
      if (room) return fail("Room Monopoli sudah ada. Gunakan monopoly join atau monopoly reset.", 409)
      room = createRoom(roomId, sender, name)
      const event = actorEvent("create", room.players[0], "Room Monopoli dibuat.", { next: room.players[0] })
      room.lastEvent = event
      await saveRoom(room)
      return respondRoom(room, event)
    }

    if (!room) return fail("Room Monopoli belum dibuat. Ketik #monopoly create.", 404)

    if (action === "status" || action === "board" || action === "assets") {
      const actor = room.players[playerIndex(room, sender)] || null
      const event = actorEvent(action, actor, action === "assets" ? "Data aset pemain." : "Status Monopoli.", { next: currentPlayer(room) })
      return respondRoom(room, event)
    }

    if (action === "join") {
      if (room.status !== "waiting") return fail("Permainan sudah dimulai. Tidak bisa bergabung sekarang.")
      if (playerIndex(room, sender) >= 0) return fail("Kamu sudah berada di room ini.")
      if (room.players.length >= 4) return fail("Room sudah penuh.")
      const colors = ["red", "green", "yellow", "blue"]
      const player = createPlayer(sender, name, colors[room.players.length])
      room.players.push(player)
      log(room, player.name + " bergabung sebagai " + player.color + ".")
      const event = actorEvent("join", player, player.name + " bergabung.", { next: currentPlayer(room) })
      room.lastEvent = event
      await saveRoom(room)
      return respondRoom(room, event)
    }

    if (action === "start") {
      if (String(room.host) !== sender) return fail("Hanya host yang dapat memulai permainan.")
      const result = startRoom(room)
      if (!result.ok) return fail(result.message)
      await saveRoom(room)
      return respondRoom(room, result.event)
    }

    if (action === "roll") {
      const result = rollRoom(room, sender)
      if (!result.ok) return fail(result.message)
      await saveRoom(room)
      return respondRoom(room, result.event)
    }

    if (action === "buy") {
      const result = buyRoom(room, sender)
      if (!result.ok) return fail(result.message)
      await saveRoom(room)
      return respondRoom(room, result.event)
    }

    if (action === "upgrade") {
      const result = upgradeRoom(room, sender)
      if (!result.ok) return fail(result.message)
      await saveRoom(room)
      return respondRoom(room, result.event)
    }

    if (action === "pay") {
      const result = payRentRoom(room, sender)
      if (!result.ok) return fail(result.message)
      await saveRoom(room)
      return respondRoom(room, result.event)
    }

    if (action === "pass") {
      const result = passRoom(room, sender)
      if (!result.ok) return fail(result.message)
      await saveRoom(room)
      return respondRoom(room, result.event)
    }

    if (action === "leave" || action === "surrender") {
      const result = leaveRoom(room, sender)
      if (!result.ok) return fail(result.message)
      await saveRoom(room)
      return respondRoom(room, result.event)
    }

    if (action === "reset") {
      if (String(room.host) !== sender) return fail("Hanya host yang dapat mereset room.")
      await removeRoom(roomId)
      return json({ ok: true, room: null, event: { type: "reset", message: "Room Monopoli dihapus." }, message: "Room Monopoli dihapus." })
    }

    return fail("Aksi Monopoli tidak dikenal.")
  } catch (error) {
    console.error("MONOPOLY_POST_ERROR", error)
    return fail(error?.message || "Gagal memproses Monopoli.", 500)
  }
}
