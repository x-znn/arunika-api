import Nav from "../components/Nav"

const sampleUrl = "/api/v1/ignote?name=Fauzann&text=Halo%20semua&time=8%20detik"

export default function DocsPage() {
  return (
    <main>
      <Nav />
      <section className="page-hero section-shell compact">
        <div className="eyebrow">DOCUMENTATION / V1</div>
        <h1>Mulai memakai Arunika API.</h1>
        <p>Endpoint generator gambar menerima parameter URL dan membalas file PNG. Tambahkan <code>apikey</code> saat environment <code>API_KEY</code> aktif.</p>
      </section>

      <section className="docs-layout section-shell">
        <aside className="docs-side">
          <a href="#ignote">IG Note</a>
          <a href="#health">Health Check</a>
          <a href="#stats">Stats</a>
          <a href="#security">Security</a>
          <a href="#bot">Bot WA</a>
        </aside>
        <div className="docs-content">
          <section id="ignote" className="docs-section">
            <div className="endpoint-title"><span className="method">GET</span><h2>IG Note Image</h2></div>
            <p>Menghasilkan gambar fake note vertikal dengan avatar kosong, nama, waktu, bubble pesan, input pesan, dan keyboard.</p>
            <div className="route-line">/api/v1/ignote</div>
            <h3>Query parameters</h3>
            <div className="param-table">
              <div><code>name</code><span>string</span><p>Nama pengirim. Maksimum 32 karakter.</p></div>
              <div><code>text</code><span>string</span><p>Isi bubble pesan. Maksimum 120 karakter.</p></div>
              <div><code>time</code><span>string</span><p>Teks waktu. Opsional, bila kosong akan dibuat acak.</p></div>
              <div><code>apikey</code><span>string</span><p>Wajib hanya bila <code>API_KEY</code> aktif.</p></div>
            </div>
            <h3>Example request</h3>
            <pre className="code-panel">GET {sampleUrl}</pre>
            <h3>Response</h3>
            <pre className="code-panel">Content-Type: image/png</pre>
          </section>

          <section id="health" className="docs-section">
            <div className="endpoint-title"><span className="method">GET</span><h2>Health Check</h2></div>
            <div className="route-line">/api/health</div>
            <pre className="code-panel">{`{
  "status": true,
  "service": "arunika-api",
  "version": "1.0.0",
  "keyRequired": false,
  "statsConnected": false
}`}</pre>
          </section>

          <section id="stats" className="docs-section">
            <div className="endpoint-title"><span className="method">GET</span><h2>API Stats</h2></div>
            <div className="route-line">/api/stats</div>
            <p>Statistik akan aktif setelah <code>UPSTASH_REDIS_REST_URL</code> dan <code>UPSTASH_REDIS_REST_TOKEN</code> dipasang di Vercel.</p>
          </section>

          <section id="security" className="docs-section">
            <h2>Security</h2>
            <p>Set <code>API_KEY</code> di Vercel lalu kirim key lewat query <code>?apikey=...</code> atau header <code>x-api-key</code>. Jangan masukkan API key ke repository GitHub.</p>
          </section>

          <section id="bot" className="docs-section">
            <h2>Dipakai di bot WA</h2>
            <pre className="code-panel">{`const url = api +
  "?name=" + encodeURIComponent(name) +
  "&text=" + encodeURIComponent(text) +
  "&time=" + encodeURIComponent(time) +
  "&apikey=" + encodeURIComponent(apiKey)

await bot.reply({ url, asImage: true })`}</pre>
          </section>
        </div>
      </section>
    </main>
  )
}
