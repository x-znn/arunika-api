import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"

const SLOT = Object.freeze({ left: 36, top: 808, width: 300, height: 270 })
const STATUS_TIME = Object.freeze({ left: 80, top: 40, width: 130, height: 40 })
const MESSAGE_TIME = Object.freeze({ left: 36, top: 1076, width: 120, height: 44 })
const MEDIA_TIME_OFFSET_MS = 2 * 60 * 1000
const MEDIA_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

let templateBuffer

function getTemplate() {
  if (templateBuffer) return templateBuffer

  const file = path.join(process.cwd(), "public", "fakereact-template.png")

  if (!fs.existsSync(file)) {
    throw new Error("Template tidak ditemukan. Upload public/fakereact-template.png")
  }

  templateBuffer = fs.readFileSync(file)
  return templateBuffer
}

function cleanMime(value) {
  const mime = String(value || "").toLowerCase().split(";", 1)[0].trim()
  return MEDIA_MIME_TYPES.has(mime) ? mime : ""
}

function isSticker(value) {
  return String(value || "").toLowerCase() === "sticker"
}

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function wibTime(date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(date)

  const hour = parts.find((part) => part.type === "hour")?.value || "00"
  const minute = parts.find((part) => part.type === "minute")?.value || "00"

  return hour + "." + minute
}

function svgText({ text, width, height, x, y, fontSize, weight = 700, fill = "#f4f4f5", opacity = 1, align = "start" }) {
  const anchor = align === "middle" ? "middle" : "start"
  const textX = align === "middle" ? width / 2 : x

  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <text
        x="${textX}"
        y="${y}"
        text-anchor="${anchor}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${fontSize}"
        font-weight="${weight}"
        letter-spacing="-0.7"
        fill="${fill}"
        fill-opacity="${opacity}"
      >${escapeXml(text)}</text>
    </svg>
  `)
}

function timeLayers(now = new Date()) {
  const statusTime = wibTime(now)
  const mediaTime = wibTime(new Date(now.getTime() - MEDIA_TIME_OFFSET_MS))

  return [
    {
      input: svgText({
        text: statusTime,
        width: STATUS_TIME.width,
        height: STATUS_TIME.height,
        x: 0,
        y: 31,
        fontSize: 30,
        weight: 800,
        fill: "#F7F7F7"
      }),
      left: STATUS_TIME.left,
      top: STATUS_TIME.top
    },
    {
      input: svgText({
        text: mediaTime,
        width: MESSAGE_TIME.width,
        height: MESSAGE_TIME.height,
        x: 0,
        y: 29,
        fontSize: 18,
        weight: 600,
        fill: "#D8D8D8",
        opacity: 0.9,
        align: "middle"
      }),
      left: MESSAGE_TIME.left,
      top: MESSAGE_TIME.top
    }
  ]
}

async function imageLayer(bytes) {
  return sharp(bytes, { animated: false, limitInputPixels: false })
    .rotate()
    .resize(SLOT.width, SLOT.height, {
      fit: "cover",
      position: "attention",
      withoutEnlargement: false
    })
    .png()
    .toBuffer()
}

async function stickerLayer(bytes) {
  return imageLayer(bytes)
}

export async function renderFakeReact({ bytes, mime, mode, now = new Date() }) {
  if (!cleanMime(mime)) {
    throw new Error("Format media harus JPG, PNG, atau WEBP.")
  }

  if (!Buffer.isBuffer(bytes) || !bytes.length) {
    throw new Error("Media sumber kosong.")
  }

  const layer = isSticker(mode)
    ? await stickerLayer(bytes)
    : await imageLayer(bytes)

  return sharp(getTemplate(), { limitInputPixels: false })
    .composite([
      { input: layer, left: SLOT.left, top: SLOT.top },
      ...timeLayers(now)
    ])
    .png()
    .toBuffer()
}
