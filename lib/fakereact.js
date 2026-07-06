import fs from "node:fs"
import path from "node:path"
import { Resvg } from "@resvg/resvg-js"

const W = 852
const H = 1847
const SLOT = Object.freeze({ x: 31, y: 803, width: 268, height: 269 })

let templateDataUri

function template() {
  if (templateDataUri) return templateDataUri

  const file = path.join(process.cwd(), "public", "fakereact-template.png")

  if (!fs.existsSync(file)) {
    throw new Error("Template tidak ditemukan. Upload public/fakereact-template.png")
  }

  templateDataUri = "data:image/png;base64," + fs.readFileSync(file).toString("base64")
  return templateDataUri
}

function normalizeMime(value) {
  const mime = String(value || "").toLowerCase().split(";", 1)[0].trim()

  if (mime === "image/png" || mime === "image/jpeg" || mime === "image/webp") {
    return mime
  }

  return ""
}

function normalizeMode(value) {
  return String(value || "").toLowerCase() === "sticker" ? "sticker" : "image"
}

export function renderFakeReact({ bytes, mime, mode }) {
  const safeMime = normalizeMime(mime)

  if (!safeMime) {
    throw new Error("Format media harus PNG, JPG, atau WEBP.")
  }

  if (!Buffer.isBuffer(bytes) || !bytes.length) {
    throw new Error("Media sumber kosong.")
  }

  const source = `data:${safeMime};base64,${bytes.toString("base64")}`
  const itemMode = normalizeMode(mode)
  const preserve = itemMode === "sticker" ? "xMidYMid meet" : "xMidYMid slice"
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <clipPath id="media-slot">
        <rect x="${SLOT.x}" y="${SLOT.y}" width="${SLOT.width}" height="${SLOT.height}" />
      </clipPath>
    </defs>

    <image
      href="${template()}"
      x="0"
      y="0"
      width="${W}"
      height="${H}"
      preserveAspectRatio="none"
    />

    <g clip-path="url(#media-slot)">
      <image
        href="${source}"
        x="${SLOT.x}"
        y="${SLOT.y}"
        width="${SLOT.width}"
        height="${SLOT.height}"
        preserveAspectRatio="${preserve}"
      />
    </g>
  </svg>
  `

  return new Resvg(svg, {
    fitTo: { mode: "width", value: W }
  }).render().asPng()
}
