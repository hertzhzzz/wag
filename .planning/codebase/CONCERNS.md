# Codebase Concerns

**Analysis Date:** 2026-03-20

## Tech Debt

**Newsletter API - Email Service Not Integrated:**
- Issue: `app/api/newsletter/route.ts` line 65 has a TODO comment indicating email service integration is missing. Currently emails are only logged to console.
- Files: `app/api/newsletter/route.ts`
- Impact: Newsletter subscriptions are not actually stored or sent to any email service
- Fix approach: Integrate with Resend (already in package.json as `resend@^6.9.3`), Mailchimp, or ConvertKit

**Unused Supabase Configuration:**
- Issue: `.env.local.example` contains Supabase environment variables, but no Supabase client code exists in the codebase
- Files: `.env.local.example`
- Impact: Confusing setup - developers may expect Supabase to be used
- Fix approach: Either remove Supabase from .env.local.example or implement Supabase usage

**Large Component - EnquiryForm.tsx:**
- Issue: `app/enquiry/EnquiryForm.tsx` is 447 lines and contains multiple responsibilities (form state, validation, UI, Calendly widget, FAQ section)
- Files: `app/enquiry/EnquiryForm.tsx`
- Impact: Difficult to maintain, test, and modify
- Fix approach: Extract CalendlyWidget to `app/enquiry/components/CalendlyWidget.tsx`, FAQ data to separate file, form logic to custom hook

**Duplicate Calendly Widget:**
- Issue: CalendlyWidget is defined inline in `app/enquiry/EnquiryForm.tsx` (lines 11-38) AND as separate `app/components/CalendlyEmbed.tsx`
- Files: `app/enquiry/EnquiryForm.tsx`, `app/components/CalendlyEmbed.tsx`
- Impact: Code duplication, potential for inconsistencies
- Fix approach: Use CalendlyEmbed component in EnquiryForm

**In-Memory Rate Limiting Fallback:**
- Issue: `lib/rate-limit.ts` falls back to in-memory Map when Redis is not configured. This will not work correctly across multiple Vercel serverless instances
- Files: `lib/rate-limit.ts`
- Impact: Rate limiting is ineffective when deployed to Vercel without Upstash Redis
- Fix approach: Either require Redis in production or document this limitation clearly

## Known Bugs

**Error Boundary Silently Swallows Errors:**
- Issue: `app/error.tsx` returns `null` after logging, meaning error pages never render
- Files: `app/error.tsx`
- Symptoms: When an error occurs, users see nothing (blank area) instead of an error message
- Trigger: Any unhandled error in client components
- Workaround: None - errors are hidden from users

**Article Page Returns Empty Object:**
- Issue: `app/resources/[slug]/page.tsx` line 34 returns `{}` when article is not found, which could cause undefined access
- Files: `app/resources/[slug]/page.tsx`
- Symptoms: Potential runtime error if article frontmatter is accessed on null-like object
- Trigger: Accessing an invalid slug
- Workaround: Works because `generateMetadata` is called before the page render checks

## Security Considerations

**Console Logging of Email Addresses:**
- Risk: `app/api/newsletter/route.ts` line 67 logs email addresses to server console
- Files: `app/api/newsletter/route.ts`
- Current mitigation: Server-side only, not exposed to client
- Recommendations: Use structured logging with redacted PII, or remove email logging entirely

**Hardcoded Calendly URLs:**
- Risk: Calendly scheduling URLs are hardcoded in multiple places
- Files: `app/enquiry/EnquiryForm.tsx` (line 33), `app/components/CalendlyEmbed.tsx` (line 25)
- Current mitigation: Calendly URLs are public anyway
- Recommendations: Move to environment variables for easier testing with different calendars

**No Rate Limit on Newsletter Endpoint:**
- Risk: Newsletter endpoint only rate-limited by in-memory fallback (3 requests per minute)
- Files: `app/api/newsletter/route.ts`
- Current mitigation: None significant
- Recommendations: Ensure Upstash Redis is configured in production

**Missing API Input Sanitization Beyond Zod:**
- Risk: While Zod validates input, XSS is possible in email display (though escapeHtml is used in enquiry form)
- Files: `app/api/newsletter/route.ts`
- Current mitigation: Basic email regex validation
- Recommendations: Consider using DOMPurify if HTML is ever rendered from newsletter data

