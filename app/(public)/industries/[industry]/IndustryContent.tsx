'use client'
// app/(public)/industries/[industry]/IndustryContent.tsx
import Image from 'next/image'
import Link from 'next/link'
import FAQ from '@/components/FAQ'
import ScrollReveal from '@/components/ScrollReveal'
import LeadForm from '@/components/LeadForm'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useT } from '@/i18n/useT'
import { trackInternalLink } from '@/lib/analytics'
import {
  ShieldCheck, ClipboardCheck, Boxes, AlertTriangle,
  Building2, Check, ArrowRight, ClipboardList, Search, PackageCheck, FileCheck2,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface IndStat {
  value: string
  label: string
}

export interface IndStandard {
  code: string
  name: string
}

export interface IndFaq {
  question: string
  answer: string
}

export interface IndustryData {
  slug: string
  industry: string
  navLabel: string
  heroTagline: string
  heroHeading: string
  heroIntro: string
  stats: IndStat[]
  whyHeading: string
  whyBody: string
  riskPoints: string[]
  standardsIntro: string
  standards: IndStandard[]
  standardsNote: string
  productsIntro: string
  products: string[]
  faqs: IndFaq[]
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export default function IndustryContent({ ind }: { ind: IndustryData }) {
  const t = useT()

  const industryName = ind.industry.toLowerCase()

  const SERVICES = [
    {
      href: '/supplier-verification',
      icon: ShieldCheck,
      title: t('page.ind.serviceSupplierVerificationTitle'),
      body: t('page.ind.serviceSupplierVerificationBody'),
    },
    {
      href: '/factory-audit-china',
      icon: ClipboardCheck,
      title: t('page.ind.serviceFactoryAuditTitle'),
      body: t('page.ind.serviceFactoryAuditBody'),
    },
    {
      href: '/quality-inspection-china',
      icon: Boxes,
      title: t('page.ind.serviceQualityInspectionTitle'),
      body: t('page.ind.serviceQualityInspectionBody'),
    },
  ]

  const PROCESS_STEPS = [
    { icon: ClipboardList, title: t('page.ind.processStep1Title'), body: t('page.ind.processStep1Body') },
    { icon: ShieldCheck,   title: t('page.ind.processStep2Title'), body: t('page.ind.processStep2Body') },
    { icon: Search,        title: t('page.ind.processStep3Title'), body: t('page.ind.processStep3Body') },
    { icon: FileCheck2,    title: t('page.ind.processStep4Title'), body: t('page.ind.processStep4Body') },
    { icon: PackageCheck,  title: t('page.ind.processStep5Title'), body: t('page.ind.processStep5Body') },
  ]

  const CREDIBILITY_STATS = [
    { value: '120+', label: t('page.ind.credibilityStat1Label') },
    { value: '50+',  label: t('page.ind.credibilityStat2Label') },
    { value: '12-point', label: t('page.ind.credibilityStat3Label') },
    { value: '24hr', label: t('page.ind.credibilityStat4Label') },
  ]

  return (
    <>
      <Navbar />

      <main>
        {/* ===================== Hero ===================== */}
        <section className="relative min-h-[60vh] md:min-h-[680px] flex items-center bg-navy overflow-hidden">
          <Image
            src={`/industry-${ind.slug}.webp`}
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
                  t('page.ind.heroBullet1'),
                  t('page.ind.heroBullet2'),
                  t('page.ind.heroBullet3'),
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
                {t('page.ind.whyItMattersSectionLabel')}
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
                <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">
                  {t('page.ind.ourProcessSectionLabel')}
                </p>
                <span className="h-px w-8 bg-amber" aria-hidden="true" />
              </div>
              <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] mb-3 text-center text-balance">
                {t('page.ind.processHeading').replace('{industry}', industryName)}
              </h2>
              <p className="text-navy/60 text-center max-w-[640px] mx-auto mb-12">
                {t('page.ind.processSubheading')}
              </p>
            </ScrollReveal>
            <div className="grid md:grid-cols-5 gap-5">
              {PROCESS_STEPS.map((s, i) => (
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
                  {t('page.ind.credibilityHeading').replace('{industry}', industryName)}
                </h2>
                <p className="text-white/70 text-[15px] leading-relaxed max-w-[520px]">
                  {t('page.ind.credibilityBody')}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-10 gap-y-6 flex-shrink-0">
                {CREDIBILITY_STATS.map((s) => (
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
                    {t('page.ind.complianceSectionLabel')}
                  </p>
                </div>
                <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] leading-tight mb-5 text-balance">
                  {t('page.ind.complianceHeading')}
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
                    {t('page.ind.whatWeSourceSectionLabel')}
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
                    {t('page.ind.howWeHelpSectionLabel')}
                  </p>
                  <div className="flex flex-col gap-3">
                    {SERVICES.map((s) => (
                      <Link
                        key={s.href}
                        href={s.href}
                        className="group flex items-start gap-3 no-underline"
                        onClick={() => trackInternalLink(typeof window !== 'undefined' ? window.location.pathname : '', s.href, s.title)}
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
              {t('page.ind.faqHeading').replace('{industry}', ind.industry)}
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
                  {t('page.ind.ctaSectionLabel').replace('{industry}', ind.industry)}
                </p>
              </div>
              <h2 className="font-serif font-bold text-2xl md:text-[2.2rem] leading-tight mb-4">
                {t('page.ind.ctaHeading').replace('{industry}', industryName)}
              </h2>
              <p className="text-white/80 text-lg leading-relaxed mb-6 max-w-md">
                {t('page.ind.ctaBody')}
              </p>
              <ul className="flex flex-col gap-2.5">
                {[
                  t('page.ind.ctaBullet1'),
                  t('page.ind.ctaBullet2'),
                  t('page.ind.ctaBullet3'),
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
