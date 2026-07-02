export const MONOPOLY_COLORS = [
  { id: "red", name: "Merah", hex: "#e5484d", dark: "#9f1c22" },
  { id: "green", name: "Hijau", hex: "#22a568", dark: "#11623d" },
  { id: "yellow", name: "Kuning", hex: "#f2b517", dark: "#996f00" },
  { id: "blue", name: "Biru", hex: "#3478e5", dark: "#164a9e" }
]

export const START_MONEY = 3000
export const START_BONUS = 200
export const JAIL_FINE = 50
export const MAX_PROPERTY_LEVEL = 4

function tile(id, name, type, extra = {}) {
  return { id, name, type, ...extra }
}

function property(id, name, price, group, extra = {}) {
  return tile(id, name, "property", { price, group, ...extra })
}

function station(id, name) {
  return tile(id, name, "station", { price: 200, group: "stasiun" })
}

function utility(id, name) {
  return tile(id, name, "utility", { price: 150, group: "utilitas" })
}

// Urutan ini SAMA dengan posisi petak pada public/monopoly/board-indonesia.png.
export const MONOPOLY_BOARD = [
  tile("start", "MULAI", "start"),
  property("tanjung_pinang", "Tanjung Pinang", 200, "cokelat", { tag: "wisata" }),
  station("pelabuhan_tanjung_priok", "Pelabuhan Tanjung Priok"),
  tile("pajak_penghasilan", "PAJAK PENGHASILAN", "tax", { amount: 200 }),
  property("kota_tua", "Kawasan Kota Tua", 180, "biru_muda", { tag: "wisata" }),
  station("stasiun_pasar_senen", "Stasiun Pasar Senen"),
  property("candi_borobudur", "Candi Borobudur", 180, "biru_muda", { tag: "wisata" }),
  tile("kesempatan_1", "KESEMPATAN", "chance"),
  property("pasar_baru", "Pasar Baru", 180, "biru_muda"),
  tile("penjara", "PENJARA", "jail"),
  property("makassar", "Makassar", 240, "kuning"),
  tile("dana_umum_1", "DANA UMUM", "community"),
  property("labuan_bajo", "Labuan Bajo", 260, "merah", { tag: "wisata" }),
  property("lombok", "Lombok", 260, "merah", { tag: "wisata" }),
  utility("air", "AIR"),
  property("pura_besakih", "Pura Besakih", 280, "oranye", { tag: "wisata" }),
  property("bali_denpasar", "Bali Denpasar", 280, "oranye", { tag: "wisata" }),
  tile("masuk_penjara", "MASUK PENJARA", "gotojail"),
  property("surabaya", "Surabaya", 300, "merah_muda"),
  tile("kesempatan_2", "KESEMPATAN", "chance"),
  property("semarang", "Semarang", 300, "merah_muda"),
  station("stasiun_gambir", "Stasiun Gambir"),
  property("yogyakarta", "Yogyakarta", 320, "merah_muda", { tag: "wisata" }),
  tile("dana_umum_2", "DANA UMUM", "community"),
  property("bandung", "Bandung", 350, "hijau"),
  property("mh_thamrin", "Jl. MH. Thamrin", 400, "hijau"),
  tile("parkir_gratis", "PARKIR GRATIS", "freeparking"),
  property("medan", "Medan", 280, "hijau_tua"),
  property("danau_toba", "Danau Toba", 280, "hijau_tua", { tag: "wisata" }),
  utility("listrik", "LISTRIK"),
  property("palembang", "Palembang", 260, "hijau_tua"),
  property("padang", "Padang", 260, "hijau_tua"),
  tile("kesempatan_3", "KESEMPATAN", "chance"),
  property("batam", "Batam", 240, "kuning", { tag: "wisata" })
]

export const CHANCE_CARDS = [
  { id: "chance_01", type: "chance", title: "Maju ke MULAI", text: "Pindahkan bidak ke petak MULAI dan terima M200.", effect: { kind: "moveAbsolute", target: "start", collectStart: "always" } },
  { id: "chance_02", type: "chance", title: "Jalan Tol Nusantara", text: "Maju 5 petak dari posisi sekarang.", effect: { kind: "moveRelative", step: 5 } },
  { id: "chance_03", type: "chance", title: "Kemacetan Kota", text: "Mundur 3 petak dari posisi sekarang.", effect: { kind: "moveRelative", step: -3 } },
  { id: "chance_04", type: "chance", title: "Naik Kereta Cepat", text: "Pindah ke stasiun terdekat. Jika milik lawan, bayar sewa 2 kali.", effect: { kind: "moveNearest", type: "station", rentMultiplier: 2 } },
  { id: "chance_05", type: "chance", title: "Perjalanan Dinas", text: "Pindah ke Stasiun Gambir. Ambil M200 bila melewati MULAI.", effect: { kind: "moveAbsolute", target: "stasiun_gambir", collectStart: "pass" } },
  { id: "chance_06", type: "chance", title: "Kunjungan Pelabuhan", text: "Pindah ke Pelabuhan Tanjung Priok. Ambil M200 bila melewati MULAI.", effect: { kind: "moveAbsolute", target: "pelabuhan_tanjung_priok", collectStart: "pass" } },
  { id: "chance_07", type: "chance", title: "Bebas dari Penjara", text: "Simpan kartu ini untuk keluar dari Penjara tanpa membayar.", effect: { kind: "jailFree" } },
  { id: "chance_08", type: "chance", title: "Masuk Penjara", text: "Langsung menuju PENJARA. Jangan mengambil M200.", effect: { kind: "goToJail" } },
  { id: "chance_09", type: "chance", title: "Bonus Proyek Kota", text: "Terima bonus proyek sebesar M150 dari bank.", effect: { kind: "money", amount: 150 } },
  { id: "chance_10", type: "chance", title: "Dividen Investasi", text: "Terima dividen investasi sebesar M50.", effect: { kind: "money", amount: 50 } },
  { id: "chance_11", type: "chance", title: "Denda Pelanggaran Lalu Lintas", text: "Bayar denda sebesar M15.", effect: { kind: "money", amount: -15 } },
  { id: "chance_12", type: "chance", title: "Perbaikan Properti", text: "Bayar M25 per rumah dan M100 per hotel yang dimiliki.", effect: { kind: "propertyRepair", perHouse: 25, perHotel: 100 } },
  { id: "chance_13", type: "chance", title: "Festival Nusantara", text: "Terima keuntungan acara sebesar M75.", effect: { kind: "money", amount: 75 } },
  { id: "chance_14", type: "chance", title: "Jalan Pintas Wisata", text: "Maju ke properti wisata kosong terdekat. Bila tidak ada, maju 4 petak.", effect: { kind: "moveNearestUnowned", tag: "wisata", fallbackStep: 4 } },
  { id: "chance_15", type: "chance", title: "Biaya Administrasi", text: "Bayar biaya administrasi sebesar M40.", effect: { kind: "money", amount: -40 } },
  { id: "chance_16", type: "chance", title: "Penghargaan Investor", text: "Terima penghargaan investasi sebesar M100.", effect: { kind: "money", amount: 100 } }
]

