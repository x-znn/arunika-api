export function normalizeRoom(room) {
  if (!room || typeof room !== "object") return null

  room.version = 1
  room.status = ["waiting", "playing", "ended"].includes(room.status)
    ? room.status
    : "waiting"

  room.players = Array.isArray(room.players)
    ? room.players.slice(0, 4)
    : []

  room.players = room.players.map((player, index) => {
    const tokens = Array.isArray(player?.tokens)
      ? player.tokens.slice(0, 4).map((n) => {
          const value = Number(n)

          return Math.max(
            -1,
            Math.min(
              57,
              Number.isFinite(value) ? value : -1
            )
          )
        })
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

  room.turn = Math.max(
    0,
    Math.min(
      Math.max(0, room.players.length - 1),
      Number(room.turn) || 0
    )
  )

  room.pendingRoll =
    room.pendingRoll && typeof room.pendingRoll === "object"
      ? room.pendingRoll
      : null

  room.lastRoll = Number.isInteger(room.lastRoll)
    ? room.lastRoll
    : null

  room.logs = Array.isArray(room.logs)
    ? room.logs.slice(-12)
    : []

  room.updatedAt = Number(room.updatedAt) || nowSeconds()

  return room
}
