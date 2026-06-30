import {
  clean,
  createRoom,
  createPlayer,
  normalizeRoom,
  activePlayers,
  currentPlayer,
  playerIndex,
  nextActiveTurn,
  legalMoves,
  moveToken,
  hasWon,
  log,
  publicRoom,
  colorMeta,
  LUDO_COLORS,
  autoFocus,
  nowSeconds
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

function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: corsHeaders()
  })
}

function apiAllowed(request, payload = {}) {
  const expected = String(
    process.env.LUDO_API_KEY || process.env.API_KEY || ""
  ).trim()

  if (!expected) {
    return true
  }

  const provided = String(
    payload.apikey || request.headers.get("x-api-key") || ""
  ).trim()

  return provided === expected
}

function redisConfig() {
  const url = String(process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/$/, "")
  const token = String(process.env.UPSTASH_REDIS_REST_TOKEN || "")

  if (!url || !token) {
    throw new Error("Upstash belum dikonfigurasi di Vercel.")
  }

  return { url, token }
}

async function redis(command, args = []) {
  const { url, token } = redisConfig()
  const result = await fetch(url + "/pipeline", {
    method: "POST",
    headers: {
      authorization: "Bearer " + token,
      "content-type": "application/json"
    },
    body: JSON.stringify([[command, ...args]]),
    cache: "no-store"
  })

  const data = await result.json()

  if (!result.ok || !Array.isArray(data) || data[0]?.error) {
    throw new Error(data?.[0]?.error || "Upstash request gagal.")
  }

  return data[0]?.result ?? null
}

async function getRoom(chatId) {
  const raw = await redis("GET", [keyFor(chatId)])

  if (!raw) {
    return null
  }

  try {
    return normalizeRoom(JSON.parse(raw))
  } catch {
    return null
  }
}

async function saveRoom(room) {
  room.updatedAt = nowSeconds()
  await redis("SET", [keyFor(room.chatId), JSON.stringify(room)])
  return room
}

function fail(message, status = 400) {
  return {
    ok: false,
    status,
    message
  }
}

function payloadBase(payload) {
  const room = clean(payload.room || payload.chatId, 180)
  const sender = clean(payload.sender, 180)
  const name = clean(payload.name, 22) || "Player"

  if (!room || !sender) {
    return fail("room dan sender wajib diisi.")
  }

  return {
    ok: true,
    room,
    sender,
    name
  }
}

function turnInfo(room) {
  const player = currentPlayer(room)

  return player
    ? {
        jid: player.jid,
        name: player.name,
        color: player.color,
        activeToken: Number(player.activeToken) + 1
      }
    : null
}

function playerData(player) {
  if (!player) {
    return null
  }

  return {
    jid: player.jid,
    name: player.name,
    color: player.color,
    activeToken: Number(player.activeToken) + 1,
    tokens: player.tokens.slice(),
    surrendered: Boolean(player.surrendered)
  }
}

function turnText(room) {
  const player = currentPlayer(room)

  return player
    ? player.name + " (" + colorMeta(player.color).name + ")"
    : "-"
}

function startRoom(room) {
  if (room.status !== "waiting") {
    return fail("Game sudah dimulai atau sudah selesai.")
  }

  if (room.players.length < 2) {
    return fail("Minimal 2 pemain untuk mulai.")
  }

  room.status = "playing"
  room.turn = 0
  room.pendingRoll = null
  room.lastRoll = null
  room.winner = null

  room.players.forEach((player) => {
    player.tokens = [-1, -1, -1, -1]
    player.activeToken = 0
    player.sixStreak = 0
    player.surrendered = false
  })

  log(room, "Game dimulai. Giliran " + turnText(room) + ".")

  return {
    ok: true,
    event: "start",
    message: "Game dimulai.",
    render: false,
    next: turnInfo(room)
  }
}

