import { cookies } from "next/headers"
import Link from "next/link"
import { validateAdminSession } from "@/lib/admin-auth"

export const metadata = {
  title: "Admin | Winning Adventure Global",
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("admin_session")
  const isLoggedIn = sessionCookie?.value && await validateAdminSession(sessionCookie.value)

  if (!isLoggedIn) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed left-0 top-0 bottom-0 w-60 bg-navy text-white flex flex-col">
        <div className="px-5 py-6 border-b border-white/10">
          <p className="text-sm font-bold tracking-wide">WAG Admin</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavItem href="/admin/clients" label="Clients" />
          <div className="mt-4 mb-1 px-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Factory Wiki</p>
          </div>
          <NavItem href="/admin/factory/deploy" label="Deploy" />
          <div className="mt-4 mb-1 px-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Settings</p>
          </div>
          <NavItem href="/admin/settings" label="Access Codes" />
          <NavItem href="/admin/settings/audit" label="Audit Log" />
        </nav>

        <div className="px-5 py-4 border-t border-white/10">
          <form action="/api/admin/logout-all" method="POST">
            <button type="submit" className="text-xs text-white/50 hover:text-white transition w-full text-left">
              Sign Out All Sessions
            </button>
          </form>
        </div>
      </aside>

      <main className="ml-60 p-8">
        {children}
      </main>
    </div>
  )
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded text-sm text-white/70 hover:text-white hover:bg-white/10 transition"
    >
      {label}
    </Link>
  )
}
