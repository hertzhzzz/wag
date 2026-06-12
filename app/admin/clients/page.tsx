import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function AdminClientsPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("admin_session")

  if (!sessionCookie?.value) {
    redirect("/admin")
  }

  // Dynamic import to avoid module resolution issues
  const { validateAdminSession } = await import("@/lib/admin-auth")
  const valid = await validateAdminSession(sessionCookie.value)
  if (!valid) {
    redirect("/admin")
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-navy">Clients</h1>
      <p className="text-sm text-gray-500 mt-2">Session valid. Auth working.</p>
      <p className="text-xs text-gray-400 mt-1 font-mono">Version: {valid.version}, Created: {valid.created_at}</p>
    </div>
  )
}
