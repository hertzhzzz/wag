// app/(public)/visiting-chinese-factories/page.tsx
import { Metadata } from 'next'
import VisitingChineseFactoriesContent from './VisitingChineseFactoriesContent'
import ServiceSchema from '@/components/ServiceSchema'

export const metadata: Metadata = {
  title: { absolute: 'Factory Tours & Visits in China for Australian Buyers' },
  description:
    'Guided China factory tours for Australian businesses. We shortlist and verify factories, arrange the meetings, and accompany you on the ground with a bilingual guide to audit production in person. Book a free consult.',
  keywords: [
    'visiting chinese factories',
    'china factory tour',
    'china factory visit',
    'factory tour china australia',
    'visit chinese factory',
  ],
  openGraph: {
    title: 'Factory Tours & Visits in China | Winning Adventure Global',
    description:
      'Guided, bilingual factory tours across China for Australian buyers: shortlist verified factories, meet suppliers in person, and audit production on the ground.',
    url: 'https://www.winningadventure.com.au/visiting-chinese-factories',
    siteName: 'Winning Adventure Global',
    locale: 'en_AU',
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/visiting-chinese-factories',
    languages: {
      'en-AU': 'https://www.winningadventure.com.au/visiting-chinese-factories',
      'x-default': 'https://www.winningadventure.com.au/visiting-chinese-factories',
    },
  },
}

export default function VisitingChineseFactoriesPage() {
  return (
    <>
      <ServiceSchema
        name="Factory Tours & Visits in China"
        serviceType="Factory Tour"
        url="https://www.winningadventure.com.au/visiting-chinese-factories"
        areaServed={{ '@type': 'Country', name: 'Australia' }}
        description="Guided factory tours in China for Australian buyers: shortlist and verify factories, arrange meetings, and accompany you on the ground with a bilingual guide to audit production in person."
      />
      <VisitingChineseFactoriesContent />
    </>
  )
}
