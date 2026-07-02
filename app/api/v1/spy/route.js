import {
  activePlayers,
  clean,
  createPlayer,
  createRoom,
  leaveRoom,
  log,
  normalizeRoom,
  playerByJid,
  playerIndex,
  playerSummary,
  publicRoom,
  startRoom,
  statusEvent,
  submitClue,
  submitVote
} from "../../../../lib/spy-core"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const KEY_PREFIX = "arunika:spy:v1:room:"
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
  return json({
    ok: false,
    message: clean(message, 220) || "Request gagal."
  }, status)
}

function apiAllowed(request, payload = {}) {
  const expected = String(
    process.env.SPY_API_KEY ||
    process.env.API_KEY ||
    ""
  ).trim()

  if (!expected) return true

  const supplied = String(
    payload.apikey ||
    request.headers.get("x-api-key") ||
    ""
  ).trim()

  return supplied === expected
}

function redisConfig() {
  const url = String(
    process.env.UPSTASH_REDIS_REST_URL ||
    ""
  ).replace(/\/$/, "")
  const token = String(process.env.UPSTASH_REDIS_REST_TOKEN || "")

  if (!url || !token) {
    throw new Error("Upstash belum dikonfigurasi di Vercel.")
  }

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

function roomKey(roomId) {
  return KEY_PREFIX + String(roomId || "")
}

async function readRoom(roomId) {
  const raw = await redis("GET", [roomKey(roomId)])
  if (!raw) return null

  try {
    return normalizeRoom(typeof raw === "string" ? JSON.parse(raw) : raw)
  } catch {
    return null
  }
}

async function saveRoom(room) {
  room.updatedAt = Math.floor(Date.now() / 1000)

  await redis("SET", [
    roomKey(room.chatId),
    JSON.stringify(room),
    "EX",
    String(ROOM_TTL_SECONDS)
  ])

  return room
}

async function removeRoom(roomId) {
  await redis("DEL", [roomKey(roomId)])
}

function respondRoom(room, event = null, extra = {}) {
  return json({
    ok: true,
    room: publicRoom(room),
    event: event || room.lastEvent || null,
    message: event?.message || room.lastEvent?.message || "OK",
    ...extra
  })
}

function actorEvent(type, actor, message, extra = {}) {
  return {
    type,
    actor: playerSummary(actor),
    message,
    ...extra
  }
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  })
}

export async function GET(request) {
  try {
    const url = new URL(request.url)
    const roomId = String(url.searchParams.get("room") || "").trim()

    if (!roomId) return fail("Parameter room wajib diisi.")

    if (!apiAllowed(request, { apikey: url.searchParams.get("apikey") })) {
      return fail("API key tidak valid.", 401)
    }

    const room = await readRoom(roomId)

    if (!room) {
      return fail("Room Who Is The Spy tidak ditemukan.", 404)
    }

    return respondRoom(room, room.lastEvent)
  } catch (error) {
    console.error("SPY_GET_ERROR", error)
    return fail(error?.message || "Gagal membaca room Who Is The Spy.", 500)
  }
}

export async function POST(request) {
  try {
    const payload = await request.json().catch(() => ({}))

    if (!apiAllowed(request, payload)) {
      return fail("API key tidak valid.", 401)
    }

    const action = String(payload.action || "").trim().toLowerCase()
    const roomId = String(payload.room || payload.chatId || "").trim()
    const sender = String(payload.sender || "").trim()
    const name = clean(payload.name, 22) || "Pemain"

    if (!roomId || !sender) {
      return fail("Data room atau pemain tidak lengkap.")
    }

    if (!action) {
      return fail("Aksi Who Is The Spy belum dipilih.")
    }

    let room = await readRoom(roomId)

    if (action === "create") {
      if (room) {
        return fail("Room Spy sudah ada. Gunakan #spy join atau #spy reset.", 409)
      }

      room = createRoom(roomId, sender, name)
      const event = actorEvent(
        "create",
        room.players[0],
        "Room Who Is The Spy dibuat.",
        { next: room.players[0] }
      )

      room.lastEvent = event
      await saveRoom(room)
      return respondRoom(room, event)
    }

    if (!room) {
      return fail("Room Spy belum dibuat. Ketik #spy create.", 404)
    }

    if (action === "status") {
      const event = statusEvent(room, sender)
      return respondRoom(room, event)
    }

    if (action === "join") {
      if (room.status !== "waiting") {
        return fail("Permainan sudah dimulai. Tidak bisa bergabung sekarang.")
      }

      if (playerIndex(room, sender) >= 0) {
        return fail("Kamu sudah berada di room ini.")
      }

      if (activePlayers(room).length >= 12) {
        return fail("Room sudah penuh. Maksimal 12 pemain.")
      }

      const player = createPlayer(sender, name)
      room.players.push(player)
      log(room, player.name + " bergabung ke room Spy.")

      const event = actorEvent(
        "join",
        player,
        player.name + " bergabung.",
        { playerCount: activePlayers(room).length }
      )

      room.lastEvent = event
      await saveRoom(room)
      return respondRoom(room, event)
    }

    if (action === "start") {
      const result = startRoom(room, sender)
      if (!result.ok) return fail(result.message)

      await saveRoom(room)
      return respondRoom(room, result.event, {
        privateMessages: result.privateMessages
      })
    }

    if (action === "clue") {
      const clue = clean(payload.clue || payload.text || "", 80)
      const result = submitClue(room, sender, clue)
      if (!result.ok) return fail(result.message)

      await saveRoom(room)
      return respondRoom(room, result.event)
    }

    if (action === "vote") {
      const target = String(payload.target || payload.targetJid || "").trim()
      const result = submitVote(room, sender, target)
      if (!result.ok) return fail(result.message)

      await saveRoom(room)
      return respondRoom(room, result.event)
    }

    if (action === "leave") {
      const result = leaveRoom(room, sender)
      if (!result.ok) return fail(result.message)

      if (!activePlayers(room).length) {
        await removeRoom(roomId)

        return json({
          ok: true,
          room: null,
          event: result.event,
          message: "Room Spy dihapus karena semua pemain keluar."
        })
      }

      await saveRoom(room)
      return respondRoom(room, result.event)
    }

    if (action === "reset" || action === "stop") {
      if (String(room.host) !== String(sender)) {
        return fail("Hanya host yang dapat mereset room.")
      }

      await removeRoom(roomId)

      return json({
        ok: true,
        room: null,
        event: {
          type: "reset",
          message: "Room Who Is The Spy dihapus."
        },
        message: "Room Who Is The Spy dihapus."
      })
    }

    return fail("Aksi Who Is The Spy tidak dikenal.")
  } catch (error) {
    console.error("SPY_POST_ERROR", error)
    return fail(error?.message || "Gagal memproses Who Is The Spy.", 500)
  }
}
