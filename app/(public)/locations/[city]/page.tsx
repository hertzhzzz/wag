// app/(public)/locations/[city]/page.tsx
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Metadata } from 'next'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import { getLiveLocations, getLocation } from '@/data/locations'
import LocationCityContent from './LocationCityContent'
import ServiceSchema from '@/components/ServiceSchema'

const BASE = 'https://www.winningadventure.com.au'

export function generateStaticParams() {
  return getLiveLocations().map((l) => ({ city: l.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ city: string }> },
): Promise<Metadata> {
  const { city } = await params
  const loc = getLocation(city)
  if (!loc) return {}
  const url = `${BASE}/locations/${loc.slug}`
  // Geo support pages: avoid national money title "China Sourcing Agent for {City}"
  // so commercial root /china-sourcing-agent owns the agent query.
  const title = `China Sourcing for ${loc.city} Importers | ${loc.stateAbbr}`
  // Keep under 160 chars so search results are not truncated (see lib/seo-metadata-length.test.ts).
  const description = `China sourcing for ${loc.city} importers: we verify factories, audit capability, and inspect goods in China. Importing via ${loc.portName}.`
  return {
    title: { absolute: title },
    description,
    keywords: [
      `china sourcing ${loc.city.toLowerCase()}`,
      `supplier verification ${loc.city.toLowerCase()}`,
      `importing from china ${loc.city.toLowerCase()}`,
      `china procurement ${loc.stateAbbr.toLowerCase()}`,
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

export default async function LocationPage(
  { params }: { params: Promise<{ city: string }> },
) {
  const { city } = await params
  const loc = getLocation(city)
  if (!loc) notFound()

  const url = `${BASE}/locations/${loc.slug}`

  return (
    <>
      <ServiceSchema
        name={`China Sourcing Support for ${loc.city} Importers`}
        serviceType="China Sourcing Support"
        url={url}
        areaServed={{ '@type': 'City', name: `${loc.city}, ${loc.state}` }}
        description={`Local China sourcing support for importers in ${loc.city}, ${loc.state}: supplier verification, factory audit, and quality inspection coordination.`}
      />
      <Navbar />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: BASE },
          { name: 'China Sourcing Agent', url: `${BASE}/china-sourcing-agent` },
          { name: loc.city, url },
        ]}
      />
      <LocationCityContent loc={loc} />
      <Footer />
    </>
  )
}
