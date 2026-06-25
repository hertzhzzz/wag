'use client'

import Link from 'next/link'
import { Search, Factory, Star, ArrowRight } from 'lucide-react'

export default function ClientOutcomes() {
  return (
    <section id="outcomes" className="py-16 md:py-24 px-8 md:px-20 bg-white scroll-mt-20">
      <div className="max-w-[1200px] mx-auto">
        {/* AV Case Study */}
        <div className="max-w-[640px] mb-14">
          <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">Client Story</p>
          <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4">
            How a Melbourne AV Equipment Importer Verified Their Supply Chain
          </h2>
          <p className="text-gray-600 leading-relaxed">
            A Melbourne-based importer of professional audio-visual equipment had been sourcing from a single Chinese factory for three years. Margins were tightening, quality complaints rising, and the factory had become unresponsive on pricing. They reached out to us to verify their existing supplier and explore alternatives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-[#f8f9fb] p-6 border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center mb-4"><Search size={20} className="text-navy" /></div>
            <h3 className="font-serif text-[1.05rem] font-bold text-navy mb-2">The Challenge</h3>
            <p className="text-sm text-gray-600 leading-relaxed">The existing supplier had stopped allowing factory visits. Quality defect rates had doubled over 12 months. The importer had no way to verify whether the factory was still manufacturing in-house or sub-contracting to smaller workshops.</p>
          </div>
          <div className="bg-[#f8f9fb] p-6 border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center mb-4"><Factory size={20} className="text-amber" /></div>
            <h3 className="font-serif text-[1.05rem] font-bold text-navy mb-2">Our Approach</h3>
            <p className="text-sm text-gray-600 leading-relaxed">Over four days our team visited the existing factory and two alternative suppliers in Guangdong. We verified business registrations, photographed production lines, interviewed floor managers, and cross-checked certifications against issuing bodies.</p>
          </div>
          <div className="bg-[#f8f9fb] p-6 border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center mb-4"><Star size={20} className="text-white" /></div>
            <h3 className="font-serif text-[1.05rem] font-bold text-navy mb-2">The Outcome</h3>
            <p className="text-sm text-gray-600 leading-relaxed">Our verification confirmed the existing factory had shifted production to an unregistered sub-contractor. We shortlisted an alternative supplier with 14 years of AV manufacturing history and better unit pricing — the client transitioned within six weeks with zero supply interruption.</p>
          </div>
        </div>

        <p className="text-sm text-gray-400 italic max-w-[640px]">Client details de-identified. Results are specific to this engagement and do not guarantee identical outcomes.</p>
      </div>
    </section>
  )
}
