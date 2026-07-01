import { Resvg } from "@resvg/resvg-js"

const GLYPHS = {
  A:["01110","10001","10001","11111","10001","10001","10001"], B:["11110","10001","10001","11110","10001","10001","11110"], C:["01110","10001","10000","10000","10000","10001","01110"], D:["11110","10001","10001","10001","10001","10001","11110"], E:["11111","10000","10000","11110","10000","10000","11111"], F:["11111","10000","10000","11110","10000","10000","10000"], G:["01110","10001","10000","10111","10001","10001","01110"], H:["10001","10001","10001","11111","10001","10001","10001"], I:["11111","00100","00100","00100","00100","00100","11111"], J:["00111","00010","00010","00010","10010","10010","01100"], K:["10001","10010","10100","11000","10100","10010","10001"], L:["10000","10000","10000","10000","10000","10000","11111"], M:["10001","11011","10101","10101","10001","10001","10001"], N:["10001","11001","10101","10011","10001","10001","10001"], O:["01110","10001","10001","10001","10001","10001","01110"], P:["11110","10001","10001","11110","10000","10000","10000"], Q:["01110","10001","10001","10001","10101","10010","01101"], R:["11110","10001","10001","11110","10100","10010","10001"], S:["01111","10000","10000","01110","00001","00001","11110"], T:["11111","00100","00100","00100","00100","00100","00100"], U:["10001","10001","10001","10001","10001","10001","01110"], V:["10001","10001","10001","10001","10001","01010","00100"], W:["10001","10001","10001","10101","10101","10101","01010"], X:["10001","10001","01010","00100","01010","10001","10001"], Y:["10001","10001","01010","00100","00100","00100","00100"], Z:["11111","00001","00010","00100","01000","10000","11111"],
  0:["01110","10001","10011","10101","11001","10001","01110"], 1:["00100","01100","00100","00100","00100","00100","01110"], 2:["01110","10001","00001","00010","00100","01000","11111"], 3:["11110","00001","00001","01110","00001","00001","11110"], 4:["00010","00110","01010","10010","11111","00010","00010"], 5:["11111","10000","10000","11110","00001","00001","11110"], 6:["01110","10000","10000","11110","10001","10001","01110"], 7:["11111","00001","00010","00100","01000","01000","01000"], 8:["01110","10001","10001","01110","10001","10001","01110"], 9:["01110","10001","10001","01111","00001","00001","01110"],
  " ":["00000","00000","00000","00000","00000","00000","00000"], ".":["00000","00000","00000","00000","00000","00110","00110"], ",":["00000","00000","00000","00000","00000","00110","00100"], ":":["00000","00110","00110","00000","00110","00110","00000"], "-":["00000","00000","00000","11111","00000","00000","00000"], "+":["00000","00100","00100","11111","00100","00100","00000"], "/":["00001","00010","00100","01000","10000","00000","00000"], "?":["01110","10001","00001","00010","00100","00000","00100"], "!":["00100","00100","00100","00100","00100","00000","00100"], "(":["00010","00100","01000","01000","01000","00100","00010"], ")":["01000","00100","00010","00010","00010","00100","01000"]
}

