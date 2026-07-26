'use client'

import { useState } from 'react'
import { X, FileText, ShieldCheck, Factory, ClipboardCheck, Award, Globe, AlertTriangle, BookOpen } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useT, type TKey } from '@/i18n/useT'

type ReportLine = { labelKey: TKey; value: string; clean?: boolean }
type ReportSection = { icon: LucideIcon; titleKey: TKey; lines: ReportLine[]; images?: boolean }

// 来自真实 client report 的 section 结构
// Note: section titles and labels use i18n keys; rendered dynamically via t()
const reportSections: ReportSection[] = [
  {
    icon: FileText,
    titleKey: 'home.report.section1Title',
    lines: [
      { labelKey: 'home.report.labelSupplier', value: 'Guangdong [REDACTED] Electronics Co., Ltd' },
      { labelKey: 'home.report.labelEstablished', value: '[REDACTED]' },
      { labelKey: 'home.report.labelEmployees', value: '[REDACTED] (incl. [REDACTED] R&D)' },
      { labelKey: 'home.report.labelVerdict', value: 'Verified Manufacturer — proceed with standard diligence', clean: true },
    ],
  },
  {
    icon: ShieldCheck,
    titleKey: 'home.report.section2Title',
    lines: [
      { labelKey: 'home.report.labelCreditCode', value: '9144 [REDACTED] 116F' },
      { labelKey: 'home.report.labelRegisteredCapital', value: 'RMB [REDACTED] million' },
      { labelKey: 'home.report.labelLegalRep', value: '[REDACTED]' },
      { labelKey: 'home.report.labelRegisteredAddress', value: '[REDACTED] District, Guangzhou' },
      { labelKey: 'home.report.labelOperatingStatus', value: '✓ Active — latest annual report filed', clean: true },
    ],
  },
  {
    icon: Factory,
    titleKey: 'home.report.section3Title',
    lines: [
      { labelKey: 'home.report.labelFactoryArea', value: '[REDACTED] sqm' },
      { labelKey: 'home.report.labelProductionWorkers', value: '[REDACTED]' },
      { labelKey: 'home.report.labelProductionLines', value: '[REDACTED] SMT lines, [REDACTED] assembly' },
      { labelKey: 'home.report.labelMonthlyOutput', value: '[REDACTED] units' },
      { labelKey: 'home.report.labelCapacityAssessment', value: '✓ Adequate for stated order volume', clean: true },
    ],
  },
  {
    icon: ClipboardCheck,
    titleKey: 'home.report.section4Title',
    lines: [
      { labelKey: 'home.report.labelProductCategories', value: '[REDACTED] series across [REDACTED] lines' },
      { labelKey: 'home.report.labelSampleTested', value: '✓ Matches spec. See attached photos.', clean: true },
      { labelKey: 'home.report.labelCustomisation', value: '✓ OEM/ODM capability confirmed', clean: true },
    ],
    images: true,
  },
  {
    icon: Award,
    titleKey: 'home.report.section5Title',
    lines: [
      { labelKey: 'home.report.labelQualitySystem', value: 'ISO 9001: [REDACTED]' },
      { labelKey: 'home.report.labelIndustryCert', value: '[REDACTED], [REDACTED], CE' },
      { labelKey: 'home.report.labelPatents', value: '[REDACTED] registered patents' },
      { labelKey: 'home.report.labelAwards', value: '[REDACTED] Top 500 Enterprise', clean: true },
    ],
  },
  {
    icon: Globe,
    titleKey: 'home.report.section6Title',
    lines: [
      { labelKey: 'home.report.labelExportMarkets', value: 'Asia, Europe, North America, Australia' },
      { labelKey: 'home.report.labelYearsExporting', value: '[REDACTED]+ years' },
      { labelKey: 'home.report.labelAustraliaReferences', value: '✓ Confirmed export history to AU', clean: true },
    ],
  },
  {
    icon: AlertTriangle,
    titleKey: 'home.report.section7Title',
    lines: [
      { labelKey: 'home.report.labelOverallRisk', value: 'Low — proceed with standard diligence', clean: true },
      { labelKey: 'home.report.labelKeyFinding', value: 'Consistent QC records, verifiable export history, no material adverse findings.', clean: true },
    ],
  },
  {
    icon: BookOpen,
    titleKey: 'home.report.section8Title',
    lines: [
      { labelKey: 'home.report.labelContactWindow', value: '[REDACTED] — General Manager' },
      { labelKey: 'home.report.labelLeadTime', value: '[REDACTED] days for sample, [REDACTED] for bulk' },
      { labelKey: 'home.report.labelPaymentTerms', value: '[REDACTED]% deposit, [REDACTED]% before shipment' },
      { labelKey: 'home.report.labelNextSteps', value: '✓ Pre-production sample → bulk order → pre-shipment inspection', clean: true },
    ],
  },
]

