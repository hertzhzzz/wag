import {
  getPriorityIndustryLink,
  listPriorityIndustryHrefs,
  PRIORITY_INDUSTRY_LINKS,
  SITE_PRIMARY_PATH_LABEL,
  SITE_SECONDARY_PATH_LABEL,
} from './priority-industry-links'

describe('priority industry links', () => {
  it('exposes exactly the three C4 priority industries in stable order', () => {
    expect(PRIORITY_INDUSTRY_LINKS.map((item) => item.slug)).toEqual([
      'av-lighting',
      'construction',
      'agricultural-machinery',
    ])
  })

  it('uses stable SSR-friendly industry hrefs', () => {
    expect(listPriorityIndustryHrefs()).toEqual([
      '/industries/av-lighting',
      '/industries/construction',
      '/industries/agricultural-machinery',
    ])
    for (const item of PRIORITY_INDUSTRY_LINKS) {
      expect(item.href).toBe(`/industries/${item.slug}`)
      expect(item.label.length).toBeGreaterThan(2)
      expect(item.blurb.length).toBeGreaterThan(20)
    }
  })

  it('keeps site-wide dual-path law: find-and-vet primary, visit/verify secondary', () => {
    expect(SITE_PRIMARY_PATH_LABEL).toMatch(/find|vet/i)
    expect(SITE_SECONDARY_PATH_LABEL).toMatch(/visit|verify|existing/i)
    expect(SITE_PRIMARY_PATH_LABEL).not.toEqual(SITE_SECONDARY_PATH_LABEL)
  })

  it('looks up a priority industry by slug', () => {
    expect(getPriorityIndustryLink('construction').href).toBe('/industries/construction')
  })
})