export const COMMUNITY_CARDS = [
  { id: "community_01", type: "community", title: "Bantuan UMKM", text: "Terima bantuan usaha sebesar M100.", effect: { kind: "money", amount: 100 } },
  { id: "community_02", type: "community", title: "Bonus THR", text: "Bank membagikan THR sebesar M100.", effect: { kind: "money", amount: 100 } },
  { id: "community_03", type: "community", title: "Uang Warisan", text: "Kamu menerima uang warisan sebesar M100.", effect: { kind: "money", amount: 100 } },
  { id: "community_04", type: "community", title: "Pengembalian Pajak", text: "Terima pengembalian pajak sebesar M20.", effect: { kind: "money", amount: 20 } },
  { id: "community_05", type: "community", title: "Hadiah Lomba", text: "Kamu memenangkan lomba dan menerima M50.", effect: { kind: "money", amount: 50 } },
  { id: "community_06", type: "community", title: "Pendapatan Freelance", text: "Terima pendapatan tambahan sebesar M75.", effect: { kind: "money", amount: 75 } },
  { id: "community_07", type: "community", title: "Biaya Rumah Sakit", text: "Bayar biaya perawatan sebesar M100.", effect: { kind: "money", amount: -100 } },
  { id: "community_08", type: "community", title: "Iuran Lingkungan", text: "Bayar iuran lingkungan sebesar M40.", effect: { kind: "money", amount: -40 } },
  { id: "community_09", type: "community", title: "Biaya Pendidikan", text: "Bayar biaya pendidikan sebesar M50.", effect: { kind: "money", amount: -50 } },
  { id: "community_10", type: "community", title: "Denda Administrasi", text: "Bayar denda administrasi sebesar M25.", effect: { kind: "money", amount: -25 } },
  { id: "community_11", type: "community", title: "Bebas dari Penjara", text: "Simpan kartu ini untuk keluar dari Penjara tanpa membayar.", effect: { kind: "jailFree" } },
  { id: "community_12", type: "community", title: "Hari Ulang Tahun", text: "Setiap pemain lain membayar kamu M10.", effect: { kind: "collectFromEach", amount: 10 } },
  { id: "community_13", type: "community", title: "Bantuan Renovasi", text: "Terima M25 untuk setiap rumah dan M75 untuk setiap hotel yang dimiliki.", effect: { kind: "collectPerAsset", perHouse: 25, perHotel: 75 } },
  { id: "community_14", type: "community", title: "Perbaikan Fasilitas", text: "Bayar M20 per rumah dan M75 per hotel yang dimiliki.", effect: { kind: "propertyRepair", perHouse: 20, perHotel: 75 } },
  { id: "community_15", type: "community", title: "Cashback Bank", text: "Terima cashback sebesar M50.", effect: { kind: "money", amount: 50 } },
  { id: "community_16", type: "community", title: "Donasi Sosial", text: "Bayar donasi sosial sebesar M30.", effect: { kind: "money", amount: -30 } }
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

export function colorMeta(id) {
  return MONOPOLY_COLORS.find((item) => item.id === id) || MONOPOLY_COLORS[0]
}

export function tileAt(position) {
  const total = MONOPOLY_BOARD.length
  const parsed = Number(position)
  const index = Number.isInteger(parsed) ? parsed : 0
  return MONOPOLY_BOARD[((index % total) + total) % total]
}

export function tileIndex(id) {
  return MONOPOLY_BOARD.findIndex((item) => item.id === id)
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

function newDeck() {
  return {
    chance: shuffle(CHANCE_CARDS.map((card) => card.id)),
    community: shuffle(COMMUNITY_CARDS.map((card) => card.id)),
    usedChance: [],
    usedCommunity: []
  }
}

function createPropertyState() {
  return { owner: "", level: 0, mortgaged: false }
}

function normalizePropertyState(value) {
  const owner = String(value?.owner || "")
  const oldLevel = Number(value?.level)
  const oldHouses = Number(value?.houses)
  const level = Number.isInteger(oldLevel)
    ? Math.max(0, Math.min(MAX_PROPERTY_LEVEL, oldLevel))
    : value?.hotel
      ? 4
      : owner
        ? Math.max(1, Math.min(3, Number.isFinite(oldHouses) ? oldHouses : 1))
        : 0

  return {
    owner,
    level: owner ? Math.max(1, level) : 0,
    mortgaged: Boolean(value?.mortgaged)
  }
}

function playerSummary(player) {
  if (!player) return null
  return {
    jid: String(player.jid || ""),
    name: clean(player.name, 22) || "Pemain",
    color: colorMeta(player.color).id,
    money: Math.max(0, Number(player.money) || 0),
    position: Math.max(0, Math.min(MONOPOLY_BOARD.length - 1, Number(player.position) || 0)),
    positionName: tileAt(player.position).name,
    inJail: Boolean(player.inJail),
    jailAttempts: Math.max(0, Math.min(3, Number(player.jailAttempts) || 0)),
    jailFreeCards: Array.isArray(player.jailFreeCards) ? player.jailFreeCards.map((item) => ({ id: String(item.id || ""), type: String(item.type || "") })) : [],
    doublesStreak: Math.max(0, Math.min(3, Number(player.doublesStreak) || 0)),
    bankrupt: Boolean(player.bankrupt),
    surrendered: Boolean(player.surrendered),
    joinedAt: Number(player.joinedAt) || nowSeconds()
  }
}

export function createPlayer(jid, name, color) {
  return playerSummary({
    jid: String(jid || ""),
    name: clean(name, 22) || "Pemain",
    color: colorMeta(color).id,
    money: START_MONEY,
    position: 0,
    inJail: false,
    jailAttempts: 0,
    jailFreeCards: [],
    doublesStreak: 0,
    bankrupt: false,
    surrendered: false,
    joinedAt: nowSeconds()
  })
}

export function createRoom(chatId, hostJid, hostName) {
  const host = createPlayer(hostJid, hostName, "red")
  const at = nowSeconds()
  return {
    version: 4,
    chatId: String(chatId || ""),
    status: "waiting",
    host: host.jid,
    players: [host],
    turn: 0,
    properties: {},
    cardDeck: newDeck(),
    pendingAction: null,
    lastDice: null,
    lastCard: null,
    lastEvent: null,
    winner: null,
    boardVersion: 1,
    createdAt: at,
    updatedAt: at,
    logs: [{ at, text: host.name + " membuat room Monopoli." }]
  }
}

export function normalizeRoom(room) {
  if (!room || typeof room !== "object") return null
  const normalized = room
  normalized.version = 4
  normalized.chatId = String(normalized.chatId || "")
  normalized.status = ["waiting", "playing", "ended"].includes(normalized.status) ? normalized.status : "waiting"
  normalized.players = Array.isArray(normalized.players)
    ? normalized.players.slice(0, 4).map((player) => playerSummary(player))
    : []
  normalized.host = String(normalized.host || normalized.players[0]?.jid || "")
  normalized.turn = Math.max(0, Math.min(Math.max(0, normalized.players.length - 1), Number(normalized.turn) || 0))
  normalized.properties = normalized.properties && typeof normalized.properties === "object" ? normalized.properties : {}
  Object.keys(normalized.properties).forEach((key) => {
    normalized.properties[key] = normalizePropertyState(normalized.properties[key])
  })
  normalized.cardDeck = normalized.cardDeck && typeof normalized.cardDeck === "object" ? normalized.cardDeck : newDeck()
  for (const key of ["chance", "community", "usedChance", "usedCommunity"]) {
    if (!Array.isArray(normalized.cardDeck[key])) normalized.cardDeck[key] = []
  }
  normalized.pendingAction = normalized.pendingAction && typeof normalized.pendingAction === "object" ? normalized.pendingAction : null
  normalized.lastDice = normalized.lastDice && typeof normalized.lastDice === "object" ? normalized.lastDice : null
  normalized.lastCard = normalized.lastCard && typeof normalized.lastCard === "object" ? normalized.lastCard : null
  normalized.lastEvent = normalized.lastEvent && typeof normalized.lastEvent === "object" ? normalized.lastEvent : null
  normalized.winner = normalized.winner?.jid ? playerSummary(normalized.winner) : null
  normalized.boardVersion = Math.max(1, Number(normalized.boardVersion) || 1)
  normalized.createdAt = Number(normalized.createdAt) || nowSeconds()
  normalized.updatedAt = Number(normalized.updatedAt) || nowSeconds()
  normalized.logs = Array.isArray(normalized.logs)
    ? normalized.logs.slice(-30).map((entry) => ({ at: Number(entry?.at) || nowSeconds(), text: clean(entry?.text, 220) })).filter((entry) => entry.text)
    : []
  return normalized
}

export function log(room, text) {
  room.logs = Array.isArray(room.logs) ? room.logs : []
  room.logs.push({ at: nowSeconds(), text: clean(text, 220) })
  room.logs = room.logs.slice(-30)
}

export function activePlayers(room) {
  return (room?.players || []).filter((player) => !player.surrendered && !player.bankrupt)
}

export function currentPlayer(room) {
  return room?.players?.[Number(room?.turn) || 0] || null
}

export function playerIndex(room, jid) {
  return (room?.players || []).findIndex((player) => String(player.jid) === String(jid || ""))
}

export function propertyState(room, index) {
  const key = String(index)
  if (!room.properties || typeof room.properties !== "object") room.properties = {}
  if (!room.properties[key]) room.properties[key] = createPropertyState()
  room.properties[key] = normalizePropertyState(room.properties[key])
  return room.properties[key]
}

function getOwnedPropertyIndexes(room, jid) {
  return MONOPOLY_BOARD.map((item, index) => ({ item, index }))
    .filter((entry) => entry.item.type === "property" && String(propertyState(room, entry.index).owner) === String(jid || ""))
    .map((entry) => entry.index)
}

export function countAssets(room, jid) {
  let houses = 0
  let hotels = 0
  getOwnedPropertyIndexes(room, jid).forEach((index) => {
    const state = propertyState(room, index)
    if (state.level === 4) hotels += 1
    else houses += Math.max(0, state.level)
  })
  return { houses, hotels }
}

function cardById(id) {
  return CHANCE_CARDS.concat(COMMUNITY_CARDS).find((card) => card.id === id) || null
}

export function findCard(id) {
  const card = cardById(id)
  return card ? { ...card, effect: { ...card.effect } } : null
}

function drawCard(room, type) {
  const deckKey = type === "chance" ? "chance" : "community"
  const usedKey = type === "chance" ? "usedChance" : "usedCommunity"
  const source = type === "chance" ? CHANCE_CARDS : COMMUNITY_CARDS
  if (!Array.isArray(room.cardDeck[deckKey])) room.cardDeck[deckKey] = []
  if (!Array.isArray(room.cardDeck[usedKey])) room.cardDeck[usedKey] = []

  if (!room.cardDeck[deckKey].length) {
    const reusable = room.cardDeck[usedKey].filter((id) => cardById(id)?.effect?.kind !== "jailFree")
    room.cardDeck[deckKey] = shuffle(reusable.length ? reusable : source.filter((card) => card.effect.kind !== "jailFree").map((card) => card.id))
    room.cardDeck[usedKey] = []
  }

  const id = room.cardDeck[deckKey].shift()
  const card = findCard(id)
  if (card && card.effect.kind !== "jailFree") room.cardDeck[usedKey].push(card.id)
  return card
}

function returnJailFreeCard(room, card) {
  const deckKey = card?.type === "community" ? "community" : "chance"
  if (!card?.id) return
  room.cardDeck[deckKey] = Array.isArray(room.cardDeck[deckKey]) ? room.cardDeck[deckKey] : []
  room.cardDeck[deckKey].push(card.id)
}

function nextActiveTurn(room) {
  const total = room.players.length
  for (let step = 1; step <= total; step += 1) {
    const index = (Number(room.turn) + step) % total
    const player = room.players[index]
    if (player && !player.surrendered && !player.bankrupt) {
      room.turn = index
      return player
    }
  }
  return currentPlayer(room)
}

function markBoardChanged(room) {
  room.boardVersion = Math.max(1, Number(room.boardVersion) || 1) + 1
}

function awardStart(player) {
  player.money = Math.max(0, Number(player.money) || 0) + START_BONUS
}

function moveBy(room, player, step) {
  const total = MONOPOLY_BOARD.length
  const before = Math.max(0, Math.min(total - 1, Number(player.position) || 0))
  let after = before + Number(step || 0)
  let passedStart = false
  while (after >= total) {
    after -= total
    passedStart = true
  }
  while (after < 0) after += total
  player.position = after
  if (passedStart) awardStart(player)
  markBoardChanged(room)
  return { before, after, passedStart }
}

function moveTo(room, player, index, collectStart) {
  const total = MONOPOLY_BOARD.length
  const before = Math.max(0, Math.min(total - 1, Number(player.position) || 0))
  const after = Math.max(0, Math.min(total - 1, Number(index) || 0))
  const shouldCollect = collectStart === "always" || (collectStart === "pass" && after < before)
  player.position = after
  if (shouldCollect) awardStart(player)
  markBoardChanged(room)
  return { before, after, passedStart: shouldCollect }
}

function nearestTile(from, predicate) {
  for (let distance = 1; distance <= MONOPOLY_BOARD.length; distance += 1) {
    const index = (from + distance) % MONOPOLY_BOARD.length
    if (predicate(MONOPOLY_BOARD[index], index)) return index
  }
  return -1
}

function releaseProperties(room, jid) {
  Object.keys(room.properties || {}).forEach((key) => {
    const state = propertyState(room, Number(key))
    if (String(state.owner) === String(jid || "")) room.properties[key] = createPropertyState()
  })
}

function bankruptIfNeeded(room, player) {
  if (Number(player.money) >= 0) return false
  player.money = 0
  player.bankrupt = true
  releaseProperties(room, player.jid)
  log(room, player.name + " bangkrut dan propertinya kembali ke bank.")
  markBoardChanged(room)
  return true
}

function debit(room, payer, amount, receiver = null) {
  const total = Math.max(0, Math.floor(Number(amount) || 0))
  payer.money = Number(payer.money || 0) - total
  if (receiver) receiver.money = Number(receiver.money || 0) + total
  bankruptIfNeeded(room, payer)
  return total
}

function goToJail(room, player) {
  const jail = tileIndex("penjara")
  player.position = jail >= 0 ? jail : 9
  player.inJail = true
  player.jailAttempts = 0
  player.doublesStreak = 0
  markBoardChanged(room)
}

function groupTiles(group) {
  return MONOPOLY_BOARD.map((item, index) => ({ item, index }))
    .filter((entry) => entry.item.type === "property" && entry.item.group === group)
}

function ownsFullGroup(room, player, group) {
  const entries = groupTiles(group)
  return entries.length > 0 && entries.every((entry) => String(propertyState(room, entry.index).owner) === String(player.jid))
}

function canUpgrade(room, player, index) {
  const tileInfo = MONOPOLY_BOARD[index]
  const state = propertyState(room, index)

  if (!tileInfo || tileInfo.type !== "property") {
    return { ok: false, message: "Petak ini tidak dapat di-upgrade." }
  }

  if (String(state.owner) !== String(player.jid)) {
    return { ok: false, message: "Properti ini bukan milikmu." }
  }

  if (state.level >= MAX_PROPERTY_LEVEL) {
    return { ok: false, message: "Properti ini sudah menjadi hotel." }
  }

  return { ok: true }
}

export function upgradeCost(tileInfo, nextLevel) {
  const price = Math.max(1, Number(tileInfo?.price) || 1)
  if (nextLevel === 2) return Math.round(price * 0.5)
  if (nextLevel === 3) return Math.round(price * 0.75)
  if (nextLevel === 4) return Math.round(price)
  return 0
}

export function propertyValue(room, index) {
  const tileInfo = MONOPOLY_BOARD[Number(index)]
  if (!tileInfo || !["property", "station", "utility"].includes(tileInfo.type)) return 0

  const state = propertyState(room, index)
  if (!state.owner) return 0

  let value = Math.max(0, Number(tileInfo.price) || 0)

  if (tileInfo.type === "property") {
    const level = Math.max(1, Math.min(MAX_PROPERTY_LEVEL, Number(state.level) || 1))
    for (let nextLevel = 2; nextLevel <= level; nextLevel += 1) {
      value += upgradeCost(tileInfo, nextLevel)
    }
  }

  return Math.round(value)
}

export function takeoverCost(room, index) {
  return propertyValue(room, index) * 2
}

export function rentFor(room, index, diceTotal, multiplier = 1) {
  const tileInfo = MONOPOLY_BOARD[index]
  const state = propertyState(room, index)
  if (!tileInfo || !state.owner || state.mortgaged) return 0

  if (tileInfo.type === "station") {
    const count = MONOPOLY_BOARD.map((item, itemIndex) => ({ item, itemIndex }))
      .filter((entry) => entry.item.type === "station" && String(propertyState(room, entry.itemIndex).owner) === String(state.owner)).length
    return Math.round(25 * Math.pow(2, Math.max(0, count - 1)) * multiplier)
  }

  if (tileInfo.type === "utility") {
    const count = MONOPOLY_BOARD.map((item, itemIndex) => ({ item, itemIndex }))
      .filter((entry) => entry.item.type === "utility" && String(propertyState(room, entry.itemIndex).owner) === String(state.owner)).length
    return Math.max(1, Number(diceTotal) || 1) * (count >= 2 ? 10 : 4) * multiplier
  }

  const level = Math.max(1, Math.min(MAX_PROPERTY_LEVEL, Number(state.level) || 1))
  const multiplierByLevel = { 1: 0.1, 2: 0.25, 3: 0.5, 4: 1 }[level]
  return Math.round(Number(tileInfo.price) * multiplierByLevel * multiplier)
}

function applyCard(room, actorIndex, card) {
  const player = room.players[actorIndex]
  const effect = card?.effect || {}
  const result = { id: card?.id || "", type: card?.type || "chance", title: card?.title || "", text: card?.text || "", effects: [], moved: false, rentMultiplier: 1 }
  if (!player || !card) return result

  if (effect.kind === "money") {
    player.money = Number(player.money || 0) + Number(effect.amount || 0)
    result.effects.push(Number(effect.amount || 0) >= 0 ? "Menerima M" + Number(effect.amount || 0) : "Membayar M" + Math.abs(Number(effect.amount || 0)))
    bankruptIfNeeded(room, player)
  }

  if (effect.kind === "moveRelative") {
    const movement = moveBy(room, player, Number(effect.step || 0))
    result.moved = true
    result.effects.push(Number(effect.step || 0) >= 0 ? "Maju " + Number(effect.step || 0) + " petak" : "Mundur " + Math.abs(Number(effect.step || 0)) + " petak")
    if (movement.passedStart) result.effects.push("Melewati MULAI dan menerima M200")
  }

  if (effect.kind === "moveAbsolute") {
    const target = tileIndex(effect.target)
    if (target >= 0) {
      const movement = moveTo(room, player, target, effect.collectStart)
      result.moved = true
      result.effects.push("Pindah ke " + MONOPOLY_BOARD[target].name)
      if (movement.passedStart) result.effects.push("Menerima M200 dari MULAI")
    }
  }

  if (effect.kind === "moveNearest") {
    const target = nearestTile(Number(player.position) || 0, (tileInfo) => tileInfo.type === effect.type)
    if (target >= 0) {
      const movement = moveTo(room, player, target, "pass")
      result.moved = true
      result.rentMultiplier = Number(effect.rentMultiplier) || 1
      result.effects.push("Pindah ke " + MONOPOLY_BOARD[target].name)
      if (movement.passedStart) result.effects.push("Melewati MULAI dan menerima M200")
      if (result.rentMultiplier > 1) result.effects.push("Sewa stasiun menjadi " + result.rentMultiplier + " kali")
    }
  }

  if (effect.kind === "moveNearestUnowned") {
    const target = nearestTile(Number(player.position) || 0, (tileInfo, index) => tileInfo.type === "property" && tileInfo.tag === effect.tag && !propertyState(room, index).owner)
    if (target >= 0) {
      const movement = moveTo(room, player, target, "pass")
      result.moved = true
      result.effects.push("Pindah ke " + MONOPOLY_BOARD[target].name)
      if (movement.passedStart) result.effects.push("Melewati MULAI dan menerima M200")
    } else {
      const movement = moveBy(room, player, Number(effect.fallbackStep) || 0)
      result.moved = true
      result.effects.push("Tidak ada properti wisata kosong, maju " + Number(effect.fallbackStep || 0) + " petak")
      if (movement.passedStart) result.effects.push("Melewati MULAI dan menerima M200")
    }
  }

  if (effect.kind === "jailFree") {
    player.jailFreeCards = Array.isArray(player.jailFreeCards) ? player.jailFreeCards : []
    player.jailFreeCards.push({ id: card.id, type: card.type })
    result.effects.push("Kartu disimpan untuk keluar dari Penjara")
  }

  if (effect.kind === "goToJail") {
    goToJail(room, player)
    result.moved = true
    result.effects.push("Masuk Penjara")
  }

  if (effect.kind === "propertyRepair" || effect.kind === "collectPerAsset") {
    const assets = countAssets(room, player.jid)
    const amount = assets.houses * Number(effect.perHouse || 0) + assets.hotels * Number(effect.perHotel || 0)
    if (effect.kind === "propertyRepair") {
      debit(room, player, amount)
      result.effects.push("Membayar M" + amount + " untuk " + assets.houses + " rumah dan " + assets.hotels + " hotel")
    } else {
      player.money = Number(player.money || 0) + amount
      result.effects.push("Menerima M" + amount + " dari " + assets.houses + " rumah dan " + assets.hotels + " hotel")
    }
  }

  if (effect.kind === "collectFromEach") {
    const amount = Math.max(0, Number(effect.amount) || 0)
    let received = 0
    room.players.forEach((other, index) => {
      if (index === actorIndex || other.surrendered || other.bankrupt) return
      const paid = debit(room, other, amount, player)
      received += paid
    })
    result.effects.push("Menerima total M" + received + " dari pemain lain")
  }

  room.lastCard = result
  return result
}

function resolveLanding(room, actorIndex, diceTotal, context = {}, depth = 0) {
  const player = room.players[actorIndex]
  const index = Number(player?.position) || 0
  const tileInfo = tileAt(index)
  const landing = { index, tile: { id: tileInfo.id, name: tileInfo.name, type: tileInfo.type }, messages: [] }
  if (!player) return landing

  if (tileInfo.type === "gotojail") {
    goToJail(room, player)
    landing.sentToJail = true
    landing.messages.push("Langsung masuk Penjara")
    return landing
  }

  if (tileInfo.type === "tax") {
    const paid = debit(room, player, tileInfo.amount)
    landing.tax = paid
    landing.messages.push("Membayar pajak M" + paid)
    return landing
  }

  if (tileInfo.type === "chance" || tileInfo.type === "community") {
    const card = drawCard(room, tileInfo.type)
    const applied = applyCard(room, actorIndex, card)
    landing.card = applied
    landing.messages.push("Mengambil kartu " + (tileInfo.type === "chance" ? "Kesempatan" : "Dana Umum"))
    if (applied.moved && depth < 2 && !player.inJail) {
      const nextLanding = resolveLanding(room, actorIndex, diceTotal, { rentMultiplier: applied.rentMultiplier || 1 }, depth + 1)
      landing.follow = nextLanding
      if (nextLanding.needsBuy) {
        landing.needsBuy = true
        landing.price = nextLanding.price
      }
    }
    return landing
  }

  if (["property", "station", "utility"].includes(tileInfo.type)) {
    const state = propertyState(room, index)
    if (!state.owner) {
      room.pendingAction = { type: "buy", sender: player.jid, index }
      landing.needsBuy = true
      landing.price = tileInfo.price
      landing.messages.push("Properti belum dimiliki")
      return landing
    }

    if (String(state.owner) === String(player.jid)) {
      if (tileInfo.type === "property") {
        const upgrade = canUpgrade(room, player, index)
        if (upgrade.ok) {
          const nextLevel = state.level + 1
          room.pendingAction = { type: "upgrade", sender: player.jid, index, nextLevel }
          landing.needsUpgrade = true
          landing.nextLevel = nextLevel
          landing.upgradeCost = upgradeCost(tileInfo, nextLevel)
          landing.messages.push("Properti sendiri dapat di-upgrade")
          return landing
        }
      }
      landing.messages.push("Properti milik sendiri")
      return landing
    }

    const owner = room.players.find((item) => String(item.jid) === String(state.owner)) || null
    const rent = rentFor(room, index, diceTotal, Number(context.rentMultiplier) || 1)
    const price = takeoverCost(room, index)

    room.pendingAction = {
      type: "rent_or_buy",
      sender: player.jid,
      index,
      rent,
      takeoverPrice: price,
      owner: owner ? owner.jid : ""
    }

    landing.needsRentOrBuy = true
    landing.rent = rent
    landing.takeoverPrice = price
    landing.owner = owner ? playerSummary(owner) : null
    landing.level = state.level
    landing.messages.push("Properti milik " + (owner?.name || "pemain lain"))
    return landing
  }

  if (tileInfo.type === "start") landing.messages.push("Berada di MULAI")
  if (tileInfo.type === "freeparking") landing.messages.push("Parkir Gratis")
  if (tileInfo.type === "jail") landing.messages.push("Hanya berkunjung ke Penjara")
  return landing
}

function finishTurn(room, extraTurn) {
  if (!extraTurn && room.status === "playing") nextActiveTurn(room)
}

function updateWinner(room) {
  const active = activePlayers(room)
  if (room.status === "playing" && active.length <= 1) {
    room.status = "ended"
    room.winner = active[0] ? playerSummary(active[0]) : null
    room.pendingAction = null
    if (room.winner) log(room, room.winner.name + " menjadi pemenang Monopoli.")
    markBoardChanged(room)
  }
}

export function startRoom(room) {
  if (room.status !== "waiting") return { ok: false, message: "Permainan sudah dimulai." }
  if (activePlayers(room).length < 2) return { ok: false, message: "Minimal 2 pemain untuk memulai Monopoli." }
  room.status = "playing"
  room.turn = 0
  room.pendingAction = null
  room.lastDice = null
  markBoardChanged(room)
  const actor = currentPlayer(room)
  log(room, "Permainan dimulai. Giliran " + actor.name + ".")
  const event = { type: "start", actor: playerSummary(actor), next: playerSummary(actor), message: "Permainan Monopoli dimulai." }
  room.lastEvent = event
  return { ok: true, event }
}

export function bailRoom(room, sender) {
  if (room.status !== "playing") return { ok: false, message: "Game belum dimulai." }
  if (room.pendingAction) return { ok: false, message: "Selesaikan pilihan sebelumnya terlebih dahulu." }

  const actorIndex = playerIndex(room, sender)
  const actor = room.players[actorIndex]
  const current = currentPlayer(room)

  if (!actor) return { ok: false, message: "Kamu belum bergabung di room ini." }
  if (!current || String(current.jid) !== String(sender)) return { ok: false, message: "Bukan giliran kamu." }
  if (actor.surrendered || actor.bankrupt) return { ok: false, message: "Kamu sudah tidak aktif di permainan ini." }
  if (!actor.inJail) return { ok: false, message: "Kamu tidak sedang berada di Penjara." }
  if (Number(actor.money || 0) < JAIL_FINE) {
    return { ok: false, message: "Uang kamu tidak cukup untuk membayar denda Penjara M" + JAIL_FINE + "." }
  }

  actor.money = Number(actor.money || 0) - JAIL_FINE
  actor.inJail = false
  actor.jailAttempts = 0
  actor.doublesStreak = 0

  markBoardChanged(room)

  const event = {
    type: "bail",
    actor: playerSummary(actor),
    fine: JAIL_FINE,
    next: playerSummary(currentPlayer(room)),
    message: actor.name + " membayar denda Penjara M" + JAIL_FINE + "."
  }

  room.lastEvent = event
  log(room, event.message)
  return { ok: true, event }
}

export function useJailCardRoom(room, sender) {
  if (room.status !== "playing") return { ok: false, message: "Game belum dimulai." }
  if (room.pendingAction) return { ok: false, message: "Selesaikan pilihan sebelumnya terlebih dahulu." }

  const actorIndex = playerIndex(room, sender)
  const actor = room.players[actorIndex]
  const current = currentPlayer(room)

  if (!actor) return { ok: false, message: "Kamu belum bergabung di room ini." }
  if (!current || String(current.jid) !== String(sender)) return { ok: false, message: "Bukan giliran kamu." }
  if (actor.surrendered || actor.bankrupt) return { ok: false, message: "Kamu sudah tidak aktif di permainan ini." }
  if (!actor.inJail) return { ok: false, message: "Kamu tidak sedang berada di Penjara." }

  actor.jailFreeCards = Array.isArray(actor.jailFreeCards)
    ? actor.jailFreeCards
    : []

  if (!actor.jailFreeCards.length) {
    return { ok: false, message: "Kamu tidak memiliki kartu Bebas dari Penjara." }
  }

  const savedCard = actor.jailFreeCards.shift()
  returnJailFreeCard(room, savedCard)

  actor.inJail = false
  actor.jailAttempts = 0
  actor.doublesStreak = 0

  markBoardChanged(room)

  const event = {
    type: "use_jail_card",
    actor: playerSummary(actor),
    card: {
      id: String(savedCard?.id || ""),
      type: String(savedCard?.type || "")
    },
    next: playerSummary(currentPlayer(room)),
    message: actor.name + " menggunakan kartu Bebas dari Penjara."
  }

  room.lastEvent = event
  log(room, event.message)
  return { ok: true, event }
}

export function rollRoom(room, sender) {
  if (room.status !== "playing") return { ok: false, message: "Game belum dimulai." }
  if (room.pendingAction) return { ok: false, message: "Selesaikan pilihan sebelumnya terlebih dahulu." }

  const actorIndex = playerIndex(room, sender)
  const actor = room.players[actorIndex]
  const current = currentPlayer(room)

  if (!actor) return { ok: false, message: "Kamu belum bergabung di room ini." }
  if (!current || String(current.jid) !== String(sender)) return { ok: false, message: "Bukan giliran kamu." }
  if (actor.surrendered || actor.bankrupt) return { ok: false, message: "Kamu sudah tidak aktif di permainan ini." }

  if (actor.inJail && Number(actor.jailAttempts || 0) >= 3) {
    return {
      ok: false,
      message: "Kesempatan dadu di Penjara sudah habis. Gunakan bail atau card untuk keluar."
    }
  }

  const first = Math.floor(Math.random() * 6) + 1
  const second = Math.floor(Math.random() * 6) + 1
  const total = first + second
  const doubles = first === second
  const dice = { first, second, total, doubles }

  room.lastDice = dice

  if (actor.inJail) {
    if (doubles) {
      actor.inJail = false
      actor.jailAttempts = 0
      actor.doublesStreak = 0

      const movement = moveBy(room, actor, total)
      const landing = resolveLanding(room, actorIndex, total)

      if (!room.pendingAction) finishTurn(room, false)
      updateWinner(room)

      const event = {
        type: "roll",
        actor: playerSummary(actor),
        dice,
        from: { ...tileAt(movement.before) },
        to: { ...tileAt(actor.position) },
        passedStart: movement.passedStart,
        landing,
        extraTurn: false,
        releasedFromJail: true,
        next: playerSummary(currentPlayer(room)),
        message: actor.name + " keluar dari Penjara dengan dadu kembar."
      }

      room.lastEvent = event
      log(room, event.message)
      return { ok: true, event }
    }

    actor.jailAttempts = Math.min(3, Number(actor.jailAttempts || 0) + 1)
    actor.doublesStreak = 0
    finishTurn(room, false)

    const attempts = actor.jailAttempts
    const mustPayBail = attempts >= 3

    const event = {
      type: "jail_wait",
      actor: playerSummary(actor),
      dice,
      jailAttempts: attempts,
      mustPayBail,
      hasJailCard: Boolean(actor.jailFreeCards?.length),
      next: playerSummary(currentPlayer(room)),
      message: mustPayBail
        ? actor.name + " gagal keluar dari Penjara untuk ketiga kalinya."
        : actor.name + " belum berhasil keluar dari Penjara."
    }

    room.lastEvent = event
    log(room, event.message)
    return { ok: true, event }
  }

  actor.doublesStreak = doubles
    ? Number(actor.doublesStreak || 0) + 1
    : 0

  if (actor.doublesStreak >= 3) {
    goToJail(room, actor)
    finishTurn(room, false)

    const event = {
      type: "jail",
      actor: playerSummary(actor),
      dice,
      next: playerSummary(currentPlayer(room)),
      message: actor.name + " mendapat tiga dadu kembar dan masuk Penjara."
    }

    room.lastEvent = event
    log(room, event.message)
    return { ok: true, event }
  }

  const movement = moveBy(room, actor, total)
  const landing = resolveLanding(room, actorIndex, total)
  const extraTurn = doubles && !room.pendingAction && !actor.inJail && room.status === "playing"

  if (!room.pendingAction) finishTurn(room, extraTurn)
  updateWinner(room)

  const event = {
    type: "roll",
    actor: playerSummary(actor),
    dice,
    from: { ...tileAt(movement.before) },
    to: { ...tileAt(actor.position) },
    passedStart: movement.passedStart,
    landing,
    card: landing.card || null,
    extraTurn,
    next: playerSummary(currentPlayer(room)),
    message: actor.name + " melempar dadu " + first + " + " + second + "."
  }

  room.lastEvent = event
  log(room, event.message)
  return { ok: true, event }
}

export function buyRoom(room, sender) {
  if (room.status !== "playing") return { ok: false, message: "Game belum dimulai." }
  const pending = room.pendingAction
  if (!pending || !["buy", "rent_or_buy"].includes(pending.type)) {
    return { ok: false, message: "Tidak ada properti yang menunggu untuk dibeli." }
  }
  if (String(pending.sender) !== String(sender)) return { ok: false, message: "Bukan pilihan kamu." }

  const actorIndex = playerIndex(room, sender)
  const actor = room.players[actorIndex]
  const index = Number(pending.index)
  const tileInfo = MONOPOLY_BOARD[index]
  const state = propertyState(room, index)
  if (!actor || !tileInfo || !["property", "station", "utility"].includes(tileInfo.type)) {
    return { ok: false, message: "Data properti tidak valid." }
  }

  if (actor.inJail) {
    return { ok: false, message: "Kamu masih berada di Penjara. Keluar dulu sebelum membeli properti." }
  }

  if (pending.type === "buy") {
    if (state.owner) return { ok: false, message: "Properti ini sudah dimiliki pemain lain." }
    if (actor.money < tileInfo.price) return { ok: false, message: "Uang kamu tidak cukup untuk membeli properti ini." }

    actor.money -= tileInfo.price
    state.owner = actor.jid
    state.level = tileInfo.type === "property" ? 1 : 0
    state.mortgaged = false
    room.pendingAction = null
    markBoardChanged(room)
    log(room, actor.name + " membeli " + tileInfo.name + ".")
    finishTurn(room, false)
    updateWinner(room)
    const event = {
      type: "buy",
      actor: playerSummary(actor),
      tile: { ...tileInfo },
      level: state.level,
      price: tileInfo.price,
      next: playerSummary(currentPlayer(room)),
      message: actor.name + " membeli " + tileInfo.name + "."
    }
    room.lastEvent = event
    return { ok: true, event }
  }

  const owner = room.players.find((item) => String(item.jid) === String(state.owner)) || null
  if (!owner || owner.surrendered || owner.bankrupt) {
    return { ok: false, message: "Pemilik properti tidak aktif. Coba ulangi giliran ini." }
  }

  const cost = Math.max(0, Number(pending.takeoverPrice) || takeoverCost(room, index))
  if (actor.money < cost) {
    return { ok: false, message: "Uang kamu tidak cukup untuk membeli alih properti ini." }
  }

  actor.money -= cost
  owner.money = Number(owner.money || 0) + cost
  state.owner = actor.jid
  state.mortgaged = false
  room.pendingAction = null
  markBoardChanged(room)
  log(room, actor.name + " membeli alih " + tileInfo.name + " dari " + owner.name + " seharga M" + cost + ".")
  finishTurn(room, false)
  updateWinner(room)

  const event = {
    type: "takeover",
    actor: playerSummary(actor),
    owner: playerSummary(owner),
    tile: { ...tileInfo },
    level: state.level,
    cost,
    next: playerSummary(currentPlayer(room)),
    message: actor.name + " membeli alih " + tileInfo.name + "."
  }
  room.lastEvent = event
  return { ok: true, event }
}

export function payRentRoom(room, sender) {
  if (room.status !== "playing") return { ok: false, message: "Game belum dimulai." }
  const pending = room.pendingAction
  if (!pending || pending.type !== "rent_or_buy") {
    return { ok: false, message: "Tidak ada sewa yang menunggu untuk dibayar." }
  }
  if (String(pending.sender) !== String(sender)) return { ok: false, message: "Bukan pilihan kamu." }

  const actorIndex = playerIndex(room, sender)
  const actor = room.players[actorIndex]
  const index = Number(pending.index)
  const tileInfo = MONOPOLY_BOARD[index]
  const state = propertyState(room, index)
  const owner = room.players.find((item) => String(item.jid) === String(state.owner)) || null
  if (!actor || !owner || !tileInfo) return { ok: false, message: "Data sewa properti tidak valid." }

  const rent = Math.max(0, Number(pending.rent) || rentFor(room, index, room.lastDice?.total || 1))
  const paid = debit(room, actor, rent, owner)
  room.pendingAction = null
  log(room, actor.name + " membayar sewa M" + paid + " kepada " + owner.name + " di " + tileInfo.name + ".")
  finishTurn(room, false)
  updateWinner(room)

  const event = {
    type: "pay",
    actor: playerSummary(actor),
    owner: playerSummary(owner),
    tile: { ...tileInfo },
    rent: paid,
    next: playerSummary(currentPlayer(room)),
    message: actor.name + " membayar sewa " + tileInfo.name + "."
  }
  room.lastEvent = event
  return { ok: true, event }
}

export function upgradeRoom(room, sender) {
  if (room.status !== "playing") return { ok: false, message: "Game belum dimulai." }
  const pending = room.pendingAction
  if (!pending || pending.type !== "upgrade") return { ok: false, message: "Tidak ada properti yang dapat di-upgrade saat ini." }
  if (String(pending.sender) !== String(sender)) return { ok: false, message: "Bukan pilihan kamu." }
  const actorIndex = playerIndex(room, sender)
  const actor = room.players[actorIndex]
  const index = Number(pending.index)
  const tileInfo = MONOPOLY_BOARD[index]
  const state = propertyState(room, index)
  if (!actor || !tileInfo) return { ok: false, message: "Data properti tidak valid." }
  if (actor.inJail) {
    return { ok: false, message: "Kamu masih berada di Penjara. Keluar dulu sebelum upgrade properti." }
  }
  const allowed = canUpgrade(room, actor, index)
  if (!allowed.ok) return allowed
  const nextLevel = state.level + 1
  const cost = upgradeCost(tileInfo, nextLevel)
  if (actor.money < cost) return { ok: false, message: "Uang kamu tidak cukup untuk upgrade ini." }

  actor.money -= cost
  state.level = nextLevel
  room.pendingAction = null
  markBoardChanged(room)
  log(room, actor.name + " meningkatkan " + tileInfo.name + " ke level " + nextLevel + ".")
  finishTurn(room, false)
  updateWinner(room)
  const event = { type: "upgrade", actor: playerSummary(actor), tile: { ...tileInfo }, level: state.level, cost, next: playerSummary(currentPlayer(room)), message: actor.name + " meningkatkan " + tileInfo.name + "." }
  room.lastEvent = event
  return { ok: true, event }
}

export function passRoom(room, sender) {
  if (room.status !== "playing") return { ok: false, message: "Game belum dimulai." }
  const pending = room.pendingAction
  if (!pending) return { ok: false, message: "Tidak ada pilihan yang perlu dilewati." }
  if (String(pending.sender) !== String(sender)) return { ok: false, message: "Bukan pilihan kamu." }
  if (pending.type === "rent_or_buy") {
    return { ok: false, message: "Properti lawan harus dibayar sewanya atau dibeli alih." }
  }

  const actor = room.players[playerIndex(room, sender)]
  const tileInfo = MONOPOLY_BOARD[Number(pending.index)]
  const skippedType = pending.type
  room.pendingAction = null
  finishTurn(room, false)
  const event = {
    type: "pass",
    actor: playerSummary(actor),
    tile: tileInfo ? { ...tileInfo } : null,
    skippedType,
    next: playerSummary(currentPlayer(room)),
    message: actor.name + " melewati pilihan di " + (tileInfo?.name || "petak") + "."
  }
  room.lastEvent = event
  return { ok: true, event }
}

export function leaveRoom(room, sender) {
  const index = playerIndex(room, sender)
  if (index < 0) return { ok: false, message: "Kamu sudah keluar dari game ini." }
  const actor = room.players[index]
  if (actor.surrendered || actor.bankrupt) return { ok: false, message: "Kamu sudah keluar dari game ini." }
  actor.surrendered = true
  releaseProperties(room, actor.jid)
  if (room.pendingAction?.sender === actor.jid) room.pendingAction = null
  markBoardChanged(room)
  log(room, actor.name + " keluar dari permainan.")
  if (room.status === "playing" && Number(room.turn) === index) nextActiveTurn(room)
  updateWinner(room)
  const event = { type: "leave", actor: playerSummary(actor), next: playerSummary(currentPlayer(room)), message: actor.name + " keluar dari permainan." }
  room.lastEvent = event
  return { ok: true, event }
}

export function publicRoom(room) {
  const safe = normalizeRoom(room)
  if (!safe) return null
  const properties = {}
  Object.keys(safe.properties || {}).forEach((key) => {
    const index = Number(key)
    const tileInfo = MONOPOLY_BOARD[index]
    if (!tileInfo) return
    const state = propertyState(safe, index)
    properties[key] = {
      index,
      tileId: tileInfo.id,
      name: tileInfo.name,
      type: tileInfo.type,
      price: tileInfo.price || 0,
      owner: state.owner,
      level: state.level,
      mortgaged: state.mortgaged,
      rent: ["property", "station", "utility"].includes(tileInfo.type) ? rentFor(safe, index, safe.lastDice?.total || 1) : 0
    }
  })
  return {
    version: safe.version,
    chatId: safe.chatId,
    status: safe.status,
    host: safe.host,
    players: safe.players.map(playerSummary),
    turn: safe.turn,
    pendingAction: safe.pendingAction,
    lastDice: safe.lastDice,
    lastCard: safe.lastCard,
    lastEvent: safe.lastEvent,
    winner: safe.winner,
    properties,
    boardVersion: safe.boardVersion,
    createdAt: safe.createdAt,
    updatedAt: safe.updatedAt,
    logs: safe.logs
  }
}
