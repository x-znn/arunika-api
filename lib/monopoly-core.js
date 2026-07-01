export const MONOPOLY_COLORS = [
  { id: "red", name: "Merah", hex: "#e5484d" },
  { id: "green", name: "Hijau", hex: "#30a46c" },
  { id: "yellow", name: "Kuning", hex: "#f5a524" },
  { id: "blue", name: "Biru", hex: "#3e63dd" }
]

export const START_MONEY = 1500
export const START_BONUS = 200
export const JAIL_FINE = 50

function tile(id, name, type, extra = {}) {
  return { id, name, type, ...extra }
}

function property(id, name, price, rent, group, extra = {}) {
  return tile(id, name, "property", { price, rent, group, ...extra })
}

function station(id, name) {
  return tile(id, name, "station", { price: 200, rent: 25, group: "stasiun" })
}

function utility(id, name) {
  return tile(id, name, "utility", { price: 150, group: "utilitas" })
}

export const MONOPOLY_BOARD = [
  tile("start", "MULAI", "start"),
  property("tanjung_pinang", "Tanjung Pinang", 60, 4, "cokelat", { tag: "wisata" }),
  tile("dana_umum_1", "DANA UMUM", "community"),
  station("pelabuhan_tanjung_priok", "Pelabuhan Tanjung Priok"),
  tile("pajak_penghasilan", "PAJAK PENGHASILAN", "tax", { amount: 200 }),
  property("kota_tua", "Kawasan Kota Tua", 100, 6, "biru_muda", { tag: "wisata" }),
  station("stasiun_pasar_senen", "Stasiun Pasar Senen"),
  property("candi_borobudur", "Candi Borobudur", 140, 10, "biru_muda", { tag: "wisata" }),
  tile("kesempatan_1", "KESEMPATAN", "chance"),
  property("pasar_baru", "Pasar Baru", 160, 12, "biru_muda"),
  tile("penjara", "PENJARA", "jail"),
  property("makassar", "Makassar", 180, 14, "ungu"),
  tile("dana_umum_2", "DANA UMUM", "community"),
  property("labuan_bajo", "Labuan Bajo", 200, 16, "ungu", { tag: "wisata" }),
  property("lombok", "Lombok", 220, 18, "ungu", { tag: "wisata" }),
  utility("air", "AIR"),
  property("pura_besakih", "Pura Besakih", 240, 20, "oranye", { tag: "wisata" }),
  property("denpasar", "Bali Denpasar", 260, 22, "oranye", { tag: "wisata" }),
  tile("kesempatan_2", "KESEMPATAN", "chance"),
  property("kuta_bali", "Kuta Bali", 280, 24, "oranye", { tag: "wisata" }),
  tile("masuk_penjara", "MASUK PENJARA", "gotojail"),
  property("surabaya", "Surabaya", 300, 26, "merah"),
  tile("kesempatan_3", "KESEMPATAN", "chance"),
  property("semarang", "Semarang", 320, 28, "merah"),
  station("stasiun_gambir", "Stasiun Gambir"),
  property("yogyakarta", "Yogyakarta", 340, 30, "merah", { tag: "wisata" }),
  tile("dana_umum_3", "DANA UMUM", "community"),
  property("bandung", "Bandung", 350, 32, "merah"),
  property("mh_thamrin", "Jl. MH. Thamrin", 380, 35, "hijau"),
  property("jakarta_pusat", "Jakarta Pusat", 400, 38, "hijau"),
  tile("parkir_gratis", "PARKIR GRATIS", "freeparking"),
  property("medan", "Medan", 220, 18, "hijau_tua"),
  property("danau_toba", "Danau Toba", 240, 20, "hijau_tua", { tag: "wisata" }),
  utility("listrik", "LISTRIK"),
  property("palembang", "Palembang", 260, 22, "hijau_tua"),
  property("padang", "Padang", 280, 24, "hijau_tua"),
  tile("kesempatan_4", "KESEMPATAN", "chance"),
  property("batam", "Batam", 300, 26, "kuning"),
  property("banjarmasin", "Banjarmasin", 320, 28, "kuning"),
  property("balikpapan", "Balikpapan", 350, 32, "kuning")
]

