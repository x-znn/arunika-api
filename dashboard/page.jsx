import Nav from "../components/Nav"
import { getApiStats } from "../../lib/stats"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const stats = await getApiStats()
  const connected = stats.connected
  return (
    <main>
      <Nav />
      <section className="page-hero section-shell compact">
        <div className="eyebrow">DASHBOARD / LIVE DATA</div>
        <h1>API activity overview.</h1>
        <p>Statistik request tersimpan di Upstash Redis saat environment variable sudah diisi.</p>
      </section>
      <section className="section-shell dashboard-grid">
        <article className="metric-card"><span>Total Requests</span><strong>{connected ? stats.total.toLocaleString("id-ID") : "—"}</strong><small>{connected ? "seluruh endpoint" : "Upstash belum dihubungkan"}</small></article>
        <article className="metric-card"><span>IG Note Requests</span><strong>{connected ? stats.ignote.toLocaleString("id-ID") : "—"}</strong><small>endpoint /api/v1/ignote</small></article>
        <article className="metric-card"><span>Today</span><strong>{connected ? stats.today.toLocaleString("id-ID") : "—"}</strong><small>{stats.dayLabel}</small></article>
        <article className="metric-card"><span>Service</span><strong className={connected ? "online" : "muted-strong"}>{connected ? "Online" : "Setup"}</strong><small>{connected ? "Redis connected" : "tambahkan env Upstash"}</small></article>
      </section>
      <section className="section-shell section-block">
        <div className="dashboard-table">
          <div className="table-head"><span>ENDPOINT</span><span>METHOD</span><span>REQUESTS</span><span>STATUS</span></div>
          <div className="table-row"><code>/api/v1/ignote</code><span>GET</span><span>{connected ? stats.ignote.toLocaleString("id-ID") : "—"}</span><b>ONLINE</b></div>
          <div className="table-row"><code>/api/health</code><span>GET</span><span>—</span><b>ONLINE</b></div>
          <div className="table-row"><code>/api/stats</code><span>GET</span><span>—</span><b>ONLINE</b></div>
        </div>
      </section>
    </main>
  )
}
