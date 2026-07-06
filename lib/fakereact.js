import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"

const SLOT = Object.freeze({ left: 32, top: 824, width: 273, height: 273 })
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
  const source = sharp(bytes, { animated: false, limitInputPixels: false }).rotate()
  const metadata = await source.metadata()

  // Some WhatsApp stickers are opaque WEBP files (more like a normal image).
  // Render those exactly like photos so they fill the slot. Only transparent
  // stickers keep the centered/contain behaviour.
  let hasVisibleTransparency = false

  if (metadata.hasAlpha) {
    const alpha = await source
      .clone()
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    for (let index = 3; index < alpha.data.length; index += alpha.info.channels) {
      if (alpha.data[index] < 245) {
        hasVisibleTransparency = true
        break
      }
    }
  }

  if (!hasVisibleTransparency) {
    return imageLayer(bytes)
  }

  const maxWidth = SLOT.width - 8
  const maxHeight = SLOT.height - 8
  const sticker = await source
    .clone()
    .ensureAlpha()
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 0 })
    .resize(maxWidth, maxHeight, {
      fit: "contain",
      withoutEnlargement: false,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer({ resolveWithObject: true })

  const left = Math.max(0, Math.floor((SLOT.width - sticker.info.width) / 2))
  const top = Math.max(0, Math.floor((SLOT.height - sticker.info.height) / 2))

  return sharp({
    create: {
      width: SLOT.width,
      height: SLOT.height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([{ input: sticker.data, left, top }])
    .png()
    .toBuffer()
}


export async function renderFakeReact({ bytes, mime, mode }) {
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
    .composite([{ input: layer, left: SLOT.left, top: SLOT.top }])
    .png()
    .toBuffer()
}
