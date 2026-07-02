export const MIN_PLAYERS = 4
export const MAX_PLAYERS = 12

export const WORD_PAIRS = [
  { category: "Makanan & Minuman", civilian: "Kopi", spy: "Teh" },
  { category: "Makanan & Minuman", civilian: "Bakso", spy: "Soto" },
  { category: "Makanan & Minuman", civilian: "Sate", spy: "Rendang" },
  { category: "Makanan & Minuman", civilian: "Nasi Goreng", spy: "Mi Goreng" },
  { category: "Makanan & Minuman", civilian: "Martabak", spy: "Terang Bulan" },
  { category: "Makanan & Minuman", civilian: "Es Krim", spy: "Gelato" },
  { category: "Tempat", civilian: "Pantai", spy: "Gunung" },
  { category: "Tempat", civilian: "Bandara", spy: "Stasiun" },
  { category: "Tempat", civilian: "Pasar", spy: "Mal" },
  { category: "Tempat", civilian: "Hotel", spy: "Vila" },
  { category: "Tempat", civilian: "Kebun Binatang", spy: "Akuarium" },
  { category: "Tempat", civilian: "Perpustakaan", spy: "Museum" },
  { category: "Transportasi", civilian: "Bus", spy: "Kereta" },
  { category: "Transportasi", civilian: "Pesawat", spy: "Kapal" },
  { category: "Transportasi", civilian: "Motor", spy: "Sepeda" },
  { category: "Transportasi", civilian: "Taksi", spy: "Ojek Online" },
  { category: "Benda", civilian: "Laptop", spy: "Tablet" },
  { category: "Benda", civilian: "Kamera", spy: "Teropong" },
  { category: "Benda", civilian: "Payung", spy: "Jas Hujan" },
  { category: "Benda", civilian: "Dompet", spy: "Tas" },
  { category: "Benda", civilian: "Kacamata", spy: "Lensa Kontak" },
  { category: "Hewan", civilian: "Kucing", spy: "Harimau" },
  { category: "Hewan", civilian: "Ayam", spy: "Bebek" },
  { category: "Hewan", civilian: "Kelinci", spy: "Hamster" },
  { category: "Hewan", civilian: "Lumba-Lumba", spy: "Hiu" },
  { category: "Hewan", civilian: "Kuda", spy: "Zebra" },
  { category: "Aktivitas", civilian: "Berenang", spy: "Menyelam" },
  { category: "Aktivitas", civilian: "Membaca", spy: "Menulis" },
  { category: "Aktivitas", civilian: "Camping", spy: "Piknik" },
  { category: "Aktivitas", civilian: "Memasak", spy: "Memanggang" },
  { category: "Hiburan", civilian: "Film", spy: "Drama" },
  { category: "Hiburan", civilian: "Konser", spy: "Festival" },
  { category: "Hiburan", civilian: "Karaoke", spy: "Podcast" },
  { category: "Olahraga", civilian: "Sepak Bola", spy: "Futsal" },
  { category: "Olahraga", civilian: "Bulu Tangkis", spy: "Tenis" },
  { category: "Olahraga", civilian: "Basket", spy: "Voli" },
  { category: "Indonesia", civilian: "Jakarta", spy: "Bandung" },
  { category: "Indonesia", civilian: "Bali", spy: "Lombok" },
  { category: "Indonesia", civilian: "Candi Borobudur", spy: "Monas" },
  { category: "Indonesia", civilian: "Angklung", spy: "Gamelan" }
]

export function nowSeconds() {
  return Math.floor(Date.now() / 1000)
}

export function clean(value, max = 120) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)
}

function normalizeText(value) {
  return clean(value, 160)
    .toLocaleLowerCase("id-ID")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
}

function shuffle(values) {
  const result = values.slice()

  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1))
    const temp = result[index]
    result[index] = result[target]
    result[target] = temp
  }

  return result
}

function choose(values) {
  return values[Math.floor(Math.random() * values.length)]
}

function isActive(player) {
  return Boolean(player && player.alive && !player.left)
}

function roleName(role) {
  return String(role) === "spy" ? "SPY" : "Warga"
}

function playerRecord(value = {}) {
  return {
    jid: String(value.jid || ""),
    name: clean(value.name, 22) || "Pemain",
    alive: value.alive !== false,
    left: Boolean(value.left),
    eliminated: Boolean(value.eliminated),
    role: String(value.role || ""),
    word: clean(value.word, 60),
    joinedAt: Number(value.joinedAt) || nowSeconds()
  }
}

