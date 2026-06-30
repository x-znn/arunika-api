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

      <section className="border border-neutral-300 bg-[#f5f3ee] p-6 md:p-10">
  <p className="mb-4 text-sm font-extrabold uppercase tracking-[0.18em] text-[#f97316]">
    Support
  </p>

  <h2 className="text-4xl font-black leading-none tracking-tight text-[#111827] md:text-6xl">
    Butuh bantuan?
  </h2>

  <p className="mt-6 max-w-3xl text-lg leading-9 text-[#6b7280]">
    Hubungi saya lewat platform berikut.
  </p>

  <div className="mt-8 flex flex-col gap-4">
    <a href="https://wa.me/6285348284121" target="_blank" rel="noreferrer" className="border border-neutral-300 bg-white px-5 py-4 text-xl font-bold text-[#111827] hover:border-[#f97316]">
      WhatsApp — 085348284121
    </a>

    <a href="https://instagram.com/znn_id" target="_blank" rel="noreferrer" className="border border-neutral-300 bg-white px-5 py-4 text-xl font-bold text-[#111827] hover:border-[#f97316]">
      Instagram — @znn_id
    </a>

    <a href="https://github.com/x-znn" target="_blank" rel="noreferrer" className="border border-neutral-300 bg-white px-5 py-4 text-xl font-bold text-[#111827] hover:border-[#f97316]">
      GitHub — x-znn
    </a>
  </div>
</section>

      <footer className="paper-footer">
        <span>ARUNIKA APIs. / v1.0</span>
        <span>Built for WhatsApp bot workflows.</span>
      </footer>
    </main>
  )
}
