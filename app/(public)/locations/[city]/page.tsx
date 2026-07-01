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
  const title = `China Sourcing Agent for ${loc.city} Importers | ${loc.stateAbbr}`
  const description = `Australia-based China sourcing agent for ${loc.city} (${loc.state}) importers. We verify factories, audit capability, and inspect goods in China — serving businesses importing through ${loc.portName}. Book a free consult.`
  return {
    title: { absolute: title },
    description,
    keywords: [
      `china sourcing agent ${loc.city.toLowerCase()}`,
      `china sourcing ${loc.city.toLowerCase()}`,
      `supplier verification ${loc.city.toLowerCase()}`,
      `importing from china ${loc.city.toLowerCase()}`,
      `china import agent ${loc.stateAbbr.toLowerCase()}`,
    ],
    openGraph: {
      title: `China Sourcing Agent for ${loc.city} Importers | Winning Adventure Global`,
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
        name={`China Sourcing Agent for ${loc.city} Importers`}
        serviceType="China Sourcing Agent"
        url={url}
        areaServed={{ '@type': 'City', name: `${loc.city}, ${loc.state}` }}
        description={`Australia-based China sourcing, supplier verification, factory audit, and quality inspection for importers in ${loc.city}, ${loc.state}.`}
      />
      <Navbar />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: BASE },
          { name: 'Services', url: `${BASE}/services` },
          { name: loc.city, url },
        ]}
      />
      <LocationCityContent loc={loc} />
      <Footer />
    </>
  )
}