export function playerSummary(player) {
  if (!player) return null

  return {
    jid: String(player.jid || ""),
    name: clean(player.name, 22) || "Pemain",
    alive: isActive(player),
    left: Boolean(player.left),
    eliminated: Boolean(player.eliminated),
    joinedAt: Number(player.joinedAt) || nowSeconds()
  }
}

export function createPlayer(jid, name) {
  return playerRecord({
    jid,
    name,
    alive: true,
    left: false,
    eliminated: false,
    role: "",
    word: "",
    joinedAt: nowSeconds()
  })
}

export function createRoom(chatId, hostJid, hostName) {
  const host = createPlayer(hostJid, hostName)
  const at = nowSeconds()

  return {
    version: 1,
    chatId: String(chatId || ""),
    host: host.jid,
    status: "waiting",
    phase: "waiting",
    players: [host],
    round: 0,
    wordPair: null,
    spyCount: 0,
    clueOrder: [],
    clueCursor: 0,
    clues: [],
    votes: {},
    result: null,
    lastEvent: null,
    createdAt: at,
    updatedAt: at,
    logs: [{ at, text: host.name + " membuat room Who Is The Spy." }]
  }
}

export function normalizeRoom(room) {
  if (!room || typeof room !== "object") return null

  const normalized = room
  normalized.version = 1
  normalized.chatId = String(normalized.chatId || "")
  normalized.host = String(normalized.host || "")
  normalized.status = ["waiting", "playing", "ended"].includes(normalized.status)
    ? normalized.status
    : "waiting"
  normalized.phase = ["waiting", "clue", "vote", "ended"].includes(normalized.phase)
    ? normalized.phase
    : normalized.status === "playing"
      ? "clue"
      : normalized.status === "ended"
        ? "ended"
        : "waiting"
  normalized.players = Array.isArray(normalized.players)
    ? normalized.players.slice(0, MAX_PLAYERS).map(playerRecord)
    : []

  if (!normalized.host && normalized.players[0]) {
    normalized.host = normalized.players[0].jid
  }

  normalized.round = Math.max(0, Number(normalized.round) || 0)
  normalized.wordPair = normalized.wordPair && typeof normalized.wordPair === "object"
    ? {
        category: clean(normalized.wordPair.category, 40),
        civilian: clean(normalized.wordPair.civilian, 60),
        spy: clean(normalized.wordPair.spy, 60)
      }
    : null
  normalized.spyCount = Math.max(0, Number(normalized.spyCount) || 0)
  normalized.clueOrder = Array.isArray(normalized.clueOrder)
    ? normalized.clueOrder.map((item) => String(item || "")).filter(Boolean)
    : []
  normalized.clueCursor = Math.max(0, Number(normalized.clueCursor) || 0)
  normalized.clues = Array.isArray(normalized.clues)
    ? normalized.clues.slice(-80).map((item) => ({
        round: Math.max(1, Number(item?.round) || 1),
        jid: String(item?.jid || ""),
        name: clean(item?.name, 22) || "Pemain",
        text: clean(item?.text, 80)
      })).filter((item) => item.jid && item.text)
    : []
  normalized.votes = normalized.votes && typeof normalized.votes === "object"
    ? Object.keys(normalized.votes).reduce((result, key) => {
        const target = String(normalized.votes[key] || "")
        if (key && target) result[String(key)] = target
        return result
      }, {})
    : {}
  normalized.result = normalized.result && typeof normalized.result === "object"
    ? normalized.result
    : null
  normalized.lastEvent = normalized.lastEvent && typeof normalized.lastEvent === "object"
    ? normalized.lastEvent
    : null
  normalized.createdAt = Number(normalized.createdAt) || nowSeconds()
  normalized.updatedAt = Number(normalized.updatedAt) || nowSeconds()
  normalized.logs = Array.isArray(normalized.logs)
    ? normalized.logs.slice(-40).map((entry) => ({
        at: Number(entry?.at) || nowSeconds(),
        text: clean(entry?.text, 220)
      })).filter((entry) => entry.text)
    : []

  return normalized
}

