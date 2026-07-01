export const LUDO_COLORS = [
  { id: "red", name: "Red", hex: "#df3f3f", light: "#ffd9d9", start: 0 },
  { id: "green", name: "Green", hex: "#22a568", light: "#d9f6e8", start: 39 },
  { id: "yellow", name: "Yellow", hex: "#e7b622", light: "#fff2bc", start: 26 },
  { id: "blue", name: "Blue", hex: "#3d7be0", light: "#dceaff", start: 13 }
]

export const SAFE_TRACK_INDEXES = new Set([0, 8, 13, 21, 26, 34, 39, 47])

export const TRACK = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6],
  [0, 6], [0, 7], [0, 8], [1, 8], [2, 8],
  [3, 8], [4, 8], [5, 8], [6, 9], [6, 10],
  [6, 11], [6, 12], [6, 13], [6, 14], [7, 14],
  [8, 14], [8, 13], [8, 12], [8, 11], [8, 10],
  [8, 9], [9, 8], [10, 8], [11, 8], [12, 8],
  [13, 8], [14, 8], [14, 7], [14, 6], [13, 6],
  [12, 6], [11, 6], [10, 6], [9, 6], [8, 5],
  [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  [7, 0], [6, 0]
]

export const HOME_LANES = {
  red: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
  green: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
  blue: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]]
}

export const HOME_SLOTS = {
  red: [[2, 2], [4, 2], [2, 4], [4, 4]],
  green: [[10, 2], [12, 2], [10, 4], [12, 4]],
  yellow: [[10, 10], [12, 10], [10, 12], [12, 12]],
  blue: [[2, 10], [4, 10], [2, 12], [4, 12]]
}

export function nowSeconds() {
  return Math.floor(Date.now() / 1000)
}

export function clean(value, max = 80) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)
}

export function colorMeta(colorId) {
  return LUDO_COLORS.find((item) => item.id === colorId) || LUDO_COLORS[0]
}

export function createPlayer(jid, name, color) {
  return {
    jid: String(jid),
    name: clean(name, 22) || "Player",
    color: colorMeta(color).id,
    tokens: [-1, -1, -1, -1],
    activeToken: 0,
    joinedAt: nowSeconds(),
    sixStreak: 0,
    surrendered: false
  }
}

export function createRoom(chatId, hostJid, hostName) {
  const createdAt = nowSeconds()

  return {
    version: 5,
    chatId: String(chatId),
    boardVersion: 1,
    status: "waiting",
    createdAt,
    updatedAt: createdAt,
    host: String(hostJid),
    players: [createPlayer(hostJid, hostName, "red")],
    turn: 0,
    pendingRoll: null,
    lastRoll: null,
    winner: null,
    logs: [
      {
        at: createdAt,
        text: (clean(hostName, 22) || "Player") + " membuat room Ludo."
      }
    ]
  }
}

function normalizeToken(value) {
  const number = Number(value)

  if (!Number.isFinite(number)) {
    return -1
  }

  return Math.max(-1, Math.min(57, Math.floor(number)))
}

function normalizePlayer(player, index) {
  const tokens = Array.isArray(player?.tokens)
    ? player.tokens.slice(0, 4).map(normalizeToken)
    : [-1, -1, -1, -1]

  while (tokens.length < 4) {
    tokens.push(-1)
  }

  const output = {
    jid: String(player?.jid || ""),
    name: clean(player?.name, 22) || "Player",
    color: colorMeta(player?.color || LUDO_COLORS[index]?.id || "red").id,
    tokens,
    activeToken: Number.isInteger(Number(player?.activeToken))
      ? Number(player.activeToken)
      : 0,
    joinedAt: Number(player?.joinedAt) || nowSeconds(),
    sixStreak: Math.max(0, Math.min(3, Number(player?.sixStreak) || 0)),
    surrendered: Boolean(player?.surrendered)
  }

  autoFocus(output)
  return output
}

function normalizePendingRoll(pendingRoll, players) {
  if (!pendingRoll || typeof pendingRoll !== "object") {
    return null
  }

  const sender = String(pendingRoll.sender || "")
  const dice = Number(pendingRoll.dice)
  const exists = players.some((player) => player.jid === sender)
  const legal = Array.isArray(pendingRoll.legal)
    ? pendingRoll.legal
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value >= 0 && value <= 3)
    : []

  if (!exists || !Number.isInteger(dice) || dice < 1 || dice > 6) {
    return null
  }

  return {
    sender,
    dice,
    legal: [...new Set(legal)]
  }
}

export function normalizeRoom(room) {
  if (!room || typeof room !== "object") {
    return null
  }

  room.version = 5
  room.chatId = String(room.chatId || "")
  room.boardVersion = Math.max(1, Math.floor(Number(room.boardVersion) || 1))
  room.status = ["waiting", "playing", "ended"].includes(room.status)
    ? room.status
    : "waiting"
  room.host = String(room.host || "")
  room.players = Array.isArray(room.players)
    ? room.players.slice(0, 4).map(normalizePlayer)
    : []

  if (!room.host && room.players[0]) {
    room.host = room.players[0].jid
  }

  room.turn = Math.max(
    0,
    Math.min(
      Math.max(0, room.players.length - 1),
      Number(room.turn) || 0
    )
  )

  room.pendingRoll = normalizePendingRoll(room.pendingRoll, room.players)
  room.lastRoll = Number.isInteger(room.lastRoll) && room.lastRoll >= 1 && room.lastRoll <= 6
    ? room.lastRoll
    : null

  room.winner = room.winner?.jid
    ? {
        jid: String(room.winner.jid),
        name: clean(room.winner.name, 22) || "Player",
        color: colorMeta(room.winner.color).id
      }
    : null

  room.logs = Array.isArray(room.logs)
    ? room.logs
        .slice(-12)
        .map((entry) => ({
          at: Number(entry?.at) || nowSeconds(),
          text: clean(entry?.text, 180)
        }))
        .filter((entry) => entry.text)
    : []

  room.updatedAt = Number(room.updatedAt) || nowSeconds()

  return room
}

