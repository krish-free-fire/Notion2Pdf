import { useState, useRef } from 'react'

/* ═══════════════════════════════════════════════════════════════
   NOTION2PDF — MVP Frontend
   Design: "The Academic Architect" (Stitch MCP)
   Stack:  React + Tailwind v4 + Custom Design Tokens
   ═══════════════════════════════════════════════════════════════ */

// ── SVG Icons ────────────────────────────────────────────────────
const NotionIcon = () => (
  <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
    <path d="M6.017 4.313l55.333-4.087c6.797-.583 8.543-.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277-1.553 6.807-6.99 7.193L24.467 99.967c-4.08.193-6.023-.39-8.16-3.113L3.3 79.94c-2.333-3.113-3.3-5.443-3.3-8.167V11.113c0-3.497 1.553-6.413 6.017-6.8z" fill="#fff"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M61.35.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723.967 5.053 3.3 8.167l12.993 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257-3.89c5.433-.387 6.99-2.917 6.99-7.193V20.64c0-2.21-.81-2.803-3.16-4.53l-.723-.523-17.663-12.443c-4.277-3.107-6.02-3.5-12.817-2.917zM25.92 19.523c-5.247.353-6.437.433-9.417-1.99L8.927 11.507c-.77-.78-.383-1.753 1.557-1.947l53.193-3.887c4.467-.39 6.793 1.167 8.543 2.527l9.123 6.61c.39.197 1.36 1.36.193 1.36l-54.93 3.307-.687.047zM19.803 88.3V30.367c0-2.53.777-3.697 3.103-3.893L86 22.78c2.14-.193 3.107 1.167 3.107 3.693v57.547c0 2.53-.39 4.67-3.883 4.863l-60.377 3.5c-3.493.193-5.043-.97-5.043-4.083zm59.6-54.827c.387 1.75 0 3.5-1.75 3.7l-2.91.577v42.773c-2.527 1.36-4.853 2.137-6.797 2.137-3.107 0-3.883-.977-6.21-3.887l-19.03-29.94v28.967l6.02 1.363s0 3.5-4.857 3.5l-13.39.78c-.39-.78 0-2.723 1.357-3.11l3.497-.95v-38.3L30.48 40.667c-.39-1.75.58-4.277 3.3-4.473l14.357-.967 19.8 30.327v-26.83l-5.047-.58c-.39-2.143 1.163-3.7 3.103-3.89l13.41-.78z" fill="#000"/>
  </svg>
)

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.333 8h9.334M8 3.333 12.667 8 8 12.667"/>
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <path d="m9 11 3 3L22 4"/>
  </svg>
)

const FileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
)

const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

// ── App States ───────────────────────────────────────────────────
const STATE = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
}

