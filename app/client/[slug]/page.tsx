import { cookies, headers } from "next/headers"
import Link from "next/link"
import { notFound } from "next/navigation"
import Image from "next/image"
import { getClientConfig } from "@/lib/clients"
import { logAccess } from "@/lib/access-log"
import type { ClientConfig, ExtendedClientProject } from "@/lib/clients"

function getProjectStatusColor(status: string): string {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800"
    case "completed":
      return "bg-navy/10 text-navy"
    default:
      return "bg-gray-100 text-gray-600"
  }
}

// ---------------------------------------------------------------------------
// Login form — uses native HTML form POST (no JS required)
// ---------------------------------------------------------------------------

function LoginForm({
  slug,
  error,
}: {
  slug: string
  error?: string
}) {
  const errorMessages: Record<string, string> = {
    invalid: "Invalid access code. Please try again.",
    missing: "Please enter your access code.",
    not_configured:
      "Access is not configured for this client. Please contact support.",
  }

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center px-4">
      <div className="bg-white rounded-lg border border-gray-200 p-8 w-full max-w-sm shadow-sm">
        <div className="text-center mb-6">
          <Image
            src="/logos/logo.png"
            alt="Winning Adventure Global"
            width={140}
            height={46}
            priority
            className="mx-auto mb-4"
            style={{ width: "auto", height: "auto" }}
          />
          <h1 className="text-xl font-bold text-navy">Client Portal</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your access code to continue
          </p>
        </div>

        <form
          method="POST"
          action="/api/client/auth"
          className="space-y-4"
        >
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="from" value={`/client/${slug}`} />

          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Access Code
            </label>
            <input
              id="code"
              name="code"
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              placeholder="Enter your access code"
              autoFocus
              required
              aria-label="Access code"
            />
          </div>

          {error && errorMessages[error] && (
            <p className="text-sm text-red-600 bg-red-50 rounded p-2">
              {errorMessages[error]}
            </p>
          )}

          {error && !errorMessages[error] && (
            <p className="text-sm text-red-600 bg-red-50 rounded p-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-navy text-white py-2 rounded-lg text-sm font-medium hover:bg-navy/90 transition"
            aria-label="Submit access code"
          >
            Access Portal
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          Authorised clients only. Contact your WAG representative for access.
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Project list (authenticated view)
// ---------------------------------------------------------------------------

function ProjectList({
  client,
  slug,
}: {
  client: ClientConfig
  slug: string
}) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-navy">
          Welcome, {client.client_name}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {client.client_company}
        </p>
      </div>

      {/* Project count */}
      <p className="text-sm text-gray-400 mb-4">
        {client.projects.length} project{client.projects.length !== 1 ? "s" : ""}
      </p>

      {/* Projects grid */}
      {client.projects.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-sm">
            No projects assigned yet. Check back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(client.projects as ExtendedClientProject[]).map((project) => (
            <Link
              key={project.slug}
              href={`/client/${slug}/${project.slug}`}
              className="block bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-navy/30 transition group"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-gray-900 group-hover:text-navy transition">
                  {project.name}
                </h3>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide ${getProjectStatusColor(project.status)}`}
                >
                  {project.status}
                </span>
              </div>
              {project.location && (
                <p className="mt-1.5 text-xs text-gray-500">
                  {project.location}
                </p>
              )}
              {project.deliverables.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {project.deliverables.slice(0, 3).map((d) => (
                    <span
                      key={d.id}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600"
                    >
                      {d.type === "due_diligence_report"
                        ? "Report"
                        : d.type === "itinerary"
                          ? "Itinerary"
                          : d.type === "price_comparison"
                            ? "Pricing"
                            : d.type === "inspection_report"
                              ? "Inspection"
                              : d.type === "photo_gallery"
                                ? "Photos"
                                : d.type}
                    </span>
                  ))}
                  {project.deliverables.length > 3 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium text-gray-400">
                      +{project.deliverables.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function ClientHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const sp = await searchParams
  const error = sp.error as string | undefined

  // Check auth via cookie
  const cookieStore = await cookies()
  const authCookie = cookieStore.get(`client_auth_${slug}`)
  const isAuthenticated = !!authCookie?.value

  // Read client config
  const client = getClientConfig(slug)
  if (!client) {
    notFound()
  }

  // Log access (non-blocking best-effort)
  try {
    const headersList = await headers()
    logAccess(
      slug,
      "",
      `/client/${slug}`,
      headersList.get("user-agent") || "",
      headersList.get("x-forwarded-for") || "",
      headersList.get("referer") || "",
      "access-page",
    )
  } catch {
    // silent
  }

  if (!isAuthenticated) {
    return <LoginForm slug={slug} error={error} />
  }

  // Direct redirect: if client has exactly 1 project, go straight to it
  if (client.projects.length === 1) {
    const { redirect } = await import("next/navigation")
    redirect(`/client/${slug}/${client.projects[0].slug}`)
  }

  return <ProjectList client={client} slug={slug} />
}
