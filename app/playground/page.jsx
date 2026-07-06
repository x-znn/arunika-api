import Nav from "../components/Nav"
import EndpointExplorer from "../components/EndpointExplorer"

export default function PlaygroundPage() {
  return (
    <main className="paper-site catalog-page">
      <Nav />
      <section className="catalog-page__intro">
        <span className="section-label">ARUNIKA API PLAYGROUND</span>
        <h1>Playground.</h1>
        <p>
          Coba endpoint Arunika langsung dari browser. Fake React mendukung pilihan file langsung dari galeri HP tanpa perlu upload ke ImgBB atau URL eksternal.
        </p>
      </section>
      <EndpointExplorer playground />
      <footer className="paper-footer">
        <span>ARUNIKA APIs. by @znn_id</span>
        <span>Built for WhatsApp bot workflows.</span>
      </footer>
      <style>{`
        .catalog-page__intro { width:min(1180px, calc(100% - 40px)); margin:70px auto 38px; }
        .catalog-page__intro h1 { margin:10px 0 12px; color:var(--ink); font:800 clamp(48px,8vw,84px)/.9 var(--mono); letter-spacing:-.09em; }
        .catalog-page__intro p { max-width:630px; margin:0; color:var(--muted); font-size:16px; line-height:1.75; }
        @media(max-width:560px){ .catalog-page__intro{width:min(100% - 24px,1180px); margin:44px auto 28px}.catalog-page__intro h1{font-size:56px}.catalog-page__intro p{font-size:14px} }
      `}</style>
    </main>
  )
}
