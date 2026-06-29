// app/(public)/industries/[industry]/page.tsx
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
import { getLiveIndustries, getIndustry } from '@/data/industries'
import {
  ShieldCheck, ClipboardCheck, Boxes, AlertTriangle,
  Building2, Check, ArrowRight, ClipboardList, Search, PackageCheck, FileCheck2,
} from 'lucide-react'

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

export default async function IndustryPage(
  { params }: { params: Promise<{ industry: string }> },
) {
  const { industry } = await params
  const ind = getIndustry(industry)
  if (!ind) notFound()

  const url = `${BASE}/industries/${ind.slug}`

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${ind.industry} Sourcing from China`,
    serviceType: 'China Sourcing Agent',
    provider: {
      '@type': ['Organization', 'LocalBusiness'],
      name: 'Winning Adventure Global',
      '@id': `${BASE}/#organization`,
      url: BASE,
    },
    areaServed: { '@type': 'Country', name: 'Australia' },
    description: `Australia-based China sourcing, supplier verification, factory audit, and quality inspection for ${ind.industry.toLowerCase()} importers.`,
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
          { name: ind.industry, url },
        ]}
      />

      <main>
        {/* ===================== Hero ===================== */}
        <section className="relative min-h-[60vh] md:min-h-[680px] flex items-center bg-navy overflow-hidden">
          <Image
            src={`/industry-${ind.slug}.jpg`}
            alt=""
            fill
            priority
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
                  {ind.heroTagline}
                </p>
              </div>
              <h1 className="font-serif font-bold text-white text-[clamp(2.1rem,4.6vw,3.25rem)] leading-[1.06] mb-5">
                {ind.heroHeading}
              </h1>
              <p className="text-white/80 text-lg leading-relaxed max-w-xl mb-7">
                {ind.heroIntro}
              </p>
              <ul className="flex flex-col gap-2.5">
                {[
                  'Supplier verification before you pay a deposit',
                  'On-site factory audits in China',
                  'Pre-shipment quality & compliance inspection',
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

        {/* ===================== Trust stats ===================== */}
        <section className="bg-white border-b border-navy/10">
          <div className="max-w-[1100px] mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {ind.stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-serif font-bold text-navy text-3xl md:text-4xl mb-1">{s.value}</p>
                <p className="text-navy/60 text-[13px] leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===================== Why this industry needs verification ===================== */}
        <section className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-amber" aria-hidden="true" />
              <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">
                Why it matters
              </p>
            </div>
            <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] leading-tight mb-6 max-w-[760px] text-balance">
              {ind.whyHeading}
            </h2>
            <p className="text-navy/70 text-lg leading-relaxed max-w-[820px] mb-8">{ind.whyBody}</p>
            <ul className="flex flex-col gap-3 max-w-[820px]">
              {ind.riskPoints.map((p) => (
                <li key={p} className="flex gap-3 text-navy/75 text-[15px] leading-relaxed">
                  <AlertTriangle size={18} className="text-amber flex-shrink-0 mt-0.5" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </section>

        {/* ===================== Process ===================== */}
        <section className="bg-navy/[0.03] border-y border-navy/10">
          <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
            <ScrollReveal>
              <div className="flex items-center gap-3 mb-3 justify-center">
                <span className="h-px w-8 bg-amber" aria-hidden="true" />
                <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">Our process</p>
                <span className="h-px w-8 bg-amber" aria-hidden="true" />
              </div>
              <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] mb-3 text-center text-balance">
                How we source {ind.industry.toLowerCase()} from China
              </h2>
              <p className="text-navy/60 text-center max-w-[640px] mx-auto mb-12">
                Five checkpoints — with compliance evidence confirmed at the factory, not the wharf.
              </p>
            </ScrollReveal>
            <div className="grid md:grid-cols-5 gap-5">
              {[
                { icon: ClipboardList, title: 'Submit your enquiry', body: 'Tell us your product, specification, and volume. We respond within 24 hours.' },
                { icon: ShieldCheck, title: 'Supplier verification', body: 'We authenticate the business licence and confirm a real manufacturer — not a middleman.' },
                { icon: Search, title: 'Factory audit', body: 'On the ground in China, we assess capability, quality systems, and standards understanding.' },
                { icon: FileCheck2, title: 'Compliance & inspection', body: 'We confirm Australian-standards evidence and inspect finished goods against your specification.' },
                { icon: PackageCheck, title: 'Ship with confidence', body: 'Goods clear to ship with verified compliance documentation — no border surprises.' },
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
                  Why importers trust us with {ind.industry.toLowerCase()}
                </h2>
                <p className="text-white/70 text-[15px] leading-relaxed max-w-[520px]">
                  Every factory we recommend has been physically vetted against a 12-point verification process — business licence, production capacity, quality systems, and compliance evidence. You buy direct and own the relationship.
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

        {/* ===================== Compliance standards + products ===================== */}
        <section className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <ScrollReveal>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <FileCheck2 size={20} className="text-amber" />
                  <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">
                    Compliance & standards
                  </p>
                </div>
                <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] leading-tight mb-5 text-balance">
                  What we verify against
                </h2>
                <p className="text-navy/70 leading-relaxed mb-5">{ind.standardsIntro}</p>
                <div className="border border-navy/10">
                  {ind.standards.map((s, i) => (
                    <div
                      key={s.code}
                      className={`flex items-start gap-4 px-5 py-3.5 ${i > 0 ? 'border-t border-navy/10' : ''}`}
                    >
                      <span className="font-semibold text-navy text-[13px] whitespace-nowrap min-w-[110px]">{s.code}</span>
                      <span className="text-navy/70 text-[14px] leading-snug">{s.name}</span>
                    </div>
                  ))}
                </div>
                <p className="text-navy/60 text-sm leading-relaxed mt-4">{ind.standardsNote}</p>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Boxes size={20} className="text-amber" />
                  <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">
                    What we source
                  </p>
                </div>
                <p className="text-navy/70 leading-relaxed mb-5">{ind.productsIntro}</p>
                <div className="flex flex-wrap gap-2 mb-10">
                  {ind.products.map((tag) => (
                    <span
                      key={tag}
                      className="text-[13px] text-navy/80 border border-navy/15 px-3 py-1.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Services cross-link */}
                <div className="bg-navy/[0.03] border border-navy/10 p-6">
                  <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em] mb-4">
                    How we help
                  </p>
                  <div className="flex flex-col gap-3">
                    {SERVICES.map((s) => (
                      <Link
                        key={s.href}
                        href={s.href}
                        className="group flex items-start gap-3 no-underline"
                      >
                        <s.icon size={20} className="text-amber flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-navy text-[14px] flex items-center gap-1.5">
                            {s.title}
                            <ArrowRight size={14} className="text-amber opacity-0 group-hover:opacity-100 transition-opacity" />
                          </p>
                          <p className="text-navy/60 text-[13px] leading-snug">{s.body}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ===================== FAQ ===================== */}
        <section className="bg-navy/[0.03] border-t border-navy/10">
          <div className="max-w-[900px] mx-auto px-6 py-16 md:py-20">
            <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] mb-10 text-center">
              {ind.industry} Sourcing FAQs
            </h2>
            <FAQ faqs={ind.faqs} hideHeading />
          </div>
        </section>

        {/* ===================== Closing CTA ===================== */}
        <section className="bg-navy text-white">
          <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Building2 size={20} className="text-amber" />
                <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">
                  Australia-based · {ind.industry}
                </p>
              </div>
              <h2 className="font-serif font-bold text-2xl md:text-[2.2rem] leading-tight mb-4">
                Source {ind.industry.toLowerCase()} with confidence
              </h2>
              <p className="text-white/80 text-lg leading-relaxed mb-6 max-w-md">
                Tell us your product, specification, and any compliance requirements. We&apos;ll scope the work on a free, no-obligation consult.
              </p>
              <ul className="flex flex-col gap-2.5">
                {[
                  'Supplier verification before you pay',
                  'On-site factory audits',
                  'Compliance & pre-shipment inspection',
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
