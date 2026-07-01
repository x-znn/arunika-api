import fs from "node:fs"
import path from "node:path"
import { Resvg } from "@resvg/resvg-js"
import { MONOPOLY_BOARD, MONOPOLY_COLORS, colorMeta, currentPlayer, propertyState, tileAt } from "./monopoly-core"

const SIZE = 1254
let cachedBoardUri = null

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function wrapText(value, maxChars, limit = 5) {
  const words = String(value || "").split(/\s+/).filter(Boolean)
  const lines = []
  let line = ""
  words.forEach((word) => {
    if (!line) line = word
    else if ((line + " " + word).length <= maxChars) line += " " + word
    else {
      lines.push(line)
      line = word
    }
  })
  if (line) lines.push(line)
  return lines.slice(0, limit)
}

function boardDataUri() {
  if (cachedBoardUri) return cachedBoardUri
  const file = path.join(process.cwd(), "public", "monopoly", "board-indonesia.png")
  const bytes = fs.readFileSync(file)
  cachedBoardUri = "data:image/png;base64," + bytes.toString("base64")
  return cachedBoardUri
}

function centerFor(index) {
  const i = Number(index) || 0
  const start = 92
  const end = 1162
  const step = (end - start) / 10
  if (i >= 0 && i <= 10) return { x: start + i * step, y: 1162 }
  if (i >= 11 && i <= 20) return { x: 1162, y: 1162 - (i - 10) * step }
  if (i >= 21 && i <= 30) return { x: 1162 - (i - 20) * step, y: 92 }
  return { x: 92, y: 92 + (i - 30) * step }
}

function tokenOffsets(count) {
  const presets = {
    1: [[0, 0]],
    2: [[-15, -15], [15, 15]],
    3: [[-17, -16], [17, -16], [0, 18]],
    4: [[-17, -17], [17, -17], [-17, 17], [17, 17]]
  }
  return presets[Math.min(4, Math.max(1, count))]
}

function assetBadges(room) {
  const output = []
  Object.entries(room?.properties || {}).forEach(([key, state]) => {
    const index = Number(key)
    const tile = MONOPOLY_BOARD[index]
    if (!tile || !state?.owner || !["property", "station", "utility"].includes(tile.type)) return
    const player = (room.players || []).find((item) => String(item.jid) === String(state.owner))
    if (!player) return
    const point = centerFor(index)
    const color = colorMeta(player.color).hex
    const buildings = state.hotel ? 5 : Number(state.houses || 0)
    output.push(`<circle cx="${point.x + 29}" cy="${point.y - 27}" r="10" fill="${color}" stroke="#fff" stroke-width="3"/>`)
    if (buildings) {
      output.push(`<text x="${point.x + 29}" y="${point.y - 23}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="12" fill="#fff">${buildings === 5 ? "H" : buildings}</text>`)
    }
  })
  return output.join("")
}

