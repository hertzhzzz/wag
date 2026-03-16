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

      // Scroll to the form to ensure it's visible
      await page.locator('#fullName').scrollIntoViewIfNeeded()

      // Navigate to Step 2 to access the submit button
      await page.locator('#fullName').fill('Test User')
      await page.locator('#email').fill('test@example.com')

      // Scroll to Continue button and click it
      const continueBtn = page.getByRole('button', { name: /continue/i })
      await continueBtn.scrollIntoViewIfNeeded()
      await continueBtn.click()
      await page.waitForTimeout(500)

      // Wait for Step 2 to be visible - use companyName which is first field in Step 2
      await expect(page.locator('#companyName')).toBeVisible({ timeout: 10000 })

      // Scroll to bottom of form using companyName
      await page.locator('#companyName').scrollIntoViewIfNeeded()

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