function rollRoom(room, sender) {
  if (room.status !== "playing") {
    return fail("Game belum dimulai.")
  }

  const player = currentPlayer(room)

  if (!player || player.jid !== sender) {
    return fail("Bukan giliranmu. Sekarang giliran " + turnText(room) + ".")
  }

  if (room.pendingRoll) {
    return fail(
      "Kamu sudah mendapat dadu " +
      room.pendingRoll.dice +
      ". Pilih pion dengan #ludo move <1-4>."
    )
  }

  const dice = Math.floor(Math.random() * 6) + 1
  room.lastRoll = dice
  player.sixStreak = dice === 6 ? Number(player.sixStreak || 0) + 1 : 0

  if (player.sixStreak >= 3) {
    player.sixStreak = 0
    room.pendingRoll = null
    nextActiveTurn(room)

    log(room, player.name + " mendapat tiga angka 6. Giliran hangus.")

    return {
      ok: true,
      event: "skip",
      message: "Tiga angka 6 berturut-turut. Giliran hangus.",
      render: false,
      dice,
      actor: playerData(player),
      next: turnInfo(room)
    }
  }

  const legal = legalMoves(player, dice)

  if (!legal.length) {
    player.sixStreak = 0
    room.pendingRoll = null
    nextActiveTurn(room)

    log(room, player.name + " mendapat " + dice + ", pion fokus tidak dapat bergerak.")

    return {
      ok: true,
      event: "skip",
      message: "Pion fokus tidak dapat bergerak.",
      render: false,
      dice,
      actor: playerData(player),
      next: turnInfo(room)
    }
  }

  room.pendingRoll = {
    sender,
    dice,
    legal
  }

  log(room, player.name + " mendapat dadu " + dice + ".")

  return {
    ok: true,
    event: "roll",
    message: "Pilih pion.",
    render: false,
    dice,
    actor: playerData(player),
    legal: legal.map((index) => index + 1),
    next: turnInfo(room)
  }
}

function moveRoom(room, sender, tokenInput) {
  if (room.status !== "playing") {
    return fail("Game belum dimulai.")
  }

  const player = currentPlayer(room)

  if (!player || player.jid !== sender) {
    return fail("Bukan giliranmu. Sekarang giliran " + turnText(room) + ".")
  }

  const pending = room.pendingRoll

  if (!pending || pending.sender !== sender) {
    return fail("Lempar dadu dahulu dengan #ludo roll.")
  }

  const tokenIndex = Number(tokenInput) - 1

  if (!Number.isInteger(tokenIndex) || tokenIndex < 0 || tokenIndex > 3) {
    return fail("Pilih pion 1 sampai 4.")
  }

  if (!pending.legal.includes(tokenIndex)) {
    const focus = Number(player.activeToken) + 1

    return fail(
      pending.dice === 6
        ? "Pion itu tidak bisa digerakkan dengan angka 6 saat ini."
        : "Tanpa angka 6, hanya Pion " + focus + " yang boleh berjalan."
    )
  }

  const result = moveToken(room, player, tokenIndex, pending.dice)

  if (result.before === -1 && result.after !== 0) {
    return fail("Pion tidak bisa keluar dari Home.")
  }

  const events = []

  if (result.before === -1) {
    events.push("Pion " + (tokenIndex + 1) + " keluar dari Home.")
  } else if (result.after === 57) {
    events.push("Pion " + (tokenIndex + 1) + " mencapai Finish.")
  } else {
    events.push("Pion " + (tokenIndex + 1) + " maju " + pending.dice + " langkah.")
  }

  const captures = result.captured.map((item) => ({
    player: item.player,
    token: item.token + 1,
    returnedTo: "Home"
  }))

  if (captures.length) {
    events.push(
      "Capture: " +
      captures
        .map((item) => item.player.name + " • Pion " + item.token + " kembali ke Home")
        .join(", ") +
      "."
    )
  }

  room.pendingRoll = null

  if (hasWon(player)) {
    room.status = "ended"
    room.winner = {
      jid: player.jid,
      name: player.name,
      color: player.color
    }

    log(room, player.name + " memenangkan Ludo Arena.")

    return {
      ok: true,
      event: "win",
      message: events.join(" "),
      render: true,
      dice: pending.dice,
      actor: playerData(player),
      token: tokenIndex + 1,
      captures,
      extraTurn: false,
      next: null
    }
  }

  const extraTurn = pending.dice === 6

  if (!extraTurn) {
    player.sixStreak = 0
    nextActiveTurn(room)
  }

  const next = turnInfo(room)

  log(
    room,
    events.join(" ") +
      " Giliran " +
      (next?.name || "-") +
      "."
  )

  return {
    ok: true,
    event: captures.length
      ? "capture"
      : result.after === 57
        ? "finish"
        : "move",
    message: events.join(" "),
    render: true,
    dice: pending.dice,
    actor: playerData(player),
    token: tokenIndex + 1,
    position: result.after,
    captures,
    extraTurn,
    next
  }
}

