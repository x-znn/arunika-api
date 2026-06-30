# Arunika API

Website REST API berbasis Next.js untuk generator gambar bot WhatsApp.

## Endpoint saat ini

- `GET /api/v1/ignote` → PNG fake note
- `GET /api/v1/ignote/json` → JSON berisi URL gambar
- `GET /api/health` → status API
- `GET /api/stats` → statistik dari Upstash
- `/` → landing page
- `/docs` → dokumentasi
- `/playground` → coba endpoint langsung
- `/dashboard` → statistik request

## Deploy ke Vercel

1. Upload isi folder ini ke repository GitHub baru bernama `arunika-api`.
2. Buka Vercel, pilih **Add New → Project**, lalu import repository tersebut.
3. Biarkan Vercel mendeteksi framework **Next.js**.
4. Jangan isi Build Command atau Output Directory manual.
5. Tekan Deploy.

## Environment variables

Minimal yang disarankan:

```env
API_KEY=buat_key_yang_panjang_dan_acak
```

Aktifkan statistik dan rate limit dengan Upstash Redis:

```env
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

Setelah menambah atau mengubah environment variable di Vercel, lakukan deployment baru.

## Contoh endpoint

```text
https://DOMAIN-KAMU.vercel.app/api/v1/ignote?name=Fauzann&text=Halo%20semua&time=8%20detik&apikey=API_KEY_KAMU
```

## Untuk script bot

```js
const api = "https://DOMAIN-KAMU.vercel.app/api/v1/ignote"
const url = api +
  "?name=" + encodeURIComponent(name) +
  "&text=" + encodeURIComponent(text) +
  "&time=" + encodeURIComponent(time) +
  "&apikey=" + encodeURIComponent(apiKey)

await bot.reply({ url, asImage: true })
```

## Catatan keamanan

- Jangan upload `.env` atau API key ke GitHub.
- Untuk API yang benar-benar pribadi, gunakan API key dan jangan bagikan URL lengkap yang mengandung key.
- Rate limit dan statistik hanya aktif bila environment Upstash Redis diisi.
