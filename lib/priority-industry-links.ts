/**
 * Stable SSR-friendly internal links into the three C4 priority industry pages.
 * Shared by homepage and services so crawl paths cannot drift.
 */

export const SITE_PRIMARY_PATH_LABEL = 'Find and vet new suppliers'
export const SITE_SECONDARY_PATH_LABEL = 'Visit or verify an existing supplier'

export type PriorityIndustryLink = {
  slug: 'av-lighting' | 'construction' | 'agricultural-machinery'
  label: string
  href: `/industries/${PriorityIndustryLink['slug']}`
  blurb: string
}

export const PRIORITY_INDUSTRY_LINKS: readonly PriorityIndustryLink[] = [
  {
    slug: 'av-lighting',
    label: 'AV & Lighting',
    href: '/industries/av-lighting',
    blurb: 'Find and vet China AV and lighting suppliers for Australian projects.',
  },
  {
    slug: 'construction',
    label: 'Construction Materials',
    href: '/industries/construction',
    blurb: 'Source building materials with AS/NZS, NCC, and WaterMark risk in view.',
  },
  {
    slug: 'agricultural-machinery',
    label: 'Agricultural Machinery',
    href: '/industries/agricultural-machinery',
    blurb: 'Find farm-equipment suppliers that can clear Australian biosecurity.',
  },
] as const

export function listPriorityIndustryHrefs(): string[] {
  return PRIORITY_INDUSTRY_LINKS.map((item) => item.href)
}

export function getPriorityIndustryLink(slug: PriorityIndustryLink['slug']): PriorityIndustryLink {
  const found = PRIORITY_INDUSTRY_LINKS.find((item) => item.slug === slug)
  if (!found) {
    throw new Error(`Unknown priority industry slug: ${slug}`)
  }
  return found
}
