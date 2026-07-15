import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { listPriorityIndustryHrefs } from './priority-industry-links'

const root = join(__dirname, '..')

function read(rel: string) {
  return readFileSync(join(root, rel), 'utf8')
}

const verificationPages = [
  'app/(public)/supplier-verification/page.tsx',
  'app/(public)/factory-audit-china/page.tsx',
  'app/(public)/quality-inspection-china/page.tsx',
] as const

const verificationContents = [
  'app/(public)/supplier-verification/SupplierVerificationContent.tsx',
  'app/(public)/factory-audit-china/FactoryAuditContent.tsx',
  'app/(public)/quality-inspection-china/QualityInspectionContent.tsx',
] as const

describe('C4 verification pages demotion', () => {
  const en = read('app/i18n/dictionaries/en.ts')
  const layout = read('app/layout.tsx')
  const gone = read('lib/gone-paths.ts')
  const supportNav = read('app/components/SecondaryPathSupportNav.tsx')

  it('keeps verification support pages live (no delete / merge / 301 list entry)', () => {
    for (const rel of verificationPages) {
      expect(existsSync(join(root, rel))).toBe(true)
    }
    expect(gone).not.toMatch(/"\/supplier-verification"/)
    expect(gone).not.toMatch(/"\/factory-audit-china"/)
    expect(gone).not.toMatch(/"\/quality-inspection-china"/)
  })

  it('frames verification as a secondary path / step, not the main product', () => {
    expect(en).toMatch(/Secondary path/)
    expect(en).toMatch(/step inside China sourcing|secondary path inside China sourcing/i)
    for (const rel of verificationPages) {
      const src = read(rel)
      expect(src).toMatch(/secondary path|Secondary path|support step/i)
      expect(src).not.toMatch(/China Sourcing for Australian Businesses/)
    }
    expect(supportNav).toMatch(/Secondary path in China sourcing/)
    expect(supportNav).toMatch(/not the primary commercial offer/)
  })

  it('links verification support pages back to home, services, and three priority industries', () => {
    expect(supportNav).toContain('href="/"')
    expect(supportNav).toContain('href="/services"')
    expect(supportNav).toMatch(/PRIORITY_INDUSTRY_LINKS/)
    expect(supportNav).toMatch(/href=\{item\.href\}/)
    // Shared module is the crawl-stable source of the three industry hrefs.
    expect(listPriorityIndustryHrefs()).toEqual([
      '/industries/av-lighting',
      '/industries/construction',
      '/industries/agricultural-machinery',
    ])
    for (const rel of verificationContents) {
      const src = read(rel)
      expect(src).toMatch(/SecondaryPathSupportNav/)
    }
  })

  it('does not introduce a new primary conversion surface on verification pages', () => {
    for (const rel of verificationContents) {
      const src = read(rel)
      expect(src).toMatch(/LeadForm/)
      expect(src).not.toMatch(/IndustryQualifiedLeadForm/)
      expect(src).not.toMatch(/Discuss Your Sourcing Project/)
    }
  })

  it('stops site-wide default metadata from owning primary sourcing commercial language via verification framing', () => {
    expect(layout).toMatch(/China Sourcing for Australian Businesses/)
    expect(layout).not.toMatch(/China Factory Tours & Supplier Verification for Australian Businesses/)
  })
})