function joinRoom(room, sender, name) {
  if (room.status !== "waiting") {
    return fail("Game sudah dimulai. Tunggu room berikutnya.")
  }

  if (room.players.some((player) => player.jid === sender)) {
    return fail("Kamu sudah masuk room ini.")
  }

  if (room.players.length >= 4) {
    return fail("Room sudah penuh.")
  }

  const color = LUDO_COLORS[room.players.length]
  const player = createPlayer(sender, name, color.id)
  room.players.push(player)

  log(room, name + " bergabung sebagai " + colorMeta(color.id).name + ".")

  return {
    ok: true,
    event: "join",
    message: name + " bergabung.",
    render: false,
    actor: playerData(player),
    next: null
  }
}

function leaveWaitingRoom(room, sender) {
  const index = playerIndex(room, sender)

  if (index < 0) {
    return fail("Kamu tidak ada di room ini.")
  }

  const leaving = room.players[index]
  room.players.splice(index, 1)

  if (!room.players.length) {
    return {
      ok: true,
      event: "leave",
      deleteRoom: true,
      message: "Room dibubarkan.",
      actor: playerData(leaving),
      next: null
    }
  }

  room.players.forEach((player, playerPosition) => {
    player.color = LUDO_COLORS[playerPosition].id
    autoFocus(player)
  })

  room.host = room.players[0].jid
  room.turn = 0
  log(room, leaving.name + " keluar dari room.")

  return {
    ok: true,
    event: "leave",
    message: leaving.name + " keluar dari room.",
    render: false,
    actor: playerData(leaving),
    next: null
  }
}

function leavePlayingRoom(room, sender) {
  const index = playerIndex(room, sender)

  if (index < 0) {
    return fail("Kamu tidak ada di game ini.")
  }

  const player = room.players[index]

  if (player.surrendered) {
    return fail("Kamu sudah keluar dari game ini.")
  }

  player.surrendered = true
  player.tokens = [-1, -1, -1, -1]
  player.sixStreak = 0
  player.activeToken = 0
  room.pendingRoll = null
  room.lastRoll = null

  log(room, player.name + " keluar dari permainan.")

  const survivors = activePlayers(room)

  if (survivors.length === 1) {
    const winner = survivors[0]
    room.status = "ended"
    room.winner = {
      jid: winner.jid,
      name: winner.name,
      color: winner.color
    }

    return {
      ok: true,
      event: "win",
      message: winner.name + " menang karena lawan keluar.",
      render: false,
      actor: playerData(player),
      next: null
    }
  }

  if (Number(room.turn) === index) {
    nextActiveTurn(room)
  }

  return {
    ok: true,
    event: "leave",
    message: player.name + " keluar dari game.",
    render: false,
    actor: playerData(player),
    next: turnInfo(room)
  }
}

function leaveRoom(room, sender) {
  if (room.status === "waiting") {
    return leaveWaitingRoom(room, sender)
  }

  if (room.status === "playing") {
    return leavePlayingRoom(room, sender)
  }

  return fail("Game ini sudah selesai. Host dapat membuat room baru.")
}

