'use client'

import { useEffect, useRef, useState } from 'react'
import { FileText, ShieldCheck, Factory, ClipboardCheck, AlertTriangle, ArrowRight } from 'lucide-react'

const sections = [
  {
    icon: FileText,
    title: 'Executive Summary',
    lines: [
      { label: 'Supplier Name', value: 'Guangdong [REDACTED] Electronics Co., Ltd' },
      { label: 'Report Date', value: 'June 2026' },
      { label: 'Verdict', value: 'Verified Manufacturer — Proceed with Standard Diligence', blurred: false },
    ],
  },
  {
    icon: ShieldCheck,
    title: '1. Business Registration & Legal Status',
    lines: [
      { label: 'Unified Social Credit Code', value: '9144 [REDACTED] 007[REDACTED]' },
      { label: 'Registration Authority', value: 'SAMR — Guangdong Administration for Market Regulation' },
      { label: 'Registered Capital', value: '[REDACTED] RMB' },
      { label: 'Legal Representative', value: '[REDACTED]' },
      { label: 'Business Scope Confirmed', value: 'Manufacturing of [REDACTED] electronic components — Scope matches claimed operations', blurred: false },
    ],
  },
  {
    icon: Factory,
    title: '2. Production Capability Assessment',
    lines: [
      { label: 'Factory Area', value: '[REDACTED] sqm' },
      { label: 'Production Workers', value: '[REDACTED]' },
      { label: 'Annual Output (claimed)', value: '[REDACTED] units' },
      { label: 'Equipment Verified', value: 'Injection moulding × [REDACTED], SMT lines × [REDACTED]' },
      { label: 'Production Capacity', value: 'Adequate for stated order volume — [REDACTED]% utilization at time of visit', blurred: false },
    ],
  },
  {
    icon: ClipboardCheck,
    title: '3. Quality Control & Certifications',
    lines: [
      { label: 'ISO 9001', value: '✓ Certified (expiry [REDACTED])' },
      { label: 'QC Stations', value: '[REDACTED] stations across production line' },
      { label: 'Incoming Inspection', value: '✓ Raw material testing documented' },
      { label: 'Outgoing Inspection', value: '✓ 100% functional test before shipment' },
    ],
  },
  {
    icon: AlertTriangle,
    title: '4. Risk Summary',
    lines: [
      { label: 'Overall Risk Rating', value: 'Low', blurred: false },
      { label: 'Key Finding', value: 'Supplier maintains consistent QC records and has verifiable export history to Australia', blurred: false },
      { label: 'Recommendation', value: 'Proceed with pre-production sample approval before first bulk order.', blurred: false },
    ],
  },
]

export default function SupplierReportPreview() {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={ref} className="bg-white py-16 md:py-24 px-8 md:px-20">
      <div className="max-w-[1120px] mx-auto">
        {/* Section header */}
        <p className="font-serif text-sm tracking-[0.08em] text-amber mb-4 italic">
          What You Receive
        </p>
        <h2 className="font-serif text-[clamp(28px,4.5vw,42px)] font-semibold text-navy leading-tight tracking-tight mb-4 text-balance">
          Sample Supplier Verification Report
        </h2>
        <p className="text-navy/70 max-w-[640px] mb-12">
          Every verification engagement produces a detailed report. Sensitive data is redacted below — but the structure
          and depth are exactly what you receive.
        </p>

        {/* Report preview */}
        <div
          className="bg-white border border-navy/10 shadow-[0_12px_40px_rgba(15,45,94,0.08)]"
          style={{
            transition: 'opacity 0.6s ease, transform 0.6s ease',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          {/* Report header */}
          <div className="bg-navy text-white px-8 py-6">
            <div className="flex items-center gap-3 mb-1">
              <FileText size={20} className="text-amber" />
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-amber">Supplier Due Diligence Report</span>
            </div>
            <p className="text-white/60 text-[13px] mt-1">Prepared by Winning Adventure Global Pty Ltd</p>
          </div>

          {/* Sections */}
          <div className="px-8 py-8 flex flex-col gap-8">
            {sections.map((section, i) => (
              <div key={i}>
                <div className="flex items-center gap-3 mb-4">
                  <section.icon size={20} className="text-amber" />
                  <h3 className="font-semibold text-navy text-[15px]">{section.title}</h3>
                </div>
                <div className="flex flex-col gap-2.5 pl-9">
                  {section.lines.map((line, j) => (
                    <div key={j} className="flex text-[14px]">
                      <span className="text-navy/50 w-44 flex-shrink-0">{line.label}</span>
                      <span className={`${line.blurred !== false ? 'blur-sm select-none' : 'text-navy font-medium'}`}>
                        {line.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer watermark */}
          <div className="border-t border-navy/10 px-8 py-4 flex items-center justify-between">
            <span className="text-[11px] text-navy/30">CONFIDENTIAL · SAMPLE PREVIEW</span>
            <span className="text-[11px] text-navy/30">Page 1 of 1</span>
          </div>
        </div>

        <p className="text-navy/50 text-[13px] text-center mt-6">
          Redacted sample shown. Your report will contain verified data specific to your shortlisted suppliers.
        </p>
      </div>
    </section>
  )
}
