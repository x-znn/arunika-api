import Link from "next/link"

const ENDPOINTS = [
  {
    group: "IMAGE",
    method: "GET",
    path: "/api/v1/ignote",
    title: "IG Note Image",
    description:
      "Membuat gambar Instagram Note dalam format PNG. Cocok langsung dikirim sebagai gambar oleh bot WhatsApp.",
    example:
      "/api/v1/ignote?name=zann&text=Halo%20semua&time=3%20menit",
    params: [
      ["name", "Nama yang tampil pada note."],
      ["text", "Isi teks note."],
      ["time", "Waktu note, misalnya 3 menit."]
    ]
  },
  {
    group: "IMAGE",
    method: "GET",
    path: "/api/v1/ignote/json",
    title: "IG Note JSON",
    description:
      "Mengambil respons JSON dari layanan IG Note.",
    example:
      "/api/v1/ignote/json?name=zann&text=Halo%20semua",
    params: [
      ["name", "Nama yang tampil pada note."],
      ["text", "Isi teks note."]
    ]
  },
  {
    group: "GAME · LUDO",
    method: "POST",
    path: "/api/v1/ludo",
    title: "Ludo Action",
    description:
      "Menjalankan aksi Ludo seperti membuat room, join, mulai permainan, lempar dadu, pindah pion, keluar, dan reset.",
    example: `{
  "action": "roll",
  "room": "id-grup@g.us",
  "sender": "nomor-pemain@lid",
  "name": "Nama Pemain"
}`,
    params: [
      ["action", "create, join, start, roll, move, board, status, leave, reset."],
      ["room", "ID grup WhatsApp."],
      ["sender", "ID pemain WhatsApp."],
      ["name", "Nama pemain."],
      ["token", "Nomor pion 1-4. Hanya untuk action move."]
    ]
  },
  {
    group: "GAME · LUDO",
    method: "GET",
    path: "/api/v1/ludo?room={id_grup}",
    title: "Ludo Room Status",
    description:
      "Mengambil data room Ludo, pemain, warna tim, posisi pion, pion aktif, dadu terakhir, dan giliran saat ini.",
    example:
      "/api/v1/ludo?room=id-grup@g.us",
    params: [
      ["room", "ID grup WhatsApp yang digunakan sebagai room game."]
    ]
  },
  {
    group: "GAME · LUDO",
    method: "GET",
    path: "/api/v1/ludo/board?room={id_grup}",
    title: "Ludo Board Image",
    description:
      "Menghasilkan gambar papan Ludo terbaru berdasarkan room yang sedang dimainkan.",
    example:
      "/api/v1/ludo/board?room=id-grup@g.us",
    params: [
      ["room", "ID grup WhatsApp yang digunakan sebagai room game."]
    ]
  },
  {
    group: "GAME · MONOPOLY",
    method: "POST",
    path: "/api/v1/monopoly",
    title: "Monopoly Action",
    description:
      "Menjalankan aksi Monopoly Indonesia seperti membuat room, roll, membeli properti, membayar sewa, upgrade bangunan, dan reset game.",
    example: `{
  "action": "roll",
  "room": "id-grup@g.us",
  "sender": "nomor-pemain@lid",
  "name": "Nama Pemain"
}`,
    params: [
      ["action", "create, join, start, roll, buy, pay, upgrade, pass, assets, board, status, leave, reset."],
      ["room", "ID grup WhatsApp."],
      ["sender", "ID pemain WhatsApp."],
      ["name", "Nama pemain."]
    ]
  },
  {
    group: "GAME · MONOPOLY",
    method: "GET",
    path: "/api/v1/monopoly?room={id_grup}",
    title: "Monopoly Room Status",
    description:
      "Mengambil data room Monopoly, cash pemain, posisi, properti, bangunan, hotel, kartu, dan giliran permainan.",
    example:
      "/api/v1/monopoly?room=id-grup@g.us",
    params: [
      ["room", "ID grup WhatsApp yang digunakan sebagai room game."]
    ]
  },
  {
    group: "GAME · MONOPOLY",
    method: "GET",
    path: "/api/v1/monopoly/board?room={id_grup}",
    title: "Monopoly Board Image",
    description:
      "Menghasilkan gambar papan Monopoly Indonesia terbaru lengkap dengan pion, rumah, dan hotel.",
    example:
      "/api/v1/monopoly/board?room=id-grup@g.us",
    params: [
      ["room", "ID grup WhatsApp yang digunakan sebagai room game."]
    ]
  },
  {
    group: "GAME · MONOPOLY",
    method: "GET",
    path: "/api/v1/monopoly/card?id={id_kartu}",
    title: "Monopoly Card Image",
    description:
      "Menghasilkan gambar kartu portrait Kesempatan atau Dana Umum seperti kartu Monopoly.",
    example:
      "/api/v1/monopoly/card?id=chance_01",
    params: [
      ["id", "ID kartu, misalnya chance_01 atau community_01."]
    ]
  },
  {
    group: "SYSTEM",
    method: "GET",
    path: "/api/health",
    title: "Health Check",
    description:
      "Mengecek apakah Arunika API sedang aktif dan dapat diakses.",
    example: "/api/health",
    params: []
  },
  {
    group: "SYSTEM",
    method: "GET",
    path: "/api/stats",
    title: "API Statistics",
    description:
      "Mengambil ringkasan statistik request API yang tercatat.",
    example: "/api/stats",
    params: []
  }
]

