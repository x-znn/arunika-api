export default function Nav() {
  return (
    <header className="nav-wrap">
      <nav className="nav">
        <a href="/" className="brand" aria-label="Arunika API beranda">
          <span className="brand-mark">A</span>
          <span>ARUNIKA<span className="brand-dim">/API</span></span>
        </a>
        <div className="nav-links">
          <a href="/docs">Docs</a>
          <a href="/playground">Playground</a>
          <a href="/dashboard">Dashboard</a>
        </div>
      </nav>
    </header>
  )
}