export function activePlayers(room) {
  return (room?.players || []).filter((player) => !player.surrendered)
}

export function currentPlayer(room) {
  return room?.players?.[Number(room?.turn) || 0] || null
}

export function playerIndex(room, jid) {
  return (room?.players || []).findIndex((player) => {
    return String(player.jid) === String(jid)
  })
}

export function autoFocus(player) {
  if (!player || !Array.isArray(player.tokens)) {
    return 0
  }

  const activeToken = Number(player.activeToken)

  if (
    Number.isInteger(activeToken) &&
    activeToken >= 0 &&
    activeToken <= 3 &&
    Number(player.tokens[activeToken]) !== 57
  ) {
    return activeToken
  }

  const next = player.tokens.findIndex((token) => Number(token) !== 57)
  player.activeToken = next >= 0 ? next : 0

  return player.activeToken
}

export function nextActiveTurn(room) {
  const total = room?.players?.length || 0

  if (!total) {
    return 0
  }

  for (let offset = 1; offset <= total; offset++) {
    const index = (Number(room.turn) + offset) % total

    if (!room.players[index].surrendered) {
      room.turn = index
      return index
    }
  }

  return room.turn
}

export function relativeToAbsolute(player, position) {
  const value = Number(position)

  if (!player || value < 0 || value > 51) {
    return null
  }

  return (colorMeta(player.color).start + value) % 52
}

export function canMoveToken(token, dice) {
  const position = Number(token)
  const roll = Number(dice)

  if (!Number.isInteger(roll) || roll < 1 || roll > 6) {
    return false
  }

  if (position === 57) {
    return false
  }

  if (position === -1) {
    return roll === 6
  }

  return position + roll <= 57
}

export function legalMoves(player, dice) {
  if (!player || !Array.isArray(player.tokens)) {
    return []
  }

  const roll = Number(dice)
  const focused = autoFocus(player)

  if (roll === 6) {
    return player.tokens
      .map((token, index) => ({ token, index }))
      .filter((item) => canMoveToken(item.token, roll))
      .map((item) => item.index)
  }

  return canMoveToken(player.tokens[focused], roll)
    ? [focused]
    : []
}

export function hasWon(player) {
  return Boolean(
    player?.tokens?.every((position) => Number(position) === 57)
  )
}

export function log(room, text) {
  if (!room) {
    return
  }

  if (!Array.isArray(room.logs)) {
    room.logs = []
  }

  room.logs.push({
    at: nowSeconds(),
    text: clean(text, 180)
  })

  room.logs = room.logs.slice(-12)
}

export function moveToken(room, player, tokenIndex, dice) {
  const index = Number(tokenIndex)
  const roll = Number(dice)

  if (
    !room ||
    !player ||
    !Number.isInteger(index) ||
    index < 0 ||
    index > 3 ||
    !canMoveToken(player.tokens?.[index], roll)
  ) {
    return {
      before: -1,
      after: -1,
      captured: []
    }
  }

  const before = Number(player.tokens[index])

  if (before === -1) {
    player.tokens[index] = 0
  } else {
    player.tokens[index] = Math.min(57, before + roll)
  }

  const after = Number(player.tokens[index])
  player.activeToken = index

  if (after === 57) {
    autoFocus(player)
  }

  const captured = []

  if (after >= 0 && after <= 51) {
    const absolute = relativeToAbsolute(player, after)

    if (absolute !== null && !SAFE_TRACK_INDEXES.has(absolute)) {
      for (const opponent of room.players || []) {
        if (
          opponent.jid === player.jid ||
          opponent.surrendered ||
          !Array.isArray(opponent.tokens)
        ) {
          continue
        }

        opponent.tokens.forEach((position, opponentToken) => {
          const enemyPosition = Number(position)

          if (enemyPosition < 0 || enemyPosition > 51) {
            return
          }

          if (relativeToAbsolute(opponent, enemyPosition) !== absolute) {
            return
          }

          opponent.tokens[opponentToken] = -1

          // Fokus lawan tidak dipindahkan ke pion yang tertangkap.
          // Contoh: jika Pion 2 sedang aktif lalu Pion 1 dimakan,
          // fokus tetap berada pada Pion 2.
          const active = Number(opponent.activeToken)

          if (
            !Number.isInteger(active) ||
            active < 0 ||
            active > 3 ||
            Number(opponent.tokens[active]) === 57
          ) {
            autoFocus(opponent)
          }

          captured.push({
            player: {
              jid: opponent.jid,
              name: opponent.name,
              color: opponent.color
            },
            token: opponentToken,
            returnedTo: "Home",
            activeToken: Number(opponent.activeToken)
          })
        })
      }
    }
  }

  return {
    before,
    after,
    captured
  }
}

export function publicRoom(room) {
  return {
    version: room.version,
    chatId: room.chatId,
    boardVersion: room.boardVersion,
    status: room.status,
    host: room.host,
    players: (room.players || []).map((player) => ({
      jid: player.jid,
      name: player.name,
      color: player.color,
      tokens: player.tokens,
      activeToken: player.activeToken,
      surrendered: player.surrendered
    })),
    turn: room.turn,
    pendingRoll: room.pendingRoll,
    lastRoll: room.lastRoll,
    winner: room.winner,
    logs: room.logs,
    updatedAt: room.updatedAt
  }
}