export const CHANCE_CARDS = [
  { id: "chance_01", type: "chance", title: "Maju ke MULAI", text: "Pindahkan bidak ke petak MULAI dan terima M200.", effect: { kind: "moveAbsolute", target: "start", collectStart: true } },
  { id: "chance_02", type: "chance", title: "Jalan Tol Nusantara", text: "Maju 5 petak dari posisi sekarang.", effect: { kind: "moveRelative", step: 5 } },
  { id: "chance_03", type: "chance", title: "Kemacetan Kota", text: "Mundur 3 petak dari posisi sekarang.", effect: { kind: "moveRelative", step: -3 } },
  { id: "chance_04", type: "chance", title: "Naik Kereta Cepat", text: "Pindah ke stasiun terdekat. Jika milik lawan, bayar sewa 2x.", effect: { kind: "moveNearest", group: "stasiun", doubleRent: true } },
  { id: "chance_05", type: "chance", title: "Perjalanan Dinas", text: "Pindah ke Stasiun Gambir. Ambil M200 bila melewati MULAI.", effect: { kind: "moveAbsolute", target: "stasiun_gambir", collectStart: true } },
  { id: "chance_06", type: "chance", title: "Kunjungan Pelabuhan", text: "Pindah ke Pelabuhan Tanjung Priok. Ambil M200 bila melewati MULAI.", effect: { kind: "moveAbsolute", target: "pelabuhan_tanjung_priok", collectStart: true } },
  { id: "chance_07", type: "chance", title: "Bebas dari Penjara", text: "Simpan kartu ini. Gunakan otomatis saat berada di Penjara.", effect: { kind: "jailFree" } },
  { id: "chance_08", type: "chance", title: "Masuk Penjara", text: "Langsung menuju PENJARA. Jangan mengambil M200.", effect: { kind: "goToJail" } },
  { id: "chance_09", type: "chance", title: "Bonus Proyek Kota", text: "Terima bonus proyek sebesar M150 dari bank.", effect: { kind: "money", amount: 150 } },
  { id: "chance_10", type: "chance", title: "Dividen Investasi", text: "Terima dividen investasi sebesar M50.", effect: { kind: "money", amount: 50 } },
  { id: "chance_11", type: "chance", title: "Denda Pelanggaran Lalu Lintas", text: "Bayar denda sebesar M15.", effect: { kind: "money", amount: -15 } },
  { id: "chance_12", type: "chance", title: "Perbaikan Properti", text: "Bayar M25 per rumah dan M100 per hotel yang dimiliki.", effect: { kind: "propertyRepair", perHouse: 25, perHotel: 100 } },
  { id: "chance_13", type: "chance", title: "Festival Nusantara", text: "Terima keuntungan acara sebesar M75.", effect: { kind: "money", amount: 75 } },
  { id: "chance_14", type: "chance", title: "Jalan Pintas Wisata", text: "Maju ke properti wisata terdekat yang belum dimiliki. Bila tidak ada, maju 4 petak.", effect: { kind: "moveNearestUnowned", tag: "wisata", fallbackStep: 4 } },
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
  { id: "community_11", type: "community", title: "Bebas dari Penjara", text: "Simpan kartu ini. Gunakan otomatis saat berada di Penjara.", effect: { kind: "jailFree" } },
  { id: "community_12", type: "community", title: "Hari Ulang Tahun", text: "Setiap pemain lain membayar kamu M10.", effect: { kind: "collectFromEach", amount: 10 } },
  { id: "community_13", type: "community", title: "Bantuan Renovasi", text: "Terima M25 untuk setiap rumah dan M75 untuk setiap hotel yang dimiliki.", effect: { kind: "collectPerAsset", perHouse: 25, perHotel: 75 } },
  { id: "community_14", type: "community", title: "Perbaikan Fasilitas", text: "Bayar M20 per rumah dan M75 per hotel yang dimiliki.", effect: { kind: "propertyRepair", perHouse: 20, perHotel: 75 } },
  { id: "community_15", type: "community", title: "Cashback Bank", text: "Terima cashback sebesar M50.", effect: { kind: "money", amount: 50 } },
  { id: "community_16", type: "community", title: "Donasi Sosial", text: "Bayar donasi sosial sebesar M30.", effect: { kind: "money", amount: -30 } }
]

