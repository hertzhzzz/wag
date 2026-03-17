# Phase 4: Resources + Testing - Research

**Researched:** 2026-03-17
**Domain:** Mobile responsive implementation + automated validation
**Confidence:** HIGH

## Summary

This phase addresses two key areas: (1) implementing 4 specific responsive fixes on the Resources page using established Tailwind patterns, and (2) performing full site validation across all 5 pages using Playwright automation. The Resources page fixes follow mobile-first responsive patterns established in Phases 1-3. Full site validation will verify 320px viewport compliance, touch target sizes, and navigation functionality.

**Primary recommendation:** Apply specific Tailwind responsive classes to ResourcesContent.tsx and extend existing Playwright test suite to verify all 5 pages meet mobile accessibility requirements.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Resources page responsive fixes (4 specific changes):
  - Hero: `py-14` → `py-8 md:py-14`
  - Title: `text-[42px]` → `text-[32px] md:text-[42px]`
  - Featured card padding: `p-10` → `p-6 md:p-10`
  - Newsletter button: add `flex-col md:flex-row` responsive layout
- Validation tool: browser-use with inherited Chrome profile (user's existing session)
- Validation scope: All 5 pages (Home, Services, About, Enquiry, Resources)

### Claude's Discretion
- Specific Tailwind class selection
- Animation and transition details
- Specific validation check items

### Deferred Ideas (OUT OF SCOPE)
- None — all responsive issues and validation are in scope
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Playwright | ^1.58.2 | E2E browser automation | Industry standard for responsive testing |
| browser-use | ^0.5.0 | AI-powered browser automation | Enables complex interaction testing |
| Tailwind CSS | ^3.4.0 | Responsive styling | Already integrated in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @playwright/test | ^1.58.2 | Test framework | Writing automated tests |
| @tailwindcss/typography | ^0.5.19 | MDX prose styling | Future blog content styling |

**Installation:**
```bash
# Already installed in frontend/
npm ls playwright @playwright/test browser-use
```

## Architecture Patterns

### Recommended Project Structure
```
frontend/
├── app/
│   ├── components/
│   │   ├── ResourcesContent.tsx    # Main file to fix
│   │   ├── Navbar.tsx              # Already fixed
│   │   └── ...
│   └── ...
├── tests/
│   ├── responsive/
│   │   ├── all-pages.spec.ts       # Existing: horizontal scroll test
│   │   └── resources-responsive.spec.ts  # NEW: Resources page tests
│   └── mobile/
│       ├── form-labels.spec.ts
│       ├── form-keyboard.spec.ts
│       └── form-submit.spec.ts
├── playwright.config.ts            # Already configured
└── package.json
```

### Pattern 1: Mobile-First Responsive Classes
**What:** Apply mobile styles by default, desktop overrides with `md:` prefix
**When to use:** All new responsive implementations
**Example:**
```tsx
// Source: Project conventions (Phase 1-3)
// Mobile: py-8 (32px), Desktop: md:py-14 (56px)
<div className="py-8 md:py-14">

// Mobile: text-32px, Desktop: md:text-42px
<h1 className="text-[32px] md:text-[42px]">

// Mobile: p-6 (24px), Desktop: md:p-10 (40px)
<div className="p-6 md:p-10">
```

### Pattern 2: Newsletter Flex Layout
**What:** Stack vertically on mobile, row on desktop
**When to use:** Form + button combinations
**Example:**
```tsx
// Source: Phase 1-3 responsive patterns
<form className="flex flex-col md:flex-row gap-4">
  <input className="flex-1" />
  <button>Subscribe</button>
</form>
```

### Pattern 3: Playwright Viewport Testing
**What:** Set specific viewport size before navigation
**When to use:** Testing responsive behavior
**Example:**
```typescript
// Source: tests/responsive/all-pages.spec.ts
const mobileViewport = { width: 320, height: 568 }
await page.setViewportSize(mobileViewport)
await page.goto('/resources')

// Check horizontal scroll
const hasHorizontalScroll = await page.evaluate(() => {
  return document.documentElement.scrollWidth > window.innerWidth
})
expect(hasHorizontalScroll).toBe(false)
```

### Pattern 4: Touch Target Verification
**What:** Verify element meets 44px minimum
**When to use:** Accessibility compliance testing
**Example:**
```typescript
// Source: globals.css (.touch-target class)
const button = page.locator('button').first()
const bounds = await button.boundingBox()
expect(bounds.height).toBeGreaterThanOrEqual(44)
```

### Anti-Patterns to Avoid
- **Hardcoded desktop values:** Never use `text-42px` without mobile fallback
- **Missing viewport tests:** Don't test only at desktop widths
- **Ignoring horizontal scroll:** Always verify 320px viewport doesn't overflow

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Responsive testing framework | Custom viewport testing | Playwright built-in viewport | Robust, cross-browser |
| Horizontal scroll detection | Manual visual check | Playwright `scrollWidth > innerWidth` | Automated, repeatable |
| Touch target verification | Manual measurement | Playwright boundingBox() | Programmatic, accurate |
| Browser automation setup | Raw Puppeteer | browser-use | Higher-level API, easier |

**Key insight:** Playwright already provides viewport control, element measurement, and scroll detection. Combine with existing test infrastructure rather than building custom solutions.

## Common Pitfalls

### Pitfall 1: Navbar Not Sticky on Scroll
**What goes wrong:** User reports navbar not accessible when scrolled down
**Why it happens:** Possible z-index conflict with overlays or missing fixed positioning
**How to avoid:**
- Ensure Navbar has `fixed top-0` and high z-index (`z-[100]`)
- Add body padding-top (`padding-top: 72px`) in globals.css
- Check for overlay elements with higher z-index
**Warning signs:** Fixed navbar disappears behind content, hamburger menu not clickable

### Pitfall 2: Horizontal Scroll at 320px
**What goes wrong:** Page scrolls horizontally on small mobile devices
**Why it happens:** Fixed-width elements, missing `max-width: 100%`
**How to avoid:**
- Set `overflow-x: hidden` on html/body
- Use `max-w-full` on images
- Test at 320px viewport specifically
**Warning signs:** `document.documentElement.scrollWidth > window.innerWidth` returns true

### Pitfall 3: Touch Targets Too Small
**What goes wrong:** Buttons/links unclickable on mobile
**Why it happens:** Missing `min-h-11` (44px) on interactive elements
**How to avoid:**
- Apply `min-h-11` to all buttons and clickable links
- Use `.touch-target` CSS utility class
- Verify with Playwright boundingBox()
**Warning signs:** Elements with boundingBox().height < 44

### Pitfall 4: Newsletter Form Broken on Mobile
**What goes wrong:** Input and button don't stack properly, one gets cut off
**Why it happens:** Missing `flex-col` on mobile, fixed width elements
**How to avoid:**
- Use `flex flex-col md:flex-row` for mobile-first stacking
- Ensure input has `flex-1` to fill available width
- Test at multiple viewport widths (320px, 375px)

## Code Examples

### Resources Page Responsive Fixes
```tsx
// Source: frontend/app/components/ResourcesContent.tsx
// Line 74: Hero - add mobile padding
<div className="bg-[#0F2D5E] py-8 md:py-14 px-4 md:px-12 ...">

// Line 77: Title - add responsive font size
<h1 className="font-serif text-white text-[32px] md:text-[42px] ...">

// Line 124: Featured card - add responsive padding
<div className="bg-white p-6 md:p-10 flex flex-col">

// Line 214: Newsletter form - add flex-col for mobile
<form onSubmit={handleSubscribe} className="flex flex-col md:flex-row max-w-[440px] mx-auto gap-4">
```

### Playwright Horizontal Scroll Test
```typescript
// Source: tests/responsive/all-pages.spec.ts (modified for new test)
import { test, expect } from '@playwright/test'

test.describe('Resources Page Mobile Responsive', () => {
  test('no horizontal scroll at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })
    await page.goto('/resources')

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth
    })
    expect(hasHorizontalScroll).toBe(false)
  })

  test('touch targets meet 44px minimum', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })
    await page.goto('/resources')

    // Get all buttons and links
    const interactiveElements = page.locator('button, a[href]')
    const count = await interactiveElements.count()

    for (let i = 0; i < count; i++) {
      const el = interactiveElements.nth(i)
      const bounds = await el.boundingBox()
      if (bounds && bounds.width > 0 && bounds.height > 0) {
        // Skip if element is hidden or off-screen
        const isVisible = await el.isVisible()
        if (isVisible) {
          expect(bounds.height).toBeGreaterThanOrEqual(44)
        }
      }
    }
  })
})
```

### Newsletter Responsive Layout
```tsx
// Source: frontend/app/components/ResourcesContent.tsx (Line 214-233)
// Current problematic code:
<form onSubmit={handleSubscribe} className="flex max-w-[440px] mx-auto">

// Fixed code:
<form onSubmit={handleSubscribe} className="flex flex-col md:flex-row max-w-[440px] mx-auto gap-4">
  <input
    type="email"
    className="flex-1 px-5 py-4 text-[14px]"
  />
  <button
    type="submit"
    className="bg-[#F59E0B] px-6 py-4 min-h-11"
  >
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual mobile testing | Playwright automated | Phase 1 (2026-03) | Enables CI/CD validation |
| Fixed pixel values | Mobile-first responsive | Phase 1 (2026-03) | Works across all devices |
| Browser DevTools manual | browser-use automation | Phase 3 (2026-03-16) | Faster validation cycles |

**Deprecated/outdated:**
- None currently applicable

## Open Questions

1. **Navbar accessibility issue**
   - What we know: User reports navbar not accessible when scrolled
   - What's unclear: Is this a z-index issue, overlay problem, or something else?
   - Recommendation: Test with Playwright at 320px viewport, check if hamburger is clickable when page is scrolled

2. **Validation server port**
   - What we know: baseURL is `http://localhost:3001` in playwright.config.ts
   - What's unclear: Should tests run against `localhost:3000` (main) or `localhost:3001` (admin)?
   - Recommendation: Use `localhost:3000` for main site testing, update config if needed

3. **browser-use integration**
   - What we know: browser-use is installed but not integrated into test suite
   - What's unclear: How to use browser-use with inherited Chrome profile for AI-assisted testing?
   - Recommendation: Start with Playwright for basic tests, explore browser-use for complex interactions later

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright ^1.58.2 |
| Config file | frontend/playwright.config.ts |
| Quick run command | `npx playwright test tests/responsive/all-pages.spec.ts --project=mobile` |
| Full suite command | `npx playwright test --project=mobile` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MOB-01 | No horizontal scroll at 320px | e2e | `npx playwright test tests/responsive/all-pages.spec.ts --project=mobile` | ✅ tests/responsive/all-pages.spec.ts |
| MOB-02 | Touch targets 44px minimum | e2e | `npx playwright test tests/mobile/touch-targets.spec.ts --project=mobile` | ❌ New file needed |
| MOB-03 | Navigation works on mobile | e2e | `npx playwright test tests/responsive/all-pages.spec.ts --project=mobile` | ✅ tests/responsive/all-pages.spec.ts |
| MOB-04 | Resources page responsive | e2e | `npx playwright test tests/responsive/resources-responsive.spec.ts --project=mobile` | ❌ New file needed |

### Sampling Rate
- **Per task commit:** `npx playwright test tests/responsive/all-pages.spec.ts --project=mobile`
- **Per wave merge:** `npx playwright test --project=mobile`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/responsive/resources-responsive.spec.ts` — covers MOB-04 (Resources page responsive fixes)
- [ ] `tests/mobile/touch-targets.spec.ts` — covers MOB-02 (touch target verification)
- [ ] Update `playwright.config.ts` baseURL if testing against port 3000 instead of 3001

## Sources

### Primary (HIGH confidence)
- Playwright Viewport Documentation - https://playwright.dev/docs/api/class-page#page-set-viewport-size
- Playwright BoundingBox - https://playwright.dev/docs/api/class-locator#locator-bounding-box
- Tailwind Responsive Design - https://tailwindcss.com/docs/responsive-design
- Project test files: `tests/responsive/all-pages.spec.ts`, `tests/mobile/form-labels.spec.ts`

### Secondary (MEDIUM confidence)
- WCAG Touch Target Size Guidelines - https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
- browser-use documentation (via npm package)

### Tertiary (LOW confidence)
- WebSearch for "Playwright mobile testing best practices 2025" - needs validation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Playwright already configured and in use
- Architecture: HIGH - Follows Phase 1-3 patterns
- Pitfalls: HIGH - Based on actual project code review

**Research date:** 2026-03-17
**Valid until:** 30 days (stable technology)
