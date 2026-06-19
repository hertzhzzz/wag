import { readFileSync, existsSync } from "fs"
import { join } from "path"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { EvidenceImage } from "../components/evidence-image"

interface RelatedArticle {
  slug: string
  title: string
  score: number
}

function getRelatedArticles(factorySlug: string): RelatedArticle[] {
  try {
    const graphPath = join(process.cwd(), "data/link-graph.json")
    if (!existsSync(graphPath)) return []
    const graph = JSON.parse(readFileSync(graphPath, "utf-8"))
    const refs: Array<{slug: string; score: number; title: string}> = graph.factory_to_articles?.[factorySlug] ?? []
    return refs.slice(0, 5)
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") console.error("[link-graph]", e)
    return []
  }
}

// Fields excluded from public display: address, registered_address, contact_person, legal_rep, credit_code
const PUBLIC_FIELDS: Record<string, string> = {
  company_name: "Company Name",
  province: "Province",
  city: "City",
  district: "District",
  established: "Established",
  annual_revenue: "Annual Revenue",
  factory_area: "Factory Area",
  employees: "Employees",
  production_workers: "Production Workers",
  monthly_output: "Monthly Output",
  export_ready: "Export Ready",
  custom_moq: "Custom MOQ",
  processing_methods: "Processing Methods",
  special_processes: "Special Processes",
  certifications: "Certifications",
  platform_tags: "Platform Tags",
  biz_scope: "Business Scope",
  company_type: "Company Type",
  registered_capital: "Registered Capital",
  reg_authority: "Registration Authority",
  business_term: "Business Term",
  annual_report_year: "Annual Report Year",
}

const FCA_FIELDS: Record<string, string> = {
  fca_total_equipment: "Total Equipment",
  fca_oem_ratio: "OEM Ratio",
  fca_odm_ratio: "ODM Ratio",
  fca_annual_new_models: "Annual New Models",
  fca_sample_cycle: "Sample Cycle",
  fca_warehouse_area: "Warehouse Area",
  fca_warehouse_type: "Warehouse Type",
  fca_quality_inspection: "Quality Inspection",
}

async function getFactory(slug: string) {
  const filePath = join(process.cwd(), "data/factory", `${slug}.json`)
  if (!existsSync(filePath)) return null
  return JSON.parse(readFileSync(filePath, "utf-8"))
}

function generateIntro(factory: Record<string, unknown>): string {
  const name = (factory.company_name as string) || ""
  const province = (factory.province as string) || ""
  const city = (factory.city as string) || ""
  const district = (factory.district as string) || ""
  const scope = (factory.biz_scope as string) || ""
  const established = (factory.established as string) || ""
  const employees = (factory.employees as string) || ""
  const area = (factory.factory_area as string) || ""
  const exportReady = (factory.export_ready as string) || ""
  const type = (factory.company_type as string) || ""
  const certs = (factory.certifications as string[]) || []
  const tags = (factory.platform_tags as string[]) || []
  const fcaReportId = (factory.fca_report_id as string) || ""
  const annualRevenue = (factory.annual_revenue as string) || ""
  const monthlyOutput = (factory.monthly_output as string) || ""
  const productionWorkers = (factory.production_workers as string) || ""

  // Parse scope for key product categories (first 3 semicolon-separated items)
  const scopeItems = scope.split(/[；;]/).filter(Boolean).slice(0, 3)
  const scopeSummary = scopeItems.length > 0
    ? scopeItems.map(s => s.trim()).join(", ").toLowerCase()
    : "industrial manufacturing"

  const location = [district, city, province].filter(Boolean).join(", ")

  const parts: string[] = []

  // Opening: company identity + location
  parts.push(`${name} is a verified Chinese manufacturer based in ${location}, China. ` +
    `The company specializes in ${scopeSummary}, serving both domestic and international markets.`)

  // History + scale
  const scaleDetails: string[] = []
  if (established) scaleDetails.push(`founded in ${established}`)
  if (area) scaleDetails.push(`operating from a ${area} production facility`)
  if (employees) scaleDetails.push(`employing approximately ${employees} staff`)
  if (productionWorkers) scaleDetails.push(`including ${productionWorkers} skilled production workers`)
  if (scaleDetails.length > 0) {
    parts.push(`${name} is ${scaleDetails.join(", ")}.`)
  }

  // Production capability
  const capDetails: string[] = []
  if (monthlyOutput) capDetails.push(`monthly production capacity of ${monthlyOutput}`)
  if (annualRevenue) capDetails.push(`annual revenue of ${annualRevenue}`)
  if (capDetails.length > 0) {
    parts.push(`The factory has ${capDetails.join(" and ")}.`)
  }

  // Quality & certifications
  if (certs.length > 0) {
    const certNames = certs.slice(0, 5).join(", ")
    parts.push(`Quality management is supported by certifications including ${certNames}.`)
  }

  // Export readiness
  if (exportReady && exportReady !== "—" && exportReady !== "否") {
    parts.push(`The factory is export-ready and experienced in international trade.`)
  } else if (exportReady === "否") {
    parts.push(`While primarily serving the domestic market, the factory is open to international partnership opportunities.`)
  }

  // Verification status
  if (fcaReportId) {
    parts.push(`This manufacturer has undergone a Factory Capability Assessment — a comprehensive on-site evaluation covering equipment, quality control processes, and production capacity — providing Australian importers with verified supplier intelligence.`)
  }
  if (tags.some(t => t.toLowerCase().includes("super"))) {
    parts.push(`The factory holds Super Factory status, a designation for manufacturers meeting the highest standards of production capability and operational excellence.`)
  }

  // Closing — directory context + CTA
  parts.push(`${name} is listed in the Winning Adventure Global factory directory, a free resource connecting Australian businesses with verified Chinese manufacturers across 30+ industries. Browse our directory to compare suppliers, review certifications, and find the right manufacturing partner for your sourcing needs.`)

  return parts.join(" ")
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—"
  if (Array.isArray(value)) return value.join(", ")
  return String(value)
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const factory = await getFactory(slug)
  if (!factory) return { title: "Factory Not Found" }
  const name = factory.company_name || "Factory"
  const province = factory.province_label || factory.province || ""
  const scope = factory.biz_scope ? (factory.biz_scope as string).split("；")[0]?.split(";")[0] : ""
  return {
    title: `${name} — ${province} ${scope} Manufacturer | WAG Factory Directory`,
    description: generateIntro(factory).slice(0, 160),
    openGraph: {
      title: `${name} — Verified China Factory`,
      description: `Verified ${scope} manufacturer in ${province}. ${factory.factory_area_label || factory.factory_area || ""} facility. Part of the WAG factory directory.`,
    },
  }
}

