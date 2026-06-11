import fs from "node:fs"
import path from "node:path"

export interface ClientConfig {
  slug: string
  client_name: string
  client_company: string
  access_code_hash: string
  projects: ClientProject[]
}

export interface ClientProject {
  slug: string
  name: string
  status: string
  deliverables: Deliverable[]
  product_matrix: ProductMatrixEntry[]
  itinerary: Record<string, unknown>
}

export interface Deliverable {
  id: string
  type: string
  title: string
  status: "draft" | "delivered" | "client_reviewed" | "final"
}

export interface ProductMatrixEntry {
  product: string
  supplier: string
  status?: string
  match?: string
}

/**
 * Load client configuration from data/clients/{slug}.json.
 * Returns null if the file does not exist or is unparseable.
 */
export function getClientConfig(slug: string): ClientConfig | null {
  try {
    const filePath = path.join(process.cwd(), "data", "clients", `${slug}.json`)
    const raw = fs.readFileSync(filePath, "utf-8")
    return JSON.parse(raw) as ClientConfig
  } catch {
    return null
  }
}

/**
 * Check whether a client slug has a valid configuration file.
 */
export function isValidClientSlug(slug: string): boolean {
  return getClientConfig(slug) !== null
}

/**
 * Build the environment variable name for a client's bcrypt code hash.
 * Example: CLIENT_CODE_aaron-sansoni
 */
export function clientCodeEnvVar(slug: string): string {
  return `CLIENT_CODE_${slug}`
}

// ---------------------------------------------------------------------------
// Extended types for client portal pages
// ---------------------------------------------------------------------------

export type DeliverableStatus = 'draft' | 'delivered' | 'client_reviewed' | 'final'

export type DeliverableType =
  | 'due_diligence_report'
  | 'itinerary'
  | 'price_comparison'
  | 'inspection_report'
  | 'photo_gallery'
  | 'contract_summary'

export interface ExtendedDeliverable extends Deliverable {
  supplier?: string
  category?: string
  date?: string
  client_reviewed?: boolean
  report_id?: string
}

export interface ExtendedClientProject extends ClientProject {
  location?: string
  executive_summary?: string
  deliverables: ExtendedDeliverable[]
}

/** Map the raw data (status + client_reviewed boolean) to the unified workflow status. */
export function getDeliverableDisplayStatus(d: {
  status: string
  client_reviewed?: boolean
}): DeliverableStatus {
  if (d.status === 'final') return 'final'
  if (d.status === 'draft') return 'draft'
  if (d.status === 'client_reviewed') return 'client_reviewed'
  if (d.status === 'delivered' && d.client_reviewed) return 'client_reviewed'
  return 'delivered'
}

export function getStatusBadgeStyle(status: DeliverableStatus): {
  bg: string
  text: string
  label: string
} {
  switch (status) {
    case 'draft':
      return { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Draft' }
    case 'delivered':
      return { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pending Review' }
    case 'client_reviewed':
      return { bg: 'bg-green-100', text: 'text-green-800', label: 'Reviewed' }
    case 'final':
      return { bg: 'bg-navy/10', text: 'text-navy', label: 'Final' }
  }
}

export function getMatchRatingStyle(match?: string): {
  bg: string
  text: string
  label: string
} {
  const rating = (match || '').toLowerCase()
  switch (rating) {
    case 'excellent':
      return { bg: 'bg-green-100', text: 'text-green-800', label: 'Excellent' }
    case 'good':
      return { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Good' }
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Pending' }
  }
}

export function getDeliverableTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    due_diligence_report: 'Due Diligence Report',
    itinerary: 'Itinerary',
    price_comparison: 'Price Comparison',
    inspection_report: 'Inspection Report',
    photo_gallery: 'Photo Gallery',
    contract_summary: 'Contract Summary',
  }
  return labels[type] || type
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/** Get a specific project from a client config, or null. */
export function getProjectConfig(
  clientSlug: string,
  projectSlug: string,
): ExtendedClientProject | null {
  const client = getClientConfig(clientSlug)
  if (!client) return null
  const project = client.projects.find((p) => p.slug === projectSlug)
  return (project as ExtendedClientProject) ?? null
}

/** Find prev/next report deliverables for navigation. */
export function getReportPrevNext(
  clientSlug: string,
  projectSlug: string,
  reportId: string,
): { prev: ExtendedDeliverable | null; next: ExtendedDeliverable | null } {
  const project = getProjectConfig(clientSlug, projectSlug)
  if (!project) return { prev: null, next: null }

  const reports = project.deliverables.filter((d) => d.report_id) as ExtendedDeliverable[]
  const index = reports.findIndex((d) => d.report_id === reportId)

  return {
    prev: index > 0 ? reports[index - 1] : null,
    next: index < reports.length - 1 ? reports[index + 1] : null,
  }
}
