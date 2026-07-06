export const API_CATEGORIES = [
  {
    id: "maker",
    label: "Maker",
    icon: "✦",
    description: "Generator gambar dan tampilan siap pakai untuk bot WhatsApp."
  },
  {
    id: "game",
    label: "Game",
    icon: "◈",
    description: "Endpoint stateful untuk Monopoly, Ludo, Spy, dan Absensi grup."
  },
  {
    id: "system",
    label: "System",
    icon: "▣",
    description: "Endpoint pemeriksaan server dan statistik penggunaan API."
  }
]

const roomField = {
  key: "room",
  label: "Room",
  placeholder: "id-grup@g.us",
  defaultValue: "id-grup@g.us"
}

export const API_ENDPOINTS = [
  {
    id: "ignote",
    name: "ignote",
    category: "maker",
    group: "MAKER · IMAGE",
    method: "GET",
    title: "IG Note",
    route: "/api/v1/ignote",
    description: "Membuat gambar Instagram Note PNG yang siap dikirim langsung oleh bot WhatsApp.",
    image: true,
    preview: "portrait",
    params: [
      { key: "name", label: "Nama", placeholder: "zann", defaultValue: "zann" },
      { key: "text", label: "Teks", placeholder: "Halo semua", defaultValue: "Halo semua" },
      { key: "time", label: "Waktu", placeholder: "3 menit", defaultValue: "3 menit" }
    ]
  },
  {
    id: "ignote-json",
    name: "ignote-json",
    category: "maker",
    group: "MAKER · IMAGE",
    method: "GET",
    title: "IG Note JSON",
    route: "/api/v1/ignote/json",
    description: "Mengembalikan data IG Note beserta URL gambar generator dalam format JSON.",
    params: [
      { key: "name", label: "Nama", placeholder: "zann", defaultValue: "zann" },
      { key: "text", label: "Teks", placeholder: "Halo semua", defaultValue: "Halo semua" }
    ]
  },
  {
    id: "iqc",
    name: "iqc",
    category: "maker",
    group: "MAKER · TEXT",
    method: "GET",
    title: "IQC Text",
    route: "/api/v1/iqc",
    description: "Membuat tampilan WhatsApp long-press untuk pesan teks. Template otomatis dipilih berdasarkan panjang teks: maksimal 29 karakter untuk satu baris, lalu dua baris sampai 58 karakter.",
    image: true,
    preview: "portrait",
    params: [
      { key: "text", label: "Teks", placeholder: "Jadi brasa di sayaang", defaultValue: "Jadi brasa di sayaang" }
    ]
  },
  {
    id: "fakereact",
    name: "fakereact",
    category: "maker",
    group: "MAKER · IMAGE",
    method: "POST",
    title: "Fake React",
    route: "/api/v1/fakereact",
    description: "Pilih gambar langsung dari galeri lalu buat visual WhatsApp long-press lengkap dengan reaction bar dan menu konteks.",
    image: true,
    preview: "portrait",
    acceptsFile: true,
    params: []
  },
  {
    id: "monopoly-action",
    name: "monopoly-action",
    category: "game",
    group: "GAME · MONOPOLY",
    method: "POST",
    title: "Monopoly Action",
    route: "/api/v1/monopoly",
    description: "Membuat room, join, roll dadu, membeli properti, membayar sewa, upgrade, dan reset Monopoly Indonesia.",
    liveAction: true,
    params: [],
    body: `{
  "action": "status",
  "room": "id-grup@g.us",
  "sender": "nomor-pemain@lid",
  "name": "Nama Pemain"
}`
  },
  {
    id: "monopoly-room",
    name: "monopoly-room",
    category: "game",
    group: "GAME · MONOPOLY",
    method: "GET",
    title: "Monopoly Room",
    route: "/api/v1/monopoly",
    description: "Mengambil kondisi room, cash, posisi pemain, properti, rumah, hotel, serta giliran Monopoly.",
    params: [roomField]
  },
  {
    id: "monopoly-board",
    name: "monopoly-board",
    category: "game",
    group: "GAME · MONOPOLY",
    method: "GET",
    title: "Monopoly Board",
    route: "/api/v1/monopoly/board",
    description: "Membuat gambar papan Monopoly Indonesia dari room aktif.",
    image: true,
    preview: "board",
    params: [roomField]
  },
  {
    id: "monopoly-card",
    name: "monopoly-card",
    category: "game",
    group: "GAME · MONOPOLY",
    method: "GET",
    title: "Monopoly Card",
    route: "/api/v1/monopoly/card",
    description: "Membuat gambar kartu Kesempatan atau Dana Umum berbentuk portrait.",
    image: true,
    preview: "portrait",
    params: [
      { key: "id", label: "ID Kartu", placeholder: "chance_01", defaultValue: "chance_01" }
    ]
  },
  {
    id: "ludo-action",
    name: "ludo-action",
    category: "game",
    group: "GAME · LUDO",
    method: "POST",
    title: "Ludo Action",
    route: "/api/v1/ludo",
    description: "Menjalankan create, join, start, roll, move, leave, reset, board, dan status pada room Ludo.",
    liveAction: true,
    params: [],
    body: `{
  "action": "status",
  "room": "id-grup@g.us",
  "sender": "nomor-pemain@lid",
  "name": "Nama Pemain"
}`
  },
  {
    id: "ludo-room",
    name: "ludo-room",
    category: "game",
    group: "GAME · LUDO",
    method: "GET",
    title: "Ludo Room",
    route: "/api/v1/ludo",
    description: "Mengambil status room, pemain, pion, dadu terakhir, dan giliran Ludo.",
    params: [roomField]
  },
  {
    id: "ludo-board",
    name: "ludo-board",
    category: "game",
    group: "GAME · LUDO",
    method: "GET",
    title: "Ludo Board",
    route: "/api/v1/ludo/board",
    description: "Membuat gambar papan Ludo berdasarkan room aktif.",
    image: true,
    preview: "board",
    params: [roomField]
  },
  {
    id: "spy-action",
    name: "spy-action",
    category: "game",
    group: "GAME · SPY",
    method: "POST",
    title: "Who Is The Spy",
    route: "/api/v1/spy",
    description: "Membuat room, join, start, kirim clue, voting, leave, dan reset permainan Who Is The Spy.",
    liveAction: true,
    params: [],
    body: `{
  "action": "status",
  "room": "id-grup@g.us",
  "sender": "nomor-pemain@lid",
  "name": "Nama Pemain"
}`
  },
  {
    id: "spy-room",
    name: "spy-room",
    category: "game",
    group: "GAME · SPY",
    method: "GET",
    title: "Spy Room",
    route: "/api/v1/spy",
    description: "Mengambil status room, pemain aktif, clue, voting, dan event terakhir Spy.",
    params: [roomField]
  },
  {
    id: "absen-action",
    name: "absen-action",
    category: "game",
    group: "GAME · ABSENSI",
    method: "POST",
    title: "Absensi Group",
    route: "/api/v1/absen",
    description: "Menjalankan hadir, izin, sakit, status, rekap, setjam, reset, dan jadwal absensi grup.",
    liveAction: true,
    params: [],
    body: `{
  "action": "status",
  "room": "id-grup@g.us",
  "sender": "nomor-pemain@lid",
  "name": "Nama Peserta"
}`
  },
  {
    id: "absen-room",
    name: "absen-room",
    category: "game",
    group: "GAME · ABSENSI",
    method: "GET",
    title: "Absensi Status",
    route: "/api/v1/absen",
    description: "Mengambil status dan rekap absensi dari room tertentu.",
    params: [roomField]
  },
  {
    id: "api-health",
    name: "health",
    category: "system",
    group: "SYSTEM",
    method: "GET",
    title: "Health Check",
    route: "/api/health",
    description: "Mengecek apakah server Arunika API sedang online dan siap menerima request.",
    params: []
  },
  {
    id: "api-stats",
    name: "stats",
    category: "system",
    group: "SYSTEM",
    method: "GET",
    title: "API Statistics",
    route: "/api/stats",
    description: "Mengambil total request, hit hari ini, dan rincian hit semua fitur Arunika.",
    params: []
  }
]

export function endpointById(id) {
  return API_ENDPOINTS.find((item) => item.id === id) || API_ENDPOINTS[0]
}
