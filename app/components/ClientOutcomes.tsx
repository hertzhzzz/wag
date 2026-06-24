'use client'

import Link from 'next/link'
import { Search, Factory, Star, ArrowRight } from 'lucide-react'

const stories = [
  { location: 'Brisbane, QLD', business: 'Mining Equipment Importer', situation: 'Ordering hydraulic breaker attachments through a Queensland distributor at AUD 3,800 per unit. 15 units per year — significant exposure.', outcome: 'Factory visit to Foshan confirmed a verified manufacturer. Landed cost dropped to AUD 2,200 per unit. Four shipments through Q2 2026 with zero quality disputes.', saving: '42% per unit' },
  { location: 'Melbourne, VIC', business: 'Activewear Brand', situation: 'Launching a new athletic wear line. Three potential suppliers — all presenting as direct factories. Could not tell which was legitimate.', outcome: 'Five-day visit across three suppliers in Guangzhou and Dongguan. One confirmed as a genuine manufacturer. First order of 2,000 units placed on-site at 18% below previous quotes.', saving: '18% below quote' },
  { location: 'Adelaide, SA', business: 'Agricultural Machinery Distributor', situation: 'Serving broad-acre farmers across SA. Previous supplier relationship broken after quality inconsistencies on irrigation equipment.', outcome: 'Visit to Ningbo precision irrigation manufacturer. ISO 9001 verified on-site. Third-party pressure testing witnessed during visit. Customer complaint rate down 60% vs previous supplier.', saving: '60% fewer complaints' },
  { location: 'Perth, WA', business: 'Construction Company', situation: 'Sourcing mini excavators for residential projects. Previous supplier (Sydney importer) charging AUD 28,000 per unit.', outcome: 'Guangzhou factory visit identified a verified manufacturer. Landed cost including shipping and duties: AUD 22,800 — 19% below previous Australian pricing.', saving: '19% below prior price' },
  { location: 'Sydney, NSW', business: 'Consumer Electronics Retailer', situation: 'Sourcing Bluetooth audio products through online platforms. Two shipments showed quality inconsistencies not matching approved samples.', outcome: 'Shenzhen factory visit with full QC process inspection and component-level verification. Established direct factory relationship. First Sydney shipment arrived May 2026 — quality confirmed by independent testing.', saving: 'Direct relationship, quality verified' },
  { location: 'Gold Coast, QLD', business: 'Fitness Equipment Brand', situation: 'Launching budget gym equipment line. Needed to verify production across resistance bands, dumbbells, and benches before placing first order.', outcome: 'Three-factory visit across Shenzhen, Dongguan, and Hangzhou. Confirmed all three product lines at one facility. MOQ negotiated from 2,000 to 500 units per line. Samples approved on-site.', saving: 'Single supplier, MOQ 500' },
]

export default function ClientOutcomes() {
  return (
    <section id="outcomes" className="py-16 md:py-24 px-8 md:px-20 bg-white">
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

        <p className="text-sm text-gray-400 italic mb-14 max-w-[640px]">Client details de-identified. Results are specific to this engagement and do not guarantee identical outcomes.</p>

        {/* Client Stories Grid */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">Client Outcomes</p>
          <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4">
            Factory Visits That Changed Their Sourcing
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Six representative outcomes from 2026 — Australian businesses across the country who verified suppliers and built better supply chains.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stories.map((s, i) => (
            <div key={i} className="bg-[#f8f9fb] p-6 border border-gray-100">
              <div className="text-xs text-amber font-semibold uppercase tracking-wide mb-1">{s.location}</div>
              <h3 className="font-serif text-[1rem] font-bold text-navy mb-3">{s.business}</h3>
              <div className="mb-3">
                <div className="text-xs font-semibold text-navy mb-1">Situation</div>
                <p className="text-xs text-gray-600 leading-relaxed">{s.situation}</p>
              </div>
              <div>
                <div className="text-xs font-semibold text-navy mb-1">Outcome</div>
                <p className="text-xs text-gray-600 leading-relaxed">{s.outcome}</p>
              </div>
              <div className="text-xs font-semibold text-amber mt-3">{s.saving}</div>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-400 max-w-2xl">
          All outcomes from 2026 engagements. Business identities generalised to category and location. Shared with client permission.
        </p>
      </div>
    </section>
  )
}
