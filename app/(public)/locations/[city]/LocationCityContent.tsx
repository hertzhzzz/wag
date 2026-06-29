'use client'
// app/(public)/locations/[city]/LocationCityContent.tsx
import Image from 'next/image'
import Link from 'next/link'
import FAQ from '@/components/FAQ'
import ScrollReveal from '@/components/ScrollReveal'
import LeadForm from '@/components/LeadForm'
import { useT } from '@/i18n/useT'
import {
  Ship, ShieldCheck, ClipboardCheck, Boxes,
  MapPin, Building2, Check, ArrowRight,
  ClipboardList, Search, PackageCheck, Anchor, Star,
} from 'lucide-react'

// Shape mirrors what getLocation() returns — only the fields used in JSX
export interface LocationData {
  city: string
  slug: string
  stateAbbr: string
  state: string
  portName: string
  transitSummary: string
  heroTagline: string
  heroHeading: string
  heroIntro: string
  stats: { value: string; label: string }[]
  whyHeading: string
  whyBody: string
  localPoints: string[]
  transitRows: { route: string; days: string }[]
  transitNote: string
  industriesIntro: string
  industries: string[]
  caseStudy?: {
    tag: string
    title: string
    kpis: string[]
    challenge: string
    approach: string
    outcome: string
  }
  faqs: { question: string; answer: string }[]
}

interface Props {
  loc: LocationData
}

export default function LocationCityContent({ loc }: Props) {
  const t = useT()

  // Helper: replace {city} / {portName} / {transitSummary} placeholders
  const r = (key: Parameters<typeof t>[0], vars: Record<string, string> = {}) => {
    let s = t(key)
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(`{${k}}`, v)
    }
    return s
  }

  const SERVICES = [
    {
      href: '/supplier-verification',
      icon: ShieldCheck,
      title: t('page.loc.serviceSupplierVerificationTitle'),
      body: t('page.loc.serviceSupplierVerificationBody'),
    },
    {
      href: '/factory-audit-china',
      icon: ClipboardCheck,
      title: t('page.loc.serviceFactoryAuditTitle'),
      body: t('page.loc.serviceFactoryAuditBody'),
    },
    {
      href: '/quality-inspection-china',
      icon: Boxes,
      title: t('page.loc.serviceQualityInspectionTitle'),
      body: t('page.loc.serviceQualityInspectionBody'),
    },
  ]

  return (
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
                t('page.loc.heroBullet1'),
                t('page.loc.heroBullet2'),
                t('page.loc.heroBullet3'),
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
              {r('page.loc.localImportersLabel', { city: loc.city })}
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

      {/* ===================== Process ===================== */}
      <section className="bg-navy/[0.03] border-y border-navy/10">
        <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-3 justify-center">
              <span className="h-px w-8 bg-amber" aria-hidden="true" />
              <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">
                {t('page.loc.processLabel')}
              </p>
              <span className="h-px w-8 bg-amber" aria-hidden="true" />
            </div>
            <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] mb-3 text-center text-balance">
              {r('page.loc.processHeading', { city: loc.city })}
            </h2>
            <p className="text-navy/60 text-center max-w-[640px] mx-auto mb-12">
              {r('page.loc.processSubheading', { portName: loc.portName })}
            </p>
          </ScrollReveal>
          <div className="grid md:grid-cols-5 gap-5">
            {[
              { icon: ClipboardList, title: t('page.loc.processStep1Title'), body: t('page.loc.processStep1Body') },
              { icon: ShieldCheck,   title: t('page.loc.processStep2Title'), body: t('page.loc.processStep2Body') },
              { icon: Search,        title: t('page.loc.processStep3Title'), body: t('page.loc.processStep3Body') },
              { icon: PackageCheck,  title: t('page.loc.processStep4Title'), body: t('page.loc.processStep4Body') },
              {
                icon: Anchor,
                title: r('page.loc.processStep5Title', { city: loc.city }),
                body: r('page.loc.processStep5Body', { portName: loc.portName, transitSummary: loc.transitSummary }),
              },
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
                {r('page.loc.credibilityHeading', { city: loc.city })}
              </h2>
              <p className="text-white/70 text-[15px] leading-relaxed max-w-[520px]">
                {t('page.loc.credibilityBody')}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-10 gap-y-6 flex-shrink-0">
              {[
                { value: '120+', label: t('page.loc.credibilityStat1Label') },
                { value: '50+',  label: t('page.loc.credibilityStat2Label') },
                { value: '12-point', label: t('page.loc.credibilityStat3Label') },
                { value: '24hr', label: t('page.loc.credibilityStat4Label') },
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

      {/* ===================== Services ===================== */}
      <section className="bg-white">
        <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <ScrollReveal>
            <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] mb-3 text-center text-balance">
              {r('page.loc.servicesHeading', { city: loc.city })}
            </h2>
            <p className="text-navy/60 text-center max-w-[640px] mx-auto mb-12">
              {t('page.loc.servicesSubheading')}
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

      {/* ===================== Local logistics ===================== */}
      <section className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <ScrollReveal>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Ship size={20} className="text-amber" />
                <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">
                  {r('page.loc.shippingLabel', { city: loc.city })}
                </p>
              </div>
              <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] leading-tight mb-5 text-balance">
                {r('page.loc.shippingHeading', { portName: loc.portName })}
              </h2>
              <div className="border border-navy/10">
                {loc.transitRows.map((row, i) => (
                  <div
                    key={row.route}
                    className={`flex items-center justify-between px-5 py-3.5 ${i > 0 ? 'border-t border-navy/10' : ''}`}
                  >
                    <span className="text-navy/75 text-[15px]">{row.route}</span>
                    <span className="font-semibold text-navy text-[15px]">{row.days}</span>
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
                  {r('page.loc.importsLabel', { city: loc.city })}
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

      {/* ===================== Case study ===================== */}
      {loc.caseStudy && (
        <section className="bg-navy/[0.03] border-t border-navy/10">
          <div className="max-w-[1000px] mx-auto px-6 py-16 md:py-20">
            <ScrollReveal>
              <div className="flex items-center gap-2 mb-5">
                <span className="h-px flex-1 bg-navy/10" aria-hidden="true" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-navy/40">
                  {r('page.loc.caseStudySectionLabel', { city: loc.city })}
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
                { label: t('page.loc.caseStudyChallenge'), body: loc.caseStudy.challenge },
                { label: t('page.loc.caseStudyApproach'),  body: loc.caseStudy.approach },
                { label: t('page.loc.caseStudyOutcome'),   body: loc.caseStudy.outcome },
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
              {t('page.loc.caseStudyDisclaimer')}
            </p>
          </div>
        </section>
      )}

      {/* ===================== FAQ ===================== */}
      <section className="bg-white border-t border-navy/10">
        <div className="max-w-[900px] mx-auto px-6 py-16 md:py-20">
          <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] mb-10 text-center">
            {r('page.loc.faqHeading', { city: loc.city })}
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
                {r('page.loc.ctaServingLabel', { city: loc.city })}
              </p>
            </div>
            <h2 className="font-serif font-bold text-2xl md:text-[2.2rem] leading-tight mb-4">
              {t('page.loc.ctaHeading')}
            </h2>
            <p className="text-white/80 text-lg leading-relaxed mb-6 max-w-md">
              {t('page.loc.ctaBody')}
            </p>
            <ul className="flex flex-col gap-2.5">
              {[
                t('page.loc.ctaBullet1'),
                t('page.loc.ctaBullet2'),
                t('page.loc.ctaBullet3'),
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
  )
}
