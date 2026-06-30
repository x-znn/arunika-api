import { parseIgnote } from "../../../../../lib/ignote"
import { optionsResponse, verifyApiKey, verifyRateLimit, json } from "../../../../../lib/security"

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

  const url = new URL(request.url)
  const values = parseIgnote(url.searchParams)
  const imageUrl = new URL("/api/v1/ignote", url.origin)
  imageUrl.searchParams.set("name", values.name)
  imageUrl.searchParams.set("text", values.text)
  imageUrl.searchParams.set("time", values.time)
  const apiKey = url.searchParams.get("apikey")
  if (apiKey) imageUrl.searchParams.set("apikey", apiKey)

  return json({
    status: true,
    creator: "Arunika API",
    result: { ...values, image: imageUrl.toString() }
  })
}
