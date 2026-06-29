'use client'

import SupplierReportPreview from '@/components/SupplierReportPreview'
import ClientOutcomes from '@/components/ClientOutcomes'
import { useT } from '@/i18n/useT'

// 首页 case study 区 — 从 page.tsx 抽出为 client 组件，使文案可切换；
// page.tsx 保持 server component 以保留 metadata / JSON-LD（SEO 永远英文）。
export default function HomeCaseStudy() {
  const t = useT()
  return (
    <section className="bg-white py-16 md:py-24 px-8 md:px-20 relative">
      <div className="max-w-[1120px] mx-auto relative">
        {/* Intro content — left aligned, right side reserved for floating card */}
        <div className="lg:pr-[380px] mb-8">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber bg-amber/5 border border-amber/20 px-3 py-1 rounded-full">
              {t('home.case.tag1')}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-navy/60 bg-navy/5 border border-navy/10 px-3 py-1 rounded-full flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {t('home.case.location')}
            </span>
          </div>

          {/* Title */}
          <h2 className="font-serif text-[clamp(1.4rem,3vw,2rem)] font-bold text-navy mb-4 leading-tight text-balance">
            {t('home.case.title')}
          </h2>

          {/* KPI results */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 mb-4">
            {[
              { label: t('home.case.kpi1'), sub: t('home.case.kpiSub1') },
              { label: t('home.case.kpi2'), sub: t('home.case.kpiSub2') },
              { label: t('home.case.kpi3'), sub: t('home.case.kpiSub3') },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C97A0A" strokeWidth="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <div>
                  <span className="text-[14px] font-semibold text-navy">{item.label}</span>
                  <span className="text-[14px] text-navy/60"> {item.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <p className="text-navy/70 leading-relaxed max-w-[600px]">
            {t('home.case.description')}
          </p>
        </div>

        {/* Floating report card — absolute positioned, spans across sections */}
        <div className="hidden lg:block absolute right-0 top-0 w-[340px] z-10">
          <SupplierReportPreview />
        </div>
        <div className="lg:hidden">
          <SupplierReportPreview />
        </div>

        {/* Full-width: timeline + CTA + disclaimer */}
        <ClientOutcomes />
      </div>
    </section>
  )
}
