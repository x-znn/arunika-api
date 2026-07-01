import Link from "next/link"
import Nav from "../components/Nav"

const ENDPOINTS = [
  {
    id: "api-health",
    name: "api-health",
    group: "SYSTEM",
    method: "GET",
    title: "Health Check",
    route: "/api/health",
    description:
      "Mengecek apakah Arunika API aktif dan dapat menerima request.",
    params: [],
    example: "/api/health"
  },
  {
    id: "api-stats",
    name: "api-stats",
    group: "SYSTEM",
    method: "GET",
    title: "API Statistics",
    route: "/api/stats",
    description:
      "Mengambil ringkasan statistik request yang tercatat di Arunika API.",
    params: [],
    example: "/api/stats"
  },
  {
    id: "ignote",
    name: "ignote",
    group: "IMAGE",
    method: "GET",
    title: "IG Note Image",
    route: "/api/v1/ignote",
    description:
      "Membuat gambar Instagram Note PNG yang dapat langsung dikirim oleh bot WhatsApp.",
    params: [
      ["name", "Nama yang tampil pada Instagram Note."],
      ["text", "Isi note yang ditampilkan."],
      ["time", "Waktu note, misalnya 3 menit atau 1 jam."]
    ],
    example:
      "/api/v1/ignote?name=zann&text=Halo%20semua&time=3%20menit"
  },
  {
    id: "ignote-json",
    name: "ignote-json",
    group: "IMAGE",
    method: "GET",
    title: "IG Note JSON",
    route: "/api/v1/ignote/json",
    description:
      "Mengambil respons JSON dari layanan IG Note.",
    params: [
      ["name", "Nama yang tampil pada Instagram Note."],
      ["text", "Isi note yang ditampilkan."]
    ],
    example:
      "/api/v1/ignote/json?name=zann&text=Halo%20semua"
  },
  {
    id: "ludo-action",
    name: "ludo-action",
    group: "GAME · LUDO",
    method: "POST",
    title: "Ludo Action",
    route: "/api/v1/ludo",
    description:
      "Menjalankan aksi Ludo: membuat room, join, start, roll, move, status, leave, dan reset.",
    params: [
      ["action", "create, join, start, roll, move, status, board, leave, reset."],
      ["room", "ID grup WhatsApp sebagai room permainan."],
      ["sender", "ID WhatsApp pemain."],
      ["name", "Nama pemain."],
      ["token", "Nomor pion 1 sampai 4. Dipakai hanya saat action move."]
    ],
    example: `{
  "action": "roll",
  "room": "id-grup@g.us",
  "sender": "nomor-pemain@lid",
  "name": "Nama Pemain"
}`
  },
  {
    id: "ludo-room",
    name: "ludo-room",
    group: "GAME · LUDO",
    method: "GET",
    title: "Ludo Room Status",
    route: "/api/v1/ludo",
    description:
      "Mengambil data room, pemain, posisi token, pion aktif, dadu terakhir, dan giliran Ludo.",
    params: [
      ["room", "ID grup WhatsApp yang dipakai sebagai room permainan."]
    ],
    example: "/api/v1/ludo?room=id-grup@g.us"
  },
  {
    id: "ludo-board",
    name: "ludo-board",
    group: "GAME · LUDO",
    method: "GET",
    title: "Ludo Board Image",
    route: "/api/v1/ludo/board",
    description:
      "Menghasilkan gambar papan Ludo terbaru berdasarkan state room.",
    params: [
      ["room", "ID grup WhatsApp yang dipakai sebagai room permainan."]
    ],
    example: "/api/v1/ludo/board?room=id-grup@g.us"
  },
  {
    id: "monopoly-action",
    name: "monopoly-action",
    group: "GAME · MONOPOLY",
    method: "POST",
    title: "Monopoly Action",
    route: "/api/v1/monopoly",
    description:
      "Menjalankan aksi Monopoly Indonesia seperti create, join, roll, buy, pay, upgrade, pass, assets, leave, dan reset.",
    params: [
      ["action", "create, join, start, roll, buy, pay, upgrade, pass, assets, status, board, leave, reset."],
      ["room", "ID grup WhatsApp sebagai room permainan."],
      ["sender", "ID WhatsApp pemain."],
      ["name", "Nama pemain."]
    ],
    example: `{
  "action": "roll",
  "room": "id-grup@g.us",
  "sender": "nomor-pemain@lid",
  "name": "Nama Pemain"
}`
  },
  {
    id: "monopoly-room",
    name: "monopoly-room",
    group: "GAME · MONOPOLY",
    method: "GET",
    title: "Monopoly Room Status",
    route: "/api/v1/monopoly",
    description:
      "Mengambil data pemain, cash, posisi, properti, rumah, hotel, kartu, serta giliran Monopoly.",
    params: [
      ["room", "ID grup WhatsApp yang dipakai sebagai room permainan."]
    ],
    example: "/api/v1/monopoly?room=id-grup@g.us"
  },
  {
    id: "monopoly-board",
    name: "monopoly-board",
    group: "GAME · MONOPOLY",
    method: "GET",
    title: "Monopoly Board Image",
    route: "/api/v1/monopoly/board",
    description:
      "Menghasilkan gambar papan Monopoly Indonesia dengan pion, rumah, dan hotel.",
    params: [
      ["room", "ID grup WhatsApp yang dipakai sebagai room permainan."]
    ],
    example: "/api/v1/monopoly/board?room=id-grup@g.us"
  },
  {
    id: "monopoly-card",
    name: "monopoly-card",
    group: "GAME · MONOPOLY",
    method: "GET",
    title: "Monopoly Card Image",
    route: "/api/v1/monopoly/card",
    description:
      "Menghasilkan kartu portrait Kesempatan atau Dana Umum.",
    params: [
      ["id", "ID kartu, misalnya chance_01 atau community_01."]
    ],
    example: "/api/v1/monopoly/card?id=chance_01"
  }
]

