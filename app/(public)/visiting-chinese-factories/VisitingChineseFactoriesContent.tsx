'use client'
import { useT } from '@/i18n/useT'
import Image from 'next/image'
import { Search, ShieldCheck, Building2, ClipboardCheck, MapPin, AlertTriangle, Check, Camera, Users, Factory, Award, Quote } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FAQ from '@/components/FAQ'
import ScrollReveal from '@/components/ScrollReveal'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import LeadForm from '@/components/LeadForm'

// SEO content — FAQ entries kept in English, not translated. Answers drawn from
// Winning Adventure Global's own factory-visit checklist and field experience.
const visitFaqs = [
  {
    question: 'Do I need a visa to visit factories in China as an Australian?',
    answer:
      'For most Australian passport holders a business (M) or tourist (L) visa is required, arranged before you fly; check the current rules with the Chinese embassy as short-stay and transit exemptions change. We help you time the trip around visa processing so your factory meetings are confirmed before you book flights.',
  },
  {
    question: 'Which city should I visit for my product?',
    answer:
      'It depends on your category. Shenzhen and Dongguan lead electronics, consumer tech and moulding; Guangzhou for furniture, garments and textiles; Hangzhou and Ningbo for e-commerce goods, homewares and solar; Shanghai and Suzhou for automotive, precision engineering and cosmetics; Yiwu for general consumer goods and wholesale. We match your product to the right cluster before we plan a single meeting.',
  },
  {
    question: 'Can you shortlist and verify factories before I commit to flying?',
    answer:
      'Yes. We pre-screen candidates against our database of 1,200-plus factories — confirming the business licence via SAMR, checking business scope, capability and export history — so your travel days are spent only on plants genuinely worth seeing. Many clients verify remotely first, then travel to close.',
  },
  {
    question: 'What actually happens during the on-site visit?',
    answer:
      'We walk the entire facility with you — not just the path the factory wants to show. We check whether the line is actually running, whether capacity matches the quote, whether there is a real QC process, and whether the owner can explain their own production step by step. We ask the ten questions that matter on the floor, photograph running lines and equipment nameplates, and document everything with timestamps.',
  },
  {
    question: 'What red flags do you look for on the factory floor?',
    answer:
      'A line switched off during a scheduled visit; equipment that does not match the claimed capacity; samples that differ from the photos; no visible quality control; pressure to sign before you leave; an owner who cannot explain the process step by step; and a quoted price well below market. Any one of these is a reason to slow down before a deposit.',
  },
  {
    question: 'How do you handle the language barrier and negotiation?',
    answer:
      'A bilingual guide is with you for every meeting, translating not just the words but the context — what a vague answer really means and which point to press. After the visit we help you review notes, request a formal quotation, and negotiate payment terms and QC arrangements before any balance leaves Australia.',
  },
  {
    question: 'What payment terms are normal, and how do you protect the deposit?',
    answer:
      'A 30% deposit with the balance against inspection or shipping documents is common, but terms vary by factory and order value. We help you structure milestones tied to verified production and pre-shipment inspection, so money is released against evidence rather than promises.',
  },
]

