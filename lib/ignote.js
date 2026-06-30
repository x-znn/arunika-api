import path from "node:path"
import { Resvg } from "@resvg/resvg-js"

const W = 864
const H = 1536
const DEFAULT_BG = "https://i.ibb.co.com/CKbsYPF5/IMG-3322.png"

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

function escapeXml(value) {
  return String(value ?? "")
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

function pick(source, keys) {
  for (const key of keys) {
    const value = typeof source?.get === "function" ? source.get(key) : source?.[key]
    if (value != null && String(value).trim() !== "") return value
  }
  return ""
}

function fitNameSize(name) {
  if (name.length > 16) return 28
  if (name.length > 12) return 31
  return 34
}

function fitTextSize(text) {
  if (text.length > 47) return 25
  if (text.length > 39) return 27
  if (text.length > 31) return 30
  return 33
}

export function parseIgnote(source = {}) {
  const name = cleanText(pick(source, ["name", "username", "nama"]), 22) || "Fauzann"
  const text = cleanText(pick(source, ["text", "message", "msg", "teks"]), 58) || "Halo semua"
  const time = cleanText(pick(source, ["time", "jam", "waktu"]), 18) || "8 detik"
  const background =
    cleanText(pick(source, ["background", "bg", "image"]), 1000) || DEFAULT_BG

  return {
    name,
    text,
    time,
    background
  }
}

export function renderIgnote(source = {}) {
  const { name, text, time, background } = parseIgnote(source)

  const safeName = escapeXml(name)
  const safeText = escapeXml(text)
  const safeTime = escapeXml(time)
  const safeBg = escapeXml(background)

  const nameSize = fitNameSize(name)
  const textSize = fitTextSize(text)

  const svg = `
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <image href="${safeBg}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none"/>

    <text
      x="432"
      y="486"
      text-anchor="middle"
      font-family="Geist"
      font-size="${nameSize}"
      font-weight="800"
      letter-spacing="-0.4"
    >
      <tspan fill="#F9F9FA">${safeName}</tspan>
      <tspan fill="#A7ADBA"> · ${safeTime}</tspan>
    </text>

    <text
      x="264"
      y="596"
      font-family="Geist"
      font-size="${textSize}"
      font-weight="800"
      letter-spacing="-0.6"
      fill="#FFFFFF"
    >${safeText}</text>
  </svg>
  `

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: W
    },
    font: {
      fontFiles: [GEIST_REGULAR],
      loadSystemFonts: false,
      defaultFontFamily: "Geist",
      sansSerifFamily: "Geist"
    }
  })

  return resvg.render().asPng()
}
