# Testing Patterns

**Analysis Date:** 2026-03-17

## Test Framework

- **Framework:** Playwright v1.58.2
- **Config:** `frontend/playwright.config.ts`
- **Test Directory:** `frontend/tests/`

## Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests',
  baseURL: 'http://localhost:3001',
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },
})
```

**Note:** baseURL points to port 3001 (admin server), not 3000 (main dev server)

## Running Tests

```bash
# Run all tests
cd frontend
npx playwright test

# Run with HTML report
npx playwright test --reporter=html

# Run specific test file
npx playwright test tests/mobile/form-keyboard.spec.ts
```

## Test Structure

### Mobile Tests
- Location: `frontend/tests/mobile/`
- Tests: Form keyboard behavior, labels, submit button accessibility

### Responsive Tests
- Location: `frontend/tests/responsive/`
- Tests: Horizontal scroll, navigation, touch targets

### Viewport Configurations
- iPhone SE: 320x568
- iPhone 14: 375x667
- iPhone 14 Pro: 390x844
- iPad: 768x1024
- Desktop: 1280x720

## Test Patterns

### Viewport Testing
```typescript
test('page works on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto('/')
  // assertions
})
```

### Element Visibility
```typescript
await expect(element).toBeVisible()
await expect(element).toBeHidden()
```

### Accessibility
```typescript
// Check for focusable elements
await expect(button).toBeFocused()

// Check labels
const label = page.getByLabel('Email')
await expect(label).toBeVisible()
```

### Touch Targets
```typescript
// Verify touch target size >= 44px
const boundingBox = await element.boundingBox()
expect(boundingBox.height).toBeGreaterThanOrEqual(44)
```

## Current Test Coverage

- Form keyboard handling on mobile
- Form labels accessibility
- Submit button visibility
- Responsive layout at 320px viewport
- Horizontal scroll detection
- Navigation functionality
- Touch target sizing

## Missing Test Coverage

- API route testing
- Form validation testing
- Newsletter subscription
- Error boundary behavior
- 404 page
- Performance metrics

---

*Testing analysis: 2026-03-17*
