import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"
import satori from "satori"

const MAX_SHORT = 29
const MAX_LONG = 58
const CANVAS_WIDTH = 1290
const TEXT_COLOR = "#F5F5F5"
const FONT_FAMILY = "Roboto"
const FONT_URL = "https://raw.githubusercontent.com/googlefonts/roboto-3-classic/main/src/hinted/Roboto-Bold.ttf"

const templateCache = new Map()
let fontPromise

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

async function iqcFont() {
  if (!fontPromise) {
    fontPromise = fetch(FONT_URL, {
      headers: { "User-Agent": "ArunikaAPI-IQC/1.0" },
      signal: AbortSignal.timeout(12_000)
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Font server merespons " + response.status)
        }

        return Buffer.from(await response.arrayBuffer())
      })
      .catch((error) => {
        fontPromise = null
        throw new Error("Gagal memuat font IQC. Coba ulangi beberapa saat.")
      })
  }

  return fontPromise
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

async function textSvg(rows, kind) {
  const canvasHeight = kind === "short" ? 2682 : 2677
  const x = 79
  const top = kind === "short" ? 1170 : 1130
  const font = await iqcFont()

  return satori(
    {
      type: "div",
      props: {
        style: {
          width: CANVAS_WIDTH + "px",
          height: canvasHeight + "px",
          position: "relative",
          display: "flex"
        },
        children: {
          type: "div",
          props: {
            style: {
              position: "absolute",
              left: x + "px",
              top: top + "px",
              display: "flex",
              flexDirection: "column",
              color: TEXT_COLOR,
              fontFamily: FONT_FAMILY,
              fontSize: "48px",
              fontWeight: 700,
              letterSpacing: "-0.7px",
              lineHeight: "62px"
            },
            children: rows.map((row) => ({
              type: "div",
              props: {
                style: { height: "62px", lineHeight: "62px", display: "flex" },
                children: row
              }
            }))
          }
        }
      }
    },
    {
      width: CANVAS_WIDTH,
      height: canvasHeight,
      fonts: [{ name: FONT_FAMILY, data: font, weight: 700, style: "normal" }]
    }
  )
}

export async function renderIqc(text) {
  const values = parseIqcText(text)
  const overlay = Buffer.from(await textSvg(values.rows, values.kind))
  const png = await sharp(template(values.kind), { limitInputPixels: false })
    .composite([{ input: overlay, top: 0, left: 0 }])
    .png()
    .toBuffer()

  return { png, ...values }
}
