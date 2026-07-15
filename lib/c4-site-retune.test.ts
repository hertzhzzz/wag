import { readFileSync } from 'fs'
import { join } from 'path'
import { listPriorityIndustryHrefs, SITE_PRIMARY_PATH_LABEL, SITE_SECONDARY_PATH_LABEL } from './priority-industry-links'

const root = join(__dirname, '..')

function read(rel: string) {
  return readFileSync(join(root, rel), 'utf8')
}

describe('C4 homepage + services light retune', () => {
  const homepage = read('app/(public)/page.tsx')
  const servicesPage = read('app/(public)/services/page.tsx')
  const servicesContent = read('app/(public)/services/ServicesContent.tsx')
  const en = read('app/i18n/dictionaries/en.ts')

  it('frames homepage primary promise around China sourcing for Australian businesses', () => {
    expect(homepage).toMatch(/China Sourcing for Australian Businesses/)
    expect(en).toMatch(/China sourcing for Australian/)
    expect(en).toMatch(/Find and vet new suppliers\. Visit or verify an existing factory\./)
  })

  it('exposes stable internal links to all three priority industries on homepage and services', () => {
    expect(homepage).toMatch(/PriorityIndustryLinks/)
    expect(servicesContent).toMatch(/PriorityIndustryLinks/)
    for (const href of listPriorityIndustryHrefs()) {
      expect(servicesContent).toContain(href)
    }
  })

  it('presents find-and-vet as primary and visit/verify as secondary on services', () => {
    expect(servicesContent).toMatch(/Primary path: find and vet new suppliers/)
    expect(servicesContent).toMatch(/Secondary path: visit or verify/)
    expect(servicesPage).toMatch(/Find & Vet Suppliers|find and vet/i)
    expect(SITE_PRIMARY_PATH_LABEL).toMatch(/find|vet/i)
    expect(SITE_SECONDARY_PATH_LABEL).toMatch(/visit|verify/i)
  })

  it('stays a light retune — no mega-menu rebuild markers introduced', () => {
    expect(homepage).not.toMatch(/ServicesMegaMenu/)
    expect(servicesContent).toMatch(/serviceTiers|tiers/)
  })
})
