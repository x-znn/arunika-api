import { findCard } from "../../../../../lib/monopoly-core"
import { renderCardPng } from "../../../../../lib/monopoly-card-render"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function authorized(request) {
  const expected = String(process.env.MONOPOLY_API_KEY || process.env.API_KEY || "").trim()
  if (!expected) return true
  const url = new URL(request.url)
  const supplied = String(
    url.searchParams.get("apikey") || request.headers.get("x-api-key") || ""
  ).trim()
  return supplied === expected
}

export async function GET(request) {
  try {
    if (!authorized(request)) {
      return Response.json({ ok: false, message: "API key tidak valid." }, { status: 401 })
    }

    const url = new URL(request.url)
    const id = String(url.searchParams.get("id") || "").trim()
    const card = findCard(id)

    if (!card) {
      return Response.json({ ok: false, message: "Kartu tidak ditemukan." }, { status: 404 })
    }

    const png = renderCardPng(card)

    return new Response(png, {
      headers: {
        "content-type": "image/png",
        "content-length": String(png.length),
        "cache-control": "no-store, max-age=0",
        "access-control-allow-origin": "*",
        "content-disposition": "inline; filename=" + card.id + ".png"
      }
    })
  } catch (error) {
    console.error("MONOPOLY_CARD_ERROR", error)
    return Response.json({ ok: false, message: "Gagal membuat gambar kartu." }, { status: 500 })
  }
}
