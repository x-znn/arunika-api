"use client"

import Link from "next/link"
import Nav from "../components/Nav"
import { useEffect, useRef, useState } from "react"

const ENDPOINTS = [
  {
    id: "api-health",
    name: "api-health",
    group: "SYSTEM",
    method: "GET",
    title: "Health Check",
    route: "/api/health",
    description:
      "Mengecek apakah Arunika API sedang aktif dan siap digunakan.",
    params: []
  },
  {
    id: "api-stats",
    name: "api-stats",
    group: "SYSTEM",
    method: "GET",
    title: "API Statistics",
    route: "/api/stats",
    description:
      "Mengambil statistik request yang tercatat.",
    params: []
  },
  {
    id: "ignote",
    name: "ignote",
    group: "IMAGE",
    method: "GET",
    title: "IG Note Image",
    route: "/api/v1/ignote",
    description:
      "Generate gambar Instagram Note dalam format PNG.",
    preview: "portrait",
    params: [
      {
        key: "name",
        label: "Nama",
        placeholder: "zann",
        defaultValue: "zann"
      },
      {
        key: "text",
        label: "Teks",
        placeholder: "Halo semua",
        defaultValue: "Halo semua"
      },
      {
        key: "time",
        label: "Waktu",
        placeholder: "3 menit",
        defaultValue: "3 menit"
      }
    ]
  },
  {
    id: "ignote-json",
    name: "ignote-json",
    group: "IMAGE",
    method: "GET",
    title: "IG Note JSON",
    route: "/api/v1/ignote/json",
    description:
      "Mengambil respons JSON dari layanan IG Note.",
    params: [
      {
        key: "name",
        label: "Nama",
        placeholder: "zann",
        defaultValue: "zann"
      },
      {
        key: "text",
        label: "Teks",
        placeholder: "Halo semua",
        defaultValue: "Halo semua"
      }
    ]
  },
  {
    id: "ludo-action",
    name: "ludo-action",
    group: "GAME · LUDO",
    method: "POST",
    title: "Ludo Action",
    route: "/api/v1/ludo",
    description:
      "Menjalankan action Ludo. Aksi seperti roll dan move mengubah state game asli.",
    liveAction: true,
    params: [],
    body: `{
  "action": "status",
  "room": "id-grup@g.us",
  "sender": "nomor-pemain@lid",
  "name": "Nama Pemain"
}`
  },
  {
    id: "ludo-room",
    name: "ludo-room",
    group: "GAME · LUDO",
    method: "GET",
    title: "Ludo Room Status",
    route: "/api/v1/ludo",
    description:
      "Mengambil pemain, token, pion aktif, dadu, dan giliran Ludo.",
    params: [
      {
        key: "room",
        label: "Room",
        placeholder: "id-grup@g.us",
        defaultValue: ""
      }
    ]
  },
  {
    id: "ludo-board",
    name: "ludo-board",
    group: "GAME · LUDO",
    method: "GET",
    title: "Ludo Board Image",
    route: "/api/v1/ludo/board",
    description:
      "Menghasilkan gambar papan Ludo terbaru.",
    preview: "board",
    params: [
      {
        key: "room",
        label: "Room",
        placeholder: "id-grup@g.us",
        defaultValue: ""
      }
    ]
  },
  {
    id: "monopoly-action",
    name: "monopoly-action",
    group: "GAME · MONOPOLY",
    method: "POST",
    title: "Monopoly Action",
    route: "/api/v1/monopoly",
    description:
      "Menjalankan action Monopoly. Aksi seperti roll, buy, pay, dan upgrade mengubah state game asli.",
    liveAction: true,
    params: [],
    body: `{
  "action": "status",
  "room": "id-grup@g.us",
  "sender": "nomor-pemain@lid",
  "name": "Nama Pemain"
}`
  },
  {
    id: "monopoly-room",
    name: "monopoly-room",
    group: "GAME · MONOPOLY",
    method: "GET",
    title: "Monopoly Room Status",
    route: "/api/v1/monopoly",
    description:
      "Mengambil cash, posisi, properti, rumah, hotel, dan giliran Monopoly.",
    params: [
      {
        key: "room",
        label: "Room",
        placeholder: "id-grup@g.us",
        defaultValue: ""
      }
    ]
  },
  {
    id: "monopoly-board",
    name: "monopoly-board",
    group: "GAME · MONOPOLY",
    method: "GET",
    title: "Monopoly Board Image",
    route: "/api/v1/monopoly/board",
    description:
      "Menghasilkan gambar papan Monopoly Indonesia terbaru.",
    preview: "board",
    params: [
      {
        key: "room",
        label: "Room",
        placeholder: "id-grup@g.us",
        defaultValue: ""
      }
    ]
  },
  {
    id: "monopoly-card",
    name: "monopoly-card",
    group: "GAME · MONOPOLY",
    method: "GET",
    title: "Monopoly Card Image",
    route: "/api/v1/monopoly/card",
    description:
      "Menghasilkan kartu Kesempatan atau Dana Umum berbentuk portrait.",
    preview: "portrait",
    params: [
      {
        key: "id",
        label: "ID Kartu",
        placeholder: "chance_01",
        defaultValue: "chance_01"
      }
    ]
  }
]

