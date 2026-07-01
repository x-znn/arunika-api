import fs from "node:fs"
import path from "node:path"
import { Resvg } from "@resvg/resvg-js"
import { MONOPOLY_BOARD, colorMeta, currentPlayer, propertyState } from "./monopoly-core"

const SIZE = 1254
let cachedBoardUri = ""

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function boardDataUri() {
  if (cachedBoardUri) return cachedBoardUri
  const source = path.join(process.cwd(), "public", "monopoly", "board-indonesia.png")
  const image = fs.readFileSync(source)
  cachedBoardUri = "data:image/png;base64," + image.toString("base64")
  return cachedBoardUri
}

// Semua koordinat dipatok manual berdasarkan board-indonesia.png agar index game
// tidak pernah bergeser ke petak sebelah.
const TILES = [
  { pawn: [91, 1152], asset: null },
  { pawn: [223, 1161], asset: [222, 1081] },
  { pawn: [338, 1161], asset: [338, 1081] },
  { pawn: [452, 1161], asset: null },
  { pawn: [565, 1161], asset: [565, 1081] },
  { pawn: [680, 1161], asset: [680, 1081] },
  { pawn: [779, 1161], asset: [779, 1081] },
  { pawn: [891, 1161], asset: null },
  { pawn: [1007, 1161], asset: [1007, 1081] },
  { pawn: [1163, 1152], asset: null },
  { pawn: [1163, 1020], asset: [1084, 1020] },
  { pawn: [1163, 906], asset: null },
  { pawn: [1163, 790], asset: [1084, 790] },
  { pawn: [1163, 676], asset: [1084, 676] },
  { pawn: [1163, 560], asset: [1084, 560] },
  { pawn: [1163, 445], asset: [1084, 445] },
  { pawn: [1163, 331], asset: [1084, 331] },
  { pawn: [1163, 95], asset: null },
  { pawn: [1005, 95], asset: [1005, 170] },
  { pawn: [889, 95], asset: null },
  { pawn: [772, 95], asset: [772, 170] },
  { pawn: [663, 95], asset: [663, 170] },
  { pawn: [556, 95], asset: [556, 170] },
  { pawn: [449, 95], asset: null },
  { pawn: [338, 95], asset: [338, 170] },
  { pawn: [224, 95], asset: [224, 170] },
  { pawn: [93, 95], asset: null },
  { pawn: [93, 263], asset: [169, 263] },
  { pawn: [93, 375], asset: [169, 375] },
  { pawn: [93, 485], asset: [169, 485] },
  { pawn: [93, 600], asset: [169, 600] },
  { pawn: [93, 722], asset: [169, 722] },
  { pawn: [93, 850], asset: null },
  { pawn: [93, 978], asset: [169, 978] }
]

function pointFor(index, type = "pawn") {
  const entry = TILES[Number(index)] || TILES[0]
  const point = type === "asset" ? entry.asset : entry.pawn
  return point ? { x: point[0], y: point[1] } : null
}

function tokenOffsets(count) {
  const presets = {
    1: [[0, 0]],
    2: [[-17, -17], [17, 17]],
    3: [[-18, -18], [18, -18], [0, 20]],
    4: [[-19, -19], [19, -19], [-19, 19], [19, 19]]
  }
  return presets[Math.max(1, Math.min(4, count))]
}

function houseSvg(x, y, color, dark) {
  return `<g transform="translate(${x} ${y})">
    <path d="M0 11L12 1 24 11V25H0Z" fill="${color}" stroke="${dark}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M3 11H21" stroke="#ffffff" stroke-width="1.8" opacity=".85"/>
    <rect x="8" y="16" width="8" height="9" rx="1" fill="#fdf3cb" stroke="${dark}" stroke-width="1.2"/>
    <rect x="3.5" y="14" width="3.5" height="4" rx=".6" fill="#fdf3cb"/>
    <rect x="17" y="14" width="3.5" height="4" rx=".6" fill="#fdf3cb"/>
  </g>`
}

