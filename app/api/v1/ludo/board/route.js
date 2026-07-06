import { renderLudoBoard } from "../../../../../lib/ludo-board"
import { normalizeRoom } from "../../../../../lib/ludo-core"

import { recordRequest } from "../../../../../lib/stats"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const PREFIX = "arunika:ludo:v1:room:"
const FINAL_PREFIX = "arunika:ludo:v1:final:"

function apiAllowed(request, payload = {}) {
  const expected = String(
    process.env.LUDO_API_KEY ||
    process.env.API_KEY ||
    ""
  ).trim()

  if (!expected) {
    return true
  }

  const provided = String(
    payload.apikey ||
    request.headers.get("x-api-key") ||
    ""
  ).trim()

  return provided === expected
}

async function getRoom(roomId, useFinal) {
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
      ? FINAL_PREFIX
      : PREFIX
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

  if (!response.ok || data?.[0]?.error) {
    throw new Error(
      data?.[0]?.error ||
      "Upstash request gagal."
    )
  }

  const raw = data?.[0]?.result

  if (!raw) {
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

export async function GET(request) {
  try {
    await recordRequest("ludo_board")
    const url = new URL(request.url)
    const query = Object.fromEntries(
      url.searchParams.entries()
    )

    if (!apiAllowed(request, query)) {
      return Response.json(
        {
          ok: false,
          message: "Invalid API key"
        },
        {
          status: 401
        }
      )
    }

    const roomId = String(query.room || "").trim()
    const useFinal = String(query.final || "") === "1"

    if (!roomId) {
      return Response.json(
        {
          ok: false,
          message: "Parameter room wajib diisi."
        },
        {
          status: 400
        }
      )
    }

    const room = await getRoom(roomId, useFinal)

    if (!room) {
      return Response.json(
        {
          ok: false,
          message: useFinal
            ? "Board akhir Ludo sudah kedaluwarsa."
            : "Room tidak ditemukan."
        },
        {
          status: 404
        }
      )
    }

    const png = renderLudoBoard(room)

    return new Response(png, {
      status: 200,
      headers: {
        "content-type": "image/png",
        "cache-control": "no-store, max-age=0",
        "access-control-allow-origin": "*"
      }
    })
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message:
          error.message ||
          "Gagal merender Ludo board"
      },
      {
        status: 500
      }
    )
  }
}
