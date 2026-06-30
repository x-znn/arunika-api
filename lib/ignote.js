import fs from "node:fs"
import path from "node:path"
import { Resvg } from "@resvg/resvg-js"

const W = 864
const H = 1536

const TIMES = [
  "3 detik",
  "8 detik",
  "17 detik",
  "31 detik",
  "47 detik",
  "1 menit",
  "3 menit",
  "7 menit",
  "12 menit",
  "25 menit",
  "1 jam",
  "2 jam",
  "5 jam",
  "19 jam"
]

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function cleanText(value, max) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)
}

function pickTime() {
  return TIMES[Math.floor(Math.random() * TIMES.length)]
}

function normalizeInput(input) {
  if (!input) return {}
  if (typeof URLSearchParams !== "undefined" && input instanceof URLSearchParams) {
    return Object.fromEntries(input.entries())
  }
  if (typeof input.entries === "function") {
    try {
      return Object.fromEntries(input.entries())
    } catch {}
  }
  if (typeof input === "object") return input
  return {}
}

function getTemplateBase64() {
  const candidates = [
    path.join(process.cwd(), "public", "ignote-template.png"),
    path.join(process.cwd(), "public", "ignote.png"),
    path.join(process.cwd(), "public", "template.png")
  ]

  for (const file of candidates) {
    if (fs.existsSync(file)) {
      return fs.readFileSync(file).toString("base64")
    }
  }

  throw new Error("Template tidak ditemukan. Simpan file ke public/ignote-template.png")
}

function getNameSize(name) {
  const len = String(name).length
  if (len > 18) return 27
  if (len > 14) return 29
  if (len > 10) return 31
  return 33
}

function getTextSize(text) {
  const len = String(text).length
  if (len > 48) return 22
  if (len > 42) return 24
  if (len > 36) return 26
  if (len > 30) return 28
  return 30
}

export function parseIgnote(input) {
  const query = normalizeInput(input)

  const name = cleanText(
    query.name ||
      query.nama ||
      query.sender ||
      query.user ||
      query.username ||
      "Fauzann",
    22
  )

  const text = cleanText(
    query.text ||
      query.teks ||
      query.message ||
      query.msg ||
      "Halo semua",
    58
  )

  const time = cleanText(
    query.time ||
      query.waktu ||
      query.label ||
      pickTime(),
    12
  )

  return {
    name,
    text,
    time
  }
}

export function renderIgnote(data = {}) {
  const { name, text, time } = parseIgnote(data)

  const bg = getTemplateBase64()
  const nameSize = getNameSize(name)
  const textSize = getTextSize(text)

  const safeName = escapeXml(name)
  const safeText = escapeXml(text)
  const safeTime = escapeXml(time)

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <image href="data:image/png;base64,${bg}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none"/>

    <text
      x="432"
      y="482"
      fill="#ffffff"
      font-size="${nameSize}"
      font-family="Arial, Helvetica, sans-serif"
      font-weight="700"
      text-anchor="middle"
      letter-spacing="-0.3"
    >
      <tspan fill="#f5f5f7">${safeName}</tspan>
      <tspan fill="#a9afbb"> • ${safeTime}</tspan>
    </text>

    <text
      x="266"
      y="595"
      fill="#ffffff"
      font-size="${textSize}"
      font-family="Arial, Helvetica, sans-serif"
      font-weight="700"
      letter-spacing="-0.3"
      textLength="500"
      lengthAdjust="spacingAndGlyphs"
    >
      ${safeText}
    </text>
  </svg>
  `

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: W
    },
    font: {
      loadSystemFonts: true
    }
  })

  return resvg.render().asPng()
}
