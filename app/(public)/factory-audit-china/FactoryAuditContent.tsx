'use client'

import Image from 'next/image'
import FAQ from '@/components/FAQ'
import ScrollReveal from '@/components/ScrollReveal'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import LeadForm from '@/components/LeadForm'
import SecondaryPathSupportNav from '@/components/SecondaryPathSupportNav'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ServiceSchema from '@/components/ServiceSchema'
import {
  Search, ShieldCheck, Building2, ClipboardCheck,
  Users, AlertTriangle, FileCheck2, Check,
} from 'lucide-react'
import { useT } from '@/i18n/useT'

const faqs = [
  {
    question: 'What is the difference between a factory audit and supplier verification?',
    answer:
      "Supplier verification confirms a company is real and legitimate — checking the unified social credit code, business license, and export history remotely. A factory audit is an on-site evaluation of the factory's production capability, quality management systems, equipment, workforce, and compliance. Most clients verify first, then audit only when they are ready to place a significant order.",
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
      "Yes — because we are based in China, we can visit any facility we can identify, not only the one your supplier declares. This is how we have uncovered cases where a supplier claimed to own a factory that was actually a subcontractor's plant. We include this as a standard check.",
  },
  {
    question: 'What does the free consult cover?',
    answer:
      'A no-obligation call to understand your product, the factory or factories you want evaluated, and the scope of audit (capability-only, or capability plus compliance), after which we scope the audit and send you a quote. The consult is free; the audit itself is a paid service.',
  },
]

// Bullet points in the "Why us" section have no i18n keys — kept as English literals
const whyUsBullets = [
  'On-site audit follows a six-step protocol: opening meeting, facility tour, documentation review, production sampling, confidential worker interviews, and closing briefing.',
  'Quality management systems are assessed against ISO 9001-aligned procedures — documented procedures, QC processes, machinery maintenance records, and raw-material storage practices.',
  'Social compliance screening covers worker age verification, wage-record sampling, working hours, and health-and-safety conditions (BSCI/SMETA-aligned).',
]

export default function FactoryAuditContent() {
  const t = useT()

  const heroBullets = [
    t('page.fa.heroBullet1'),
    t('page.fa.heroBullet2'),
    t('page.fa.heroBullet3'),
    t('page.fa.heroBullet4'),
  ]

  const stats = [
    { value: '1,200+', label: t('page.fa.statPrescreenedLabel') },
    { value: '4',      label: t('page.fa.statAuditDimensionsLabel') },
    { value: '80+',    label: t('page.fa.statFactoriesOnRecordLabel') },
    { value: '25+',    label: t('page.fa.statProvincesLabel') },
  ]

  const steps = [
    {
      icon: Building2,
      title: t('page.fa.step1Title'),
      body: t('page.fa.step1Body'),
    },
    {
      icon: ClipboardCheck,
      title: t('page.fa.step2Title'),
      body: t('page.fa.step2Body'),
    },
    {
      icon: Users,
      title: t('page.fa.step3Title'),
      body: t('page.fa.step3Body'),
    },
    {
      icon: ShieldCheck,
      title: t('page.fa.step4Title'),
      body: t('page.fa.step4Body'),
    },
  ]

  const tags = [
    t('page.fa.tag1'),
    t('page.fa.tag2'),
    t('page.fa.tag3'),
    t('page.fa.tag4'),
    t('page.fa.tag5'),
  ]

  function ConsultButton({ className = '' }: { className?: string }) {
    return (
      <a
        href="#book"
        className={`inline-flex items-center justify-center bg-amber text-navy font-semibold px-8 py-3.5 hover:translate-y-[-1px] transition-transform ${className}`}
      >
        {t('page.fa.consultButtonLabel')}
      </a>
    )
  }

  return (
    <>
      <ServiceSchema
        name="Factory Audit in China"
        serviceType="Factory Audit"
        url="https://www.winningadventure.com.au/factory-audit-china"
        areaServed={{ '@type': 'Country', name: 'Australia' }}
        description="Secondary-path on-site factory audit for Australian businesses: production capability, quality management, equipment, workforce, documentation, and social-compliance screening for an existing China factory."
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
            src="/factory-audit-hero.webp"
            alt=""
            fill
            priority
            unoptimized
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
                  {t('page.fa.heroEyebrow')}
                </p>
              </div>
              <h1 className="font-serif font-bold text-white text-[clamp(2.1rem,4.6vw,3.25rem)] leading-[1.06] mb-5">
                {t('page.fa.heroHeading')}
              </h1>
              <p className="text-white/80 text-lg leading-relaxed max-w-xl mb-7">
                {t('page.fa.heroBody')}
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
              <LeadForm id="book" cta={t('form.lead.cta.audit')} />
            </div>
          </div>
        </section>

        <SecondaryPathSupportNav currentPath="/factory-audit-china" />

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
                {t('page.fa.whyItMattersEyebrow')}
              </p>
            </div>
            <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] leading-tight mb-10 max-w-[760px] text-balance">
              {t('page.fa.whyItMattersHeading')}
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <ScrollReveal>
              <div className="border border-navy/10 p-6 h-full">
                <AlertTriangle size={26} className="text-amber mb-4" />
                <p className="font-serif font-bold text-navy text-2xl mb-2">{t('page.fa.riskCard1Heading')}</p>
                <p className="text-navy/70 text-[15px] leading-relaxed">
                  {t('page.fa.riskCard1Body')}
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <div className="border border-navy/10 p-6 h-full">
                <FileCheck2 size={26} className="text-amber mb-4" />
                <p className="font-serif font-bold text-navy text-2xl mb-2">{t('page.fa.riskCard2Heading')}</p>
                <p className="text-navy/70 text-[15px] leading-relaxed">
                  {t('page.fa.riskCard2Body')}
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <div className="border border-navy/10 p-6 h-full">
                <Search size={26} className="text-amber mb-4" />
                <p className="font-serif font-bold text-navy text-2xl mb-2">{t('page.fa.riskCard3Heading')}</p>
                <p className="text-navy/70 text-[15px] leading-relaxed">
                  {t('page.fa.riskCard3Body')}
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
                {t('page.fa.howItWorksHeading')}
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
                    {t('page.fa.whyUsEyebrow')}
                  </p>
                </div>
                <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] leading-tight mb-5 text-balance">
                  {t('page.fa.whyUsHeading')}
                </h2>
                <p className="text-navy/70 text-lg leading-relaxed mb-6">
                  {t('page.fa.whyUsBody')}
                </p>
                <ul className="flex flex-col gap-3">
                  {whyUsBullets.map((point) => (
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
                  {t('page.fa.whoShouldAuditHeading')}
                </p>
                <p className="text-white/75 leading-relaxed mb-6">
                  {t('page.fa.whoShouldAuditBody')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
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
              {t('page.fa.faqHeading')}
            </h2>
            <FAQ faqs={faqs} hideHeading />
          </div>
        </section>

        {/* ============================================ Closing conversion ============================================ */}
        <section className="bg-navy text-white">
          <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <h2 className="font-serif font-bold text-2xl md:text-[2.2rem] leading-tight mb-4">
                {t('page.fa.closingHeading')}
              </h2>
              <p className="text-white/80 text-lg leading-relaxed mb-6 max-w-md">
                {t('page.fa.closingBody')}
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
              <LeadForm cta={t('form.lead.cta.audit')} />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
