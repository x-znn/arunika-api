import Nav from "../components/Nav"
import { getApiStats } from "../../lib/stats"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const stats = await getApiStats()
  const connected = stats.connected
  const number = (value) => connected ? value.toLocaleString("id-ID") : "—"

  return (
    <main className="paper-site">
      <Nav />
      <section className="page-intro">
        <span className="section-label">API ANALYTICS</span>
        <h1>Dashboard.</h1>
        <p>Ringkasan endpoint dan request. Hubungkan Upstash agar angkanya tercatat permanen.</p>
      </section>

      <section className="metric-grid">
        <article><span>Total requests</span><strong>{number(stats.total)}</strong><small>seluruh endpoint</small></article>
        <article><span>IG Note requests</span><strong>{number(stats.ignote)}</strong><small>/api/v1/ignote</small></article>
        <article><span>Today</span><strong>{number(stats.today)}</strong><small>{stats.dayLabel}</small></article>
        <article><span>Database</span><strong className={connected ? "metric-online" : "metric-setup"}>{connected ? "Live" : "Setup"}</strong><small>{connected ? "connected" : "belum tersambung"}</small></article>
      </section>

      <section className="dashboard-paper">
        <div className="dashboard-paper__heading"><span className="section-label">SERVICE STATUS</span><h2>Endpoint availability</h2></div>
        <div className="status-list">
          <div><span className="http-pill">GET</span><code>/api/v1/ignote</code><b>Online</b></div>
          <div><span className="http-pill">GET</span><code>/api/v1/ignote/json</code><b>Online</b></div>
          <div><span className="http-pill">GET</span><code>/api/health</code><b>Online</b></div>
          <div><span className="http-pill">GET</span><code>/api/stats</code><b>Online</b></div>
        </div>
      </section>
    </main>
  )
}
