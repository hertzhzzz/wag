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
