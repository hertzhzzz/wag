'use client'

import Link from 'next/link'
import { Shield, Factory, ClipboardCheck, Search, Users, Briefcase, ArrowRight } from 'lucide-react'

const services = [
  { icon: <Factory size={24} className="text-amber" />, title: 'Factory Verification', desc: 'On-site factory audits verifying registration, production capacity, certifications and operational maturity — not just a database lookup.' },
  { icon: <ClipboardCheck size={24} className="text-amber" />, title: 'On-Site Quality Inspection', desc: 'Pre-production and pre-shipment quality checks conducted in person at the factory floor. We catch defects before containers leave China.' },
  { icon: <Briefcase size={24} className="text-amber" />, title: 'Negotiation Support', desc: 'Mandarin-speaking negotiators on the factory floor advocating for your pricing, payment terms, and contract conditions.' },
  { icon: <Search size={24} className="text-amber" />, title: 'Supplier Sourcing', desc: 'We identify and shortlist 2–3 pre-screened factories matched to your product, industry, and volume within 3–7 business days.' },
  { icon: <Users size={24} className="text-amber" />, title: 'Project Accompaniment', desc: 'Your bilingual guide accompanies you through every factory visit — handling translation, cultural facilitation, and ground logistics.' },
  { icon: <Shield size={24} className="text-amber" />, title: 'Supply Chain Protection', desc: 'Post-visit follow-through: certificate verification, sample coordination, pre-shipment inspection, and freight logistics to your door.' },
]

export default function SourcingCapabilities() {
  return (
    <section id="capabilities" className="py-16 md:py-24 px-8 md:px-20 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[640px] mb-10">
          <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">What We Do</p>
          <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4">
            Full-Service China Sourcing, Managed from Australia
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Unlike large-volume platforms that process RFQs through a centralised system, we are an Adelaide-based team with our own people on the ground in China. Every service is delivered by our team — never subcontracted to third-party inspectors or rebate-influenced agents. From factory verification through to freight, one team handles your project end to end.
          </p>
        </div>

        {/* Stat badges */}
        <div className="flex flex-wrap gap-x-12 gap-y-5 mb-14 pb-10 border-b border-gray-100">
          {[['50+', 'Industries served'], ['120+', 'Factories visited'], ['3–7 days', 'To shortlist 2–3 factories']].map(([n, l]) => (
            <div key={l}>
              <div className="font-serif text-3xl md:text-4xl font-bold text-navy leading-none">{n}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mt-2">{l}</div>
            </div>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {services.map((svc, i) => (
            <div key={i} className="bg-[#f8f9fb] p-6 border border-gray-100">
              <div className="mb-4">{svc.icon}</div>
              <h3 className="font-serif text-[1.05rem] font-bold text-navy mb-2">{svc.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{svc.desc}</p>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="max-w-[800px] mx-auto">
          <h3 className="font-serif text-xl font-bold text-navy mb-4 text-center">Winning Adventure Global vs. Going It Alone vs. a Generic Agent</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-navy">What You Get</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-400 bg-gray-50">DIY (Online)</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-400 bg-gray-50">Generic Agent</th>
                  <th className="text-center py-4 px-4 font-semibold text-navy bg-amber/10">Winning Adventure Global</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Factory Verification', '—', '—', '✓'],
                  ['Bilingual On-Site Support', '—', '—', '✓'],
                  ['Australia-Based Account Manager', '—', '—', '✓'],
                  ['Pre-Screened Factory Shortlist', '—', '—', '✓'],
                  ['Post-Visit Written Assessment', '—', '—', '✓'],
                  ['Logistics & Freight Coordination', '—', '—', '✓'],
                ].map(([feature, diy, generic, wag], i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-4 px-4 font-medium text-navy">{feature}</td>
                    <td className="text-center py-4 px-4 bg-gray-50 text-gray-400">{diy}</td>
                    <td className="text-center py-4 px-4 bg-gray-50 text-gray-400">{generic}</td>
                    <td className="text-center py-4 px-4 bg-amber/10 text-navy font-semibold">{wag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center mt-6">
            <Link href="/enquiry" className="inline-flex items-center gap-2 bg-amber text-navy py-3 px-8 font-semibold hover:bg-amber/90 transition-colors text-sm">
              Book Free Consult <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
