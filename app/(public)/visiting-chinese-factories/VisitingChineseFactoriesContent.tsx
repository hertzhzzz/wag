'use client'
import { useT } from '@/i18n/useT'
import Image from 'next/image'
import { Search, ShieldCheck, Building2, ClipboardCheck, MapPin, AlertTriangle, FileCheck2, Boxes, Check } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FAQ from '@/components/FAQ'
import ScrollReveal from '@/components/ScrollReveal'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import LeadForm from '@/components/LeadForm'

const statValues = ['1,200+', '25+', '1,000+', '50+']

// SEO content — FAQ entries kept in English, not translated
const visitFaqs = [
  {
    question: 'Do you arrange the whole factory visit, including travel?',
    answer:
      'We plan the itinerary, shortlist and confirm the factories worth visiting, book the meetings, and accompany you on the ground with a bilingual guide. You handle your flights and accommodation; we handle everything once you land.',
  },
  {
    question: 'I don\'t speak Chinese — will that be a problem?',
    answer:
      'No. A bilingual guide is with you for every meeting, translating not just the language but the context — what a vague answer really means, and which questions to press on the factory floor.',
  },
  {
    question: 'Can you shortlist factories before I commit to travelling?',
    answer:
      'Yes. We pre-screen and verify candidate suppliers from our database of 1,200-plus factories first, so you only spend travel days on plants genuinely worth seeing. Many clients verify remotely first, then travel to close.',
  },
  {
    question: 'What happens during the on-site visit?',
    answer:
      'We walk the production line with you, check equipment and workforce against the supplier\'s claims, review quality control in person, and help you read the things a video call hides — actual capacity, working conditions, and whether you are dealing with a maker or a middleman.',
  },
  {
    question: 'What does the free consult cover?',
    answer:
      'A no-obligation call to understand your product, your sourcing goals, and which regions and factories are worth visiting. After the consult we scope the trip and send you a quote. The consult is free; the guided visit is a paid service.',
  },
  {
    question: 'Which parts of China do you cover?',
    answer:
      'We cover the major manufacturing clusters across 25-plus provinces, with the deepest coverage in Guangdong and Zhejiang where most of Australia\'s imports are made.',
  },
]

export default function VisitingChineseFactoriesContent() {
  const t = useT()

  const heroBullets = [
    t('page.fv.heroBullet1'),
    t('page.fv.heroBullet2'),
    t('page.fv.heroBullet3'),
  ]

  const stats = [
    { value: statValues[0], label: t('page.fv.statLabel1') },
    { value: statValues[1], label: t('page.fv.statLabel2') },
    { value: statValues[2], label: t('page.fv.statLabel3') },
    { value: statValues[3], label: t('page.fv.statLabel4') },
  ]

  const steps = [
    { icon: Building2, title: t('page.fv.step1Title'), body: t('page.fv.step1Body') },
    { icon: MapPin, title: t('page.fv.step2Title'), body: t('page.fv.step2Body') },
    { icon: ClipboardCheck, title: t('page.fv.step3Title'), body: t('page.fv.step3Body') },
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

        {/* ============================================ Why it matters ============================================ */}
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
                <p className="font-serif font-bold text-navy text-2xl mb-2">{t('page.fv.riskStat1Heading')}</p>
                <p className="text-navy/70 text-[15px] leading-relaxed">
                  {t('page.fv.riskStat1Body')}
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <div className="border border-navy/10 p-6 h-full">
                <FileCheck2 size={26} className="text-amber mb-4" />
                <p className="font-serif font-bold text-navy text-2xl mb-2">{t('page.fv.riskStat2Heading')}</p>
                <p className="text-navy/70 text-[15px] leading-relaxed">
                  {t('page.fv.riskStat2Body')}
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <div className="border border-navy/10 p-6 h-full">
                <Boxes size={26} className="text-amber mb-4" />
                <p className="font-serif font-bold text-navy text-2xl mb-2">{t('page.fv.riskStat3Heading')}</p>
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

        {/* ============================================ How it works ============================================ */}
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

        {/* ============================================ Why us (data advantage) ============================================ */}
        <section className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
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
        </section>

        {/* ============================================ FAQ ============================================ */}
        <section className="bg-navy/[0.03] border-t border-navy/10">
          <div className="max-w-[900px] mx-auto px-6 py-16 md:py-20">
            <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] mb-10 text-center">
              {t('page.fv.faqHeading')}
            </h2>
            <FAQ faqs={visitFaqs} hideHeading />
          </div>
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
              <LeadForm />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
