import {
  clean,
  createRoom,
  normalizeRoom,
  activePlayers,
  currentPlayer,
  playerIndex,
  nextActiveTurn,
  legalMoves,
  moveToken,
  hasWon,
  log,
  roomSummary,
  publicRoom,
  colorMeta,
  jidLabel,
  LUDO_COLORS
} from "../../../../lib/ludo-core"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const PREFIX = "arunika:ludo:v1:room:"

function keyFor(chatId) {
  return PREFIX + String(chatId)
}

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "Content-Type, X-API-Key"
  }
}

function response(body, status = 200) {
  return Response.json(body, { status, headers: corsHeaders() })
}

function requiredKey(request, payload = {}) {
  const expected = String(process.env.LUDO_API_KEY || process.env.API_KEY || "").trim()
  if (!expected) return true
  const provided = String(payload.apikey || request.headers.get("x-api-key") || "").trim()
  return provided === expected
}

function redisConfig() {
  const url = String(process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/$/, "")
  const token = String(process.env.UPSTASH_REDIS_REST_TOKEN || "")
  if (!url || !token) throw new Error("Upstash belum dikonfigurasi di Vercel.")
  return { url, token }
}

async function redis(command, args = []) {
  const { url, token } = redisConfig()
  const res = await fetch(url + "/pipeline", {
    method: "POST",
    headers: {
      authorization: "Bearer " + token,
      "content-type": "application/json"
    },
    body: JSON.stringify([[command, ...args]]),
    cache: "no-store"
  })
  const data = await res.json()
  if (!res.ok || !Array.isArray(data) || data[0]?.error) {
    throw new Error(data?.[0]?.error || "Upstash request gagal.")
  }
  return data[0]?.result ?? null
}

async function getRoom(chatId) {
  const raw = await redis("GET", [keyFor(chatId)])
  if (!raw) return null
  try {
    return normalizeRoom(JSON.parse(raw))
  } catch {
    return null
  }
}

async function setRoom(room) {
  room.updatedAt = Math.floor(Date.now() / 1000)
  await redis("SET", [keyFor(room.chatId), JSON.stringify(room)])
  return room
}

function fail(message, status = 400) {
  return { ok: false, status, message }
}

function ensureGroupPayload(payload) {
  const room = clean(payload.room || payload.chatId, 180)
  const sender = clean(payload.sender, 180)
  const name = clean(payload.name, 22)
  if (!room || !sender) return fail("room dan sender wajib diisi.")
  return { ok: true, room, sender, name: name || "Player" }
}

function turnText(room) {
  const player = currentPlayer(room)
  if (!player) return "-"
  return `${player.name} (${colorMeta(player.color).name})`
}

function winnerFromRemaining(room) {
  const alive = activePlayers(room)
  if (alive.length === 1) return alive[0]
  return null
}

function startRoom(room) {
  if (room.status !== "waiting") return fail("Game sudah dimulai atau sudah selesai.")
  if (room.players.length < 2) return fail("Minimal 2 pemain untuk mulai.")
  room.status = "playing"
  room.turn = 0
  room.pendingRoll = null
  room.lastRoll = null
  room.players.forEach((player) => {
    player.sixStreak = 0
    player.surrendered = false
    player.tokens = [-1, -1, -1, -1]
  })
  log(room, `Game dimulai. Giliran ${turnText(room)}.`)
  return { ok: true, message: `🎮 *LUDO DIMULAI*\n\nGiliran pertama: *${turnText(room)}*\nKetik #ludo roll` }
}