export function log(room, text) {
  room.logs = Array.isArray(room.logs) ? room.logs : []
  room.logs.push({ at: nowSeconds(), text: clean(text, 220) })
  room.logs = room.logs.slice(-40)
}

export function activePlayers(room) {
  return (room?.players || []).filter(isActive)
}

export function playerIndex(room, jid) {
  return (room?.players || []).findIndex((player) => String(player.jid) === String(jid || ""))
}

export function playerByJid(room, jid) {
  const index = playerIndex(room, jid)
  return index >= 0 ? room.players[index] : null
}

function spyTotal(playerCount) {
  return playerCount >= 8 ? 2 : 1
}

function publicOrder(room) {
  return (room.clueOrder || [])
    .map((jid) => playerByJid(room, jid))
    .filter(Boolean)
    .map(playerSummary)
}

export function currentCluePlayer(room) {
  if (!room || room.phase !== "clue") return null

  const order = Array.isArray(room.clueOrder) ? room.clueOrder : []

  while (room.clueCursor < order.length) {
    const candidate = playerByJid(room, order[room.clueCursor])

    if (isActive(candidate)) return candidate
    room.clueCursor += 1
  }

  return null
}

function allActiveClued(room) {
  const active = activePlayers(room)
  const clued = new Set(
    (room.clues || [])
      .filter((item) => Number(item.round) === Number(room.round))
      .map((item) => String(item.jid))
  )

  return active.length > 0 && active.every((player) => clued.has(String(player.jid)))
}

function startClueRound(room) {
  room.round = Math.max(0, Number(room.round) || 0) + 1
  room.phase = "clue"
  room.clues = []
  room.votes = {}
  room.clueOrder = shuffle(activePlayers(room).map((player) => player.jid))
  room.clueCursor = 0
}

function finishGame(room, winner, reason) {
  room.status = "ended"
  room.phase = "ended"
  room.votes = {}

  const reveal = (room.players || []).map((player) => ({
    jid: player.jid,
    name: player.name,
    role: roleName(player.role),
    active: isActive(player),
    left: Boolean(player.left),
    eliminated: Boolean(player.eliminated)
  }))

  room.result = {
    winner,
    reason,
    category: room.wordPair?.category || "-",
    civilianWord: room.wordPair?.civilian || "-",
    spyWord: room.wordPair?.spy || "-",
    reveal
  }

  log(room, winner + " menang. " + reason)
}

function checkWinner(room) {
  const active = activePlayers(room)
  const spies = active.filter((player) => player.role === "spy")
  const civilians = active.filter((player) => player.role !== "spy")

  if (!spies.length) {
    finishGame(room, "Warga", "Semua Spy telah tereliminasi.")
    return room.result
  }

  if (!civilians.length || spies.length >= civilians.length) {
    finishGame(room, "Spy", "Jumlah Spy sudah menyamai atau melebihi Warga.")
    return room.result
  }

  return null
}

function secretMessage(player, category) {
  return (
    "🕵️ *WHO IS THE SPY*\n\n" +
    "```" +
    "Role             : " + roleName(player.role) + "\n" +
    "Kategori         : " + category + "\n" +
    "Kata Rahasia     : " + player.word + "\n\n" +
    "Jangan kirim pesan ini ke grup.\n" +
    "Beri petunjuk tanpa menyebut kata secara langsung." +
    "```"
  )
}

export function startRoom(room, sender) {
  if (room.status !== "waiting") {
    return { ok: false, message: "Permainan sudah dimulai." }
  }

  if (String(room.host) !== String(sender || "")) {
    return { ok: false, message: "Hanya host yang dapat memulai permainan." }
  }

  const active = activePlayers(room)

  if (active.length < MIN_PLAYERS) {
    return { ok: false, message: "Minimal " + MIN_PLAYERS + " pemain untuk memulai Who Is The Spy." }
  }

  const pair = choose(WORD_PAIRS)
  const spyCount = spyTotal(active.length)
  const spyJids = new Set(shuffle(active.map((player) => player.jid)).slice(0, spyCount))

  room.wordPair = { ...pair }
  room.spyCount = spyCount
  room.status = "playing"
  room.result = null

  room.players.forEach((player) => {
    if (!isActive(player)) return
    player.role = spyJids.has(player.jid) ? "spy" : "civilian"
    player.word = player.role === "spy" ? pair.spy : pair.civilian
  })

  startClueRound(room)

  const next = currentCluePlayer(room)
  const privateMessages = active.map((player) => ({
    to: player.jid,
    text: secretMessage(player, pair.category)
  }))

  const event = {
    type: "start",
    category: pair.category,
    playerCount: active.length,
    spyCount,
    round: room.round,
    order: publicOrder(room),
    next: playerSummary(next),
    message: "Game dimulai. Role dan kata rahasia dikirim ke chat pribadi masing-masing pemain."
  }

  room.lastEvent = event
  log(room, "Game dimulai dengan " + active.length + " pemain dan " + spyCount + " Spy.")

  return { ok: true, event, privateMessages }
}

