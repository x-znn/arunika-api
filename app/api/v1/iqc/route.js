import { optionsResponse, verifyRateLimit, json } from "../../../../lib/security"
import { recordRequest } from "../../../../lib/stats"
import { renderIqc } from "../../../../lib/iqc"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

export function OPTIONS() {
  return optionsResponse()
}

function fail(message, status = 400) {
  return json({ status: false, message }, status)
}

function clean(value, max = 400) {
  return String(value == null ? "" : value)
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, max)
}

function imageResponse(png) {
  return new Response(png, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Length": String(png.length),
      "Content-Disposition": "inline; filename=iqc.png",
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": "*",
      "X-Content-Type-Options": "nosniff"
    }
  })
}

export async function GET(request) {
  const limited = await verifyRateLimit(request)
  if (limited) return limited

  try {
    const url = new URL(request.url)
    const result = await renderIqc(clean(url.searchParams.get("text")))
    await recordRequest("iqc")
    return imageResponse(result.png)
  } catch (error) {
    return fail(clean(error?.message || "Gagal membuat IQC."), 400)
  }
}

export async function POST(request) {
  const limited = await verifyRateLimit(request)
  if (limited) return limited

  let body
  try {
    body = await request.json()
  } catch {
    return fail("Body request harus berupa JSON valid.")
  }

  try {
    const result = await renderIqc(clean(body?.text))
    await recordRequest("iqc")
    return imageResponse(result.png)
  } catch (error) {
    return fail(clean(error?.message || "Gagal membuat IQC."), 400)
  }
}