function methodClass(method) {
  return method === "POST"
    ? "endpoint-method endpoint-method--post"
    : "endpoint-method endpoint-method--get"
}

export default function EndpointExplorer() {
  return (
    <section className="endpoint-explorer" id="endpoint">
      <div className="endpoint-explorer__head">
        <div>
          <span className="section-label">ENDPOINT EXPLORER</span>
          <h2>Semua endpoint.</h2>
          <p>
            Ketuk endpoint untuk melihat detail penggunaan dan contoh request.
          </p>
        </div>

        <Link href="/docs" className="endpoint-explorer__docs">
          Buka docs lengkap ↗
        </Link>
      </div>

      <div className="endpoint-list">
        {ENDPOINTS.map((endpoint, index) => (
          <details
            className="endpoint-card"
            key={`${endpoint.method}-${endpoint.path}`}
            open={index === 0}
          >
            <summary>
              <span className={methodClass(endpoint.method)}>
                {endpoint.method}
              </span>

              <div className="endpoint-card__main">
                <small>{endpoint.group}</small>
                <code>{endpoint.path}</code>
                <strong>{endpoint.title}</strong>
              </div>

              <span className="endpoint-card__status">ONLINE</span>
              <span className="endpoint-card__toggle">+</span>
            </summary>

            <div className="endpoint-card__detail">
              <p>{endpoint.description}</p>

              {endpoint.params.length > 0 && (
                <div className="endpoint-params">
                  <span className="endpoint-detail-label">
                    PARAMETER / BODY
                  </span>

                  <div className="endpoint-params__table">
                    {endpoint.params.map(([key, description]) => (
                      <div key={key}>
                        <code>{key}</code>
                        <span>{description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="endpoint-example">
                <span className="endpoint-detail-label">
                  {endpoint.method === "POST"
                    ? "CONTOH REQUEST BODY"
                    : "CONTOH URL"}
                </span>

                <pre>
                  <code>{endpoint.example}</code>
                </pre>
              </div>
            </div>
          </details>
        ))}
      </div>

      <style>{`
        .endpoint-explorer {
          width: min(1120px, calc(100% - 40px));
          margin: 72px auto;
          border: 1px solid var(--line);
          background: var(--paper-soft);
        }

        .endpoint-explorer__head {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 28px;
          padding: 34px;
          border-bottom: 1px solid var(--line);
        }

        .endpoint-explorer__head h2 {
          margin: 10px 0 8px;
          color: var(--ink);
          font: 800 clamp(28px, 4vw, 46px)/0.95 var(--mono);
          letter-spacing: -0.075em;
        }

        .endpoint-explorer__head p {
          max-width: 540px;
          margin: 0;
          color: var(--muted);
          font-size: 15px;
          line-height: 1.7;
        }

        .endpoint-explorer__docs {
          flex: 0 0 auto;
          padding: 12px 15px;
          color: #ffffff;
          background: var(--orange);
          font: 800 11px var(--mono);
          letter-spacing: 0.03em;
          transition: 180ms ease;
          white-space: nowrap;
        }

        .endpoint-explorer__docs:hover {
          background: var(--orange-dark);
        }

        .endpoint-list {
          display: grid;
        }

        .endpoint-card {
          border-bottom: 1px solid var(--line);
          background: rgba(255, 255, 255, 0.2);
        }

        .endpoint-card:last-child {
          border-bottom: 0;
        }

        .endpoint-card summary {
          min-height: 86px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto auto;
          align-items: center;
          gap: 18px;
          padding: 16px 24px;
          cursor: pointer;
          list-style: none;
          transition: background 180ms ease;
        }

        .endpoint-card summary::-webkit-details-marker {
          display: none;
        }

        .endpoint-card summary:hover {
          background: #ffffff;
        }

        .endpoint-card[open] summary {
          background: #fff7ee;
          border-bottom: 1px solid var(--line);
        }

        .endpoint-method {
          min-width: 52px;
          display: inline-grid;
          place-items: center;
          padding: 8px 7px;
          color: #ffffff;
          font: 800 10px var(--mono);
          letter-spacing: 0.07em;
        }

        .endpoint-method--get {
          background: #3f7e61;
        }

        .endpoint-method--post {
          background: var(--orange);
        }

        .endpoint-card__main {
          min-width: 0;
          display: grid;
          gap: 4px;
        }

        .endpoint-card__main small {
          color: var(--orange-dark);
          font: 800 10px var(--mono);
          letter-spacing: 0.08em;
        }

        .endpoint-card__main code {
          overflow: hidden;
          color: var(--ink);
          font: 800 14px var(--mono);
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .endpoint-card__main strong {
          color: var(--muted);
          font-size: 12px;
          font-weight: 600;
        }

        .endpoint-card__status {
          color: #28724b;
          font: 800 10px var(--mono);
          letter-spacing: 0.07em;
        }

        .endpoint-card__toggle {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          color: var(--orange-dark);
          border: 1px solid var(--line);
          font: 700 21px/1 var(--mono);
          transition: transform 180ms ease;
        }

        .endpoint-card[open] .endpoint-card__toggle {
          transform: rotate(45deg);
        }

        .endpoint-card__detail {
          display: grid;
          gap: 24px;
          padding: 28px 34px 32px 94px;
          background: rgba(255, 255, 255, 0.58);
        }

        .endpoint-card__detail > p {
          max-width: 760px;
          margin: 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.75;
        }

        .endpoint-detail-label {
          display: block;
          margin-bottom: 10px;
          color: var(--orange-dark);
          font: 800 10px var(--mono);
          letter-spacing: 0.09em;
        }

        .endpoint-params__table {
          max-width: 760px;
          border: 1px solid var(--line);
          background: #ffffff;
        }

        .endpoint-params__table > div {
          display: grid;
          grid-template-columns: minmax(120px, 180px) minmax(0, 1fr);
          gap: 16px;
          padding: 11px 13px;
          border-bottom: 1px solid var(--line);
        }

        .endpoint-params__table > div:last-child {
          border-bottom: 0;
        }

        .endpoint-params__table code {
          color: var(--orange-dark);
          font: 800 12px var(--mono);
        }

        .endpoint-params__table span {
          color: var(--muted);
          font-size: 12px;
          line-height: 1.55;
        }

        .endpoint-example pre {
          max-width: 760px;
          margin: 0;
          padding: 16px;
          overflow-x: auto;
          color: #f7eee2;
          background: #28221f;
          border: 1px solid #15110f;
          font: 12px/1.65 var(--mono);
          white-space: pre-wrap;
        }

        .endpoint-example code {
          font: inherit;
        }

        @media (max-width: 760px) {
          .endpoint-explorer {
            width: min(1120px, calc(100% - 28px));
            margin: 48px auto;
          }

          .endpoint-explorer__head {
            align-items: start;
            flex-direction: column;
            padding: 26px;
          }

          .endpoint-card summary {
            grid-template-columns: auto minmax(0, 1fr) auto;
            gap: 12px;
            padding: 15px 16px;
          }

          .endpoint-card__status {
            display: none;
          }

          .endpoint-card__main code {
            font-size: 12px;
          }

          .endpoint-card__detail {
            padding: 22px 16px 26px;
          }

          .endpoint-params__table > div {
            grid-template-columns: 1fr;
            gap: 5px;
          }

          .endpoint-example pre {
            font-size: 11px;
          }
        }

        @media (max-width: 460px) {
          .endpoint-explorer__head {
            padding: 22px;
          }

          .endpoint-explorer__head h2 {
            font-size: 35px;
          }

          .endpoint-explorer__docs {
            width: 100%;
            text-align: center;
          }

          .endpoint-card__main strong {
            display: none;
          }

          .endpoint-method {
            min-width: 46px;
            font-size: 9px;
          }
        }
      `}</style>
    </section>
  )
}
