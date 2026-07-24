// app/(public)/china-sourcing-agent/page.tsx
import { Metadata } from 'next'
import ServiceSchema from '@/components/ServiceSchema'
import ChinaSourcingAgentContent from './ChinaSourcingAgentContent'

const PAGE_URL = 'https://www.winningadventure.com.au/china-sourcing-agent'

export const metadata: Metadata = {
  title: { absolute: 'China Sourcing Agent Australia | Winning Adventure Global' },
  description:
    'Australia-based China sourcing agent for Australian businesses: factory verification, quality control, and end-to-end procurement support with an on-ground team in China.',
  keywords: [
    'china sourcing agent australia',
    'china sourcing agent',
    'sourcing agent australia',
    'china procurement agent',
    'factory verification china',
    'quality control china',
    'supplier verification australia',
  ],
  openGraph: {
    title: 'China Sourcing Agent Australia | Winning Adventure Global',
    description:
      'Dedicated China sourcing agent for Australian businesses — factory verification, quality control, and end-to-end procurement support.',
    url: PAGE_URL,
    siteName: 'Winning Adventure Global',
    locale: 'en_AU',
  },
  alternates: {
    canonical: PAGE_URL,
    languages: {
      'en-AU': PAGE_URL,
      'x-default': PAGE_URL,
    },
  },
}

export default function ChinaSourcingAgentPage() {
  return (
    <>
      <ServiceSchema
        name="China Sourcing Agent for Australian Businesses"
        description="China sourcing, factory verification, quality control and procurement support for Australian businesses."
        url={PAGE_URL}
        areaServed={{ '@type': 'Country', name: 'Australia' }}
        serviceType="China Sourcing Agent"
      />
      <ChinaSourcingAgentContent />
    </>
  )
}
