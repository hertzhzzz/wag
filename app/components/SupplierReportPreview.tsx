'use client'

import { useState, useEffect, useRef } from 'react'
import { X, FileText, ShieldCheck, Factory, ClipboardCheck, AlertTriangle, ZoomIn } from 'lucide-react'

const sections = [
  {
    icon: FileText,
    title: 'Executive Summary',
    lines: [
      { label: 'Supplier', value: 'Guangdong [REDACTED] Electronics Co., Ltd' },
      { label: 'Verdict', value: 'Verified Manufacturer — Proceed with Standard Diligence', clean: true },
    ],
  },
  {
    icon: ShieldCheck,
    title: '1. Business Registration',
    lines: [
      { label: 'Credit Code', value: '9144 [REDACTED] 007' },
      { label: 'Registered Capital', value: '[REDACTED] RMB' },
      { label: 'Business Scope', value: '✓ Matches claimed operations', clean: true },
    ],
  },
  {
    icon: Factory,
    title: '2. Production Capability',
    lines: [
      { label: 'Workers', value: '[REDACTED]' },
      { label: 'Equipment', value: 'Injection moulding, SMT lines [REDACTED]' },
      { label: 'Capacity', value: '✓ Adequate for order volume', clean: true },
    ],
  },
]

const fullSections = [
  {
    icon: FileText,
    title: 'Executive Summary',
    lines: [
      { label: 'Supplier Name', value: 'Guangdong [REDACTED] Electronics Co., Ltd' },
      { label: 'Report Date', value: 'June 2026' },
      { label: 'Prepared For', value: '[REDACTED] — Australia' },
      { label: 'Verdict', value: 'Verified Manufacturer — Proceed with Standard Diligence', clean: true },
    ],
  },
  {
    icon: ShieldCheck,
    title: '1. Business Registration & Legal Status',
    lines: [
      { label: 'Unified Social Credit Code', value: '9144 [REDACTED] 007[REDACTED]' },
      { label: 'Registration Authority', value: 'SAMR — Guangdong Administration' },
      { label: 'Registered Capital', value: '[REDACTED] RMB' },
      { label: 'Legal Representative', value: '[REDACTED]' },
      { label: 'Business Scope', value: '✓ Matches claimed operations', clean: true },
    ],
  },
  {
    icon: Factory,
    title: '2. Production Capability Assessment',
    lines: [
      { label: 'Factory Area', value: '[REDACTED] sqm' },
      { label: 'Production Workers', value: '[REDACTED]' },
      { label: 'Annual Output', value: '[REDACTED] units' },
      { label: 'Equipment Verified', value: 'Injection moulding × [REDACTED], SMT lines × [REDACTED]' },
      { label: 'Capacity Assessment', value: '✓ Adequate for stated order volume', clean: true },
    ],
  },
  {
    icon: ClipboardCheck,
    title: '3. Quality Control & Certifications',
    lines: [
      { label: 'ISO 9001', value: '✓ Certified' },
      { label: 'QC Stations', value: '[REDACTED] stations across line' },
      { label: 'Incoming Inspection', value: '✓ Raw material testing documented' },
      { label: 'Outgoing Inspection', value: '✓ 100% functional test before shipment', clean: true },
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

// Placeholder product images (free CC0 from Unsplash)
const productImages = [
  { src: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&q=60&auto=format&fit=crop', label: 'Product A — Circuit Board Assembly' },
  { src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=60&auto=format&fit=crop', label: 'Product B — Electronic Component' },
  { src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=60&auto=format&fit=crop', label: 'Product C — Packaged Unit' },
  { src: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=300&q=60&auto=format&fit=crop', label: 'Product D — Production Sample' },
]

export default function SupplierReportPreview() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      {/* Compact card — click to open full preview */}
      <div
        onClick={() => setModalOpen(true)}
        className="bg-white border border-navy/10 shadow-[0_4px_20px_rgba(15,45,94,0.08)] hover:shadow-[0_8px_28px_rgba(15,45,94,0.14)] transition-all duration-300 cursor-pointer group h-full"
      >
        {/* Card header */}
        <div className="bg-navy text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-amber" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-amber/90">Sample Report</span>
          </div>
          <ZoomIn size={16} className="text-white/40 group-hover:text-amber transition-colors" />
        </div>

        {/* Compact content */}
        <div className="px-5 py-5 flex flex-col gap-4">
          {sections.map((section, i) => (
            <div key={i}>
              <div className="flex items-center gap-2 mb-2">
                <section.icon size={14} className="text-amber" />
                <h3 className="text-[12px] font-semibold text-navy/80">{section.title}</h3>
              </div>
              <div className="flex flex-col gap-1 pl-6">
                {section.lines.map((line, j) => (
                  <div key={j} className="flex text-[12px]">
                    <span className="text-navy/40 w-24 flex-shrink-0">{line.label}</span>
                    <span className={`${line.clean ? 'text-navy/90' : 'blur-sm select-none text-navy/60'}`}>
                      {line.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Product images strip */}
          <div className="border-t border-navy/5 pt-3 mt-1">
            <p className="text-[11px] text-navy/40 mb-2 font-medium uppercase tracking-wide">Product Images</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {productImages.map((img, i) => (
                <div key={i} className="flex-shrink-0 w-16 h-16 bg-navy/5 rounded overflow-hidden border border-navy/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt="" className="w-full h-full object-cover blur-sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Cue to click */}
          <p className="text-[11px] text-center text-navy/30 mt-1">
            Click to preview full report →
          </p>
        </div>
      </div>

      {/* Full Preview Modal (PDF-viewer style) */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4 md:p-8"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-[720px] max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header (PDF chrome) */}
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

            {/* Modal body — full report */}
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

              {/* Product Images gallery in full report */}
              <div className="border-t border-navy/10 pt-6">
                <h3 className="font-semibold text-navy text-[15px] mb-4">Product List & Sample Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {productImages.map((img, i) => (
                    <div key={i} className="border border-navy/10 rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.src} alt="" className="w-full aspect-square object-cover" />
                      <p className="text-[11px] text-navy/50 px-2 py-1.5">{img.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal footer */}
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
