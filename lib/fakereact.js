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
  // Samakan perilaku sticker dengan image: selalu isi penuh kotak putih.
  // Ini memang bisa memotong sedikit sisi sticker, tetapi hasilnya full
  // seperti mode image sesuai permintaan.
  return imageLayer(bytes)
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
