import Nav from "../components/Nav"
import { getApiStats, STAT_FEATURES } from "../../lib/stats"

export const dynamic = "force-dynamic"

function number(value, connected) {
  return connected ? Number(value || 0).toLocaleString("id-ID") : "—"
}

export default async function DashboardPage() {
  const stats = await getApiStats()
  const connected = Boolean(stats.connected)

  const features = STAT_FEATURES.map((item) => ({
    ...item,
    value: Number(stats.features?.[item.key] || 0)
  }))

  return (
    <main className="paper-site analytics-page">
      <Nav />

      <section className="analytics-intro">
        <span className="section-label">ARUNIKA API ANALYTICS</span>
        <h1>Stats.</h1>
        <p>Semua hit dari seluruh fitur Arunika API</p>
      </section>

      <section className="analytics-summary">
        <article>
          <span>TOTAL REQUEST</span>
          <strong>{number(stats.total, connected)}</strong>
          <small>akumulasi semua request fitur</small>
        </article>

        <article>
          <span>HIT TODAY</span>
          <strong>{number(stats.today, connected)}</strong>
          <small>{stats.dayLabel || "Asia/Jakarta"}</small>
        </article>
      </section>

      <section className="analytics-breakdown">
        <div className="analytics-breakdown__head">
          <div>
            <span className="section-label">ALL FEATURE HITS</span>
            <h2>Hit per fitur.</h2>
          </div>
        </div>

        <div className="analytics-table">
          {features.map((feature) => (
            <article key={feature.key}>
              <span
                className={
                  feature.category === "Maker"
                    ? "analytics-pill analytics-pill--maker"
                    : "analytics-pill"
                }
              >
                {feature.category}
              </span>

              <strong>{feature.label}</strong>
              <b>{number(feature.value, connected)}</b>
            </article>
          ))}
        </div>
      </section>

      <section className="analytics-note">
        <b>i</b>
        <p>Statistik diperbarui saat halaman dimuat.</p>
      </section>

      <footer className="paper-footer">
        <span>ARUNIKA APIs. by @znn_id</span>
        <span>Built for WhatsApp bot workflows.</span>
      </footer>

      <style>{`
        .analytics-intro,
        .analytics-summary,
        .analytics-breakdown,
        .analytics-note {
          width: min(1180px, calc(100% - 40px));
          margin-left: auto;
          margin-right: auto;
        }

        .analytics-intro {
          margin-top: 70px;
          margin-bottom: 40px;
        }

        .analytics-intro h1 {
          margin: 10px 0 12px;
          color: var(--ink);
          font: 800 clamp(48px, 8vw, 84px) / 0.9 var(--mono);
          letter-spacing: -0.09em;
        }

        .analytics-intro p {
          max-width: 680px;
          margin: 0;
          color: var(--muted);
          font-size: 16px;
          line-height: 1.75;
        }

        .analytics-summary {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          margin-bottom: 24px;
          border: 1px solid var(--line);
          background: #fffdf8;
        }

        .analytics-summary article {
          min-height: 250px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 30px 34px;
          border-right: 1px solid var(--line);
        }

        .analytics-summary article:last-child {
          border-right: 0;
        }

        .analytics-summary span {
          color: var(--muted);
          font: 800 11px var(--mono);
          letter-spacing: 0.1em;
        }

        .analytics-summary strong {
          color: var(--ink);
          font: 800 clamp(42px, 6vw, 68px) / 0.9 var(--mono);
          letter-spacing: -0.09em;
        }

        .analytics-summary small {
          color: var(--muted);
          font-size: 13px;
          line-height: 1.55;
        }

        .analytics-breakdown {
          margin-bottom: 24px;
          border: 1px solid var(--line);
          background: #fffdf8;
        }

        .analytics-breakdown__head {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 20px;
          padding: 28px 30px;
          border-bottom: 1px solid var(--line);
        }

        .analytics-breakdown__head h2 {
          margin: 9px 0 0;
          color: var(--ink);
          font: 800 clamp(28px, 4vw, 46px) / 0.94 var(--mono);
          letter-spacing: -0.075em;
        }

        .analytics-table {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .analytics-table article {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          padding: 18px 20px;
          border-right: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
        }

        .analytics-table article:nth-child(2n) {
          border-right: 0;
        }

        .analytics-table article:nth-last-child(-n + 2) {
          border-bottom: 0;
        }

        .analytics-table strong {
          overflow: hidden;
          color: var(--ink);
          font: 800 13px var(--mono);
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .analytics-table b {
          color: var(--ink);
          font: 800 20px var(--mono);
          letter-spacing: -0.06em;
        }

        .analytics-pill {
          padding: 5px 6px;
          color: #765514;
          background: #fff0cf;
          border: 1px solid #ecd39e;
          font: 800 8px var(--mono);
        }

        .analytics-pill--maker {
          color: #286a48;
          background: #e8f7ed;
          border-color: #b9dfc5;
        }

        .analytics-note {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 72px;
          padding: 17px 19px;
          color: var(--muted);
          border: 1px solid var(--line);
          background: #f6f3ed;
        }

        .analytics-note > b {
          display: grid;
          width: 22px;
          height: 22px;
          flex: 0 0 auto;
          place-items: center;
          color: #935a0b;
          border: 1px solid #d49a2b;
          border-radius: 50%;
          font: 800 12px var(--mono);
        }

        .analytics-note p {
          margin: 0;
          font-size: 13px;
          line-height: 1.65;
        }

        @media (max-width: 830px) {
          .analytics-summary article {
            min-height: 215px;
            padding: 24px 22px;
          }

          .analytics-summary strong {
            font-size: clamp(36px, 10vw, 56px);
          }
        }

        @media (max-width: 560px) {
          .analytics-intro,
          .analytics-summary,
          .analytics-breakdown,
          .analytics-note {
            width: min(100% - 24px, 1180px);
          }

          .analytics-intro {
            margin-top: 44px;
          }

          .analytics-intro h1 {
            font-size: 56px;
          }

          .analytics-summary article {
            min-height: 190px;
            padding: 20px 16px;
          }

          .analytics-summary span {
            font-size: 9px;
          }

          .analytics-summary strong {
            font-size: 40px;
          }

          .analytics-summary small {
            font-size: 11px;
          }

          .analytics-breakdown__head {
            align-items: start;
            flex-direction: column;
            padding: 22px;
          }

          .analytics-table {
            grid-template-columns: 1fr;
          }

          .analytics-table article,
          .analytics-table article:nth-child(2n),
          .analytics-table article:nth-last-child(-n + 2) {
            border-right: 0;
            border-bottom: 1px solid var(--line);
          }

          .analytics-table article:last-child {
            border-bottom: 0;
          }

          .analytics-note {
            margin-bottom: 45px;
          }
        }
      `}</style>
    </main>
  )
}