export function submitClue(room, sender, text) {
  if (room.status !== "playing") {
    return { ok: false, message: "Game belum dimulai." }
  }

  if (room.phase !== "clue") {
    return { ok: false, message: "Fase clue sudah selesai. Tunggu voting." }
  }

  const actor = playerByJid(room, sender)
  const expected = currentCluePlayer(room)
  const clue = clean(text, 80)

  if (!actor || !isActive(actor)) {
    return { ok: false, message: "Kamu tidak aktif di game ini." }
  }

  if (!expected || String(expected.jid) !== String(sender)) {
    return { ok: false, message: "Belum giliran kamu memberi clue." }
  }

  if (clue.length < 2) {
    return { ok: false, message: "Petunjuk minimal 2 karakter." }
  }

  const clueNormalized = normalizeText(clue)
  const secretNormalized = normalizeText(actor.word)

  if (secretNormalized && clueNormalized.includes(secretNormalized)) {
    return { ok: false, message: "Jangan menyebut kata rahasia secara langsung." }
  }

  room.clues.push({
    round: room.round,
    jid: actor.jid,
    name: actor.name,
    text: clue
  })
  room.clueCursor += 1

  let votingStarted = false
  let next = currentCluePlayer(room)

  if (allActiveClued(room) || !next) {
    room.phase = "vote"
    room.votes = {}
    next = null
    votingStarted = true
    log(room, "Semua clue ronde " + room.round + " terkumpul. Voting dimulai.")
  }

  const event = {
    type: "clue",
    actor: playerSummary(actor),
    clue,
    round: room.round,
    clueCount: (room.clues || []).filter((item) => Number(item.round) === Number(room.round)).length,
    clueTotal: activePlayers(room).length,
    votingStarted,
    next: playerSummary(next),
    message: actor.name + " memberi clue."
  }

  room.lastEvent = event
  log(room, actor.name + " memberi clue pada ronde " + room.round + ".")

  return { ok: true, event }
}

function voteCounts(room) {
  const counts = {}

  Object.values(room.votes || {}).forEach((target) => {
    const jid = String(target || "")
    if (!jid) return
    counts[jid] = (counts[jid] || 0) + 1
  })

  return Object.keys(counts)
    .map((jid) => {
      const player = playerByJid(room, jid)
      return {
        jid,
        name: player?.name || "Pemain",
        count: counts[jid]
      }
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "id"))
}

