import Nav from "../components/Nav"

const sampleUrl = "/api/v1/ignote?name=Fauzann&text=Halo%20semua&time=8%20detik"

export default function DocsPage() {
  return (
    <main className="paper-site">
      <Nav />
      <section className="page-intro page-intro--docs">
        <span className="section-label">DOCUMENTATION / V1.0</span>
        <h1>Arunika API docs.</h1>
        <p>Format endpoint, parameter, dan contoh request untuk dipasang ke bot WhatsApp.</p>
      </section>

      <section className="docs-paper">
        <aside className="docs-nav">
          <span>ON THIS PAGE</span>
          <a href="#ignote">IG Note</a>
          <a href="#health">Health status</a>
          <a href="#stats">Stats</a>
          <a href="#bot">Bot WA</a>
        </aside>

        <div className="docs-sheet">
          <section id="ignote" className="docs-block">
            <div className="docs-route"><span className="http-pill">GET</span><code>/api/v1/ignote</code></div>
            <h2>IG Note Generator</h2>
            <p>Merender gambar note dengan nama, waktu, dan bubble teks. Respons endpoint langsung berupa PNG.</p>
            <div className="param-grid">
              <div><code>name</code><span>string</span><p>Nama pengirim.</p></div>
              <div><code>text</code><span>string</span><p>Isi note.</p></div>
              <div><code>time</code><span>string</span><p>Label waktu opsional.</p></div>
              <div><code>apikey</code><span>string</span><p>Dipakai saat API_KEY aktif.</p></div>
            </div>
            <pre>{`GET ${sampleUrl}`}</pre>
          </section>

          <section id="health" className="docs-block">
            <div className="docs-route"><span className="http-pill">GET</span><code>/api/health</code></div>
            <h2>Health status</h2>
            <p>Mengecek apakah function hidup serta apakah API key dan Upstash sudah terkoneksi.</p>
          </section>

          <section id="stats" className="docs-block">
            <div className="docs-route"><span className="http-pill">GET</span><code>/api/stats</code></div>
            <h2>Request statistics</h2>
            <p>Statistik akan bernilai penuh setelah environment Upstash diisi pada Vercel.</p>
          </section>

          <section id="bot" className="docs-block">
            <span className="section-label">SANDBOX EXAMPLE</span>
            <h2>Dipakai di script bot.</h2>
            <pre>{`const url = api +
  "?name=" + encodeURIComponent(name) +
  "&text=" + encodeURIComponent(text) +
  "&time=" + encodeURIComponent(time)

await bot.reply({ url, asImage: true })`}</pre>
          </section>
        </div>
      </section>
    </main>
  )
}
