// app/(public)/supplier-verification/page.tsx
import { Metadata } from 'next'
import SupplierVerificationContent from './SupplierVerificationContent'

export const metadata: Metadata = {
  title: { absolute: 'Supplier Verification in China for Australian Importers' },
  description:
    'Remote supplier verification for Australian businesses sourcing from China. We authenticate business licenses, audit capability, and inspect quality against a database of 1,200+ pre-screened factories. Book a free consult.',
  keywords: [
    'supplier verification china',
    'supplier verification china australia',
    'china supplier verification service',
    'verify chinese manufacturer',
    'remote factory verification',
  ],
  openGraph: {
    title: 'Supplier Verification in China | Winning Adventure Global',
    description:
      'Remote, Australia-based supplier verification: business-license authentication, capability audit, and quality inspection across 1,200+ pre-screened Chinese factories.',
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

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Supplier Verification in China',
  serviceType: 'Supplier Verification',
  provider: {
    '@type': 'Organization',
    name: 'Winning Adventure Global',
    url: 'https://www.winningadventure.com.au',
  },
  areaServed: { '@type': 'Country', name: 'Australia' },
  description:
    'Remote supplier verification for Australian importers sourcing from China: unified social credit code (business license) authentication, capability and export-history audit, and pre-shipment quality inspection across a database of 1,200+ pre-screened factories.',
  priceRange: 'Contact for quote',
}

export default function SupplierVerificationPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <SupplierVerificationContent />
    </>
  )
}
