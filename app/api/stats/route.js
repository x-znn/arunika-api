import { getApiStats } from "../../../lib/stats"
import { json, optionsResponse } from "../../../lib/security"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export function OPTIONS() {
  return optionsResponse()
}

export async function GET() {
  const stats = await getApiStats()
  return json({ status: true, service: "arunika-api", result: stats })
}
