---
phase: 03-ui-audit
plan: 02
type: execute
wave: 2
depends_on: ["03-ui-audit-01"]
files_modified: []
autonomous: true
requirements: ["FORM-01", "FORM-02", "FORM-03"]
user_setup: []
must_haves:
  truths:
    - "Tests verify FORM-01: Form inputs usable on mobile without keyboard covering them"
    - "Tests verify FORM-02: Form labels remain visible when input is focused on mobile"
    - "Tests verify FORM-03: Submit button is accessible on mobile without scrolling"
  artifacts:
    - path: "frontend/tests/mobile/form-keyboard.spec.ts"
      provides: "Test for FORM-01 keyboard avoidance"
    - path: "frontend/tests/mobile/form-labels.spec.ts"
      provides: "Test for FORM-02 label visibility"
    - path: "frontend/tests/mobile/form-submit.spec.ts"
      provides: "Test for FORM-03 submit button accessibility"
  key_links: []
---

<objective>
Create validation tests for enquiry form mobile requirements

Purpose: Write Playwright tests to verify the keyboard avoidance issues exist. Per CONTEXT.md: test-driven flow is "Write test to verify issue exists -> Fix -> Verify test passes".

Output: Tests created that will validate the form requirements
</objective>

<context>
@/Users/mark/Projects/wag/.planning/phases/03-ui-audit/03-RESEARCH.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create mobile test directory and form-keyboard test</name>
  <files>frontend/tests/mobile/form-keyboard.spec.ts</files>
  <read_first>frontend/playwright.config.ts</read_first>
  <action>
Create tests/mobile/ directory and form-keyboard.spec.ts:

```typescript
import { test, expect } from '@playwright/test'

test.describe('FORM-01: Form inputs usable on mobile without keyboard issues', () => {
  const mobileViewports = [
    { width: 320, height: 568 },  // iPhone SE
    { width: 375, height: 667 },  // iPhone 14
    { width: 390, height: 844 },  // iPhone 14 Pro
  ]

  for (const viewport of mobileViewports) {
    test(`input focus visible at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto('/enquiry')

      // Focus on fullName input
      await page.locator('#fullName').focus()

      // Verify input is visible (not covered by keyboard)
      const inputBounds = await page.locator('#fullName').boundingBox()
      expect(inputBounds).not.toBeNull()
      expect(inputBounds!.y).toBeGreaterThan(0)

      // Input should be scrolled into view - check it's in upper portion of viewport
      expect(inputBounds!.y).toBeLessThan(viewport.height * 0.7)

      // Test email input
      await page.locator('#email').focus()
      const emailBounds = await page.locator('#email').boundingBox()
      expect(emailBounds).not.toBeNull()
      expect(emailBounds!.y).toBeLessThan(viewport.height * 0.7)

      // Test phone input
      await page.locator('#phone').focus()
      const phoneBounds = await page.locator('#phone').boundingBox()
      expect(phoneBounds).not.toBeNull()
      expect(phoneBounds!.y).toBeLessThan(viewport.height * 0.7)
    })
  }
})
```
  </action>
  <verify>
    <automated>ls -la frontend/tests/mobile/form-keyboard.spec.ts</automated>
  </verify>
  <done>Form keyboard test file created</done>
  <acceptance_criteria>
- [ ] File exists: frontend/tests/mobile/form-keyboard.spec.ts
- [ ] Contains: test for FORM-01
- [ ] Tests multiple viewport sizes
- [ ] Checks input visibility after focus
  </acceptance_criteria>
</task>

<task type="auto">
  <name>Task 2: Create form-labels test for FORM-02</name>
  <files>frontend/tests/mobile/form-labels.spec.ts</files>
  <read_first>frontend/playwright.config.ts</read_first>
  <action>
Create form-labels.spec.ts:

```typescript
import { test, expect } from '@playwright/test'

