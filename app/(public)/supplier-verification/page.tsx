// app/(public)/supplier-verification/page.tsx
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
  MapPin, AlertTriangle, FileCheck2, Boxes, Check,
} from 'lucide-react'

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

const heroBullets = [
  'Business-license & identity authentication',
  'Capability and export-history audit',
  'Pre-shipment quality inspection',
]

// 工厂库真实聚合统计 — 来源 CMS super-factories.db（仅聚合，不暴露单个企业敏感字段）
const stats = [
  { value: '1,200+', label: 'Pre-screened factories' },
  { value: '25+', label: 'Provinces covered' },
  { value: '1,000+', label: 'Verified business licenses' },
  { value: '180+', label: 'Audited super factories' },
]

const steps = [
  {
    icon: Building2,
    title: 'License & Identity Authentication',
    body: 'We confirm the unified social credit code (the SAMR-issued business license number), legal status, and registered business scope — so you know the company you are paying actually exists and is allowed to do what it claims.',
  },
  {
    icon: ClipboardCheck,
    title: 'Capability & Export-History Audit',
    body: 'We assess equipment, workforce, certifications, and verified export history, then benchmark the supplier against comparable factories in our database — separating real manufacturers from trading companies.',
  },
  {
    icon: ShieldCheck,
    title: 'Pre-Shipment Quality Inspection',
    body: 'Before the balance of your money leaves Australia, we inspect goods against your specification on the factory floor and deliver a documented report you can act on.',
  },
]

const verificationFaqs = [
  {
    question: 'Do I need to travel to China for supplier verification?',
    answer:
      'No. This is a fully remote, Australia-based service. We verify suppliers on the ground in China on your behalf and report back to you in Australia, so you can make decisions without booking a flight.',
  },
  {
    question: 'How is this different from a factory tour?',
    answer:
      'A factory tour takes you to China to meet suppliers in person. Supplier verification is remote — we do the on-the-ground checking for you and deliver a written report. Many clients verify remotely first, then travel only if they decide to proceed.',
  },
  {
    question: 'What is a unified social credit code, and why does it matter?',
    answer:
      'It is the 18-character registration number on every legitimate Chinese company’s business license, issued through China’s State Administration for Market Regulation (SAMR). Confirming it is the first step in proving a supplier is a real, registered entity rather than a shell or an impersonator.',
  },
  {
    question: 'How do you tell a real factory from a trading company?',
    answer:
      'We cross-check the registered business scope, production equipment, workforce, and export records against the supplier’s claims and against comparable plants in our database. A trading company reselling another factory’s output shows a different profile from a manufacturer that owns the production line.',
  },
  {
    question: 'What does the free consult cover?',
    answer:
      'A no-obligation call to understand your product, your target supplier, and your risk, after which we scope a verification and send you a quote. The consult is free; the verification itself is a paid service that begins with a deposit.',
  },
  {
    question: 'How many factories can you benchmark against?',
    answer:
      'We maintain a database of more than 1,200 pre-screened Chinese factories across 25-plus provinces, which we use to benchmark and shortlist suppliers for your specific product.',
  },
]

// 中部/收尾通用 CTA 按钮（锚点回 hero 表单）
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

