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

          <h1>
            Simple API untuk
            <br />
            bot WhatsApp.
          </h1>

          <p>
            simple rest api by @znn_id
          </p>

          <div className="intro-actions">
            <Link href="/docs" className="action-button action-button--solid">
              ▣ Docs
            </Link>

            <Link href="/playground" className="action-button">
              ◉ Playground
            </Link>

            <Link href="/dashboard" className="action-button">
              ↗ Stats
            </Link>
          </div>
        </div>

        <div className="intro-art">
          <img
            src="/arunika-hero.svg"
            alt="Arunika API"
          />
        </div>
      </section>

      <section className="request-strip">
        <b>LIVE</b>

        <div>
          <span>API status</span>
          <b>Online & ready</b>
        </div>

        <div>
          <span>Kategori fitur</span>
          <b>Maker · Game · System</b>
        </div>

        <Link href="/api/health">Check status ↗</Link>
      </section>

      <EndpointExplorer />

      <footer className="paper-footer">
        <span>ARUNIKA APIs. by @znn_id</span>
        <span>Built for WhatsApp bot workflows.</span>
      </footer>
    </main>
  )
}
