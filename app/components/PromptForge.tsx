'use client'
import { useState, useEffect, useRef } from 'react'

const CYAN = '#00D9FF'
const BG = '#0D0F14'
const SURFACE = '#13161D'
const SURFACE2 = '#1A1E28'
const BORDER = '#252A36'
const TEXT = '#E8EAF0'
const MUTED = '#6B7280'
const GREEN = '#00E5A0'
const AMBER = '#FFB800'
const RED = '#FF4757'
const MONO = "'JetBrains Mono', monospace"
const SANS = "'Inter', system-ui, sans-serif"

const CATEGORIES = [
  { id: 'feature', label: '🔧 Feature nouă' },
  { id: 'bug',     label: '🐛 Fix bug' },
  { id: 'refactor',label: '♻️ Refactor' },
  { id: 'api',     label: '🌐 API / Backend' },
  { id: 'ui',      label: '🎨 UI Component' },
  { id: 'test',    label: '✅ Teste' },
  { id: 'docs',    label: '📝 Documentație' },
  { id: 'security',label: '🔒 Security' },
]

const STACKS = [
  'React','Next.js','Vue','Angular','Node.js','Python',
  'FastAPI','TypeScript','JavaScript','Go','PostgreSQL',
  'MongoDB','Redis','Prisma','Supabase',
]

const AI_TOOLS = [
  'Claude Code','Cursor','GitHub Copilot','Windsurf','ChatGPT',
]

