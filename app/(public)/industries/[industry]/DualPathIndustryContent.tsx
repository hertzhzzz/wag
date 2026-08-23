'use client'

/**
 * Dual-path Industry Intent Page renderer (C4).
 * Renders the eight-section content model + Industry Qualified Form.
 * FAQ answers are always present in the DOM for crawlers (not client-only expand).
 */

import Image from 'next/image'
import Link from 'next/link'
import { Check, ArrowRight, AlertTriangle, Building2, FileCheck2, Boxes } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import ScrollReveal from '@/components/ScrollReveal'
import type { IndustryIntentPage } from '@/lib/industry-intent-content'
import { trackInternalLink } from '@/lib/analytics'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="h-px w-8 bg-amber" aria-hidden="true" />
      <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">{children}</p>
    </div>
  )
}

function StaticFaqList({
  faqs,
}: {
  faqs: { question: string; answer: string }[]
}) {
  return (
    <div className="divide-y divide-navy/10">
      {faqs.map((faq) => (
        <details key={faq.question} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-semibold text-navy text-base marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="pr-4">{faq.question}</span>
            <span className="text-2xl text-navy flex-shrink-0 leading-none group-open:hidden" aria-hidden="true">+</span>
            <span className="text-2xl text-navy flex-shrink-0 leading-none hidden group-open:inline" aria-hidden="true">−</span>
          </summary>
          {/* Answer is always in initial HTML via <details>, visible when open */}
          <p className="mt-3 pr-10 text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
        </details>
      ))}
    </div>
  )
}

