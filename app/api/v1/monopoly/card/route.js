import { findCard } from "../../../../../lib/monopoly-core"
import { renderCardPng } from "../../../../../lib/monopoly-card-render"

import { recordRequest } from "../../../../../lib/stats"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function headers() {
  return { "access-control-allow-origin": "*", "cache-control": "no-store, max-age=0" }
}

function allowed(request) {
  const expected = String(process.env.MONOPOLY_API_KEY || process.env.API_KEY || "").trim()
  if (!expected) return true
  const url = new URL(request.url)
  return String(url.searchParams.get("apikey") || request.headers.get("x-api-key") || "").trim() === expected
}

export async function GET(request) {
  try {
    await recordRequest("monopoly_card")
    if (!allowed(request)) return Response.json({ ok: false, message: "API key tidak valid." }, { status: 401, headers: headers() })
    const url = new URL(request.url)
    const id = String(url.searchParams.get("id") || "").trim()
    const card = findCard(id)
    if (!card) return Response.json({ ok: false, message: "Kartu tidak ditemukan." }, { status: 404, headers: headers() })

    const png = renderCardPng(card)
    return new Response(png, {
      headers: {
        ...headers(),
        "content-type": "image/png",
        "content-length": String(png.length),
        "content-disposition": "inline; filename=" + card.id + ".png"
      }
    })
  } catch (error) {
    console.error("MONOPOLY_CARD_ERROR", error)
    return Response.json({ ok: false, message: "Gagal membuat gambar kartu." }, { status: 500, headers: headers() })
  }
}
