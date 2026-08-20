// app/(public)/factory-audit-china/page.tsx
import { Metadata } from 'next'
import FactoryAuditContent from './FactoryAuditContent'

export const metadata: Metadata = {
  title: { absolute: 'Factory Audit in China for Australian Buyers' },
  description:
    'Secondary path: on-site audit of an existing Chinese supplier — capability, quality systems, documentation, and compliance screening.',
  keywords: [
    'factory audit china',
    'supplier audit china',
    'manufacturing capability audit china',
    'existing factory audit australia',
    'china factory due diligence',
  ],
  openGraph: {
    title: 'Factory Audit Support | Winning Adventure Global',
    description:
      'Secondary-path support: walk an existing China factory floor and report capability. Primary commercial path remains finding and vetting new suppliers.',
    url: 'https://www.winningadventure.com.au/factory-audit-china',
    siteName: 'Winning Adventure Global',
    locale: 'en_AU',
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/factory-audit-china',
    languages: {
      'en-AU': 'https://www.winningadventure.com.au/factory-audit-china',
      'x-default': 'https://www.winningadventure.com.au/factory-audit-china',
    },
  },
}

export default function FactoryAuditPage() {
  return <FactoryAuditContent />
}
