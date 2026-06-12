import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { validateAdminSession } from "@/lib/admin-auth"

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("admin_session")
  if (sessionCookie?.value && await validateAdminSession(sessionCookie.value)) {
    redirect("/admin/clients")
  }

  const sp = await searchParams
  const error = sp.error as string | undefined

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg border border-gray-200 p-8 w-full max-w-sm shadow-sm">
        <h1 className="text-xl font-bold text-navy text-center mb-6">WAG Admin</h1>

        <form method="POST" action="/api/admin/auth" className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              placeholder="Enter admin password"
              autoFocus
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-navy text-white py-2 rounded-lg text-sm font-medium hover:bg-navy/90 transition"
          >
            Sign In
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          <a href="/admin/recover" className="hover:text-navy transition">
            Lost password? Use recovery key
          </a>
        </p>
      </div>
    </div>
  )
}
