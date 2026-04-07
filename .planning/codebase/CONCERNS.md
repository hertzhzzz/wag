# Codebase Concerns

**Analysis Date:** 2026-04-07

## Tech Debt

**Unused Dependencies in .env.local.example:**
- `.env.local.example` defines `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `RESEND_API_KEY`
- These are **not used anywhere** in the codebase - the project uses Gmail/Nodemailer for email
- **Files:** `.env.local.example`
- **Fix:** Remove unused environment variable documentation, or implement the integrations

**Unused Dependency - Resend:**
- `package.json` includes `resend: ^6.9.3` but newsletter uses nodemailer instead
- **Impact:** Increased bundle size (resend is a substantial package)
- **Files:** `package.json`

**Supabase/Resend References:**
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `RESEND_API_KEY` defined in `.env.local.example` but never imported or used
- **Impact:** Dead documentation that could confuse developers

**In-Memory Rate Limiting (Serverless Incompatibility):**
- `lib/rate-limit.ts` lines 26-28: Uses in-memory `Map` for fallback rate limiting
- **Problem:** On Vercel/serverless, each invocation creates a new process, making the memory rate limit useless across cold starts
- **Files:** `lib/rate-limit.ts`
- **Impact:** Rate limiting may not work correctly in production serverless environment
- **Fix:** Use Upstash Redis consistently or implement a distributed cache

**Large File - EnquiryForm.tsx:**
- File: `app/enquiry/EnquiryForm.tsx`
- Lines: 487
- Concern: Approaches the 500-line threshold; contains multiple responsibilities (Calendly widget, LiveChat embed, multi-step form, FAQ section, contact info)
- Recommendation: Consider extracting CalendlyWidget, contact sections, or FAQ data into separate modules

**Type Safety Bypasses in Map Component:**
- File: `app/components/DirectorySection/DirectoryMapInner.tsx`
- Uses `@ts-ignore` comments (lines 102, 106, 108, 205, 207, 209) for custom marker options (`factories`, `city`, `isPrimary`)
- Risk: Could break silently if Leaflet types change
- Recommendation: Define proper TypeScript interfaces extending `L.MarkerOptions`

## Known Bugs

**Error Boundary Returns Null:**
- `app/error.tsx` line 22: `return null` - error UI is completely suppressed
- Users see no error feedback when errors occur
- **Files:** `app/error.tsx`
- **Impact:** Users experience silent failures with no indication something went wrong
- **Fix:** Return a meaningful error UI component instead of null

**Newsletter API Silent Failure:**
- `app/api/newsletter/route.ts` lines 114-119: If email sending fails, it logs the error but **still returns success** to the user
- Comment says "Still return success to user - they can manually follow up"
- **Files:** `app/api/newsletter/route.ts:114-119`
- **Impact:** Users think they subscribed successfully when they did not
- **Fix:** Return appropriate error status when email fails

**XSS Vulnerability in Newsletter Email Output:**
- `app/api/newsletter/route.ts` line 103: `${email}` is interpolated directly into HTML without escaping
- Unlike the enquiry route which uses `escapeHtml()`, the newsletter route does not escape the email
- **Files:** `app/api/newsletter/route.ts:103`
- **Impact:** Potential XSS if malicious email address is submitted
- **Fix:** Apply HTML escaping to the email variable

**DirectoryMap Marker Alignment and Zoom Behavior:**
- File: `app/components/DirectorySection/DirectoryMapBug.test.tsx`
- Status: TDD test file exists documenting expected behavior that may not be fully implemented
- Issues:
  1. Factory count inside marker may not be pixel-perfect centered
  2. At max zoom (zoom >= 14), markers should show pin icon instead of factory count
- Impact: Visual defects in map marker rendering at certain zoom levels

## Security Considerations

**Manual HTML Escaping in Enquiry Route:**
- `app/api/enquiry/route.ts` lines 38-45: Custom `escapeHtml()` function instead of using a vetted library
- **Files:** `app/api/enquiry/route.ts:38-45`
- **Current mitigation:** Function escapes `&`, `<`, `>`, `"`, `'`
- **Recommendation:** Consider using a well-tested library like `dompurify` or `escape-html`

**Hardcoded CORS Origins:**
- `app/api/enquiry/route.ts` lines 6-9 and `app/api/newsletter/route.ts` lines 20-25: Origins are hardcoded arrays
- **Files:** `app/api/enquiry/route.ts`, `app/api/newsletter/route.ts`
- **Impact:** Must manually update when adding new domains
- **Recommendation:** Consider environment-based configuration

**IP Detection for Rate Limiting:**
- `app/api/enquiry/route.ts` lines 80-82: IP from `x-forwarded-for` or `x-real-ip` headers
- **Impact:** Spoofable headers - attackers can bypass rate limiting by setting these headers
- **Recommendation:** Trust only reverse proxy headers, validate on trusted infrastructure

**Missing CSRF Protection:**
- API routes accept JSON with `Content-Type: application/json` but do not verify CSRF tokens
- **Files:** `app/api/enquiry/route.ts`, `app/api/newsletter/route.ts`
- **Current mitigation:** CORS origin checking provides some protection
- **Recommendation:** Add CSRF token verification for state-changing operations

## Performance Bottlenecks

