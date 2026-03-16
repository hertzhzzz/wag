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