function resetRoom(room, sender) {
  if (String(room.host) !== String(sender)) {
    return fail("Hanya host yang bisa mereset room Ludo.")
  }

  const host = room.players.find((player) => player.jid === sender)

  return {
    ok: true,
    event: "reset",
    deleteRoom: true,
    message: "Room direset. Semua pemain dikeluarkan.",
    actor: playerData(host),
    playersOut: activePlayers(room).length,
    next: null
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  })
}

export async function GET(request) {
  try {
    const url = new URL(request.url)
    const payload = Object.fromEntries(url.searchParams.entries())

    if (!apiAllowed(request, payload)) {
      return json({ ok: false, message: "Invalid API key" }, 401)
    }

    const roomId = clean(payload.room, 180)

    if (!roomId) {
      return json({ ok: false, message: "Parameter room wajib diisi." }, 400)
    }

    const room = await getRoom(roomId)

    if (!room) {
      return json({ ok: false, message: "Room tidak ditemukan." }, 404)
    }

    return json({
      ok: true,
      room: publicRoom(room)
    })
  } catch (error) {
    return json({
      ok: false,
      message: error.message || "Ludo API error"
    }, 500)
  }
}

export async function POST(request) {
  try {
    const payload = await request.json().catch(() => ({}))

    if (!apiAllowed(request, payload)) {
      return json({ ok: false, message: "Invalid API key" }, 401)
    }

    const base = payloadBase(payload)

    if (!base.ok) {
      return json(base, base.status || 400)
    }

    const action = clean(payload.action, 24).toLowerCase() || "status"
    let room = await getRoom(base.room)
    let result

    if (action === "create") {
      if (room?.status === "playing") {
        return json({
          ok: false,
          message: "Masih ada Ludo game aktif di grup ini. Gunakan #ludo reset jika kamu host."
        }, 409)
      }

      if (room?.status === "waiting") {
        return json({
          ok: false,
          message: "Room masih tersedia. Gunakan #ludo join atau #ludo reset."
        }, 409)
      }

      room = createRoom(base.room, base.sender, base.name)
      result = {
        ok: true,
        event: "create",
        message: "Room dibuat.",
        render: false,
        actor: playerData(room.players[0]),
        next: null
      }
    } else {
      if (!room) {
        return json({
          ok: false,
          message: "Belum ada room. Gunakan #ludo create."
        }, 404)
      }

      if (action === "reset") {
        result = resetRoom(room, base.sender)
      } else if (action === "join") {
        result = joinRoom(room, base.sender, base.name)
      } else if (action === "start") {
        result = String(room.host) !== String(base.sender)
          ? fail("Hanya host yang bisa memulai game.")
          : startRoom(room)
      } else if (action === "roll") {
        result = rollRoom(room, base.sender)
      } else if (action === "move") {
        result = moveRoom(room, base.sender, payload.token)
      } else if (action === "leave" || action === "surrender") {
        result = leaveRoom(room, base.sender)
      } else if (action === "board") {
        result = {
          ok: true,
          event: "board",
          message: "Board diperbarui.",
          render: true,
          next: turnInfo(room)
        }
      } else if (action === "status") {
        result = {
          ok: true,
          event: "status",
          message: "Status game.",
          render: false,
          next: turnInfo(room)
        }
      } else {
        result = fail("Action tidak dikenal.")
      }
    }

    if (!result.ok) {
      return json(result, result.status || 400)
    }

    if (result.deleteRoom) {
      await redis("DEL", [keyFor(base.room)])
    } else {
      await saveRoom(room)
    }

    return json({
      ok: true,
      ...result,
      room: result.deleteRoom ? null : publicRoom(room)
    })
  } catch (error) {
    return json({
      ok: false,
      message: error.message || "Ludo API error"
    }, 500)
  }
}
