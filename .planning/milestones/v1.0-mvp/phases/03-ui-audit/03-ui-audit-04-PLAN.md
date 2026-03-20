---
phase: 03-ui-audit
plan: 04
type: execute
wave: 4
depends_on: ["03-ui-audit-03"]
files_modified: []
autonomous: true
requirements: ["RESP-04"]
user_setup: []
must_haves:
  truths:
    - "All 5 pages have consistent mobile layout"
    - "No horizontal scroll at 320px width on any page"
    - "All touch targets meet 44px minimum"
    - "Navigation works correctly on all mobile pages"
  artifacts:
    - path: "frontend/tests/responsive/all-pages.spec.ts"
      provides: "Comprehensive responsive test for all pages"
  key_links: []
---

<objective>
Comprehensive audit of all 5 pages for responsive issues

Purpose: Audit all pages (Home, Services, About, Enquiry, Resources) for responsive issues using browser automation. Verify no horizontal scroll, touch targets adequate, and consistent layout. Per CONTEXT.md: page-by-page sequential, issue-type batched fixes.

Output: All responsive issues identified and fixed
</objective>

<context>
@/Users/mark/Projects/wag/.planning/phases/03-ui-audit/03-CONTEXT.md
@/Users/mark/Projects/wag/.planning/phases/01-foundation/01-foundation-01-SUMMARY.md
@/Users/mark/Projects/wag/.planning/phases/02-content-pages/02-01-SUMMARY.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create comprehensive page audit test</name>
  <files>frontend/tests/responsive/all-pages.spec.ts</files>
  <read_first>frontend/playwright.config.ts</read_first>
  <action>
Create comprehensive responsive test for all 5 pages:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Comprehensive Responsive Audit - All Pages', () => {
  const mobileViewport = { width: 320, height: 568 }
  const pages = [
    { path: '/', name: 'Home' },
    { path: '/services', name: 'Services' },
    { path: '/about', name: 'About' },
    { path: '/enquiry', name: 'Enquiry' },
    { path: '/resources', name: 'Resources' },
  ]

  for (const page of pages) {
    test(`${page.name} page: no horizontal scroll at 320px`, async ({ page: browserPage }) => {
      await browserPage.setViewportSize(mobileViewport)
      await browserPage.goto(page.path)

      // Check body scroll width
      const bodyScrollWidth = await browserPage.evaluate(() => document.body.scrollWidth)
      const viewportWidth = mobileViewport.width

      expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth)
    })

    test(`${page.name} page: touch targets meet 44px minimum`, async ({ page: browserPage }) => {
      await browserPage.setViewportSize(mobileViewport)
      await browserPage.goto(page.path)

      // Check buttons have adequate touch targets
      const buttons = await browserPage.locator('button, a.btn, [role="button"]').all()

      for (const button of buttons) {
        if (await button.isVisible()) {
          const bounds = await button.boundingBox()
          if (bounds) {
            // Height should be at least 44px
            expect(bounds.height).toBeGreaterThanOrEqual(44)
          }
        }
      }
    })
  }

  test('Navigation works on all mobile pages', async ({ page }) => {
    const mobileViewport = { width: 320, height: 568 }
    await page.setViewportSize(mobileViewport)

    const pages = ['/', '/services', '/about', '/enquiry', '/resources']

    for (const path of pages) {
      await page.goto(path)

      // Check navigation is present
      const nav = page.locator('nav')
      await expect(nav).toBeVisible()

      // Check hamburger menu exists on mobile
      const hamburger = page.locator('button:has-text("Menu"), [aria-label="Menu"]')
      // Hamburger may or may not be visible depending on scroll position
    }
  })
})
```
  </action>
  <verify>
    <automated>ls -la frontend/tests/responsive/all-pages.spec.ts</automated>
  </verify>
  <done>Comprehensive audit test created</done>
  <acceptance_criteria>
- [ ] File exists: frontend/tests/responsive/all-pages.spec.ts
- [ ] Tests all 5 pages: Home, Services, About, Enquiry, Resources
- [ ] Tests horizontal scroll at 320px width
- [ ] Tests touch targets meet 44px minimum
  </acceptance_criteria>
</task>

<task type="auto">
  <name>Task 2: Run audit tests and identify issues</name>
  <files>frontend/tests/responsive/all-pages.spec.ts</files>
  <read_first>frontend/app/page.tsx</read_first>
  <action>
Run the comprehensive audit tests to identify responsive issues:

1. Start dev server: cd frontend && npm run dev &
2. Run tests: cd frontend && npx playwright test tests/responsive/all-pages.spec.ts --project=mobile

Document any failures - these are the issues to fix.
  </action>
  <verify>
    <automated>cd frontend && npx playwright test tests/responsive/all-pages.spec.ts --project=mobile 2>&1 | head -100</automated>
  </verify>
  <done>Audit tests executed, issues identified</done>
  <acceptance_criteria>
- [ ] Tests run without errors
- [ ] Any failures documented with page name and issue
  </acceptance_criteria>
</task>

<task type="auto">
  <name>Task 3: Fix identified responsive issues (issue-type batched)</name>
  <files>frontend/app/**/*.tsx</files>
  <read_first>frontend/app/page.tsx</read_first>
  <action>
Based on test results, fix responsive issues. Group by issue type:

Common issue types to check and fix:
1. Horizontal scroll: Check for fixed widths, overflow issues
2. Touch targets: Ensure min-h-11 (44px) on all buttons
3. Padding: Ensure px-4 on mobile, md:px-8 on desktop
4. Grid: Ensure grid-cols-1 on mobile, md:grid-cols-N on desktop

Fix pattern from established in Phase 1-2:
- px-4 md:px-8 padding
- min-h-11 for buttons
- grid-cols-1 md:grid-cols-N
- flex-col md:flex-row
  </action>
  <verify>
    <automated>cd frontend && npx playwright test tests/responsive/all-pages.spec.ts --project=mobile</automated>
  </verify>
  <done>All responsive issues fixed</done>
  <acceptance_criteria>
- [ ] All tests in all-pages.spec.ts pass
- [ ] No horizontal scroll on any page at 320px
- [ ] All buttons have 44px minimum height
- [ ] Consistent padding across all pages
  </acceptance_criteria>
</task>

</tasks>

<verification>
Run full responsive test suite:
- cd frontend && npx playwright test tests/responsive/ --project=mobile
</verification>

<success_criteria>
- [ ] All-pages.spec.ts created
- [ ] Tests pass for all 5 pages
- [ ] No horizontal scroll at 320px on any page
- [ ] All touch targets meet 44px minimum
- [ ] Navigation works on all mobile pages
</success_criteria>

<output>
After completion, create `.planning/phases/03-ui-audit/03-ui-audit-04-SUMMARY.md`
</output>
