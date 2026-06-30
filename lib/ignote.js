import fs from "fs"
import path from "path"
import { Resvg } from "@resvg/resvg-js"

const W = 864
const H = 1536

function esc(v = "") {
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function renderIgnote({ name = "Fauzann", time = "8 detik", text = "Halo semua" }) {
  const filePath = path.join(process.cwd(), "public", "ignote-template.png")
  const bg = fs.readFileSync(filePath).toString("base64")

  const safeName = esc(name).slice(0, 18)
  const safeTime = esc(time).slice(0, 12)
  const safeText = esc(text).slice(0, 40)

  const svg = `
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <image href="data:image/png;base64,${bg}" x="0" y="0" width="${W}" height="${H}"/>

    <text x="288" y="482" fill="#ffffff" font-size="34" font-family="Arial, sans-serif" font-weight="700">
      ${safeName}
    </text>

    <text x="440" y="482" fill="#a7adba" font-size="30" font-family="Arial, sans-serif" font-weight="600">
      • ${safeTime}
    </text>

    <text x="264" y="595" fill="#ffffff" font-size="32" font-family="Arial, sans-serif" font-weight="700">
      ${safeText}
    </text>
  </svg>
  `

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: W }
  })

  return resvg.render().asPng()
}
