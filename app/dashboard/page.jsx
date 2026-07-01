import Nav from "../components/Nav"
import { getApiStats } from "../../lib/stats"

export const dynamic = "force-dynamic"

function formatNumber(value, connected) {
  if (!connected) return "—"

  return Number(value || 0).toLocaleString("id-ID")
}

export default async function DashboardPage() {
  const stats = await getApiStats()
  const connected = Boolean(stats.connected)

  const metrics = [
    {
      label: "Total Requests",
      value: formatNumber(stats.total, connected),
      note: "seluruh request API"
    },
    {
      label: "IG Note Requests",
      value: formatNumber(stats.ignote, connected),
      note: "request gambar IG Note"
    },
    {
      label: "Request Hari Ini",
      value: formatNumber(stats.today, connected),
      note: stats.dayLabel || "hari ini"
    },
    {
      label: "Database",
      value: connected ? "Live" : "Setup",
      note: connected
        ? "database tersambung"
        : "database belum tersambung",
      status: connected ? "online" : "setup"
    }
  ]

  return (
    <main className="paper-site dashboard-page">
      <Nav />

      <section className="dashboard-intro">
        <span className="section-label">API ANALYTICS</span>

        <h1>Dashboard.</h1>

        <p>
          Ringkasan aktivitas dan statistik Arunika API.
        </p>
      </section>

      <section className="stats-section">
        <div className="stats-section__heading">
          <div>
            <span className="section-label">REQUEST OVERVIEW</span>
            <h2>Statistik API.</h2>
          </div>

          <span
            className={
              "connection-status" +
              (connected
                ? " connection-status--online"
                : " connection-status--setup")
            }
          >
            <i />
            {connected ? "DATABASE LIVE" : "DATABASE SETUP"}
          </span>
        </div>

        <div className="stats-grid">
          {metrics.map((metric) => (
            <article
              className={
                "stat-card" +
                (metric.status
                  ? " stat-card--" + metric.status
                  : "")
              }
              key={metric.label}
            >
              <span>{metric.label}</span>

              <strong>{metric.value}</strong>

              <small>{metric.note}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-note">
        <span className="dashboard-note__mark">i</span>

        <p>
          Statistik diperbarui saat halaman dibuka ulang. Data request berasal
          dari sistem pencatatan Arunika API.
        </p>
      </section>

      <footer className="paper-footer">
        <span>ARUNIKA APIs. by @znn_id</span>
        <span>Built for WhatsApp bot workflows.</span>
      </footer>

      <style>{`
        .dashboard-page,
        .dashboard-page *,
        .dashboard-page *::before,
        .dashboard-page *::after {
          box-sizing: border-box;
        }

        .dashboard-page {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          overflow-x: hidden;
        }

        .dashboard-intro {
          width: min(1120px, calc(100% - 40px));
          max-width: 100%;
          min-width: 0;
          margin: 72px auto 44px;
        }

        .dashboard-intro h1 {
          margin: 10px 0 12px;
          color: var(--ink);
          font: 800 clamp(42px, 7vw, 82px)/0.9 var(--mono);
          letter-spacing: -0.09em;
        }

        .dashboard-intro p {
          max-width: 510px;
          margin: 0;
          color: var(--muted);
          font-size: 16px;
          line-height: 1.75;
        }

        .stats-section {
          width: min(1120px, calc(100% - 40px));
          max-width: 100%;
          min-width: 0;
          margin: 0 auto 24px;
          overflow: hidden;
          border: 1px solid var(--line);
          background: var(--paper-soft);
        }

        .stats-section__heading {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 24px;
          min-width: 0;
          padding: 32px 34px;
          border-bottom: 1px solid var(--line);
        }

        .stats-section__heading > div {
          min-width: 0;
        }

        .stats-section__heading h2 {
          margin: 9px 0 0;
          color: var(--ink);
          font: 800 clamp(28px, 4vw, 47px)/0.95 var(--mono);
          letter-spacing: -0.075em;
        }

        .connection-status {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          font: 800 10px var(--mono);
          letter-spacing: 0.06em;
          white-space: nowrap;
        }

        .connection-status i {
          width: 8px;
          height: 8px;
          display: block;
          border-radius: 999px;
        }

        .connection-status--online {
          color: #257246;
          background: #e5f6e9;
          border: 1px solid #b9e4c4;
        }

        .connection-status--online i {
          background: #2d9454;
          box-shadow: 0 0 0 4px rgba(45, 148, 84, 0.12);
        }

        .connection-status--setup {
          color: #a25b08;
          background: #fff1d2;
          border: 1px solid #f0d29a;
        }

        .connection-status--setup i {
          background: #d9901c;
          box-shadow: 0 0 0 4px rgba(217, 144, 28, 0.12);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          min-width: 0;
        }

        .stat-card {
          min-width: 0;
          min-height: 214px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 18px;
          padding: 26px 24px;
          border-right: 1px solid var(--line);
          background: rgba(255, 255, 255, 0.25);
        }

        .stat-card:last-child {
          border-right: 0;
        }

        .stat-card:hover {
          background: #ffffff;
        }

        .stat-card > span {
          overflow-wrap: anywhere;
          color: var(--muted);
          font: 800 10px var(--mono);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .stat-card strong {
          min-width: 0;
          overflow-wrap: anywhere;
          color: var(--ink);
          font: 800 clamp(33px, 4vw, 52px)/0.9 var(--mono);
          letter-spacing: -0.08em;
        }

        .stat-card small {
          color: var(--muted);
          font-size: 12px;
          line-height: 1.55;
        }

        .stat-card--online strong {
          color: #26794a;
        }

        .stat-card--setup strong {
          color: #b66d13;
        }

        .dashboard-note {
          width: min(1120px, calc(100% - 40px));
          max-width: 100%;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 13px;
          margin: 0 auto 72px;
          padding: 16px 18px;
          overflow: hidden;
          color: var(--muted);
          background: #f4f2ed;
          border: 1px solid var(--line);
        }

        .dashboard-note__mark {
          width: 23px;
          height: 23px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          color: var(--orange-dark);
          border: 1px solid var(--orange);
          border-radius: 999px;
          font: 800 13px/1 var(--mono);
        }

        .dashboard-note p {
          min-width: 0;
          margin: 0;
          overflow-wrap: anywhere;
          font-size: 13px;
          line-height: 1.65;
        }

        @media (max-width: 900px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .stat-card:nth-child(2) {
            border-right: 0;
          }

          .stat-card:nth-child(-n + 2) {
            border-bottom: 1px solid var(--line);
          }
        }

        @media (max-width: 760px) {
          .dashboard-intro {
            width: min(1120px, calc(100% - 28px));
            margin: 46px auto 30px;
          }

          .stats-section,
          .dashboard-note {
            width: min(1120px, calc(100% - 28px));
          }

          .stats-section__heading {
            align-items: start;
            flex-direction: column;
            padding: 25px;
          }

          .connection-status {
            font-size: 9px;
          }

          .stat-card {
            min-height: 176px;
            padding: 22px 19px;
          }

          .dashboard-note {
            align-items: flex-start;
            margin-bottom: 46px;
          }
        }

        @media (max-width: 460px) {
          .dashboard-intro h1 {
            font-size: 56px;
          }

          .dashboard-intro p {
            font-size: 15px;
          }

          .stats-section__heading {
            padding: 22px;
          }

          .stats-section__heading h2 {
            font-size: 35px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .stat-card {
            min-height: 148px;
            border-right: 0;
            border-bottom: 1px solid var(--line);
          }

          .stat-card:nth-child(2) {
            border-bottom: 1px solid var(--line);
          }

          .stat-card:last-child {
            border-bottom: 0;
          }

          .stat-card strong {
            font-size: 43px;
          }

          .dashboard-note {
            padding: 15px;
          }
        }
      `}</style>
    </main>
  )
}