function hotelSvg(x, y, color, dark) {
  return `<g transform="translate(${x} ${y})">
    <path d="M0 9L21 0 42 9V33H0Z" fill="${color}" stroke="${dark}" stroke-width="2.4" stroke-linejoin="round"/>
    <rect x="5" y="13" width="8" height="7" rx="1" fill="#fdf3cb" stroke="${dark}" stroke-width="1.2"/>
    <rect x="17" y="13" width="8" height="7" rx="1" fill="#fdf3cb" stroke="${dark}" stroke-width="1.2"/>
    <rect x="29" y="13" width="8" height="7" rx="1" fill="#fdf3cb" stroke="${dark}" stroke-width="1.2"/>
    <rect x="15" y="23" width="12" height="10" rx="1" fill="#fdf3cb" stroke="${dark}" stroke-width="1.2"/>
  </g>`
}

function propertyOverlays(room) {
  const out = []

  MONOPOLY_BOARD.forEach((tile, index) => {
    if (!["property", "station", "utility"].includes(tile.type)) return
    const state = propertyState(room, index)
    if (!state.owner) return
    const player = (room.players || []).find((entry) => String(entry.jid) === String(state.owner))
    if (!player) return
    const meta = colorMeta(player.color)
    const asset = pointFor(index, "asset")

    if (asset) {
      // Owner marker tetap dipertahankan dan dipisahkan dari bangunan.
      out.push(`<circle cx="${asset.x + 34}" cy="${asset.y - 22}" r="9" fill="${meta.hex}" stroke="#fff" stroke-width="3"/>`)
      if (tile.type === "property") {
        const level = Math.max(1, Math.min(4, Number(state.level) || 1))
        if (level === 4) {
          out.push(hotelSvg(asset.x - 21, asset.y - 12, meta.hex, meta.dark))
        } else {
          const gap = 27
          const startX = asset.x - ((level - 1) * gap) / 2 - 12
          for (let step = 0; step < level; step += 1) {
            out.push(houseSvg(startX + step * gap, asset.y - 12, meta.hex, meta.dark))
          }
        }
      }
    }
  })

  return out.join("")
}

function pawnOverlays(room) {
  const grouped = new Map()
  ;(room.players || []).forEach((player) => {
    if (player.surrendered || player.bankrupt) return
    const index = Math.max(0, Math.min(TILES.length - 1, Number(player.position) || 0))
    const list = grouped.get(index) || []
    list.push(player)
    grouped.set(index, list)
  })

  const current = currentPlayer(room)
  const out = []

  grouped.forEach((players, index) => {
    const point = pointFor(index, "pawn")
    if (!point) return
    const offsets = tokenOffsets(players.length)
    players.forEach((player, playerIndex) => {
      const [dx, dy] = offsets[playerIndex] || [0, 0]
      const meta = colorMeta(player.color)
      const active = current && String(current.jid) === String(player.jid)
      const x = point.x + dx
      const y = point.y + dy
      out.push(`<g>
        ${active ? `<circle cx="${x}" cy="${y}" r="30" fill="none" stroke="#ffffff" stroke-width="6" stroke-dasharray="6 5"/>` : ""}
        <circle cx="${x}" cy="${y}" r="21" fill="${meta.hex}" stroke="#1d232c" stroke-width="4"/>
        <circle cx="${x - 7}" cy="${y - 8}" r="6" fill="#fff" opacity=".45"/>
        <text x="${x}" y="${y + 6}" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="800" fill="#fff">${escapeXml(String(player.name || "?").slice(0, 1).toUpperCase())}</text>
      </g>`)
    })
  })

  return out.join("")
}

export function renderMonopolyBoard(room) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
    <image href="${boardDataUri()}" x="0" y="0" width="${SIZE}" height="${SIZE}" preserveAspectRatio="none"/>
    ${propertyOverlays(room)}
    ${pawnOverlays(room)}
  </svg>`

  return new Resvg(svg, {
    fitTo: { mode: "width", value: SIZE }
  }).render().asPng()
}
