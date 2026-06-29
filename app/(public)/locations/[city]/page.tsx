// app/(public)/locations/[city]/page.tsx
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import FAQ from '@/components/FAQ'
import ScrollReveal from '@/components/ScrollReveal'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import LeadForm from '@/components/LeadForm'
import { getLiveLocations, getLocation } from '@/data/locations'
import {
  Ship, ShieldCheck, ClipboardCheck, Boxes,
  MapPin, Building2, Check, ArrowRight,
  ClipboardList, Search, PackageCheck, Anchor, Star,
} from 'lucide-react'

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

// Services to cross-link out to (avoids duplicating service-process detail on city pages)
const SERVICES = [
  {
    href: '/supplier-verification',
    icon: ShieldCheck,
    title: 'Supplier Verification',
    body: 'Confirm the company is real and legitimate before you pay a deposit.',
  },
  {
    href: '/factory-audit-china',
    icon: ClipboardCheck,
    title: 'Factory Audit',
    body: 'On-site assessment of production capability, systems, and compliance.',
  },
  {
    href: '/quality-inspection-china',
    icon: Boxes,
    title: 'Quality Inspection',
    body: 'Pre-shipment AQL inspection of finished goods before they leave China.',
  },
]

export default async function LocationPage(
  { params }: { params: Promise<{ city: string }> },
) {
  const { city } = await params
  const loc = getLocation(city)
  if (!loc) notFound()

  const url = `${BASE}/locations/${loc.slug}`

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `China Sourcing Agent for ${loc.city} Importers`,
    serviceType: 'China Sourcing Agent',
    provider: {
      '@type': ['Organization', 'LocalBusiness'],
      name: 'Winning Adventure Global',
      '@id': `${BASE}/#organization`,
      url: BASE,
    },
    areaServed: { '@type': 'City', name: `${loc.city}, ${loc.state}` },
    description: `Australia-based China sourcing, supplier verification, factory audit, and quality inspection for importers in ${loc.city}, ${loc.state}.`,
    priceRange: 'Quoted per project — free consult to scope',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <Navbar />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: BASE },
          { name: 'Services', url: `${BASE}/services` },
          { name: loc.city, url },
        ]}
      />

      <main>
        {/* ===================== Hero ===================== */}
        <section className="relative min-h-[60vh] md:min-h-[680px] flex items-center bg-navy overflow-hidden">
          <Image
            src="/hero-cargo-mobile.webp"
            alt=""
            fill
            priority
            unoptimized
            className="object-cover z-0"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-br from-navy/95 via-navy/80 to-navy/55 z-[1]"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_30%_50%,_white_1px,_transparent_1px)] bg-[length:40px_40px] z-[1]"
            aria-hidden="true"
          />

          <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 py-10 md:py-16 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="h-px w-8 bg-amber" aria-hidden="true" />
                <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">
                  {loc.heroTagline}
                </p>
              </div>
              <h1 className="font-serif font-bold text-white text-[clamp(2.1rem,4.6vw,3.25rem)] leading-[1.06] mb-5">
                {loc.heroHeading}
              </h1>
              <p className="text-white/80 text-lg leading-relaxed max-w-xl mb-7">
                {loc.heroIntro}
              </p>
              <ul className="flex flex-col gap-2.5">
                {[
                  'Supplier verification before you pay a deposit',
                  'On-site factory audits in China',
                  'Pre-shipment quality inspection',
                ].map((b) => (
                  <li key={b} className="flex items-center gap-3 text-white/90 text-[15px]">
                    <Check size={18} className="text-amber flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:pl-4">
              <LeadForm id="book" />
            </div>
          </div>
        </section>

        {/* ===================== Local trust stats ===================== */}
        <section className="bg-white border-b border-navy/10">
          <div className="max-w-[1100px] mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {loc.stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-serif font-bold text-navy text-3xl md:text-4xl mb-1">{s.value}</p>
                <p className="text-navy/60 text-[13px] leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===================== Why <city> ===================== */}
        <section className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-amber" aria-hidden="true" />
              <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">
                For {loc.city} importers
              </p>
            </div>
            <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] leading-tight mb-6 max-w-[760px] text-balance">
              {loc.whyHeading}
            </h2>
            <p className="text-navy/70 text-lg leading-relaxed max-w-[820px] mb-8">{loc.whyBody}</p>
            <ul className="flex flex-col gap-3 max-w-[820px]">
              {loc.localPoints.map((p) => (
                <li key={p} className="flex gap-3 text-navy/75 text-[15px] leading-relaxed">
                  <MapPin size={18} className="text-amber flex-shrink-0 mt-0.5" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </section>

        {/* ===================== Process: enquiry → delivery in <city> ===================== */}
        <section className="bg-navy/[0.03] border-y border-navy/10">
          <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
            <ScrollReveal>
              <div className="flex items-center gap-3 mb-3 justify-center">
                <span className="h-px w-8 bg-amber" aria-hidden="true" />
                <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">
                  Our process
                </p>
                <span className="h-px w-8 bg-amber" aria-hidden="true" />
              </div>
              <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] mb-3 text-center text-balance">
                From enquiry to delivery in {loc.city}
              </h2>
              <p className="text-navy/60 text-center max-w-[640px] mx-auto mb-12">
                Five checkpoints between your first message and goods landing at {loc.portName}.
              </p>
            </ScrollReveal>
            <div className="grid md:grid-cols-5 gap-5">
              {[
                { icon: ClipboardList, title: 'Submit your enquiry', body: `Tell us your product, target supplier, and volume. We respond within 24 hours.` },
                { icon: ShieldCheck, title: 'Supplier verification', body: 'We authenticate the business license and confirm the company is a real manufacturer — not a middleman.' },
                { icon: Search, title: 'Factory audit', body: 'On the ground in China, we assess production capability, quality systems, and compliance.' },
                { icon: PackageCheck, title: 'Pre-shipment inspection', body: 'Before the balance is paid, we inspect finished goods against your specification (AQL sampling).' },
                { icon: Anchor, title: `Ship to ${loc.city}`, body: `Cleared to sail to ${loc.portName} — typically ${loc.transitSummary} by sea from China.` },
              ].map((s, i) => (
                <ScrollReveal key={s.title}>
                  <div className="bg-white border border-navy/10 p-5 h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 rounded-full bg-navy text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                      <s.icon size={20} className="text-amber" />
                    </div>
                    <h3 className="font-semibold text-navy text-[15px] mb-1.5 leading-tight">{s.title}</h3>
                    <p className="text-navy/65 text-[13px] leading-relaxed">{s.body}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== Company credibility band ===================== */}
        <section className="bg-navy text-white">
          <div className="max-w-[1100px] mx-auto px-6 py-12 md:py-14">
            <div className="grid md:grid-cols-[1fr_auto] gap-8 md:gap-12 items-center">
              <div>
                <h2 className="font-serif font-bold text-xl md:text-2xl leading-tight mb-2">
                  Why {loc.city} importers trust us
                </h2>
                <p className="text-white/70 text-[15px] leading-relaxed max-w-[520px]">
                  Every factory we recommend has been physically vetted against a 12-point verification process — business licence, production capacity, quality systems, and sample quality. You buy direct and own the relationship.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-10 gap-y-6 flex-shrink-0">
                {[
                  { value: '120+', label: 'Factories visited' },
                  { value: '50+', label: 'Industries served' },
                  { value: '12-point', label: 'Verification process' },
                  { value: '24hr', label: 'Enquiry response' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-serif font-bold text-amber text-2xl md:text-3xl leading-none mb-1">{s.value}</p>
                    <p className="text-white/60 text-[12px] leading-snug">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===================== Services (cross-link, no duplicate detail) ===================== */}
        <section className="bg-white">
          <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
            <ScrollReveal>
              <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] mb-3 text-center text-balance">
                How we help {loc.city} importers source from China
              </h2>
              <p className="text-navy/60 text-center max-w-[640px] mx-auto mb-12">
                Three checkpoints that protect your money — from vetting the company to inspecting the goods before they ship.
              </p>
            </ScrollReveal>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {SERVICES.map((s) => (
                <ScrollReveal key={s.href}>
                  <Link
                    href={s.href}
                    className="group block bg-white border border-navy/10 p-7 h-full hover:border-amber/50 transition-colors no-underline"
                  >
                    <s.icon size={26} className="text-amber mb-4" />
                    <h3 className="font-semibold text-navy text-lg mb-2 flex items-center gap-1.5">
                      {s.title}
                      <ArrowRight size={16} className="text-amber opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-navy/70 text-[15px] leading-relaxed">{s.body}</p>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== Local logistics (transit) ===================== */}
        <section className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <ScrollReveal>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Ship size={20} className="text-amber" />
                  <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">
                    Shipping to {loc.city}
                  </p>
                </div>
                <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] leading-tight mb-5 text-balance">
                  China to {loc.portName}
                </h2>
                <div className="border border-navy/10">
                  {loc.transitRows.map((r, i) => (
                    <div
                      key={r.route}
                      className={`flex items-center justify-between px-5 py-3.5 ${i > 0 ? 'border-t border-navy/10' : ''}`}
                    >
                      <span className="text-navy/75 text-[15px]">{r.route}</span>
                      <span className="font-semibold text-navy text-[15px]">{r.days}</span>
                    </div>
                  ))}
                </div>
                <p className="text-navy/60 text-sm leading-relaxed mt-4">{loc.transitNote}</p>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Boxes size={20} className="text-amber" />
                  <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">
                    What {loc.city} imports
                  </p>
                </div>
                <p className="text-navy/70 leading-relaxed mb-5">{loc.industriesIntro}</p>
                <div className="flex flex-wrap gap-2">
                  {loc.industries.map((tag) => (
                    <span
                      key={tag}
                      className="text-[13px] text-navy/80 border border-navy/15 px-3 py-1.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ===================== Case study (only where a real one exists) ===================== */}
        {loc.caseStudy && (
          <section className="bg-navy/[0.03] border-t border-navy/10">
            <div className="max-w-[1000px] mx-auto px-6 py-16 md:py-20">
              <ScrollReveal>
                <div className="flex items-center gap-2 mb-5">
                  <span className="h-px flex-1 bg-navy/10" aria-hidden="true" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-navy/40">
                    {loc.city} case story
                  </span>
                  <span className="h-px flex-1 bg-navy/10" aria-hidden="true" />
                </div>
                <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-amber bg-amber/5 border border-amber/20 px-3 py-1 rounded-full mb-4">
                  {loc.caseStudy.tag}
                </span>
                <h2 className="font-serif font-bold text-navy text-2xl md:text-[2rem] leading-tight mb-6 text-balance">
                  {loc.caseStudy.title}
                </h2>
                <div className="flex flex-wrap gap-x-5 gap-y-2 mb-8">
                  {loc.caseStudy.kpis.map((k) => (
                    <div key={k} className="flex items-center gap-2">
                      <Star size={15} className="text-amber flex-shrink-0" />
                      <span className="text-[14px] text-navy/75">{k}</span>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { label: 'The Challenge', body: loc.caseStudy.challenge },
                  { label: 'Our Approach', body: loc.caseStudy.approach },
                  { label: 'The Outcome', body: loc.caseStudy.outcome },
                ].map((b) => (
                  <ScrollReveal key={b.label}>
                    <div className="bg-white border border-navy/10 p-6 h-full">
                      <h3 className="font-semibold text-navy text-[15px] mb-2">{b.label}</h3>
                      <p className="text-navy/70 text-[14px] leading-relaxed">{b.body}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
              <p className="text-[11px] text-navy/50 italic mt-5">
                Client details de-identified. Results are specific to this engagement and do not guarantee identical outcomes.
              </p>
            </div>
          </section>
        )}

        {/* ===================== FAQ ===================== */}
        <section className="bg-white border-t border-navy/10">
          <div className="max-w-[900px] mx-auto px-6 py-16 md:py-20">
            <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] mb-10 text-center">
              {loc.city} China Sourcing FAQs
            </h2>
            <FAQ faqs={loc.faqs} hideHeading />
          </div>
        </section>

        {/* ===================== Closing CTA ===================== */}
        <section className="bg-navy text-white">
          <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Building2 size={20} className="text-amber" />
                <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">
                  Australia-based · serving {loc.city}
                </p>
              </div>
              <h2 className="font-serif font-bold text-2xl md:text-[2.2rem] leading-tight mb-4">
                Source from China with confidence
              </h2>
              <p className="text-white/80 text-lg leading-relaxed mb-6 max-w-md">
                Tell us what you are sourcing and your target supplier. We&apos;ll scope a verification on a free, no-obligation consult.
              </p>
              <ul className="flex flex-col gap-2.5">
                {[
                  'Supplier verification before you pay',
                  'On-site factory audits',
                  'Pre-shipment quality inspection',
                ].map((b) => (
                  <li key={b} className="flex items-center gap-3 text-white/90 text-[15px]">
                    <Check size={18} className="text-amber flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <LeadForm />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
