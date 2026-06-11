"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X, LayoutDashboard, FileText, Map } from "lucide-react"

interface NavGroup {
  label: string
  items: NavItem[]
}

interface NavItem {
  label: string
  href: string
  icon: "dashboard" | "report" | "trip"
}

const iconMap = {
  dashboard: LayoutDashboard,
  report: FileText,
  trip: Map,
}

export function Sidebar({
  clientSlug,
  projectSlug,
  projectName,
  deliverables,
  clientCompany,
}: {
  clientSlug: string
  projectSlug: string
  projectName: string
  deliverables: Array<{ id: string; title: string; report_id?: string | null }>
  clientCompany: string
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navGroups: NavGroup[] = [
    {
      label: projectName,
      items: [
        {
          label: "Overview",
          href: `/client/${clientSlug}/${projectSlug}`,
          icon: "dashboard",
        },
      ],
    },
    {
      label: "Deliverables",
      items: deliverables
        .filter((d) => d.report_id)
        .map((d) => ({
          label: d.title,
          href: `/client/${clientSlug}/${projectSlug}/reports/${d.report_id}`,
          icon: "report" as const,
        })),
    },
    {
      label: "Trip",
      items: [
        {
          label: "Itinerary",
          href: `/client/${clientSlug}/${projectSlug}#trip`,
          icon: "trip",
        },
      ],
    },
  ]

  function isActive(href: string): boolean {
    if (href.includes("#")) {
      const [basePath, hash] = href.split("#")
      return pathname === basePath && typeof window !== "undefined" && window.location.hash === `#${hash}`
    }
    return pathname === href
  }

  const sidebar = (
    <div className="flex flex-col h-full bg-navy text-white">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-400">
          {clientCompany}
        </p>
        <Link
          href={`/client/${clientSlug}/${projectSlug}`}
          className="block mt-1 text-sm font-semibold text-white hover:text-amber-400 transition-colors leading-tight"
        >
          {projectName}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = iconMap[item.icon]
                const active = isActive(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        active
                          ? "bg-white/15 text-white font-medium"
                          : "text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Icon size={16} strokeWidth={1.5} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-white/10">
        <Link
          href="/"
          className="text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          &larr; Back to main site
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-navy text-white shadow-lg"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative h-full">
          <button
            className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
          {sidebar}
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-60 z-30">
        {sidebar}
      </aside>
    </>
  )
}
