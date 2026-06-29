'use client'

import Link from 'next/link'
import { useT } from '@/i18n/useT'
import FAQ from '@/components/FAQ'
import { aboutFaqs } from '@/data/faqs-about'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import ScrollReveal from '@/components/ScrollReveal'
import { Sparkles, Tractor } from 'lucide-react'

export default function AboutContent() {
  const t = useT()

  return (
    <>
      <BreadcrumbSchema items={[
        { name: t('page.about.breadcrumb_home'), url: 'https://www.winningadventure.com.au' },
        { name: t('page.about.breadcrumb_about'), url: 'https://www.winningadventure.com.au/about' }
      ]} />

      {/* Hero — statement banner: the quote IS the hero */}
      <section className="py-20 md:py-28 px-4 md:px-8 bg-surface-warm">
        <div className="max-w-[680px] mx-auto text-center">
          <div className="w-12 h-px bg-amber/40 mx-auto mb-10" aria-hidden="true" />

          <blockquote>
            <p className="font-serif text-[clamp(1.5rem,3.5vw,2.25rem)] italic leading-[1.5] text-navy">
              &quot;{t('page.about.hero_quote')}&quot;
            </p>
          </blockquote>

          <p className="mt-8 text-sm text-navy/50">
            {t('page.about.hero_quote_author')}
          </p>

          <p className="mt-14 text-xs text-navy/35">
            {t('page.about.hero_tagline')}
          </p>
        </div>
      </section>

      {/* Founder's Story + Values */}
      <section className="py-10 md:py-[60px] px-4 md:px-[72px] max-w-[860px] mx-auto scroll-mt-20" id="founder">
        <h2 className="font-serif text-[clamp(1.5rem,3.5vw,2.25rem)] font-semibold leading-tight mb-7">
          {t('page.about.founder_story_headline')}
        </h2>
        <p className="text-base leading-relaxed text-navy/70 mb-5">
          {t('page.about.founder_story_p1')}
        </p>
        <p className="text-base leading-relaxed text-navy/70 mb-5">
          {t('page.about.founder_story_p2')}
        </p>
        <p className="text-base leading-relaxed text-navy/70 mb-8">
          {t('page.about.founder_story_p3')}
        </p>

        {/* Values — integrated into founder narrative */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 pt-8 border-t border-navy/10">
          <div>
            <div className="text-xs font-semibold text-amber-dark tracking-[0.1em] mb-2">
              {t('page.about.value_verified_title')}
            </div>
            <p className="text-sm text-navy/70 leading-relaxed">
              {t('page.about.value_verified_desc')}
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold text-amber-dark tracking-[0.1em] mb-2">
              {t('page.about.value_relationships_title')}
            </div>
            <p className="text-sm text-navy/70 leading-relaxed">
              {t('page.about.value_relationships_desc')}
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold text-amber-dark tracking-[0.1em] mb-2">
              {t('page.about.value_clarity_title')}
            </div>
            <p className="text-sm text-navy/70 leading-relaxed">
              {t('page.about.value_clarity_desc')}
            </p>
          </div>
        </div>

        <div className="mt-10 text-center md:text-left">
          <Link
            href="/enquiry"
            className="inline-block bg-amber text-navy text-sm font-semibold py-3 px-8 tracking-wide transition-opacity hover:opacity-80 rounded-none min-h-11"
          >
            {t('page.about.cta_consultation')}
          </Link>
        </div>
      </section>

      {/* Split Section: Australian Needs + Chinese Supply, with Bridge */}
      <section className="scroll-mt-20" id="both-worlds">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[600px]">
          <div className="bg-surface-warm py-12 md:py-20 px-4 md:px-[60px] border-r border-gray-200">
            <div className="text-xs font-semibold text-amber-dark tracking-[0.12em] uppercase mb-4">
              {t('page.about.split_au_label')}
            </div>
            <h2 className="font-serif text-[clamp(1.4rem,2.8vw,2rem)] font-semibold mb-7 leading-tight">
              {t('page.about.split_au_headline')}
            </h2>
            <p className="text-sm text-navy/70 leading-relaxed mb-5">
              {t('page.about.split_au_p1')}
            </p>
            <p className="text-sm text-navy/70 leading-relaxed mb-5">
              {t('page.about.split_au_p2')}
            </p>
            <ul className="list-none mt-8">
              <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
                <span className="text-amber font-bold text-base">&#10003;</span>
                {t('page.about.au_list_verified')}
              </li>
              <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
                <span className="text-amber font-bold text-base">&#10003;</span>
                {t('page.about.au_list_english')}
              </li>
              <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
                <span className="text-amber font-bold text-base">&#10003;</span>
                {t('page.about.au_list_compliance')}
              </li>
              <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
                <span className="text-amber font-bold text-base">&#10003;</span>
                {t('page.about.au_list_pricing')}
              </li>
              <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
                <span className="text-amber font-bold text-base">&#10003;</span>
                {t('page.about.au_list_partnership')}
              </li>
              <li className="py-4 text-sm text-navy font-medium flex items-center gap-3">
                <span className="text-amber font-bold text-base">&#10003;</span>
                {t('page.about.au_list_quotes')}
              </li>
            </ul>
          </div>

          <div className="bg-white py-12 md:py-20 px-4 md:px-[60px]">
            <div className="text-xs font-semibold text-amber-dark tracking-[0.12em] uppercase mb-4">
              {t('page.about.split_cn_label')}
            </div>
            <h2 className="font-serif text-[clamp(1.4rem,2.8vw,2rem)] font-semibold mb-7 leading-tight">
              {t('page.about.split_cn_headline')}
            </h2>
            <p className="text-sm text-navy/70 leading-relaxed mb-5">
              {t('page.about.split_cn_p1')}
            </p>
            <p className="text-sm text-navy/70 leading-relaxed mb-5">
              {t('page.about.split_cn_p2')}
            </p>
            <ul className="list-none mt-8">
              <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
                <span className="text-amber font-bold text-base">&#10003;</span>
                {t('page.about.cn_list_industries')}
              </li>
              <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
                <span className="text-amber font-bold text-base">&#10003;</span>
                {t('page.about.cn_list_factories')}
              </li>
              <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
                <span className="text-amber font-bold text-base">&#10003;</span>
                {t('page.about.cn_list_provinces')}
              </li>
              <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
                <span className="text-amber font-bold text-base">&#10003;</span>
                {t('page.about.cn_list_liaisons')}
              </li>
              <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
                <span className="text-amber font-bold text-base">&#10003;</span>
                {t('page.about.cn_list_export')}
              </li>
              <li className="py-4 text-sm text-navy font-medium flex items-center gap-3">
                <span className="text-amber font-bold text-base">&#10003;</span>
                {t('page.about.cn_list_pricing')}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Client Case Studies — varied layout */}
      <section className="py-16 md:py-20 px-4 md:px-8 bg-surface-warm scroll-mt-20" id="results">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="font-serif text-[clamp(1.5rem,3vw,2.25rem)] font-semibold text-navy mb-4">
            {t('page.about.case_studies_headline')}
          </h2>
          <p className="text-sm text-navy/60 mb-10 max-w-[600px]">
            {t('page.about.case_studies_desc')}
          </p>

          {/* Featured case studies — 2 wider cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Featured: Fitness Equipment */}
            <ScrollReveal>
            <div className="rounded-lg bg-white border border-gray-200 p-6 md:p-8 hover:shadow-card-hover transition-shadow duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center shrink-0">
                  <Sparkles size={20} className="text-amber" />
                </div>
                <div className="text-xs font-semibold text-amber-dark tracking-wide uppercase">
                  {t('page.about.case_fitness_label')}
                </div>
              </div>
              <p className="text-sm text-navy/70 leading-relaxed mb-4">
                {t('page.about.case_fitness_desc')}
              </p>
              <div className="flex items-center gap-4 text-xs text-navy/50 font-medium pt-4 border-t border-gray-100">
                <span>{t('page.about.case_fitness_metrics')}</span>
                <span className="text-navy/20">|</span>
                <span>{t('page.about.case_fitness_order_value')}</span>
              </div>
            </div>
            </ScrollReveal>

            {/* Featured: Industrial Components */}
            <ScrollReveal>
            <div className="rounded-lg bg-white border border-gray-200 p-6 md:p-8 hover:shadow-card-hover transition-shadow duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center shrink-0">
                  <Tractor size={20} className="text-amber" />
                </div>
                <div className="text-xs font-semibold text-amber-dark tracking-wide uppercase">
                  {t('page.about.case_industrial_label')}
                </div>
              </div>
              <p className="text-sm text-navy/70 leading-relaxed mb-4">
                {t('page.about.case_industrial_desc')}
              </p>
              <div className="flex items-center gap-4 text-xs text-navy/50 font-medium pt-4 border-t border-gray-100">
                <span>{t('page.about.case_industrial_quality')}</span>
                <span className="text-navy/20">|</span>
                <span>{t('page.about.case_industrial_moq')}</span>
              </div>
            </div>
            </ScrollReveal>
          </div>

          {/* Compact case studies — 4 in a row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Medical Equipment */}
            <ScrollReveal>
            <div className="rounded-lg bg-white border border-gray-200 p-5 hover:shadow-card-hover transition-shadow duration-200">
              <div className="text-xs font-semibold text-amber-dark mb-2">
                {t('page.about.case_medical_label')}
              </div>
              <p className="text-sm text-navy/70 leading-relaxed mb-3">
                {t('page.about.case_medical_desc')}
              </p>
              <p className="text-xs text-navy/50 font-medium">
                {t('page.about.case_medical_cost')}
              </p>
            </div>
            </ScrollReveal>

            {/* Food Ingredients */}
            <ScrollReveal>
            <div className="rounded-lg bg-white border border-gray-200 p-5 hover:shadow-card-hover transition-shadow duration-200">
              <div className="text-xs font-semibold text-amber-dark mb-2">
                {t('page.about.case_food_label')}
              </div>
              <p className="text-sm text-navy/70 leading-relaxed mb-3">
                {t('page.about.case_food_desc')}
              </p>
              <p className="text-xs text-navy/50 font-medium">
                {t('page.about.case_food_avoided')}
              </p>
            </div>
            </ScrollReveal>

            {/* Building Materials */}
            <ScrollReveal>
            <div className="rounded-lg bg-white border border-gray-200 p-5 hover:shadow-card-hover transition-shadow duration-200">
              <div className="text-xs font-semibold text-amber-dark mb-2">
                {t('page.about.case_building_label')}
              </div>
              <p className="text-sm text-navy/70 leading-relaxed mb-3">
                {t('page.about.case_building_desc')}
              </p>
              <p className="text-xs text-navy/50 font-medium">
                {t('page.about.case_building_reduction')}
              </p>
            </div>
            </ScrollReveal>

            {/* Automotive Parts */}
            <ScrollReveal>
            <div className="rounded-lg bg-white border border-gray-200 p-5 hover:shadow-card-hover transition-shadow duration-200">
              <div className="text-xs font-semibold text-amber-dark mb-2">
                {t('page.about.case_auto_label')}
              </div>
              <p className="text-sm text-navy/70 leading-relaxed mb-3">
                {t('page.about.case_auto_desc')}
              </p>
              <p className="text-xs text-navy/50 font-medium">
                {t('page.about.case_auto_compliance')}
              </p>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* South Australia Presence */}
      <section className="py-12 md:py-16 px-4 md:px-8 bg-white scroll-mt-20" id="location">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-[clamp(1.4rem,2.8vw,2rem)] font-semibold mb-6 text-navy">
            {t('page.about.location_headline')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-navy/70 leading-relaxed mb-4">
                {t('page.about.location_p1')}
              </p>
              <p className="text-sm text-navy/70 leading-relaxed mb-4">
                {t('page.about.location_p2')}
              </p>
              <p className="text-sm text-navy/70 leading-relaxed">
                {t('page.about.location_p3')}
              </p>
              <p className="text-xs text-navy/40 mt-4">
                {t('page.about.location_attribution')}
              </p>
            </div>
            <div className="rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3272.007699036242!2d138.6085374!3d-34.906256299999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ab0c9234a2460b1%3A0x4e46dbce81f63d91!2s5%2F54%20Melbourne%20St%2C%20North%20Adelaide%20SA%205006!5e0!3m2!1sen!2sau!4v1779435144896!5m2!1sen!2sau"
                width="100%"
                height="280"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t('page.about.location_map_title')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ faqs={aboutFaqs} />
    </>
  )
}
