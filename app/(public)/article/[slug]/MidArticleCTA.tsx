import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

// ============================================
// MID-ARTICLE CTA
// Injected near the article midpoint — the highest-converting placement
// (readers act once they understand the problem). Filled navy so it reads
// as a deliberate break from the prose, not another callout box.
// ============================================

export function MidArticleCTA() {
  return (
    <aside className="my-12 bg-[#0F2D5E] text-white rounded-xl px-6 py-7 sm:px-8 sm:py-8 overflow-hidden relative">
      <div className="absolute -right-8 -top-10 w-40 h-40 rounded-full bg-[#F59E0B]/10 pointer-events-none" aria-hidden="true" />
      <div className="relative max-w-xl">
        <h2 className="font-serif text-xl sm:text-2xl font-bold leading-snug mb-2 text-white">
          Not sure which factories you can actually trust?
        </h2>
        <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-5">
          We&rsquo;ve visited 120+ factories across 50+ industries. Tell us what you&rsquo;re sourcing
          and we&rsquo;ll shortlist 2&ndash;3 verified suppliers with a clear plan&nbsp;&mdash; usually
          within 3&ndash;7 business days.
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <Link
            href="/enquiry"
            className="inline-flex items-center justify-center gap-2 bg-[#F59E0B] text-[#0F2D5E] font-semibold text-sm px-6 py-3 rounded-md hover:bg-white transition-colors duration-200"
          >
            Get your free sourcing shortlist
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link
            href="/services"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors duration-200"
          >
            Explore our services
            <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" aria-hidden="true" />
          </Link>
        </div>
        <p className="text-xs text-white/55 mt-4">
          Free &middot; No obligation &middot; We reply within 4 business hours
        </p>
      </div>
    </aside>
  )
}
