// LEGACY route stub. Production equity transfers via next.config.js permanent
// redirect: /article/china-sourcing-agent → /china-sourcing-agent.
// Do not expand this page; edit app/(public)/china-sourcing-agent/ instead.
// Kept only so local/dev without redirects still does not self-canonical the legacy URL.
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'China Sourcing Agent',
  robots: {
    index: false,
    follow: false,
  },
  // Intentionally no alternates.canonical to the legacy URL.
  // Commercial canonical lives on /china-sourcing-agent only.
}

export default function LegacyChinaSourcingAgentStub() {
  redirect('/china-sourcing-agent')
}
