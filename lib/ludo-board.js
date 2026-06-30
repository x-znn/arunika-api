import fs from "node:fs"
import path from "node:path"
import { Resvg } from "@resvg/resvg-js"
import {
  LUDO_COLORS,
  TRACK,
  HOME_LANES,
  HOME_SLOTS,
  SAFE_TRACK_INDEXES,
  colorMeta
} from "./ludo-core"

const W = 1080
const H = 1410
const BOARD_X = 90
const BOARD_Y = 270
const CELL = 60
const BOARD = CELL * 15

const GEIST_REGULAR = path.join(
  process.cwd(),
  "node_modules",
  "next",
  "dist",
  "compiled",
  "@vercel",
  "og",
  "Geist-Regular.ttf"
)

function esc(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function centerOf(coord) {
  return {
    x: BOARD_X + coord[0] * CELL + CELL / 2,
    y: BOARD_Y + coord[1] * CELL + CELL / 2
  }
}

function cellRect(x, y, fill, stroke = "#d7d0c5", width = 1) {
  return `<rect x="${BOARD_X + x * CELL}" y="${BOARD_Y + y * CELL}" width="${CELL}" height="${CELL}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`
}

function star(cx, cy, radius, fill) {
  const points = []

  for (let index = 0; index < 10; index++) {
    const angle = -Math.PI / 2 + index * Math.PI / 5
    const currentRadius = index % 2 === 0 ? radius : radius * 0.45
    points.push(
      (cx + Math.cos(angle) * currentRadius) +
      "," +
      (cy + Math.sin(angle) * currentRadius)
    )
  }

  return `<polygon points="${points.join(" ")}" fill="${fill}"/>`
}

function trackCoord(player, position, tokenIndex) {
  const token = Number(position)
  const meta = colorMeta(player.color)

  if (token === -1) {
    return HOME_SLOTS[player.color][tokenIndex]
  }

  if (token >= 0 && token <= 51) {
    return TRACK[(meta.start + token) % 52]
  }

  if (token >= 52 && token <= 56) {
    return HOME_LANES[player.color][token - 52]
  }

  return [7, 7]
}

function coordinateKey(coord) {
  return coord[0] + ":" + coord[1]
}

function tokenOffset(index) {
  const positions = [
    [0, 0],
    [-12, -12],
    [12, -12],
    [-12, 12],
    [12, 12],
    [-16, 0],
    [16, 0]
  ]

  return positions[index % positions.length]
}

function finishedCount(player) {
  return (player.tokens || []).filter((position) => Number(position) === 57).length
}

function playerStatus(room, player, index) {
  if (player.surrendered) {
    return "LEFT"
  }

  if (room.status === "ended" && room.winner?.jid === player.jid) {
    return "WINNER"
  }

  if (room.status === "playing" && index === Number(room.turn)) {
    return "TURN"
  }

  return "READY"
}

export function renderLudoBoard(room) {
  const fontFiles = fs.existsSync(GEIST_REGULAR) ? [GEIST_REGULAR] : []
  const current = room.players?.[Number(room.turn) || 0] || null
  const currentMeta = colorMeta(current?.color)
  const groupedPieces = new Map()

  for (const player of room.players || []) {
    if (player.surrendered) {
      continue
    }

    ;(player.tokens || []).forEach((position, tokenIndex) => {
      const coord = Number(position) === 57
        ? [7, 7]
        : trackCoord(player, position, tokenIndex)
      const key = Number(position) === 57
        ? "finish:" + player.color
        : coordinateKey(coord)
      const pieces = groupedPieces.get(key) || []

      pieces.push({
        player,
        position: Number(position),
        tokenIndex,
        coord
      })

      groupedPieces.set(key, pieces)
    })
  }

  const pieces = []

  for (const items of groupedPieces.values()) {
    items.forEach((item, index) => {
      pieces.push({
        ...item,
        offset: tokenOffset(index)
      })
    })
  }

  const homes = LUDO_COLORS.map((meta) => {
    const region = meta.id === "red"
      ? [0, 0]
      : meta.id === "green"
        ? [9, 0]
        : meta.id === "yellow"
          ? [9, 9]
          : [0, 9]

    const x = BOARD_X + region[0] * CELL
    const y = BOARD_Y + region[1] * CELL

    return `
      <rect x="${x}" y="${y}" width="${CELL * 6}" height="${CELL * 6}" fill="${meta.light}"/>
      <rect x="${x + CELL * 1.05}" y="${y + CELL * 1.05}" width="${CELL * 3.9}" height="${CELL * 3.9}" rx="24" fill="#fffdf8" stroke="${meta.hex}" stroke-width="5"/>
    `
  }).join("")

  const grid = []

  for (let y = 0; y < 15; y++) {
    for (let x = 0; x < 15; x++) {
      grid.push(cellRect(x, y, "transparent", "#d8d1c6", 1))
    }
  }

  const track = TRACK.map((coord, index) => {
    const starter = LUDO_COLORS.find((meta) => meta.start === index)

    return cellRect(
      coord[0],
      coord[1],
      starter ? starter.light : "#fffdf8",
      starter ? starter.hex : "#d4cdc1",
      starter ? 3 : 1
    )
  }).join("")

  const homeLanes = LUDO_COLORS.map((meta) => {
    return HOME_LANES[meta.id]
      .map((coord) => cellRect(coord[0], coord[1], meta.light, meta.hex, 2))
      .join("")
  }).join("")

  const safeTiles = [...SAFE_TRACK_INDEXES].map((index) => {
    const point = centerOf(TRACK[index])
    return star(point.x, point.y, 11, "#71695f")
  }).join("")

  const centerX = BOARD_X + 7 * CELL
  const centerY = BOARD_Y + 7 * CELL
  const center = `
    <polygon points="${centerX},${centerY} ${centerX},${centerY - CELL} ${centerX - CELL},${centerY}" fill="#df3f3f"/>
    <polygon points="${centerX},${centerY} ${centerX + CELL},${centerY} ${centerX},${centerY - CELL}" fill="#22a568"/>
    <polygon points="${centerX},${centerY} ${centerX + CELL},${centerY} ${centerX},${centerY + CELL}" fill="#e7b622"/>
    <polygon points="${centerX},${centerY} ${centerX},${centerY + CELL} ${centerX - CELL},${centerY}" fill="#3d7be0"/>
    <circle cx="${centerX}" cy="${centerY}" r="17" fill="#fffdf8" stroke="#29251f" stroke-width="3"/>
  `

  const tokens = pieces.map((item) => {
    const meta = colorMeta(item.player.color)
    const base = centerOf(item.coord)
    const cx = base.x + item.offset[0]
    const cy = base.y + item.offset[1]
    const isFocus = current?.jid === item.player.jid && Number(current?.activeToken) === item.tokenIndex
    const focusRing = isFocus
      ? `<circle cx="${cx}" cy="${cy}" r="26" fill="none" stroke="#171512" stroke-width="4"/>`
      : ""

    return `
      ${focusRing}
      <circle cx="${cx}" cy="${cy}" r="20" fill="${meta.hex}" stroke="#fffdf8" stroke-width="4"/>
      <circle cx="${cx - 6}" cy="${cy - 7}" r="5" fill="#ffffff" opacity="0.42"/>
      <text x="${cx}" y="${cy + 6}" text-anchor="middle" font-family="Geist" font-size="16" font-weight="800" fill="#ffffff">${item.tokenIndex + 1}</text>
    `
  }).join("")

  const playerRows = (room.players || []).map((player, index) => {
    const meta = colorMeta(player.color)
    const y = 105 + index * 32

    return `
      <circle cx="72" cy="${y - 6}" r="8" fill="${meta.hex}"/>
      <text x="90" y="${y}" font-family="Geist" font-size="19" font-weight="700" fill="#24211c">${esc(player.name.slice(0, 19))}</text>
      <text x="366" y="${y}" font-family="Geist" font-size="14" font-weight="700" fill="#6d665d">${meta.name.toUpperCase()} • ${finishedCount(player)}/4 • ${playerStatus(room, player, index)}</text>
    `
  }).join("")

  const pendingText = room.pendingRoll
    ? "PILIH PION " + (room.pendingRoll.legal || []).map((index) => index + 1).join(", ")
    : room.status === "playing"
      ? "KETIK #ludo roll"
      : room.status === "ended"
        ? "MATCH COMPLETE"
        : "MENUNGGU PEMAIN"

  const turnText = room.status === "playing"
    ? "Giliran " + (current?.name || "-") + " • " + colorMeta(current?.color).name
    : room.status === "ended"
      ? "Pemenang: " + (room.winner?.name || "-")
      : "Gunakan #ludo join lalu #ludo start"

  const lastLog = room.logs?.[room.logs.length - 1]?.text || "Room Ludo siap."
  const dice = room.lastRoll || "-"

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <rect width="${W}" height="${H}" fill="#f4efe6"/>
      <rect x="38" y="35" width="${W - 76}" height="${H - 70}" rx="30" fill="#fffdf8" stroke="#26231e" stroke-width="3"/>

      <text x="72" y="78" font-family="Geist" font-size="34" font-weight="800" letter-spacing="1" fill="#171512">LUDO ARENA</text>
      <text x="72" y="235" font-family="Geist" font-size="15" font-weight="700" fill="#746d64">${esc(lastLog.slice(0, 102))}</text>

      <rect x="778" y="56" width="224" height="112" rx="18" fill="${currentMeta.light}" stroke="${currentMeta.hex}" stroke-width="4"/>
      <text x="890" y="91" text-anchor="middle" font-family="Geist" font-size="14" font-weight="800" fill="#5b5349">DADU</text>
      <text x="890" y="145" text-anchor="middle" font-family="Geist" font-size="57" font-weight="900" fill="${currentMeta.hex}">${dice}</text>

      ${playerRows}

      <rect x="${BOARD_X}" y="${BOARD_Y}" width="${BOARD}" height="${BOARD}" fill="#fffdf8" stroke="#26231e" stroke-width="4"/>
      ${homes}
      ${grid.join("")}
      ${track}
      ${homeLanes}
      ${safeTiles}
      ${center}
      ${tokens}

      <rect x="72" y="1205" width="936" height="110" rx="18" fill="#25211d"/>
      <text x="108" y="1248" font-family="Geist" font-size="18" font-weight="800" fill="#f4efe6">${esc(pendingText)}</text>
      <text x="108" y="1284" font-family="Geist" font-size="16" font-weight="600" fill="#d2c9bd">${esc(turnText)}</text>
    </svg>
  `

  const renderer = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: W
    },
    font: {
      fontFiles,
      loadSystemFonts: false,
      defaultFontFamily: "Geist",
      sansSerifFamily: "Geist"
    }
  })

  return renderer.render().asPng()
}
