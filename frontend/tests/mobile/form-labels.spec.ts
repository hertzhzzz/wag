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