export default function App() {
  const [url, setUrl] = useState('')
  const [appState, setAppState] = useState(STATE.IDLE)
  const [errorMsg, setErrorMsg] = useState('')
  const [fileName, setFileName] = useState('')
  const inputRef = useRef(null)

  const isValidNotionUrl = (str) => {
    try {
      const parsed = new URL(str)
      return (
        parsed.hostname === 'notion.so' ||
        parsed.hostname.endsWith('.notion.so') ||
        parsed.hostname === 'www.notion.so' ||
        parsed.hostname === 'notion.site' ||
        parsed.hostname.endsWith('.notion.site')
      )
    } catch {
      return false
    }
  }

  const handleGenerate = async () => {
    // Client-side validation
    if (!url.trim()) {
      setErrorMsg('Please paste a Notion link')
      setAppState(STATE.ERROR)
      inputRef.current?.focus()
      return
    }
    if (!isValidNotionUrl(url.trim())) {
      setErrorMsg('Invalid Notion link — make sure it starts with https://notion.so or a *.notion.site URL')
      setAppState(STATE.ERROR)
      return
    }

    setAppState(STATE.LOADING)
    setErrorMsg('')

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://notion2pdf-backend.onrender.com'
      const response = await fetch(`${apiUrl}/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to generate PDF')
      }

      // Extract filename from Content-Disposition header
      const disposition = response.headers.get('Content-Disposition')
      let name = 'notion-export.pdf'
      if (disposition) {
        const match = disposition.match(/filename="?([^";\n]+)"?/)
        if (match) name = match[1]
      }
      setFileName(name)

      // Download the blob
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = name
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(downloadUrl)

      setAppState(STATE.SUCCESS)
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.')
      setAppState(STATE.ERROR)
    }
  }

  const handleReset = () => {
    setUrl('')
    setAppState(STATE.IDLE)
    setErrorMsg('')
    setFileName('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && appState !== STATE.LOADING) {
      handleGenerate()
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* ── Glass Navigation ──────────────────────────────── */}
      <nav className="glass-nav fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-inverse-surface flex items-center justify-center">
              <span className="text-white text-sm font-bold">N</span>
            </div>
            <span className="font-semibold text-inverse-surface tracking-tight">
              Notion2PDF
            </span>
          </div>
          <a
            href="https://www.notion.so/help/public-pages-and-web-publishing"
            target="_blank"
            rel="noopener noreferrer"
            className="label-md text-on-surface-variant hover:text-primary transition-colors duration-200"
          >
            How to make a page public?
          </a>
        </div>
      </nav>

      {/* ── Hero Section ──────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-28 pb-20">
        <div className="max-w-2xl w-full text-center">

          {/* Eyebrow label */}
          <p
            className="label-md mb-5 opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.05s', animationFillMode: 'forwards' }}
          >
            Free · No Login · Instant
          </p>

          {/* Headline */}
          <h1
            className="display-lg mb-5 opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}
          >
            Convert Notion Pages
            <br />
            into{' '}
            <span className="bg-gradient-to-r from-primary to-primary-dim bg-clip-text text-transparent">
              Polished PDFs
            </span>
          </h1>

          {/* Subheading */}
          <p
            className="body-lg text-on-surface-variant max-w-lg mx-auto mb-10 opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}
          >
            Paste a public Notion link, click Generate, and download a clean,
            professionally formatted PDF in seconds.
          </p>

          {/* ── Converter Card ────────────────────────────── */}
          <div
            className="card mx-auto max-w-xl opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.35s', animationFillMode: 'forwards' }}
          >
            {appState === STATE.SUCCESS ? (
              /* ── Success State ─────────────────────────── */
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-12 h-12 rounded-full bg-[#e8f5e9] flex items-center justify-center text-[#2e7d32]">
                  <CheckCircleIcon />
                </div>
                <div>
                  <p className="headline-md text-lg mb-1">PDF Downloaded!</p>
                  <p className="text-on-surface-variant text-sm">{fileName}</p>
                </div>
                <button
                  onClick={handleReset}
                  className="btn-primary mt-2 flex items-center gap-2"
                >
                  Convert Another
                  <ArrowIcon />
                </button>
              </div>
            ) : (
              /* ── Input / Loading State ─────────────────── */
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center">
                    <NotionIcon />
                  </div>
                  <input
                    ref={inputRef}
                    id="notion-url-input"
                    type="url"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value)
                      if (appState === STATE.ERROR) {
                        setAppState(STATE.IDLE)
                        setErrorMsg('')
                      }
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Paste your public Notion link here…"
                    className="input-field"
                    disabled={appState === STATE.LOADING}
                    autoFocus
                  />
                </div>

                {/* Error message */}
                {appState === STATE.ERROR && errorMsg && (
                  <p className="text-error text-sm mb-3 text-left pl-12">
                    {errorMsg}
                  </p>
                )}

                <button
                  id="generate-btn"
                  onClick={handleGenerate}
                  disabled={appState === STATE.LOADING}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {appState === STATE.LOADING ? (
                    <>
                      <span className="spinner !w-4 !h-4 !border-2 !border-on-primary/30 !border-t-on-primary"></span>
                      <span>Generating PDF…</span>
                    </>
                  ) : (
                    <>
                      <span>Generate PDF</span>
                      <ArrowIcon />
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── "How It Works" Steps ────────────────────────── */}
        <section className="max-w-3xl w-full mt-24 px-4">
          <p
            className="label-md text-center mb-8 opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.45s', animationFillMode: 'forwards' }}
          >
            How It Works
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Paste Link',
                desc: 'Copy the URL from your Notion "Share" menu. No API keys or setup needed.',
              },
              {
                step: '02',
                title: 'We Format',
                desc: 'Our engine parses headings, lists, and images into a clean A4 layout.',
              },
              {
                step: '03',
                title: 'Download PDF',
                desc: 'Get a professionally typeset PDF ready for printing or sharing.',
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className="bg-surface-container-low rounded-xl p-6 opacity-0 animate-fade-in-up"
                style={{
                  animationDelay: `${0.5 + i * 0.1}s`,
                  animationFillMode: 'forwards',
                }}
              >
                <span className="label-md text-primary font-semibold">{item.step}</span>
                <h3 className="headline-md text-lg mt-2 mb-2">{item.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features Strip ──────────────────────────────── */}
        <section className="max-w-3xl w-full mt-20 px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              {
                icon: <ShieldIcon />,
                title: 'No Account Required',
                desc: 'Convert instantly — no sign-up or login needed.',
              },
              {
                icon: <FileIcon />,
                title: 'A4 Optimized',
                desc: 'Standard margins and clean page breaks, print-ready.',
              },
              {
                icon: <DownloadIcon />,
                title: 'Instant Download',
                desc: 'Generated PDFs download automatically in seconds.',
              },
            ].map((feat, i) => (
              <div
                key={feat.title}
                className="flex flex-col items-center gap-3 py-6 opacity-0 animate-fade-in-up"
                style={{
                  animationDelay: `${0.7 + i * 0.1}s`,
                  animationFillMode: 'forwards',
                }}
              >
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
                  {feat.icon}
                </div>
                <h4 className="font-semibold text-inverse-surface">{feat.title}</h4>
                <p className="text-on-surface-variant text-sm max-w-[220px]">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="bg-surface-container-low py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-on-surface-variant text-sm">
            © {new Date().getFullYear()} Notion2PDF. Built for students, by students.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="label-md text-on-surface-variant hover:text-primary transition-colors duration-200">Privacy</a>
            <a href="#" className="label-md text-on-surface-variant hover:text-primary transition-colors duration-200">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
