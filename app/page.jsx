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

      <<section className="border border-neutral-300 bg-[#f5f3ee] p-6 md:p-10">
  <p className="mb-4 text-sm font-extrabold uppercase tracking-[0.18em] text-[#f97316]">
    Support
  </p>

  <h2 className="max-w-3xl text-4xl font-black leading-none tracking-tight text-[#111827] md:text-6xl">
    Hubungi saya untuk support.
  </h2>

  <p className="mt-6 max-w-3xl text-lg leading-9 text-[#6b7280] md:text-[20px]">
    Jika ada bug, request fitur, atau mau tanya soal penggunaan API, hubungi lewat
    WhatsApp, Instagram, atau GitHub di bawah ini.
  </p>

  <div className="mt-10 grid gap-4">
    <a
      href="https://wa.me/6285348284121"
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-4 border-t border-neutral-300 py-5 text-[#374151] transition hover:text-black"
    >
      <span className="flex h-12 w-12 items-center justify-center bg-[#f97316] text-white">
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
          <path d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.5 0 .16 5.34.16 11.91c0 2.1.55 4.16 1.58 5.98L0 24l6.29-1.65a11.85 11.85 0 0 0 5.78 1.47h.01c6.57 0 11.91-5.34 11.91-11.91 0-3.18-1.24-6.16-3.47-8.43ZM12.08 21.8h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.73.98 1-3.64-.24-.37a9.84 9.84 0 0 1-1.52-5.27c0-5.43 4.42-9.85 9.86-9.85 2.63 0 5.1 1.02 6.96 2.89a9.79 9.79 0 0 1 2.88 6.96c0 5.43-4.42 9.85-9.85 9.85Zm5.4-7.37c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15s-.77.97-.95 1.16c-.17.2-.35.22-.65.08-.3-.15-1.26-.46-2.4-1.47-.88-.79-1.47-1.77-1.64-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.08-.8.37-.27.3-1.04 1.01-1.04 2.46s1.06 2.85 1.2 3.05c.15.2 2.09 3.19 5.06 4.47.71.3 1.27.49 1.71.62.72.23 1.37.2 1.88.12.57-.09 1.77-.72 2.02-1.42.25-.69.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35Z" />
        </svg>
      </span>
      <div>
        <div className="text-2xl font-bold">WhatsApp</div>
        <div className="text-base text-[#6b7280]">085348284121</div>
      </div>
    </a>

    <a
      href="https://instagram.com/znn_id"
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-4 border-t border-neutral-300 py-5 text-[#374151] transition hover:text-black"
    >
      <span className="flex h-12 w-12 items-center justify-center bg-[#f97316] text-white">
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
          <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95Zm8.95 1.35a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 6.86A5.14 5.14 0 1 1 6.86 12 5.14 5.14 0 0 1 12 6.86Zm0 1.8A3.34 3.34 0 1 0 15.34 12 3.34 3.34 0 0 0 12 8.66Z" />
        </svg>
      </span>
      <div>
        <div className="text-2xl font-bold">Instagram</div>
        <div className="text-base text-[#6b7280]">@znn_id</div>
      </div>
    </a>

    <a
      href="https://github.com/x-znn"
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-4 border-y border-neutral-300 py-5 text-[#374151] transition hover:text-black"
    >
      <span className="flex h-12 w-12 items-center justify-center bg-[#f97316] text-white">
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
          <path d="M12 .5A12 12 0 0 0 8.2 23.9c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.42-4.04-1.42-.55-1.38-1.34-1.75-1.34-1.75-1.1-.75.08-.74.08-.74 1.21.09 1.85 1.24 1.85 1.24 1.08 1.84 2.83 1.31 3.52 1 .11-.79.42-1.31.77-1.61-2.67-.3-5.48-1.34-5.48-5.94 0-1.31.47-2.39 1.24-3.24-.12-.31-.54-1.55.12-3.22 0 0 1.01-.32 3.3 1.24A11.44 11.44 0 0 1 12 6.6c1.01 0 2.03.14 2.99.41 2.28-1.56 3.29-1.24 3.29-1.24.66 1.67.25 2.91.12 3.22.77.85 1.24 1.93 1.24 3.24 0 4.61-2.81 5.63-5.49 5.93.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.83.58A12 12 0 0 0 12 .5Z" />
        </svg>
      </span>
      <div>
        <div className="text-2xl font-bold">GitHub</div>
        <div className="text-base text-[#6b7280]">x-znn</div>
      </div>
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
