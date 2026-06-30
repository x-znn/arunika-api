import fs from "node:fs"
import path from "node:path"
import { Resvg } from "@resvg/resvg-js"

const W = 864
const H = 1536

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

function getValue(source, keys) {
  for (const key of keys) {
    const value =
      typeof source?.get === "function"
        ? source.get(key)
        : source?.[key]

    if (value != null && String(value).trim()) {
      return value
    }
  }

  return ""
}

function getTemplate() {
  const files = [
    {
      file: path.join(process.cwd(), "public", "ignote-template.png"),
      mime: "image/png"
    },
    {
      file: path.join(process.cwd(), "public", "ignote-template.jpg"),
      mime: "image/jpeg"
    },
    {
      file: path.join(process.cwd(), "public", "ignote-template.jpeg"),
      mime: "image/jpeg"
    }
  ]

  for (const item of files) {
    if (fs.existsSync(item.file)) {
      const base64 = fs.readFileSync(item.file).toString("base64")
      return `data:${item.mime};base64,${base64}`
    }
  }

  throw new Error(
    "Template tidak ditemukan. Upload file ke public/ignote-template.png"
  )
}

function getHeaderSize(name, time) {
  const total = `${name} · ${time}`.length

  if (total > 28) return 27
  if (total > 23) return 29
  if (total > 18) return 31

  return 33
}

function getMessageSize(text) {
  const length = text.length

  if (length > 44) return 22
  if (length > 38) return 24
  if (length > 33) return 26
  if (length > 28) return 28
  if (length > 22) return 30

  return 33
}

function getMessageFit(text) {
  if (text.length < 25) return ""

  return `textLength="500" lengthAdjust="spacingAndGlyphs"`
}

export function parseIgnote(source = {}) {
  const name =
    cleanText(
      getValue(source, ["name", "nama", "username", "sender"]),
      22
    ) || "Fauzann"

  const text =
    cleanText(
      getValue(source, ["text", "teks", "message", "msg"]),
      48
    ) || "Halo semua"

  const time =
    cleanText(
      getValue(source, ["time", "waktu", "jam"]),
      16
    ) || "8 detik"

  return {
    name,
    text,
    time
  }
}

export function renderIgnote(source = {}) {
  const { name, text, time } = parseIgnote(source)

  const template = getTemplate()
  const safeName = escapeXml(name)
  const safeTime = escapeXml(time)
  const safeText = escapeXml(text)

  const headerSize = getHeaderSize(name, time)
  const messageSize = getMessageSize(text)
  const messageFit = getMessageFit(text)

  const fontFiles = fs.existsSync(GEIST_REGULAR)
    ? [GEIST_REGULAR]
    : []

  const svg = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="${W}"
    height="${H}"
    viewBox="0 0 ${W} ${H}"
  >
    <image
      href="${template}"
      x="0"
      y="0"
      width="${W}"
      height="${H}"
      preserveAspectRatio="none"
    />

    <text
      x="432"
      y="478"
      text-anchor="middle"
      font-family="Geist"
      font-size="${headerSize}"
      font-weight="700"
      letter-spacing="-0.45"
    >
      <tspan
        fill="#F8F8FA"
        stroke="#F8F8FA"
        stroke-width="0.72"
        paint-order="stroke"
      >${safeName}</tspan>

      <tspan
        fill="#B5BAC5"
        stroke="#B5BAC5"
        stroke-width="0.45"
        paint-order="stroke"
      > · ${safeTime}</tspan>
    </text>

    <text
      x="252"
      y="579"
      text-anchor="start"
      font-family="Geist"
      font-size="${messageSize}"
      font-weight="700"
      letter-spacing="-0.48"
      fill="#FFFFFF"
      stroke="#FFFFFF"
      stroke-width="0.75"
      paint-order="stroke"
      ${messageFit}
    >${safeText}</text>
  </svg>
  `

  const resvg = new Resvg(svg, {
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

  return resvg.render().asPng()
}
