// app/(public)/quality-inspection-china/page.tsx
import { Metadata } from 'next'
import QualityInspectionContent from './QualityInspectionContent'
import ServiceSchema from '@/components/ServiceSchema'

export const metadata: Metadata = {
  title: { absolute: 'Pre-Shipment Quality Inspection in China | AQL Sampling & Testing' },
  description:
    'Pre-shipment quality inspection for Australian importers sourcing from China. AQL random sampling (ISO 2859-1), functional testing, packaging verification, and quantity check. Australia-based oversight. Book a free consult.',
  keywords: [
    'quality inspection china',
    'pre-shipment inspection china',
    'AQL inspection china',
    'product inspection service china',
    'final random inspection china',
  ],
  openGraph: {
    title: 'Quality Inspection in China | Winning Adventure Global',
    description:
      'Pre-shipment quality inspection using AQL sampling (ISO 2859-1 / ANSI-ASQ Z1.4): product checks, functional tests, packaging verification, and quantity confirmation. We inspect on your behalf before your shipment leaves China.',
    url: 'https://www.winningadventure.com.au/quality-inspection-china',
    siteName: 'Winning Adventure Global',
    locale: 'en_AU',
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/quality-inspection-china',
    languages: {
      'en-AU': 'https://www.winningadventure.com.au/quality-inspection-china',
      'x-default': 'https://www.winningadventure.com.au/quality-inspection-china',
    },
  },
}

export default function QualityInspectionPage() {
  return (
    <>
      <ServiceSchema
        name="Pre-Shipment Quality Inspection in China"
        serviceType="Quality Inspection"
        url="https://www.winningadventure.com.au/quality-inspection-china"
        areaServed={{ '@type': 'Country', name: 'Australia' }}
        description="Pre-shipment quality inspection for Australian importers: AQL random sampling, functional testing, packaging and labeling verification, quantity confirmation, and container loading supervision."
      />
      <QualityInspectionContent />
    </>
  )
}
