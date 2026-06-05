import { readFileSync } from "fs"
import { join } from "path"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AnnotationButton } from "../components/annotation-button"
import { EvidenceImage } from "../components/evidence-image"

export const metadata = {
  title: "Factory Detail - WAG Wiki",
}

async function getFactory(slug: string) {
  try {
    const filePath = join(process.cwd(), "data/factory", `${slug}.json`)
    const raw = readFileSync(filePath, "utf-8")
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export default async function FactoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const factory = await getFactory(slug)

  if (!factory) {
    notFound()
  }

  const sections = factory._sections_order.map((key: string) => ({
    key,
    ...factory._sections[key],
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-navy text-white z-10 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <Link href="/factory" className="text-xs text-gray-300 hover:text-white transition">
              &larr; Factory List
            </Link>
            <h1 className="text-lg font-bold mt-0.5">
              {factory.company_name || "Unknown Factory"}
            </h1>
            <p className="text-xs text-gray-400">
              {[factory.province, factory.city, factory.district].filter(Boolean).join(" / ")}
              {factory.member_id && ` · ${factory.member_id}`}
            </p>
          </div>
          <div>
            {factory.platform_tags && (
              <div className="flex gap-1 flex-wrap justify-end">
                {(Array.isArray(factory.platform_tags)
                  ? factory.platform_tags
                  : factory.platform_tags.split(",").map((s: string) => s.trim()).filter(Boolean)
                ).map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {sections.map((section: { key: string; title: string; fields: string[] }) => (
          <section
            key={section.key}
            className="bg-white rounded-lg border border-gray-200 overflow-visible"
          >
            <h2 className="px-5 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-gray-800 text-sm">
              {section.title}
            </h2>
            <div className="divide-y divide-gray-100">
              {section.fields.map((field: string) => {
                const value = factory[field]
                const label = factory[`${field}_label`] || field
                const isEmpty =
                  value === "" || value === null || value === undefined ||
                  (Array.isArray(value) && value.length === 0)

                if (isEmpty && field !== "evidence_images") return null

                return (
                  <div
                    key={field}
                    className="px-5 py-3 flex items-start justify-between gap-4 hover:bg-gray-50/50 group"
                  >
                    <div className="flex-1 min-w-0">
                      <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                        {label}
                      </dt>
                      <dd className="text-sm text-gray-900 break-words">
                        <FieldValue field={field} value={value} />
                      </dd>
                    </div>
                    <AnnotationButton
                      memberId={factory.member_id}
                      slug={slug}
                      companyName={factory.company_name || "Unknown"}
                      fieldName={field}
                      fieldLabel={label}
                      actualValue={
                        typeof value === "string"
                          ? value
                          : Array.isArray(value)
                          ? value.join(", ")
                          : value != null
                          ? JSON.stringify(value)
                          : ""
                      }
                    />
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        {factory.fca_url && (
          <div className="text-center text-sm text-gray-400 pt-4 pb-8">
            <a
              href={factory.fca_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy hover:underline"
            >
              View original fcaReport on 1688
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

function FieldValue({ field, value }: { field: string; value: unknown }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-gray-300 italic">--</span>
  }

  if (field === "evidence_images" && Array.isArray(value)) {
    return (
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-1">
        {value.map((img: { url: string; section?: string }, i: number) => (
          <EvidenceImage key={i} url={img.url} alt={img.section || `Evidence ${i + 1}`} />
        ))}
      </div>
    )
  }

  if (field === "fca_equipment" && typeof value === "string") {
    const items = value.split(",").filter(Boolean)
    if (items.length === 0) return <span className="text-gray-300 italic">--</span>
    return (
      <ul className="list-disc list-inside space-y-0.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs">{item.trim()}</li>
        ))}
      </ul>
    )
  }

  if (typeof value === "string") {
    return <span>{value}</span>
  }

  return <span>{JSON.stringify(value)}</span>
}
