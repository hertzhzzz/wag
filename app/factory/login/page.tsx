"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"

function LoginForm() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const from = searchParams.get("from") || "/factory"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/factory/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, from }),
        redirect: "manual",
      })

      if (res.type === "opaqueredirect" || res.redirected) {
        // API did a set-cookie + redirect; do full page nav
        window.location.href = from
        return
      }

      if (res.ok) {
        window.location.href = from
        return
      }

      const data = await res.json()
      if (data.error) {
        setError(data.error)
      }
    } catch {
      setError("Network error, try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 w-full max-w-sm shadow-sm">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-navy">Factory Wiki</h1>
        <p className="text-sm text-gray-500 mt-1">China Manufacturing Database</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Access Key
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
            placeholder="Enter access key"
            autoFocus
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full bg-navy text-white py-2 rounded-lg text-sm font-medium hover:bg-navy/90 disabled:opacity-50 transition"
        >
          {loading ? "Verifying..." : "Access Wiki"}
        </button>
      </form>

      <p className="text-xs text-gray-400 text-center mt-4">
        Authorized personnel only. Contact Mark for access.
      </p>
    </div>
  )
}

export default function FactoryLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Suspense fallback={
        <div className="bg-white rounded-lg border border-gray-200 p-8 w-full max-w-sm shadow-sm text-center">
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}