function methodClass(method) {
  return method === "POST"
    ? "docs-method docs-method--post"
    : "docs-method docs-method--get"
}

export default function DocsPage() {
  return (
    <main className="paper-site docs-page">
      <Nav />

      <section className="docs-intro">
        <span className="section-label">ARUNIKA API DOCUMENTATION</span>

        <h1>Docs.</h1>

        <p>
          Dokumentasi endpoint Arunika API untuk image generator, Ludo, dan
          Monopoly Indonesia.
        </p>

        <div className="docs-intro__actions">
          <Link href="/playground" className="docs-button docs-button--solid">
            ▶ Coba Playground
          </Link>

          <Link href="/dashboard" className="docs-button">
            ↗ Lihat Stats
          </Link>
        </div>
      </section>

      <section className="docs-overview">
        <article>
          <span>IMAGE</span>
          <strong>IG Note</strong>
          <small>Generate gambar PNG untuk bot WhatsApp.</small>
        </article>

        <article>
          <span>GAME</span>
          <strong>Ludo</strong>
          <small>Room, dadu, token, board, dan status permainan.</small>
        </article>

        <article>
          <span>GAME</span>
          <strong>Monopoly</strong>
          <small>Properti, rumah, hotel, kartu, cash, dan board.</small>
        </article>
      </section>

      <section className="docs-list">
        <div className="docs-list__head">
          <div>
            <span className="section-label">AVAILABLE ENDPOINTS</span>
            <h2>Semua endpoint.</h2>
          </div>

          <span>{ENDPOINTS.length} endpoint</span>
        </div>

        <div className="docs-accordion">
          {ENDPOINTS.map((endpoint) => (
            <details
              className="docs-card"
              key={endpoint.id}
            >
              <summary>
                <span className={methodClass(endpoint.method)}>
                  {endpoint.method}
                </span>

                <span className="docs-card__name">
                  <small>{endpoint.group}</small>
                  <strong>{endpoint.name}</strong>
                  <em>{endpoint.title}</em>
                </span>

                <span className="docs-card__toggle">+</span>
              </summary>

              <div className="docs-card__body">
                <div className="docs-route">
                  <span>ENDPOINT</span>
                  <code>{endpoint.route}</code>
                </div>

                <p>{endpoint.description}</p>

                {endpoint.params.length > 0 && (
                  <div className="docs-params">
                    <span>PARAMETER / REQUEST BODY</span>

                    <div className="docs-params__table">
                      {endpoint.params.map(([key, text]) => (
                        <div key={key}>
                          <code>{key}</code>
                          <p>{text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="docs-example">
                  <span>
                    {endpoint.method === "POST"
                      ? "CONTOH REQUEST BODY"
                      : "CONTOH URL"}
                  </span>

                  <pre>
                    <code>{endpoint.example}</code>
                  </pre>
                </div>

                <Link
                  href={"/playground?endpoint=" + endpoint.id}
                  className="docs-try-button"
                >
                  Coba {endpoint.name} di Playground ↗
                </Link>
              </div>
            </details>
          ))}
        </div>
      </section>

      <footer className="paper-footer">
        <span>ARUNIKA APIs. by @znn_id</span>
        <span>Built for WhatsApp bot workflows.</span>
      </footer>

      <style>{`
        .docs-page,
        .docs-page *,
        .docs-page *::before,
        .docs-page *::after {
          box-sizing: border-box;
        }

        .docs-page {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          overflow-x: hidden;
        }

        .docs-intro,
        .docs-overview,
        .docs-list {
          width: min(1120px, calc(100% - 40px));
          max-width: 100%;
          min-width: 0;
          margin-left: auto;
          margin-right: auto;
        }

        .docs-intro {
          margin-top: 72px;
          margin-bottom: 38px;
        }

        .docs-intro h1 {
          margin: 10px 0 12px;
          color: var(--ink);
          font: 800 clamp(42px, 7vw, 82px)/0.9 var(--mono);
          letter-spacing: -0.09em;
        }

        .docs-intro p {
          max-width: 610px;
          margin: 0;
          color: var(--muted);
          font-size: 16px;
          line-height: 1.75;
        }

        .docs-intro__actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 24px;
        }

        .docs-button {
          padding: 12px 15px;
          color: var(--ink);
          border: 1px solid var(--line);
          background: var(--paper-soft);
          font: 800 11px var(--mono);
          letter-spacing: 0.03em;
        }

        .docs-button--solid {
          color: #ffffff;
          border-color: var(--orange);
          background: var(--orange);
        }

        .docs-overview {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          margin-bottom: 54px;
          border: 1px solid var(--line);
          background: var(--paper-soft);
        }

        .docs-overview article {
          min-width: 0;
          display: grid;
          gap: 10px;
          padding: 24px;
          border-right: 1px solid var(--line);
        }

        .docs-overview article:last-child {
          border-right: 0;
        }

        .docs-overview span {
          color: var(--orange-dark);
          font: 800 10px var(--mono);
          letter-spacing: 0.08em;
        }

        .docs-overview strong {
          color: var(--ink);
          font: 800 28px/1 var(--mono);
          letter-spacing: -0.07em;
        }

        .docs-overview small {
          color: var(--muted);
          font-size: 13px;
          line-height: 1.65;
        }

        .docs-list {
          margin-bottom: 70px;
          overflow: hidden;
          border: 1px solid var(--line);
          background: var(--paper-soft);
        }

        .docs-list__head {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 20px;
          padding: 30px 34px;
          border-bottom: 1px solid var(--line);
        }

        .docs-list__head h2 {
          margin: 9px 0 0;
          color: var(--ink);
          font: 800 clamp(28px, 4vw, 46px)/0.95 var(--mono);
          letter-spacing: -0.075em;
        }

        .docs-list__head > span {
          flex: 0 0 auto;
          padding: 9px 11px;
          color: var(--orange-dark);
          background: #fff4e7;
          border: 1px solid #efcca7;
          font: 800 10px var(--mono);
          white-space: nowrap;
        }

        .docs-card {
          min-width: 0;
          border-bottom: 1px solid var(--line);
        }

        .docs-card:last-child {
          border-bottom: 0;
        }

        .docs-card summary {
          min-height: 84px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 16px;
          padding: 15px 24px;
          cursor: pointer;
          list-style: none;
          transition: background 180ms ease;
        }

        .docs-card summary::-webkit-details-marker {
          display: none;
        }

        .docs-card summary:hover {
          background: #ffffff;
        }

        .docs-card[open] summary {
          background: #fff7ee;
          border-bottom: 1px solid var(--line);
        }

        .docs-method {
          min-width: 52px;
          display: inline-grid;
          place-items: center;
          padding: 8px 7px;
          color: #ffffff;
          font: 800 10px var(--mono);
          letter-spacing: 0.07em;
        }

        .docs-method--get {
          background: #3f7e61;
        }

        .docs-method--post {
          background: var(--orange);
        }

        .docs-card__name {
          min-width: 0;
          display: grid;
          gap: 4px;
        }

        .docs-card__name small {
          overflow: hidden;
          color: var(--orange-dark);
          font: 800 10px var(--mono);
          letter-spacing: 0.08em;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .docs-card__name strong {
          overflow: hidden;
          color: var(--ink);
          font: 800 15px var(--mono);
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .docs-card__name em {
          overflow: hidden;
          color: var(--muted);
          font-size: 12px;
          font-style: normal;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .docs-card__toggle {
          width: 29px;
          height: 29px;
          display: grid;
          place-items: center;
          color: var(--orange-dark);
          border: 1px solid var(--line);
          font: 700 21px/1 var(--mono);
          transition: transform 180ms ease;
        }

        .docs-card[open] .docs-card__toggle {
          transform: rotate(45deg);
        }

        .docs-card__body {
          display: grid;
          gap: 23px;
          min-width: 0;
          padding: 28px 34px 32px 92px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.58);
        }

        .docs-route,
        .docs-params,
        .docs-example {
          min-width: 0;
          max-width: 100%;
        }

        .docs-route > span,
        .docs-params > span,
        .docs-example > span {
          display: block;
          margin-bottom: 9px;
          color: var(--orange-dark);
          font: 800 10px var(--mono);
          letter-spacing: 0.09em;
        }

        .docs-route code {
          width: 100%;
          display: block;
          padding: 14px;
          overflow-wrap: anywhere;
          color: #46546c;
          background: #edf1f8;
          border: 1px solid #e1e7ef;
          font: 13px/1.65 var(--mono);
          word-break: break-word;
        }

        .docs-card__body > p {
          max-width: 760px;
          margin: -4px 0 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.75;
        }

        .docs-params__table {
          max-width: 760px;
          border: 1px solid var(--line);
          background: #ffffff;
        }

        .docs-params__table > div {
          display: grid;
          grid-template-columns: minmax(120px, 180px) minmax(0, 1fr);
          gap: 15px;
          padding: 12px 13px;
          border-bottom: 1px solid var(--line);
        }

        .docs-params__table > div:last-child {
          border-bottom: 0;
        }

        .docs-params__table code {
          overflow-wrap: anywhere;
          color: var(--orange-dark);
          font: 800 12px var(--mono);
          word-break: break-word;
        }

        .docs-params__table p {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.55;
        }

        .docs-example pre {
          width: 100%;
          max-width: 760px;
          margin: 0;
          padding: 16px;
          overflow: hidden;
          color: #f7eee2;
          background: #28221f;
          border: 1px solid #15110f;
          font: 12px/1.65 var(--mono);
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .docs-try-button {
          width: fit-content;
          max-width: 100%;
          padding: 12px 14px;
          overflow-wrap: anywhere;
          color: #ffffff;
          background: var(--orange);
          font: 800 11px var(--mono);
          letter-spacing: 0.03em;
        }

        @media (max-width: 760px) {
          .docs-intro,
          .docs-overview,
          .docs-list {
            width: min(1120px, calc(100% - 28px));
          }

          .docs-intro {
            margin-top: 46px;
            margin-bottom: 30px;
          }

          .docs-overview {
            grid-template-columns: 1fr;
            margin-bottom: 42px;
          }

          .docs-overview article {
            border-right: 0;
            border-bottom: 1px solid var(--line);
          }

          .docs-overview article:last-child {
            border-bottom: 0;
          }

          .docs-list__head {
            align-items: start;
            flex-direction: column;
            padding: 25px;
          }

          .docs-card summary {
            padding: 15px 16px;
          }

          .docs-card__body {
            padding: 22px 16px 26px;
          }

          .docs-params__table > div {
            grid-template-columns: 1fr;
            gap: 5px;
          }

          .docs-route code,
          .docs-example pre {
            font-size: 11px;
          }
        }

        @media (max-width: 460px) {
          .docs-intro h1 {
            font-size: 56px;
          }

          .docs-list__head {
            padding: 22px;
          }

          .docs-list__head h2 {
            font-size: 35px;
          }

          .docs-card__name em {
            display: none;
          }

          .docs-method {
            min-width: 46px;
            font-size: 9px;
          }
        }
      `}</style>
    </main>
  )
}
