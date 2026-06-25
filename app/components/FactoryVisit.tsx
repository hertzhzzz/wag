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

export default function FactoryVisit() {
  return (
    <section className="py-16 md:py-24 px-8 md:px-20 bg-[#f8f9fb]">
      <div className="max-w-[1200px] mx-auto">
        {/* Timeline */}
        <div className="max-w-[640px] mb-14">
          <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">What to Expect</p>
          <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4 text-balance">
            A Typical Factory Visit Day — Start to Finish
          </h2>
          <p className="text-navy/70 leading-relaxed">
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

      </div>
    </section>
  )
}
