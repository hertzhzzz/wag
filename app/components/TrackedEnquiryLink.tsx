'use client'

import Link from 'next/link'
import { trackCTAClick } from '@/lib/analytics'

// Client-side tracked wrapper for "/enquiry" CTAs embedded inside Server Component
// pages (e.g. article pages with generateMetadata). Mirrors PhoneCallLink/RelatedFactoryLink.
export default function TrackedEnquiryLink({
  buttonName,
  location,
  className,
  ariaLabel,
  children,
}: {
  buttonName: string
  location: string
  className?: string
  ariaLabel?: string
  children: React.ReactNode
}) {
  return (
    <Link
      href="/enquiry"
      className={className}
      aria-label={ariaLabel}
      onClick={() => trackCTAClick(buttonName, location)}
    >
      {children}
    </Link>
  )
}
