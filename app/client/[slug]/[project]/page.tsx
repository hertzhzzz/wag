import { cookies, headers } from "next/headers"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import Image from "next/image"
import {
  getClientConfig,
  getProjectConfig,
  getDeliverableDisplayStatus,
  getStatusBadgeStyle,
  getMatchRatingStyle,
  getDeliverableTypeLabel,
  slugify,
} from "@/lib/clients"
import { logAccess } from "@/lib/access-log"
import { MarkAsReviewedButton } from "./MarkAsReviewedButton"
import type {
  ClientConfig,
  ExtendedDeliverable,
  ExtendedClientProject,
} from "@/lib/clients"

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

function ProjectHero({
  project,
  client,
}: {
  project: ExtendedClientProject
  client: ClientConfig
}) {
  return (
    <div className="bg-navy text-white">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link
          href={`/client/${client.slug}`}
          className="text-xs text-gray-300 hover:text-white transition inline-block mb-3"
        >
          &larr; Back to projects
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-1">
              {client.client_company}
            </p>
            <h1 className="font-serif text-2xl font-bold">{project.name}</h1>
            {project.location && (
              <p className="text-sm text-gray-300 mt-1">
                {project.location}
              </p>
            )}
          </div>
          <span
            className={`shrink-0 px-3 py-1 rounded text-xs font-medium uppercase tracking-wide ${
              project.status === "active"
                ? "bg-green-500/20 text-green-300"
                : "bg-white/10 text-gray-300"
            }`}
          >
            {project.status === "active" ? "Active" : "Completed"}
          </span>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Executive Summary
// ---------------------------------------------------------------------------

function ExecutiveSummaryCard({ summary }: { summary: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="font-serif font-bold text-navy text-lg mb-2">
        Executive Summary
      </h2>
      <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Product-Supplier Matching Matrix
// ---------------------------------------------------------------------------

function ProductMatrix({
  matrix,
}: {
  matrix: ExtendedClientProject["product_matrix"]
}) {
  if (!matrix || matrix.length === 0) return null

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100">
        <h2 className="font-serif font-bold text-navy text-lg">
          Product-Supplier Matching Matrix
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-5 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">
                Product
              </th>
              <th className="px-5 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">
                Supplier
              </th>
              <th className="px-5 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">
                Match Rating
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {matrix.map((row, i) => {
              const style = getMatchRatingStyle(row.match)
              return (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 text-gray-900 font-medium">
                    {row.product}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{row.supplier}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}
                    >
                      {style.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Deliverables Section
// ---------------------------------------------------------------------------

function DeliverableStatusBadge({
  deliverable,
}: {
  deliverable: ExtendedDeliverable
}) {
  const displayStatus = getDeliverableDisplayStatus(deliverable)
  const style = getStatusBadgeStyle(displayStatus)

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${style.bg} ${style.text}`}
    >
      {displayStatus === "client_reviewed" && (
        <svg
          className="w-3 h-3"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2.5 6l2.5 3 4.5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {style.label}
    </span>
  )
}

function DeliverableIcon({ type }: { type: string }) {
  const colors: Record<string, string> = {
    due_diligence_report: "bg-blue-100 text-blue-700",
    itinerary: "bg-purple-100 text-purple-700",
    price_comparison: "bg-green-100 text-green-700",
    inspection_report: "bg-amber-100 text-amber-700",
    photo_gallery: "bg-pink-100 text-pink-700",
    contract_summary: "bg-indigo-100 text-indigo-700",
  }
  const colorClass = colors[type] || "bg-gray-100 text-gray-600"

  return (
    <div
      className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${colorClass}`}
    >
      {type === "due_diligence_report"
        ? "DD"
        : type === "itinerary"
          ? "IT"
          : type === "price_comparison"
            ? "PC"
            : type === "inspection_report"
              ? "IR"
              : type === "photo_gallery"
                ? "PG"
                : type === "contract_summary"
                  ? "CS"
                  : "DO"}
    </div>
  )
}

function getDeliverableLink(
  clientSlug: string,
  projectSlug: string,
  d: ExtendedDeliverable,
): string | null {
  if (d.report_id) {
    return `/client/${clientSlug}/${projectSlug}/reports/${d.report_id}`
  }
  if (d.type === "itinerary") return null
  return null
}

function DeliverablesSection({
  deliverables,
  clientSlug,
  projectSlug,
}: {
  deliverables: ExtendedDeliverable[]
  clientSlug: string
  projectSlug: string
}) {
  if (!deliverables || deliverables.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="font-serif font-bold text-navy text-lg mb-1">
          Deliverables
        </h2>
        <p className="text-sm text-gray-400">No deliverables added yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100">
        <h2 className="font-serif font-bold text-navy text-lg">
          Deliverables
        </h2>
      </div>
      <div className="divide-y divide-gray-100">
        {deliverables.map((d) => {
          const link = getDeliverableLink(clientSlug, projectSlug, d)
          const displayStatus = getDeliverableDisplayStatus(d)
          return (
            <div
              key={d.id}
              className="px-5 py-4 flex items-start gap-4 hover:bg-gray-50/50 transition"
            >
              <DeliverableIcon type={d.type} />
              <div className="flex-1 min-w-0">
                {link ? (
                  <Link href={link} className="text-sm font-medium text-gray-900 hover:text-navy transition">
                    {d.title}
                  </Link>
                ) : (
                  <p className="text-sm font-medium text-gray-900">{d.title}</p>
                )}
                <p className="text-xs text-gray-500 mt-0.5">
                  {getDeliverableTypeLabel(d.type)}
                  {d.supplier ? ` · ${d.supplier}` : ""}
                  {d.date ? ` · ${d.date}` : ""}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <DeliverableStatusBadge deliverable={d} />
                  {link && (
                    <Link href={link} className="text-xs text-navy hover:underline">
                      View report
                    </Link>
                  )}
                </div>
              </div>
              {displayStatus === "delivered" && (
                <MarkAsReviewedButton
                  clientSlug={clientSlug}
                  projectSlug={projectSlug}
                  deliverableId={d.id}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Itinerary Timeline
// ---------------------------------------------------------------------------

function ItinerarySection({
  itinerary,
}: {
  itinerary: Record<string, unknown>
}) {
  if (!itinerary || Object.keys(itinerary).length === 0) return null

  const suppliersToVisit = itinerary.suppliers_to_visit as
    | Array<{ name: string; city: string; category: string }>
    | undefined

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="font-serif font-bold text-navy text-lg mb-3">
        Itinerary
      </h2>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <span className="font-medium text-gray-900">Dates:</span>
          <span>{(itinerary.dates as string) || "TBC"}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span className="font-medium text-gray-900">Base City:</span>
          <span>{(itinerary.base_city as string) || "TBC"}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span className="font-medium text-gray-900">Travelers:</span>
          <span>
            {itinerary.travelers
              ? `${itinerary.travelers} people`
              : "TBC"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span className="font-medium text-gray-900">Departure:</span>
          <span>{(itinerary.departure_from as string) || "TBC"}</span>
        </div>
      </div>

      {suppliersToVisit && suppliersToVisit.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
            Suppliers to Visit
          </h3>
          <ul className="space-y-2">
            {suppliersToVisit.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-navy text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-500">
                    {s.city}
                    {s.category ? ` · ${s.category}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ slug: string; project: string }>
}) {
  const { slug: clientSlug, project: projectSlug } = await params

  // Auth check
  const cookieStore = await cookies()
  const authCookie = cookieStore.get(`client_auth_${clientSlug}`)
  if (!authCookie?.value) {
    redirect(`/client/${clientSlug}`)
  }

  // Read data
  const client = getClientConfig(clientSlug)
  if (!client) notFound()

  const project = getProjectConfig(clientSlug, projectSlug)
  if (!project) notFound()

  // Log access
  try {
    const headersList = await headers()
    logAccess(
      clientSlug,
      projectSlug,
      `/client/${clientSlug}/${projectSlug}`,
      headersList.get("user-agent") || "",
    )
  } catch {
    // silent
  }

  return (
    <>
      {/* Hero */}
      <ProjectHero project={project} client={client} />

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Executive Summary */}
        {project.executive_summary && (
          <ExecutiveSummaryCard summary={project.executive_summary} />
        )}

        {/* Product Matrix */}
        <ProductMatrix matrix={project.product_matrix} />

        {/* Two-column layout for deliverables and itinerary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DeliverablesSection
              deliverables={project.deliverables}
              clientSlug={clientSlug}
              projectSlug={projectSlug}
            />
          </div>
          <div>
            <ItinerarySection
              itinerary={project.itinerary as Record<string, unknown>}
            />
          </div>
        </div>
      </div>
    </>
  )
}