export default function DualPathIndustryContent({ page }: { page: IndustryIntentPage }) {
  const s = page.sections

  return (
    <>
      <Navbar />
      <main>
        {/* 1. Hero / who this is for intro + form */}
        <section className="relative min-h-[60vh] md:min-h-[680px] flex items-center bg-navy overflow-hidden">
          <Image
            src={page.heroImage ?? `/industry-${page.slug}.webp`}
            alt=""
            fill
            priority
            unoptimized
            className="object-cover z-0"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-navy/95 via-navy/80 to-navy/55 z-[1]" aria-hidden="true" />
          <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 py-10 md:py-16 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="h-px w-8 bg-amber" aria-hidden="true" />
                <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">{page.heroTagline}</p>
              </div>
              <h1 className="font-serif font-bold text-white text-[clamp(2.1rem,4.6vw,3.25rem)] leading-[1.06] mb-5">
                {page.h1}
              </h1>
              <p className="text-white/80 text-lg leading-relaxed max-w-xl mb-7">{page.heroIntro}</p>
              <ul className="flex flex-col gap-2.5">
                {[page.primaryPathLabel, page.secondaryPathLabel, 'Australia-based team · China on-ground coordination'].map((b) => (
                  <li key={b} className="flex items-center gap-3 text-white/90 text-[15px]">
                    <Check size={18} className="text-amber flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:pl-4">
              <LeadForm
                id="book"
                industry={page.slug}
                heading={s.finalCta.heading}
                subcopy={s.finalCta.body}
                cta={s.finalCta.ctaLabel}
                qualify
              />
            </div>
          </div>
        </section>

        <section className="bg-white border-b border-navy/10">
          <div className="max-w-[1100px] mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {page.stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-serif font-bold text-navy text-3xl md:text-4xl mb-1">{stat.value}</p>
                <p className="text-navy/60 text-[13px] leading-snug">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 1. Who this is for */}
        <section className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <ScrollReveal>
            <SectionLabel>Who this is for</SectionLabel>
            <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] leading-tight mb-6 max-w-[760px]">
              {s.whoFor.heading}
            </h2>
            <p className="text-navy/70 text-lg leading-relaxed max-w-[820px] mb-8">{s.whoFor.body}</p>
            <ul className="flex flex-col gap-3 max-w-[820px]">
              {s.whoFor.bullets.map((item) => (
                <li key={item} className="flex gap-3 text-navy/75 text-[15px] leading-relaxed">
                  <Check size={18} className="text-amber flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </section>

        {/* 2. Two paths */}
        <section className="bg-navy/[0.03] border-y border-navy/10">
          <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
            <ScrollReveal>
              <SectionLabel>Two paths</SectionLabel>
              <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] leading-tight mb-10 max-w-[760px]">
                {s.twoPaths.heading}
              </h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 gap-6">
              <ScrollReveal>
                <div className="bg-white border-2 border-navy p-6 h-full">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber mb-3">Primary</p>
                  <h3 className="font-serif font-bold text-navy text-xl mb-3">{s.twoPaths.primary.title}</h3>
                  <p className="text-navy/70 text-[15px] leading-relaxed">{s.twoPaths.primary.body}</p>
                </div>
              </ScrollReveal>
              <ScrollReveal>
                <div className="bg-white border border-navy/15 p-6 h-full">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-navy/50 mb-3">Secondary</p>
                  <h3 className="font-serif font-bold text-navy text-xl mb-3">{s.twoPaths.secondary.title}</h3>
                  <p className="text-navy/70 text-[15px] leading-relaxed">{s.twoPaths.secondary.body}</p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* 3. What we deliver */}
        <section className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <ScrollReveal>
            <SectionLabel>What we deliver</SectionLabel>
            <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] leading-tight mb-8 max-w-[760px]">
              {s.deliver.heading}
            </h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-navy/50 mb-4">In scope</p>
              <ul className="flex flex-col gap-3">
                {s.deliver.claims.map((item) => (
                  <li key={item} className="flex gap-3 text-navy/80 text-[15px] leading-relaxed">
                    <Check size={18} className="text-amber flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-navy/50 mb-4">Not claimed</p>
              <ul className="flex flex-col gap-3">
                {s.deliver.nonClaims.map((item) => (
                  <li key={item} className="flex gap-3 text-navy/65 text-[15px] leading-relaxed">
                    <AlertTriangle size={18} className="text-navy/30 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 4. Industry proof / risks / standards */}
        <section className="bg-navy/[0.03] border-y border-navy/10">
          <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <ScrollReveal>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <FileCheck2 size={20} className="text-amber" />
                    <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">Industry proof</p>
                  </div>
                  <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] leading-tight mb-5">
                    {s.proof.heading}
                  </h2>
                  <p className="text-navy/70 leading-relaxed mb-6">{s.proof.body}</p>
                  <ul className="flex flex-col gap-3 mb-8">
                    {s.proof.risks.map((risk) => (
                      <li key={risk} className="flex gap-3 text-navy/75 text-[15px] leading-relaxed">
                        <AlertTriangle size={18} className="text-amber flex-shrink-0 mt-0.5" />
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="border border-navy/10 bg-white">
                    {s.proof.standards.map((std, i) => (
                      <div
                        key={std.code}
                        className={`flex items-start gap-4 px-5 py-3.5 ${i > 0 ? 'border-t border-navy/10' : ''}`}
                      >
                        <span className="font-semibold text-navy text-[13px] whitespace-nowrap min-w-[110px]">{std.code}</span>
                        <span className="text-navy/70 text-[14px] leading-snug">{std.name}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-navy/60 text-sm leading-relaxed mt-4">{s.proof.standardsNote}</p>
                </div>
              </ScrollReveal>
              <ScrollReveal>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Boxes size={20} className="text-amber" />
                    <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">What we source</p>
                  </div>
                  <p className="text-navy/70 leading-relaxed mb-5">{s.proof.productsIntro}</p>
                  <div className="flex flex-wrap gap-2 mb-10">
                    {s.proof.products.map((tag) => (
                      <span key={tag} className="text-[13px] text-navy/80 border border-navy/15 bg-white px-3 py-1.5">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="bg-white border border-navy/10 p-6">
                    <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em] mb-3">Secondary support</p>
                    <p className="text-navy/70 text-[14px] leading-relaxed mb-4">
                      Need only verification of an existing factory? That remains available as a secondary path — not the main product of this page.
                    </p>
                    <Link
                      href="/supplier-verification"
                      className="inline-flex items-center gap-1.5 text-navy font-semibold text-[14px] no-underline hover:text-amber"
                      onClick={() => trackInternalLink(`/industries/${page.slug}`, '/supplier-verification', 'Supplier verification secondary')}
                    >
                      Supplier verification support
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* 5. How engagement works */}
        <section className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <ScrollReveal>
            <SectionLabel>How engagement works</SectionLabel>
            <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] leading-tight mb-4 max-w-[760px]">
              {s.engagement.heading}
            </h2>
            <p className="text-navy/70 text-lg leading-relaxed max-w-[820px] mb-10">{s.engagement.body}</p>
          </ScrollReveal>
          <div className="grid md:grid-cols-5 gap-5">
            {s.engagement.steps.map((step, i) => (
              <ScrollReveal key={step.title}>
                <div className="bg-white border border-navy/10 p-5 h-full">
                  <div className="w-7 h-7 rounded-full bg-navy text-white text-xs font-semibold flex items-center justify-center mb-3">
                    {i + 1}
                  </div>
                  <h3 className="font-semibold text-navy text-[15px] mb-1.5 leading-tight">{step.title}</h3>
                  <p className="text-navy/65 text-[13px] leading-relaxed">{step.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* 6. What you need before contacting us */}
        <section className="bg-navy text-white">
          <div className="max-w-[1100px] mx-auto px-6 py-14 md:py-16">
            <div className="flex items-center gap-3 mb-4">
              <Building2 size={20} className="text-amber" />
              <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">Before you contact us</p>
            </div>
            <h2 className="font-serif font-bold text-2xl md:text-[2.1rem] leading-tight mb-6 max-w-[760px]">
              {s.beforeContact.heading}
            </h2>
            <ul className="grid md:grid-cols-2 gap-3 max-w-[900px]">
              {s.beforeContact.checklist.map((item) => (
                <li key={item} className="flex gap-3 text-white/85 text-[15px] leading-relaxed">
                  <Check size={18} className="text-amber flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 7. FAQ — answers in initial HTML via details/summary */}
        <section className="bg-navy/[0.03] border-t border-navy/10">
          <div className="max-w-[900px] mx-auto px-6 py-16 md:py-20">
            <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] mb-10 text-center">
              {page.industry} sourcing FAQs
            </h2>
            <StaticFaqList faqs={s.faqs} />
          </div>
        </section>

        {/* 8. Final CTA + qualified form */}
        <section className="bg-navy text-white">
          <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Building2 size={20} className="text-amber" />
                <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">
                  Australia-based · {page.industry}
                </p>
              </div>
              <h2 className="font-serif font-bold text-2xl md:text-[2.2rem] leading-tight mb-4">
                {s.finalCta.heading}
              </h2>
              <p className="text-white/80 text-lg leading-relaxed mb-6 max-w-md">{s.finalCta.body}</p>
              <ul className="flex flex-col gap-2.5">
                {[page.primaryPathLabel, page.secondaryPathLabel, s.finalCta.ctaLabel].map((b) => (
                  <li key={b} className="flex items-center gap-3 text-white/90 text-[15px]">
                    <Check size={18} className="text-amber flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <LeadForm
                industry={page.slug}
                heading={s.finalCta.heading}
                subcopy={s.finalCta.body}
                cta={s.finalCta.ctaLabel}
                qualify
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