export default function PromptForge() {
  const [step, setStep]   = useState<'home'|'builder'|'result'>('home')
  const [form, setForm]   = useState({
    category:'', stack:[] as string[], aiTool:'',
    description:'', context:'', constraints:'',
  })
  const [prompt, setPrompt]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [copied, setCopied]   = useState(false)
  const [progress, setProgress] = useState(0)
  const promptRef = useRef<HTMLDivElement>(null)

  const score = (() => {
    let s = 0
    if (form.category)           s += 20
    if (form.stack.length > 0)   s += 20
    if (form.description.length > 30) s += 25
    if (form.context.length > 10)     s += 20
    if (form.constraints.length > 5)  s += 15
    return s
  })()

  useEffect(() => {
    if (!loading) { setProgress(0); return }
    const t = setInterval(() =>
      setProgress(p => p >= 95 ? 95 : p + Math.random() * 8), 180)
    return () => clearInterval(t)
  }, [loading])

  const generate = async () => {
    if (!form.category || !form.description) {
      setError('Selectează categoria și descrie ce vrei să construiești.'); return
    }
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.prompt) throw new Error('empty')
      setPrompt(data.prompt)
      setProgress(100)
      setTimeout(() => { setLoading(false); setStep('result') }, 300)
    } catch {
      setLoading(false)
      setError('Eroare la generare. Încearcă din nou.')
    }
  }

  const copy = async () => {
    try { await navigator.clipboard.writeText(prompt) } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 2500)
  }

  const scoreColor = score >= 80 ? GREEN : score >= 50 ? AMBER : RED
  const scoreLabel = score >= 80 ? 'Prompt solid' : score >= 50 ? 'Poate fi mai bun' : 'Prea vag'

  const s: Record<string, React.CSSProperties> = {
    page:   { fontFamily: SANS, background: BG, minHeight: '100vh', color: TEXT },
    header: { padding: '14px 20px', borderBottom: `1px solid ${BORDER}`, background: SURFACE,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    logo:   { fontFamily: MONO, fontWeight: 600, fontSize: 15, color: CYAN },
    btn:    { fontFamily: MONO, fontWeight: 600, fontSize: 14, padding: '13px 28px',
              background: CYAN, color: BG, border: 'none', cursor: 'pointer' },
    chip:   (active: boolean) => ({
      display: 'inline-flex', padding: '5px 11px', margin: '0 6px 6px 0',
      border: `1px solid ${active ? CYAN : BORDER}`,
      background: active ? '#00D9FF18' : SURFACE,
      color: active ? CYAN : MUTED,
      fontFamily: MONO, fontSize: 12, cursor: 'pointer',
    } as React.CSSProperties),
    textarea: { width: '100%', background: SURFACE, border: `1px solid ${BORDER}`,
                color: TEXT, padding: '12px 14px', fontSize: 14,
                fontFamily: SANS, resize: 'vertical' as const, lineHeight: '1.6',
                outline: 'none' },
  }

  /* ── HOME ── */
  if (step === 'home') return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes glow{0%,100%{box-shadow:0 0 20px #00D9FF33}50%{box-shadow:0 0 45px #00D9FF77}}
        .glow{animation:glow 3s ease-in-out infinite;}
        .hov:hover{border-color:#00D9FF !important;transform:translateY(-2px);transition:all .2s;}
      `}</style>
      <div style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, background: CYAN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚡</div>
          <span style={s.logo}>PromptForge</span>
        </div>
        <span style={{ fontFamily: MONO, fontSize: 11, color: MUTED }}>v1.0</span>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '60px 24px 0' }}>
        <h1 style={{ fontFamily: MONO, fontSize: 'clamp(26px,5vw,46px)', fontWeight: 600, lineHeight: 1.2, marginBottom: 20 }}>
          Prompturile tale sunt<br/><span style={{ color: CYAN }}>motivul</span> pentru care<br/>AI-ul dă cod prost.
        </h1>
        <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.7, maxWidth: 520, marginBottom: 32 }}>
          <strong style={{ color: TEXT }}>66% din developeri</strong> sunt frustrați de output-ul AI "aproape corect, dar nu chiar". Problema nu e AI-ul — e promptul. PromptForge îl repară.
        </p>
        <button className="glow" onClick={() => setStep('builder')} style={s.btn}>
          ⚡ FORJEAZĂ PRIMUL PROMPT →
        </button>
        <p style={{ fontFamily: MONO, fontSize: 11, color: '#3D4351', marginTop: 8 }}>gratuit · fără cont · instant</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10, marginTop: 52 }}>
          {[
            { v: '66%', l: 'devs frustrați de cod "aproape corect"' },
            { v: '41%', l: 'mai multe bug-uri fără prompt structurat' },
            { v: '84%', l: 'developeri folosesc AI coding tools' },
            { v: '29%', l: 'trust real în output-ul AI (↓ de la 40%)' },
          ].map(s2 => (
            <div key={s2.v} className="hov" style={{ background: SURFACE, border: `1px solid ${BORDER}`, padding: '18px 14px', transition: 'all .2s' }}>
              <div style={{ fontFamily: MONO, fontSize: 30, fontWeight: 700, color: CYAN }}>{s2.v}</div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 6, lineHeight: 1.5 }}>{s2.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  /* ── BUILDER ── */
  if (step === 'builder') return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        textarea:focus{border-color:#00D9FF !important;}
        @keyframes fg{0%,100%{box-shadow:0 0 20px #00D9FF44}50%{box-shadow:0 0 50px #00D9FF88}}
        .fa{animation:fg .8s ease-in-out infinite;}
        .sl{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;color:#6B7280;margin-bottom:8px;}
      `}</style>

      <div style={{ ...s.header, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => setStep('home')} style={{ fontFamily: MONO, fontSize: 12, color: MUTED, background: 'none', border: 'none', cursor: 'pointer' }}>← ÎNAPOI</button>
        <span style={s.logo}>⚡ PromptForge</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 56, height: 3, background: BORDER, overflow: 'hidden' }}>
            <div style={{ width: `${score}%`, height: '100%', background: scoreColor, transition: 'all .3s' }}/>
          </div>
          <span style={{ fontFamily: MONO, fontSize: 10, color: scoreColor }}>{score}% · {scoreLabel}</span>
        </div>
      </div>

      <div style={{ maxWidth: 660, margin: '0 auto', padding: '32px 20px 80px' }}>
        <h2 style={{ fontFamily: MONO, fontSize: 18, marginBottom: 4 }}>Construiește promptul tău</h2>
        <p style={{ fontSize: 13, color: MUTED, marginBottom: 28 }}>Cu cât dai mai mult context, cu atât codul iese mai bun.</p>

        <div className="sl">01 / CE VREI SĂ FACI? <span style={{ color: RED }}>*</span></div>
        <div style={{ marginBottom: 24 }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setForm(f => ({ ...f, category: c.id }))}
              style={s.chip(form.category === c.id)}>{c.label}</button>
          ))}
        </div>

        <div className="sl">02 / TECH STACK</div>
        <div style={{ marginBottom: 24 }}>
          {STACKS.map(t => (
            <button key={t} onClick={() => setForm(f => ({
              ...f, stack: f.stack.includes(t) ? f.stack.filter(x => x !== t) : [...f.stack, t]
            }))} style={s.chip(form.stack.includes(t))}>{t}</button>
          ))}
        </div>

        <div className="sl">03 / PENTRU CE AI TOOL?</div>
        <div style={{ marginBottom: 24 }}>
          {AI_TOOLS.map(t => (
            <button key={t} onClick={() => setForm(f => ({ ...f, aiTool: f.aiTool === t ? '' : t }))}
              style={s.chip(form.aiTool === t)}>{t}</button>
          ))}
        </div>

        <div className="sl">04 / DESCRIE CE VREI <span style={{ color: RED }}>*</span></div>
        <textarea value={form.description} rows={4} style={{ ...s.textarea, marginBottom: 4 }}
          placeholder="Ex: Vreau un hook React care să facă fetch la o listă de useri, cu loading, error și retry logic."
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}/>
        <p style={{ fontFamily: MONO, fontSize: 10, color: form.description.length > 30 ? GREEN : '#3D4351', textAlign: 'right', marginBottom: 20 }}>
          {form.description.length} chars {form.description.length > 30 ? '✓' : '· min 30'}
        </p>

        <div className="sl">05 / CONTEXT PROIECT</div>
        <textarea value={form.context} rows={3} style={{ ...s.textarea, marginBottom: 20 }}
          placeholder="Ex: Am deja useApi() hook și React Query instalat. Urmăm folder structure feature-based."
          onChange={e => setForm(f => ({ ...f, context: e.target.value }))}/>

        <div className="sl">06 / CONSTRAINTS (ce să NU facă)</div>
        <textarea value={form.constraints} rows={3} style={{ ...s.textarea, marginBottom: 24 }}
          placeholder="Ex: Fără axios, doar fetch nativ. Zero any în TypeScript. Fără class components."
          onChange={e => setForm(f => ({ ...f, constraints: e.target.value }))}/>

        {error && (
          <div style={{ background: '#FF475711', border: `1px solid ${RED}44`, padding: '12px 14px', marginBottom: 16, fontFamily: MONO, fontSize: 12, color: RED }}>
            ⚠ {error}
          </div>
        )}

        <button className={loading ? 'fa' : ''} onClick={generate} disabled={loading}
          style={{ width: '100%', padding: '15px', background: loading ? SURFACE2 : CYAN,
            color: loading ? CYAN : BG, border: loading ? `1px solid ${CYAN}` : 'none',
            fontFamily: MONO, fontWeight: 600, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? `⚡ FORJARE... ${Math.round(progress)}%` : '⚡ FORJEAZĂ PROMPTUL →'}
        </button>
      </div>
    </div>
  )

  /* ── RESULT ── */
  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
      `}</style>
      <div style={s.header}>
        <button onClick={() => setStep('builder')} style={{ fontFamily: MONO, fontSize: 12, color: MUTED, background: 'none', border: 'none', cursor: 'pointer' }}>← MODIFICĂ</button>
        <span style={s.logo}>⚡ PromptForge</span>
        <span style={{ fontFamily: MONO, fontSize: 11, color: GREEN, border: `1px solid ${GREEN}44`, padding: '3px 10px', background: '#00E5A011' }}>✓ GATA</span>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '36px 20px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 38, height: 38, background: '#00E5A011', border: `1px solid ${GREEN}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✓</div>
          <div>
            <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 15 }}>Promptul tău a fost forjat</div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>Structurat · Complet · Gata de folosit</div>
          </div>
        </div>

        <div style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <div style={{ padding: '9px 14px', borderBottom: `1px solid ${BORDER}`, background: SURFACE2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: MONO, fontSize: 10, color: MUTED }}>prompt.txt · {form.aiTool || 'AI coding tool'}</span>
            <div style={{ display: 'flex', gap: 5 }}>
              {['#FF5F57','#FFBD2E','#28CA41'].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }}/>)}
            </div>
          </div>
          <div ref={promptRef} style={{ padding: '18px', fontFamily: MONO, fontSize: 12, lineHeight: 1.8, color: TEXT, whiteSpace: 'pre-wrap', maxHeight: '52vh', overflowY: 'auto' }}>
            {prompt}
          </div>
        </div>

        <button onClick={copy} style={{ width: '100%', marginTop: 12, padding: '13px',
          background: copied ? GREEN : SURFACE2, color: copied ? BG : TEXT,
          border: `1px solid ${copied ? GREEN : BORDER}`, fontFamily: MONO, fontWeight: 600,
          fontSize: 13, cursor: 'pointer', transition: 'all .2s' }}>
          {copied ? '✓ COPIAT ÎN CLIPBOARD' : '⎘  COPIAZĂ PROMPTUL'}
        </button>

        <div style={{ marginTop: 20, background: '#FFB80010', border: `1px solid ${AMBER}22`, padding: '14px 18px' }}>
          <p style={{ fontFamily: MONO, fontSize: 9, color: AMBER, letterSpacing: '1px', marginBottom: 8 }}>// CUM SĂ FOLOSEȘTI</p>
          {['1. Copiază promptul de mai sus', `2. Deschide ${form.aiTool || 'Cursor / Claude Code'}`, '3. Paste → trimite', '4. Cod production-ready din prima iterație'].map((t, i) => (
            <p key={i} style={{ fontFamily: MONO, fontSize: 11, color: MUTED, lineHeight: 1.9 }}>{t}</p>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={() => setStep('builder')} style={{ flex: 1, padding: '11px', background: 'none', border: `1px solid ${BORDER}`, color: MUTED, fontFamily: MONO, fontSize: 12, cursor: 'pointer' }}>
            ← FORJEAZĂ ALTUL
          </button>
          <button onClick={() => setStep('home')} style={{ flex: 1, padding: '11px', background: 'none', border: `1px solid ${BORDER}`, color: MUTED, fontFamily: MONO, fontSize: 12, cursor: 'pointer' }}>
            🏠 HOMEPAGE
          </button>
        </div>

        <div style={{ marginTop: 36, padding: '20px', background: SURFACE, border: `1px solid ${CYAN}22`, textAlign: 'center' }}>
          <p style={{ fontFamily: MONO, fontSize: 10, color: CYAN, marginBottom: 6 }}>// VREI MAI MULT?</p>
          <p style={{ fontSize: 13, color: TEXT, marginBottom: 4 }}>50+ Prompt Templates · Batch Generate · Export Pack</p>
          <p style={{ fontSize: 12, color: MUTED }}>PromptForge Pro → gumroad.com/promptforge · $29 one-time</p>
        </div>
      </div>
    </div>
  )
}
