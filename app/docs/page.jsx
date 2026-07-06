import Link from "next/link"
import Nav from "../components/Nav"
import { API_CATEGORIES, API_ENDPOINTS } from "../components/apiCatalog"

export default function DocsPage() {
  return (
    <main className="paper-site docs-page">
      <Nav />
      <section className="docs-intro">
        <span className="section-label">ARUNIKA API REFERENCE</span>
        <h1>Docs.</h1>
        <p>
          Endpoint Arunika dipisahkan menjadi Maker, Game, dan System. Semua request menggunakan JSON kecuali Fake React yang juga mendukung upload file langsung melalui multipart form data.
        </p>
        <Link href="/playground" className="docs-intro__button">Buka Playground ↗</Link>
      </section>

      <section className="docs-content">
        {API_CATEGORIES.map((category) => {
          const items = API_ENDPOINTS.filter((endpoint) => endpoint.category === category.id)
          return (
            <section className="docs-group" key={category.id}>
              <div className="docs-group__head">
                <span>{category.icon} {category.label}</span>
                <p>{category.description}</p>
              </div>
              <div className="docs-table">
                {items.map((endpoint) => (
                  <article className="docs-row" key={endpoint.id}>
                    <div className="docs-row__main">
                      <span className={endpoint.method === "POST" ? "docs-method docs-method--post" : "docs-method"}>{endpoint.method}</span>
                      <div>
                        <h2>{endpoint.title}</h2>
                        <p>{endpoint.description}</p>
                      </div>
                    </div>
                    <code>{endpoint.route}</code>
                    {endpoint.acceptsFile && <small className="docs-upload">Pilih file galeri / multipart</small>}
                  </article>
                ))}
              </div>
            </section>
          )
        })}
      </section>

      <section className="docs-note">
        <b>FAKE REACT UPLOAD</b>
        <p>
          Browser/mobile: kirim <code>multipart/form-data</code> dengan field <code>file</code> dan <code>mode</code> (`image` atau `sticker`). Script WhatsApp tetap dapat memakai JSON lama dengan <code>imageUrl</code>.
        </p>
      </section>
      <footer className="paper-footer"><span>ARUNIKA APIs. by @znn_id</span><span>Built for WhatsApp bot workflows.</span></footer>
      <style>{`
        .docs-intro,.docs-content,.docs-note{width:min(1180px,calc(100% - 40px));margin-left:auto;margin-right:auto}.docs-intro{margin-top:70px;margin-bottom:42px}.docs-intro h1{margin:10px 0 12px;color:var(--ink);font:800 clamp(48px,8vw,84px)/.9 var(--mono);letter-spacing:-.09em}.docs-intro p{max-width:700px;margin:0;color:var(--muted);font-size:16px;line-height:1.75}.docs-intro__button{display:inline-flex;margin-top:21px;padding:13px 16px;color:#fff;background:var(--ink);font:800 11px var(--mono);text-decoration:none}.docs-group{margin-bottom:28px;border:1px solid var(--line);background:#fffdf8}.docs-group__head{display:flex;justify-content:space-between;gap:22px;padding:24px 27px;border-bottom:1px solid var(--line);background:#f8f5ee}.docs-group__head span{color:var(--ink);font:800 22px var(--mono);letter-spacing:-.05em}.docs-group__head p{max-width:490px;margin:0;color:var(--muted);font-size:13px;line-height:1.65}.docs-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(190px,.55fr);gap:20px;align-items:center;padding:21px 26px;border-bottom:1px solid var(--line)}.docs-row:last-child{border-bottom:0}.docs-row__main{display:flex;gap:13px;align-items:flex-start}.docs-row h2{margin:0 0 7px;color:var(--ink);font:800 18px var(--mono);letter-spacing:-.05em}.docs-row p{margin:0;color:var(--muted);font-size:13px;line-height:1.6}.docs-row code{overflow:auto hidden;color:#70510d;font:800 11px var(--mono);white-space:nowrap}.docs-method{padding:6px 7px;color:#246a48;background:#e8f7ed;border:1px solid #b9dec8;font:800 9px var(--mono)}.docs-method--post{color:#91520b;background:#fff1db;border-color:#ead0a7}.docs-upload{grid-column:2;color:#8c5b0d;font:800 10px var(--mono)}.docs-note{display:flex;gap:18px;margin-top:0;margin-bottom:72px;padding:22px 24px;border:1px solid #efd39e;background:#fff1d1}.docs-note b{flex:0 0 auto;color:#8b530b;font:800 11px var(--mono)}.docs-note p{margin:0;color:#79500f;font-size:13px;line-height:1.7}.docs-note code{font:800 11px var(--mono)}@media(max-width:650px){.docs-intro,.docs-content,.docs-note{width:min(100% - 24px,1180px)}.docs-intro{margin-top:44px}.docs-intro h1{font-size:56px}.docs-group__head,.docs-note{flex-direction:column;padding:20px}.docs-row{grid-template-columns:1fr;padding:18px}.docs-upload{grid-column:1}.docs-row code{max-width:100%}}
      `}</style>
    </main>
  )
}