export function renderMonopolyBoard(room) {
  const groups = new Map()
  ;(room?.players || []).forEach((player) => {
    if (player.surrendered || player.bankrupt) return
    const index = Number(player.position) || 0
    const list = groups.get(index) || []
    list.push(player)
    groups.set(index, list)
  })

  const current = currentPlayer(room)
  const currentPoint = current ? centerFor(current.position) : null
  const tokens = []
  groups.forEach((players, index) => {
    const point = centerFor(index)
    const offsets = tokenOffsets(players.length)
    players.forEach((player, playerIndex) => {
      const offset = offsets[playerIndex] || [0, 0]
      const meta = colorMeta(player.color)
      const active = current && String(current.jid) === String(player.jid)
      tokens.push(`
        <g>
          ${active ? `<circle cx="${point.x + offset[0]}" cy="${point.y + offset[1]}" r="31" fill="none" stroke="#fff" stroke-width="7" opacity=".96"/>` : ""}
          <circle cx="${point.x + offset[0]}" cy="${point.y + offset[1]}" r="23" fill="${meta.hex}" stroke="#1d1d1d" stroke-width="5"/>
          <circle cx="${point.x + offset[0] - 7}" cy="${point.y + offset[1] - 8}" r="7" fill="#fff" opacity=".35"/>
          <text x="${point.x + offset[0]}" y="${point.y + offset[1] + 6}" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" font-weight="700" fill="#fff">${escapeXml(String(player.name || "?").slice(0, 1).toUpperCase())}</text>
        </g>
      `)
    })
  })

  const currentLabel = current
    ? `${escapeXml(String(current.name || "Pemain").slice(0, 20))} • ${escapeXml(colorMeta(current.color).name)} • M${Number(current.money || 0)}`
    : "Menunggu pemain"
  const tileLabel = current ? escapeXml(tileAt(current.position).name) : "MULAI"

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
    <image href="${boardDataUri()}" x="0" y="0" width="${SIZE}" height="${SIZE}" preserveAspectRatio="none"/>
    ${currentPoint ? `<circle cx="${currentPoint.x}" cy="${currentPoint.y}" r="44" fill="none" stroke="#ffffff" stroke-width="5" stroke-dasharray="8 8" opacity=".9"/>` : ""}
    ${assetBadges(room)}
    ${tokens.join("")}
    <g>
      <rect x="352" y="926" width="550" height="64" rx="28" fill="#102338" opacity=".93"/>
      <text x="627" y="953" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#fff">GILIRAN: ${currentLabel}</text>
      <text x="627" y="978" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#d6e5f3">POSISI: ${tileLabel}</text>
    </g>
  </svg>`
  return new Resvg(svg, { fitTo: { mode: "width", value: SIZE } }).render().asPng()
}

export function renderCardPng(card) {
  const isChance = String(card?.type || "") === "chance"
  const primary = isChance ? "#ed7d26" : "#1976d2"
  const dark = isChance ? "#8e3100" : "#073d83"
  const light = isChance ? "#fff1df" : "#e5f2ff"
  const label = isChance ? "KESEMPATAN" : "DANA UMUM"
  const titleLines = wrapText(card?.title || "Kartu", 19, 3)
  const bodyLines = wrapText(card?.text || "", 36, 5)
  const titleSvg = titleLines.map((line, index) => `<text x="540" y="${480 + index * 70}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="800" fill="#fff">${escapeXml(line)}</text>`).join("")
  const bodySvg = bodyLines.map((line, index) => `<text x="540" y="${760 + index * 48}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="500" fill="#17324a">${escapeXml(line)}</text>`).join("")
  const icon = isChance
    ? `<path d="M540 206c-56 0-99 29-99 80 0 45 29 61 61 76 16 8 22 15 22 30v15h33v-18c0-33-16-48-43-61-24-12-39-24-39-48 0-27 25-42 63-42 28 0 54 11 76 28l21-45c-28-23-61-35-95-35zm-18 231v43h39v-43z" fill="#fff"/>`
    : `<g fill="#fff"><rect x="432" y="236" width="216" height="145" rx="18"/><path d="M432 272l108 80 108-80" fill="none" stroke="${primary}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/></g>`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${primary}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
      <filter id="s"><feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#000" flood-opacity=".28"/></filter>
    </defs>
    <rect width="1080" height="1350" fill="#0c1722"/>
    <g opacity=".22" fill="none" stroke="#fff" stroke-width="4"><circle cx="100" cy="96" r="140"/><circle cx="980" cy="1260" r="180"/><path d="M0 1100C250 920 390 1330 650 1100S930 930 1080 1050"/></g>
    <rect x="82" y="72" width="916" height="1206" rx="56" fill="${light}" filter="url(#s)"/>
    <path d="M82 238Q82 72 248 72h584q166 0 166 166v364H82z" fill="url(#g)"/>
    <text x="540" y="150" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="31" font-weight="700" letter-spacing="7" fill="#fff">MONOPOLI INDONESIA</text>
    ${icon}
    <text x="540" y="430" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="800" letter-spacing="6" fill="#fff">KARTU ${label}</text>
    ${titleSvg}
    <rect x="180" y="650" width="720" height="2" fill="${primary}" opacity=".35"/>
    ${bodySvg}
    <rect x="174" y="1035" width="732" height="128" rx="28" fill="#fff" stroke="${primary}" stroke-width="4"/>
    <text x="540" y="1088" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="700" fill="${dark}">IKUTI EFEK KARTU INI</text>
    <text x="540" y="1128" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="21" fill="#38556f">Kartu ditarik secara acak dari deck permainan</text>
    <text x="540" y="1228" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#6c7b88">${escapeXml(String(card?.id || "").toUpperCase())}</text>
  </svg>`
  return new Resvg(svg, { fitTo: { mode: "width", value: 1080 } }).render().asPng()
}