export function submitVote(room, sender, targetJid) {
  if (room.status !== "playing") {
    return { ok: false, message: "Game belum dimulai." }
  }

  if (room.phase !== "vote") {
    return { ok: false, message: "Belum masuk fase voting." }
  }

  const actor = playerByJid(room, sender)
  const target = playerByJid(room, targetJid)

  if (!actor || !isActive(actor)) {
    return { ok: false, message: "Kamu tidak aktif di game ini." }
  }

  if (!target || !isActive(target)) {
    return { ok: false, message: "Target vote tidak aktif atau tidak berada di game ini." }
  }

  if (String(actor.jid) === String(target.jid)) {
    return { ok: false, message: "Kamu tidak bisa vote diri sendiri." }
  }

  if (room.votes && room.votes[actor.jid]) {
    return { ok: false, message: "Kamu sudah memberikan vote pada ronde ini." }
  }

  room.votes = room.votes && typeof room.votes === "object" ? room.votes : {}
  room.votes[actor.jid] = target.jid

  const active = activePlayers(room)
  const submitted = Object.keys(room.votes).filter((jid) => active.some((player) => player.jid === jid)).length

  if (submitted < active.length) {
    const event = {
      type: "vote_pending",
      actor: playerSummary(actor),
      voteCount: submitted,
      voteTotal: active.length,
      message: actor.name + " sudah mengirim vote."
    }

    room.lastEvent = event
    return { ok: true, event }
  }

  const counts = voteCounts(room)
  const highest = counts[0]?.count || 0
  const candidates = counts.filter((item) => item.count === highest)

  if (candidates.length !== 1) {
    const previousRound = room.round
    startClueRound(room)
    const next = currentCluePlayer(room)

    const event = {
      type: "vote_tie",
      round: room.round,
      previousRound,
      candidates,
      votes: counts,
      next: playerSummary(next),
      message: "Voting seri. Tidak ada pemain yang dieliminasi. Ronde baru dimulai."
    }

    room.lastEvent = event
    log(room, "Voting ronde " + previousRound + " seri.")
    return { ok: true, event }
  }

  const eliminated = playerByJid(room, candidates[0].jid)
  eliminated.alive = false
  eliminated.eliminated = true

  const eliminatedRole = roleName(eliminated.role)
  const result = checkWinner(room)
  let next = null

  if (!result) {
    startClueRound(room)
    next = currentCluePlayer(room)
  }

  const event = {
    type: "vote_result",
    eliminated: playerSummary(eliminated),
    eliminatedRole,
    votes: counts,
    round: room.round,
    result: result || null,
    next: playerSummary(next),
    message: eliminated.name + " dieliminasi. Role: " + eliminatedRole + "."
  }

  room.lastEvent = event
  log(room, event.message)

  return { ok: true, event }
}

export function leaveRoom(room, sender) {
  const actor = playerByJid(room, sender)

  if (!actor || !isActive(actor)) {
    return { ok: false, message: "Kamu sudah tidak aktif di room ini." }
  }

  actor.alive = false
  actor.left = true

  if (String(room.host) === String(actor.jid)) {
    const nextHost = activePlayers(room)[0]
    room.host = nextHost ? nextHost.jid : ""
  }

  let result = null
  let phaseChanged = false
  let next = null

  if (room.status === "playing") {
    if (room.phase === "vote") {
      room.votes = {}
      phaseChanged = true
    }

    result = checkWinner(room)

    if (!result && room.phase === "clue") {
      const current = currentCluePlayer(room)

      if (allActiveClued(room) || !current) {
        room.phase = "vote"
        room.votes = {}
        phaseChanged = true
      } else {
        next = current
      }
    }

    if (!result && room.phase === "vote") {
      phaseChanged = true
    }
  }

  const event = {
    type: "leave",
    actor: playerSummary(actor),
    host: playerSummary(playerByJid(room, room.host)),
    result: result || null,
    phase: room.phase,
    votingRestarted: room.phase === "vote" && phaseChanged,
    next: playerSummary(next),
    message: actor.name + " keluar dari permainan."
  }

  room.lastEvent = event
  log(room, event.message)

  return { ok: true, event }
}

export function statusEvent(room, sender) {
  const actor = playerByJid(room, sender)
  const next = currentCluePlayer(room)

  return {
    type: "status",
    actor: playerSummary(actor),
    next: playerSummary(next),
    message: "Status Who Is The Spy."
  }
}

export function publicRoom(room) {
  const safe = normalizeRoom(room)
  if (!safe) return null

  const active = activePlayers(safe)
  const voteSubmitted = Object.keys(safe.votes || {}).filter((jid) => active.some((player) => player.jid === jid)).length

  const output = {
    version: safe.version,
    chatId: safe.chatId,
    host: safe.host,
    status: safe.status,
    phase: safe.phase,
    players: safe.players.map(playerSummary),
    playerCount: active.length,
    round: safe.round,
    category: safe.wordPair?.category || "-",
    spyCount: safe.spyCount,
    clueOrder: publicOrder(safe),
    clueCursor: safe.clueCursor,
    clues: safe.clues.map((item) => ({
      round: item.round,
      jid: item.jid,
      name: item.name,
      text: item.text
    })),
    voteProgress: {
      submitted: voteSubmitted,
      total: safe.phase === "vote" ? active.length : 0
    },
    result: safe.status === "ended" ? safe.result : null,
    lastEvent: safe.lastEvent,
    createdAt: safe.createdAt,
    updatedAt: safe.updatedAt,
    logs: safe.logs
  }

  return output
}