## Performance Bottlenecks

**External Calendly Script Loading:**
- Problem: Calendly widget.js is loaded dynamically on every page that includes EnquiryForm or CalendlyEmbed
- Files: `app/enquiry/EnquiryForm.tsx` (line 16), `app/components/CalendlyEmbed.tsx` (line 7)
- Cause: Script tag injected on component mount
- Improvement path: Use Next.js Script component with strategy="lazyOnload" or load only on specific pages

**No Component Code Splitting:**
- Problem: Large components like EnquiryForm (447 lines) are loaded as single chunks
- Files: `app/enquiry/EnquiryForm.tsx`
- Cause: No dynamic imports used
- Improvement path: Use `next/dynamic` for CalendlyEmbed and other heavy components

**Memory Rate Limit Map Never Cleared:**
- Problem: `lib/rate-limit.ts` line 26 creates a Map that grows indefinitely with new IPs
- Files: `lib/rate-limit.ts`
- Cause: No cleanup mechanism for expired entries
- Improvement path: Add periodic cleanup or use TTL-based Map implementation

## Fragile Areas

**Blog Content File System Operations:**
- Files: `app/resources/[slug]/page.tsx`
- Why fragile: Uses `fs.readdirSync` and `fs.readFileSync` directly - blocking I/O in App Router
- Safe modification: These are used in Server Components which is acceptable, but async alternatives would be better
- Test coverage: None

**CORS Origin Validation:**
- Files: `app/api/enquiry/route.ts`, `app/api/newsletter/route.ts`
- Why fragile: Hardcoded allowed origins list. If domain changes, code must be updated
- Safe modification: Move allowed origins to environment variables
- Test coverage: None

## Scaling Limits

**Newsletter Storage:**
- Current capacity: Emails logged to console only, not persisted anywhere
- Limit: Zero storage - data is lost
- Scaling path: Integrate with email service provider (Resend, Mailchimp, etc.)

**In-Memory State (Rate Limiting, Announcement Dismissal):**
- Current capacity: Works for single-instance deployment
- Limit: Vercel serverless = multiple instances = state not shared
- Scaling path: Use Upstash Redis (already in stack) for all state

## Dependencies at Risk

**nodemailer@^8.0.1:**
- Risk: This version range is unusual - nodemailer v8 exists but v6.x is the stable mainstream version
- Impact: May have compatibility issues or missing features
- Migration plan: Consider using Resend (already installed) instead, which has better Next.js integration

**react-globe.gl@^2.37.0:**
- Risk: Large visualization library, may have bundle size impact
- Impact: Significant if not code-split properly
- Migration plan: Evaluate if used; currently not visible in main pages but present in dependencies

**@remotion packages:**
- Risk: Heavy video animation library - complex setup
- Impact: Build times may be affected
- Migration plan: If Remotion is not actively used for video content, consider removing

## Missing Critical Features

**No Project Tests:**
- Problem: Entire project has zero test files in `app/` or `lib/` directories
- Blocks: Safe refactoring, regression detection, CI quality gates
- Priority: High

**Playwright Installed But Not Configured:**
- Problem: `@playwright/test@^1.58.2` in devDependencies but no `playwright.config.ts` or tests
- Blocks: E2E testing, visual regression testing
- Priority: Medium

**No API Route Tests:**
- Problem: `/api/enquiry` and `/api/newsletter` have no tests
- Blocks: Validation logic changes are risky
- Priority: High

## Test Coverage Gaps

**Untested API Routes:**
- What's not tested: All API routes (`/api/enquiry`, `/api/newsletter`)
- Files: `app/api/enquiry/route.ts`, `app/api/newsletter/route.ts`
- Risk: Validation logic, CORS handling, rate limiting not verified
- Priority: High

**Untested Form Validation:**
- What's not tested: Zod schemas, step validation in EnquiryForm
- Files: `app/api/enquiry/route.ts` (line 27-35), `app/enquiry/EnquiryForm.tsx` (lines 61-79)
- Risk: Invalid data could pass validation
- Priority: High

**Untested Rate Limiting:**
- What's not tested: Both Redis and in-memory fallback paths
- Files: `lib/rate-limit.ts`
- Risk: Rate limiting may not work as expected
- Priority: Medium

---

*Concerns audit: 2026-03-20*
