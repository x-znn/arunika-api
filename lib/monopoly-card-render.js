import { Resvg } from "@resvg/resvg-js"

const GLYPHS = {
  "A":["01110","10001","10001","11111","10001","10001","10001"],
  "B":["11110","10001","10001","11110","10001","10001","11110"],
  "C":["01110","10001","10000","10000","10000","10001","01110"],
  "D":["11110","10001","10001","10001","10001","10001","11110"],
  "E":["11111","10000","10000","11110","10000","10000","11111"],
  "F":["11111","10000","10000","11110","10000","10000","10000"],
  "G":["01110","10001","10000","10111","10001","10001","01110"],
  "H":["10001","10001","10001","11111","10001","10001","10001"],
  "I":["11111","00100","00100","00100","00100","00100","11111"],
  "J":["00111","00010","00010","00010","10010","10010","01100"],
  "K":["10001","10010","10100","11000","10100","10010","10001"],
  "L":["10000","10000","10000","10000","10000","10000","11111"],
  "M":["10001","11011","10101","10101","10001","10001","10001"],
  "N":["10001","11001","10101","10011","10001","10001","10001"],
  "O":["01110","10001","10001","10001","10001","10001","01110"],
  "P":["11110","10001","10001","11110","10000","10000","10000"],
  "Q":["01110","10001","10001","10001","10101","10010","01101"],
  "R":["11110","10001","10001","11110","10100","10010","10001"],
  "S":["01111","10000","10000","01110","00001","00001","11110"],
  "T":["11111","00100","00100","00100","00100","00100","00100"],
  "U":["10001","10001","10001","10001","10001","10001","01110"],
  "V":["10001","10001","10001","10001","10001","01010","00100"],
  "W":["10001","10001","10001","10101","10101","10101","01010"],
  "X":["10001","10001","01010","00100","01010","10001","10001"],
  "Y":["10001","10001","01010","00100","00100","00100","00100"],
  "Z":["11111","00001","00010","00100","01000","10000","11111"],
  "0":["01110","10001","10011","10101","11001","10001","01110"],
  "1":["00100","01100","00100","00100","00100","00100","01110"],
  "2":["01110","10001","00001","00010","00100","01000","11111"],
  "3":["11110","00001","00001","01110","00001","00001","11110"],
  "4":["00010","00110","01010","10010","11111","00010","00010"],
  "5":["11111","10000","10000","11110","00001","00001","11110"],
  "6":["01110","10000","10000","11110","10001","10001","01110"],
  "7":["11111","00001","00010","00100","01000","01000","01000"],
  "8":["01110","10001","10001","01110","10001","10001","01110"],
  "9":["01110","10001","10001","01111","00001","00001","01110"],
  " ":["00000","00000","00000","00000","00000","00000","00000"],
  ".":["00000","00000","00000","00000","00000","00110","00110"],
  ",":["00000","00000","00000","00000","00000","00110","00100"],
  ":":["00000","00110","00110","00000","00110","00110","00000"],
  "- ":["00000","00000","00000","11111","00000","00000","00000"],
  "- ":["00000","00000","00000","11111","00000","00000","00000"],
  "+":["00000","00100","00100","11111","00100","00100","00000"],
  "/":["00001","00010","00100","01000","10000","00000","00000"],
  "?":["01110","10001","00001","00010","00100","00000","00100"],
  "!":["00100","00100","00100","00100","00100","00000","00100"],
  "(":["00010","00100","01000","01000","01000","00100","00010"],
  ")":["01000","00100","00010","00010","00010","00100","01000"]
}

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function normalize(value) {
  return String(value ?? "")
    .toUpperCase()
    .replace(/×/g, "X")
    .replace(/[–—]/g, "-")
    .replace(/[^A-Z0-9 .,:+\-\/?!()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function wrapText(value, maxChars, limit) {
  const words = normalize(value).split(" ").filter(Boolean)
  const lines = []
  let line = ""

  for (const word of words) {
    const next = line ? line + " " + word : word
    if (next.length <= maxChars || !line) {
      line = next
    } else {
      lines.push(line)
      line = word
    }
  }

  if (line) lines.push(line)
  return lines.slice(0, limit)
}

function glyphFor(char) {
  if (char === "-") return ["00000","00000","00000","11111","00000","00000","00000"]
  return GLYPHS[char] || GLYPHS[" "]
}

function pixelLine(text, centerX, y, maxWidth, maxScale, fill) {
  const value = normalize(text)
  if (!value) return ""

  const unitWidth = Math.max(1, value.length * 6 - 1)
  const scale = Math.max(3, Math.min(maxScale, Math.floor(maxWidth / unitWidth)))
  const width = unitWidth * scale
  let x = Math.round(centerX - width / 2)
  const blocks = []

  for (const char of value) {
    const glyph = glyphFor(char)
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if (glyph[row][col] === "1") {
          blocks.push(`<rect x="${x + col * scale}" y="${y + row * scale}" width="${scale}" height="${scale}" rx="${Math.max(0, Math.floor(scale / 5))}" fill="${fill}"/>`)
        }
      }
    }
    x += 6 * scale
  }

  return blocks.join("")
}

function pixelLines(lines, centerX, y, maxWidth, maxScale, gap, fill) {
  return (lines || []).map((line, index) => {
    const safe = normalize(line)
    const scale = Math.max(3, Math.min(maxScale, Math.floor(maxWidth / Math.max(1, safe.length * 6 - 1))))
    return pixelLine(safe, centerX, y + index * (7 * scale + gap), maxWidth, maxScale, fill)
  }).join("")
}

export function renderCardPng(card) {
  const isChance = String(card?.type || "") === "chance"
  const primary = isChance ? "#e87916" : "#1976d2"
  const dark = isChance ? "#9a3412" : "#0f4c9a"
  const light = isChance ? "#fff3e3" : "#eaf4ff"
  const label = isChance ? "KESEMPATAN" : "DANA UMUM"
  const title = normalize(card?.title || "KARTU")
  const body = normalize(card?.text || "IKUTI EFEK KARTU INI")
  const titleLines = wrapText(title, 18, 3)
  const bodyLines = wrapText(body, 31, 5)
  const titleSvg = pixelLines(titleLines, 540, 480, 780, 13, 26, "#ffffff")
  const bodySvg = pixelLines(bodyLines, 540, 760, 760, 8, 24, "#17324a")
  const footerId = normalize(String(card?.id || "MONOPOLI"))
  const icon = isChance
    ? `<path d="M540 206c-56 0-99 29-99 80 0 45 29 61 61 76 16 8 22 15 22 30v15h33v-18c0-33-16-48-43-61-24-12-39-24-39-48 0-27 25-42 63-42 28 0 54 11 76 28l21-45c-28-23-61-35-95-35zm-18 231v43h39v-43z" fill="#fff"/>`
    : `<g fill="#fff"><rect x="432" y="236" width="216" height="145" rx="18"/><path d="M432 272l108 80 108-80" fill="none" stroke="${primary}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/></g>`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${primary}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
      <filter id="s"><feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#000" flood-opacity=".28"/></filter>
    </defs>
    <rect width="1080" height="1350" fill="#0c1722"/>
    <g opacity=".22" fill="none" stroke="#fff" stroke-width="4"><circle cx="100" cy="96" r="140"/><circle cx="980" cy="1260" r="180"/><path d="M0 1100C250 920 390 1330 650 1100S930 930 1080 1050"/></g>
    <rect x="82" y="72" width="916" height="1206" rx="56" fill="${light}" filter="url(#s)"/>
    <path d="M82 238Q82 72 248 72h584q166 0 166 166v364H82z" fill="url(#g)"/>
    ${pixelLine("MONOPOLI INDONESIA", 540, 125, 690, 5, "#ffffff")}
    ${icon}
    ${pixelLine("KARTU " + label, 540, 425, 700, 6, "#ffffff")}
    ${titleSvg}
    <rect x="180" y="650" width="720" height="2" fill="${primary}" opacity=".35"/>
    ${bodySvg}
    <rect x="174" y="1035" width="732" height="128" rx="28" fill="#fff" stroke="${primary}" stroke-width="4"/>
    ${pixelLine("IKUTI EFEK KARTU INI", 540, 1065, 610, 5, dark)}
    ${pixelLine("KARTU ACAK PERMAINAN", 540, 1110, 570, 4, "#38556f")}
    ${pixelLine(footerId, 540, 1215, 570, 4, "#6c7b88")}
  </svg>`

  return new Resvg(svg, {
    fitTo: { mode: "width", value: 1080 }
  }).render().asPng()
}
