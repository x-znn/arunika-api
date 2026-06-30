export const LUDO_COLORS = [
  { id: "red", name: "Merah", hex: "#df3f3f", light: "#ffd9d9", start: 0 },
  { id: "green", name: "Hijau", hex: "#22a568", light: "#d9f6e8", start: 13 },
  { id: "yellow", name: "Kuning", hex: "#e7b622", light: "#fff2bc", start: 26 },
  { id: "blue", name: "Biru", hex: "#3d7be0", light: "#dceaff", start: 39 }
]

export const SAFE_TRACK_INDEXES = new Set([
  0,
  8,
  13,
  21,
  26,
  34,
  39,
  47
])

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
  red: [
    [7, 1],
    [7, 2],
    [7, 3],
    [7, 4],
    [7, 5]
  ],
  green: [
    [1, 7],
    [2, 7],
    [3, 7],
    [4, 7],
    [5, 7]
  ],
  yellow: [
    [7, 13],
    [7, 12],
    [7, 11],
    [7, 10],
    [7, 9]
  ],
  blue: [
    [13, 7],
    [12, 7],
    [11, 7],
    [10, 7],
    [9, 7]
  ]
}

export const HOME_SLOTS = {
  red: [
    [2, 2],
    [4, 2],
    [2, 4],
    [4, 4]
  ],
  green: [
    [10, 2],
    [12, 2],
    [10, 4],
    [12, 4]
  ],
  yellow: [
    [10, 10],
    [12, 10],
    [10, 12],
    [12, 12]
  ],
  blue: [
    [2, 10],
    [4, 10],
    [2, 12],
    [4, 12]
  ]
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
  return (
    LUDO_COLORS.find((item) => item.id === colorId) ||
    LUDO_COLORS[0]
  )
}

export function jidLabel(jid) {
  return "@" + String(jid || "").split("@")[0]
}

export function createRoom(chatId, hostJid, hostName) {
  const current = nowSeconds()

  return {
    version: 1,
    chatId: String(chatId),
    status: "waiting",
    createdAt: current,
    updatedAt: current,
    host: String(hostJid),
    players: [
      {
        jid: String(hostJid),
        name: clean(hostName, 22) || "Player",
        color: "red",
        tokens: [-1, -1, -1, -1],
        joinedAt: current,
        sixStreak: 0,
        surrendered: false
      }
    ],
    turn: 0,
    pendingRoll: null,
    lastRoll: null,
    winner: null,
    logs: [
      {
        at: current,
        text: (clean(hostName, 22) || "Player") + " membuat room Ludo."
      }
    ]
  }
}

function normalizeToken(value) {
  const token = Number(value)

  if (!Number.isFinite(token)) {
    return -1
  }

  return Math.max(-1, Math.min(57, Math.floor(token)))
}

function normalizePendingRoll(pending, players) {
  if (!pending || typeof pending !== "object") {
    return null
  }

  const sender = String(pending.sender || "")
  const dice = Number(pending.dice)

  if (!sender || !Number.isInteger(dice) || dice < 1 || dice > 6) {
    return null
  }

  const playerExists = players.some((player) => player.jid === sender)

  if (!playerExists) {
    return null
  }

  const legal = Array.isArray(pending.legal)
    ? pending.legal
        .map((value) => Number(value))
        .filter((value) => {
          return Number.isInteger(value) && value >= 0 && value <= 3
        })
    : []

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

  room.version = 1
  room.chatId = String(room.chatId || "")

  room.status = ["waiting", "playing", "ended"].includes(room.status)
    ? room.status
    : "waiting"

  room.host = String(room.host || "")

  room.players = Array.isArray(room.players)
    ? room.players.slice(0, 4)
    : []

  room.players = room.players.map((player, index) => {
    const tokens = Array.isArray(player?.tokens)
      ? player.tokens
          .slice(0, 4)
          .map((value) => normalizeToken(value))
      : [-1, -1, -1, -1]

    while (tokens.length < 4) {
      tokens.push(-1)
    }

    return {
      jid: String(player?.jid || ""),
      name: clean(player?.name, 22) || "Player",
      color: colorMeta(
        player?.color || LUDO_COLORS[index]?.id || "red"
      ).id,
      tokens,
      joinedAt: Number(player?.joinedAt) || nowSeconds(),
      sixStreak: Math.max(
        0,
        Math.min(3, Number(player?.sixStreak) || 0)
      ),
      surrendered: Boolean(player?.surrendered)
    }
  })

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

  room.pendingRoll = normalizePendingRoll(
    room.pendingRoll,
    room.players
  )

  room.lastRoll = Number.isInteger(room.lastRoll)
    ? Math.max(1, Math.min(6, room.lastRoll))
    : null

  room.winner =
    room.winner &&
    typeof room.winner === "object" &&
    room.winner.jid
      ? {
          jid: String(room.winner.jid),
          name: clean(room.winner.name, 22) || "Player",
          color: colorMeta(room.winner.color).id
        }
      : null

  room.logs = Array.isArray(room.logs)
    ? room.logs
        .slice(-12)
        .map((item) => ({
          at: Number(item?.at) || nowSeconds(),
          text: clean(item?.text, 180)
        }))
        .filter((item) => item.text)
    : []

  room.updatedAt = Number(room.updatedAt) || nowSeconds()

  return room
}

