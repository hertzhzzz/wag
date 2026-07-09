'use client'

// app/(public)/quality-inspection-china/QualityInspectionContent.tsx
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import FAQ from '@/components/FAQ'
import ScrollReveal from '@/components/ScrollReveal'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import LeadForm from '@/components/LeadForm'
import { useT } from '@/i18n/useT'
import {
  Search, ShieldCheck, FileCheck2, Boxes,
  AlertTriangle, Ruler, ClipboardCheck, Check,
} from 'lucide-react'

const faqs = [
  {
    question: 'What is AQL and why does it matter?',
    answer:
      'AQL stands for Acceptable Quality Limit — the internationally recognised random sampling method defined by ISO 2859-1 and ANSI-ASQ Z1.4. It specifies exactly how many items to inspect from your order and how many defects are acceptable at each severity level (critical, major, minor). Using AQL ensures that your inspection decision is statistically grounded, not subjective.',
  },
  {
    question: 'How is this different from a factory audit?',
    answer:
      "A factory audit evaluates the factory's capability to produce quality goods — it checks equipment, systems, certifications, and workforce. A quality inspection checks the actual finished goods before shipment — are they made to your specification? Most clients use both: audit the factory first, then inspect every significant shipment before release.",
  },
  {
    question: 'What happens if my shipment fails inspection?',
    answer:
      'If the number of defects exceeds your AQL threshold, the shipment fails. You then have options: (a) request the factory to rework the defects and schedule a re-inspection, (b) negotiate a discount with the supplier and release with the known defects documented, or (c) hold the shipment at the port. Our report gives you the evidence to make that decision with confidence.',
  },
  {
    question: 'How quickly can an inspection be arranged?',
    answer:
      "Our inspectors can be on site at your supplier's factory within 48 hours of booking in most manufacturing regions (Guangdong, Zhejiang, Jiangsu, Fujian). For more remote provinces we typically schedule within 3-5 business days.",
  },
  {
    question: 'Can I customise what the inspector checks?',
    answer:
      'Yes. Before each inspection we send you a checklist based on your product category and purchase order. You can add specific checkpoints — dimensions against a drawing, material verification, a particular functional test, label accuracy, or packaging specifications. The checklist is finalised with you before the inspector visits the factory.',
  },
]

function ConsultButton({ className = '' }: { className?: string }) {
  const t = useT()
  return (
    <a
      href="#book"
      className={`inline-flex items-center justify-center bg-amber text-navy font-semibold px-8 py-3.5 hover:translate-y-[-1px] transition-transform ${className}`}
    >
      {t('page.qi.consultButton')}
    </a>
  )
}