export default function SupplierVerificationPage() {
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
            name: 'Supplier Verification',
            url: 'https://www.winningadventure.com.au/supplier-verification',
          },
        ]}
      />

      <main>
        {/* ============================================ Hero + lead form ============================================ */}
        <section className="relative min-h-[60vh] md:min-h-[720px] flex items-center bg-navy overflow-hidden">
          <Image
            src="/supplier-verification/hero.webp"
            alt=""
            fill
            priority
            className="object-cover z-0"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-br from-navy/90 via-navy/80 to-navy/70 z-[1]"
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
                  Remote · Australia-based
                </p>
              </div>
              <h1 className="font-serif font-bold text-white text-[clamp(2.1rem,4.6vw,3.25rem)] leading-[1.06] mb-5">
                Know Your Chinese Supplier Before You Pay a Deposit
              </h1>
              <p className="text-white/80 text-lg leading-relaxed max-w-xl mb-7">
                We authenticate business licenses, audit capability, and inspect quality on the
                ground in China — and report back to you in Australia. Book a free consult and tell
                us your supplier.
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
                <p className="text-navy/60 text-[13px] leading-snug">{s.label}</p>
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
            <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] leading-tight mb-10 max-w-[760px]">
              A deposit wired to the wrong supplier is the hardest money to get back
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <ScrollReveal>
              <div className="border border-navy/10 p-6 h-full">
                <AlertTriangle size={26} className="text-amber mb-4" />
                <p className="font-serif font-bold text-navy text-2xl mb-2">A$227 million</p>
                <p className="text-navy/70 text-[15px] leading-relaxed">
                  Lost by Australian businesses to payment-redirection scams in a single year — small
                  and micro businesses were hit hardest.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <div className="border border-navy/10 p-6 h-full">
                <FileCheck2 size={26} className="text-amber mb-4" />
                <p className="font-serif font-bold text-navy text-2xl mb-2">Maker vs middleman</p>
                <p className="text-navy/70 text-[15px] leading-relaxed">
                  Many &quot;factories&quot; online are intermediaries reselling another plant&apos;s
                  output. Verifying the license and capability is how you tell them apart.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <div className="border border-navy/10 p-6 h-full">
                <Boxes size={26} className="text-amber mb-4" />
                <p className="font-serif font-bold text-navy text-2xl mb-2">China is #1</p>
                <p className="text-navy/70 text-[15px] leading-relaxed">
                  China is Australia&apos;s largest source of imports — A$130 billion in goods a
                  year. At that scale, due diligence is not optional.
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
              <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] mb-12 text-center">
                How Verification Works
              </h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
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
                <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] leading-tight mb-5">
                  Every check is measured against real, comparable factories
                </h2>
                <p className="text-navy/70 text-lg leading-relaxed mb-6">
                  We maintain a proprietary database of more than 1,200 pre-screened Chinese
                  factories. So when a supplier makes a claim, we test it against the genuine spread
                  of plants making the same product — not against their own sales pitch.
                </p>
                <ul className="flex flex-col gap-3">
                  {[
                    'More than 70% of our verified factories cluster in Guangdong and Zhejiang.',
                    'Over 1,000 carry a verified unified social credit code.',
                    '160-plus were established before 2010 — a signal of operating longevity.',
                  ].map((point) => (
                    <li key={point} className="flex gap-3 text-navy/75 text-[15px] leading-relaxed">
                      <MapPin size={18} className="text-amber flex-shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div className="bg-navy text-white p-8 md:p-10">
                <Search size={34} className="text-amber mb-5" />
                <p className="font-serif font-bold text-2xl md:text-3xl mb-3 leading-snug">
                  Built for what Australia actually imports
                </p>
                <p className="text-white/75 leading-relaxed mb-6">
                  Our factory coverage is concentrated in the categories Australia buys most from
                  China — so verification is grounded in the products you are most likely sourcing.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Electronics', 'Machinery', 'Vehicles & Parts', 'Furniture & Lighting', 'Apparel'].map(
                    (tag) => (
                      <span
                        key={tag}
                        className="text-[13px] text-white/85 border border-white/20 px-3 py-1.5"
                      >
                        {tag}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ============================================ FAQ ============================================ */}
        <section className="bg-navy/[0.03] border-t border-navy/10">
          <div className="max-w-[900px] mx-auto px-6 py-16 md:py-20">
            <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] mb-10 text-center">
              Supplier Verification FAQs
            </h2>
            <FAQ faqs={verificationFaqs} hideHeading />
          </div>
        </section>

        {/* ============================================ Closing conversion ============================================ */}
        <section className="bg-navy text-white">
          <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <h2 className="font-serif font-bold text-2xl md:text-[2.2rem] leading-tight mb-4">
                Verify your supplier before you commit
              </h2>
              <p className="text-white/80 text-lg leading-relaxed mb-6 max-w-md">
                Tell us your product and target supplier. We&apos;ll scope a verification on a free,
                no-obligation consult.
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
