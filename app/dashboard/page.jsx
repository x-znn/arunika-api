import Nav from "../components/Nav"
import { getApiStats } from "../../lib/stats"

export const dynamic = "force-dynamic"

const endpoints = [
  {
    method: "GET",
    path: "ignote",
    status: "online"
  },
  {
    method: "GET",
    path: "api-health",
    status: "Online"
  },
  {
    method: "GET",
    path: "api-stats",
    status: "Online"
  },
  {
    method: "POST",
    path: "ludo",
    status: "Online"
  },
  {
    method: "GET",
    path: "ludo-room",
    status: "Online"
  },
  {
    method: "GET",
    path: "ludo-board",
    status: "Online"
  },
  {
    method: "POST",
    path: "monopoly",
    status: "Online"
  },
  {
    method: "GET",
    path: "monopoly-room",
    status: "Online"
  },
  {
    method: "GET",
    path: "monopoly-board",
    status: "Online"
  },
  {
    method: "GET",
    path: "monopoly-card",
    status: "Online"
  }
]

export default async function DashboardPage() {
  const stats = await getApiStats()
  const connected = stats.connected

  const number = (value) => {
    return connected
      ? Number(value || 0).toLocaleString("id-ID")
      : "—"
  }

  const gameEndpoints = endpoints.filter((item) => {
    return item.path.includes("/ludo") || item.path.includes("/monopoly")
  }).length

  return (
    <main className="paper-site">
      <Nav />

      <section className="page-intro">
        <span className="section-label">API ANALYTICS</span>
        <h1>Dashboard.</h1>
        <p>Ringkasan endpoint dan request.</p>
      </section>

      <section className="metric-grid">
        <article>
          <span>Total requests</span>
          <strong>{number(stats.total)}</strong>
          <small>seluruh endpoint</small>
        </article>

        <article>
          <span>Canvas requests</span>
          <strong>{number(stats.ignote)}</strong>
          <small>ignote</small>
        </article>

        <article>
          <span>Game endpoints</span>
          <strong>{gameEndpoints}</strong>
          <small>Ludo dan Monopoly</small>
        </article>

        <article>
          <span>Database</span>
          <strong
            className={
              connected
                ? "metric-online"
                : "metric-setup"
            }
          >
            {connected ? "Live" : "Setup"}
          </strong>
          <small>
            {connected
              ? "connected"
              : "belum tersambung"}
          </small>
        </article>
      </section>

      <section className="dashboard-paper">
        <div className="dashboard-paper__heading">
          <span className="section-label">SERVICE STATUS</span>
          <h2>Endpoint availability</h2>
        </div>

        <div className="status-list">
          {endpoints.map((endpoint) => (
            <div key={endpoint.method + endpoint.path}>
              <span className="http-pill">
                {endpoint.method}
              </span>

              <code>{endpoint.path}</code>

              <b>{endpoint.status}</b>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
