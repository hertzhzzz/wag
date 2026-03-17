# Codebase Concerns

**Analysis Date:** 2026-03-17

## High Priority

### Navbar Sticky Issue
- **Issue:** Mobile navbar does not stay fixed when scrolling - hamburger menu may be obscured
- **Files:** `frontend/app/components/Navbar.tsx`
- **Impact:** Users lose access to navigation after scrolling on mobile
- **Fix:** Add persistent mobile navigation with always-visible hamburger button

### Newsletter API Not Functional
- **Issue:** Newsletter endpoint only logs to console, no actual email sending
- **Files:** `frontend/app/api/newsletter/route.ts` (line 14: TODO comment)
- **Impact:** Users cannot subscribe to newsletter
- **Fix:** Integrate with Resend, Mailchimp, or ConvertKit

### Unstable Zod Version
- **Issue:** Using Zod v4.x which is experimental/unstable
- **Files:** `frontend/package.json` line 34: `"zod": "^4.3.6"`
- **Impact:** Potential breaking changes, API instability
- **Fix:** Downgrade to Zod v3.x stable (`^3.22.0`)

### Silent Error Handling
- **Issue:** Error boundary returns null, hiding errors silently
- **Files:** `frontend/app/error.tsx` line 22
- **Impact:** Users see blank screen on errors with no feedback
- **Fix:** Implement proper error UI with message and retry button

### Playwright Config Port Mismatch
- **Issue:** Tests point to port 3001 but dev server runs on 3000
- **Files:** `frontend/playwright.config.ts` line 11
- **Impact:** Tests will fail against default dev server
- **Fix:** Change baseURL to `http://localhost:3000`

## Medium Priority

### No Test Coverage
- **Issue:** No unit/integration tests exist
- **Files:** `frontend/tests/` is mostly empty
- **Impact:** High risk of regressions
- **Fix:** Add tests for API routes, forms, critical components

### Missing Environment Validation
- **Issue:** API uses env vars without null checks
- **Files:** `frontend/app/api/enquiry/route.ts` lines 10-11
- **Impact:** Runtime errors if env vars not set
- **Fix:** Add startup validation for required env vars

### Heavy Dependencies Bundle
- **Issue:** Large dependencies impact load time
- **Files:** `frontend/package.json` - @remotion/*, react-globe.gl, echarts
- **Impact:** Slow initial load
- **Fix:** Implement dynamic imports for heavy components

### Hardcoded Calendly URL
- **Issue:** Calendly URL hardcoded in component
- **Files:** `frontend/app/enquiry/page.tsx` line 33
- **Impact:** Cannot change without code change
- **Fix:** Move to environment variable

### Mobile Menu z-Index Conflict
- **Issue:** Mobile menu may have z-index conflicts
- **Files:** `frontend/app/components/Navbar.tsx` line 81
- **Impact:** Menu may appear behind content
- **Fix:** Ensure consistent z-index hierarchy

## Low Priority

### Viewport Meta Tag Warning
- **Issue:** maximumScale: 1 prevents user zoom
- **Files:** `frontend/app/layout.tsx` line 86
- **Impact:** Accessibility issue
- **Fix:** Remove maximumScale or set to 5

### Missing Input Sanitization
- **Issue:** Data stored/transmitted as raw values
- **Files:** `frontend/app/api/enquiry/route.ts` lines 54-59
- **Impact:** Low - HTML escaping done before email
- **Fix:** Consider input sanitization at form level

---

*Concerns audit: 2026-03-17*