export function nowSeconds() {
  return Math.floor(Date.now() / 1000)
}

export function clean(value, max = 100) {
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
  const index = Number(position)
  return MONOPOLY_BOARD[((Number.isInteger(index) ? index : 0) % MONOPOLY_BOARD.length + MONOPOLY_BOARD.length) % MONOPOLY_BOARD.length]
}

export function tileIndex(id) {
  return MONOPOLY_BOARD.findIndex((item) => item.id === id)
}

export function playerSummary(player) {
  if (!player) return null
  return {
    jid: String(player.jid || ""),
    name: clean(player.name, 22) || "Pemain",
    color: colorMeta(player.color).id,
    money: Math.max(0, Number(player.money) || 0),
    position: Math.max(0, Math.min(39, Number(player.position) || 0)),
    positionName: tileAt(player.position).name,
    inJail: Boolean(player.inJail),
    jailFreeCards: Array.isArray(player.jailFreeCards) ? player.jailFreeCards.length : 0,
    bankrupt: Boolean(player.bankrupt),
    surrendered: Boolean(player.surrendered)
  }
}

export function createPlayer(jid, name, color) {
  return {
    jid: String(jid),
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
  }
}

function shuffle(list) {
  const result = list.slice()
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temporary = result[i]
    result[i] = result[j]
    result[j] = temporary
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

export function createRoom(chatId, hostJid, hostName) {
  const time = nowSeconds()
  return {
    version: 1,
    chatId: String(chatId),
    status: "waiting",
    createdAt: time,
    updatedAt: time,
    boardVersion: 1,
    host: String(hostJid),
    players: [createPlayer(hostJid, hostName, "red")],
    turn: 0,
    properties: {},
    cardDeck: newDeck(),
    pendingAction: null,
    lastDice: null,
    lastCard: null,
    lastEvent: null,
    winner: null,
    logs: [{ at: time, text: (clean(hostName, 22) || "Pemain") + " membuat room Monopoli." }]
  }
}

function normalizePlayer(player, index) {
  return {
    jid: String(player?.jid || ""),
    name: clean(player?.name, 22) || "Pemain",
    color: colorMeta(player?.color || MONOPOLY_COLORS[index]?.id || "red").id,
    money: Math.max(0, Number(player?.money) || START_MONEY),
    position: Math.max(0, Math.min(39, Number(player?.position) || 0)),
    inJail: Boolean(player?.inJail),
    jailAttempts: Math.max(0, Math.min(3, Number(player?.jailAttempts) || 0)),
    jailFreeCards: Array.isArray(player?.jailFreeCards)
      ? player.jailFreeCards.map((item) => ({ id: String(item?.id || ""), type: String(item?.type || "") })).filter((item) => item.id)
      : [],
    doublesStreak: Math.max(0, Math.min(3, Number(player?.doublesStreak) || 0)),
    bankrupt: Boolean(player?.bankrupt),
    surrendered: Boolean(player?.surrendered),
    joinedAt: Number(player?.joinedAt) || nowSeconds()
  }
}

function normalPropertyState(state) {
  return {
    owner: String(state?.owner || ""),
    houses: Math.max(0, Math.min(4, Number(state?.houses) || 0)),
    hotel: Boolean(state?.hotel),
    mortgaged: Boolean(state?.mortgaged)
  }
}

export function normalizeRoom(room) {
  if (!room || typeof room !== "object") return null
  room.version = 1
  room.chatId = String(room.chatId || "")
  room.status = ["waiting", "playing", "ended"].includes(room.status) ? room.status : "waiting"
  room.host = String(room.host || "")
  room.players = Array.isArray(room.players) ? room.players.slice(0, 4).map(normalizePlayer) : []
  if (!room.host && room.players[0]) room.host = room.players[0].jid
  room.turn = Math.max(0, Math.min(Math.max(0, room.players.length - 1), Number(room.turn) || 0))
  room.properties = room.properties && typeof room.properties === "object" ? Object.fromEntries(Object.entries(room.properties).map(([key, value]) => [key, normalPropertyState(value)])) : {}
  room.cardDeck = room.cardDeck && typeof room.cardDeck === "object" ? room.cardDeck : newDeck()
  for (const key of ["chance", "community", "usedChance", "usedCommunity"]) {
    if (!Array.isArray(room.cardDeck[key])) room.cardDeck[key] = []
  }
  room.pendingAction = room.pendingAction && typeof room.pendingAction === "object" ? room.pendingAction : null
  room.lastDice = room.lastDice && typeof room.lastDice === "object" ? room.lastDice : null
  room.lastCard = room.lastCard && typeof room.lastCard === "object" ? room.lastCard : null
  room.lastEvent = room.lastEvent && typeof room.lastEvent === "object" ? room.lastEvent : null
  room.winner = room.winner?.jid ? playerSummary(room.winner) : null
  room.logs = Array.isArray(room.logs) ? room.logs.slice(-20).map((item) => ({ at: Number(item?.at) || nowSeconds(), text: clean(item?.text, 220) })).filter((item) => item.text) : []
  room.createdAt = Number(room.createdAt) || nowSeconds()
  room.updatedAt = Number(room.updatedAt) || nowSeconds()
  room.boardVersion = Math.max(1, Number(room.boardVersion) || 1)
  return room
}

export function log(room, text) {
  room.logs = Array.isArray(room.logs) ? room.logs : []
  room.logs.push({ at: nowSeconds(), text: clean(text, 220) })
  room.logs = room.logs.slice(-20)
}

export function activePlayers(room) {
  return (room?.players || []).filter((player) => !player.surrendered && !player.bankrupt)
}

export function currentPlayer(room) {
  return room?.players?.[Number(room?.turn) || 0] || null
}

export function playerIndex(room, jid) {
  return (room?.players || []).findIndex((player) => String(player.jid) === String(jid))
}

export function propertyState(room, index) {
  const key = String(index)
  if (!room.properties[key]) room.properties[key] = normalPropertyState(null)
  return room.properties[key]
}

export function countAssets(room, jid) {
  let houses = 0
  let hotels = 0
  Object.values(room?.properties || {}).forEach((state) => {
    if (String(state?.owner || "") !== String(jid || "")) return
    houses += Number(state?.houses || 0)
    hotels += state?.hotel ? 1 : 0
  })
  return { houses, hotels }
}

export function ownedProperties(room, jid) {
  return MONOPOLY_BOARD.map((tile, index) => ({ tile, index, state: propertyState(room, index) }))
    .filter((entry) => ["property", "station", "utility"].includes(entry.tile.type) && String(entry.state.owner || "") === String(jid || ""))
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
  const all = type === "chance" ? CHANCE_CARDS : COMMUNITY_CARDS
  if (!Array.isArray(room.cardDeck[deckKey])) room.cardDeck[deckKey] = []
  if (!Array.isArray(room.cardDeck[usedKey])) room.cardDeck[usedKey] = []
  if (!room.cardDeck[deckKey].length) {
    room.cardDeck[deckKey] = shuffle(room.cardDeck[usedKey].filter((id) => cardById(id)?.effect?.kind !== "jailFree"))
    room.cardDeck[usedKey] = []
  }
  const id = room.cardDeck[deckKey].shift()
  if (!id) {
    room.cardDeck[deckKey] = shuffle(all.map((card) => card.id))
    return drawCard(room, type)
  }
  const card = findCard(id)
  if (card?.effect?.kind !== "jailFree") room.cardDeck[usedKey].push(id)
  return card
}

function returnJailCard(room, card) {
  if (!card?.id) return
  const deckKey = card.type === "chance" ? "chance" : "community"
  room.cardDeck[deckKey] = Array.isArray(room.cardDeck[deckKey]) ? room.cardDeck[deckKey] : []
  room.cardDeck[deckKey].push(card.id)
}

function advanceTurn(room) {
  const total = room.players.length
  for (let step = 1; step <= total; step++) {
    const index = (Number(room.turn) + step) % total
    const candidate = room.players[index]
    if (candidate && !candidate.surrendered && !candidate.bankrupt) {
      room.turn = index
      return candidate
    }
  }
  return currentPlayer(room)
}

function awardStart(player) {
  player.money += START_BONUS
}

function moveBy(room, player, step) {
  const before = Number(player.position) || 0
  let after = before + Number(step || 0)
  let passedStart = false
  while (after >= MONOPOLY_BOARD.length) {
    after -= MONOPOLY_BOARD.length
    passedStart = true
  }
  while (after < 0) after += MONOPOLY_BOARD.length
  player.position = after
  if (passedStart) awardStart(player)
  room.boardVersion += 1
  return { before, after, passedStart }
}

function moveTo(room, player, targetIndex, collectStart) {
  const before = Number(player.position) || 0
  const after = Math.max(0, Math.min(MONOPOLY_BOARD.length - 1, Number(targetIndex) || 0))
  const passedStart = Boolean(collectStart && after < before)
  player.position = after
  if (passedStart) awardStart(player)
  room.boardVersion += 1
  return { before, after, passedStart }
}

function nearestIndex(fromIndex, predicate) {
  for (let offset = 1; offset <= MONOPOLY_BOARD.length; offset++) {
    const index = (fromIndex + offset) % MONOPOLY_BOARD.length
    if (predicate(MONOPOLY_BOARD[index], index)) return index
  }
  return -1
}

function rentFor(room, index, diceTotal, multiplier = 1) {
  const tile = tileAt(index)
  const state = propertyState(room, index)
  if (state.mortgaged) return 0
  if (tile.type === "station") {
    const stations = MONOPOLY_BOARD.map((item, itemIndex) => ({ item, itemIndex }))
      .filter((entry) => entry.item.type === "station" && String(propertyState(room, entry.itemIndex).owner || "") === String(state.owner || ""))
      .length
    return Math.max(25, 25 * Math.pow(2, Math.max(0, stations - 1))) * multiplier
  }
  if (tile.type === "utility") {
    const utilities = MONOPOLY_BOARD.map((item, itemIndex) => ({ item, itemIndex }))
      .filter((entry) => entry.item.type === "utility" && String(propertyState(room, entry.itemIndex).owner || "") === String(state.owner || ""))
      .length
    return Math.max(1, Number(diceTotal) || 1) * (utilities >= 2 ? 10 : 4) * multiplier
  }
  const buildings = state.hotel ? 5 : Number(state.houses || 0)
  return Math.max(1, Number(tile.rent || 0) * (buildings ? (buildings === 5 ? 10 : (buildings + 1)) : 1) * multiplier)
}

function releaseProperties(room, jid) {
  Object.values(room.properties).forEach((state) => {
    if (String(state.owner || "") === String(jid || "")) {
      state.owner = ""
      state.houses = 0
      state.hotel = false
      state.mortgaged = false
    }
  })
}

function maybeBankrupt(room, player) {
  if (player.money >= 0) return false
  player.money = 0
  player.bankrupt = true
  releaseProperties(room, player.jid)
  log(room, player.name + " bangkrut dan keluar dari permainan.")
  return true
}

function transfer(room, from, to, amount) {
  const total = Math.max(0, Number(amount) || 0)
  from.money -= total
  if (to) to.money += total
  maybeBankrupt(room, from)
  return total
}

function goToJail(room, player) {
  const jail = tileIndex("penjara")
  player.position = jail >= 0 ? jail : 10
  player.inJail = true
  player.jailAttempts = 0
  player.doublesStreak = 0
  room.boardVersion += 1
}

function applyCard(room, playerIndexValue, card, context = {}) {
  const player = room.players[playerIndexValue]
  const effect = card?.effect || {}
  const result = { type: card?.type || "chance", id: card?.id || "", title: card?.title || "", text: card?.text || "", effects: [] }
  if (!player || !card) return result

  if (effect.kind === "money") {
    player.money += Number(effect.amount || 0)
    result.effects.push(Number(effect.amount || 0) >= 0 ? "Menerima M" + Number(effect.amount || 0) : "Membayar M" + Math.abs(Number(effect.amount || 0)))
    maybeBankrupt(room, player)
  }

  if (effect.kind === "moveRelative") {
    const moved = moveBy(room, player, Number(effect.step || 0))
    result.effects.push(Number(effect.step || 0) >= 0 ? "Maju " + Number(effect.step || 0) + " petak" : "Mundur " + Math.abs(Number(effect.step || 0)) + " petak")
    if (moved.passedStart) result.effects.push("Melewati MULAI dan menerima M200")
    result.moved = true
  }

  if (effect.kind === "moveAbsolute") {
    const target = tileIndex(effect.target)
    const moved = moveTo(room, player, target, Boolean(effect.collectStart))
    result.effects.push("Pindah ke " + tileAt(target).name)
    if (moved.passedStart) result.effects.push("Melewati MULAI dan menerima M200")
    result.moved = true
  }

  if (effect.kind === "moveNearest") {
    const target = nearestIndex(player.position, (candidate) => candidate.group === effect.group)
    if (target >= 0) {
      const moved = moveTo(room, player, target, true)
      result.effects.push("Pindah ke " + tileAt(target).name)
      if (moved.passedStart) result.effects.push("Melewati MULAI dan menerima M200")
      result.rentMultiplier = effect.doubleRent ? 2 : 1
      result.moved = true
    }
  }

  if (effect.kind === "moveNearestUnowned") {
    const target = nearestIndex(player.position, (candidate, index) => candidate.tag === effect.tag && !propertyState(room, index).owner)
    if (target >= 0) {
      const moved = moveTo(room, player, target, true)
      result.effects.push("Pindah ke " + tileAt(target).name)
      if (moved.passedStart) result.effects.push("Melewati MULAI dan menerima M200")
      result.moved = true
    } else {
      const moved = moveBy(room, player, Number(effect.fallbackStep || 0))
      result.effects.push("Tidak ada properti wisata kosong, maju " + Number(effect.fallbackStep || 0) + " petak")
      if (moved.passedStart) result.effects.push("Melewati MULAI dan menerima M200")
      result.moved = true
    }
  }

  if (effect.kind === "jailFree") {
    player.jailFreeCards.push({ id: card.id, type: card.type })
    result.effects.push("Kartu Bebas dari Penjara disimpan")
  }

  if (effect.kind === "goToJail") {
    goToJail(room, player)
    result.effects.push("Masuk Penjara")
    result.sentToJail = true
  }

  if (effect.kind === "propertyRepair" || effect.kind === "collectPerAsset") {
    const assets = countAssets(room, player.jid)
    const total = assets.houses * Number(effect.perHouse || 0) + assets.hotels * Number(effect.perHotel || 0)
    player.money += effect.kind === "collectPerAsset" ? total : -total
    result.effects.push((effect.kind === "collectPerAsset" ? "Menerima M" : "Membayar M") + total + " untuk " + assets.houses + " rumah dan " + assets.hotels + " hotel")
    maybeBankrupt(room, player)
  }

  if (effect.kind === "collectFromEach") {
    const amount = Number(effect.amount || 0)
    let received = 0
    room.players.forEach((other, index) => {
      if (index === playerIndexValue || other.surrendered || other.bankrupt) return
      const paid = transfer(room, other, player, amount)
      received += paid
    })
    result.effects.push("Menerima total M" + received + " dari pemain lain")
  }

  return result
}

function resolveLanding(room, playerIndexValue, options = {}) {
  const player = room.players[playerIndexValue]
  if (!player) return { kind: "none" }
  const index = Number(player.position) || 0
  const tile = tileAt(index)
  const result = { kind: tile.type, tile: { ...tile }, index, messages: [] }

  if (["property", "station", "utility"].includes(tile.type)) {
    const state = propertyState(room, index)
    if (!state.owner) {
      room.pendingAction = {
        type: "buy",
        sender: player.jid,
        tileIndex: index,
        extraTurn: Boolean(options.extraTurn),
        diceTotal: Number(options.diceTotal || 0)
      }
      result.needsBuy = true
      result.price = tile.price
      result.messages.push("Properti belum dimiliki")
      return result
    }
    if (String(state.owner) !== String(player.jid)) {
      const owner = room.players.find((candidate) => String(candidate.jid) === String(state.owner))
      const rent = rentFor(room, index, options.diceTotal, options.rentMultiplier || 1)
      const paid = transfer(room, player, owner, rent)
      result.rent = paid
      result.owner = owner ? playerSummary(owner) : null
      result.messages.push("Membayar sewa M" + paid)
    } else {
      result.messages.push("Properti milik sendiri")
    }
    return result
  }

  if (tile.type === "tax") {
    player.money -= Number(tile.amount || 0)
    maybeBankrupt(room, player)
    result.tax = Number(tile.amount || 0)
    result.messages.push("Membayar pajak M" + result.tax)
    return result
  }

  if (tile.type === "gotojail") {
    goToJail(room, player)
    result.sentToJail = true
    result.messages.push("Masuk Penjara")
    return result
  }

  if (tile.type === "chance" || tile.type === "community") {
    const card = drawCard(room, tile.type)
    const cardResult = applyCard(room, playerIndexValue, card, options)
    room.lastCard = cardResult
    result.card = cardResult
    result.messages.push("Mengambil kartu " + (tile.type === "chance" ? "Kesempatan" : "Dana Umum"))
    if (cardResult.moved && !cardResult.sentToJail && Number(options.depth || 0) < 2) {
      const next = resolveLanding(room, playerIndexValue, { ...options, depth: Number(options.depth || 0) + 1, rentMultiplier: cardResult.rentMultiplier || 1 })
      result.followUp = next
    }
    return result
  }

  if (tile.type === "jail") {
    result.messages.push("Hanya singgah di Penjara")
  }

  return result
}

function endAction(room, actor, extraTurn) {
  room.pendingAction = null
  if (activePlayers(room).length <= 1) {
    const winner = activePlayers(room)[0] || actor
    room.status = "ended"
    room.winner = playerSummary(winner)
    return { ended: true, next: null }
  }
  if (extraTurn && !actor.inJail && !actor.bankrupt) {
    return { ended: false, next: actor }
  }
  return { ended: false, next: advanceTurn(room) }
}

export function startRoom(room) {
  if (activePlayers(room).length < 2) return { ok: false, message: "Minimal 2 pemain untuk memulai permainan." }
  room.status = "playing"
  room.turn = room.players.findIndex((player) => !player.surrendered && !player.bankrupt)
  room.pendingAction = null
  room.lastCard = null
  room.lastEvent = { type: "start", actor: playerSummary(currentPlayer(room)), next: playerSummary(currentPlayer(room)) }
  log(room, "Game Monopoli dimulai. Giliran " + currentPlayer(room).name + ".")
  return { ok: true, event: room.lastEvent }
}

export function rollRoom(room, sender) {
  if (room.status !== "playing") return { ok: false, message: "Game belum dimulai." }
  if (room.pendingAction) return { ok: false, message: "Selesaikan pilihan beli terlebih dahulu." }
  const player = currentPlayer(room)
  if (!player || String(player.jid) !== String(sender)) return { ok: false, message: "Bukan giliran kamu." }
  if (player.inJail && player.jailFreeCards.length) {
    const saved = player.jailFreeCards.shift()
    returnJailCard(room, saved)
    player.inJail = false
    player.jailAttempts = 0
    log(room, player.name + " menggunakan kartu Bebas dari Penjara.")
  }

  const first = Math.floor(Math.random() * 6) + 1
  const second = Math.floor(Math.random() * 6) + 1
  const total = first + second
  const isDouble = first === second
  room.lastCard = null
  room.lastDice = { first, second, total, double: isDouble }

  if (player.inJail) {
    player.jailAttempts += 1
    if (!isDouble && player.jailAttempts < 3) {
      const next = advanceTurn(room)
      room.lastEvent = { type: "jail_wait", actor: playerSummary(player), dice: room.lastDice, next: playerSummary(next), message: "Belum mendapat dadu kembar untuk keluar dari Penjara." }
      log(room, player.name + " belum mendapat dadu kembar dan tetap di Penjara.")
      return { ok: true, event: room.lastEvent }
    }
    if (!isDouble) {
      player.money -= JAIL_FINE
      maybeBankrupt(room, player)
      log(room, player.name + " membayar denda Penjara M" + JAIL_FINE + ".")
    }
    player.inJail = false
    player.jailAttempts = 0
  }

  if (isDouble) player.doublesStreak += 1
  else player.doublesStreak = 0

  if (player.doublesStreak >= 3) {
    goToJail(room, player)
    const next = advanceTurn(room)
    room.lastEvent = { type: "three_doubles", actor: playerSummary(player), dice: room.lastDice, next: playerSummary(next), message: "Tiga dadu kembar berturut-turut. Masuk Penjara." }
    log(room, player.name + " mendapat tiga dadu kembar dan masuk Penjara.")
    return { ok: true, event: room.lastEvent }
  }

  const before = player.position
  const moved = moveBy(room, player, total)
  const landing = resolveLanding(room, room.turn, { diceTotal: total, extraTurn: isDouble })
  const event = {
    type: "roll",
    actor: playerSummary(player),
    dice: room.lastDice,
    from: { index: before, name: tileAt(before).name },
    to: { index: player.position, name: tileAt(player.position).name },
    passedStart: moved.passedStart,
    landing,
    card: room.lastCard,
    extraTurn: isDouble,
    next: null
  }

  if (!room.pendingAction) {
    const turn = endAction(room, player, isDouble && !player.inJail)
    event.ended = turn.ended
    event.next = playerSummary(turn.next)
  } else {
    event.next = playerSummary(player)
  }

  room.lastEvent = event
  log(room, player.name + " mendapat " + first + " + " + second + " dan tiba di " + tileAt(player.position).name + ".")
  return { ok: true, event }
}

export function buyRoom(room, sender, buy) {
  if (room.status !== "playing") return { ok: false, message: "Game belum dimulai." }
  const pending = room.pendingAction
  if (!pending || pending.type !== "buy") return { ok: false, message: "Tidak ada properti yang menunggu keputusan." }
  if (String(pending.sender) !== String(sender)) return { ok: false, message: "Bukan pilihan kamu." }
  const player = currentPlayer(room)
  const index = Number(pending.tileIndex)
  const tile = tileAt(index)
  const state = propertyState(room, index)
  if (!player || !["property", "station", "utility"].includes(tile.type) || state.owner) return { ok: false, message: "Properti ini sudah tidak tersedia." }
  const event = { type: buy ? "buy" : "pass", actor: playerSummary(player), tile: { ...tile }, price: tile.price, next: null }
  if (buy) {
    if (player.money < tile.price) return { ok: false, message: "Saldo tidak cukup untuk membeli properti ini." }
    player.money -= tile.price
    state.owner = player.jid
    room.boardVersion += 1
    event.message = "Berhasil membeli " + tile.name + "."
    log(room, player.name + " membeli " + tile.name + " seharga M" + tile.price + ".")
  } else {
    event.message = "Melewati kesempatan membeli " + tile.name + "."
    log(room, player.name + " melewati " + tile.name + ".")
  }
  const turn = endAction(room, player, Boolean(pending.extraTurn))
  event.next = playerSummary(turn.next)
  event.ended = turn.ended
  room.lastEvent = event
  return { ok: true, event }
}

export function leaveRoom(room, sender) {
  const index = playerIndex(room, sender)
  if (index < 0) return { ok: false, message: "Kamu sudah keluar dari permainan ini." }
  const player = room.players[index]
  if (player.surrendered) return { ok: false, message: "Kamu sudah keluar dari permainan ini." }
  player.surrendered = true
  player.inJail = false
  releaseProperties(room, player.jid)
  room.boardVersion += 1
  let next = currentPlayer(room)
  if (index === room.turn) next = advanceTurn(room)
  if (activePlayers(room).length <= 1 && room.status === "playing") {
    room.status = "ended"
    room.winner = playerSummary(activePlayers(room)[0])
    next = null
  }
  room.lastEvent = { type: "leave", actor: playerSummary(player), next: playerSummary(next), ended: room.status === "ended" }
  log(room, player.name + " keluar dari permainan.")
  return { ok: true, event: room.lastEvent }
}

export function publicRoom(room) {
  const copy = JSON.parse(JSON.stringify(room))
  delete copy.cardDeck
  return copy
}