function normalize(value) {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[ÀÁÂÃÄÅ]/g, "A")
    .replace(/[ÈÉÊË]/g, "E")
    .replace(/[ÌÍÎÏ]/g, "I")
    .replace(/[ÒÓÔÕÖ]/g, "O")
    .replace(/[ÙÚÛÜ]/g, "U")
    .replace(/Ñ/g, "N")
    .replace(/×/g, "X")
    .replace(/[–—]/g, "-")
    .replace(/[^A-Z0-9 .,:+\-\/?!()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function lines(value, chars, limit) {
  const words = normalize(value).split(" ").filter(Boolean)
  const out = []
  let row = ""
  words.forEach((word) => {
    const next = row ? row + " " + word : word
    if (!row || next.length <= chars) row = next
    else {
      out.push(row)
      row = word
    }
  })
  if (row) out.push(row)
  return out.slice(0, limit)
}

function glyph(char) {
  return GLYPHS[char] || GLYPHS[" "]
}

function pixelText(value, centerX, topY, width, maxScale, fill) {
  const text = normalize(value)
  if (!text) return ""
  const units = Math.max(1, text.length * 6 - 1)
  const scale = Math.max(2, Math.min(maxScale, Math.floor(width / units)))
  let x = Math.round(centerX - (units * scale) / 2)
  const blocks = []
  for (const char of text) {
    const rows = glyph(char)
    for (let r = 0; r < 7; r += 1) {
      for (let c = 0; c < 5; c += 1) {
        if (rows[r][c] === "1") blocks.push(`<rect x="${x + c * scale}" y="${topY + r * scale}" width="${scale}" height="${scale}" rx="${Math.max(0, Math.floor(scale / 5))}" fill="${fill}"/>`)
      }
    }
    x += 6 * scale
  }
  return blocks.join("")
}

function pixelLines(items, centerX, startY, width, maxScale, gap, fill) {
  let y = startY
  return (items || []).map((item) => {
    const text = normalize(item)
    const units = Math.max(1, text.length * 6 - 1)
    const scale = Math.max(2, Math.min(maxScale, Math.floor(width / units)))
    const svg = pixelText(text, centerX, y, width, maxScale, fill)
    y += 7 * scale + gap
    return svg
  }).join("")
}

function chanceIcon(primary) {
  return `<g transform="translate(370 240)">
    <circle cx="80" cy="80" r="78" fill="#fff7e8" stroke="#392006" stroke-width="7"/>
    <path d="M80 34c-31 0-54 17-54 45 0 23 14 33 34 42 13 6 17 11 17 21v10h13v-12c0-19-9-27-27-35-16-7-25-15-25-29 0-17 16-27 40-27 18 0 35 7 48 19l13-29c-16-14-37-22-59-22zm-11 139v27h22v-27z" fill="${primary}"/>
  </g>`
}

function communityIcon(primary) {
  return `<g transform="translate(330 255)">
    <rect x="0" y="36" width="240" height="142" rx="15" fill="#f7fbff" stroke="#092e5d" stroke-width="7"/>
    <path d="M0 57L120 142 240 57" fill="none" stroke="${primary}" stroke-width="16" stroke-linejoin="round"/>
    <path d="M48 36V5H192V36" fill="none" stroke="#092e5d" stroke-width="12" stroke-linecap="round"/>
  </g>`
}

export function renderCardPng(card) {
  const isChance = String(card?.type || "") === "chance"
  const primary = isChance ? "#e87916" : "#1d69c8"
  const dark = isChance ? "#a43a05" : "#114983"
  const paper = isChance ? "#fff4df" : "#eaf5ff"
  const label = isChance ? "KESEMPATAN" : "DANA UMUM"
  const titleLines = lines(card?.title || "KARTU", 16, 3)
  const bodyLines = lines(card?.text || "IKUTI EFEK KARTU INI", 28, 5)
  const titleSvg = pixelLines(titleLines, 450, 550, 710, 12, 26, "#ffffff")
  const bodySvg = pixelLines(bodyLines, 450, 795, 690, 7, 23, "#26374b")
  const id = normalize(card?.id || "MONOPOLI")

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1350" viewBox="0 0 900 1350">
    <rect width="900" height="1350" fill="${paper}"/>
    <rect x="26" y="26" width="848" height="1298" rx="10" fill="none" stroke="#1d1d1d" stroke-width="9"/>
    <rect x="47" y="47" width="806" height="372" rx="3" fill="${primary}"/>
    <path d="M47 350L853 270V419H47Z" fill="${dark}" opacity=".22"/>
    ${isChance ? chanceIcon(primary) : communityIcon(primary)}
    ${pixelText(label, 450, 92, 590, 8, "#ffffff")}
    ${pixelText("KARTU MONOPOLI", 450, 150, 540, 5, "#fff6e6")}
    <rect x="89" y="465" width="722" height="258" rx="12" fill="${primary}"/>
    ${titleSvg}
    <path d="M120 748H780" stroke="${primary}" stroke-width="5"/>
    ${bodySvg}
    <rect x="132" y="1125" width="636" height="102" rx="9" fill="#ffffff" stroke="${primary}" stroke-width="5"/>
    ${pixelText("IKUTI EFEK KARTU INI", 450, 1152, 530, 5, dark)}
    ${pixelText(id, 450, 1260, 560, 4, "#596a7c")}
  </svg>`

  return new Resvg(svg, { fitTo: { mode: "width", value: 900 } }).render().asPng()
}
