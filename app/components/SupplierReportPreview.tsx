'use client'

import { useState } from 'react'
import { X, FileText, ShieldCheck, Factory, ClipboardCheck, AlertTriangle } from 'lucide-react'

const fullSections = [
  {
    icon: FileText,
    title: 'Executive Summary',
    lines: [
      { label: 'Supplier Name', value: 'Guangdong [REDACTED] Electronics Co., Ltd' },
      { label: 'Report Date', value: 'June 2026' },
      { label: 'Verdict', value: 'Verified Manufacturer — Proceed with Standard Diligence', clean: true },
    ],
  },
  {
    icon: ShieldCheck,
    title: '1. Business Registration & Legal Status',
    lines: [
      { label: 'Credit Code', value: '9144 [REDACTED] 007' },
      { label: 'Reg. Authority', value: 'SAMR — Guangdong Administration' },
      { label: 'Registered Capital', value: '[REDACTED] RMB' },
      { label: 'Legal Rep.', value: '[REDACTED]' },
      { label: 'Business Scope', value: '✓ Matches claimed operations', clean: true },
    ],
  },
  {
    icon: Factory,
    title: '2. Production Capability Assessment',
    lines: [
      { label: 'Factory Area', value: '[REDACTED] sqm' },
      { label: 'Workers', value: '[REDACTED]' },
      { label: 'Equipment', value: 'Injection moulding × [REDACTED], SMT lines' },
      { label: 'Capacity', value: '✓ Adequate for order volume', clean: true },
    ],
  },
  {
    icon: ClipboardCheck,
    title: '3. Quality Control & Certifications',
    lines: [
      { label: 'ISO 9001', value: '✓ Certified' },
      { label: 'QC Stations', value: '[REDACTED] across line' },
      { label: 'Incoming', value: '✓ Raw material testing documented' },
      { label: 'Outgoing', value: '✓ 100% functional test', clean: true },
    ],
  },
  {
    icon: AlertTriangle,
    title: '4. Risk Summary',
    lines: [
      { label: 'Overall Risk', value: 'Low', clean: true },
      { label: 'Recommendation', value: 'Proceed with pre-production sample approval.', clean: true },
    ],
  },
]

// 真实工厂图片（CC0 Unsplash）— 和验证报告场景匹配
const productImages = [
  { src: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&q=50&auto=format&fit=crop', label: 'Production line — PCB assembly' },
  { src: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=200&q=50&auto=format&fit=crop', label: 'Warehouse — finished goods' },
  { src: 'https://images.unsplash.com/photo-1563770554667-f8b6bdd719d5?w=200&q=50&auto=format&fit=crop', label: 'QC inspection station' },
  { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&q=50&auto=format&fit=crop', label: 'Packaging & labeling area' },
]

export default function SupplierReportPreview() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      {/* Floating report preview card */}
      <div
        onClick={() => setModalOpen(true)}
        className="bg-white border border-navy/10 shadow-[0_8px_32px_rgba(15,45,94,0.15)] hover:shadow-[0_12px_40px_rgba(15,45,94,0.22)] transition-all duration-300 cursor-pointer group md:absolute md:right-0 md:top-8 md:w-[340px] md:z-10"
      >
        {/* Card header */}
        <div className="bg-navy text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-amber" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-amber/90">Sample Report</span>
          </div>
          <div className="text-white/30 group-hover:text-amber transition-colors text-[11px] flex items-center gap-1">
            <span>Preview</span>
          </div>
        </div>

        {/* Compact content */}
        <div className="px-5 py-4 flex flex-col gap-3">
          {fullSections.slice(0, 3).map((section, i) => (
            <div key={i}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <section.icon size={12} className="text-amber" />
                <h3 className="text-[11px] font-semibold text-navy/70 uppercase tracking-wide">{section.title}</h3>
              </div>
              <div className="flex flex-col gap-0.5 pl-4">
                {section.lines.slice(0, 2).map((line, j) => (
                  <div key={j} className="flex text-[11px]">
                    <span className="text-navy/35 w-20 flex-shrink-0">{line.label}</span>
                    <span className={`${line.clean ? 'text-navy/80' : 'blur-[3px] select-none text-navy/50'}`}>
                      {line.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Blurred product images */}
          <div className="border-t border-navy/5 pt-3 mt-1">
            <p className="text-[10px] text-navy/35 mb-1.5 font-semibold uppercase tracking-wider">Product Photos</p>
            <div className="flex gap-1.5">
              {productImages.map((img, i) => (
                <div key={i} className="flex-shrink-0 w-14 h-14 rounded overflow-hidden border border-navy/5 bg-navy/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt="" className="w-full h-full object-cover blur-[3px]" />
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-center text-navy/25 mt-0.5">Click to preview full report →</p>
        </div>
      </div>

      {/* Full Preview Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4 md:p-8"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-[720px] max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-navy text-white px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-amber" />
                <div>
                  <p className="text-[13px] font-semibold">Supplier Due Diligence Report</p>
                  <p className="text-[11px] text-white/50">Prepared by Winning Adventure Global Pty Ltd</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close preview"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-8 flex flex-col gap-7">
              {fullSections.map((section, i) => (
                <div key={i}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-amber/10 flex items-center justify-center">
                      <section.icon size={16} className="text-amber" />
                    </div>
                    <h3 className="font-semibold text-navy text-[15px]">{section.title}</h3>
                  </div>
                  <div className="flex flex-col gap-2.5 ml-11">
                    {section.lines.map((line, j) => (
                      <div key={j} className="flex text-[14px]">
                        <span className="text-navy/50 w-44 flex-shrink-0">{line.label}</span>
                        <span className={`${line.clean ? 'text-navy font-medium' : 'blur-sm select-none text-navy/70'}`}>
                          {line.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Product Images */}
              <div className="border-t border-navy/10 pt-6">
                <h3 className="font-semibold text-navy text-[15px] mb-4">Product & Facility Photos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {productImages.map((img, i) => (
                    <div key={i} className="border border-navy/10 rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.src} alt="" className="w-full aspect-[4/3] object-cover" />
                      <p className="text-[11px] text-navy/50 px-2 py-1.5">{img.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

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
