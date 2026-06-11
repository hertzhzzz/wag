import { headers } from "next/headers"
import Image from "next/image"
import { Sidebar } from "./Sidebar"
import { getClientConfig, getProjectConfig } from "@/lib/clients"
import type { ExtendedDeliverable } from "@/lib/clients"

function isMobileDevice(userAgent: string): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
}

export const metadata = {
  title: { template: "%s | WAG Client Portal", default: "Client Portal | Winning Adventure Global" },
  description: "Client report portal for Winning Adventure Global",
  robots: { index: false, follow: false },
}

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || ""

  if (isMobileDevice(userAgent)) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-8 text-center">
        <Image src="/logos/logo.png" alt="Winning Adventure Global" width={180} height={60} priority className="mb-6" style={{ width: "auto", height: "auto" }} />
        <h1 className="font-serif text-2xl font-bold text-navy mb-4">Desktop View Required</h1>
        <p className="text-gray-600 max-w-md text-sm leading-relaxed">
          Please open this page on a desktop or laptop computer for the best reading experience.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans -mt-[72px] pt-4">
      <div className="lg:pl-60">
        {children}
      </div>
    </div>
  )
}
