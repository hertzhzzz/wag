// app/(public)/supplier-verification/page.tsx
import { Metadata } from 'next'
import SupplierVerificationContent from './SupplierVerificationContent'
import ServiceSchema from '@/components/ServiceSchema'

export const metadata: Metadata = {
  title: { absolute: 'Supplier Verification in China for Australian Buyers' },
  description:
    'Secondary path: verify an existing Chinese supplier before you commit — license authentication, capability checks, and quality support.',
  keywords: [
    'supplier verification china',
    'verify chinese manufacturer',
    'remote factory verification',
    'supplier due diligence china',
    'existing supplier verification australia',
  ],
  openGraph: {
    title: 'Supplier Verification Support | Winning Adventure Global',
    description:
      'Secondary-path support: authenticate and assess an existing China supplier. Primary commercial path remains finding and vetting new suppliers on services and industry pages.',
    url: 'https://www.winningadventure.com.au/supplier-verification',
    siteName: 'Winning Adventure Global',
    locale: 'en_AU',
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/supplier-verification',
    languages: {
      'en-AU': 'https://www.winningadventure.com.au/supplier-verification',
      'x-default': 'https://www.winningadventure.com.au/supplier-verification',
    },
  },
}

export default function SupplierVerificationPage() {
  return (
    <>
      <ServiceSchema
        name="Supplier Verification in China"
        serviceType="Supplier Verification"
        url="https://www.winningadventure.com.au/supplier-verification"
        areaServed={{ '@type': 'Country', name: 'Australia' }}
        description="Secondary-path supplier verification for Australian businesses: business-license authentication, capability and export-history assessment, and quality support for an existing China factory contact."
      />
      <SupplierVerificationContent />
    </>
  )
}
