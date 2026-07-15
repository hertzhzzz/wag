// app/(public)/quality-inspection-china/page.tsx
import { Metadata } from 'next'
import QualityInspectionContent from './QualityInspectionContent'
import ServiceSchema from '@/components/ServiceSchema'

export const metadata: Metadata = {
  title: { absolute: 'Quality Inspection in China | Secondary Path Support for Australian Buyers' },
  description:
    'Secondary path in China sourcing: pre-shipment quality inspection for an order already placed. AQL sampling, functional checks, and packaging verification for Australian businesses — not the primary find-and-vet offer.',
  keywords: [
    'quality inspection china',
    'pre-shipment inspection china',
    'AQL inspection china',
    'product inspection service china',
    'shipment quality check china australia',
  ],
  openGraph: {
    title: 'Quality Inspection Support | Winning Adventure Global',
    description:
      'Secondary-path support: inspect goods before they leave China. Primary commercial path remains finding and vetting new suppliers on services and industry pages.',
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
        description="Secondary-path pre-shipment quality inspection for Australian businesses: AQL sampling, functional testing, packaging and labeling verification, and quantity confirmation for an existing order."
      />
      <QualityInspectionContent />
    </>
  )
}
