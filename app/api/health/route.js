import { json, optionsResponse } from "../../../lib/security"
import { statsEnabled } from "../../../lib/stats"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export function OPTIONS() {
  return optionsResponse()
}

export function GET() {
  return json({
    status: true,
    service: "arunika-api",
    version: "1.0.0",
    keyRequired: Boolean(String(process.env.API_KEY || "").trim()),
    statsConnected: statsEnabled()
  })
}
