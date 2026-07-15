import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { category, stack, aiTool, description, context, constraints } = await req.json()

  if (!category || !description) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const systemPrompt = `Ești un expert în inginerie de prompturi pentru AI coding tools (Claude Code, Cursor, GitHub Copilot).
Misiunea ta: transformă input-ul utilizatorului într-un prompt PROFESIONAL, COMPLET și EFICIENT pentru AI coding.
Un prompt bun conține: context clar, task specific, constraints, output format, edge cases.
Returnează DOAR promptul final, gata de copy-paste. Fără explicații înainte sau după.`

  const userMessage = `Generează un prompt profesional pentru AI coding cu aceste specificații:
CATEGORIA: ${category}
TECH STACK: ${stack?.join(', ') || 'nespecificat'}
AI TOOL: ${aiTool || 'orice AI coding tool'}
DESCRIERE: ${description}
CONTEXT: ${context || 'nespecificat'}
CONSTRAINTS: ${constraints || 'none'}

Creează un prompt complet, structurat, care să elimine ambiguitatea și să producă cod de calitate.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    const data = await res.json()
    const prompt = data.content?.map((b: { text?: string }) => b.text || '').join('') || ''

    if (!prompt) throw new Error('Empty response')

    return NextResponse.json({ prompt })
  } catch (e) {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
