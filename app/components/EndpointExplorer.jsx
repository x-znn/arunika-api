"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

const endpoints = [
  {
    name: "IG Note Generator",
    method: "GET",
    path: "/api/v1/ignote",
    category: "generate",
    description: "Generate PNG fake note untuk command bot WhatsApp.",
    status: "Online"
  },
  {
    name: "IG Note JSON",
    method: "GET",
    path: "/api/v1/ignote/json",
    category: "generate",
    description: "Mengembalikan respons JSON berisi URL hasil generator.",
    status: "Online"
  },
  {
    name: "Server Status",
    method: "GET",
    path: "/api/health",
    category: "system",
    description: "Cek status Arunika API dan konfigurasi keamanan.",
    status: "Online"
  },
  {
    name: "API Statistics",
    method: "GET",
    path: "/api/stats",
    category: "system",
    description: "Ringkasan request, statistik IG Note, dan status Upstash.",
    status: "Online"
  }
]

const filters = [
  { id: "all", label: "all" },
  { id: "generate", label: "generate" },
  { id: "system", label: "system" }
]

export default function EndpointExplorer() {
  const [query, setQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")

  const result = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return endpoints.filter((endpoint) => {
      const sameCategory = activeFilter === "all" || endpoint.category === activeFilter
      const matchesQuery = !normalized || [endpoint.name, endpoint.path, endpoint.description]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
      return sameCategory && matchesQuery
    })
  }, [activeFilter, query])

  return (
    <section className="endpoint-explorer" aria-label="Daftar endpoint Arunika API">
      <div className="explorer-topline">
        <div>
          <span className="section-label">ENDPOINT DIRECTORY</span>
          <h2>Endpoint yang siap dipakai.</h2>
        </div>
        <Link href="/docs" className="outline-link">Buka dokumentasi ↗</Link>
      </div>

      <div className="explorer-stats">
        <article>
          <strong>{endpoints.length}</strong>
          <span>Total endpoints</span>
        </article>
        <article>
          <strong>2</strong>
          <span>Total categories</span>
        </article>
      </div>

      <input
        className="endpoint-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by endpoint name"
        aria-label="Cari endpoint"
      />

      <div className="filter-row" role="tablist" aria-label="Filter endpoint">
        {filters.map((filter) => (
          <button
            key={filter.id}
            className={activeFilter === filter.id ? "filter-button active" : "filter-button"}
            onClick={() => setActiveFilter(filter.id)}
            type="button"
          >
            {filter.label} ({filter.id === "all" ? endpoints.length : endpoints.filter((item) => item.category === filter.id).length})
          </button>
        ))}
      </div>

      <div className="endpoint-list">
        {result.length ? result.map((endpoint) => (
          <article className="endpoint-row" key={endpoint.path}>
            <div className="endpoint-row__route">
              <span className="http-pill">{endpoint.method}</span>
              <code>{endpoint.path}</code>
            </div>
            <div className="endpoint-row__body">
              <div>
                <h3>{endpoint.name}</h3>
                <p>{endpoint.description}</p>
              </div>
              <span className="online-badge">{endpoint.status}</span>
            </div>
          </article>
        )) : (
          <div className="empty-result">Tidak ada endpoint yang cocok.</div>
        )}
      </div>
    </section>
  )
}