function rollRoom(room, sender) {
  if (room.status !== "playing") return fail("Game belum dimulai.")
  const player = currentPlayer(room)
  if (!player || player.jid !== sender) return fail(`Bukan giliranmu. Sekarang giliran ${turnText(room)}.`)
  if (room.pendingRoll) return fail(`Kamu sudah mendapat dadu ${room.pendingRoll.dice}. Pilih bidak: #ludo move <1-4>.`)

  const dice = Math.floor(Math.random() * 6) + 1
  room.lastRoll = dice
  player.sixStreak = dice === 6 ? player.sixStreak + 1 : 0

  if (player.sixStreak >= 3) {
    player.sixStreak = 0
    room.pendingRoll = null
    log(room, `${player.name} mendapat tiga angka 6. Giliran hangus.`)
    nextActiveTurn(room)
    return {
      ok: true,
      message: `🎲 *${player.name} mendapat 6 untuk ketiga kali.*\nGiliran hangus.\n\nGiliran berikutnya: *${turnText(room)}*`,
      render: true
    }
  }

  const legal = legalMoves(room, player, dice)
  if (!legal.length) {
    room.pendingRoll = null
    player.sixStreak = 0
    log(room, `${player.name} mendapat ${dice}, tetapi tidak ada bidak yang dapat bergerak.`)
    nextActiveTurn(room)
    return {
      ok: true,
      message: `🎲 *${player.name} mendapat ${dice}.*\nTidak ada bidak yang bisa bergerak.\n\nGiliran berikutnya: *${turnText(room)}*`,
      render: true
    }
  }

  room.pendingRoll = { sender, dice, legal }
  log(room, `${player.name} mendapat dadu ${dice}.`)
  return {
    ok: true,
    message: `🎲 *${player.name} mendapat ${dice}!*\n\nBidak yang bisa digerakkan: ${legal.map((n) => n + 1).join(", ")}\nKetik: *#ludo move <1-4>*`,
    render: true
  }
}

function moveRoom(room, sender, tokenInput) {
  if (room.status !== "playing") return fail("Game belum dimulai.")
  const player = currentPlayer(room)
  if (!player || player.jid !== sender) return fail(`Bukan giliranmu. Sekarang giliran ${turnText(room)}.`)
  const pending = room.pendingRoll
  if (!pending || pending.sender !== sender) return fail("Lempar dadu dahulu dengan #ludo roll.")
  const tokenIndex = Number(tokenInput) - 1
  if (!Number.isInteger(tokenIndex) || tokenIndex < 0 || tokenIndex > 3) return fail("Pilih bidak 1 sampai 4.")
  if (!pending.legal.includes(tokenIndex)) return fail("Bidak itu tidak bisa digerakkan dengan angka dadu saat ini.")

  const result = moveToken(room, player, tokenIndex, pending.dice)
  const events = []
  if (result.before === -1) events.push(`Bidak ${tokenIndex + 1} keluar dari rumah.`)
  else if (result.after === 57) events.push(`Bidak ${tokenIndex + 1} mencapai finish.`)
  else events.push(`Bidak ${tokenIndex + 1} maju ${pending.dice} langkah.`)

  if (result.captured.length) {
    const targets = result.captured.map((item) => `${item.player.name} #${item.token + 1}`).join(", ")
    events.push(`💥 Memakan: ${targets}.`)
  }

  room.pendingRoll = null
  if (hasWon(player)) {
    room.status = "ended"
    room.winner = { jid: player.jid, name: player.name, color: player.color }
    log(room, `${player.name} memenangkan Ludo Arena.`)
    return {
      ok: true,
      message: `🏆 *${player.name} MENANG!*\n\n${events.join("\n")}`,
      render: true
    }
  }

  if (pending.dice === 6) {
    log(room, `${player.name} mendapat giliran tambahan.`)
    return {
      ok: true,
      message: `🎲 *${player.name} mendapat giliran tambahan!*\n\n${events.join("\n")}\n\nKetik #ludo roll`,
      render: true
    }
  }

  player.sixStreak = 0
  nextActiveTurn(room)
  log(room, `${events.join(" ")} Giliran ${turnText(room)}.`)
  return {
    ok: true,
    message: `${events.join("\n")}\n\nGiliran berikutnya: *${turnText(room)}*`,
    render: true
  }
}

function joinRoom(room, sender, name) {
  if (room.status !== "waiting") return fail("Game sudah dimulai. Tunggu room berikutnya.")
  if (room.players.some((player) => player.jid === sender)) return fail("Kamu sudah masuk room ini.")
  if (room.players.length >= 4) return fail("Room sudah penuh.")
  const color = LUDO_COLORS[room.players.length]
  room.players.push({
    jid: sender,
    name,
    color: color.id,
    tokens: [-1, -1, -1, -1],
    joinedAt: Math.floor(Date.now() / 1000),
    sixStreak: 0,
    surrendered: false
  })
  log(room, `${name} bergabung sebagai ${color.name}.`)
  return { ok: true, message: `✅ *${name} bergabung sebagai ${color.name}.*\n\n${roomSummary(room)}`, render: true }
}

