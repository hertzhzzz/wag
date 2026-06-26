// app/(public)/factory-audit-china/page.tsx
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { Metadata } from 'next'
import FAQ from '@/components/FAQ'
import ScrollReveal from '@/components/ScrollReveal'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import LeadForm from '@/components/LeadForm'
import {
  Search, ShieldCheck, Building2, ClipboardCheck,
  Users, AlertTriangle, FileCheck2, Check,
} from 'lucide-react'

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

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Factory Audit in China',
  serviceType: 'Factory Audit',
  provider: {
    '@type': 'Organization',
    name: 'Winning Adventure Global',
    url: 'https://www.winningadventure.com.au',
  },
  areaServed: { '@type': 'Country', name: 'Australia' },
  description:
    'On-site factory audit for Australian importers sourcing from China: production-capability assessment, ISO 9001-aligned quality management system review, equipment & workforce verification, documentation audit, and social compliance screening (BSCI/SMETA-aligned). Australia-based oversight, in-person in China.',
  priceRange: 'Quoted per project — free consult to scope',
}

const heroBullets = [
  'Production capacity & equipment verification',
  'Quality management system (ISO 9001-aligned) audit',
  'Documentation, certifications & export-history review',
  'Social & environmental compliance screening (BSCI/SMETA-aligned)',
]

const stats = [
  { value: '1,200+', label: 'Pre-screened factories' },
  { value: '4', label: 'Audit dimensions assessed' },
  { value: '160+', label: 'Factories on record since 2010' },
  { value: '25+', label: 'Provinces covered by our network' },
]

const steps = [
  {
    icon: Building2,
    title: 'Opening & Facility Tour',
    body: 'The audit begins with an opening meeting to confirm scope, followed by a structured walk-through of the entire facility — production lines, raw-material storage, warehousing, maintenance areas, and workforce stations. We photograph and document each section against the claims in your supplier\'s profile.',
  },
  {
    icon: ClipboardCheck,
    title: 'Documentation & Certification Review',
    body: 'We examine the supplier\'s quality management system documentation (ISO 9001-aligned procedures, SOPs, QC records), product certifications (CE, UL, CCC, RoHS as applicable), past audit reports from accredited firms (SGS, Bureau Veritas, Intertek, QIMA), and export transaction history — verifying that the paper trail matches real operations.',
  },
  {
    icon: Users,
    title: 'Production Capability & Workforce Assessment',
    body: 'We evaluate machinery condition, maintenance records, production throughput, shift structure, and workforce size against the supplier\'s stated capacity. A genuine manufacturer\'s production line profile differs measurably from a trading company reselling another plant\'s output — and we know the difference.',
  },
  {
    icon: ShieldCheck,
    title: 'Social & Environmental Compliance Screening',
    body: 'We conduct an initial screen against common buyer compliance frameworks: worker age verification, wage-record sampling, working-hours assessment, health-and-safety conditions, and environmental management (waste, emissions, chemical handling). Full BSCI or SMETA audits are referred to accredited third-party firms where required by your buyer code.',
  },
]

const faqs = [
  {
    question: 'What is the difference between a factory audit and supplier verification?',
    answer:
      'Supplier verification confirms a company is real and legitimate — checking the unified social credit code, business license, and export history remotely. A factory audit is an on-site evaluation of the factory\'s production capability, quality management systems, equipment, workforce, and compliance. Most clients verify first, then audit only when they are ready to place a significant order.',
  },
  {
    question: 'What certifications can a factory audit verify?',
    answer:
      'We check documented certifications including ISO 9001 (quality management), CE, UL, CCC, RoHS, FDA, and any retailer-specific buyer codes. For social-compliance frameworks such as BSCI, SMETA (Sedex), SA8000, or WRAP, we conduct an initial screening and refer full certification audits to accredited third-party firms.',
  },
  {
    question: 'How long does an on-site factory audit take?',
    answer:
      'A standard capability-and-compliance audit takes one full day on site. Extended audits covering social compliance or environmental management typically run one and a half to two days. We will confirm the scope and timeline in your free consult.',
  },
  {
    question: 'Can you audit a factory my supplier has not told me about?',
    answer:
      'Yes — because we are based in China, we can visit any facility we can identify, not only the one your supplier declares. This is how we have uncovered cases where a supplier claimed to own a factory that was actually a subcontractor\'s plant. We include this as a standard check.',
  },
  {
    question: 'What does the free consult cover?',
    answer:
      'A no-obligation call to understand your product, the factory or factories you want evaluated, and the scope of audit (capability-only, or capability plus compliance), after which we scope the audit and send you a quote. The consult is free; the audit itself is a paid service.',
  },
]