**External iframe Widgets:**
- `app/enquiry/EnquiryForm.tsx` line 204: Loads `https://app.livechatai.com/aibot-iframe/cmndzab780001l204qa2lyy0x` iframe
- `app/enquiry/EnquiryForm.tsx` lines 33-34: Loads `https://assets.calendly.com/assets/external/widget.js` script
- **Files:** `app/enquiry/EnquiryForm.tsx`
- **Impact:** Both widgets load external resources that can slow page render and are outside your control
- **Recommendation:** Lazy load iframes, consider self-hosted alternatives

**Heavy Client-Side Dependencies:**
- `react-globe.gl` - Large 3D globe library (transpiled in next.config.js)
- `echarts` + `echarts-for-react` - Large charting library
- `leaflet` + `leaflet.markercluster` - Map libraries
- `remotion` - Video animation framework
- **Impact:** Significant bundle size; no bundle analysis visible in current setup
- **Recommendation:** Run `ANALYZE=true npm run build` to identify optimization opportunities

**In-Memory Rate Limit Map Growth:**
- `lib/rate-limit.ts` line 26: `memoryRateLimitMap` is a `Map` that never gets cleaned up (except on reset)
- **Impact:** Memory leak potential in long-running processes
- **Files:** `lib/rate-limit.ts`
- **Fix:** Add periodic cleanup of expired entries

## Fragile Areas

**File System Operations Without Error Recovery:**
- `app/resources/[slug]/article-utils.ts` lines 19-24: `getArticle()` returns null if file doesn't exist, but calling code may not handle null gracefully
- `app/resources/[slug]/article-utils.ts` line 14: `fs.readdirSync()` can throw if directory doesn't exist
- **Files:** `app/resources/[slug]/article-utils.ts`
- **Safe modification:** Ensure all callers check for null returns

**Newsletter API Structure Issue:**
- `app/api/newsletter/route.ts` lines 71-122: The email validation regex on line 74 is simpler than Zod validation used in enquiry route
- **Files:** `app/api/newsletter/route.ts`
- **Inconsistency:** Different validation approaches across API routes

**Memory Rate Limit Identifier Issue:**
- `lib/rate-limit.ts` line 49: Uses IP as identifier, but IP can be spoofed or shared (NAT)
- **Files:** `lib/rate-limit.ts`
- **Impact:** Legitimate users may share rate limit budget incorrectly

## Test Coverage Gaps

**DirectoryMap Test References Non-Existent Data:**
- `app/components/DirectorySection/DirectoryMap.test.tsx` line 13: Imports `directoryCities` from `./data/directory-cities`
- If this file doesn't exist or has different structure, tests will fail to run
- **Files:** `app/components/DirectorySection/DirectoryMap.test.tsx`
- **Risk:** Untested component - unclear if map markers render correctly

**Minimal Test Suite:**
- Only 2 test files found:
  - `app/components/DirectorySection/DirectoryMap.test.tsx` (135 lines)
  - `app/components/DirectorySection/DirectoryMapBug.test.tsx` (113 lines)
- Both are visual/UI tests using Playwright for the DirectoryMap component
- No unit tests for:
  - API routes (`app/api/*/route.ts`)
  - Utility functions (`lib/*.ts`)
  - MDX processing (`app/resources/[slug]/*`)
  - Form validation logic
- **Files:** Multiple

**Missing Unit Tests:**
- No unit tests for `lib/rate-limit.ts` (critical security component)
- No unit tests for `app/resources/[slug]/article-utils.ts`
- No unit tests for API routes

**Playwright Not in CI:**
- Tests exist but may not be integrated into CI/CD pipeline
- No `playwright.config.ts` visible in project root

## Error Handling Patterns

**Inconsistent Error Responses:**
- `app/api/enquiry/route.ts`: Returns structured `{ error, details }` JSON
- `app/api/newsletter/route.ts`: Returns inconsistent `{ error }` or `{ success: true }`
- **Files:** `app/api/enquiry/route.ts`, `app/api/newsletter/route.ts`

**Console.error Instead of Structured Logging:**
- Multiple files use `console.error()` directly:
  - `lib/rate-limit.ts:21, 42`
  - `app/api/enquiry/route.ts:169`
  - `app/api/newsletter/route.ts:116, 124`
  - `app/api/contact/route.ts:141`
  - `app/error.tsx:19`
- **Impact:** No structured error tracking, difficult to aggregate errors in production
- **Recommendation:** Use a logging library (pino, winston) with proper log levels

## Dependency Risks

**Next.js v16.1.7 - Very Recent Version:**
- `package.json` specifies `next: ^16.1.7`
- Version 16 is not yet widely adopted; breaking changes may appear in minor updates
- **Impact:** Need to monitor for breaking changes in future Next.js releases

**Zod v4.3.6 - Major Version:**
- `package.json` specifies `zod: ^4.3.6`
- Zod v4 is a major version with breaking changes from v3
- **Impact:** Ensure team is aware of Zod v4 API differences; some migration may be needed

**Playwright Test Dependencies:**
- Large dev dependencies in `node_modules` (playwright types: 10,251 lines)
- **Impact:** Slow installation, large node_modules

## Missing Infrastructure

**No Error Tracking Service:**
- No Sentry, LogRocket, or error monitoring service configured
- Email errors are logged to console only
- **Impact:** No visibility into production errors without SSHing to logs

**Gmail as Sole Email Provider:**
- All enquiry/contact/newsletter emails sent via Gmail SMTP
- No backup email provider configured
- **Impact:** Single point of failure for customer communication

---

*Concerns audit: 2026-04-07*