export default function QualityInspectionContent() {
  const t = useT()

  const heroBullets = [
    t('page.qi.heroBullet1'),
    t('page.qi.heroBullet2'),
    t('page.qi.heroBullet3'),
    t('page.qi.heroBullet4'),
  ]

  const stats = [
    { value: '1,200+', label: t('page.qi.statFactories') },
    { value: '48', label: t('page.qi.statHours') },
    { value: '3', label: t('page.qi.statDefectLevels') },
    { value: '25+', label: t('page.qi.statProvinces') },
  ]

  const steps = [
    {
      icon: Boxes,
      title: t('page.qi.step1Title'),
      body: t('page.qi.step1Body'),
    },
    {
      icon: Ruler,
      title: t('page.qi.step2Title'),
      body: t('page.qi.step2Body'),
    },
    {
      icon: ClipboardCheck,
      title: t('page.qi.step3Title'),
      body: t('page.qi.step3Body'),
    },
    {
      icon: FileCheck2,
      title: t('page.qi.step4Title'),
      body: t('page.qi.step4Body'),
    },
  ]

  const whyUsBullets = [
    'Standard inspection arranged within 48 hours across Guangdong, Zhejiang, Jiangsu, and Fujian manufacturing regions.',
    'Custom checklist per order — dimensions, materials, function, packaging, labels, and any special tests you require.',
    'Container Loading Supervision (CLS) available as an add-on to confirm your goods are loaded correctly and securely.',
  ]

  const tags = [
    t('page.qi.tagPreProduction'),
    t('page.qi.tagDuringProduction'),
    t('page.qi.tagPreShipment'),
    t('page.qi.tagContainerLoading'),
    t('page.qi.tagReworkVerification'),
  ]

  return (
    <>
      <Navbar />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://www.winningadventure.com.au' },
          { name: 'Services', url: 'https://www.winningadventure.com.au/services' },
          {
            name: 'Quality Inspection',
            url: 'https://www.winningadventure.com.au/quality-inspection-china',
          },
        ]}
      />

      <main>
        {/* ============================================ Hero + lead form ============================================ */}
        <section className="relative min-h-[60vh] md:min-h-[720px] flex items-center bg-navy overflow-hidden">
          <Image
            src="/quality-inspection-hero.webp"
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
                  {t('page.qi.heroBadge')}
                </p>
              </div>
              <h1 className="font-serif font-bold text-white text-[clamp(2.1rem,4.6vw,3.25rem)] leading-[1.06] mb-5">
                {t('page.qi.heroHeading')}
              </h1>
              <p className="text-white/80 text-lg leading-relaxed max-w-xl mb-7">
                {t('page.qi.heroSubtext')}
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
              <LeadForm id="book" cta={t('form.lead.cta.inspection')} />
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
                {t('page.qi.whyMattersLabel')}
              </p>
            </div>
            <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] leading-tight mb-10 max-w-[760px] text-balance">
              {t('page.qi.whyMattersHeading')}
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <ScrollReveal>
              <div className="border border-navy/10 p-6 h-full">
                <AlertTriangle size={26} className="text-amber mb-4" />
                <p className="font-serif font-bold text-navy text-2xl mb-2">{t('page.qi.cardAqlTitle')}</p>
                <p className="text-navy/70 text-[15px] leading-relaxed">
                  {t('page.qi.cardAqlBody')}
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <div className="border border-navy/10 p-6 h-full">
                <Boxes size={26} className="text-amber mb-4" />
                <p className="font-serif font-bold text-navy text-2xl mb-2">{t('page.qi.cardDefectLevelsTitle')}</p>
                <p className="text-navy/70 text-[15px] leading-relaxed">
                  {t('page.qi.cardDefectLevelsBody')}
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <div className="border border-navy/10 p-6 h-full">
                <Search size={26} className="text-amber mb-4" />
                <p className="font-serif font-bold text-navy text-2xl mb-2">{t('page.qi.cardDecisionTitle')}</p>
                <p className="text-navy/70 text-[15px] leading-relaxed">
                  {t('page.qi.cardDecisionBody')}
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
                {t('page.qi.howItWorksHeading')}
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
                    {t('page.qi.whyUsLabel')}
                  </p>
                </div>
                <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] leading-tight mb-5 text-balance">
                  {t('page.qi.whyUsHeading')}
                </h2>
                <p className="text-navy/70 text-lg leading-relaxed mb-6">
                  {t('page.qi.whyUsBody')}
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
                <Ruler size={34} className="text-amber mb-5" />
                <p className="font-serif font-bold text-2xl md:text-3xl mb-3 leading-snug">
                  {t('page.qi.whenToInspectTitle')}
                </p>
                <p className="text-white/75 leading-relaxed mb-6">
                  {t('page.qi.whenToInspectBody')}
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
              {t('page.qi.faqHeading')}
            </h2>
            <FAQ faqs={faqs} hideHeading />
          </div>
        </section>

        {/* ============================================ Closing conversion ============================================ */}
        <section className="bg-navy text-white">
          <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <h2 className="font-serif font-bold text-2xl md:text-[2.2rem] leading-tight mb-4">
                {t('page.qi.closingHeading')}
              </h2>
              <p className="text-white/80 text-lg leading-relaxed mb-6 max-w-md">
                {t('page.qi.closingBody')}
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
              <LeadForm cta={t('form.lead.cta.inspection')} />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
