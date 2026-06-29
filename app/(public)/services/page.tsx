import { Metadata } from 'next'
import ServicesContent from './ServicesContent'

export const metadata: Metadata = {
  title: { absolute: 'China Sourcing Services | Tours, Procurement & Verification' },
  description: 'Three flexible service tiers for Australian businesses sourcing from China. Choose one-time procurement, guided factory tours with supply chain setup, or remote verification with ongoing procurement management.',
  keywords: ['china sourcing services', 'china factory tours', 'remote factory verification', 'china procurement australia', 'supplier verification china', 'bulk procurement china'],
  openGraph: {
    title: 'China Sourcing Services | Winning Adventure Global',
    description: 'Three service tiers for Australian businesses: one-time procurement, guided factory tours, and remote verification with supply chain management.',
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