export function activePlayers(room) {
  if (!room || !Array.isArray(room.players)) {
    return []
  }

  return room.players.filter((player) => !player.surrendered)
}

export function currentPlayer(room) {
  if (!room || !Array.isArray(room.players)) {
    return null
  }

  return room.players[Number(room.turn) || 0] || null
}

export function playerIndex(room, jid) {
  if (!room || !Array.isArray(room.players)) {
    return -1
  }

  return room.players.findIndex((player) => {
    return String(player.jid) === String(jid)
  })
}

export function nextActiveTurn(room) {
  const total = room?.players?.length || 0

  if (!total) {
    return 0
  }

  for (let offset = 1; offset <= total; offset++) {
    const index = (room.turn + offset) % total

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

export function legalMoves(room, player, dice) {
  const moves = []
  const roll = Number(dice)

  if (!player || !Array.isArray(player.tokens)) {
    return moves
  }

  player.tokens.forEach((position, tokenIndex) => {
    const token = Number(position)

    if (token === 57) {
      return
    }

    if (token === -1) {
      if (roll === 6) {
        moves.push(tokenIndex)
      }

      return
    }

    if (token + roll <= 57) {
      moves.push(tokenIndex)
    }
  })

  return moves
}

export function hasWon(player) {
  return Boolean(
    player &&
      Array.isArray(player.tokens) &&
      player.tokens.every((position) => Number(position) === 57)
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

export function turnName(room) {
  const player = currentPlayer(room)

  return player ? player.name : "-"
}

export function roomSummary(room) {
  const players = (room.players || []).map((player, index) => {
    const meta = colorMeta(player.color)

    const status = player.surrendered
      ? "Keluar"
      : index === room.turn && room.status === "playing"
        ? "Giliran"
        : "Menunggu"

    return meta.name + " • " + player.name + " • " + status
  })

  return [
    "🎲 *LUDO ARENA*",
    "",
    "Status : " +
      (
        room.status === "waiting"
          ? "Menunggu pemain"
          : room.status === "playing"
            ? "Sedang bermain"
            : "Selesai"
      ),
    "Pemain : " + activePlayers(room).length + "/" + (room.players.length || 4),
    room.status === "playing"
      ? "Giliran : " +
        turnName(room) +
        " (" +
        colorMeta(currentPlayer(room)?.color).name +
        ")"
      : "",
    room.lastRoll
      ? "Dadu terakhir : " + room.lastRoll
      : "",
    "",
    players.join("\n")
  ]
    .filter(Boolean)
    .join("\n")
}

export function moveToken(room, player, tokenIndex, dice) {
  const index = Number(tokenIndex)
  const roll = Number(dice)

  if (
    !room ||
    !player ||
    !Array.isArray(player.tokens) ||
    !Number.isInteger(index) ||
    index < 0 ||
    index > 3
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
  const captured = []

  if (after >= 0 && after <= 51) {
    const absolute = relativeToAbsolute(player, after)

    if (
      absolute !== null &&
      !SAFE_TRACK_INDEXES.has(absolute)
    ) {
      for (const opponent of room.players || []) {
        if (
          opponent.jid === player.jid ||
          opponent.surrendered ||
          !Array.isArray(opponent.tokens)
        ) {
          continue
        }

        opponent.tokens.forEach((position, opponentToken) => {
          const token = Number(position)

          if (token < 0 || token > 51) {
            return
          }

          const opponentAbsolute = relativeToAbsolute(
            opponent,
            token
          )

          if (opponentAbsolute === absolute) {
            opponent.tokens[opponentToken] = -1

            captured.push({
              player: opponent,
              token: opponentToken
            })
          }
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
    status: room.status,
    host: room.host,
    players: (room.players || []).map((player) => ({
      jid: player.jid,
      name: player.name,
      color: player.color,
      tokens: player.tokens,
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
