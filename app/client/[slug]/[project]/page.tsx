import { cookies, headers } from "next/headers"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import {
  getClientConfig,
  getProjectConfig,
  getDeliverableDisplayStatus,
  getStatusBadgeStyle,
  getDeliverableTypeLabel,
} from "@/lib/clients"
import { logAccess } from "@/lib/access-log"
import { MarkAsReviewedButton } from "./MarkAsReviewedButton"
import type {
  ClientConfig,
  ExtendedDeliverable,
  ExtendedClientProject,
} from "@/lib/clients"

// ---------------------------------------------------------------------------
// Design tokens from design.md
// ---------------------------------------------------------------------------

const card = "bg-white rounded-xl border border-gray-200 shadow-[0_4px_6px_rgba(15,45,94,0.08)]"
const cardPad = "p-6"
const sectionTitle = "font-sans text-lg font-semibold text-navy tracking-tight"

// ---------------------------------------------------------------------------
// Stats Cards Row
// ---------------------------------------------------------------------------

function StatsRow({
  deliverables,
  itinerary,
}: {
  deliverables: ExtendedDeliverable[]
  itinerary: Record<string, unknown>
}) {
  const total = deliverables.length
  const reviewed = deliverables.filter(
    (d) => getDeliverableDisplayStatus(d) === "client_reviewed" || d.status === "final"
  ).length
  const pending = deliverables.filter(
    (d) => getDeliverableDisplayStatus(d) === "delivered"
  ).length
  const draft = deliverables.filter(
    (d) => d.status === "draft"
  ).length

  const stats = [
    { label: "Total Deliverables", value: String(total), hint: "All project outputs" },
    { label: "Reviewed", value: String(reviewed), hint: "Client approved" },
    { label: "Pending Review", value: String(pending), hint: "Awaiting your action" },
    { label: "Trip Status", value: itinerary?.status === "completed" ? "Done" : itinerary?.dates ? "Scheduled" : "TBC", hint: itinerary?.dates as string || "To be confirmed" },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className={`${card} ${cardPad}`}>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            {s.label}
          </p>
          <p className="text-2xl font-bold text-navy">{s.value}</p>
          <p className="text-xs text-gray-400 mt-1">{s.hint}</p>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Product Requirements List
// ---------------------------------------------------------------------------

function ProductRequirements({
  matrix,
}: {
  matrix: ExtendedClientProject["product_matrix"]
}) {
  if (!matrix || matrix.length === 0) return null

  return (
    <section className={`${card} ${cardPad}`}>
      <h2 className={sectionTitle}>Product Requirements</h2>
      <p className="text-sm text-gray-500 mt-1 mb-4">
        Equipment and items required for the TV Studio build
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {matrix.map((row, i) => (
          <li
            key={i}
            className="flex items-center gap-2.5 text-sm text-gray-700 py-1.5 px-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-navy shrink-0" />
            {row.product}
          </li>
        ))}
      </ul>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Deliverable Status Badge
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}
    >
      {displayStatus === "client_reviewed" && (
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
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

// ---------------------------------------------------------------------------
// Deliverable Type Icon
// ---------------------------------------------------------------------------

const deliverableIconMap: Record<string, { bg: string; text: string; abbr: string; label: string }> = {
  due_diligence_report: { bg: "bg-blue-50", text: "text-blue-700", abbr: "DD", label: "Due Diligence" },
  itinerary: { bg: "bg-purple-50", text: "text-purple-700", abbr: "IT", label: "Itinerary" },
  price_comparison: { bg: "bg-emerald-50", text: "text-emerald-700", abbr: "PC", label: "Pricing" },
  inspection_report: { bg: "bg-amber-50", text: "text-amber-700", abbr: "IR", label: "Inspection" },
  photo_gallery: { bg: "bg-rose-50", text: "text-rose-700", abbr: "PG", label: "Photos" },
  contract_summary: { bg: "bg-indigo-50", text: "text-indigo-700", abbr: "CS", label: "Contract" },
}

function DeliverableIcon({ type }: { type: string }) {
  const cfg = deliverableIconMap[type] || { bg: "bg-gray-50", text: "text-gray-600", abbr: "?", label: type }
  return (
    <div
      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${cfg.bg} ${cfg.text}`}
      title={cfg.label}
    >
      {cfg.abbr}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Deliverables Section
// ---------------------------------------------------------------------------

function DeliverablesSection({
  deliverables,
  clientSlug,
  projectSlug,
}: {
  deliverables: ExtendedDeliverable[]
  clientSlug: string
  projectSlug: string
}) {
  return (
    <section className={`${card} overflow-hidden`}>
      <div className={`${cardPad} border-b border-gray-100 flex items-center justify-between`}>
        <div>
          <h2 className={sectionTitle}>Deliverables</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {deliverables.length} item{deliverables.length !== 1 ? "s" : ""} &middot;{" "}
            {deliverables.filter((d) => getDeliverableDisplayStatus(d) === "delivered").length} pending review
          </p>
        </div>
      </div>

      {deliverables.length === 0 ? (
        <div className={`${cardPad} text-center`}>
          <p className="text-sm text-gray-400">No deliverables yet. Check back soon.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {deliverables.map((d) => {
            const link = d.report_id
              ? `/client/${clientSlug}/${projectSlug}/reports/${d.report_id}`
              : null
            const displayStatus = getDeliverableDisplayStatus(d)
            const cfg = deliverableIconMap[d.type]

            return (
              <div
                key={d.id}
                className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50/30 transition-colors"
              >
                <DeliverableIcon type={d.type} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {link ? (
                      <Link
                        href={link}
                        className="text-sm font-semibold text-navy hover:text-navy-light transition-colors"
                      >
                        {d.title}
                      </Link>
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">{d.title}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <DeliverableStatusBadge deliverable={d} />
                    <span className="text-xs text-gray-400">
                      {cfg?.label || getDeliverableTypeLabel(d.type)}
                    </span>
                    {d.supplier && (
                      <span className="text-xs text-gray-400">&middot; {d.supplier}</span>
                    )}
                    {d.date && (
                      <span className="text-xs text-gray-400">&middot; {d.date}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {link && (
                    <Link
                      href={link}
                      className="text-xs font-medium text-navy hover:text-navy-light transition-colors"
                    >
                      View &rarr;
                    </Link>
                  )}
                  {displayStatus === "delivered" && (
                    <MarkAsReviewedButton
                      clientSlug={clientSlug}
                      projectSlug={projectSlug}
                      deliverableId={d.id}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Itinerary Sidebar
// ---------------------------------------------------------------------------

function ItinerarySidebar({
  itinerary,
}: {
  itinerary: Record<string, unknown>
}) {
  if (!itinerary || Object.keys(itinerary).length === 0) return null

  const suppliers = itinerary.suppliers_to_visit as
    | Array<{ name: string; city: string; category: string }>
    | undefined

  const statusLabel = itinerary?.status === "completed"
    ? "Completed"
    : itinerary?.status === "pending_confirmation"
    ? "Pending Confirmation"
    : "Scheduled"

  const statusColor = itinerary?.status === "completed"
    ? "bg-emerald-50 text-emerald-700"
    : itinerary?.status === "pending_confirmation"
    ? "bg-amber-50 text-amber-700"
    : "bg-blue-50 text-blue-700"

  return (
    <section className={`${card} ${cardPad}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={sectionTitle}>Trip</h2>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      <dl className="space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-500">Dates</dt>
          <dd className="font-medium text-gray-900">
            {(itinerary.dates as string) || "TBC"}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Base City</dt>
          <dd className="font-medium text-gray-900">
            {(itinerary.base_city as string) || "TBC"}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Travelers</dt>
          <dd className="font-medium text-gray-900">
            {itinerary.travelers ? `${itinerary.travelers}` : "TBC"}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Departure</dt>
          <dd className="font-medium text-gray-900">
            {(itinerary.departure_from as string) || "TBC"}
          </dd>
        </div>
      </dl>

      {suppliers && suppliers.length > 0 && (
        <>
          <hr className="my-4 border-gray-100" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Suppliers to Visit
          </h3>
          <ul className="space-y-3">
            {suppliers.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {s.city}{s.category ? ` · ${s.category}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

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
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8 lg:py-10">
        <p className="text-xs font-bold tracking-[0.15em] uppercase text-amber-400 mb-2">
          {client.client_company}
        </p>
        <h1 className="font-sans text-2xl lg:text-3xl font-bold tracking-tight">
          {project.name}
        </h1>
        <div className="flex flex-wrap items-center gap-3 mt-3">
          {project.location && (
            <span className="text-sm text-gray-300">{project.location}</span>
          )}
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
              project.status === "active"
                ? "bg-emerald-500/20 text-emerald-300"
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
// Page
// ---------------------------------------------------------------------------

export default async function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ slug: string; project: string }>
}) {
  const { slug: clientSlug, project: projectSlug } = await params

  const cookieStore = await cookies()
  const authCookie = cookieStore.get(`client_auth_${clientSlug}`)
  if (!authCookie?.value) {
    redirect(`/client/${clientSlug}`)
  }

  const client = getClientConfig(clientSlug)
  if (!client) notFound()

  const project = getProjectConfig(clientSlug, projectSlug)
  if (!project) notFound()

  try {
    const headersList = await headers()
    logAccess(clientSlug, projectSlug, `/client/${clientSlug}/${projectSlug}`, headersList.get("user-agent") || "")
  } catch { /* silent */ }

  const deliverables = (project.deliverables || []) as ExtendedDeliverable[]

  return (
    <>
      <ProjectHero project={project} client={client} />

      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8 space-y-6">
        {/* Executive Summary */}
        {project.executive_summary && (
          <section className={`${card} ${cardPad}`}>
            <p className="text-sm text-gray-600 leading-relaxed">
              {project.executive_summary}
            </p>
          </section>
        )}

        {/* Stats Row */}
        <StatsRow deliverables={deliverables} itinerary={(project.itinerary as Record<string, unknown>) || {}} />

        {/* Product Matrix */}
        <ProductRequirements matrix={project.product_matrix} />

        {/* Two-column: Deliverables + Itinerary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DeliverablesSection
              deliverables={deliverables}
              clientSlug={clientSlug}
              projectSlug={projectSlug}
            />
          </div>
          <div>
            <ItinerarySidebar itinerary={(project.itinerary as Record<string, unknown>) || {}} />
          </div>
        </div>
      </div>
    </>
  )
}
