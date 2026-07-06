import {
  clean,
  countRecords,
  createSession,
  lateAtForDate,
  normalizeLateTime,
  normalizeRecord,
  normalizeSession,
  nowMs,
  parseLateTime,
  statusLabel
} from "../../../../lib/absen-core"

import { recordRequest } from "../../../../lib/stats"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const CONFIG_PREFIX = "arunika:absen:v1:config:"
const SESSION_PREFIX = "arunika:absen:v1:session:"
const RECORDS_PREFIX = "arunika:absen:v1:records:"
const CONFIG_TTL_SECONDS = 60 * 60 * 24 * 365 * 5
const SESSION_TTL_SECONDS = 60 * 60 * 72

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "Content-Type, X-API-Key"
  }
}

function json(body, status = 200) {
  return Response.json(body, { status, headers: corsHeaders() })
}

function fail(message, status = 400, extra = {}) {
  return json({
    ok: false,
    message: clean(message, 220) || "Request absen gagal.",
    ...extra
  }, status)
}

function apiAllowed(request, payload = {}) {
  const expected = String(
    process.env.ABSEN_API_KEY ||
    process.env.API_KEY ||
    ""
  ).trim()

  if (!expected) return true

  const supplied = String(
    payload.apikey ||
    request.headers.get("x-api-key") ||
    ""
  ).trim()

  return supplied === expected
}

function redisConfig() {
  const url = String(
    process.env.UPSTASH_REDIS_REST_URL ||
    ""
  ).replace(/\/$/, "")
  const token = String(process.env.UPSTASH_REDIS_REST_TOKEN || "")

  if (!url || !token) {
    throw new Error("Upstash belum dikonfigurasi di Vercel.")
  }

  return { url, token }
}

async function redis(command, args = []) {
  const { url, token } = redisConfig()
  const response = await fetch(url + "/pipeline", {
    method: "POST",
    headers: {
      authorization: "Bearer " + token,
      "content-type": "application/json"
    },
    body: JSON.stringify([[command, ...args]]),
    cache: "no-store"
  })

  const data = await response.json().catch(() => null)

  if (!response.ok || !Array.isArray(data) || data[0]?.error) {
    throw new Error(data?.[0]?.error || "Upstash request gagal.")
  }

  return data[0]?.result ?? null
}

function configKey(room) {
  return CONFIG_PREFIX + String(room || "")
}

function sessionKey(room) {
  return SESSION_PREFIX + String(room || "")
}

function recordsKey(room, date) {
  return RECORDS_PREFIX + String(room || "") + ":" + String(date || "")
}

function parseJson(value) {
  if (!value) return null

  try {
    return typeof value === "string" ? JSON.parse(value) : value
  } catch {
    return null
  }
}

function normalizeHash(value) {
  if (!value) return {}

  if (Array.isArray(value)) {
    const result = {}

    for (let index = 0; index < value.length; index += 2) {
      const key = String(value[index] || "")
      if (key) result[key] = value[index + 1]
    }

    return result
  }

  return typeof value === "object" ? value : {}
}

function recordsFromHash(value) {
  const hash = normalizeHash(value)

  return Object.values(hash)
    .map((entry) => normalizeRecord(parseJson(entry) || entry))
    .filter((entry) => entry.jid)
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order
      return a.timestamp - b.timestamp
    })
}

async function readConfig(room) {
  const saved = parseJson(await redis("GET", [configKey(room)]))

  return {
    room: String(room || ""),
    lateTime: normalizeLateTime(saved?.lateTime),
    createdAt: Number(saved?.createdAt) || nowMs(),
    updatedAt: Number(saved?.updatedAt) || nowMs()
  }
}

async function saveConfig(config) {
  const saved = {
    room: String(config.room || ""),
    lateTime: normalizeLateTime(config.lateTime),
    createdAt: Number(config.createdAt) || nowMs(),
    updatedAt: nowMs()
  }

  await redis("SET", [
    configKey(saved.room),
    JSON.stringify(saved),
    "EX",
    String(CONFIG_TTL_SECONDS)
  ])

  return saved
}

async function readSession(room) {
  return parseJson(await redis("GET", [sessionKey(room)]))
}

