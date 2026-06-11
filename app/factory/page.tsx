import { readFileSync } from "fs"
import { join } from "path"
import Link from "next/link"
import Navbar from "@/components/Navbar"

export const metadata = {
  title: "Factory Wiki - Winning Adventure Global",
  description: "China manufacturing factory database",
}

async function getData() {
  const indexPath = join(process.cwd(), "data/factory/index.json")
  const raw = readFileSync(indexPath, "utf-8")
  return JSON.parse(raw)
}

interface FactoryItem {
  member_id: string
  slug: string
  company_name: string
  province: string
  city: string
  platform_tags: string[]
  certifications: string[]
  factory_area: string
  employees: string
  fca_report_id: string
  biz_scope: string
}

export default async function FactoryPage() {
  const data = await getData()
  const factories: FactoryItem[] = data.factories

  const provinces = [...new Set(factories.map((f: FactoryItem) => f.province).filter(Boolean))].sort()

  return (
    <>
      <Navbar rightContent={
        <a
          href="tel:+61416588198"
          className="flex flex-col items-start px-[14px] py-[8px] text-navy bg-white/80 border border-navy/20 hover:bg-navy hover:text-white flex-shrink-0 transition-all leading-tight"
        >
          <span className="text-[10px] font-medium uppercase tracking-wide">Call Us Today</span>
          <span className="text-[13px] font-semibold">+61 0416588198</span>
        </a>
      } />
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-[72px] bg-navy text-white z-10 shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">China Manufacturing Wiki</h1>
              <p className="text-xs text-gray-300">{data.total} factories</p>
            </div>
            <div className="flex gap-3 text-sm">
              <Link href="/factory/annotations" className="hover:text-amber-300 transition">
                Annotations
              </Link>
              <Link href="/" className="text-gray-400 hover:text-white transition">
                WAG Home
              </Link>
            </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <a
            href="?province="
            className="px-3 py-1 rounded-full text-xs font-medium bg-navy text-white"
          >
            All ({factories.length})
          </a>
          {provinces.map((p) => (
            <a
              key={p}
              href={`?province=${encodeURIComponent(p)}`}
              className="px-3 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 hover:border-navy hover:text-navy transition"
            >
              {p}
            </a>
          ))}
        </div>

        {/* Factory list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {factories.map((f: FactoryItem) => (
            <Link
              key={f.member_id}
              href={`/factory/${f.slug}`}
              className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-navy/30 transition group"
            >
              <h3 className="font-semibold text-gray-900 group-hover:text-navy transition truncate">
                {f.company_name}
              </h3>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                {f.province && <span>{f.province}</span>}
                {f.city && <span>{f.city}</span>}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {(f.platform_tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800"
                  >
                    {tag}
                  </span>
                ))}
                {(f.certifications || []).slice(0, 3).map((cert) => (
                  <span
                    key={cert}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700"
                  >
                    {cert}
                  </span>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-400 flex gap-3">
                {f.factory_area && <span>{f.factory_area}</span>}
                {f.employees && <span>{f.employees}</span>}
                {f.fca_report_id && <span className="text-green-600">深度认证</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
    </>
  )
}