export default async function FactoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const factory = await getFactory(slug)
  if (!factory) notFound()

  const name = (factory.company_name as string) || "Unknown Factory"
  const province = (factory.province_label as string) || (factory.province as string) || ""
  const city = (factory.city_label as string) || (factory.city as string) || ""
  const tags = (factory.platform_tags as string[]) || []
  const certs = (factory.certifications as string[]) || []
  const hasFca = !!(factory.has_fca_report as boolean) || !!(factory.fca_report_id as string)
  const intro = generateIntro(factory)
  const evidenceImages: string[] = ((factory.evidence_images as Array<{url: string}>) || []).map((img) => img.url)
  const sections = (factory._sections as string[]) || []
  const sectionsOrder = (factory._sections_order as string[]) || sections

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <div className="text-xs text-gray-400 mb-4">
            <Link href="/factory" className="hover:text-amber-300 transition">Factory Directory</Link>
            <span className="mx-1.5">/</span>
            <span className="text-gray-200">{province}</span>
            <span className="mx-1.5">/</span>
            <span className="text-white">{name}</span>
          </div>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{name}</h1>
              <p className="text-gray-300 text-sm">
                {[province, city].filter(Boolean).join(", ")} · China
              </p>
            </div>
            <Link
              href={`/enquiry?factory=${encodeURIComponent(slug)}&name=${encodeURIComponent(name)}`}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-navy font-semibold px-5 py-2.5 rounded transition text-sm"
            >
              Source from this factory →
            </Link>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/15 text-white">
                {tag}
              </span>
            ))}
            {hasFca && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                Deep Certified
              </span>
            )}
            {certs.slice(0, 4).map((cert) => (
              <span key={cert} className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-200 border border-blue-500/30">
                {cert}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* About */}
            <section>
              <h2 className="text-lg font-bold text-navy mb-3">About This Factory</h2>
              <p className="text-gray-600 leading-relaxed text-sm">{intro}</p>
            </section>

            {/* Key Stats */}
            <section>
              <h2 className="text-lg font-bold text-navy mb-3">Key Statistics</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  ["Established", formatValue(factory.established_label || factory.established)],
                  ["Employees", formatValue(factory.employees_label || factory.employees)],
                  ["Factory Area", formatValue(factory.factory_area_label || factory.factory_area)],
                  ["Annual Revenue", formatValue(factory.annual_revenue_label || factory.annual_revenue)],
                  ["Monthly Output", formatValue(factory.monthly_output_label || factory.monthly_output)],
                  ["Production Workers", formatValue(factory.production_workers_label || factory.production_workers)],
                ].filter(([, v]) => v !== "—").map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3.5">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{label}</div>
                    <div className="text-sm font-semibold text-gray-800 mt-0.5">{value}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Capabilities */}
            <section>
              <h2 className="text-lg font-bold text-navy mb-3">Production Capabilities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ["Processing Methods", formatValue(factory.processing_methods)],
                  ["Special Processes", formatValue(factory.special_processes)],
                  ["Export Ready", formatValue(factory.export_ready_label || factory.export_ready)],
                  ["Custom MOQ", formatValue(factory.custom_moq_label || factory.custom_moq)],
                ].filter(([, v]) => v !== "—").map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3.5">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{label}</div>
                    <div className="text-sm text-gray-800 mt-0.5">{value}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Certifications */}
            {certs.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-navy mb-3">Certifications</h2>
                <div className="flex flex-wrap gap-2">
                  {certs.map((cert) => (
                    <span key={cert} className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {cert}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* FCA Report */}
            {hasFca && (
              <section>
                <h2 className="text-lg font-bold text-navy mb-3">Factory Capability Assessment</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(FCA_FIELDS).map(([key, label]) => {
                    const value = formatValue(factory[key] || factory[`${key}_label`])
                    if (value === "—") return null
                    return (
                      <div key={key} className="bg-green-50 rounded-lg p-3.5 border border-green-100">
                        <div className="text-[10px] text-green-600 uppercase tracking-wider font-medium">{label}</div>
                        <div className="text-sm font-semibold text-gray-800 mt-0.5">{value}</div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Evidence Images */}
            {evidenceImages.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-navy mb-3">Factory Images</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {evidenceImages.map((img, i) => (
                    <EvidenceImage key={i} url={img} alt={`${name} factory image ${i + 1}`} />
                  ))}
                </div>
              </section>
            )}

            {/* Business Info */}
            <section>
              <h2 className="text-lg font-bold text-navy mb-3">Business Information</h2>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(PUBLIC_FIELDS).map(([key, label]) => {
                      const value = formatValue(factory[key] || factory[`${key}_label`])
                      if (value === "—") return null
                      return (
                        <tr key={key} className="border-b border-gray-100 last:border-b-0">
                          <td className="px-4 py-2.5 text-gray-500 font-medium w-1/3 text-xs">{label}</td>
                          <td className="px-4 py-2.5 text-gray-800 text-xs">{value}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Related Articles */}
            {(() => {
              const related = getRelatedArticles(slug)
              if (related.length === 0) return null
              return (
                <section>
                  <h2 className="text-lg font-bold text-navy mb-3">Related Sourcing Guides</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {related.map((article) => (
                      <Link
                        key={article.slug}
                        href={`/article/${article.slug}`}
                        className="block bg-gray-50 rounded-lg p-3.5 hover:bg-navy/5 transition border border-gray-100"
                      >
                        <div className="text-xs text-gray-400 mb-0.5">Sourcing Guide</div>
                        <div className="text-sm font-medium text-navy leading-snug line-clamp-2">
                          {article.title}
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-3 text-right">
                    <Link href="/article" className="text-xs text-amber-600 hover:text-amber-700 font-medium transition">
                      View all sourcing guides →
                    </Link>
                  </div>
                </section>
              )
            })()}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* CTA Card */}
            <div className="bg-navy text-white rounded-lg p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-2">Want to source from this factory?</h3>
              <p className="text-sm text-gray-300 mb-4">
                We help Australian businesses verify, visit, and buy directly from Chinese manufacturers.
              </p>
              <ul className="text-xs text-gray-300 space-y-1.5 mb-5">
                <li>· Factory verification & due diligence</li>
                <li>· Guided factory visits with translator</li>
                <li>· Quality control & sample coordination</li>
                <li>· Door-to-door logistics from China to Australia</li>
              </ul>
              <Link
                href={`/enquiry?factory=${encodeURIComponent(slug)}&name=${encodeURIComponent(name)}`}
                className="block w-full text-center bg-amber-500 hover:bg-amber-400 text-navy font-semibold px-5 py-3 rounded transition text-sm"
              >
                Get a Free Quote →
              </Link>
              <p className="text-[10px] text-gray-500 mt-3 text-center">
                Free consultation · No obligation
              </p>
            </div>

            {/* Quick Facts */}
            <div className="bg-gray-50 rounded-lg p-5">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Facts</h4>
              <div className="space-y-2 text-xs">
                {[
                  ["Location", [province, city].filter(Boolean).join(", ")],
                  ["Certifications", certs.length > 0 ? `${certs.length} certifications` : "—"],
                  ["Deep Certified", hasFca ? "Yes" : "No"],
                  ["Export Ready", formatValue(factory.export_ready_label || factory.export_ready)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-gray-700 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-gray-50 rounded-lg p-8 text-center border border-gray-100">
          <h2 className="text-xl font-bold text-navy mb-2">Don&apos;t see what you need?</h2>
          <p className="text-gray-500 mb-4 max-w-lg mx-auto text-sm">
            Our factory database covers 30+ industries. Tell us your product requirements
            and we&apos;ll match you with verified manufacturers.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/factory"
              className="inline-block border border-navy text-navy px-6 py-2.5 rounded font-medium text-sm hover:bg-navy hover:text-white transition"
            >
              Browse All Factories
            </Link>
            <Link
              href="/enquiry"
              className="inline-block bg-navy text-white px-6 py-2.5 rounded font-medium text-sm hover:bg-navy/90 transition"
            >
              Request Factory Matching →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
