"use client"

import { useMemo, useState } from "react"
import Nav from "../components/Nav"

function makeUrl({ name, text, time, apikey }) {
  const params = new URLSearchParams()
  params.set("name", name || "Fauzann")
  params.set("text", text || "Halo semua")
  params.set("time", time || "8 detik")
  if (apikey.trim()) params.set("apikey", apikey.trim())
  return `/api/v1/ignote?${params.toString()}`
}

export default function PlaygroundPage() {
  const [name, setName] = useState("Fauzann")
  const [text, setText] = useState("Halo semua")
  const [time, setTime] = useState("8 detik")
  const [apikey, setApikey] = useState("")
  const [requestUrl, setRequestUrl] = useState(makeUrl({ name: "Fauzann", text: "Halo semua", time: "8 detik", apikey: "" }))
  const [version, setVersion] = useState(0)

  const outputUrl = useMemo(() => {
    if (typeof window === "undefined") return requestUrl
    return `${window.location.origin}${requestUrl}`
  }, [requestUrl])

  function generate(event) {
    event.preventDefault()
    setRequestUrl(makeUrl({ name, text, time, apikey }))
    setVersion((value) => value + 1)
  }

  return (
    <main className="paper-site">
      <Nav />
      <section className="page-intro page-intro--playground">
        <span className="section-label">LIVE PLAYGROUND</span>
        <h1>Try it directly.</h1>
        <p>Isi parameter, generate, lalu salin endpoint hasil untuk command bot.</p>
      </section>

      <section className="playground-paper">
        <form onSubmit={generate} className="play-form">
          <label><span>Name</span><input value={name} onChange={(event) => setName(event.target.value.slice(0, 22))} /></label>
          <label><span>Text</span><textarea value={text} onChange={(event) => setText(event.target.value.slice(0, 48))} rows={4} /></label>
          <label><span>Time</span><input value={time} onChange={(event) => setTime(event.target.value.slice(0, 16))} /></label>
          <label><span>API key <em>optional</em></span><input type="password" value={apikey} onChange={(event) => setApikey(event.target.value)} /></label>
          <button className="action-button action-button--solid" type="submit">Generate image ↗</button>
        </form>

        <div className="play-preview">
          <div className="preview-label"><span>PREVIEW</span><span>PNG • 864×1536</span></div>
          <div className="preview-frame"><img key={version} src={requestUrl} alt="Hasil API IG Note" /></div>
          <div className="request-url"><span>GET</span><code>{outputUrl}</code></div>
          <button className="copy-output" type="button" onClick={() => navigator.clipboard?.writeText(outputUrl)}>Copy endpoint</button>
        </div>
      </section>
    </main>
  )
}
