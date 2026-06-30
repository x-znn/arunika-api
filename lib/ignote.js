import { Resvg } from "@resvg/resvg-js"
import path from "node:path"

const GEIST_REGULAR = path.join(process.cwd(), "node_modules", "next", "dist", "compiled", "@vercel", "og", "Geist-Regular.ttf")

const W = 1080
const H = 1920

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function cleanText(value, max) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)
}

function wrapText(text, maxChars) {
  const words = text.split(/\s+/).filter(Boolean)
  if (!words.length) return ["..."]
  const lines = []
  let current = ""
  for (const word of words) {
    if (!current) {
      current = word
    } else if ((current + " " + word).length <= maxChars) {
      current += " " + word
    } else {
      lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  return lines.slice(0, 4)
}

function randomTime() {
  const values = ["2 detik", "3 detik", "5 detik", "8 detik", "12 detik", "18 detik", "27 detik", "39 detik"]
  return values[Math.floor(Math.random() * values.length)]
}

export function parseIgnote(searchParams) {
  return {
    name: cleanText(searchParams.get("name"), 32) || "Instagram user",
    text: cleanText(searchParams.get("text"), 120) || "halo semuanya",
    time: cleanText(searchParams.get("time"), 18) || randomTime()
  }
}

function createIgnoteSvg({ name, text, time }) {
  const safeName = escapeXml(name)
  const safeTime = escapeXml(time)
  const lines = wrapText(text, 30).map(escapeXml)
  const maxLineLength = Math.max(...lines.map((line) => line.length), 1)
  const bubbleWidth = Math.max(260, Math.min(620, 31 * maxLineLength + 98))
  const bubbleHeight = 102 + Math.max(0, lines.length - 1) * 56
  const bubbleX = 390
  const bubbleY = 542
  const textX = bubbleX + 40
  const textY = bubbleY + 66
  const messages = lines.map((line, index) => `<text x="${textX}" y="${textY + index * 56}" fill="#fbfbfc" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="500">${line}</text>`).join("")

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="bg" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#151518"/><stop offset="100%" stop-color="#050506"/></linearGradient>
      <linearGradient id="keyboard" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#252528"/><stop offset="100%" stop-color="#151518"/></linearGradient>
      <filter id="blur"><feGaussianBlur stdDeviation="26"/></filter>
    </defs>
    <rect width="1080" height="1920" fill="url(#bg)"/>
    <ellipse cx="820" cy="370" rx="430" ry="210" fill="#2d2d31" opacity=".24" filter="url(#blur)"/>
    <ellipse cx="220" cy="960" rx="390" ry="240" fill="#18181b" opacity=".58" filter="url(#blur)"/>
    <rect x="0" y="0" width="1080" height="190" fill="#101012"/>
    <path d="M90 90 L46 138 L90 184" fill="none" stroke="#f4f4f4" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="180" cy="139" r="49" fill="#2e2e32"/><circle cx="180" cy="139" r="39" fill="none" stroke="#59595e" stroke-width="2"/>
    <text x="250" y="129" fill="#fafafa" font-family="Arial, Helvetica, sans-serif" font-size="39" font-weight="700">Notes</text>
    <text x="250" y="170" fill="#a5a5aa" font-family="Arial, Helvetica, sans-serif" font-size="28">active now</text>
    <circle cx="970" cy="138" r="9" fill="#f4f4f4"/><circle cx="1004" cy="138" r="9" fill="#f4f4f4"/><circle cx="1038" cy="138" r="9" fill="#f4f4f4"/>
    <circle cx="162" cy="458" r="67" fill="#2d2d31"/><circle cx="162" cy="458" r="58" fill="none" stroke="#5d5d62" stroke-width="2"/>
    <circle cx="162" cy="442" r="17" fill="#6b6b70"/><path d="M117 504 C126 468 198 468 207 504" fill="#6b6b70"/>
    <text x="253" y="438" fill="#fafafa" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="700">${safeName}</text>
    <text x="253" y="482" fill="#aaaaaf" font-family="Arial, Helvetica, sans-serif" font-size="28">${safeTime}</text>
    <rect x="${bubbleX}" y="${bubbleY}" width="${bubbleWidth}" height="${bubbleHeight}" rx="50" fill="#303035"/>
    ${messages}
    <path d="M${bubbleX + bubbleWidth - 42} ${bubbleY + bubbleHeight - 10} C${bubbleX + bubbleWidth - 16} ${bubbleY + bubbleHeight + 6}, ${bubbleX + bubbleWidth + 4} ${bubbleY + bubbleHeight + 16}, ${bubbleX + bubbleWidth + 22} ${bubbleY + bubbleHeight + 18} C${bubbleX + bubbleWidth + 4} ${bubbleY + bubbleHeight - 5}, ${bubbleX + bubbleWidth - 13} ${bubbleY + bubbleHeight - 13}, ${bubbleX + bubbleWidth - 42} ${bubbleY + bubbleHeight - 10}" fill="#303035"/>
    <rect x="0" y="1430" width="1080" height="490" fill="url(#keyboard)"/>
    <rect x="45" y="1350" width="990" height="72" rx="36" fill="#2a2a2d"/>
    <circle cx="86" cy="1386" r="18" fill="none" stroke="#b1b1b5" stroke-width="3"/><path d="M73 1386 L99 1386 M86 1373 L86 1399" stroke="#b1b1b5" stroke-width="3" stroke-linecap="round"/>
    <text x="128" y="1397" fill="#a2a2a6" font-family="Arial, Helvetica, sans-serif" font-size="30">Kirim pesan...</text>
    <path d="M917 1395 C897 1380 901 1368 911 1368 C917 1368 920 1373 922 1379 C924 1373 927 1368 933 1368 C943 1368 947 1380 927 1395 L922 1400 Z" fill="#f5f5f5"/>
    <circle cx="979" cy="1386" r="20" fill="none" stroke="#f5f5f5" stroke-width="3"/><path d="M970 1393 L988 1375 M970 1375 L988 1393" stroke="#f5f5f5" stroke-width="3" stroke-linecap="round"/>
    <g fill="#38383c">
      <rect x="31" y="1490" width="88" height="86" rx="10"/><rect x="135" y="1490" width="88" height="86" rx="10"/><rect x="239" y="1490" width="88" height="86" rx="10"/><rect x="343" y="1490" width="88" height="86" rx="10"/><rect x="447" y="1490" width="88" height="86" rx="10"/><rect x="551" y="1490" width="88" height="86" rx="10"/><rect x="655" y="1490" width="88" height="86" rx="10"/><rect x="759" y="1490" width="88" height="86" rx="10"/><rect x="863" y="1490" width="88" height="86" rx="10"/><rect x="967" y="1490" width="82" height="86" rx="10"/>
      <rect x="83" y="1592" width="88" height="86" rx="10"/><rect x="187" y="1592" width="88" height="86" rx="10"/><rect x="291" y="1592" width="88" height="86" rx="10"/><rect x="395" y="1592" width="88" height="86" rx="10"/><rect x="499" y="1592" width="88" height="86" rx="10"/><rect x="603" y="1592" width="88" height="86" rx="10"/><rect x="707" y="1592" width="88" height="86" rx="10"/><rect x="811" y="1592" width="88" height="86" rx="10"/><rect x="915" y="1592" width="82" height="86" rx="10"/>
      <rect x="31" y="1694" width="143" height="86" rx="10"/><rect x="190" y="1694" width="88" height="86" rx="10"/><rect x="294" y="1694" width="88" height="86" rx="10"/><rect x="398" y="1694" width="88" height="86" rx="10"/><rect x="502" y="1694" width="88" height="86" rx="10"/><rect x="606" y="1694" width="88" height="86" rx="10"/><rect x="710" y="1694" width="88" height="86" rx="10"/><rect x="814" y="1694" width="235" height="86" rx="10"/>
    </g>
    <g fill="#f6f6f7" font-family="Arial, Helvetica, sans-serif" font-size="30" text-anchor="middle">
      <text x="75" y="1544">Q</text><text x="179" y="1544">W</text><text x="283" y="1544">E</text><text x="387" y="1544">R</text><text x="491" y="1544">T</text><text x="595" y="1544">Y</text><text x="699" y="1544">U</text><text x="803" y="1544">I</text><text x="907" y="1544">O</text><text x="1008" y="1544">P</text>
      <text x="127" y="1646">A</text><text x="231" y="1646">S</text><text x="335" y="1646">D</text><text x="439" y="1646">F</text><text x="543" y="1646">G</text><text x="647" y="1646">H</text><text x="751" y="1646">J</text><text x="855" y="1646">K</text><text x="956" y="1646">L</text>
      <text x="234" y="1748">Z</text><text x="338" y="1748">X</text><text x="442" y="1748">C</text><text x="546" y="1748">V</text><text x="650" y="1748">B</text><text x="754" y="1748">N</text><text x="931" y="1748">Kirim</text>
    </g>
    <rect x="398" y="1840" width="284" height="12" rx="6" fill="#f5f5f5" opacity=".9"/>
  </svg>`
}

export function renderIgnote(values) {
  const renderer = new Resvg(createIgnoteSvg(values), {
    fitTo: { mode: "width", value: W },
    background: "#000000",
    font: {
      fontFiles: [GEIST_REGULAR],
      loadSystemFonts: false,
      defaultFontFamily: "Geist",
      sansSerifFamily: "Geist"
    }
  })
  return renderer.render().asPng()
}