function createForms() {
  return ENDPOINTS.reduce((result, endpoint) => {
    result[endpoint.id] = {
      params: endpoint.params.reduce((params, field) => {
        params[field.key] = field.defaultValue || ""
        return params
      }, {}),
      body: endpoint.body || ""
    }

    return result
  }, {})
}

function prettyJson(value) {
  if (typeof value === "string") return value
  return JSON.stringify(value, null, 2)
}

function statusClass(status) {
  if (status >= 200 && status < 300) {
    return "play-status play-status--success"
  }

  if (status >= 400 && status < 500) {
    return "play-status play-status--warning"
  }

  return "play-status play-status--error"
}

export default function PlaygroundPage() {
  const [origin, setOrigin] = useState("")
  const [selectedId, setSelectedId] = useState("api-health")
  const [forms, setForms] = useState(createForms)
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState("")

  const imageUrlRef = useRef("")

  useEffect(() => {
    setOrigin(window.location.origin)

    const query = new URLSearchParams(window.location.search)
    const endpointId = query.get("endpoint")

    if (ENDPOINTS.some((item) => item.id === endpointId)) {
      setSelectedId(endpointId)
    }

    return () => {
      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current)
      }
    }
  }, [])

  const endpoint =
    ENDPOINTS.find((item) => item.id === selectedId) || ENDPOINTS[0]

  const form = forms[endpoint.id] || {
    params: {},
    body: ""
  }

  function requestPath() {
    const query = new URLSearchParams()

    Object.entries(form.params || {}).forEach(([key, value]) => {
      const text = String(value || "").trim()

      if (text) {
        query.set(key, text)
      }
    })

    const queryText = query.toString()

    return queryText
      ? endpoint.route + "?" + queryText
      : endpoint.route
  }

  const path = requestPath()
  const fullUrl = origin ? origin + path : path

  function curlCommand() {
    if (endpoint.method === "POST") {
      const body = String(form.body || "{}")
        .replace(/'/g, "'\\''")

      return (
        `curl -X POST "${fullUrl}" ` +
        `-H "Content-Type: application/json" ` +
        `-H "Accept: application/json" ` +
        `-d '${body}'`
      )
    }

    return `curl -X GET "${fullUrl}" -H "Accept: application/json"`
  }

  function updateParam(key, value) {
    setForms((current) => ({
      ...current,
      [endpoint.id]: {
        ...current[endpoint.id],
        params: {
          ...current[endpoint.id].params,
          [key]: value
        }
      }
    }))
  }

  function updateBody(value) {
    setForms((current) => ({
      ...current,
      [endpoint.id]: {
        ...current[endpoint.id],
        body: value
      }
    }))
  }

  async function copyText(text, key) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)

      window.setTimeout(() => {
        setCopied("")
      }, 1500)
    } catch (error) {
      setCopied("")
    }
  }

  async function execute() {
    setLoading(true)

    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current)
      imageUrlRef.current = ""
    }

    try {
      const options = {
        method: endpoint.method,
        headers: {
          Accept:
            "application/json, image/png, image/jpeg, image/webp, text/plain"
        }
      }

      if (endpoint.method === "POST") {
        let body

        try {
          body = JSON.parse(form.body || "{}")
        } catch (error) {
          throw new Error("Request body harus berupa JSON yang valid.")
        }

        options.headers["Content-Type"] = "application/json"
        options.body = JSON.stringify(body)
      }

      const result = await fetch(path, options)

      const contentType = String(
        result.headers.get("content-type") || ""
      ).toLowerCase()

      if (contentType.startsWith("image/")) {
        const blob = await result.blob()
        const imageUrl = URL.createObjectURL(blob)

        imageUrlRef.current = imageUrl

        setResponse({
          type: "image",
          status: result.status,
          ok: result.ok,
          imageUrl
        })

        return
      }

      const raw = await result.text()
      let payload = raw

      try {
        payload = raw
          ? JSON.parse(raw)
          : { message: "Respons API kosong." }
      } catch (error) {
        payload = raw || { message: "Respons API kosong." }
      }

      setResponse({
        type: "json",
        status: result.status,
        ok: result.ok,
        payload
      })
    } catch (error) {
      setResponse({
        type: "json",
        status: 0,
        ok: false,
        payload: {
          message: String(
            error && error.message
              ? error.message
              : error
          )
        }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="paper-site playground-page">
      <Nav />

      <section className="playground-intro">
        <span className="section-label">ARUNIKA API PLAYGROUND</span>

        <h1>Playground.</h1>

        <p>
          Uji endpoint langsung dari browser. Endpoint game dapat mengubah
          room asli saat action seperti roll, buy, pay, atau upgrade dijalankan.
        </p>
      </section>

      <section className="playground-shell">
        <aside className="playground-sidebar">
          <span className="section-label">PILIH ENDPOINT</span>

          <div className="endpoint-picker">
            {ENDPOINTS.map((item) => (
              <button
                type="button"
                key={item.id}
                className={
                  "endpoint-picker__item" +
                  (item.id === endpoint.id
                    ? " endpoint-picker__item--active"
                    : "")
                }
                onClick={() => {
                  setSelectedId(item.id)
                  setResponse(null)
                }}
              >
                <span>{item.method}</span>

                <div>
                  <small>{item.group}</small>
                  <strong>{item.name}</strong>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="playground-main">
          <div className="playground-main__head">
            <div>
              <span className="section-label">{endpoint.group}</span>

              <div className="endpoint-title-row">
                <span
                  className={
                    endpoint.method === "POST"
                      ? "play-method play-method--post"
                      : "play-method"
                  }
                >
                  {endpoint.method}
                </span>

                <h2>{endpoint.name}</h2>
              </div>

              <p>{endpoint.description}</p>
            </div>

            <Link href="/docs" className="play-docs-link">
              Lihat Docs ↗
            </Link>
          </div>

          <div className="play-block">
            <div className="play-block__head">
              <span>ENDPOINT URL</span>

              <button
                type="button"
                onClick={() => copyText(fullUrl, "url")}
              >
                {copied === "url" ? "✓ Copied" : "▣ Copy URL"}
              </button>
            </div>

            <code className="play-url">{fullUrl}</code>
          </div>

          <div className="play-block">
            <div className="play-block__head">
              <span>CURL COMMAND</span>

              <button
                type="button"
                onClick={() => copyText(curlCommand(), "curl")}
              >
                {copied === "curl"
                  ? "✓ Copied"
                  : "▣ Copy Command"}
              </button>
            </div>

            <pre className="play-code">
              <code>{curlCommand()}</code>
            </pre>
          </div>

          <div className="play-try">
            <div className="play-try__head">
              <span>▶</span>
              <strong>TRY IT OUT</strong>
            </div>

            {endpoint.liveAction && (
              <div className="play-warning">
                <strong>LIVE GAME ACTION</strong>
                <span>
                  Action ini benar-benar dapat mengubah room game yang dipakai.
                </span>
              </div>
            )}

            {endpoint.params.length > 0 && (
              <div className="play-fields">
                {endpoint.params.map((field) => (
                  <label key={field.key}>
                    <span>{field.label}</span>

                    <input
                      type="text"
                      value={form.params[field.key] || ""}
                      placeholder={field.placeholder}
                      onChange={(event) =>
                        updateParam(field.key, event.target.value)
                      }
                    />
                  </label>
                ))}
              </div>
            )}

            {endpoint.method === "POST" && (
              <label className="play-body">
                <span>REQUEST BODY JSON</span>

                <textarea
                  value={form.body}
                  spellCheck="false"
                  onChange={(event) => updateBody(event.target.value)}
                />
              </label>
            )}

            {endpoint.params.length === 0 &&
              endpoint.method !== "POST" && (
                <div className="play-empty">
                  Endpoint ini tidak membutuhkan parameter. Langsung tekan
                  EXECUTE.
                </div>
              )}

            <button
              type="button"
              className="play-execute"
              onClick={execute}
              disabled={loading}
            >
              {loading ? "MEMPROSES..." : "▶ EXECUTE"}
            </button>
          </div>

          {response && (
            <div className="play-response">
              <div className="play-response__head">
                <div>
                  <span>API RESPONSE</span>

                  <b className={statusClass(response.status)}>
                    {response.status || "ERROR"}
                  </b>
                </div>

                {response.type === "json" && (
                  <button
                    type="button"
                    onClick={() =>
                      copyText(prettyJson(response.payload), "response")
                    }
                  >
                    {copied === "response"
                      ? "✓ Copied"
                      : "▣ Copy JSON"}
                  </button>
                )}
              </div>

              {response.type === "image" ? (
                <div
                  className={
                    "play-image" +
                    (endpoint.preview === "portrait"
                      ? " play-image--portrait"
                      : "") +
                    (endpoint.preview === "board"
                      ? " play-image--board"
                      : "")
                  }
                >
                  <img
                    src={response.imageUrl}
                    alt={"Hasil " + endpoint.title}
                  />

                  <a
                    href={response.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Buka gambar penuh ↗
                  </a>
                </div>
              ) : (
                <pre
                  className={
                    response.ok
                      ? "play-response__code"
                      : "play-response__code play-response__code--error"
                  }
                >
                  <code>{prettyJson(response.payload)}</code>
                </pre>
              )}
            </div>
          )}
        </section>
      </section>

      <footer className="paper-footer">
        <span>ARUNIKA APIs. by @znn_id</span>
        <span>Built for WhatsApp bot workflows.</span>
      </footer>

      <style>{`
        .playground-page,
        .playground-page *,
        .playground-page *::before,
        .playground-page *::after {
          box-sizing: border-box;
        }

        .playground-page {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          overflow-x: hidden;
        }

        .playground-intro,
        .playground-shell {
          width: min(1120px, calc(100% - 40px));
          max-width: 100%;
          min-width: 0;
          margin-left: auto;
          margin-right: auto;
        }

        .playground-intro {
          margin-top: 72px;
          margin-bottom: 38px;
        }

        .playground-intro h1 {
          margin: 10px 0 12px;
          color: var(--ink);
          font: 800 clamp(42px, 7vw, 82px)/0.9 var(--mono);
          letter-spacing: -0.09em;
        }

        .playground-intro p {
          max-width: 670px;
          margin: 0;
          color: var(--muted);
          font-size: 16px;
          line-height: 1.75;
        }

        .playground-shell {
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr);
          margin-bottom: 70px;
          overflow: hidden;
          border: 1px solid var(--line);
          background: var(--paper-soft);
        }

        .playground-sidebar {
          min-width: 0;
          padding: 24px 16px;
          border-right: 1px solid var(--line);
          background: rgba(255, 255, 255, 0.3);
        }

        .endpoint-picker {
          display: grid;
          gap: 7px;
          margin-top: 16px;
        }

        .endpoint-picker__item {
          width: 100%;
          min-width: 0;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          align-items: center;
          gap: 10px;
          padding: 11px;
          color: var(--ink);
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          text-align: left;
        }

        .endpoint-picker__item:hover {
          background: #ffffff;
          border-color: var(--line);
        }

        .endpoint-picker__item--active {
          background: #fff3e7;
          border-color: #efc99d;
        }

        .endpoint-picker__item > span {
          min-width: 42px;
          display: inline-grid;
          place-items: center;
          padding: 6px 4px;
          color: #ffffff;
          background: #3f7e61;
          font: 800 9px var(--mono);
          letter-spacing: 0.06em;
        }

        .endpoint-picker__item:has(div small:first-child) > span {
          background: inherit;
        }

        .endpoint-picker__item:nth-child(5) > span,
        .endpoint-picker__item:nth-child(8) > span {
          background: var(--orange);
        }

        .endpoint-picker__item div {
          min-width: 0;
          display: grid;
          gap: 3px;
        }

        .endpoint-picker__item small {
          overflow: hidden;
          color: var(--orange-dark);
          font: 800 9px var(--mono);
          letter-spacing: 0.07em;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .endpoint-picker__item strong {
          overflow: hidden;
          color: var(--ink);
          font: 800 12px var(--mono);
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .playground-main {
          min-width: 0;
          display: grid;
          gap: 24px;
          padding: 32px;
          overflow: hidden;
        }

        .playground-main__head {
          display: flex;
          align-items: start;
          justify-content: space-between;
          gap: 18px;
          min-width: 0;
        }

        .playground-main__head > div {
          min-width: 0;
        }

        .endpoint-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 10px;
        }

        .play-method {
          flex: 0 0 auto;
          padding: 7px 8px;
          color: #ffffff;
          background: #3f7e61;
          font: 800 10px var(--mono);
          letter-spacing: 0.07em;
        }

        .play-method--post {
          background: var(--orange);
        }

        .playground-main h2 {
          min-width: 0;
          margin: 0;
          overflow-wrap: anywhere;
          color: var(--ink);
          font: 800 clamp(26px, 4vw, 42px)/0.95 var(--mono);
          letter-spacing: -0.075em;
        }

        .playground-main__head p {
          max-width: 620px;
          margin: 14px 0 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.75;
        }

        .play-docs-link {
          flex: 0 0 auto;
          padding: 10px 12px;
          color: var(--orange-dark);
          border: 1px solid var(--line);
          background: #ffffff;
          font: 800 10px var(--mono);
          white-space: nowrap;
        }

        .play-block,
        .play-try,
        .play-response {
          min-width: 0;
          max-width: 100%;
        }

        .play-block__head,
        .play-response__head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 9px;
        }

        .play-block__head > span,
        .play-response__head span {
          color: var(--ink);
          font: 800 12px var(--mono);
          letter-spacing: 0.04em;
        }

        .play-block__head button,
        .play-response__head button {
          flex: 0 0 auto;
          padding: 0;
          color: #647086;
          background: transparent;
          border: 0;
          cursor: pointer;
          font: 800 10px var(--mono);
          white-space: nowrap;
        }

        .play-url {
          width: 100%;
          display: block;
          padding: 14px;
          overflow-wrap: anywhere;
          color: #47556c;
          background: #edf1f8;
          border: 1px solid #e2e8f0;
          font: 13px/1.65 var(--mono);
          word-break: break-word;
        }

        .play-code,
        .play-response__code {
          width: 100%;
          max-width: 100%;
          margin: 0;
          padding: 16px;
          overflow: hidden;
          color: #f7eee2;
          background: #28221f;
          border: 1px solid #15110f;
          font: 12px/1.65 var(--mono);
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .play-try {
          display: grid;
          gap: 17px;
          padding: 21px;
          border: 1px solid #e1e3e8;
          background: rgba(255, 255, 255, 0.56);
        }

        .play-try__head {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--ink);
          font: 800 13px var(--mono);
          letter-spacing: 0.04em;
        }

        .play-try__head span {
          color: var(--orange-dark);
        }

        .play-warning {
          display: grid;
          gap: 5px;
          padding: 12px 14px;
          color: #97442d;
          background: #fff0e8;
          border-left: 4px solid var(--orange);
        }

        .play-warning strong {
          font: 800 10px var(--mono);
          letter-spacing: 0.08em;
        }

        .play-warning span {
          font-size: 12px;
          line-height: 1.55;
        }

        .play-fields {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 13px;
        }

        .play-fields label,
        .play-body {
          min-width: 0;
          display: grid;
          gap: 7px;
        }

        .play-fields label > span,
        .play-body > span {
          color: var(--orange-dark);
          font: 800 10px var(--mono);
          letter-spacing: 0.08em;
        }

        .play-fields input,
        .play-body textarea {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          color: var(--ink);
          background: #ffffff;
          border: 1px solid var(--line);
          border-radius: 0;
          outline: none;
          font: 13px var(--mono);
        }

        .play-fields input {
          height: 43px;
          padding: 0 12px;
        }

        .play-body textarea {
          min-height: 190px;
          padding: 13px;
          resize: vertical;
          line-height: 1.6;
        }

        .play-fields input:focus,
        .play-body textarea:focus {
          border-color: var(--orange);
          box-shadow: 0 0 0 3px rgba(246, 119, 37, 0.11);
        }

        .play-empty {
          padding: 16px;
          color: #687288;
          background: #f6f8fb;
          border: 1px solid #e2e5ea;
          font: 13px/1.6 var(--mono);
        }

        .play-execute {
          min-height: 56px;
          width: 100%;
          color: #ffffff;
          background: var(--orange);
          border: 0;
          cursor: pointer;
          font: 800 14px var(--mono);
          letter-spacing: 0.05em;
        }

        .play-execute:disabled {
          cursor: wait;
          opacity: 0.65;
        }

        .play-response {
          display: grid;
          gap: 10px;
        }

        .play-response__head > div {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .play-status {
          padding: 5px 8px;
          font: 800 10px var(--mono);
        }

        .play-status--success {
          color: #237648;
          background: #e4f7e9;
        }

        .play-status--warning {
          color: #955b04;
          background: #fff0cd;
        }

        .play-status--error {
          color: #a43636;
          background: #ffe3e3;
        }

        .play-response__code--error {
          color: #ffd4d4;
          background: #382222;
          border-color: #572c2c;
        }

        .play-image {
          display: grid;
          gap: 12px;
          min-width: 0;
          max-width: 100%;
          padding: 14px;
          overflow: hidden;
          border: 1px solid var(--line);
          background: #ffffff;
        }

        .play-image img {
          width: min(100%, 520px);
          max-width: 100%;
          max-height: 410px;
          display: block;
          margin: 0 auto;
          object-fit: contain;
          border: 1px solid var(--line);
          background: #f5f5f5;
        }

        .play-image--portrait {
          justify-items: center;
        }

        .play-image--portrait img {
          width: min(100%, 250px);
          max-height: 360px;
        }

        .play-image--board img {
          width: min(100%, 580px);
          max-height: 420px;
        }

        .play-image a {
          width: fit-content;
          max-width: 100%;
          color: var(--orange-dark);
          font: 800 10px var(--mono);
          overflow-wrap: anywhere;
        }

        @media (max-width: 900px) {
          .playground-shell {
            grid-template-columns: 1fr;
          }

          .playground-sidebar {
            border-right: 0;
            border-bottom: 1px solid var(--line);
          }

          .endpoint-picker {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .playground-intro,
          .playground-shell {
            width: min(1120px, calc(100% - 28px));
          }

          .playground-intro {
            margin-top: 46px;
            margin-bottom: 30px;
          }

          .playground-main {
            padding: 22px 16px 26px;
          }

          .playground-main__head {
            align-items: start;
            flex-direction: column;
          }

          .play-docs-link {
            width: 100%;
            text-align: center;
          }

          .play-block__head,
          .play-response__head {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .play-fields {
            grid-template-columns: 1fr;
          }

          .play-fields input,
          .play-body textarea {
            font-size: 16px;
          }

          .play-url {
            font-size: 12px;
          }

          .play-code,
          .play-response__code {
            padding: 13px;
            font-size: 10px;
          }

          .play-image--portrait img {
            width: min(100%, 220px);
            max-height: 320px;
          }

          .play-image--board img {
            width: 100%;
            max-height: 320px;
          }
        }

        @media (max-width: 460px) {
          .playground-intro h1 {
            font-size: 56px;
          }

          .playground-sidebar {
            padding: 20px 13px;
          }

          .endpoint-picker {
            grid-template-columns: 1fr;
          }

          .play-try {
            padding: 16px;
          }

          .play-image--portrait img {
            width: min(100%, 190px);
            max-height: 280px;
          }
        }
      `}</style>
    </main>
  )
}
