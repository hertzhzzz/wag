// app/(public)/industries/[industry]/page.tsx
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import { getLiveIndustries, getIndustry } from '@/data/industries'
import IndustryContent from './IndustryContent'
import ServiceSchema from '@/components/ServiceSchema'

const BASE = 'https://www.winningadventure.com.au'

export function generateStaticParams() {
  return getLiveIndustries().map((i) => ({ industry: i.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ industry: string }> },
): Promise<Metadata> {
  const { industry } = await params
  const ind = getIndustry(industry)
  if (!ind) return {}
  const url = `${BASE}/industries/${ind.slug}`
  const title = `${ind.industry} Sourcing from China for Australian Importers`
  const description = `Australia-based China sourcing for ${ind.industry.toLowerCase()}: factory verification, capability audits, compliance checks, and pre-shipment inspection. We confirm Australian-standards evidence before goods ship. Book a free consult.`
  return {
    title: { absolute: title },
    description,
    keywords: [
      `${ind.industry.toLowerCase()} sourcing china`,
      `import ${ind.industry.toLowerCase()} from china`,
      `china ${ind.navLabel.toLowerCase()} supplier`,
      `${ind.navLabel.toLowerCase()} sourcing agent australia`,
      `china ${ind.navLabel.toLowerCase()} factory verification`,
    ],
    openGraph: {
      title: `${ind.industry} Sourcing from China | Winning Adventure Global`,
      description,
      url,
      siteName: 'Winning Adventure Global',
      locale: 'en_AU',
    },
    alternates: {
      canonical: url,
      languages: { 'en-AU': url, 'x-default': url },
    },
  }
}

export default async function IndustryPage(
  { params }: { params: Promise<{ industry: string }> },
) {
  const { industry } = await params
  const ind = getIndustry(industry)
  if (!ind) notFound()

  const url = `${BASE}/industries/${ind.slug}`

  return (
    <>
      <ServiceSchema
        name={`${ind.industry} Sourcing from China`}
        serviceType="China Sourcing Agent"
        url={url}
        areaServed={{ '@type': 'Country', name: 'Australia' }}
        description={`Australia-based China sourcing, supplier verification, factory audit, and quality inspection for ${ind.industry.toLowerCase()} importers.`}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: BASE },
          { name: 'Services', url: `${BASE}/services` },
          { name: ind.industry, url },
        ]}
      />
      <IndustryContent ind={ind} />
    </>
  )
}
