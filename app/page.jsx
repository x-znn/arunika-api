import Link from "next/link"
import Nav from "./components/Nav"
import EndpointExplorer from "./components/EndpointExplorer"

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.5 0 .16 5.34.16 11.91c0 2.1.55 4.16 1.58 5.98L0 24l6.29-1.65a11.85 11.85 0 0 0 5.78 1.47h.01c6.57 0 11.91-5.34 11.91-11.91 0-3.18-1.24-6.16-3.47-8.43ZM12.08 21.8h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.73.98 1-3.64-.24-.37a9.84 9.84 0 0 1-1.52-5.27c0-5.43 4.42-9.85 9.86-9.85 2.63 0 5.1 1.02 6.96 2.89a9.79 9.79 0 0 1 2.88 6.96c0 5.43-4.42 9.85-9.85 9.85Zm5.4-7.37c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15s-.77.97-.95 1.16c-.17.2-.35.22-.65.08-.3-.15-1.26-.46-2.4-1.47-.88-.79-1.47-1.77-1.64-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.08-.8.37-.27.3-1.04 1.01-1.04 2.46s1.06 2.85 1.2 3.05c.15.2 2.09 3.19 5.06 4.47.71.3 1.27.49 1.71.62.72.23 1.37.2 1.88.12.57-.09 1.77-.72 2.02-1.42.25-.69.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95Zm8.95 1.35a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 6.86A5.14 5.14 0 1 1 6.86 12 5.14 5.14 0 0 1 12 6.86Zm0 1.8A3.34 3.34 0 1 0 15.34 12 3.34 3.34 0 0 0 12 8.66Z" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 .5A12 12 0 0 0 8.2 23.9c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.42-4.04-1.42-.55-1.38-1.34-1.75-1.34-1.75-1.1-.75.08-.74.08-.74 1.21.09 1.85 1.24 1.85 1.24 1.08 1.84 2.83 1.31 3.52 1 .11-.79.42-1.31.77-1.61-2.67-.3-5.48-1.34-5.48-5.94 0-1.31.47-2.39 1.24-3.24-.12-.31-.54-1.55.12-3.22 0 0 1.01-.32 3.3 1.24A11.44 11.44 0 0 1 12 6.6c1.01 0 2.03.14 2.99.41 2.28-1.56 3.29-1.24 3.29-1.24.66 1.67.25 2.91.12 3.22.77.85 1.24 1.93 1.24 3.24 0 4.61-2.81 5.63-5.49 5.93.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  )
}

