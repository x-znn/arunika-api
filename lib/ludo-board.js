import fs from "node:fs"
import path from "node:path"
import { Resvg } from "@resvg/resvg-js"
import { LUDO_COLORS, TRACK, HOME_LANES, HOME_SLOTS, SAFE_TRACK_INDEXES, colorMeta, relativeToAbsolute } from "./ludo-core"

const W = 1080
const H = 1220
const BOARD_X = 75
const BOARD_Y = 230
const CELL = 62
const BOARD = CELL * 15

const GEIST_REGULAR = path.join(process.cwd(), "node_modules", "next", "dist", "compiled", "@vercel", "og", "Geist-Regular.ttf")

function esc(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function cellRect(x, y, fill, stroke = "#d4d0c8", width = 1) {
  return `<rect x="${BOARD_X + x * CELL}" y="${BOARD_Y + y * CELL}" width="${CELL}" height="${CELL}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`
}

function centerOf(coord) {
  return {
    x: BOARD_X + coord[0] * CELL + CELL / 2,
    y: BOARD_Y + coord[1] * CELL + CELL / 2
  }
}

function trackCoord(player, position, tokenIndex) {
  const meta = colorMeta(player.color)
  if (position === -1) return HOME_SLOTS[player.color][tokenIndex]
  if (position >= 0 && position <= 51) return TRACK[(meta.start + position) % 52]
  if (position >= 52 && position <= 56) return HOME_LANES[player.color][position - 52]
  return [7, 7]
}

function tokenOffset(key, index) {
  const offsets = [[0, 0], [-10, -10], [10, -10], [-10, 10], [10, 10], [-15, 0], [15, 0]]
  return offsets[index % offsets.length]
}

function coordinateKey(coord) {
  return `${coord[0]}:${coord[1]}`
}

function homeStyle(color) {
  return color.light
}

function star(cx, cy, r, fill) {
  const points = []
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5
    const radius = i % 2 === 0 ? r : r * 0.45
    points.push(`${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`)
  }
  return `<polygon points="${points.join(" ")}" fill="${fill}"/>`
}

