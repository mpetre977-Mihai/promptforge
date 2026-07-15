'use client'
import { useState, useEffect } from 'react'

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
  { id: 'feature',  label: '🔧 Feature nouă' },
  { id: 'bug',      label: '🐛 Fix bug' },
  { id: 'refactor', label: '♻️ Refactor' },
  { id: 'api',      label: '🌐 API / Backend' },
  { id: 'ui',       label: '🎨 UI Component' },
  { id: 'test',     label: '✅ Teste' },
  { id: 'docs',     label: '📝 Documentație' },
  { id: 'security', label: '🔒 Security' },
]

const STACKS = [
  'React','Next.js','Vue','Angular','Node.js','Python',
  'FastAPI','TypeScript','JavaScript','Go','PostgreSQL',
  'MongoDB','Redis','Prisma','Supabase',
]

const AI_TOOLS = [
  'Claude Code','Cursor','GitHub Copilot','Windsurf','ChatGPT',
]

function buildPrompt(form: {
  category: string
  stack: string[]
  aiTool: string
  description: string
  context: string
  constraints: string
}): string {
  const catMap: Record<string, string> = {
    feature:  'implementare feature nouă',
    bug:      'debugging și fix',
    refactor: 'refactorizare cod existent',
    api:      'implementare API / Backend',
    ui:       'creare UI Component',
    test:     'scriere teste',
    docs:     'documentație',
    security: 'audit și fix securitate',
  }

  const stackStr = form.stack.length > 0 ? form.stack.join(', ') : 'nespecificat'
  const tool = form.aiTool || 'AI coding tool'
  const taskType = catMap[form.category] || form.category

  let prompt = `## CONTEXT\n`
  prompt += `Task type: ${taskType}\n`
  prompt += `Tech stack: ${stackStr}\n`
  if (form.context) {
    prompt += `Context proiect: ${form.context}\n`
  }
  prompt += `\n## TASK\n`
  prompt += `${form.description}\n`
  prompt += `\nAsigură-te că implementarea:\n`
  prompt += `- Este compatibilă cu stack-ul existent (${stackStr})\n`
  prompt += `- Urmează best practices pentru ${stackStr.split(',')[0]}\n`
  prompt += `- Include error handling complet\n`
  prompt += `- Are tipuri TypeScript corecte (dacă TypeScript e în stack)\n`
  prompt += `- Este production-ready, nu doar un proof of concept\n`

  if (form.constraints) {
    prompt += `\n## CONSTRAINTS\n`
    form.constraints.split('\n').forEach(c => {
      if (c.trim()) prompt += `- ${c.trim()}\n`
    })
  } else {
    prompt += `\n## CONSTRAINTS\n`
    prompt += `- Fără dependențe inutile\n`
    prompt += `- Cod curat, lizibil, cu comentarii unde e necesar\n`
    prompt += `- Fără any în TypeScript\n`
  }

  prompt += `\n## OUTPUT FORMAT\n`
  prompt += `Furnizează codul complet, gata de folosit, cu:\n`
  prompt += `1. Toate importurile necesare\n`
  prompt += `2. Tipuri TypeScript explicite\n`
  prompt += `3. Comentarii pentru logica complexă\n`
  prompt += `4. Exemple de utilizare la final\n`

  if (form.category === 'bug') {
    prompt += `\nIdentifică mai întâi cauza root a bug-ului, explică de ce apare, apoi furnizează fix-ul.\n`
  }
  if (form.category === 'test') {
    prompt += `\nInclude: unit tests, edge cases, mock-uri pentru dependențe externe.\n`
  }
  if (form.category === 'security') {
    prompt += `\nVerifică: OWASP Top 10, input validation, SQL injection, XSS, autentificare/autorizare.\n`
  }

  prompt += `\n---\nOptimizat pentru ${tool} · Generat de PromptForge`
  return prompt
}