async function saveSession(session) {
  const saved = {
    ...session,
    updatedAt: nowMs()
  }

  await redis("SET", [
    sessionKey(saved.room),
    JSON.stringify(saved),
    "EX",
    String(SESSION_TTL_SECONDS)
  ])

  return saved
}

async function ensureSession(room, config, timestamp = nowMs()) {
  const saved = await readSession(room)
  const session = normalizeSession(saved, room, config.lateTime, timestamp)

  const changed = !saved ||
    String(saved.date || "") !== session.date ||
    Number(saved.resetAt) !== session.resetAt ||
    String(saved.lateTime || "") !== session.lateTime ||
    Number(saved.lateAt) !== session.lateAt

  if (changed) {
    await saveSession(session)
  }

  return session
}

async function readRecords(room, date) {
  const raw = await redis("HGETALL", [recordsKey(room, date)])
  return recordsFromHash(raw)
}

async function readRecord(room, date, sender) {
  const raw = await redis("HGET", [recordsKey(room, date), sender])
  const value = parseJson(raw)
  return value ? normalizeRecord(value) : null
}

async function insertRecord(room, date, sender, record) {
  const stored = await redis("HSETNX", [
    recordsKey(room, date),
    sender,
    JSON.stringify(record)
  ])

  if (Number(stored) === 1) {
    await redis("EXPIRE", [
      recordsKey(room, date),
      String(SESSION_TTL_SECONDS)
    ])

    return true
  }

  return false
}

function publicRecord(record) {
  if (!record) return null

  return {
    jid: String(record.jid || ""),
    name: clean(record.name, 24) || "Peserta",
    status: record.status,
    statusLabel: statusLabel(record.status),
    reason: clean(record.reason, 160),
    timestamp: Number(record.timestamp) || 0,
    lateMinutes: Math.max(0, Number(record.lateMinutes) || 0),
    order: Math.max(1, Number(record.order) || 1)
  }
}

function publicAttendance(session, records) {
  const safeRecords = Array.isArray(records)
    ? records.map(publicRecord).filter(Boolean)
    : []

  return {
    room: String(session.room || ""),
    date: String(session.date || ""),
    startedAt: Number(session.startedAt) || 0,
    resetAt: Number(session.resetAt) || 0,
    lateTime: String(session.lateTime || "09:00"),
    lateAt: Number(session.lateAt) || 0,
    counts: countRecords(safeRecords),
    records: safeRecords
  }
}

async function attendanceSnapshot(room, config, timestamp = nowMs()) {
  const session = await ensureSession(room, config, timestamp)
  const records = await readRecords(room, session.date)

  return {
    session,
    records,
    attendance: publicAttendance(session, records)
  }
}

function canManage(payload) {
  return Boolean(payload.isGroupAdmin) || Boolean(payload.isOwner)
}

function validReason(value) {
  return clean(value, 160)
}

function makeRecord(sender, name, status, reason, session, order, timestamp) {
  const isLate = status === "hadir" && timestamp >= session.lateAt
  const finalStatus = isLate ? "telat" : status
  const lateMinutes = isLate
    ? Math.max(0, Math.floor((timestamp - session.lateAt) / 60000))
    : 0

  return normalizeRecord({
    jid: sender,
    name,
    status: finalStatus,
    reason: finalStatus === "izin" || finalStatus === "sakit" ? reason : "",
    timestamp,
    lateMinutes,
    order
  })
}

function respond(attendance, extra = {}) {
  return json({
    ok: true,
    attendance,
    ...extra
  })
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  })
}

export async function GET(request) {
  try {
    await recordRequest("absen")
    const url = new URL(request.url)
    const room = String(url.searchParams.get("room") || "").trim()

    if (!room) return fail("Parameter room wajib diisi.")

    if (!apiAllowed(request, { apikey: url.searchParams.get("apikey") })) {
      return fail("API key tidak valid.", 401)
    }

    const config = await readConfig(room)
    const snapshot = await attendanceSnapshot(room, config)

    return respond(snapshot.attendance, {
      message: "Status absen berhasil dibaca."
    })
  } catch (error) {
    console.error("ABSEN_GET_ERROR", error)
    return fail(error?.message || "Gagal membaca data absen.", 500)
  }
}

