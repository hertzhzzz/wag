'use client'

import { trackPhoneCall } from '@/lib/analytics'

// Single source for the phone number + Google Ads call-conversion tracking.
// Any clickable phone link should route through this so tracking is never missed.
const PHONE_HREF = 'tel:+61416588198'

export default function PhoneCallLink({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <a href={PHONE_HREF} className={className} onClick={() => trackPhoneCall()}>
      {children}
    </a>
  )
}