test.describe('FORM-02: Form labels remain visible when input is focused', () => {
  const mobileViewports = [
    { width: 320, height: 568 },  // iPhone SE
    { width: 375, height: 667 },  // iPhone 14
    { width: 390, height: 844 },  // iPhone 14 Pro
  ]

  for (const viewport of mobileViewports) {
    test(`labels visible on focus at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto('/enquiry')

      // Test fullName label visibility on focus
      await page.locator('#fullName').focus()
      const fullNameLabel = page.locator('label[for="fullName"]')
      await expect(fullNameLabel).toBeVisible()

      // Verify label is in viewport (not scrolled off)
      const labelBounds = await fullNameLabel.boundingBox()
      expect(labelBounds).not.toBeNull()
      expect(labelBounds!.y).toBeGreaterThan(0)

      // Test email label visibility
      await page.locator('#email').focus()
      const emailLabel = page.locator('label[for="email"]')
      await expect(emailLabel).toBeVisible()

      // Test companyName label visibility
      await page.locator('#companyName').focus()
      const companyLabel = page.locator('label[for="companyName"]')
      await expect(companyLabel).toBeVisible()
    })
  }
})
```
  </action>
  <verify>
    <automated>ls -la frontend/tests/mobile/form-labels.spec.ts</automated>
  </verify>
  <done>Form labels test file created</done>
  <acceptance_criteria>
- [ ] File exists: frontend/tests/mobile/form-labels.spec.ts
- [ ] Contains: test for FORM-02
- [ ] Tests label visibility on focus
- [ ] Uses toBeVisible() for assertion
  </acceptance_criteria>
</task>

<task type="auto">
  <name>Task 3: Create form-submit test for FORM-03</name>
  <files>frontend/tests/mobile/form-submit.spec.ts</files>
  <read_first>frontend/playwright.config.ts</read_first>
  <action>
Create form-submit.spec.ts:

```typescript
import { test, expect } from '@playwright/test'

test.describe('FORM-03: Submit button is accessible on mobile', () => {
  const mobileViewports = [
    { width: 320, height: 568 },  // iPhone SE
    { width: 375, height: 667 },  // iPhone 14
    { width: 390, height: 844 },  // iPhone 14 Pro
  ]

  for (const viewport of mobileViewports) {
    test(`submit button always visible at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto('/enquiry')

      // Scroll to bottom of form
      await page.locator('#message').scrollIntoViewIfNeeded()

      // Submit button should be visible without additional scrolling
      const submitButton = page.locator('button[type="submit"]')
      await expect(submitButton).toBeVisible()

      // Button should be in viewport (not pushed off screen)
      const buttonBounds = await submitButton.boundingBox()
      expect(buttonBounds).not.toBeNull()

      // Button should be near bottom of viewport (sticky positioning)
      expect(buttonBounds!.y + buttonBounds!.height).toBeLessThanOrEqual(viewport.height + 50)
      expect(buttonBounds!.y).toBeGreaterThan(viewport.height * 0.5)
    })
  }
})
```
  </action>
  <verify>
    <automated>ls -la frontend/tests/mobile/form-submit.spec.ts</automated>
  </verify>
  <done>Form submit test file created</done>
  <acceptance_criteria>
- [ ] File exists: frontend/tests/mobile/form-submit.spec.ts
- [ ] Contains: test for FORM-03
- [ ] Checks button is visible after scrolling to message
- [ ] Verifies button position in viewport
  </acceptance_criteria>
</task>

</tasks>

<verification>
Run all mobile form tests to verify they work:
- Start dev server: cd frontend && npm run dev
- Run tests: cd frontend && npx playwright test tests/mobile/ --project=mobile
</verification>

<success_criteria>
- [ ] form-keyboard.spec.ts created
- [ ] form-labels.spec.ts created
- [ ] form-submit.spec.ts created
- [ ] All tests can be listed via npx playwright test --list
</success_criteria>

<output>
After completion, create `.planning/phases/03-ui-audit/03-ui-audit-02-SUMMARY.md`
</output>
