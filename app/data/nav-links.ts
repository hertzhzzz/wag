// app/data/nav-links.ts
// 导航 mega menu 与 sitemap 的单一数据源。
// live=false 表示页面尚未上线（Phase 2-4 才建），不渲染、不进 sitemap，避免 404。

export interface NavLink {
  label: string
  href: string
  live: boolean
}

export interface NavColumn {
  heading: string
  links: NavLink[]
}

export const servicesMenu: NavColumn[] = [
  {
    heading: 'By Service',
    links: [
      { label: 'All Services Overview', href: '/services', live: true },
      { label: 'Supplier Verification', href: '/supplier-verification', live: true },
      { label: 'Factory Audit', href: '/factory-audit-china', live: true },
      { label: 'Quality Inspection', href: '/quality-inspection-china', live: true },
    ],
  },
  {
    heading: 'By Location',
    links: [
      { label: 'Sydney', href: '/locations/sydney', live: true },
      { label: 'Melbourne', href: '/locations/melbourne', live: true },
      { label: 'Brisbane', href: '/locations/brisbane', live: false },
      { label: 'Adelaide', href: '/locations/adelaide', live: true },
      { label: 'Perth', href: '/locations/perth', live: false },
    ],
  },
  {
    heading: 'By Industry',
    links: [
      { label: 'Mining', href: '/industries/mining', live: false },
      { label: 'Agricultural Machinery', href: '/industries/agricultural-machinery', live: false },
      { label: 'Activewear', href: '/industries/activewear', live: false },
      { label: 'Construction', href: '/industries/construction', live: false },
      { label: 'Electronics', href: '/industries/electronics', live: false },
    ],
  },
]

// 仅返回已上线链接 — 供 mega menu 渲染与 sitemap 注册共用。
export function liveNavLinks(): NavLink[] {
  return servicesMenu.flatMap((col) => col.links).filter((l) => l.live)
}