export async function POST(request) {
  try {
    await recordRequest("absen")
    const payload = await request.json().catch(() => ({}))

    if (!apiAllowed(request, payload)) {
      return fail("API key tidak valid.", 401)
    }

    const action = String(payload.action || "").trim().toLowerCase()
    const room = String(payload.room || payload.chatId || "").trim()
    const sender = String(payload.sender || "").trim()
    const name = clean(payload.name, 24) || "Peserta"

    if (!room || !sender) {
      return fail("Data grup atau pengirim tidak lengkap.")
    }

    if (!action) {
      return fail("Aksi absen belum dipilih.")
    }

    let config = await readConfig(room)

    if (action === "setjam") {
      if (!canManage(payload)) {
        return fail("Hanya admin grup atau owner bot yang dapat mengatur jam telat.", 403)
      }

      const requested = parseLateTime(payload.lateTime)

      if (!requested) {
        return fail("Format jam tidak valid. Gunakan HH:MM dari 05:00 sampai 23:59 WIB.")
      }

      config = await saveConfig({
        ...config,
        lateTime: requested.value
      })

      const snapshot = await attendanceSnapshot(room, config)

      return respond(snapshot.attendance, {
        settings: { lateTime: config.lateTime },
        message: "Batas telat diubah menjadi " + config.lateTime + " WIB."
      })
    }

    const snapshot = await attendanceSnapshot(room, config)

    if (action === "jadwal") {
      return respond(snapshot.attendance, {
        settings: { lateTime: config.lateTime },
        message: "Jadwal absen berhasil dibaca."
      })
    }

    if (action === "status") {
      const record = await readRecord(room, snapshot.session.date, sender)

      return respond(snapshot.attendance, {
        record: publicRecord(record),
        message: record
          ? "Status absen kamu berhasil dibaca."
          : "Kamu belum absen pada periode ini."
      })
    }

    if (action === "rekap") {
      if (!canManage(payload)) {
        return fail("Hanya admin grup atau owner bot yang dapat melihat rekap lengkap.", 403)
      }

      return respond(snapshot.attendance, {
        message: "Rekap absen berhasil dibaca."
      })
    }

    if (action === "reset") {
      if (!canManage(payload)) {
        return fail("Hanya admin grup atau owner bot yang dapat mereset absen.", 403)
      }

      await redis("DEL", [recordsKey(room, snapshot.session.date)])
      const session = await saveSession({
        ...snapshot.session,
        lateTime: config.lateTime,
        lateAt: lateAtForDate(snapshot.session.date, config.lateTime),
        createdAt: nowMs()
      })

      return respond(publicAttendance(session, []), {
        message: "Absen periode ini berhasil direset."
      })
    }

    if (!["hadir", "izin", "sakit"].includes(action)) {
      return fail("Aksi absen tidak dikenal.")
    }

    const reason = validReason(payload.reason)

    if ((action === "izin" || action === "sakit") && !reason) {
      return fail("Keterangan untuk izin atau sakit wajib diisi.")
    }

    const existing = await readRecord(room, snapshot.session.date, sender)

    if (existing) {
      return fail(
        "Kamu sudah absen hari ini sebagai " + statusLabel(existing.status) + ". Satu nomor hanya dapat absen satu kali per periode.",
        409,
        {
          attendance: snapshot.attendance,
          record: publicRecord(existing)
        }
      )
    }

    const timestamp = nowMs()
    const record = makeRecord(
      sender,
      name,
      action,
      reason,
      snapshot.session,
      snapshot.records.length + 1,
      timestamp
    )

    const inserted = await insertRecord(room, snapshot.session.date, sender, record)

    if (!inserted) {
      const already = await readRecord(room, snapshot.session.date, sender)
      const latest = await attendanceSnapshot(room, config)

      return fail(
        "Kamu sudah absen hari ini sebagai " + statusLabel(already?.status) + ". Satu nomor hanya dapat absen satu kali per periode.",
        409,
        {
          attendance: latest.attendance,
          record: publicRecord(already)
        }
      )
    }

    const latest = await attendanceSnapshot(room, config)

    return respond(latest.attendance, {
      record: publicRecord(record),
      message: "Absen " + statusLabel(record.status) + " berhasil dicatat."
    })
  } catch (error) {
    console.error("ABSEN_POST_ERROR", error)
    return fail(error?.message || "Gagal memproses absen.", 500)
  }
}
