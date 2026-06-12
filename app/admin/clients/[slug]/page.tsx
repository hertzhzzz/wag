import { cookies } from "next/headers"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { readFileSync } from "fs"
import { join } from "path"

const SLUG_RE = /^[a-z0-9-]{2,64}$/

export default async function AdminClientDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!SLUG_RE.test(slug)) notFound()

  const cookieStore = await cookies()
  if (!cookieStore.get("admin_session")?.value) { redirect("/admin") }

  let clientName = ""
  let clientCompany = ""
  try {
    const raw = readFileSync(join(process.cwd(), "data", "clients", `${slug}.json`), "utf-8")
    const config = JSON.parse(raw)
    clientName = config.client_name || slug
    clientCompany = config.client_company || ""
  } catch { notFound() }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/clients" className="text-xs text-gray-400 hover:text-navy transition mb-1 inline-block">&larr; All Clients</Link>
        <h1 className="font-serif text-2xl font-bold text-navy">{clientName}</h1>
        <p className="text-sm text-gray-500">{clientCompany}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500 text-sm">Client detail view. Access logs and report data will appear here when the client accesses their portal.</p>
        <p className="text-xs text-gray-400 mt-2">Full analytics (KV integration) coming in next deployment.</p>
      </div>
    </div>
  )
}
