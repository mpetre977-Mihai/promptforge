import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PromptForge — AI Prompt Builder for Developers',
  description: 'Transform vague ideas into structured AI coding prompts for Cursor, Claude Code, and GitHub Copilot.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{margin:0,background:'#0D0F14'}}>
        {children}
      </body>
    </html>
  )
}