export function renderLudoBoard(room) {
  const fontFiles = fs.existsSync(GEIST_REGULAR) ? [GEIST_REGULAR] : []
  const current = room.players[room.turn]
  const currentMeta = colorMeta(current?.color)
  const pieces = []
  const groups = new Map()

  for (const player of room.players) {
    if (player.surrendered) continue
    player.tokens.forEach((position, tokenIndex) => {
      if (position === 57) {
        const key = `finish:${player.color}`
        const item = { player, position, tokenIndex, coord: [7, 7], key }
        const list = groups.get(key) || []
        list.push(item)
        groups.set(key, list)
      } else {
        const coord = trackCoord(player, position, tokenIndex)
        const key = coordinateKey(coord)
        const item = { player, position, tokenIndex, coord, key }
        const list = groups.get(key) || []
        list.push(item)
        groups.set(key, list)
      }
    })
  }

  for (const list of groups.values()) {
    list.forEach((item, index) => pieces.push({ ...item, offset: tokenOffset(item.key, index) }))
  }

  const homes = LUDO_COLORS.map((meta) => {
    const region = meta.id === "red" ? [0, 0] : meta.id === "green" ? [9, 0] : meta.id === "yellow" ? [9, 9] : [0, 9]
    const x = BOARD_X + region[0] * CELL
    const y = BOARD_Y + region[1] * CELL
    return `
      <rect x="${x}" y="${y}" width="${CELL * 6}" height="${CELL * 6}" fill="${homeStyle(meta)}"/>
      <rect x="${x + CELL * 1.1}" y="${y + CELL * 1.1}" width="${CELL * 3.8}" height="${CELL * 3.8}" rx="24" fill="#fffdf8" stroke="${meta.hex}" stroke-width="5"/>
    `
  }).join("")

  const grid = []
  for (let y = 0; y < 15; y++) {
    for (let x = 0; x < 15; x++) grid.push(cellRect(x, y, "transparent", "#d8d3ca", 1))
  }

  const track = TRACK.map((coord, index) => {
    const starters = LUDO_COLORS.find((meta) => meta.start === index)
    return cellRect(coord[0], coord[1], starters ? starters.light : "#fffdf8", starters ? starters.hex : "#d5d0c8", starters ? 3 : 1)
  }).join("")

  const lanes = LUDO_COLORS.map((meta) => HOME_LANES[meta.id].map((coord) => cellRect(coord[0], coord[1], meta.light, meta.hex, 2)).join("")).join("")

  const safeStars = [...SAFE_TRACK_INDEXES].map((index) => {
    const center = centerOf(TRACK[index])
    return star(center.x, center.y, 12, "#7d7569")
  }).join("")

  const centerX = BOARD_X + 7 * CELL
  const centerY = BOARD_Y + 7 * CELL
  const center = `
    <polygon points="${centerX},${centerY} ${centerX},${centerY - CELL} ${centerX - CELL},${centerY}" fill="#df3f3f"/>
    <polygon points="${centerX},${centerY} ${centerX + CELL},${centerY} ${centerX},${centerY - CELL}" fill="#22a568"/>
    <polygon points="${centerX},${centerY} ${centerX + CELL},${centerY} ${centerX},${centerY + CELL}" fill="#e7b622"/>
    <polygon points="${centerX},${centerY} ${centerX},${centerY + CELL} ${centerX - CELL},${centerY}" fill="#3d7be0"/>
    <circle cx="${centerX}" cy="${centerY}" r="18" fill="#fffdf8" stroke="#26231e" stroke-width="3"/>
  `

  const tokens = pieces.map((item) => {
    const meta = colorMeta(item.player.color)
    const base = centerOf(item.coord)
    const cx = base.x + item.offset[0]
    const cy = base.y + item.offset[1]
    const isCurrent = current?.jid === item.player.jid
    const ring = isCurrent ? `<circle cx="${cx}" cy="${cy}" r="25" fill="none" stroke="#1a1815" stroke-width="4" opacity="0.85"/>` : ""
    return `
      ${ring}
      <circle cx="${cx}" cy="${cy}" r="20" fill="${meta.hex}" stroke="#fffdf8" stroke-width="4"/>
      <circle cx="${cx - 6}" cy="${cy - 7}" r="5" fill="#ffffff" opacity="0.45"/>
      <text x="${cx}" y="${cy + 6}" text-anchor="middle" font-family="Geist" font-size="16" font-weight="800" fill="#ffffff">${item.tokenIndex + 1}</text>
    `
  }).join("")

  const playerRows = room.players.map((player, index) => {
    const meta = colorMeta(player.color)
    const y = 93 + index * 30
    const status = player.surrendered ? "KELUAR" : room.status === "playing" && index === room.turn ? "GILIRAN" : "SIAP"
    const done = player.tokens.filter((position) => position === 57).length
    return `
      <circle cx="76" cy="${y - 6}" r="8" fill="${meta.hex}"/>
      <text x="94" y="${y}" font-family="Geist" font-size="20" font-weight="700" fill="#24211c">${esc(player.name.slice(0, 18))}</text>
      <text x="360" y="${y}" font-family="Geist" font-size="15" font-weight="700" fill="#6d665d">${meta.name.toUpperCase()} • ${done}/4 • ${status}</text>
    `
  }).join("")

  const pending = room.pendingRoll ? `PILIH BIDAK ${room.pendingRoll.legal?.map((n) => n + 1).join(", ") || "-"}` : room.status === "playing" ? "KETIK #ludo roll" : "MENUNGGU MULAI"
  const dice = room.lastRoll || "-"
  const lastLog = room.logs?.[room.logs.length - 1]?.text || "Room Ludo siap."

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="#f4efe6"/>
    <rect x="38" y="35" width="${W - 76}" height="${H - 70}" rx="30" fill="#fffdf8" stroke="#26231e" stroke-width="3"/>

    <text x="76" y="76" font-family="Geist" font-size="34" font-weight="800" letter-spacing="1" fill="#171512">LUDO ARENA</text>
    <text x="76" y="205" font-family="Geist" font-size="15" font-weight="700" fill="#746d64">${esc(lastLog.slice(0, 95))}</text>

    <rect x="778" y="58" width="224" height="105" rx="18" fill="${currentMeta.light}" stroke="${currentMeta.hex}" stroke-width="4"/>
    <text x="890" y="91" text-anchor="middle" font-family="Geist" font-size="14" font-weight="800" fill="#5b5349">DADU</text>
    <text x="890" y="140" text-anchor="middle" font-family="Geist" font-size="56" font-weight="900" fill="${currentMeta.hex}">${dice}</text>

    ${playerRows}

    <rect x="75" y="1065" width="930" height="90" rx="18" fill="#25211d"/>
    <text x="110" y="1100" font-family="Geist" font-size="17" font-weight="800" fill="#f4efe6">${esc(pending)}</text>
    <text x="110" y="1131" font-family="Geist" font-size="15" font-weight="600" fill="#c9c1b6">${room.status === "playing" ? `Giliran ${esc(current?.name || "-")} • ${esc(colorMeta(current?.color).name)}` : room.status === "ended" ? `Pemenang: ${esc(room.winner?.name || "-")}` : "Gunakan #ludo join lalu #ludo start"}</text>

    <rect x="${BOARD_X}" y="${BOARD_Y}" width="${BOARD}" height="${BOARD}" fill="#fffdf8" stroke="#26231e" stroke-width="4"/>
    ${homes}
    ${grid.join("")}
    ${track}
    ${lanes}
    ${safeStars}
    ${center}
    ${tokens}
  </svg>
  `

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: W },
    font: {
      fontFiles,
      loadSystemFonts: false,
      defaultFontFamily: "Geist",
      sansSerifFamily: "Geist"
    }
  })

  return resvg.render().asPng()
}
