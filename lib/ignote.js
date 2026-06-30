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
      path: path.join(process.cwd(), "public", "ignote-template.png"),
      mime: "image/png"
    },
    {
      path: path.join(process.cwd(), "public", "ignote-template.jpg"),
      mime: "image/jpeg"
    },
    {
      path: path.join(process.cwd(), "public", "ignote-template.jpeg"),
      mime: "image/jpeg"
    }
  ]

  for (const item of files) {
    if (fs.existsSync(item.path)) {
      const base64 = fs.readFileSync(item.path).toString("base64")
      return `data:${item.mime};base64,${base64}`
    }
  }

  throw new Error(
    "Template tidak ditemukan. Upload gambar ke public/ignote-template.png"
  )
}

function getNameSize(name) {
  if (name.length > 18) return 25
  if (name.length > 14) return 27
  if (name.length > 10) return 29
  return 31
}

function getMessageSize(text) {
  if (text.length > 48) return 21
  if (text.length > 40) return 23
  if (text.length > 32) return 25
  if (text.length > 24) return 27
  return 30
}

function wrapMessage(text) {
  const words = text.split(" ").filter(Boolean)
  const lines = []
  let current = ""

  for (const word of words) {
    const next = current ? `${current} ${word}` : word

    if (next.length > 26 && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }

    if (lines.length >= 2) break
  }

  if (current && lines.length < 2) {
    lines.push(current)
  }

  if (lines.length === 2 && words.join(" ").length > lines.join(" ").length) {
    lines[1] = `${lines[1].slice(0, 22)}...`
  }

  return lines.length ? lines : ["Halo semua"]
}

export function parseIgnote(source = {}) {
  const name =
    cleanText(getValue(source, ["name", "nama", "username", "sender"]), 22) ||
    "Fauzann"

  const text =
    cleanText(getValue(source, ["text", "teks", "message", "msg"]), 58) ||
    "Halo semua"

  const time =
    cleanText(getValue(source, ["time", "waktu", "jam"]), 16) ||
    "8 detik"

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
  const messageLines = wrapMessage(text).map(escapeXml)

  const nameSize = getNameSize(name)
  const messageSize = getMessageSize(text)
  const lineHeight = messageSize + 8
  const messageStartY =
    messageLines.length > 1 ? 570 : 582

  const messageSvg = messageLines
    .map(
      (line, index) => `
        <tspan x="509" y="${messageStartY + index * lineHeight}">
          ${line}
        </tspan>
      `
    )
    .join("")

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
      y="471"
      text-anchor="middle"
      font-family="Geist"
      font-size="${nameSize}"
      font-weight="700"
      letter-spacing="-0.3"
    >
      <tspan fill="#F8F8FA">${safeName}</tspan>
      <tspan fill="#A9AFBB"> · ${safeTime}</tspan>
    </text>

    <text
      x="509"
      text-anchor="middle"
      font-family="Geist"
      font-size="${messageSize}"
      font-weight="700"
      letter-spacing="-0.4"
      fill="#FFFFFF"
    >
      ${messageSvg}
    </text>
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
