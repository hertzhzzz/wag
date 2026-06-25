"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import type { FactoryItem } from "./page"

const PER_PAGE = 24

export function FactoryDirectory({
  factories,
  provinces,
  categories,
}: {
  factories: FactoryItem[]
  provinces: string[]
  categories: string[]
}) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [province, setProvince] = useState("")
  const [activeChip, setActiveChip] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const result = factories.filter((f) => {
      const q = search.toLowerCase()
      if (q) {
        const haystack = (f.pinyin_name + " " + f.company_name + " " + (f.certifications || []).join(" ") + " " + (f.platform_tags || []).join(" ") + " " + (f.biz_scope || "")).toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (province && f.province !== province) return false
      if (category && f.category !== category) return false
      if (activeChip === "super" && !(f.platform_tags || []).some((t) => t.toLowerCase().includes("super"))) return false
      if (activeChip === "fca" && !f.fca_report_id) return false
      return true
    })
    return result
  }, [factories, search, province, category, activeChip])

  useEffect(() => { setPage(1) }, [search, province, activeChip])

  // Add defensive guard for page bounds
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const safePage = Math.min(page, Math.max(1, totalPages))
  const start = (safePage - 1) * PER_PAGE
  const pageItems = filtered.slice(start, start + PER_PAGE)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero — video bg overlay, same as landing page */}
      <section className="relative min-h-[50vh] md:min-h-[540px] flex items-center overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <video autoPlay muted loop playsInline preload="metadata" className="w-full h-full object-cover">
            <source src="/hero_vid_compressed.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/70 to-navy/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy/20" />
        </div>
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-amber/5 to-transparent skew-x-12" />

        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-4 md:px-8 lg:px-16 py-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-amber/70" />
            <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-white/70">Australia—China Trade</p>
          </div>

          <h1 className="max-w-[720px]">
            <span className="block leading-[1.1] tracking-[-2px] font-serif font-bold text-[clamp(36px,5vw,56px)] text-white">Find Verified</span>
            <span className="block leading-[1.1] tracking-[-2px] font-serif font-bold italic text-[clamp(36px,5vw,56px)] text-amber">Chinese Factories</span>
          </h1>

          <p className="text-base md:text-lg font-light leading-[1.6] text-white/80 max-w-[480px] mt-5 mb-8">
            Browse {factories.length.toLocaleString()}+ manufacturers across {categories.length}+ industries. Free to search — no signup needed.
          </p>

          {/* Search bar over video */}
          <div className="flex items-center bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden max-w-[640px] focus-within:bg-white/15 focus-within:border-white/30 transition-all">
            <input
              type="text"
              placeholder="Search by product, industry, or factory name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-none outline-none bg-transparent text-white placeholder:text-white/50 font-sans text-[15px] px-4 py-3.5 flex-1 min-w-0"
            />
            <div className="w-px h-6 bg-white/20 flex-shrink-0" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border-none outline-none bg-transparent text-white/80 text-sm py-3.5 pl-4 pr-9 cursor-pointer appearance-none flex-shrink-0 min-w-[140px] bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2212%22%20height=%2212%22%20fill=%22rgba(255,255,255,0.5)%22%20viewBox=%220%200%2016%2016%22%3E%3Cpath%20d=%22M4%206l4%204%204-4%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_14px_center]"
            >
              <option value="">All categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="w-px h-6 bg-white/20 flex-shrink-0" />
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="border-none outline-none bg-transparent text-white/80 text-sm py-3.5 pl-4 pr-9 cursor-pointer appearance-none flex-shrink-0 min-w-[130px] bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2212%22%20height=%2212%22%20fill=%22rgba(255,255,255,0.5)%22%20viewBox=%220%200%2016%2016%22%3E%3Cpath%20d=%22M4%206l4%204%204-4%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_14px_center]"
            >
              <option value="">All provinces</option>
              {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <button className="px-4 py-3.5 text-amber hover:text-white hover:bg-amber transition-colors flex-shrink-0" aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center gap-8 mt-12 pt-8 border-t border-white/10">
            {["1,200+ Factories Listed", "30+ Industries", "Free Public Access"].map((text) => (
              <div key={text} className="flex items-center gap-2 text-white/60 text-sm">
                <svg aria-hidden="true" className="w-5 h-5 text-amber flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16">
        <h2 className="font-serif text-[28px] font-semibold text-navy text-center mb-10">How the directory works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { num: "01", title: "Search by product or industry", desc: "Type what you want to source — LED lights, sports equipment, furniture — and find factories instantly." },
            { num: "02", title: "Filter by location or certification", desc: "Narrow results by province or certification type. Every factory card shows what they are verified for." },
            { num: "03", title: "Request sourcing support", desc: "Found a factory you like? Tell us and we'll handle verification, negotiation, and factory visits for you." },
          ].map((step) => (
            <div key={step.num}>
              <div className="font-serif text-[56px] font-semibold text-amber/40 leading-none mb-3">{step.num}</div>
              <h3 className="text-lg font-semibold text-navy mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature badges */}
      <section className="max-w-6xl mx-auto px-4 pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Factory-direct pricing", desc: "No middlemen, no markups. Every factory here sells direct." },
          { title: "On-ground verified", desc: "Our team in China has physically visited and verified these factories." },
          { title: "Free to search", desc: "No paywall. No signup. Browse the full directory at no cost." },
          { title: "Updated weekly", desc: "New factories added every week as we continue our discovery process." },
        ].map((f) => (
          <div key={f.title}>
            <h4 className="text-sm font-semibold text-navy mb-1">{f.title}</h4>
            <p className="text-[13px] text-gray-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Results bar */}
      <div className="max-w-6xl mx-auto px-4 pb-4 flex items-center gap-2 flex-wrap">
        <span className="text-[13px] text-gray-400">
          {filtered.length.toLocaleString()} of {factories.length.toLocaleString()} factories
        </span>
        {[
          { label: "Super Factory", key: "super" as const },
          { label: "FCA Certified", key: "fca" as const },
        ].map((chip) => (
          <button
            key={chip.key}
            onClick={() => setActiveChip(activeChip === chip.key ? null : chip.key)}
            className={`px-3.5 py-1.5 border rounded-full text-[13px] transition-all cursor-pointer font-sans ${
              activeChip === chip.key ? "bg-navy text-white border-navy" : "bg-white text-gray-500 border-gray-200 hover:border-navy hover:text-navy"
            }`}
          >
            {chip.label}
          </button>
        ))}
        {(search || province || activeChip) && (
          <button onClick={() => { setSearch(""); setCategory(""); setProvince(""); setActiveChip(null) }} className="text-[13px] text-red-500 hover:underline bg-transparent border-none cursor-pointer">
            Clear all
          </button>
        )}
      </div>

      {/* Card grid */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pageItems.map((f) => (
            <Link
              key={f.member_id}
              href={`/factory/${f.slug}`}
              className="block bg-white border border-gray-200 rounded-xl p-6 hover:border-navy/20 hover:shadow-lg transition-all duration-200 group"
            >
              <h3 className="text-[15px] font-semibold text-navy leading-snug mb-0.5 line-clamp-1">{f.pinyin_name || f.company_name}</h3>
              <p className="text-[12px] text-gray-400 truncate">{f.company_name}</p>
              <p className="text-[13px] text-gray-400 mb-3 mt-0.5">{[f.province, f.city].filter(Boolean).join(", ") || "—"}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(f.platform_tags || []).map((tag) => (
                  <span key={tag} className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider bg-amber-50 text-amber-800">{tag}</span>
                ))}
                {(f.certifications || []).slice(0, 3).map((cert) => (
                  <span key={cert} className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider bg-gray-50 text-navy border border-navy/10">{cert}</span>
                ))}
                {f.fca_report_id && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider bg-green-50 text-green-600 border border-green-500/15">FCA Certified</span>
                )}
              </div>
              <div className="flex gap-4 text-xs text-gray-400 pt-3 border-t border-gray-100">
                <span>{f.factory_area || "—"}</span>
                <span>{f.employees || ""}</span>
              </div>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400 text-sm">No factories match. Try changing your filters.</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10 pb-16">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-navy hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Previous</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce<(number | "...")[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("..."); acc.push(p); return acc
            }, [])
            .map((item, i) => item === "..." ? <span key={`dots-${i}`} className="px-2 text-gray-400 text-sm">…</span> :
              <button key={item} onClick={() => setPage(item)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${page === item ? "bg-navy text-white" : "text-gray-600 hover:text-navy hover:bg-gray-50"}`}>{item}</button>)}
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-navy hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Next</button>
        </div>
      )}

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="bg-navy rounded-2xl p-12 md:p-14 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-1">
            <h2 className="font-serif text-[28px] font-semibold text-white leading-tight mb-2">Need help finding the right factory?</h2>
            <p className="text-white/60 text-[15px]">Tell us what you want to source. We will match you with verified manufacturers. Free consultation.</p>
          </div>
          <Link href="/enquiry" className="inline-flex items-center gap-2 px-7 py-3.5 bg-amber text-navy font-bold text-[15px] rounded-lg hover:bg-amber-dark transition-colors whitespace-nowrap flex-shrink-0">
            Book Free Consult
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
      </section>
    </div>
  )
}
