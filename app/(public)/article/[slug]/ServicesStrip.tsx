import Link from 'next/link'
import { Package, Plane, Monitor, ArrowRight } from 'lucide-react'

// ============================================
// "HOW WE HELP" SERVICES STRIP
// Surfaces the three real service tiers inside every article so readers
// always see what Winning Adventure Global actually offers. Copy and titles
// mirror /services (single source of truth).
// ============================================

const SERVICES = [
  {
    icon: Package,
    title: 'One-Time Procurement',
    tagline: 'A single purchase executed well — travel to China with our guide or let us handle it remotely.',
  },
  {
    icon: Plane,
    title: 'Factory Tour + Supply Chain',
    tagline: 'Visit China with a bilingual guide, audit production in person, and build a long-term supply chain.',
    highlighted: true,
  },
  {
    icon: Monitor,
    title: 'Remote Verification + Supply Chain',
    tagline: 'Deep supplier verification and ongoing procurement management — without leaving Australia.',
  },
]

export function ServicesStrip() {
  return (
    <section className="mt-14 pt-10 border-t border-gray-200" aria-labelledby="how-we-help">
      <h2 id="how-we-help" className="font-serif text-2xl font-bold text-[#0F2D5E] mb-1">
        How Winning Adventure Global helps
      </h2>
      <p className="text-gray-600 text-sm mb-6 max-w-xl">
        Whichever way you source from China, you get someone you can trust on the ground. Choose the approach that fits your business.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {SERVICES.map(({ icon: Icon, title, tagline, highlighted }) => (
          <Link
            key={title}
            href="/services"
            className={`group flex flex-col p-5 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 ${
              highlighted
                ? 'bg-[#0F2D5E] border-[#0F2D5E] text-white hover:shadow-[0_12px_30px_rgba(15,45,94,0.25)]'
                : 'bg-white border-gray-200 text-[#0F2D5E] hover:border-[#0F2D5E]/40 hover:shadow-[0_8px_24px_rgba(15,45,94,0.1)]'
            }`}
          >
            <span
              className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                highlighted ? 'bg-[#F59E0B] text-[#0F2D5E]' : 'bg-[#0F2D5E]/5 text-[#0F2D5E]'
              }`}
            >
              <Icon size={20} aria-hidden="true" />
            </span>
            <h3 className={`font-serif font-semibold text-base mb-1.5 leading-snug ${highlighted ? 'text-white' : 'text-[#0F2D5E]'}`}>
              {title}
            </h3>
            <p className={`text-sm leading-relaxed mb-4 ${highlighted ? 'text-white/80' : 'text-gray-600'}`}>
              {tagline}
            </p>
            <span
              className={`mt-auto inline-flex items-center gap-1 text-xs font-semibold tracking-wide ${
                highlighted ? 'text-[#F59E0B]' : 'text-[#0F2D5E] group-hover:text-[#F59E0B]'
              } transition-colors`}
            >
              Compare services
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
