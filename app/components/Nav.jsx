import Link from "next/link"

export default function Nav() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand-lockup" aria-label="Arunika APIs beranda">
          <strong>Arunika APIs.</strong>
          <span>Simple, Fast, Ready.</span>
        </Link>
        <div className="header-actions">
          <Link className="version-badge" href="/docs">v1.0</Link>
          <Link className="header-link" href="/playground">Playground</Link>
        </div>
      </div>
    </header>
  )
}
