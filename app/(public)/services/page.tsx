import { Metadata } from 'next'
import ServicesContent from './ServicesContent'

export const metadata: Metadata = {
  title: { absolute: 'China Sourcing Services for Australian Businesses' },
  description: 'Find and vet new China suppliers, or visit and verify an existing factory. Dual-path sourcing for AV & lighting, construction, and agricultural machinery.',
  keywords: ['china sourcing services australia', 'find china suppliers', 'supplier verification china', 'factory visit china', 'av lighting sourcing', 'construction materials china', 'agricultural machinery china'],
  openGraph: {
    title: 'China Sourcing Services | Winning Adventure Global',
    description: 'Primary path: find and vet new suppliers. Secondary path: visit or verify an existing factory. Service tiers for Australian businesses.',
    url: 'https://www.winningadventure.com.au/services',
    siteName: 'Winning Adventure Global',
    locale: 'en_AU',
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/services',
    languages: {
      'en-AU': 'https://www.winningadventure.com.au/services',
      'x-default': 'https://www.winningadventure.com.au/services',
    },
  },
}

export default function ServicesPage() {
  return <ServicesContent />
}
