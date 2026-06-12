import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { validateAdminSession } from "@/lib/admin-auth"

export default async function AdminRecoverPage({
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
        <h1 className="text-xl font-bold text-navy text-center mb-2">Account Recovery</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your recovery key to regain access. This will sign out all existing sessions.
        </p>

        <form method="POST" action="/api/admin/recover" className="space-y-4">
          <div>
            <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-1">
              Recovery Key
            </label>
            <input
              id="key"
              name="key"
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              placeholder="Enter recovery key"
              autoFocus
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-amber-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition"
          >
            Recover Access
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          <a href="/admin" className="hover:text-navy transition">
            &larr; Back to login
          </a>
        </p>
      </div>
    </div>
  )
}
