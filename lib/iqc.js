import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"

const MAX_SHORT = 29
const MAX_LONG = 58
const CANVAS_WIDTH = 1290
const TEXT_COLOR = "#F5F5F5"
const FONT_FAMILY = "Arial, Helvetica, sans-serif"

const templateCache = new Map()

function templateFile(kind) {
  return kind === "short" ? "iqc-template-short.png" : "iqc-template-long.png"
}

function template(kind) {
  const filename = templateFile(kind)
  if (templateCache.has(filename)) return templateCache.get(filename)

  const file = path.join(process.cwd(), "public", filename)
  if (!fs.existsSync(file)) {
    throw new Error("Template IQC tidak ditemukan: public/" + filename)
  }

  const buffer = fs.readFileSync(file)
  templateCache.set(filename, buffer)
  return buffer
}

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export function normalizeIqcText(value) {
  return String(value == null ? "" : value)
    .replace(/\u0000/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export function characterCount(value) {
  return [...normalizeIqcText(value)].length
}

function wrapLongText(text) {
  const words = text.split(" ")
  const rows = [""]

  for (const word of words) {
    const current = rows[rows.length - 1]
    const candidate = current ? current + " " + word : word

    if ([...candidate].length <= MAX_SHORT || !current) {
      rows[rows.length - 1] = candidate
      continue
    }

    if (rows.length >= 2) {
      throw new Error("Teks terlalu panjang. Maksimal 58 karakter termasuk spasi.")
    }

    rows.push(word)
  }

  if (rows.length > 2 || rows.some((row) => [...row].length > MAX_SHORT)) {
    throw new Error("Teks terlalu panjang. Maksimal 58 karakter termasuk spasi.")
  }

  return rows
}

export function parseIqcText(value) {
  const text = normalizeIqcText(value)
  const count = characterCount(text)

  if (!text) throw new Error("text wajib diisi.")
  if (count > MAX_LONG) throw new Error("Teks terlalu panjang. Maksimal 58 karakter termasuk spasi.")

  if (count <= MAX_SHORT) {
    return { text, count, kind: "short", rows: [text] }
  }

  return { text, count, kind: "long", rows: wrapLongText(text) }
}

function textSvg(rows, kind) {
  const canvasHeight = kind === "short" ? 2682 : 2677
  const x = 79
  const baseline = kind === "short" ? 1257 : 1236
  const fontSize = 48
  const lineHeight = 62
  const text = rows
    .map((row, index) => `<text x="${x}" y="${baseline + index * lineHeight}">${escapeXml(row)}</text>`)
    .join("")

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_WIDTH}" height="${canvasHeight}" viewBox="0 0 ${CANVAS_WIDTH} ${canvasHeight}">
    <style>
      text {
        font-family: ${FONT_FAMILY};
        font-size: ${fontSize}px;
        font-weight: 700;
        letter-spacing: -0.7px;
        fill: ${TEXT_COLOR};
      }
    </style>
    ${text}
  </svg>`
}

export async function renderIqc(text) {
  const values = parseIqcText(text)
  const overlay = Buffer.from(textSvg(values.rows, values.kind))
  const png = await sharp(template(values.kind), { limitInputPixels: false })
    .composite([{ input: overlay, top: 0, left: 0 }])
    .png()
    .toBuffer()

  return { png, ...values }
}
