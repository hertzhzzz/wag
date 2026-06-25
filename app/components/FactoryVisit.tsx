'use client'

import Link from 'next/link'
import { CheckCircle, MapPin, Shield, Clock } from 'lucide-react'

const timeline = [
  { time: '8:30am', title: 'Hotel Pickup & Briefing', desc: 'Your bilingual guide briefs you on the factories and what to look for during the visits.' },
  { time: '9:30am–12pm', title: 'First Factory Visit', desc: 'Walk the production floor. Meet the factory owner and QA lead. Your guide translates everything in real time.' },
  { time: '12–1:30pm', title: 'Lunch & Debrief', desc: 'Debrief with your guide. Note observations and questions for the afternoon visit.' },
  { time: '1:30–4:30pm', title: 'Second Factory Visit', desc: 'A facility with different specialisation. Inspect tooling, warehouse, and packaging areas.' },
  { time: '4:30–5pm', title: 'Same-Day Written Assessment', desc: 'Your guide summarises observations and recommendations while details are fresh.' },
  { time: '5pm', title: 'Return to Hotel', desc: 'Evening flights are fine — your guide coordinates luggage and airport transfer.' },
]

const redFlags = [
  { flag: 'Factory floor is quiet or understaffed', meaning: 'A facility claiming high output with few workers is either exaggerating capacity or sub-contracting production elsewhere.' },
  { flag: 'Cannot show active production of your product', meaning: 'If they cannot show your specific product running on a line, they may be a trading intermediary — not a manufacturer.' },
  { flag: 'Registered address does not match physical site', meaning: 'Cross-check the business license address against what you see. A mismatch warrants serious investigation.' },
  { flag: 'No export history to Western markets', meaning: 'Ask for proof of prior exports. Factories without Australian or Western market experience may not understand labelling and compliance.' },
  { flag: 'Reluctance to allow photographs on the floor', meaning: 'Legitimate factories are accustomed to visitor photography. Refusal often means the facility is shared or not what was described.' },
  { flag: 'Prices drop significantly after you arrive on-site', meaning: 'Aggressive last-minute discounting may mean the initial quote was inflated — or they are willing to cut corners to match a price.' },
  { flag: 'No visible quality control stations', meaning: 'Professional factories maintain dedicated QC areas with inspection equipment and defect logs. Absence means you are relying on their word.' },
  { flag: 'Owner avoids direct conversation', meaning: 'If the person you meet cannot answer production questions, you may be speaking with a sales agent — not the decision-maker.' },
]

export default function FactoryVisit() {
  return (
    <section className="py-16 md:py-24 px-8 md:px-20 bg-[#f8f9fb]">
      <div className="max-w-[1200px] mx-auto">
        {/* Stat badges */}
        <div className="flex flex-wrap gap-x-12 gap-y-5 mb-14 pb-10 border-b border-gray-200">
          {[['2/day', 'Factories per visit'], ['6', 'Manufacturing hubs covered'], ['100%', 'Bilingual support on-site']].map(([n, l]) => (
            <div key={l}>
              <div className="font-serif text-3xl md:text-4xl font-bold text-navy leading-none">{n}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mt-2">{l}</div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="max-w-[640px] mb-14">
          <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">What to Expect</p>
          <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4">
            A Typical Factory Visit Day — Start to Finish
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Two factories per day. Bilingual guide with you from pickup to drop-off. Here is exactly how a structured day unfolds — based on dozens of visits we have run for Australian businesses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
          {timeline.map((item, i) => (
            <div key={i} className="flex gap-4 bg-white p-5 border border-gray-100">
              <div className="text-amber font-semibold text-xs border border-amber/30 bg-amber/5 rounded px-2 py-1.5 h-fit flex-shrink-0 w-28 text-center">
                {item.time}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-navy mb-1">{item.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-navy/5 rounded-xl border border-navy/10 max-w-2xl mb-16">
          <p className="text-sm text-navy/70 leading-relaxed">
            <strong className="text-navy">Two factories per day</strong> is the standard — enough depth without cognitive overload. Three is possible for repeat visitors, but for first-timers, two focused visits deliver better outcomes.
          </p>
        </div>

        {/* Red Flags */}
        <div className="max-w-[640px] mb-10">
          <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">Supplier Due Diligence</p>
          <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4">
            8 Red Flags to Watch For During a Factory Visit
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Seeing a factory in person reveals problems that documents and photos cannot. These are the warning signs our team looks for on every visit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {redFlags.map((item, i) => (
            <div key={i} className="bg-white p-6 border border-gray-100">
              <div className="text-amber text-xs font-bold uppercase tracking-wide mb-2">Red Flag {i + 1}</div>
              <h3 className="font-semibold text-navy text-sm mb-2">{item.flag}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{item.meaning}</p>
            </div>
          ))}
        </div>

        <div className="text-sm text-gray-500 max-w-2xl">
          Source: UTS 2025 Australian Business China Sourcing Research, n=858.{' '}
          <Link href="/article/verify-chinese-supplier" className="text-navy underline hover:text-amber">Full verification methodology →</Link>
        </div>
      </div>
    </section>
  )
}
