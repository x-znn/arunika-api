import Link from "next/link"
import Nav from "./components/Nav"
import EndpointExplorer from "./components/EndpointExplorer"

export default function HomePage() {
  return (
    <main className="paper-site">
      <Nav />

      <section className="intro-wrap">
        <div className="intro-copy">
          <span className="section-label">ARUNIKA API PLATFORM</span>
          <h1>Simple API untuk<br />bot WhatsApp.</h1>
          <p>
            Generate gambar, uji endpoint, dan pakai URL hasilnya langsung di script bot.
            Dibuat ringkas untuk kebutuhan command yang cepat dan rapi.
          </p>
          <div className="intro-actions">
            <Link href="/docs" className="action-button action-button--solid">▣ Docs</Link>
            <Link href="/playground" className="action-button">◉ Playground</Link>
            <Link href="/dashboard" className="action-button">↗ Stats</Link>
          </div>
        </div>

        <div className="intro-art">
          <img src="/arunika-hero.svg" alt="Ilustrasi abstrak Arunika API" />
        </div>
      </section>

      <section className="request-strip">
        <strong>LIVE</strong>
        <div>
          <span>API status</span>
          <b>Online & ready</b>
        </div>
        <div>
          <span>Image endpoint</span>
          <b>PNG output</b>
        </div>
        <Link href="/api/health">Check status ↗</Link>
      </section>

      <EndpointExplorer />

      <section className="usage-panel">
        <div>
          <span className="section-label">LICENSE & USAGE</span>
          <h2>Dipakai untuk proyek bot pribadi.</h2>
          <p>
            Pakai endpoint dengan wajar. Buat API key saat endpoint mulai dipakai publik,
            lalu aktifkan statistik Upstash agar request bisa dipantau dari dashboard.
          </p>
        </div>
        <ul>
          <li><span>✓</span> Tanpa autentikasi saat API key belum diaktifkan</li>
          <li><span>✓</span> Endpoint siap untuk request URL image</li>
          <li><span>✓</span> Statistik tersedia saat Upstash tersambung</li>
        </ul>
      </section>

      <footer className="paper-footer">
        <span>ARUNIKA APIs. / v1.0</span>
        <span>Built for WhatsApp bot workflows.</span>
      </footer>
    </main>
  )
}
