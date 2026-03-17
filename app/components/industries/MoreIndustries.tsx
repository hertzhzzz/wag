'use client'

import Link from 'next/link'
import { MoreIndustryCategory } from './types'

interface MoreIndustriesProps {
  categories: MoreIndustryCategory[]
}

export default function MoreIndustries({ categories }: MoreIndustriesProps) {
  return (
    <div className="max-w-[1100px] mx-auto mt-10">
      <p className="text-[0.7rem] font-bold tracking-[0.15em] text-amber uppercase mb-6">
        More Industries We Cover
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat, i) => (
          <div key={i} className="bg-white rounded-lg p-5 shadow-[0_2px_12px_rgba(15,45,94,0.06)]">
            <p className="text-[0.7rem] font-bold tracking-[0.1em] uppercase text-navy mb-3">
              {cat.category}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {cat.items.map((item, j) => (
                <span key={j} className="text-[0.68rem] text-[#475569] bg-[#f0f4f8] px-2 py-1 rounded-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link
          href="/enquiry"
          className="inline-flex items-center gap-2 text-[0.8rem] font-semibold text-navy border border-navy px-6 py-3 rounded-sm no-underline hover:bg-navy hover:text-white transition-all"
        >
          Don&apos;t see your industry? We cover 50+ sectors — let&apos;s talk →
        </Link>
      </div>
    </div>
  )
}
