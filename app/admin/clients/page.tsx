import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"

interface ClientData { slug: string; client_name: string; client_company: string; lastAccess: string | null; reportViews: number }
interface ActivityItem { client_name: string; action_type: string; path: string; timestamp: string }

function formatAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const actionLabels: Record<string, string> = { "access-page": "Page", "dashboard": "Dashboard", "report-view": "Report" }

export default async function AdminClientsPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("admin_session")
  if (!sessionCookie?.value) { redirect("/admin") }

  const headersList = await headers()
  const host = headersList.get("host") || "localhost:3000"
  const proto = headersList.get("x-forwarded-proto") || "http"

  let clients: ClientData[] = []
  let activity: ActivityItem[] = []
  let lastVisit: string | null = null

  try {
    const res = await fetch(`${proto}://${host}/api/admin/clients`, {
      headers: { Cookie: `admin_session=${sessionCookie.value}` }
    })
    if (res.ok) {
      const data = await res.json()
      clients = data.clients || []
      activity = data.activity || []
      lastVisit = data.lastVisit || null
    } else if (res.status === 401) {
      redirect("/admin")
    }
  } catch { /* API unavailable — show empty state */ }

  if (clients.length === 0) {
    return <div><h1 className="font-serif text-2xl font-bold text-navy mb-6">Clients</h1><div className="bg-white rounded-lg border border-gray-200 p-8 text-center"><p className="text-gray-500 text-sm">No clients found.</p></div></div>
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-navy mb-6">Clients</h1>
      {activity.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-semibold text-navy mb-3">Recent Activity</h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm"><thead><tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"><th className="px-4 py-2">Client</th><th className="px-4 py-2">Action</th><th className="px-4 py-2">Path</th><th className="px-4 py-2">When</th></tr></thead><tbody className="divide-y divide-gray-100">
              {activity.map((entry, i) => {
                const isNew = lastVisit && entry.timestamp > lastVisit
                return (<tr key={i} className={isNew ? "bg-amber-50/50" : "hover:bg-gray-50/50"}><td className="px-4 py-2 font-medium text-gray-700">{entry.client_name}{isNew && <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">NEW</span>}</td><td className="px-4 py-2 text-gray-600">{actionLabels[entry.action_type] || entry.action_type}</td><td className="px-4 py-2 text-gray-500 font-mono text-xs max-w-[200px] truncate">{entry.path}</td><td className="px-4 py-2 text-gray-400 text-xs whitespace-nowrap">{formatAgo(entry.timestamp)}</td></tr>)
              })}
            </tbody></table>
          </div>
        </section>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((c) => (<Link key={c.slug} href={`/admin/clients/${c.slug}`} className="block bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-navy/30 transition group"><div className="flex items-start justify-between"><div><h3 className="font-semibold text-gray-900 group-hover:text-navy transition">{c.client_name}</h3><p className="text-xs text-gray-500 mt-1">{c.client_company}</p></div><span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-medium ${c.lastAccess && new Date(c.lastAccess).getTime() > Date.now() - 7 * 86400000 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{c.lastAccess && new Date(c.lastAccess).getTime() > Date.now() - 7 * 86400000 ? "Active" : "Inactive"}</span></div><div className="mt-3 flex items-center gap-4 text-xs text-gray-500"><span>{c.reportViews} report views</span>{c.lastAccess && <span>Last: {formatAgo(c.lastAccess)}</span>}{!c.lastAccess && <span className="text-gray-400">Never accessed</span>}</div></Link>))}
      </div>
    </div>
  )
}
