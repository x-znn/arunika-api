import { normalizeRoom } from "../../../../../lib/monopoly-core"
import { renderMonopolyBoard } from "../../../../../lib/monopoly-board-render"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const KEY_PREFIX = "arunika:monopoly:v2:room:"
const FINAL_KEY_PREFIX = "arunika:monopoly:v2:final:"

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "Content-Type, X-API-Key"
  }
}

function allowed(request) {
  const expected = String(
    process.env.MONOPOLY_API_KEY ||
    process.env.API_KEY ||
    ""
  ).trim()

  if (!expected) return true

  const url = new URL(request.url)

  return String(
    url.searchParams.get("apikey") ||
    request.headers.get("x-api-key") ||
    ""
  ).trim() === expected
}

async function readRoom(roomId, useFinal) {
  const url = String(
    process.env.UPSTASH_REDIS_REST_URL || ""
  ).replace(/\/$/, "")

  const token = String(
    process.env.UPSTASH_REDIS_REST_TOKEN || ""
  )

  if (!url || !token) {
    throw new Error("Upstash belum dikonfigurasi di Vercel.")
  }

  const key = (
    useFinal
      ? FINAL_KEY_PREFIX
      : KEY_PREFIX
  ) + roomId

  const response = await fetch(url + "/pipeline", {
    method: "POST",
    headers: {
      authorization: "Bearer " + token,
      "content-type": "application/json"
    },
    body: JSON.stringify([["GET", key]]),
    cache: "no-store"
  })

  const data = await response.json().catch(() => null)
  const raw = Array.isArray(data)
    ? data[0]?.result
    : null

  if (!response.ok || !raw) {
    return null
  }

  try {
    return normalizeRoom(
      typeof raw === "string"
        ? JSON.parse(raw)
        : raw
    )
  } catch {
    return null
  }
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  })
}

export async function GET(request) {
  try {
    if (!allowed(request)) {
      return Response.json(
        {
          ok: false,
          message: "API key tidak valid."
        },
        {
          status: 401,
          headers: corsHeaders()
        }
      )
    }

    const url = new URL(request.url)
    const roomId = String(
      url.searchParams.get("room") ||
      ""
    ).trim()

    const useFinal = String(
      url.searchParams.get("final") ||
      ""
    ) === "1"

    if (!roomId) {
      return Response.json(
        {
          ok: false,
          message: "Parameter room wajib diisi."
        },
        {
          status: 400,
          headers: corsHeaders()
        }
      )
    }

    const room = await readRoom(roomId, useFinal)

    if (!room) {
      return Response.json(
        {
          ok: false,
          message: useFinal
            ? "Board akhir Monopoli sudah kedaluwarsa."
            : "Room Monopoli tidak ditemukan."
        },
        {
          status: 404,
          headers: corsHeaders()
        }
      )
    }

    const png = renderMonopolyBoard(room)

    return new Response(png, {
      headers: {
        ...corsHeaders(),
        "content-type": "image/png",
        "content-length": String(png.length),
        "cache-control": "no-store, max-age=0",
        "content-disposition":
          "inline; filename=monopoly-board.png"
      }
    })
  } catch (error) {
    console.error("MONOPOLY_BOARD_ERROR", error)

    return Response.json(
      {
        ok: false,
        message: "Gagal membuat papan Monopoli."
      },
      {
        status: 500,
        headers: corsHeaders()
      }
    )
  }
}
