import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { readdirSync, readFileSync } from "fs"
import { join } from "path"

function formatAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default async function AdminClientsPage() {
  const cookieStore = await cookies()
  if (!cookieStore.get("admin_session")?.value) { redirect("/admin") }

  const clientsDir = join(process.cwd(), "data", "clients")
  let slugs: string[] = []
  try { slugs = readdirSync(clientsDir).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", "")) } catch { slugs = [] }

  const clients: Array<{ slug: string; client_name: string; client_company: string }> = []
  for (const slug of slugs) {
    try {
      const raw = readFileSync(join(clientsDir, `${slug}.json`), "utf-8")
      const config = JSON.parse(raw)
      clients.push({ slug, client_name: config.client_name || slug, client_company: config.client_company || "" })
    } catch { /* skip */ }
  }

  if (clients.length === 0) {
    return (<div><h1 className="font-serif text-2xl font-bold text-navy mb-6">Clients</h1><div className="bg-white rounded-lg border border-gray-200 p-8 text-center"><p className="text-gray-500 text-sm">No clients found.</p></div></div>)
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-navy mb-6">Clients</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((c) => (
          <Link key={c.slug} href={`/admin/clients/${c.slug}`} className="block bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-navy/30 transition group">
            <h3 className="font-semibold text-gray-900 group-hover:text-navy transition">{c.client_name}</h3>
            <p className="text-xs text-gray-500 mt-1">{c.client_company}</p>
            <div className="mt-3 text-xs text-gray-400">Click to view access logs</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
