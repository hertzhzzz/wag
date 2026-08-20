// app/(public)/industries/[industry]/page.tsx
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import { getLiveIndustries, getIndustry } from '@/data/industries'
import {
  buildIndustryPageTitle,
  getIndustryIntentPage,
} from '@/lib/industry-intent-content'
import IndustryContent from './IndustryContent'
import DualPathIndustryContent from './DualPathIndustryContent'
import ServiceSchema from '@/components/ServiceSchema'

const BASE = 'https://www.winningadventure.com.au'

export function generateStaticParams() {
  return getLiveIndustries().map((i) => ({ industry: i.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ industry: string }> },
): Promise<Metadata> {
  const { industry } = await params
  const dual = getIndustryIntentPage(industry)
  const legacy = getIndustry(industry)
  if (!dual && !legacy) return {}

  const slug = dual?.slug ?? legacy!.slug
  const displayName = dual?.industry ?? legacy!.industry
  const navLabel = dual?.navLabel ?? legacy!.navLabel
  const url = `${BASE}/industries/${slug}`
  const title = dual?.title ?? buildIndustryPageTitle(displayName)
  const description =
    dual?.metaDescription ??
    `Australia-based China sourcing for ${displayName.toLowerCase()}: find and vet suppliers, due diligence, visit planning, and on-ground coordination.`

  return {
    title: { absolute: title },
    description,
    keywords: [
      `${displayName.toLowerCase()} china sourcing`,
      `${displayName.toLowerCase()} suppliers china`,
      `import ${displayName.toLowerCase()} from china`,
      `china ${navLabel.toLowerCase()} supplier australia`,
      `${navLabel.toLowerCase()} sourcing agent australia`,
    ],
    openGraph: {
      title,
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
  const dual = getIndustryIntentPage(industry)
  const legacy = getIndustry(industry)
  if (!dual && !legacy) notFound()

  const slug = dual?.slug ?? legacy!.slug
  const displayName = dual?.industry ?? legacy!.industry
  const url = `${BASE}/industries/${slug}`

  return (
    <>
      <ServiceSchema
        name={`${displayName} China Sourcing for Australian Businesses`}
        serviceType="China Sourcing Agent"
        url={url}
        areaServed={{ '@type': 'Country', name: 'Australia' }}
        description={
          dual?.metaDescription ??
          `Australia-based China sourcing for ${displayName.toLowerCase()}: find and vet suppliers, due diligence, visit planning, and on-ground coordination.`
        }
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: BASE },
          { name: 'Services', url: `${BASE}/services` },
          { name: displayName, url },
        ]}
      />
      {dual ? <DualPathIndustryContent page={dual} /> : <IndustryContent ind={legacy!} />}
    </>
  )
}