export default function PromptForge() {
  const [step, setStep]   = useState<'home'|'builder'|'result'>('home')
  const [form, setForm]   = useState({
    category: '', stack: [] as string[], aiTool: '',
    description: '', context: '', constraints: '',
  })
  const [prompt, setPrompt]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [copied, setCopied]   = useState(false)
  const [progress, setProgress] = useState(0)

  const score = (() => {
    let s = 0
    if (form.category)                s += 20
    if (form.stack.length > 0)        s += 20
    if (form.description.length > 30) s += 25
    if (form.context.length > 10)     s += 20
    if (form.constraints.length > 5)  s += 15
    return s
  })()

  useEffect(() => {
    if (!loading) { setProgress(0); return }
    const t = setInterval(() =>
      setProgress(p => p >= 95 ? 95 : p + Math.random() * 10), 120)
    return () => clearInterval(t)
  }, [loading])

  const generate = () => {
    if (!form.category || !form.description) {
      setError('Selectează categoria și descrie ce vrei să construiești.')
      return
    }
    setError('')
    setLoading(true)
    setTimeout(() => {
      const result = buildPrompt(form)
      setPrompt(result)
      setProgress(100)
      setTimeout(() => { setLoading(false); setStep('result') }, 300)
    }, 1800)
  }

  const copy = async () => {
    try { await navigator.clipboard.writeText(prompt) } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const scoreColor = score >= 80 ? GREEN : score >= 50 ? AMBER : RED
  const scoreLabel = score >= 80 ? 'Prompt solid' : score >= 50 ? 'Poate fi mai bun' : 'Prea vag'

  const chip = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex', padding: '5px 11px', margin: '0 6px 6px 0',
    border: `1px solid ${active ? CYAN : BORDER}`,
    background: active ? '#00D9FF18' : SURFACE,
    color: active ? CYAN : MUTED,
    fontFamily: MONO, fontSize: 12, cursor: 'pointer',
  })

  const textarea: React.CSSProperties = {
    width: '100%', background: SURFACE, border: `1px solid ${BORDER}`,
    color: TEXT, padding: '12px 14px', fontSize: 14,
    fontFamily: SANS, resize: 'vertical', lineHeight: '1.6', outline: 'none',
  }

  /* ── HOME ── */
  if (step === 'home') return (
    <div style={{ fontFamily: SANS, background: BG, minHeight: '100vh', color: TEXT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes glow{0%,100%{box-shadow:0 0 20px #00D9FF33}50%{box-shadow:0 0 45px #00D9FF77}}
        .glow{animation:glow 3s ease-in-out infinite;}
        .hov:hover{border-color:#00D9FF !important;transform:translateY(-2px);transition:all .2s;}
      `}</style>

      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${BORDER}`, background: SURFACE, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, background: CYAN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚡</div>
          <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: 15, color: CYAN }}>PromptForge</span>
        </div>
        <span style={{ fontFamily: MONO, fontSize: 11, color: MUTED }}>v1.0 · free</span>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '60px 24px 0' }}>
        <h1 style={{ fontFamily: MONO, fontSize: 'clamp(26px,5vw,46px)', fontWeight: 600, lineHeight: 1.2, marginBottom: 20 }}>
          Prompturile tale sunt<br /><span style={{ color: CYAN }}>motivul</span> pentru care<br />AI-ul dă cod prost.
        </h1>
        <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.7, maxWidth: 520, marginBottom: 32 }}>
          <strong style={{ color: TEXT }}>66% din developeri</strong> sunt frustrați de output-ul AI "aproape corect, dar nu chiar". Problema nu e AI-ul — e promptul. PromptForge îl repară.
        </p>
        <button className="glow" onClick={() => setStep('builder')}
          style={{ fontFamily: MONO, fontWeight: 600, fontSize: 14, padding: '13px 28px', background: CYAN, color: BG, border: 'none', cursor: 'pointer' }}>
          ⚡ FORJEAZĂ PRIMUL PROMPT →
        </button>
        <p style={{ fontFamily: MONO, fontSize: 11, color: '#3D4351', marginTop: 8 }}>gratuit · fără cont · instant</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10, marginTop: 52 }}>
          {[
            { v: '66%', l: 'devs frustrați de cod "aproape corect"' },
            { v: '41%', l: 'mai multe bug-uri fără prompt structurat' },
            { v: '84%', l: 'developeri folosesc AI coding tools' },
            { v: '29%', l: 'trust real în output-ul AI (↓ de la 40%)' },
          ].map(s => (
            <div key={s.v} className="hov" style={{ background: SURFACE, border: `1px solid ${BORDER}`, padding: '18px 14px', transition: 'all .2s' }}>
              <div style={{ fontFamily: MONO, fontSize: 30, fontWeight: 700, color: CYAN }}>{s.v}</div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 6, lineHeight: 1.5 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 1, background: BORDER, marginTop: 48 }}>
          {[
            { n: '01', t: 'Descrie task-ul', d: 'Alegi categoria și explici ce vrei să construiești.' },
            { n: '02', t: 'Adaugi context', d: 'Stack, ce există deja, ce să NU facă AI-ul.' },
            { n: '03', t: 'Forjezi promptul', d: 'PromptForge structurează totul profesional.' },
            { n: '04', t: 'Copy → Paste → Ship', d: 'Lipești în Cursor sau Claude Code și obții cod mai bun.' },
          ].map(s => (
            <div key={s.n} style={{ background: SURFACE, padding: '22px 18px' }}>
              <div style={{ fontFamily: MONO, fontSize: 11, color: CYAN, marginBottom: 6 }}>{s.n}</div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{s.t}</div>
              <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>{s.d}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48, marginBottom: 80, background: SURFACE, border: `1px solid ${BORDER}`, padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Gata să forjezi?</div>
            <div style={{ fontSize: 13, color: MUTED }}>Primul prompt e gratuit. Rezultatele nu mint.</div>
          </div>
          <button onClick={() => setStep('builder')}
            style={{ fontFamily: MONO, fontWeight: 600, fontSize: 13, padding: '12px 24px', background: CYAN, color: BG, border: 'none', cursor: 'pointer' }}>
            START →
          </button>
        </div>
      </div>
    </div>
  )

  /* ── BUILDER ── */
  if (step === 'builder') return (
    <div style={{ fontFamily: SANS, background: BG, minHeight: '100vh', color: TEXT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        textarea:focus{border-color:#00D9FF !important;}
        @keyframes fg{0%,100%{box-shadow:0 0 20px #00D9FF44}50%{box-shadow:0 0 50px #00D9FF88}}
        .fa{animation:fg .8s ease-in-out infinite;}
        .sl{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;color:#6B7280;margin-bottom:8px;}
      `}</style>

      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${BORDER}`, background: SURFACE, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => setStep('home')} style={{ fontFamily: MONO, fontSize: 12, color: MUTED, background: 'none', border: 'none', cursor: 'pointer' }}>← ÎNAPOI</button>
        <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: 14, color: CYAN }}>⚡ PromptForge</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 56, height: 3, background: BORDER, overflow: 'hidden' }}>
            <div style={{ width: `${score}%`, height: '100%', background: scoreColor, transition: 'all .3s' }} />
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
            <button key={c.id} onClick={() => setForm(f => ({ ...f, category: c.id }))} style={chip(form.category === c.id)}>{c.label}</button>
          ))}
        </div>

        <div className="sl">02 / TECH STACK</div>
        <div style={{ marginBottom: 24 }}>
          {STACKS.map(t => (
            <button key={t} onClick={() => setForm(f => ({
              ...f, stack: f.stack.includes(t) ? f.stack.filter(x => x !== t) : [...f.stack, t]
            }))} style={chip(form.stack.includes(t))}>{t}</button>
          ))}
        </div>

        <div className="sl">03 / PENTRU CE AI TOOL?</div>
        <div style={{ marginBottom: 24 }}>
          {AI_TOOLS.map(t => (
            <button key={t} onClick={() => setForm(f => ({ ...f, aiTool: f.aiTool === t ? '' : t }))} style={chip(form.aiTool === t)}>{t}</button>
          ))}
        </div>

        <div className="sl">04 / DESCRIE CE VREI <span style={{ color: RED }}>*</span></div>
        <textarea value={form.description} rows={4} style={{ ...textarea, marginBottom: 4 }}
          placeholder="Ex: Vreau un hook React care să facă fetch la o listă de useri, cu loading, error și retry logic."
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        <p style={{ fontFamily: MONO, fontSize: 10, color: form.description.length > 30 ? GREEN : '#3D4351', textAlign: 'right', marginBottom: 20 }}>
          {form.description.length} chars {form.description.length > 30 ? '✓' : '· min 30'}
        </p>

        <div className="sl">05 / CONTEXT PROIECT</div>
        <textarea value={form.context} rows={3} style={{ ...textarea, marginBottom: 20 }}
          placeholder="Ex: Am deja useApi() hook și React Query instalat. Urmăm folder structure feature-based."
          onChange={e => setForm(f => ({ ...f, context: e.target.value }))} />

        <div className="sl">06 / CONSTRAINTS (ce să NU facă)</div>
        <textarea value={form.constraints} rows={3} style={{ ...textarea, marginBottom: 24 }}
          placeholder="Ex: Fără axios, doar fetch nativ. Zero any în TypeScript. Fără class components."
          onChange={e => setForm(f => ({ ...f, constraints: e.target.value }))} />

        {error && (
          <div style={{ background: '#FF475711', border: `1px solid ${RED}44`, padding: '12px 14px', marginBottom: 16, fontFamily: MONO, fontSize: 12, color: RED }}>
            ⚠ {error}
          </div>
        )}

        <button className={loading ? 'fa' : ''} onClick={generate} disabled={loading}
          style={{ width: '100%', padding: '15px', background: loading ? SURFACE2 : CYAN, color: loading ? CYAN : BG, border: loading ? `1px solid ${CYAN}` : 'none', fontFamily: MONO, fontWeight: 600, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? `⚡ FORJARE... ${Math.round(progress)}%` : '⚡ FORJEAZĂ PROMPTUL →'}
        </button>
      </div>
    </div>
  )

  /* ── RESULT ── */
  return (
    <div style={{ fontFamily: SANS, background: BG, minHeight: '100vh', color: TEXT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
      `}</style>

      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${BORDER}`, background: SURFACE, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => setStep('builder')} style={{ fontFamily: MONO, fontSize: 12, color: MUTED, background: 'none', border: 'none', cursor: 'pointer' }}>← MODIFICĂ</button>
        <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: 14, color: CYAN }}>⚡ PromptForge</span>
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
              {['#FF5F57', '#FFBD2E', '#28CA41'].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
            </div>
          </div>
          <div style={{ padding: '18px', fontFamily: MONO, fontSize: 12, lineHeight: 1.8, color: TEXT, whiteSpace: 'pre-wrap', maxHeight: '52vh', overflowY: 'auto' }}>
            {prompt}
          </div>
        </div>

        <button onClick={copy} style={{ width: '100%', marginTop: 12, padding: '13px', background: copied ? GREEN : SURFACE2, color: copied ? BG : TEXT, border: `1px solid ${copied ? GREEN : BORDER}`, fontFamily: MONO, fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all .2s' }}>
          {copied ? '✓ COPIAT ÎN CLIPBOARD' : '⎘  COPIAZĂ PROMPTUL'}
        </button>

        <div style={{ marginTop: 20, background: '#FFB80010', border: `1px solid ${AMBER}22`, padding: '14px 18px' }}>
          <p style={{ fontFamily: MONO, fontSize: 9, color: AMBER, letterSpacing: '1px', marginBottom: 8 }}>// CUM SĂ FOLOSEȘTI</p>
          {[
            '1. Copiază promptul de mai sus',
            `2. Deschide ${form.aiTool || 'Cursor / Claude Code'}`,
            '3. Paste → trimite',
            '4. Cod production-ready din prima iterație',
          ].map((t, i) => (
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
