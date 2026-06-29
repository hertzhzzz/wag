// app/(public)/factory-audit-china/page.tsx
import { Metadata } from 'next'
import FactoryAuditContent from './FactoryAuditContent'

export const metadata: Metadata = {
  title: { absolute: 'Factory Audit in China for Australian Importers | On-Site Capability Audit' },
  description:
    'On-site factory audit in China: production-capability assessment, quality-management systems, documentation review, and social compliance screening. Australia-based — we inspect on your behalf. Book a free consult.',
  keywords: [
    'factory audit china',
    'china factory audit service',
    'supplier audit china',
    'manufacturing capability audit china',
    'chinese factory inspection australia',
  ],
  openGraph: {
    title: 'Factory Audit in China | Winning Adventure Global',
    description:
      'On-site factory audit evaluating production capability, quality management (ISO 9001 alignment), documentation, workforce, and social compliance — conducted in person on your behalf.',
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
