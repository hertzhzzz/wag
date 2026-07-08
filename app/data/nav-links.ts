// app/data/nav-links.ts
// 导航 mega menu 与 sitemap 的单一数据源。
// live=false 表示页面尚未上线（Phase 2-4 才建），不渲染、不进 sitemap，避免 404。
// heading/label 改为 i18n key — consuming 组件调用 t(l.label as TKey) 渲染

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
    heading: 'nav.menu.byService',
    links: [
      { label: 'nav.menu.allServicesOverview', href: '/services', live: true },
      { label: 'nav.menu.supplierVerification', href: '/supplier-verification', live: true },
      { label: 'nav.menu.factoryVisits', href: '/visiting-chinese-factories', live: true },
      { label: 'nav.menu.factoryAudit', href: '/factory-audit-china', live: true },
      { label: 'nav.menu.qualityInspection', href: '/quality-inspection-china', live: true },
    ],
  },
  {
    heading: 'nav.menu.byLocation',
    links: [
      { label: 'nav.menu.sydney', href: '/locations/sydney', live: true },
      { label: 'nav.menu.melbourne', href: '/locations/melbourne', live: true },
      { label: 'nav.menu.brisbane', href: '/locations/brisbane', live: true },
      { label: 'nav.menu.adelaide', href: '/locations/adelaide', live: true },
      { label: 'nav.menu.perth', href: '/locations/perth', live: true },
    ],
  },
  {
    heading: 'nav.menu.byIndustry',
    links: [
      { label: 'nav.menu.mining', href: '/industries/mining', live: true },
      { label: 'nav.menu.agriculturalMachinery', href: '/industries/agricultural-machinery', live: true },
      { label: 'nav.menu.activewear', href: '/industries/activewear', live: true },
      { label: 'nav.menu.construction', href: '/industries/construction', live: true },
      { label: 'nav.menu.electronics', href: '/industries/electronics', live: true },
    ],
  },
]

// 仅返回已上线链接 — 供 mega menu 渲染与 sitemap 注册共用。
export function liveNavLinks(): NavLink[] {
  return servicesMenu.flatMap((col) => col.links).filter((l) => l.live)
}