// 真实 client portal 报告中的工厂图片（通过 API route 引用）
// Note: labels are dynamically rendered via useT() in components
const auditImages: { src: string; label: TKey }[] = [
  { src: '/report-samples/factory-park.jpg', label: 'home.report.imageFactoryPark' },
  { src: '/report-samples/production-line.jpg', label: 'home.report.imageProductionLine' },
  { src: '/report-samples/quality-lab.jpg', label: 'home.report.imageQualityLab' },
  { src: '/report-samples/product-speakers.jpg', label: 'home.report.imageProductSample' },
]

export default function SupplierReportPreview() {
  const [modalOpen, setModalOpen] = useState(false)
  const t = useT()

  return (
    <>
      {/* Floating report preview */}
      <div
        onClick={() => setModalOpen(true)}
        className="bg-white border border-navy/10 shadow-[0_8px_32px_rgba(15,45,94,0.15)] hover:shadow-[0_12px_40px_rgba(15,45,94,0.22)] transition-all duration-300 cursor-pointer group"
      >
        {/* Header */}
        <div className="bg-navy text-white px-5 py-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-amber/80 mb-0.5">{t('home.report.sampleLabel')}</p>
          <p className="text-[12px] text-white/60">{t('home.report.sampleDescription')}</p>
        </div>

        {/* Section list — scrollable, stops before CTA */}
        <div className="px-5 py-4 max-h-[340px] overflow-y-auto flex flex-col gap-0">
          {reportSections.map((section, i) => (
            <div key={i} className="py-2 border-b border-navy/5 last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <section.icon size={12} className="text-amber flex-shrink-0" />
                <h3 className="text-[11px] font-semibold text-navy/70">{t(section.titleKey)}</h3>
              </div>
              <div className="flex flex-col gap-0.5 pl-4">
                {section.lines.slice(0, 2).map((line, j) => (
                  <div key={j} className="flex text-[10.5px]">
                    <span className="text-navy/50 w-16 flex-shrink-0">{t(line.labelKey)}</span>
                    <span className={`${line.clean ? 'text-navy/80' : 'blur-[3px] select-none text-navy/50'}`}>
                      {line.value}
                    </span>
                  </div>
                ))}
                {section.lines.length > 2 && (
                  <span className="text-[9px] text-navy/25">{t('home.report.moreFields').replace('{count}', String(section.lines.length - 2))}</span>
                )}
                {section.images && (
                  <div className="flex gap-1.5 mt-2">
                    {auditImages.map((img, i) => (
                      <div key={i} className="flex-shrink-0 w-12 h-9 rounded overflow-hidden border border-navy/5 bg-navy/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.src}
                          alt={t(img.label)}
                          className="w-full h-full object-cover blur-[2px]"
                          loading="lazy"
                          decoding="async"
                          fetchPriority="low"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Cue */}
        <div className="px-5 py-2.5 border-t border-navy/5 text-center">
          <span className="text-[10px] text-navy/30 group-hover:text-amber transition-colors">{t('home.report.clickToViewFull')}</span>
        </div>
      </div>

      {/* Full Preview Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4 md:p-8"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-[780px] max-h-[85vh] overflow-y-auto shadow-2xl mt-16 mb-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 bg-navy text-white px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-amber" />
                <div>
                  <p className="text-[13px] font-semibold">{t('home.report.modalTitle')}</p>
                  <p className="text-[11px] text-white/50">{t('home.report.modalSubtitle')}</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                aria-label={t('home.report.closeButton')}
              >
                <X size={20} />
              </button>
            </div>

            {/* Report body */}
            <div className="px-6 py-8 flex flex-col gap-6">
              {reportSections.map((section, i) => (
                <div key={i}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-amber/10 flex items-center justify-center">
                      <section.icon size={16} className="text-amber" />
                    </div>
                    <h3 className="font-semibold text-navy text-[15px]">{t(section.titleKey)}</h3>
                  </div>
                  <div className="flex flex-col gap-2 ml-11">
                    {section.lines.map((line, j) => (
                      <div key={j} className="flex text-[13px]">
                        <span className="text-navy/50 w-36 flex-shrink-0">{t(line.labelKey)}</span>
                        <span className={`${line.clean ? 'text-navy font-medium' : 'blur-sm select-none text-navy/70'}`}>
                          {line.value}
                        </span>
                      </div>
                    ))}
                    {section.images && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                        {auditImages.map((img, i) => (
                          <div key={i} className="border border-navy/10 rounded-lg overflow-hidden bg-navy/5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.src}
                              alt={t(img.label)}
                              className="w-full aspect-[4/3] object-cover blur-[2px]"
                              loading="lazy"
                              decoding="async"
                              fetchPriority="low"
                            />
                            <p className="text-[10px] text-navy/60 px-2 py-1">{t(img.label)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-navy/10 px-6 py-3 flex items-center justify-between">
              <span className="text-[11px] text-navy/30 tracking-wider">{t('home.report.footerConfidential')}</span>
              <span className="text-[11px] text-navy/30">{t('home.report.footerPageNumber')}</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
