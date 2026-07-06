"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { API_CATEGORIES, API_ENDPOINTS, endpointById } from "./apiCatalog"

function makeForms() {
  return API_ENDPOINTS.reduce((result, endpoint) => {
    result[endpoint.id] = {
      params: (endpoint.params || []).reduce((fields, field) => {
        fields[field.key] = field.defaultValue || ""
        return fields
      }, {}),
      body: endpoint.body || "",
      mode: "image",
      file: null,
      fileName: ""
    }
    return result
  }, {})
}

function jsonText(value) {
  if (typeof value === "string") return value
  return JSON.stringify(value, null, 2)
}

function methodClass(method) {
  return method === "POST"
    ? "catalog-method catalog-method--post"
    : "catalog-method"
}

function responseClass(status) {
  if (status >= 200 && status < 300) return "catalog-status catalog-status--ok"
  if (status >= 400 && status < 500) return "catalog-status catalog-status--warn"
  return "catalog-status catalog-status--error"
}

export default function EndpointExplorer({ playground = false }) {
  const [category, setCategory] = useState("maker")
  const [activeId, setActiveId] = useState("ignote")
  const [forms, setForms] = useState(makeForms)
  const [origin, setOrigin] = useState("")
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState("")
  const previewRef = useRef("")

  const visibleEndpoints = useMemo(
    () => API_ENDPOINTS.filter((endpoint) => endpoint.category === category),
    [category]
  )

  const endpoint = endpointById(activeId)
  const form = forms[endpoint.id] || { params: {}, body: "", mode: "image", file: null, fileName: "" }

  useEffect(() => {
    setOrigin(window.location.origin)

    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    }
  }, [])

  useEffect(() => {
    if (!visibleEndpoints.some((item) => item.id === activeId)) {
      setActiveId(visibleEndpoints[0]?.id || "")
      setResponse(null)
    }
  }, [activeId, visibleEndpoints])

  function selectCategory(nextCategory) {
    const first = API_ENDPOINTS.find((item) => item.category === nextCategory)
    setCategory(nextCategory)
    setActiveId(first?.id || "")
    setResponse(null)
  }

  function updateParam(key, value) {
    setForms((current) => ({
      ...current,
      [endpoint.id]: {
        ...current[endpoint.id],
        params: { ...current[endpoint.id].params, [key]: value }
      }
    }))
  }

  function updateForm(key, value) {
    setForms((current) => ({
      ...current,
      [endpoint.id]: { ...current[endpoint.id], [key]: value }
    }))
  }

  function requestPath() {
    const query = new URLSearchParams()

    Object.entries(form.params || {}).forEach(([key, value]) => {
      const text = String(value || "").trim()
      if (text) query.set(key, text)
    })

    const queryText = query.toString()
    return queryText ? endpoint.route + "?" + queryText : endpoint.route
  }

  const path = requestPath()
  const fullUrl = origin ? origin + path : path

  function curlCommand() {
    if (endpoint.acceptsFile) {
      return `curl -X POST "${fullUrl}" -H "Accept: image/png" -F "file=@gambar.jpg" -F "mode=${form.mode || "image"}"`
    }

    if (endpoint.method === "POST") {
      const safeBody = String(form.body || "{}").replace(/'/g, "'\\''")
      return `curl -X POST "${fullUrl}" -H "Content-Type: application/json" -d '${safeBody}'`
    }

    return `curl -X GET "${fullUrl}" -H "Accept: application/json"`
  }

  async function copy(value, key) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(key)
      window.setTimeout(() => setCopied(""), 1400)
    } catch {
      setCopied("")
    }
  }

  async function execute() {
    setLoading(true)

    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current)
      previewRef.current = ""
    }

    try {
      const options = {
        method: endpoint.method,
        headers: {
          Accept: "application/json, image/png, image/jpeg, image/webp"
        }
      }

      if (endpoint.acceptsFile) {
        if (!form.file) {
          throw new Error("Pilih gambar atau sticker dari galeri terlebih dahulu.")
        }

        const data = new FormData()
        data.set("file", form.file)
        data.set("mode", form.mode || "image")
        options.body = data
      } else if (endpoint.method === "POST") {
        let body
        try {
          body = JSON.parse(form.body || "{}")
        } catch {
          throw new Error("Request body harus berupa JSON yang valid.")
        }

        options.headers["Content-Type"] = "application/json"
        options.body = JSON.stringify(body)
      }

      const result = await fetch(path, options)
      const type = String(result.headers.get("content-type") || "").toLowerCase()

      if (type.startsWith("image/")) {
        const blob = await result.blob()
        const imageUrl = URL.createObjectURL(blob)
        previewRef.current = imageUrl
        setResponse({ type: "image", status: result.status, ok: result.ok, imageUrl })
        return
      }

      const raw = await result.text()
      let payload = raw || { message: "Respons API kosong." }
      try {
        payload = raw ? JSON.parse(raw) : payload
      } catch {}

      setResponse({ type: "json", status: result.status, ok: result.ok, payload })
    } catch (error) {
      setResponse({
        type: "json",
        status: 0,
        ok: false,
        payload: { message: String(error?.message || error || "Request gagal.") }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className={"catalog-shell" + (playground ? " catalog-shell--playground" : "")}>
      <div className="catalog-head">
        <div>
          <span className="section-label">{playground ? "ARUNIKA API PLAYGROUND" : "API CATALOG"}</span>
          <h2>{playground ? "Test endpoint langsung." : "Pilih fitur API."}</h2>
          <p>
            {playground
              ? "Pilih kategori, atur parameter, lalu jalankan request dari browser. Untuk Fake React, pilih file langsung dari galeri HP."
              : "Kelompokkan fitur berdasarkan Maker, Game, dan System agar endpoint lebih cepat dicari."}
          </p>
        </div>

        {!playground && (
          <Link href="/playground" className="catalog-open">
            Buka Playground ↗
          </Link>
        )}
      </div>

      <div className="catalog-tabs" role="tablist" aria-label="Kategori API">
        {API_CATEGORIES.map((item) => (
          <button
            type="button"
            key={item.id}
            className={"catalog-tab" + (category === item.id ? " catalog-tab--active" : "")}
            onClick={() => selectCategory(item.id)}
          >
            <i>{item.icon}</i>
            <span>{item.label}</span>
            <small>{API_ENDPOINTS.filter((endpoint) => endpoint.category === item.id).length}</small>
          </button>
        ))}
      </div>

      <div className="catalog-grid">
        <aside className="catalog-list">
          <div className="catalog-category-copy">
            <span>{API_CATEGORIES.find((item) => item.id === category)?.label}</span>
            <p>{API_CATEGORIES.find((item) => item.id === category)?.description}</p>
          </div>

          <div className="catalog-items">
            {visibleEndpoints.map((item) => (
              <button
                type="button"
                key={item.id}
                className={"catalog-item" + (item.id === endpoint.id ? " catalog-item--active" : "")}
                onClick={() => {
                  setActiveId(item.id)
                  setResponse(null)
                }}
              >
                <span className={methodClass(item.method)}>{item.method}</span>
                <div>
                  <small>{item.group}</small>
                  <strong>{item.title}</strong>
                </div>
                <b>›</b>
              </button>
            ))}
          </div>
        </aside>

        <section className="catalog-request">
          <div className="catalog-request__head">
            <div>
              <span className="section-label">{endpoint.group}</span>
              <div className="catalog-title-row">
                <span className={methodClass(endpoint.method)}>{endpoint.method}</span>
                <h3>{endpoint.title}</h3>
              </div>
              <p>{endpoint.description}</p>
            </div>
            <Link href="/docs" className="catalog-docs">Docs ↗</Link>
          </div>

          <div className="catalog-url">
            <span>{endpoint.method}</span>
            <code>{fullUrl}</code>
            <button type="button" onClick={() => copy(fullUrl, "url")}>
              {copied === "url" ? "✓" : "Copy"}
            </button>
          </div>

          {endpoint.liveAction && (
            <div className="catalog-warning">
              <b>!</b>
              Endpoint ini dapat mengubah state room game asli. Gunakan room testing saat mencoba action.
            </div>
          )}

          {endpoint.acceptsFile ? (
            <div className="catalog-upload">
              <span className="catalog-field-label">MEDIA DARI GALERI</span>
              <label className="catalog-file-picker">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null
                    updateForm("file", file)
                    updateForm("fileName", file?.name || "")
                  }}
                />
                <span>▣ Pilih gambar / sticker</span>
                <small>{form.fileName || "JPG, PNG, atau WEBP · maksimal 8 MB"}</small>
              </label>

              <label className="catalog-select">
                <span>MODE MEDIA</span>
                <select value={form.mode || "image"} onChange={(event) => updateForm("mode", event.target.value)}>
                  <option value="image">Image — memenuhi kotak</option>
                  <option value="sticker">Sticker — memenuhi kotak</option>
                </select>
              </label>
            </div>
          ) : endpoint.params?.length ? (
            <div className="catalog-fields">
              {endpoint.params.map((field) => (
                <label key={field.key}>
                  <span>{field.label}</span>
                  <input
                    type="text"
                    value={form.params?.[field.key] || ""}
                    placeholder={field.placeholder}
                    onChange={(event) => updateParam(field.key, event.target.value)}
                  />
                </label>
              ))}
            </div>
          ) : null}

          {endpoint.method === "POST" && !endpoint.acceptsFile && (
            <label className="catalog-json">
              <span>JSON BODY</span>
              <textarea value={form.body} onChange={(event) => updateForm("body", event.target.value)} spellCheck="false" />
            </label>
          )}

          {!endpoint.acceptsFile && endpoint.method === "GET" && !endpoint.params?.length && (
            <div className="catalog-empty">Endpoint ini tidak membutuhkan parameter. Langsung jalankan request.</div>
          )}

          <div className="catalog-actions">
            <button type="button" className="catalog-execute" onClick={execute} disabled={loading}>
              {loading ? "MEMPROSES..." : "▶ JALANKAN REQUEST"}
            </button>
            <button type="button" className="catalog-curl" onClick={() => copy(curlCommand(), "curl")}>
              {copied === "curl" ? "✓ COPIED" : "▣ COPY CURL"}
            </button>
          </div>

          {response && (
            <div className="catalog-response">
              <div className="catalog-response__head">
                <span>API RESPONSE</span>
                <b className={responseClass(response.status)}>{response.status || "ERROR"}</b>
              </div>

              {response.type === "image" ? (
                <div className={"catalog-image" + (endpoint.preview === "portrait" ? " catalog-image--portrait" : "") + (endpoint.preview === "board" ? " catalog-image--board" : "")}>
                  <img src={response.imageUrl} alt={endpoint.title + " result"} />
                </div>
              ) : (
                <pre>{jsonText(response.payload)}</pre>
              )}
            </div>
          )}
        </section>
      </div>

      <style>{`
        .catalog-shell { width:min(1180px, calc(100% - 40px)); margin:0 auto 74px; border:1px solid var(--line); background:#fffdf8; overflow:hidden; }
        .catalog-shell *, .catalog-shell *::before, .catalog-shell *::after { box-sizing:border-box; }
        .catalog-head { display:flex; justify-content:space-between; align-items:end; gap:28px; padding:38px; border-bottom:1px solid var(--line); }
        .catalog-head h2 { margin:9px 0 11px; color:var(--ink); font:800 clamp(31px,5vw,54px)/.94 var(--mono); letter-spacing:-.075em; }
        .catalog-head p { max-width:620px; margin:0; color:var(--muted); font-size:14px; line-height:1.7; }
        .catalog-open, .catalog-docs { display:inline-flex; align-items:center; justify-content:center; padding:12px 15px; color:var(--ink); border:1px solid var(--line); font:800 11px var(--mono); text-decoration:none; white-space:nowrap; }
        .catalog-open:hover, .catalog-docs:hover { background:var(--ink); color:#fff; }
        .catalog-tabs { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); border-bottom:1px solid var(--line); }
        .catalog-tab { min-height:82px; display:flex; align-items:center; gap:11px; padding:16px 22px; border:0; border-right:1px solid var(--line); background:#f7f4ed; color:var(--ink); text-align:left; cursor:pointer; }
        .catalog-tab:last-child { border-right:0; }
        .catalog-tab i { display:grid; width:28px; height:28px; place-items:center; border:1px solid currentColor; font-style:normal; }
        .catalog-tab span { font:800 16px var(--mono); }
        .catalog-tab small { margin-left:auto; color:var(--muted); font:800 10px var(--mono); }
        .catalog-tab--active { background:#f1d36f; }
        .catalog-grid { display:grid; grid-template-columns:340px minmax(0,1fr); min-width:0; }
        .catalog-list { border-right:1px solid var(--line); background:#faf8f2; }
        .catalog-category-copy { padding:24px 24px 18px; border-bottom:1px solid var(--line); }
        .catalog-category-copy span { color:var(--orange-dark); font:800 11px var(--mono); letter-spacing:.08em; text-transform:uppercase; }
        .catalog-category-copy p { margin:10px 0 0; color:var(--muted); font-size:13px; line-height:1.65; }
        .catalog-items { display:flex; flex-direction:column; }
        .catalog-item { width:100%; display:flex; align-items:center; gap:12px; padding:16px 20px; border:0; border-bottom:1px solid var(--line); background:transparent; text-align:left; cursor:pointer; }
        .catalog-item:hover, .catalog-item--active { background:#fff; }
        .catalog-item--active { box-shadow:inset 4px 0 0 #d79912; }
        .catalog-item div { min-width:0; display:grid; gap:4px; }
        .catalog-item small { color:var(--muted); font:800 9px var(--mono); letter-spacing:.065em; }
        .catalog-item strong { overflow:hidden; color:var(--ink); font:800 14px var(--mono); text-overflow:ellipsis; white-space:nowrap; }
        .catalog-item > b { margin-left:auto; color:var(--muted); font:800 23px/1 var(--mono); }
        .catalog-method { flex:0 0 auto; padding:6px 7px; color:#246a48; border:1px solid #b9dec8; background:#e8f7ed; font:800 9px var(--mono); letter-spacing:.04em; }
        .catalog-method--post { color:#91520b; border-color:#ead0a7; background:#fff1db; }
        .catalog-request { min-width:0; padding:31px; }
        .catalog-request__head { display:flex; justify-content:space-between; align-items:start; gap:18px; margin-bottom:22px; }
        .catalog-title-row { display:flex; align-items:center; gap:10px; margin:10px 0; }
        .catalog-title-row h3 { margin:0; color:var(--ink); font:800 clamp(24px,4vw,37px)/.98 var(--mono); letter-spacing:-.07em; }
        .catalog-request__head p { max-width:640px; margin:0; color:var(--muted); font-size:13px; line-height:1.7; }
        .catalog-url { min-width:0; display:flex; align-items:center; gap:11px; padding:12px; border:1px solid var(--line); background:#f8f6ef; }
        .catalog-url > span { padding:5px 6px; color:#246a48; background:#e8f7ed; border:1px solid #b9dec8; font:800 9px var(--mono); }
        .catalog-url code { min-width:0; flex:1; overflow:auto hidden; color:var(--ink); font:700 11px var(--mono); white-space:nowrap; }
        .catalog-url button, .catalog-curl { flex:0 0 auto; padding:8px 10px; color:var(--ink); border:1px solid var(--line); background:#fff; font:800 9px var(--mono); cursor:pointer; }
        .catalog-warning { display:flex; gap:10px; margin-top:16px; padding:12px 14px; color:#8b520b; background:#fff1d4; border:1px solid #efd4a4; font-size:12px; line-height:1.6; }
        .catalog-warning b { display:grid; width:18px; height:18px; flex:0 0 auto; place-items:center; border:1px solid currentColor; border-radius:50%; font:800 11px var(--mono); }
        .catalog-fields { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:13px; margin-top:19px; }
        .catalog-fields label, .catalog-json, .catalog-select { display:grid; gap:7px; }
        .catalog-fields label span, .catalog-json > span, .catalog-select > span, .catalog-field-label { color:var(--muted); font:800 9px var(--mono); letter-spacing:.08em; }
        .catalog-fields input, .catalog-select select, .catalog-json textarea { width:100%; min-width:0; padding:12px; outline:none; color:var(--ink); border:1px solid var(--line); border-radius:0; background:#fff; font:700 12px var(--mono); }
        .catalog-fields input:focus, .catalog-select select:focus, .catalog-json textarea:focus { border-color:#d79912; box-shadow:0 0 0 3px rgba(215,153,18,.12); }
        .catalog-json { margin-top:19px; }
        .catalog-json textarea { min-height:174px; resize:vertical; line-height:1.6; }
        .catalog-upload { display:grid; gap:14px; margin-top:20px; }
        .catalog-file-picker { min-height:118px; display:grid; align-content:center; gap:7px; padding:18px; border:1px dashed #bcae91; background:#fbf7ec; cursor:pointer; }
        .catalog-file-picker:hover { background:#fff1ce; border-color:#c78510; }
        .catalog-file-picker input { position:absolute; width:1px; height:1px; opacity:0; pointer-events:none; }
        .catalog-file-picker span { color:var(--ink); font:800 14px var(--mono); }
        .catalog-file-picker small { overflow:hidden; color:var(--muted); font-size:12px; text-overflow:ellipsis; white-space:nowrap; }
        .catalog-empty { margin-top:19px; padding:15px; color:var(--muted); border:1px dashed var(--line); background:#faf8f2; font-size:13px; }
        .catalog-actions { display:flex; flex-wrap:wrap; gap:10px; margin-top:20px; }
        .catalog-execute { min-width:190px; padding:14px 17px; color:#fff; border:1px solid var(--ink); background:var(--ink); font:800 11px var(--mono); letter-spacing:.04em; cursor:pointer; }
        .catalog-execute:hover:not(:disabled) { background:#d79912; border-color:#d79912; }
        .catalog-execute:disabled { opacity:.55; cursor:wait; }
        .catalog-curl { padding:14px 15px; background:#fffdf8; }
        .catalog-response { margin-top:24px; overflow:hidden; border:1px solid var(--line); background:#fbfaf6; }
        .catalog-response__head { display:flex; justify-content:space-between; align-items:center; padding:12px 14px; border-bottom:1px solid var(--line); }
        .catalog-response__head > span { color:var(--muted); font:800 9px var(--mono); letter-spacing:.08em; }
        .catalog-status { padding:6px 8px; font:800 10px var(--mono); }
        .catalog-status--ok { color:#1f7146; background:#e7f5e9; }
        .catalog-status--warn { color:#92530a; background:#fff0d8; }
        .catalog-status--error { color:#a12d2d; background:#fee9e9; }
        .catalog-response pre { max-height:390px; margin:0; padding:16px; overflow:auto; color:#263127; font:700 12px/1.65 var(--mono); white-space:pre-wrap; }
        .catalog-image { display:grid; min-height:240px; max-height:500px; place-items:center; padding:17px; background:#f0eee8; }
        .catalog-image img { display:block; max-width:100%; max-height:466px; object-fit:contain; border:1px solid var(--line); background:#fff; }
        .catalog-image--portrait img { max-height:500px; }
        .catalog-image--board img { width:100%; max-height:none; }
        @media (max-width:860px) { .catalog-head{padding:28px;align-items:start;flex-direction:column}.catalog-grid{grid-template-columns:1fr}.catalog-list{border-right:0;border-bottom:1px solid var(--line)}.catalog-items{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.catalog-item:nth-child(odd){border-right:1px solid var(--line)}.catalog-request{padding:25px}.catalog-tabs{overflow-x:auto;grid-template-columns:repeat(3,minmax(180px,1fr))} }
        @media (max-width:560px) { .catalog-shell{width:min(100% - 24px,1180px);margin-bottom:42px}.catalog-head{padding:22px}.catalog-head h2{font-size:35px}.catalog-open{width:100%}.catalog-tabs{grid-template-columns:repeat(3,minmax(145px,1fr))}.catalog-tab{min-height:68px;padding:12px}.catalog-tab span{font-size:13px}.catalog-request{padding:19px}.catalog-request__head{flex-direction:column}.catalog-docs{width:100%}.catalog-items{grid-template-columns:1fr}.catalog-item:nth-child(odd){border-right:0}.catalog-fields{grid-template-columns:1fr}.catalog-url{align-items:flex-start;flex-wrap:wrap}.catalog-url code{width:100%;order:3}.catalog-url button{margin-left:auto}.catalog-execute,.catalog-curl{width:100%} }
      `}</style>
    </section>
  )
}
