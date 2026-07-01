'use client'

import Link from 'next/link'
import { trackInternalLink } from '@/lib/analytics'

// Client-side tracked wrapper for internal cross-links (article-to-article,
// factory-to-article, etc.) embedded inside Server Component pages. Mirrors
// TrackedEnquiryLink. Computes fromPage from the current URL so Server
// Component callers don't need to thread their own path through as a prop.
export default function TrackedInternalLink({
  href,
  linkText,
  className,
  children,
}: {
  href: string
  linkText: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackInternalLink(typeof window !== 'undefined' ? window.location.pathname : '', href, linkText)}
    >
      {children}
    </Link>
  )
}
