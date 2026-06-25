'use client'

import { useState } from 'react'
import { X, FileText, ShieldCheck, Factory, ClipboardCheck, Award, Globe, AlertTriangle, BookOpen } from 'lucide-react'

// 来自真实 client report 的 section 结构
const reportSections = [
  {
    icon: FileText,
    title: '1. Executive Summary',
    lines: [
      { label: 'Supplier', value: 'Guangdong [REDACTED] Electronics Co., Ltd' },
      { label: 'Established', value: '[REDACTED]' },
      { label: 'Employees', value: '[REDACTED] (incl. [REDACTED] R&D)' },
      { label: 'Verdict', value: 'Verified Manufacturer — proceed with standard diligence', clean: true },
    ],
  },
  {
    icon: ShieldCheck,
    title: '2. Business Registration & Corporate Info',
    lines: [
      { label: 'Credit Code', value: '9144 [REDACTED] 116F' },
      { label: 'Registered Capital', value: 'RMB [REDACTED] million' },
      { label: 'Legal Rep.', value: '[REDACTED]' },
      { label: 'Registered Address', value: '[REDACTED] District, Guangzhou' },
      { label: 'Operating Status', value: '✓ Active — latest annual report filed', clean: true },
    ],
  },
  {
    icon: Factory,
    title: '3. Production & Manufacturing Capability',
    lines: [
      { label: 'Factory Area', value: '[REDACTED] sqm' },
      { label: 'Production Workers', value: '[REDACTED]' },
      { label: 'Production Lines', value: '[REDACTED] SMT lines, [REDACTED] assembly' },
      { label: 'Monthly Output', value: '[REDACTED] units' },
      { label: 'Capacity Assessment', value: '✓ Adequate for stated order volume', clean: true },
    ],
  },
  {
    icon: ClipboardCheck,
    title: '4. Product Portfolio & Samples',
    lines: [
      { label: 'Product Categories', value: '[REDACTED] series across [REDACTED] lines' },
      { label: 'Sample Tested', value: '✓ Matches spec. See attached photos.', clean: true },
      { label: 'Customisation', value: '✓ OEM/ODM capability confirmed', clean: true },
    ],
    images: true,
  },
  {
    icon: Award,
    title: '5. Certifications, Patents & Awards',
    lines: [
      { label: 'Quality System', value: 'ISO 9001: [REDACTED]' },
      { label: 'Industry Cert.', value: '[REDACTED], [REDACTED], CE' },
      { label: 'Patents', value: '[REDACTED] registered patents' },
      { label: 'Awards', value: '[REDACTED] Top 500 Enterprise', clean: true },
    ],
  },
  {
    icon: Globe,
    title: '6. Export History',
    lines: [
      { label: 'Export Markets', value: 'Asia, Europe, North America, Australia' },
      { label: 'Years Exporting', value: '[REDACTED]+ years' },
      { label: 'Australia References', value: '✓ Confirmed export history to AU', clean: true },
    ],
  },
  {
    icon: AlertTriangle,
    title: '7. Risk Assessment Summary',
    lines: [
      { label: 'Overall Risk', value: 'Low — proceed with standard diligence', clean: true },
      { label: 'Key Finding', value: 'Consistent QC records, verifiable export history, no material adverse findings.', clean: true },
    ],
  },
  {
    icon: BookOpen,
    title: '8. Supplier Engagement Guide',
    lines: [
      { label: 'Contact Window', value: '[REDACTED] — General Manager' },
      { label: 'Lead Time', value: '[REDACTED] days for sample, [REDACTED] for bulk' },
      { label: 'Payment Terms', value: '[REDACTED]% deposit, [REDACTED]% before shipment' },
      { label: 'Next Steps', value: '✓ Pre-production sample → bulk order → pre-shipment inspection', clean: true },
    ],
  },
]

// 真实工厂审计风格图片（CC0 Unsplash — 验厂现场感）
const auditImages = [
  { src: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&q=60&auto=format&fit=crop', label: 'Product sample — circuit board assembly' },
  { src: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=300&q=60&auto=format&fit=crop', label: 'Factory floor — SMT production line' },
  { src: 'https://images.unsplash.com/photo-1563770554667-f8b6bdd719d5?w=300&q=60&auto=format&fit=crop', label: 'QC inspection — measurement station' },
  { src: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=300&q=60&auto=format&fit=crop', label: 'Warehouse — finished goods storage' },
]

export default function SupplierReportPreview() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      {/* Floating report preview */}
      <div
        onClick={() => setModalOpen(true)}
        className="bg-white border border-navy/10 shadow-[0_8px_32px_rgba(15,45,94,0.15)] hover:shadow-[0_12px_40px_rgba(15,45,94,0.22)] transition-all duration-300 cursor-pointer group"
      >
        {/* Header */}
        <div className="bg-navy text-white px-5 py-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-amber/80 mb-0.5">Verification Report Sample</p>
          <p className="text-[12px] text-white/60">See the exact report delivered to this client</p>
        </div>

        {/* Scrollable section list */}
        <div className="px-5 py-4 max-h-[360px] overflow-y-auto flex flex-col gap-0">
          {reportSections.map((section, i) => (
            <div key={i} className="py-2 border-b border-navy/5 last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <section.icon size={12} className="text-amber flex-shrink-0" />
                <h3 className="text-[11px] font-semibold text-navy/70">{section.title}</h3>
              </div>
              <div className="flex flex-col gap-0.5 pl-4">
                {section.lines.slice(0, 2).map((line, j) => (
                  <div key={j} className="flex text-[10.5px]">
                    <span className="text-navy/35 w-16 flex-shrink-0">{line.label}</span>
                    <span className={`${line.clean ? 'text-navy/80' : 'blur-[3px] select-none text-navy/50'}`}>
                      {line.value}
                    </span>
                  </div>
                ))}
                {section.lines.length > 2 && (
                  <span className="text-[9px] text-navy/25">+{section.lines.length - 2} more fields</span>
                )}
                {section.images && (
                  <div className="flex gap-1.5 mt-2">
                    {auditImages.map((img, i) => (
                      <div key={i} className="flex-shrink-0 w-12 h-9 rounded overflow-hidden border border-navy/5 bg-navy/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.src} alt="" className="w-full h-full object-cover blur-[2px]" />
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
          <span className="text-[10px] text-navy/30 group-hover:text-amber transition-colors">Click to view full report →</span>
        </div>
      </div>

      {/* Full Preview Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4 md:p-8"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-[780px] max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 bg-navy text-white px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-amber" />
                <div>
                  <p className="text-[13px] font-semibold">Supplier Due Diligence &amp; Capability Assessment</p>
                  <p className="text-[11px] text-white/50">Prepared by Winning Adventure Global Pty Ltd</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
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
                    <h3 className="font-semibold text-navy text-[15px]">{section.title}</h3>
                  </div>
                  <div className="flex flex-col gap-2 ml-11">
                    {section.lines.map((line, j) => (
                      <div key={j} className="flex text-[13px]">
                        <span className="text-navy/50 w-36 flex-shrink-0">{line.label}</span>
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
                            <img src={img.src} alt="" className="w-full aspect-[4/3] object-cover blur-[2px]" />
                            <p className="text-[10px] text-navy/40 px-2 py-1">{img.label}</p>
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
              <span className="text-[11px] text-navy/30 tracking-wider">CONFIDENTIAL · SAMPLE PREVIEW</span>
              <span className="text-[11px] text-navy/30">Page 1 of 1</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
