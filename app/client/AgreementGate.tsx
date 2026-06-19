"use client"

import { useState, useEffect } from "react"

const COOKIE_NAME = "wag_client_agreed"

export function AgreementGate({
  clientCompany,
  children,
}: {
  clientCompany: string
  children: React.ReactNode
}) {
  const [agreed, setAgreed] = useState(true)

  useEffect(() => {
    const hasAgreed = document.cookie.includes(`${COOKIE_NAME}=1`)
    setAgreed(hasAgreed)
  }, [])

  if (agreed) return <>{children}</>

  const accept = () => {
    document.cookie = `${COOKIE_NAME}=1; path=/; max-age=31536000; SameSite=Lax`
    setAgreed(true)
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center p-8">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-xl border border-gray-200 p-8">
        <h2 className="font-serif text-xl font-bold text-navy mb-4">
          Client Portal Access Agreement
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Welcome to the {clientCompany} client portal. By continuing, you agree that:
        </p>
        <ul className="text-sm text-gray-600 space-y-1.5 list-disc pl-5 mb-6">
          <li>All reports, supplier data, and project information are confidential.</li>
          <li>Reports may not be shared, copied, or redistributed without written consent.</li>
          <li>Report pages contain visible watermarking for your protection.</li>
          <li>All portal access is logged for security and compliance.</li>
        </ul>
        <button
          onClick={accept}
          className="w-full bg-navy text-white font-semibold px-6 py-3 rounded-lg hover:bg-navy/90 transition text-sm"
        >
          I Agree — Continue to Portal
        </button>
        <p className="text-xs text-gray-400 mt-3 text-center">
          Winning Adventure Global Pty Ltd · ACN 697 886 150
        </p>
      </div>
    </div>
  )
}