function leaveRoom(room, sender) {
  const index = playerIndex(room, sender)
  if (index < 0) return fail("Kamu tidak ada di room ini.")

  if (room.status === "waiting") {
    const leaving = room.players[index]
    room.players.splice(index, 1)
    room.players.forEach((player, playerIndex) => {
      player.color = LUDO_COLORS[playerIndex].id
    })
    room.host = room.players[0]?.jid || ""
    if (!room.players.length) return { ok: true, deleteRoom: true, message: "Room Ludo dibubarkan karena semua pemain keluar." }
    log(room, `${leaving.name} keluar dari room.`)
    return { ok: true, message: `🚪 *${leaving.name} keluar dari room.*\n\n${roomSummary(room)}`, render: true }
  }

  const player = room.players[index]
  player.surrendered = true
  player.tokens = [-1, -1, -1, -1]
  room.pendingRoll = null
  log(room, `${player.name} menyerah dan keluar dari permainan.`)

  const winner = winnerFromRemaining(room)
  if (winner) {
    room.status = "ended"
    room.winner = { jid: winner.jid, name: winner.name, color: winner.color }
    return { ok: true, message: `🏆 *${winner.name} menang karena semua lawan menyerah.*`, render: true }
  }

  if (room.turn === index) nextActiveTurn(room)
  return { ok: true, message: `🏳️ *${player.name} menyerah.*\n\nGiliran: *${turnText(room)}*`, render: true }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}

export async function GET(request) {
  try {
    const url = new URL(request.url)
    const payload = Object.fromEntries(url.searchParams.entries())
    if (!requiredKey(request, payload)) return response({ ok: false, message: "Invalid API key" }, 401)
    const roomId = clean(payload.room, 180)
    if (!roomId) return response({ ok: false, message: "Parameter room wajib diisi." }, 400)
    const room = await getRoom(roomId)
    if (!room) return response({ ok: false, message: "Room tidak ditemukan." }, 404)
    return response({ ok: true, room: publicRoom(room), text: roomSummary(room) })
  } catch (error) {
    return response({ ok: false, message: error.message || "Ludo API error" }, 500)
  }
}

export async function POST(request) {
  try {
    const payload = await request.json().catch(() => ({}))
    if (!requiredKey(request, payload)) return response({ ok: false, message: "Invalid API key" }, 401)
    const base = ensureGroupPayload(payload)
    if (!base.ok) return response(base, base.status || 400)

    const action = clean(payload.action, 24).toLowerCase() || "status"
    let room = await getRoom(base.room)
    let result

    if (action === "create") {
      if (room && room.status === "playing") return response({ ok: false, message: "Masih ada Ludo game aktif di grup ini." }, 409)
      room = createRoom(base.room, base.sender, base.name)
      result = { ok: true, message: `🎲 *ROOM LUDO DIBUAT*\n\nHost: *${base.name}*\nKetik *#ludo join* untuk masuk.\n\n${roomSummary(room)}`, render: true }
    } else {
      if (!room) return response({ ok: false, message: "Belum ada room. Gunakan #ludo create." }, 404)
      if (action === "join") result = joinRoom(room, base.sender, base.name)
      else if (action === "start") {
        if (room.host !== base.sender) result = fail("Hanya host yang bisa memulai game.")
        else result = startRoom(room)
      } else if (action === "roll") result = rollRoom(room, base.sender)
      else if (action === "move") result = moveRoom(room, base.sender, payload.token)
      else if (action === "leave" || action === "surrender") result = leaveRoom(room, base.sender)
      else if (action === "board") result = { ok: true, message: roomSummary(room), render: true }
      else if (action === "status") result = { ok: true, message: roomSummary(room), render: false }
      else result = fail("Action tidak dikenal.")
    }

    if (!result.ok) return response(result, result.status || 400)
    if (result.deleteRoom) await redis("DEL", [keyFor(base.room)])
    else await setRoom(room)

    return response({
      ok: true,
      message: result.message,
      render: Boolean(result.render),
      room: result.deleteRoom ? null : publicRoom(room)
    })
  } catch (error) {
    return response({ ok: false, message: error.message || "Ludo API error" }, 500)
  }
}
