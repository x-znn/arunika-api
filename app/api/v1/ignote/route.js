import { parseIgnote, renderIgnote } from "../../../../lib/ignote"
import { optionsResponse, verifyApiKey, verifyRateLimit, json } from "../../../../lib/security"
import { recordRequest } from "../../../../lib/stats"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export function OPTIONS() {
  return optionsResponse()
}

export async function GET(request) {
  const limited = await verifyRateLimit(request)
  if (limited) return limited
  const unauthorized = verifyApiKey(request)
  if (unauthorized) return unauthorized

  await recordRequest("ignote")

  try {
    const url = new URL(request.url)
    const values = parseIgnote(url.searchParams)
    const png = renderIgnote(values)
    return new Response(png, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": String(png.length),
        "Cache-Control": "public, max-age=300",
        "Content-Disposition": "inline; filename=ignote.png",
        "Access-Control-Allow-Origin": "*"
      }
    })
  } catch (error) {
    console.error("IGNOTE_RENDER_ERROR", error)
    return json({ status: false, message: "Gagal membuat gambar ignote." }, 500)
  }
}