function ConsultButton({ className = '' }: { className?: string }) {
  return (
    <a
      href="#book"
      className={`inline-flex items-center justify-center bg-amber text-navy font-semibold px-8 py-3.5 hover:translate-y-[-1px] transition-transform ${className}`}
    >
      Book Free Consult
    </a>
  )
}

export default function FactoryAuditPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <Navbar />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://www.winningadventure.com.au' },
          { name: 'Services', url: 'https://www.winningadventure.com.au/services' },
          {
            name: 'Factory Audit',
            url: 'https://www.winningadventure.com.au/factory-audit-china',
          },
        ]}
      />

      <main>
        {/* ============================================ Hero + lead form ============================================ */}
        <section className="relative min-h-[60vh] md:min-h-[720px] flex items-center bg-navy overflow-hidden">
          <Image
            src="/factory-audit-hero.jpg"
            alt=""
            fill
            priority
            className="object-cover z-0"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-br from-navy/95 via-navy/75 to-navy/40 z-[1]"
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
                  On-site · Australia-managed
                </p>
              </div>
              <h1 className="font-serif font-bold text-white text-[clamp(2.1rem,4.6vw,3.25rem)] leading-[1.06] mb-5">
                Know Your Factory&apos;s Real Capability Before You Commit
              </h1>
              <p className="text-white/80 text-lg leading-relaxed max-w-xl mb-7">
                We walk the production floor, review quality systems, verify certifications, and screen compliance — then report back to you in Australia. Book a free consult and tell us your supplier.
              </p>
              <ul className="flex flex-col gap-2.5">
                {heroBullets.map((b) => (
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

        {/* ============================================ Trust stat strip ============================================ */}
        <section className="bg-white border-b border-navy/10">
          <div className="max-w-[1100px] mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-serif font-bold text-navy text-3xl md:text-4xl mb-1">{s.value}</p>
                <p className="text-navy/60 text-[13px] leading-snup">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================ Why it matters (risk) ============================================ */}
        <section className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-amber" aria-hidden="true" />
              <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">
                Why it matters
              </p>
            </div>
            <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] leading-tight mb-10 max-w-[760px] text-balance">
              A factory&apos;s sales pitch tells you what they want you to believe. An audit tells you what is true.
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <ScrollReveal>
              <div className="border border-navy/10 p-6 h-full">
                <AlertTriangle size={26} className="text-amber mb-4" />
                <p className="font-serif font-bold text-navy text-2xl mb-2">Suppliers evolve</p>
                <p className="text-navy/70 text-[15px] leading-relaxed">
                  Equipment ages, skilled workers leave, cost pressures mount. A factory that met every standard two years ago may have quietly slipped. On-site audit is the only way to know.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <div className="border border-navy/10 p-6 h-full">
                <FileCheck2 size={26} className="text-amber mb-4" />
                <p className="font-serif font-bold text-navy text-2xl mb-2">Real manufacturer vs middleman</p>
                <p className="text-navy/70 text-[15px] leading-relaxed">
                  Many suppliers who present as factories are intermediaries. The production line, workforce size, and equipment age tell a different story from the sales profile — but only if someone walks the floor.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <div className="border border-navy/10 p-6 h-full">
                <Search size={26} className="text-amber mb-4" />
                <p className="font-serif font-bold text-navy text-2xl mb-2">Buyer codes demand it</p>
                <p className="text-navy/70 text-[15px] leading-relaxed">
                  Major retailers and Australian regulators increasingly expect documented factory audits — especially for social compliance (BSCI, SMETA) and environmental management. A clean audit report is becoming a condition of supply.
                </p>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal>
            <div className="text-center">
              <ConsultButton />
            </div>
          </ScrollReveal>
        </section>

        {/* ============================================ How it works ============================================ */}
        <section className="bg-navy/[0.03] border-y border-navy/10">
          <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
            <ScrollReveal>
              <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] mb-12 text-center text-balance">
                How a Factory Audit Works
              </h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {steps.map((s, i) => (
                <ScrollReveal key={s.title}>
                  <div className="bg-white border border-navy/10 p-7 h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <s.icon size={26} className="text-amber" />
                      <span className="font-serif font-bold text-navy/25 text-2xl">0{i + 1}</span>
                    </div>
                    <h3 className="font-semibold text-navy text-lg mb-2">{s.title}</h3>
                    <p className="text-navy/70 text-[15px] leading-relaxed">{s.body}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
            <ScrollReveal>
              <div className="text-center">
                <ConsultButton />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ============================================ Data advantage (trust) ============================================ */}
        <section className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <ScrollReveal>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-px w-8 bg-amber" aria-hidden="true" />
                  <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">
                    Why us
                  </p>
                </div>
                <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] leading-tight mb-5 text-balance">
                  We benchmark every factory against real, comparable plants
                </h2>
                <p className="text-navy/70 text-lg leading-relaxed mb-6">
                  Our auditors have walked the floors of more than 1,200 Chinese factories across 25-plus provinces. When we assess a supplier&apos;s equipment, workforce, and quality systems, we measure them against the genuine spread of competing manufacturers — not against their own marketing materials.
                </p>
                <ul className="flex flex-col gap-3">
                  {[
                    'On-site audit follows a six-step protocol: opening meeting, facility tour, documentation review, production sampling, confidential worker interviews, and closing briefing.',
                    'Quality management systems are assessed against ISO 9001-aligned procedures — documented procedures, QC processes, machinery maintenance records, and raw-material storage practices.',
                    'Social compliance screening covers worker age verification, wage-record sampling, working hours, and health-and-safety conditions (BSCI/SMETA-aligned).',
                  ].map((point) => (
                    <li key={point} className="flex gap-3 text-navy/75 text-[15px] leading-relaxed">
                      <Check size={18} className="text-amber flex-shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div className="bg-navy text-white p-8 md:p-10">
                <Building2 size={34} className="text-amber mb-5" />
                <p className="font-serif font-bold text-2xl md:text-3xl mb-3 leading-snug">
                  Who should commission a factory audit?
                </p>
                <p className="text-white/75 leading-relaxed mb-6">
                  Most of our clients order a factory audit when they are evaluating a new supplier for a significant order, revalidating an existing supplier whose quality has drifted, or meeting a buyer code that requires documented due diligence.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'New supplier onboarding',
                    'Annual revalidation',
                    'Buyer code compliance',
                    'Pre-order capability check',
                    'Trading company vetting',
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="text-[13px] text-white/85 border border-white/20 px-3 py-1.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ============================================ FAQ ============================================ */}
        <section className="bg-navy/[0.03] border-t border-navy/10">
          <div className="max-w-[900px] mx-auto px-6 py-16 md:py-20">
            <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] mb-10 text-center">
              Factory Audit FAQs
            </h2>
            <FAQ faqs={faqs} hideHeading />
          </div>
        </section>

        {/* ============================================ Closing conversion ============================================ */}
        <section className="bg-navy text-white">
          <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <h2 className="font-serif font-bold text-2xl md:text-[2.2rem] leading-tight mb-4">
                Audit your supplier before you scale
              </h2>
              <p className="text-white/80 text-lg leading-relaxed mb-6 max-w-md">
                Tell us your product, target factory, and any buyer-code requirements. We&apos;ll scope the audit on a free, no-obligation consult.
              </p>
              <ul className="flex flex-col gap-2.5">
                {heroBullets.map((b) => (
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