export default function HomePage() {
  return (
    <main className="paper-site">
      <Nav />

      <section className="intro-wrap">
        <div className="intro-copy">
          <span className="section-label">ARUNIKA API PLATFORM</span>

          <h1>
            Simple API untuk
            <br />
            bot WhatsApp.
          </h1>

          <p>
            Generate gambar, uji endpoint, dan pakai URL hasilnya langsung di
            script bot. Dibuat ringkas untuk kebutuhan command yang cepat dan
            simpel.
          </p>

          <div className="intro-actions">
            <Link href="/docs" className="action-button action-button--solid">
              ▣ Docs
            </Link>

            <Link href="/playground" className="action-button">
              ◉ Playground
            </Link>

            <Link href="/dashboard" className="action-button">
              ↗ Stats
            </Link>
          </div>
        </div>

        <div className="intro-art">
          <img
            src="/arunika-hero.svg"
            alt="Ilustrasi abstrak Arunika API"
          />
        </div>
      </section>

      <section className="request-strip">
        <strong>LIVE</strong>

        <div>
          <span>API status</span>
          <b>Online & ready</b>
        </div>

        <div>
          <span>Image endpoint</span>
          <b>PNG output</b>
        </div>

        <Link href="/api/health">Check status ↗</Link>
      </section>

      <EndpointExplorer />

      <section className="support-panel">
        <div className="support-panel__top">
          <div>
            <span className="section-label">SUPPORT & CONTACT</span>

            <h2>
              Butuh bantuan?
              <br />
              Hubungi langsung.
            </h2>
          </div>

          <p>
            Ada bug, request fitur baru, atau mau menanyakan penggunaan API?
            Pilih salah satu platform di bawah ini.
          </p>
        </div>

        <div className="support-grid">
          <a
            href="https://wa.me/6285348284121"
            target="_blank"
            rel="noreferrer"
            className="support-card support-card--primary"
            aria-label="Hubungi melalui WhatsApp"
          >
            <span className="support-card__icon">
              <WhatsAppIcon />
            </span>

            <span className="support-card__body">
              <small>FAST RESPONSE</small>
              <strong>WhatsApp</strong>
            </span>

            <span className="support-card__arrow">
              <ArrowIcon />
            </span>
          </a>

          <a
            href="https://instagram.com/znn_id"
            target="_blank"
            rel="noreferrer"
            className="support-card"
            aria-label="Buka Instagram znn_id"
          >
            <span className="support-card__icon">
              <InstagramIcon />
            </span>

            <span className="support-card__body">
              <small>SOCIAL</small>
              <strong>Instagram</strong>
            </span>

            <span className="support-card__arrow">
              <ArrowIcon />
            </span>
          </a>

          <a
            href="https://github.com/x-znn"
            target="_blank"
            rel="noreferrer"
            className="support-card"
            aria-label="Buka GitHub x-znn"
          >
            <span className="support-card__icon">
              <GitHubIcon />
            </span>

            <span className="support-card__body">
              <small>SOURCE CODE</small>
              <strong>GitHub</strong>
            </span>

            <span className="support-card__arrow">
              <ArrowIcon />
            </span>
          </a>
        </div>

        <div className="support-panel__foot">
          <span>ARUNIKA API SUPPORT</span>
          <span>AVAILABLE FOR BOT PROJECTS</span>
        </div>
      </section>

      <footer className="paper-footer">
        <span>ARUNIKA APIs. by @znn_id</span>
        <span>Built for WhatsApp bot workflows.</span>
      </footer>

      <style>{`
        .support-panel {
          width: min(1120px, calc(100% - 40px));
          margin: 72px auto;
          border: 1px solid var(--line);
          background: var(--paper-soft);
        }

        .support-panel__top {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 54px;
          padding: 38px;
          border-bottom: 1px solid var(--line);
        }

        .support-panel__top h2 {
          margin: 10px 0 0;
          font: 800 clamp(30px, 4.5vw, 52px)/0.95 var(--mono);
          letter-spacing: -0.075em;
          color: var(--ink);
        }

        .support-panel__top p {
          max-width: 440px;
          margin: 0;
          align-self: end;
          color: var(--muted);
          font-size: 17px;
          line-height: 1.75;
        }

        .support-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .support-card {
          min-height: 244px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: start;
          gap: 16px;
          padding: 26px 22px;
          color: var(--ink);
          background: rgba(255, 255, 255, 0.32);
          border-right: 1px solid var(--line);
          transition: 180ms ease;
        }

        .support-card:last-child {
          border-right: 0;
        }

        .support-card:hover {
          background: #ffffff;
        }

        .support-card--primary {
          color: #ffffff;
          background: var(--orange);
        }

        .support-card--primary:hover {
          background: var(--orange-dark);
        }

        .support-card__icon {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          background: var(--orange);
          color: #ffffff;
        }

        .support-card--primary .support-card__icon {
          color: var(--orange-dark);
          background: #ffffff;
        }

        .support-card__icon svg {
          width: 22px;
          height: 22px;
          fill: currentColor;
        }

        .support-card__body {
          display: grid;
          gap: 6px;
          padding-top: 2px;
        }

        .support-card__body small {
          color: var(--muted);
          font: 800 10px var(--mono);
          letter-spacing: 0.1em;
        }

        .support-card--primary .support-card__body small {
          color: rgba(255, 255, 255, 0.76);
        }

        .support-card__body strong {
          font: 800 24px/1 var(--mono);
          letter-spacing: -0.06em;
        }

        .support-card__body em {
          color: var(--muted);
          font-size: 14px;
          font-style: normal;
        }

        .support-card--primary .support-card__body em {
          color: rgba(255, 255, 255, 0.88);
        }

        .support-card__arrow {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          color: var(--orange-dark);
          transition: transform 180ms ease;
        }

        .support-card--primary .support-card__arrow {
          color: #ffffff;
        }

        .support-card:hover .support-card__arrow {
          transform: translateX(4px);
        }

        .support-card__arrow svg {
          width: 22px;
          height: 22px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .support-panel__foot {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          padding: 17px 38px;
          color: var(--muted);
          border-top: 1px solid var(--line);
          font: 700 11px var(--mono);
          letter-spacing: 0.06em;
        }

        @media (max-width: 780px) {
          .support-panel {
            width: min(1120px, calc(100% - 40px));
          }

          .support-panel__top {
            grid-template-columns: 1fr;
            gap: 22px;
            padding: 26px;
          }

          .support-grid {
            grid-template-columns: 1fr;
          }

          .support-card {
            min-height: 136px;
            align-items: center;
            border-right: 0;
            border-bottom: 1px solid var(--line);
          }

          .support-card:last-child {
            border-bottom: 0;
          }

          .support-panel__foot {
            padding: 16px 26px;
            flex-direction: column;
          }
        }

        @media (max-width: 470px) {
          .support-panel {
            width: min(100% - 28px, 1120px);
          }

          .support-panel__top {
            padding: 22px;
          }

          .support-panel__top h2 {
            font-size: 38px;
          }

          .support-panel__top p {
            font-size: 15px;
          }

          .support-card {
            padding: 20px;
          }

          .support-card__body strong {
            font-size: 21px;
          }

          .support-panel__foot {
            padding: 15px 20px;
            font-size: 10px;
          }
        }
      `}</style>
    </main>
  )
}
