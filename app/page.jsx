export default function HomePage() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#09090b",
      color: "#ffffff",
      padding: "42px 24px",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <p style={{ color: "#8b5cf6", fontWeight: 700, letterSpacing: 2 }}>
          ARUNIKA / API
        </p>

        <h1 style={{ fontSize: 42, margin: "12px 0" }}>
          Simple API untuk Bot WhatsApp.
        </h1>

        <p style={{ color: "#a1a1aa", lineHeight: 1.7, maxWidth: 650 }}>
          Endpoint gambar, playground, dokumentasi, dan statistik request
          untuk kebutuhan bot WhatsApp kamu.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 14,
          marginTop: 36
        }}>
          <a href="/playground" style={cardStyle}>
            <b>Playground</b>
            <small>Uji endpoint IG Note langsung</small>
          </a>

          <a href="/docs" style={cardStyle}>
            <b>Documentation</b>
            <small>Lihat parameter dan contoh URL</small>
          </a>

          <a href="/dashboard" style={cardStyle}>
            <b>Dashboard</b>
            <small>Lihat statistik API</small>
          </a>

          <a href="/api/health" style={cardStyle}>
            <b>Health Check</b>
            <small>Cek status server JSON</small>
          </a>
        </div>

        <section style={{
          marginTop: 38,
          padding: 20,
          border: "1px solid #27272a",
          borderRadius: 14,
          background: "#111113"
        }}>
          <p style={{ color: "#8b5cf6", fontWeight: 700, marginTop: 0 }}>
            GET · IG NOTE
          </p>

          <code style={{
            color: "#e4e4e7",
            fontSize: 13,
            wordBreak: "break-all"
          }}>
            /api/v1/ignote?name=Fauzann&text=Halo%20semua&time=8%20detik
          </code>
        </section>
      </div>
    </main>
  )
}

const cardStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: 18,
  borderRadius: 14,
  textDecoration: "none",
  color: "#ffffff",
  background: "#16161a",
  border: "1px solid #29292f"
}
