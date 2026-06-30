"use client"

import { useMemo, useState } from "react"
import Nav from "../components/Nav"

function makeUrl({ name, text, time, apikey }) {
  const params = new URLSearchParams()
  params.set("name", name || "Instagram user")
  params.set("text", text || "halo semuanya")
  params.set("time", time || "8 detik")
  if (apikey.trim()) params.set("apikey", apikey.trim())
  return `/api/v1/ignote?${params.toString()}`
}

export default function PlaygroundPage() {
  const [name, setName] = useState("Fauzann")
  const [text, setText] = useState("Halo dari Arunika API")
  const [time, setTime] = useState("8 detik")
  const [apikey, setApikey] = useState("")
  const [requestUrl, setRequestUrl] = useState(makeUrl({ name: "Fauzann", text: "Halo dari Arunika API", time: "8 detik", apikey: "" }))
  const [version, setVersion] = useState(0)
  const [error, setError] = useState("")

  const fullUrl = useMemo(() => {
    if (typeof window === "undefined") return requestUrl
    return `${window.location.origin}${requestUrl}`
  }, [requestUrl])

  function submit(event) {
    event.preventDefault()
    setError("")
    setRequestUrl(makeUrl({ name, text, time, apikey }))
    setVersion((current) => current + 1)
  }

  return (
    <main>
      <Nav />
      <section className="page-hero section-shell compact">
        <div className="eyebrow">LIVE PLAYGROUND</div>
        <h1>Test endpoint tanpa keluar dari website.</h1>
        <p>Isi parameter, generate, lalu salin URL hasilnya untuk dipakai di command bot.</p>
      </section>
      <section className="playground-layout section-shell">
        <form className="playground-form" onSubmit={submit}>
          <label>
            <span>Name <em>max 32</em></span>
            <input value={name} onChange={(event) => setName(event.target.value.slice(0, 32))} placeholder="Fauzann" />
          </label>
          <label>
            <span>Text <em>max 120</em></span>
            <textarea value={text} onChange={(event) => setText(event.target.value.slice(0, 120))} placeholder="halo semuanya" rows={4} />
          </label>
          <label>
            <span>Time <em>optional</em></span>
            <input value={time} onChange={(event) => setTime(event.target.value.slice(0, 18))} placeholder="8 detik" />
          </label>
          <label>
            <span>API Key <em>optional</em></span>
            <input value={apikey} onChange={(event) => setApikey(event.target.value)} placeholder="Isi jika API_KEY aktif" type="password" />
          </label>
          <button type="submit" className="button button-primary full">Generate IG Note <span>↗</span></button>
        </form>
        <div className="playground-result">
          <div className="result-toolbar"><span>PREVIEW</span><span>PNG · 1080×1920</span></div>
          <div className="preview-stage">
            <img key={version} src={requestUrl} alt="Hasil generator IG Note" onError={() => setError("Gagal memuat gambar. Periksa API key atau parameter yang dimasukkan.")} />
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="url-box"><span>GET</span><code>{fullUrl}</code></div>
          <button className="copy-button" type="button" onClick={() => navigator.clipboard?.writeText(fullUrl)}>Copy URL</button>
        </div>
      </section>
    </main>
  )
}
