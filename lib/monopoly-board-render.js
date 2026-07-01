import fs from "node:fs"
import path from "node:path"
import { Resvg } from "@resvg/resvg-js"
import { MONOPOLY_BOARD, colorMeta, currentPlayer, propertyState } from "./monopoly-core"

const SOURCE_SIZE = 1254
const OUTPUT_SIZE = 1000
const MAX_RENDER_CACHE = 24

let cachedBoardUri = ""
const renderedBoards = new Map()

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

// Titik pion memakai sisi luar petak agar tidak menutup rumah/hotel.
// Titik bangunan memakai slot visual di dalam petak properti.
// Semua key memakai tile.id, bukan index array, agar tidak bisa bergeser ke petak sebelah.
const PAWN_ANCHORS = {
  start: [91, 1152],
  tanjung_pinang: [223, 1161],
  pelabuhan_tanjung_priok: [338, 1161],
  pajak_penghasilan: [452, 1161],
  kota_tua: [565, 1161],
  stasiun_pasar_senen: [680, 1161],
  candi_borobudur: [779, 1161],
  kesempatan_1: [891, 1161],
  pasar_baru: [1007, 1161],
  penjara: [1163, 1152],
  makassar: [1163, 1020],
  dana_umum_1: [1163, 906],
  labuan_bajo: [1163, 790],
  lombok: [1163, 676],
  air: [1163, 560],
  pura_besakih: [1163, 445],
  bali_denpasar: [1163, 331],
  masuk_penjara: [1163, 95],
  surabaya: [1005, 95],
  kesempatan_2: [889, 95],
  semarang: [772, 95],
  stasiun_gambir: [663, 95],
  yogyakarta: [556, 95],
  dana_umum_2: [449, 95],
  bandung: [338, 95],
  mh_thamrin: [224, 95],
  parkir_gratis: [93, 95],
  medan: [93, 263],
  danau_toba: [93, 375],
  listrik: [93, 485],
  palembang: [93, 600],
  padang: [93, 722],
  kesempatan_3: [93, 850],
  batam: [93, 978]
}

const BUILDING_ANCHORS = {
  tanjung_pinang: [222, 1081],
  kota_tua: [565, 1081],
  candi_borobudur: [779, 1081],
  pasar_baru: [1007, 1081],
  makassar: [1084, 1020],
  labuan_bajo: [1084, 790],
  lombok: [1084, 676],
  pura_besakih: [1084, 445],
  bali_denpasar: [1084, 331],
  surabaya: [1005, 170],
  semarang: [772, 170],
  yogyakarta: [556, 170],
  bandung: [338, 170],
  mh_thamrin: [224, 170],
  medan: [169, 263],
  danau_toba: [169, 375],
  palembang: [169, 600],
  padang: [169, 722],
  batam: [169, 978]
}

function pointFrom(map, id) {
  const point = map[String(id || "")]
  return point ? { x: point[0], y: point[1] } : null
}

function tokenOffsets(count) {
  const presets = {
    1: [[0, 0]],
    2: [[-16, -16], [16, 16]],
    3: [[-18, -18], [18, -18], [0, 20]],
    4: [[-18, -18], [18, -18], [-18, 18], [18, 18]]
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
    <path d="M3 9H39" stroke="#ffffff" stroke-width="1.8" opacity=".85"/>
    <rect x="5" y="13" width="8" height="7" rx="1" fill="#fdf3cb" stroke="${dark}" stroke-width="1.2"/>
    <rect x="17" y="13" width="8" height="7" rx="1" fill="#fdf3cb" stroke="${dark}" stroke-width="1.2"/>
    <rect x="29" y="13" width="8" height="7" rx="1" fill="#fdf3cb" stroke="${dark}" stroke-width="1.2"/>
    <rect x="15" y="23" width="12" height="10" rx="1" fill="#fdf3cb" stroke="${dark}" stroke-width="1.2"/>
  </g>`
}

function buildingOverlays(room) {
  const out = []

  MONOPOLY_BOARD.forEach((tile, index) => {
    if (tile.type !== "property") return

    const state = propertyState(room, index)
    if (!state.owner) return

    const owner = (room.players || []).find((player) => String(player.jid) === String(state.owner))
    const point = pointFrom(BUILDING_ANCHORS, tile.id)
    if (!owner || !point) return

    const meta = colorMeta(owner.color)
    const level = Math.max(1, Math.min(4, Number(state.level) || 1))

    if (level === 4) {
      out.push(hotelSvg(point.x - 21, point.y - 12, meta.hex, meta.dark))
      return
    }

    const gap = 27
    const startX = point.x - ((level - 1) * gap) / 2 - 12
    for (let house = 0; house < level; house += 1) {
      out.push(houseSvg(startX + house * gap, point.y - 12, meta.hex, meta.dark))
    }
  })

  return out.join("")
}

function pawnOverlays(room) {
  const grouped = new Map()

  ;(room.players || []).forEach((player) => {
    if (player.surrendered || player.bankrupt) return
    const tile = MONOPOLY_BOARD[Math.max(0, Math.min(MONOPOLY_BOARD.length - 1, Number(player.position) || 0))]
    if (!tile) return
    const list = grouped.get(tile.id) || []
    list.push(player)
    grouped.set(tile.id, list)
  })

  const current = currentPlayer(room)
  const out = []

  grouped.forEach((list, tileId) => {
    const point = pointFrom(PAWN_ANCHORS, tileId)
    if (!point) return
    const offsets = tokenOffsets(list.length)

    list.forEach((player, playerIndex) => {
      const [dx, dy] = offsets[playerIndex] || [0, 0]
      const meta = colorMeta(player.color)
      const active = current && String(current.jid) === String(player.jid)
      const x = point.x + dx
      const y = point.y + dy
      const initial = escapeXml(String(player.name || "?").slice(0, 1).toUpperCase())

      out.push(`<g>
        ${active ? `<circle cx="${x}" cy="${y}" r="29" fill="none" stroke="#ffffff" stroke-width="6" stroke-dasharray="6 5"/>` : ""}
        <circle cx="${x}" cy="${y}" r="20" fill="${meta.hex}" stroke="#1d232c" stroke-width="4"/>
        <circle cx="${x - 7}" cy="${y - 8}" r="6" fill="#ffffff" opacity=".45"/>
        <text x="${x}" y="${y + 6}" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="800" fill="#ffffff">${initial}</text>
      </g>`)
    })
  })

  return out.join("")
}

function renderCacheKey(room) {
  return String(room?.chatId || "room") + ":" + String(room?.boardVersion || 1)
}

function rememberRenderedBoard(key, png) {
  if (renderedBoards.has(key)) renderedBoards.delete(key)
  renderedBoards.set(key, png)
  while (renderedBoards.size > MAX_RENDER_CACHE) {
    renderedBoards.delete(renderedBoards.keys().next().value)
  }
}

export function renderMonopolyBoard(room) {
  const key = renderCacheKey(room)
  const cached = renderedBoards.get(key)
  if (cached) return cached

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SOURCE_SIZE}" height="${SOURCE_SIZE}" viewBox="0 0 ${SOURCE_SIZE} ${SOURCE_SIZE}">
    <image href="${boardDataUri()}" x="0" y="0" width="${SOURCE_SIZE}" height="${SOURCE_SIZE}" preserveAspectRatio="none"/>
    ${buildingOverlays(room)}
    ${pawnOverlays(room)}
  </svg>`

  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: OUTPUT_SIZE }
  }).render().asPng()

  rememberRenderedBoard(key, png)
  return png
}