export default function VisitingChineseFactoriesContent() {
  const t = useT()

  const heroBullets = [
    t('page.fv.heroBullet1'),
    t('page.fv.heroBullet2'),
    t('page.fv.heroBullet3'),
  ]

  const credStats = [
    { value: '200+', label: t('page.fv.credStat1Label') },
    { value: '8 yrs', label: t('page.fv.credStat2Label') },
    { value: '200+', label: t('page.fv.credStat3Label') },
  ]

  const steps = [
    { icon: Building2, title: t('page.fv.step1Title'), body: t('page.fv.step1Body') },
    { icon: MapPin, title: t('page.fv.step2Title'), body: t('page.fv.step2Body') },
    { icon: ClipboardCheck, title: t('page.fv.step3Title'), body: t('page.fv.step3Body') },
  ]

  const regions = [
    { name: t('page.fv.region1Name'), meta: t('page.fv.region1Meta'), best: t('page.fv.region1Best'), why: t('page.fv.region1Why') },
    { name: t('page.fv.region2Name'), meta: t('page.fv.region2Meta'), best: t('page.fv.region2Best'), why: t('page.fv.region2Why') },
    { name: t('page.fv.region3Name'), meta: t('page.fv.region3Meta'), best: t('page.fv.region3Best'), why: t('page.fv.region3Why') },
    { name: t('page.fv.region4Name'), meta: t('page.fv.region4Meta'), best: t('page.fv.region4Best'), why: t('page.fv.region4Why') },
    { name: t('page.fv.region5Name'), meta: t('page.fv.region5Meta'), best: t('page.fv.region5Best'), why: t('page.fv.region5Why') },
  ]

  const floorChecks = [
    { icon: Factory, title: t('page.fv.floor1Title'), body: t('page.fv.floor1Body') },
    { icon: ClipboardCheck, title: t('page.fv.floor2Title'), body: t('page.fv.floor2Body') },
    { icon: ShieldCheck, title: t('page.fv.floor3Title'), body: t('page.fv.floor3Body') },
    { icon: Search, title: t('page.fv.floor4Title'), body: t('page.fv.floor4Body') },
    { icon: Building2, title: t('page.fv.floor5Title'), body: t('page.fv.floor5Body') },
    { icon: Camera, title: t('page.fv.floor6Title'), body: t('page.fv.floor6Body') },
  ]

  const dataPoints = [
    t('page.fv.dataPoint1'),
    t('page.fv.dataPoint2'),
    t('page.fv.dataPoint3'),
  ]

  const categories = [
    t('page.fv.categoryElectronics'),
    t('page.fv.categoryMachinery'),
    t('page.fv.categoryVehicles'),
    t('page.fv.categoryFurniture'),
    t('page.fv.categoryApparel'),
  ]

  function ConsultButton({ className = '' }: { className?: string }) {
    return (
      <a
        href="#book"
        className={`inline-flex items-center justify-center bg-amber text-navy font-semibold px-8 py-3.5 hover:translate-y-[-1px] transition-transform ${className}`}
      >
        {t('page.fv.consultButtonLabel')}
      </a>
    )
  }

  return (
    <>
      <Navbar />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://www.winningadventure.com.au' },
          { name: 'Services', url: 'https://www.winningadventure.com.au/services' },
          {
            name: 'Factory Tours & Visits',
            url: 'https://www.winningadventure.com.au/visiting-chinese-factories',
          },
        ]}
      />

      <main>
        {/* ============================================ Hero + lead form ============================================ */}
        <section className="relative min-h-[60vh] md:min-h-[720px] flex items-center bg-navy overflow-hidden">
          <Image
            src="/visiting-chinese-factories/hero.webp"
            alt=""
            fill
            priority
            unoptimized
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
                  {t('page.fv.heroBadge')}
                </p>
              </div>
              <h1 className="font-serif font-bold text-white text-[clamp(2.1rem,4.6vw,3.25rem)] leading-[1.06] mb-5">
                {t('page.fv.heroHeading')}
              </h1>
              <p className="text-white/80 text-lg leading-relaxed max-w-xl mb-7">
                {t('page.fv.heroSubcopy')}
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
              <LeadForm id="book" cta={t('form.lead.cta.factoryVisit')} />
            </div>
          </div>
        </section>

        {/* ============================================ Author / experience credibility ============================================ */}
        <section className="bg-white border-b border-navy/10">
          <div className="max-w-[1100px] mx-auto px-6 py-12 md:py-14 grid md:grid-cols-[1fr_auto] gap-8 md:gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-amber" aria-hidden="true" />
                <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">
                  {t('page.fv.authorEyebrow')}
                </p>
              </div>
              <p className="font-serif font-bold text-navy text-xl md:text-2xl leading-snug mb-3">
                {t('page.fv.authorName')} — <span className="text-navy/60 font-normal">{t('page.fv.authorRole')}</span>
              </p>
              <p className="text-navy/70 text-[15px] md:text-base leading-relaxed max-w-2xl">
                {t('page.fv.authorBio')}
              </p>
            </div>
            <div className="flex md:flex-col gap-6 md:gap-4 md:border-l md:border-navy/10 md:pl-10">
              {credStats.map((s) => (
                <div key={s.label} className="md:text-right">
                  <p className="font-serif font-bold text-navy text-2xl md:text-3xl leading-none mb-1">{s.value}</p>
                  <p className="text-navy/55 text-[12px] leading-snug max-w-[130px] md:ml-auto">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================ Why visit in person ============================================ */}
        <section className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-amber" aria-hidden="true" />
              <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">
                {t('page.fv.whyItMattersBadge')}
              </p>
            </div>
            <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] leading-tight mb-10 max-w-[760px] text-balance">
              {t('page.fv.whyItMattersHeading')}
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <ScrollReveal>
              <div className="border border-navy/10 p-6 h-full">
                <AlertTriangle size={26} className="text-amber mb-4" />
                <p className="font-serif font-bold text-navy text-xl mb-2">{t('page.fv.riskStat1Heading')}</p>
                <p className="text-navy/70 text-[15px] leading-relaxed">
                  {t('page.fv.riskStat1Body')}
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <div className="border border-navy/10 p-6 h-full">
                <Users size={26} className="text-amber mb-4" />
                <p className="font-serif font-bold text-navy text-xl mb-2">{t('page.fv.riskStat2Heading')}</p>
                <p className="text-navy/70 text-[15px] leading-relaxed">
                  {t('page.fv.riskStat2Body')}
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <div className="border border-navy/10 p-6 h-full">
                <Award size={26} className="text-amber mb-4" />
                <p className="font-serif font-bold text-navy text-xl mb-2">{t('page.fv.riskStat3Heading')}</p>
                <p className="text-navy/70 text-[15px] leading-relaxed">
                  {t('page.fv.riskStat3Body')}
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

        {/* ============================================ How a guided visit works ============================================ */}
        <section className="bg-navy/[0.03] border-y border-navy/10">
          <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
            <ScrollReveal>
              <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] mb-12 text-center text-balance">
                {t('page.fv.howItWorksHeading')}
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

        {/* ============================================ Where we take you (regional clusters) ============================================ */}
        <section className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-amber" aria-hidden="true" />
              <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">
                {t('page.fv.regionsBadge')}
              </p>
            </div>
            <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] leading-tight mb-3 max-w-[760px] text-balance">
              {t('page.fv.regionsHeading')}
            </h2>
            <p className="text-navy/70 text-lg leading-relaxed mb-10 max-w-[720px]">
              {t('page.fv.regionsIntro')}
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-5">
            {regions.map((r) => (
              <ScrollReveal key={r.name}>
                <div className="border border-navy/10 p-6 h-full flex gap-4">
                  <MapPin size={22} className="text-amber flex-shrink-0 mt-1" />
                  <div>
                    <div className="flex items-baseline gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-navy text-lg leading-snug">{r.name}</h3>
                      <span className="text-navy/40 text-[12px] uppercase tracking-wide">{r.meta}</span>
                    </div>
                    <p className="text-navy text-[14px] font-medium mb-1.5">{r.best}</p>
                    <p className="text-navy/65 text-[14px] leading-relaxed">{r.why}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ============================================ What we check on the floor ============================================ */}
        <section className="bg-navy/[0.03] border-y border-navy/10">
          <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
            <ScrollReveal>
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-amber" aria-hidden="true" />
                <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">
                  {t('page.fv.floorBadge')}
                </p>
              </div>
              <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] leading-tight mb-3 max-w-[760px] text-balance">
                {t('page.fv.floorHeading')}
              </h2>
              <p className="text-navy/70 text-lg leading-relaxed mb-10 max-w-[720px]">
                {t('page.fv.floorIntro')}
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {floorChecks.map((c) => (
                <ScrollReveal key={c.title}>
                  <div className="bg-white border border-navy/10 p-6 h-full">
                    <c.icon size={24} className="text-amber mb-3" />
                    <h3 className="font-semibold text-navy text-[15px] mb-2 leading-snug">{c.title}</h3>
                    <p className="text-navy/65 text-[14px] leading-relaxed">{c.body}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================ Field story (experience) ============================================ */}
        <section className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <ScrollReveal>
            <div className="bg-navy text-white p-8 md:p-12">
              <Quote size={36} className="text-amber mb-5" />
              <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em] mb-4">
                {t('page.fv.storyEyebrow')}
              </p>
              <p className="font-serif font-bold text-2xl md:text-[1.9rem] leading-snug mb-5 max-w-[820px]">
                {t('page.fv.storyHeading')}
              </p>
              <p className="text-white/80 text-lg leading-relaxed max-w-[820px] mb-5">
                {t('page.fv.storyBody')}
              </p>
              <p className="text-white/55 text-[14px]">{t('page.fv.storyAttribution')}</p>
            </div>
          </ScrollReveal>
        </section>

        {/* ============================================ Why us (verified shortlist) ============================================ */}
        <section className="bg-navy/[0.03] border-y border-navy/10">
          <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <ScrollReveal>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="h-px w-8 bg-amber" aria-hidden="true" />
                    <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">
                      {t('page.fv.whyUsBadge')}
                    </p>
                  </div>
                  <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] leading-tight mb-5 text-balance">
                    {t('page.fv.whyUsHeading')}
                  </h2>
                  <p className="text-navy/70 text-lg leading-relaxed mb-6">
                    {t('page.fv.whyUsBody')}
                  </p>
                  <ul className="flex flex-col gap-3">
                    {dataPoints.map((point) => (
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
                    {t('page.fv.dataCardHeading')}
                  </p>
                  <p className="text-white/75 leading-relaxed mb-6">
                    {t('page.fv.dataCardBody')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((tag) => (
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
          </div>
        </section>

        {/* ============================================ FAQ ============================================ */}
        <section className="max-w-[900px] mx-auto px-6 py-16 md:py-20">
          <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] mb-10 text-center">
            {t('page.fv.faqHeading')}
          </h2>
          <FAQ faqs={visitFaqs} hideHeading />
        </section>

        {/* ============================================ Closing conversion ============================================ */}
        <section className="bg-navy text-white">
          <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <h2 className="font-serif font-bold text-2xl md:text-[2.2rem] leading-tight mb-4">
                {t('page.fv.closingHeading')}
              </h2>
              <p className="text-white/80 text-lg leading-relaxed mb-6 max-w-md">
                {t('page.fv.closingBody')}
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
              <LeadForm cta={t('form.lead.cta.factoryVisit')} />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
