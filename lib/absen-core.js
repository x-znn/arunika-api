export const WIB_OFFSET_MS = 7 * 60 * 60 * 1000
export const RESET_HOUR_WIB = 5
export const DEFAULT_LATE_TIME = "09:00"

export function clean(value, max = 180) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)
}

export function nowMs() {
  return Date.now()
}

function pad(value) {
  return String(value).padStart(2, "0")
}

export function parseLateTime(value) {
  const match = String(value ?? "").trim().match(/^(\d{1,2}):(\d{2})$/)

  if (!match) return null

  const hour = Number(match[1])
  const minute = Number(match[2])

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null
  if (hour < RESET_HOUR_WIB || hour > 23 || minute < 0 || minute > 59) return null

  return {
    hour,
    minute,
    value: pad(hour) + ":" + pad(minute)
  }
}

export function normalizeLateTime(value) {
  return parseLateTime(value)?.value || DEFAULT_LATE_TIME
}

export function wibParts(timestamp = nowMs()) {
  const date = new Date(Number(timestamp) + WIB_OFFSET_MS)

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    second: date.getUTCSeconds()
  }
}

export function toWibTimestamp(year, month, day, hour = 0, minute = 0, second = 0) {
  return Date.UTC(year, month, day, hour, minute, second, 0) - WIB_OFFSET_MS
}

function calendarParts(year, month, day) {
  const date = new Date(Date.UTC(year, month, day))

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate()
  }
}

export function dateKeyFromParts(parts) {
  return String(parts.year) + "-" + pad(parts.month + 1) + "-" + pad(parts.day)
}

export function parseDateKey(value) {
  const match = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  const check = calendarParts(year, month, day)

  if (check.year !== year || check.month !== month || check.day !== day) return null

  return check
}

export function attendanceWindow(timestamp = nowMs()) {
  const current = wibParts(timestamp)
  const todayResetAt = toWibTimestamp(
    current.year,
    current.month,
    current.day,
    RESET_HOUR_WIB,
    0,
    0
  )

  if (timestamp < todayResetAt) {
    const previous = calendarParts(current.year, current.month, current.day - 1)

    return {
      date: dateKeyFromParts(previous),
      startedAt: toWibTimestamp(
        previous.year,
        previous.month,
        previous.day,
        RESET_HOUR_WIB,
        0,
        0
      ),
      resetAt: todayResetAt
    }
  }

  const next = calendarParts(current.year, current.month, current.day + 1)

  return {
    date: dateKeyFromParts(current),
    startedAt: todayResetAt,
    resetAt: toWibTimestamp(
      next.year,
      next.month,
      next.day,
      RESET_HOUR_WIB,
      0,
      0
    )
  }
}

export function lateAtForDate(dateKey, lateTime) {
  const date = parseDateKey(dateKey)
  const time = parseLateTime(lateTime)

  if (!date || !time) return 0

  return toWibTimestamp(
    date.year,
    date.month,
    date.day,
    time.hour,
    time.minute,
    0
  )
}

export function createSession(room, lateTime = DEFAULT_LATE_TIME, timestamp = nowMs()) {
  const window = attendanceWindow(timestamp)
  const safeLateTime = normalizeLateTime(lateTime)

  return {
    version: 1,
    room: String(room || ""),
    date: window.date,
    startedAt: window.startedAt,
    resetAt: window.resetAt,
    lateTime: safeLateTime,
    lateAt: lateAtForDate(window.date, safeLateTime),
    createdAt: timestamp,
    updatedAt: timestamp
  }
}

export function normalizeSession(value, room, lateTime = DEFAULT_LATE_TIME, timestamp = nowMs()) {
  if (!value || typeof value !== "object") {
    return createSession(room, lateTime, timestamp)
  }

  const expected = attendanceWindow(timestamp)
  const savedDate = clean(value.date, 16)
  const safeLateTime = normalizeLateTime(lateTime)

  if (
    savedDate !== expected.date ||
    Number(value.resetAt) <= timestamp ||
    String(value.room || "") !== String(room || "")
  ) {
    return createSession(room, safeLateTime, timestamp)
  }

  return {
    version: 1,
    room: String(room || ""),
    date: expected.date,
    startedAt: Number(value.startedAt) || expected.startedAt,
    resetAt: expected.resetAt,
    lateTime: safeLateTime,
    lateAt: lateAtForDate(expected.date, safeLateTime),
    createdAt: Number(value.createdAt) || timestamp,
    updatedAt: timestamp
  }
}

export function normalizeRecord(value = {}) {
  const status = ["hadir", "telat", "izin", "sakit"].includes(value.status)
    ? value.status
    : "hadir"

  return {
    jid: String(value.jid || ""),
    name: clean(value.name, 24) || "Peserta",
    status,
    reason: clean(value.reason, 160),
    timestamp: Math.max(0, Number(value.timestamp) || nowMs()),
    lateMinutes: Math.max(0, Number(value.lateMinutes) || 0),
    order: Math.max(1, Number(value.order) || 1)
  }
}

export function countRecords(records = []) {
  const counts = {
    hadir: 0,
    telat: 0,
    izin: 0,
    sakit: 0,
    total: 0
  }

  records.forEach((record) => {
    const status = String(record?.status || "")
    if (!["hadir", "telat", "izin", "sakit"].includes(status)) return

    counts[status] += 1
    counts.total += 1
  })

  return counts
}

export function statusLabel(value) {
  const labels = {
    hadir: "Hadir",
    telat: "Telat",
    izin: "Izin",
    sakit: "Sakit"
  }

  return labels[String(value || "")] || "-"
}
