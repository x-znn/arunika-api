"use client"

import Link from "next/link"
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
      "Mengecek apakah server Arunika API sedang aktif dan siap digunakan.",
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
      "Mengambil ringkasan statistik request API yang tercatat.",
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
      "Membuat gambar Instagram Note dalam format PNG. Hasilnya dapat langsung dikirim oleh bot WhatsApp.",
    image: true,
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
      "Mengambil respons JSON dari layanan Instagram Note.",
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
    id: "editimage",
    name: "editimage",
    group: "AI IMAGE",
    method: "POST",
    title: "AI Image Edit",
    route: "/api/v1/editimage",
    description:
      "Mengedit gambar dari URL publik berdasarkan prompt AI. Endpoint ini mengembalikan file gambar hasil edit secara langsung.",
    image: true,
    body: `{
  "imageUrl": "https://contoh.com/foto.jpg",
  "prompt": "Ubah gambar menjadi ilustrasi 3D cute, pertahankan pose dan objek utama.",
  "size": "1024x1024"
}`,
    params: []
  },
  {
    id: "ludo-action",
    name: "ludo-action",
    group: "GAME · LUDO",
    method: "POST",
    title: "Ludo Action",
    route: "/api/v1/ludo",
    description:
      "Menjalankan aksi Ludo seperti membuat room, join, memulai permainan, lempar dadu, pindah pion, keluar, dan reset.",
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
      "Mengambil data room Ludo, pemain, warna tim, posisi pion, pion aktif, dadu terakhir, dan giliran.",
    params: [
      {
        key: "room",
        label: "Room",
        placeholder: "id-grup@g.us",
        defaultValue: "id-grup@g.us"
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
      "Menghasilkan gambar papan Ludo terbaru sesuai room yang sedang dimainkan.",
    image: true,
    preview: "board",
    params: [
      {
        key: "room",
        label: "Room",
        placeholder: "id-grup@g.us",
        defaultValue: "id-grup@g.us"
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
      "Menjalankan aksi Monopoly Indonesia seperti membuat room, roll dadu, membeli properti, membayar sewa, upgrade bangunan, dan reset.",
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
      "Mengambil data cash pemain, posisi, properti, rumah, hotel, kartu, dan giliran Monopoly.",
    params: [
      {
        key: "room",
        label: "Room",
        placeholder: "id-grup@g.us",
        defaultValue: "id-grup@g.us"
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
      "Menghasilkan gambar papan Monopoly Indonesia lengkap dengan pion, rumah, dan hotel.",
    image: true,
    preview: "board",
    params: [
      {
        key: "room",
        label: "Room",
        placeholder: "id-grup@g.us",
        defaultValue: "id-grup@g.us"
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
      "Menghasilkan gambar kartu portrait Kesempatan atau Dana Umum.",
    image: true,
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

function createInitialForms() {
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

function getRequestPath(endpoint, form) {
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

function getPrettyJson(value) {
  if (typeof value === "string") {
    return value
  }

  return JSON.stringify(value, null, 2)
}

function getMethodClass(method) {
  return method === "POST"
    ? "endpoint-method endpoint-method--post"
    : "endpoint-method endpoint-method--get"
}

function getStatusClass(status) {
  if (status >= 200 && status < 300) {
    return "response-status response-status--success"
  }

  if (status >= 400 && status < 500) {
    return "response-status response-status--warning"
  }

  return "response-status response-status--error"
}

export default function EndpointExplorer() {
  const [origin, setOrigin] = useState("")
  const [activeId, setActiveId] = useState("")
  const [forms, setForms] = useState(createInitialForms)
  const [responses, setResponses] = useState({})
  const [loading, setLoading] = useState({})
  const [copied, setCopied] = useState("")

  const responseRef = useRef({})

  useEffect(() => {
    setOrigin(window.location.origin)

    return () => {
      Object.values(responseRef.current).forEach((response) => {
        if (response && response.objectUrl) {
          URL.revokeObjectURL(response.objectUrl)
        }
      })
    }
  }, [])

  useEffect(() => {
    responseRef.current = responses
  }, [responses])

  function getUrl(endpoint) {
    const form = forms[endpoint.id] || {
      params: {},
      body: ""
    }

    const path = getRequestPath(endpoint, form)

    return origin
      ? origin + path
      : path
  }

  function getCurl(endpoint) {
    const form = forms[endpoint.id] || {
      params: {},
      body: ""
    }

    const url = getUrl(endpoint)

    if (endpoint.method === "POST") {
      const body = String(form.body || "{}")
        .replace(/'/g, "'\\''")

      return (
        `curl -X POST "${url}" ` +
        `-H "Content-Type: application/json" ` +
        `-H "Accept: application/json" ` +
        `-d '${body}'`
      )
    }

    return `curl -X GET "${url}" -H "Accept: application/json"`
  }

  function toggleEndpoint(id) {
    setActiveId((current) => {
      return current === id ? "" : id
    })
  }

  function updateParam(endpointId, key, value) {
    setForms((current) => ({
      ...current,
      [endpointId]: {
        ...current[endpointId],
        params: {
          ...current[endpointId].params,
          [key]: value
        }
      }
    }))
  }

  function updateBody(endpointId, value) {
    setForms((current) => ({
      ...current,
      [endpointId]: {
        ...current[endpointId],
        body: value
      }
    }))
  }

  async function copyText(value, key) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(key)

      window.setTimeout(() => {
        setCopied("")
      }, 1600)
    } catch (error) {
      setCopied("")
    }
  }

  async function execute(endpoint) {
    const form = forms[endpoint.id] || {
      params: {},
      body: ""
    }

    const path = getRequestPath(endpoint, form)

    setLoading((current) => ({
      ...current,
      [endpoint.id]: true
    }))

    const oldResponse = responses[endpoint.id]

    if (oldResponse && oldResponse.objectUrl) {
      URL.revokeObjectURL(oldResponse.objectUrl)
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
        let parsedBody

        try {
          parsedBody = JSON.parse(form.body || "{}")
        } catch (error) {
          throw new Error("Request body harus berupa JSON yang valid.")
        }

        options.headers["Content-Type"] = "application/json"
        options.body = JSON.stringify(parsedBody)
      }

      const response = await fetch(path, options)

      const contentType = String(
        response.headers.get("content-type") || ""
      ).toLowerCase()

      if (contentType.startsWith("image/")) {
        const blob = await response.blob()
        const objectUrl = URL.createObjectURL(blob)

        setResponses((current) => ({
          ...current,
          [endpoint.id]: {
            type: "image",
            status: response.status,
            ok: response.ok,
            objectUrl
          }
        }))

        return
      }

      const rawText = await response.text()
      let payload = rawText

      try {
        payload = rawText
          ? JSON.parse(rawText)
          : { message: "Respons API kosong." }
      } catch (error) {
        payload = rawText || { message: "Respons API kosong." }
      }

      setResponses((current) => ({
        ...current,
        [endpoint.id]: {
          type: "data",
          status: response.status,
          ok: response.ok,
          payload
        }
      }))
    } catch (error) {
      setResponses((current) => ({
        ...current,
        [endpoint.id]: {
          type: "error",
          status: 0,
          ok: false,
          payload: {
            message: String(
              error && error.message
                ? error.message
                : error
            )
          }
        }
      }))
    } finally {
      setLoading((current) => ({
        ...current,
        [endpoint.id]: false
      }))
    }
  }

  return (
    <section className="endpoint-explorer" id="endpoint">
      <div className="endpoint-explorer__head">
        <div>
          <span className="section-label">ENDPOINT EXPLORER</span>
          <h2>Coba endpoint langsung.</h2>
          <p>
            Ketuk endpoint, isi parameter atau request body, lalu jalankan
            request langsung dari halaman ini.
          </p>
        </div>

        <Link href="/docs" className="endpoint-explorer__docs">
          Buka docs lengkap ↗
        </Link>
      </div>

      <div className="endpoint-list">
        {ENDPOINTS.map((endpoint) => {
          const form = forms[endpoint.id] || {
            params: {},
            body: ""
          }

          const response = responses[endpoint.id]
          const isOpen = activeId === endpoint.id
          const isLoading = Boolean(loading[endpoint.id])
          const url = getUrl(endpoint)
          const curl = getCurl(endpoint)

          return (
            <article
              className={
                "endpoint-card" +
                (isOpen ? " endpoint-card--open" : "")
              }
              key={endpoint.id}
            >
              <button
                type="button"
                className="endpoint-card__summary"
                onClick={() => toggleEndpoint(endpoint.id)}
                aria-expanded={isOpen}
              >
                <span className={getMethodClass(endpoint.method)}>
                  {endpoint.method}
                </span>

                <span className="endpoint-card__main">
                  <small>{endpoint.group}</small>
                  <code>{endpoint.name}</code>
                  <strong>{endpoint.title}</strong>
                </span>

                <span className="endpoint-card__status">ONLINE</span>

                <span className="endpoint-card__toggle">
                  {isOpen ? "×" : "+"}
                </span>
              </button>

              {isOpen && (
                <div className="endpoint-card__detail">
                  <div className="endpoint-url-block">
                    <div className="endpoint-block-head">
                      <span>ENDPOINT URL</span>

                      <button
                        type="button"
                        onClick={() =>
                          copyText(url, endpoint.id + "-url")
                        }
                      >
                        {copied === endpoint.id + "-url"
                          ? "✓ Copied"
                          : "▣ Copy URL"}
                      </button>
                    </div>

                    <code className="endpoint-url-value">{url}</code>
                  </div>

                  <p className="endpoint-description">
                    {endpoint.description}
                  </p>

                  <div className="endpoint-curl-block">
                    <div className="endpoint-block-head">
                      <span>CURL COMMAND</span>

                      <button
                        type="button"
                        onClick={() =>
                          copyText(curl, endpoint.id + "-curl")
                        }
                      >
                        {copied === endpoint.id + "-curl"
                          ? "✓ Copied"
                          : "▣ Copy Command"}
                      </button>
                    </div>

                    <pre>
                      <code>{curl}</code>
                    </pre>
                  </div>

                  <div className="try-panel">
                    <div className="try-panel__heading">
                      <span>▶</span>
                      <strong>TRY IT OUT</strong>
                    </div>

                    {endpoint.liveAction && (
                      <div className="live-warning">
                        <strong>LIVE GAME ACTION</strong>
                        <span>
                          Aksi ini dapat mengubah state room game yang dipakai.
                        </span>
                      </div>
                    )}

                    {endpoint.params.length > 0 && (
                      <div className="try-fields">
                        {endpoint.params.map((field) => (
                          <label key={field.key}>
                            <span>{field.label}</span>

                            <input
                              type="text"
                              value={form.params[field.key] || ""}
                              placeholder={field.placeholder}
                              onChange={(event) =>
                                updateParam(
                                  endpoint.id,
                                  field.key,
                                  event.target.value
                                )
                              }
                            />
                          </label>
                        ))}
                      </div>
                    )}

                    {endpoint.method === "POST" && (
                      <label className="body-input">
                        <span>REQUEST BODY JSON</span>

                        <textarea
                          value={form.body}
                          spellCheck="false"
                          onChange={(event) =>
                            updateBody(endpoint.id, event.target.value)
                          }
                        />
                      </label>
                    )}

                    {endpoint.params.length === 0 &&
                      endpoint.method !== "POST" && (
                        <div className="try-empty">
                          Endpoint ini tidak membutuhkan parameter.
                          Langsung tekan EXECUTE.
                        </div>
                      )}

                    <button
                      type="button"
                      className="execute-button"
                      onClick={() => execute(endpoint)}
                      disabled={isLoading}
                    >
                      {isLoading ? "MEMPROSES..." : "▶ EXECUTE"}
                    </button>
                  </div>

                  {response && (
                    <div className="response-panel">
                      <div className="response-panel__head">
                        <div>
                          <span>API RESPONSE</span>

                          <b
                            className={getStatusClass(response.status)}
                          >
                            {response.status || "ERROR"}
                          </b>
                        </div>

                        {response.type !== "image" && (
                          <button
                            type="button"
                            onClick={() =>
                              copyText(
                                getPrettyJson(response.payload),
                                endpoint.id + "-response"
                              )
                            }
                          >
                            {copied === endpoint.id + "-response"
                              ? "✓ Copied"
                              : "▣ Copy JSON"}
                          </button>
                        )}
                      </div>

                      {response.type === "image" ? (
                        <div
                          className={
                            "image-response" +
                            (endpoint.preview === "portrait"
                              ? " image-response--portrait"
                              : "") +
                            (endpoint.preview === "board"
                              ? " image-response--board"
                              : "")
                          }
                        >
                          <img
                            src={response.objectUrl}
                            alt={"Hasil " + endpoint.title}
                          />

                          <a
                            href={response.objectUrl}
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
                              ? "response-code"
                              : "response-code response-code--error"
                          }
                        >
                          <code>{getPrettyJson(response.payload)}</code>
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}
            </article>
          )
        })}
      </div>

      <style>{`
        .endpoint-explorer,
        .endpoint-explorer *,
        .endpoint-explorer *::before,
        .endpoint-explorer *::after {
          box-sizing: border-box;
        }

        .endpoint-explorer {
          width: min(1120px, calc(100% - 40px));
          max-width: 100%;
          min-width: 0;
          margin: 72px auto;
          overflow: hidden;
          border: 1px solid var(--line);
          background: var(--paper-soft);
        }

        .endpoint-explorer__head {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 28px;
          min-width: 0;
          padding: 34px;
          border-bottom: 1px solid var(--line);
        }

        .endpoint-explorer__head > div {
          min-width: 0;
        }

        .endpoint-explorer__head h2 {
          margin: 10px 0 8px;
          color: var(--ink);
          font: 800 clamp(28px, 4vw, 46px)/0.95 var(--mono);
          letter-spacing: -0.075em;
        }

        .endpoint-explorer__head p {
          max-width: 590px;
          margin: 0;
          color: var(--muted);
          font-size: 15px;
          line-height: 1.75;
        }

        .endpoint-explorer__docs {
          flex: 0 0 auto;
          padding: 12px 15px;
          color: #ffffff;
          background: var(--orange);
          font: 800 11px var(--mono);
          letter-spacing: 0.03em;
          white-space: nowrap;
          transition: 180ms ease;
        }

        .endpoint-explorer__docs:hover {
          background: var(--orange-dark);
        }

        .endpoint-list {
          display: grid;
          min-width: 0;
          max-width: 100%;
        }

        .endpoint-card {
          min-width: 0;
          max-width: 100%;
          border-bottom: 1px solid var(--line);
          background: rgba(255, 255, 255, 0.18);
        }

        .endpoint-card:last-child {
          border-bottom: 0;
        }

        .endpoint-card__summary {
          width: 100%;
          min-width: 0;
          min-height: 86px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto auto;
          align-items: center;
          gap: 18px;
          padding: 16px 24px;
          color: inherit;
          background: transparent;
          border: 0;
          cursor: pointer;
          overflow: hidden;
          text-align: left;
          transition: background 180ms ease;
        }

        .endpoint-card__summary:hover {
          background: #ffffff;
        }

        .endpoint-card--open .endpoint-card__summary {
          background: #fff7ee;
          border-bottom: 1px solid var(--line);
        }

        .endpoint-method {
          min-width: 52px;
          display: inline-grid;
          place-items: center;
          padding: 8px 7px;
          color: #ffffff;
          font: 800 10px var(--mono);
          letter-spacing: 0.07em;
        }

        .endpoint-method--get {
          background: #3f7e61;
        }

        .endpoint-method--post {
          background: var(--orange);
        }

        .endpoint-card__main {
          min-width: 0;
          display: grid;
          gap: 4px;
        }

        .endpoint-card__main small {
          overflow: hidden;
          color: var(--orange-dark);
          font: 800 10px var(--mono);
          letter-spacing: 0.08em;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .endpoint-card__main code {
          overflow: hidden;
          color: var(--ink);
          font: 800 15px var(--mono);
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .endpoint-card__main strong {
          overflow: hidden;
          color: var(--muted);
          font-size: 12px;
          font-weight: 600;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .endpoint-card__status {
          color: #28724b;
          font: 800 10px var(--mono);
          letter-spacing: 0.07em;
        }

        .endpoint-card__toggle {
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          color: var(--orange-dark);
          border: 1px solid var(--line);
          font: 700 22px/1 var(--mono);
        }

        .endpoint-card__detail {
          display: grid;
          gap: 24px;
          min-width: 0;
          max-width: 100%;
          padding: 30px 34px 34px 94px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.58);
        }

        .endpoint-url-block,
        .endpoint-curl-block,
        .try-panel,
        .response-panel {
          min-width: 0;
          max-width: 100%;
        }

        .endpoint-block-head,
        .response-panel__head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          min-width: 0;
          margin-bottom: 10px;
        }

        .endpoint-block-head > span,
        .response-panel__head span {
          min-width: 0;
          color: var(--ink);
          font: 800 13px var(--mono);
          letter-spacing: 0.03em;
        }

        .endpoint-block-head button,
        .response-panel__head button {
          flex: 0 0 auto;
          padding: 0;
          color: #657085;
          background: transparent;
          border: 0;
          cursor: pointer;
          font: 800 11px var(--mono);
          white-space: nowrap;
        }

        .endpoint-block-head button:hover,
        .response-panel__head button:hover {
          color: var(--orange-dark);
        }

        .endpoint-url-value {
          width: 100%;
          max-width: 100%;
          min-height: 58px;
          display: block;
          padding: 14px;
          overflow: hidden;
          color: #48556a;
          background: #edf1f8;
          border: 1px solid #e5e9f0;
          font: 13px/1.65 var(--mono);
          white-space: normal;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .endpoint-description {
          max-width: 800px;
          margin: -2px 0 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.75;
        }

        .endpoint-curl-block pre,
        .response-code {
          width: 100%;
          max-width: 800px;
          min-width: 0;
          margin: 0;
          padding: 17px;
          overflow: hidden;
          color: #f7eee2;
          background: #28221f;
          border: 1px solid #15110f;
          font: 12px/1.65 var(--mono);
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .try-panel {
          display: grid;
          gap: 18px;
          padding: 22px;
          border: 1px solid #e2e3e7;
          background: rgba(255, 255, 255, 0.54);
        }

        .try-panel__heading {
          display: flex;
          align-items: center;
          gap: 11px;
          color: var(--ink);
          font: 800 14px var(--mono);
          letter-spacing: 0.03em;
        }

        .try-panel__heading span {
          color: var(--orange-dark);
          font-size: 15px;
        }

        .live-warning {
          display: grid;
          gap: 5px;
          padding: 12px 14px;
          color: #92412d;
          background: #fff0e9;
          border-left: 4px solid var(--orange);
        }

        .live-warning strong {
          font: 800 10px var(--mono);
          letter-spacing: 0.08em;
        }

        .live-warning span {
          font-size: 12px;
          line-height: 1.55;
        }

        .try-fields {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          min-width: 0;
        }

        .try-fields label,
        .body-input {
          display: grid;
          min-width: 0;
          gap: 7px;
        }

        .try-fields label span,
        .body-input > span {
          color: var(--orange-dark);
          font: 800 10px var(--mono);
          letter-spacing: 0.08em;
        }

        .try-fields input,
        .body-input textarea {
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

        .try-fields input {
          height: 43px;
          padding: 0 12px;
        }

        .body-input textarea {
          min-height: 180px;
          padding: 13px;
          resize: vertical;
          line-height: 1.6;
        }

        .try-fields input:focus,
        .body-input textarea:focus {
          border-color: var(--orange);
          box-shadow: 0 0 0 3px rgba(246, 119, 37, 0.12);
        }

        .try-empty {
          padding: 18px;
          color: #687288;
          background: #f7f8fb;
          border: 1px solid #e2e5ea;
          font: 13px/1.65 var(--mono);
        }

        .execute-button {
          min-height: 58px;
          width: 100%;
          max-width: 100%;
          color: #ffffff;
          background: var(--orange);
          border: 0;
          cursor: pointer;
          font: 800 15px var(--mono);
          letter-spacing: 0.04em;
          transition: 180ms ease;
        }

        .execute-button:hover:not(:disabled) {
          background: var(--orange-dark);
        }

        .execute-button:disabled {
          cursor: wait;
          opacity: 0.64;
        }

        .response-panel {
          display: grid;
          gap: 10px;
        }

        .response-panel__head > div {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .response-status {
          padding: 5px 8px;
          font: 800 10px var(--mono);
          letter-spacing: 0.04em;
        }

        .response-status--success {
          color: #1f7d45;
          background: #e4f7e9;
        }

        .response-status--warning {
          color: #9a5b00;
          background: #fff1c9;
        }

        .response-status--error {
          color: #a63636;
          background: #ffe4e4;
        }

        .response-code--error {
          color: #ffd0d0;
          background: #382222;
          border-color: #572c2c;
        }

        .image-response {
          display: grid;
          gap: 12px;
          min-width: 0;
          max-width: 100%;
          padding: 14px;
          overflow: hidden;
          border: 1px solid var(--line);
          background: #ffffff;
        }

        .image-response img {
          width: min(100%, 520px);
          max-width: 100%;
          max-height: 400px;
          display: block;
          margin: 0 auto;
          object-fit: contain;
          border: 1px solid var(--line);
          background: #f5f5f5;
        }

        .image-response--portrait {
          justify-items: center;
        }

        .image-response--portrait img {
          width: min(100%, 250px);
          max-height: 360px;
        }

        .image-response--board img {
          width: min(100%, 580px);
          max-height: 420px;
        }

        .image-response a {
          width: fit-content;
          max-width: 100%;
          color: var(--orange-dark);
          font: 800 11px var(--mono);
          overflow-wrap: anywhere;
        }

        @media (max-width: 760px) {
          .endpoint-explorer {
            width: min(1120px, calc(100% - 28px));
            margin: 48px auto;
          }

          .endpoint-explorer__head {
            align-items: start;
            flex-direction: column;
            padding: 26px;
          }

          .endpoint-card__summary {
            grid-template-columns: auto minmax(0, 1fr) auto;
            gap: 12px;
            padding: 15px 16px;
          }

          .endpoint-card__status {
            display: none;
          }

          .endpoint-card__main code {
            font-size: 13px;
          }

          .endpoint-card__detail {
            padding: 22px 16px 26px;
          }

          .endpoint-block-head,
          .response-panel__head {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .try-fields {
            grid-template-columns: 1fr;
          }

          .try-fields input,
          .body-input textarea {
            font-size: 16px;
          }

          .endpoint-url-value {
            font-size: 12px;
            line-height: 1.7;
          }

          .endpoint-curl-block pre,
          .response-code {
            width: 100%;
            max-width: 100%;
            padding: 13px;
            font-size: 10px;
          }

          .image-response--portrait img {
            width: min(100%, 220px);
            max-height: 320px;
          }

          .image-response--board img {
            width: 100%;
            max-width: 100%;
            max-height: 320px;
          }
        }

        @media (max-width: 460px) {
          .endpoint-explorer__head {
            padding: 22px;
          }

          .endpoint-explorer__head h2 {
            font-size: 35px;
          }

          .endpoint-explorer__docs {
            width: 100%;
            text-align: center;
          }

          .endpoint-card__main strong {
            display: none;
          }

          .endpoint-method {
            min-width: 46px;
            font-size: 9px;
          }

          .try-panel {
            padding: 16px;
          }

          .image-response--portrait img {
            width: min(100%, 190px);
            max-height: 280px;
          }
        }
      `}</style>
    </section>
  )
}
