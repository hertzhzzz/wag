# Codebase Concerns

**Analysis Date:** 2026-03-16

## Tech Debt

**Newsletter Subscription Not Integrated:**
- Issue: Newsletter API only logs email addresses to console instead of storing/sending them
- Files: `/Users/mark/Projects/wag/frontend/app/api/newsletter/route.ts`
- Impact: Subscribers receive no confirmation, emails are lost on restart
- Fix approach: Integrate with Resend (already in package.json), Mailchimp, or store in Supabase

**ESLint Not Configured:**
- Issue: No ESLint configuration file exists; `npm run lint` prompts for setup
- Files: `/Users/mark/Projects/wag/frontend/package.json` (has eslint-config-next)
- Impact: No automated code quality checks, inconsistent formatting
- Fix approach: Create `.eslintrc.json` with Next.js recommended config

**Build Failure (SWC Binary Missing):**
- Issue: Next.js build fails with "Failed to load SWC binary for darwin/arm64"
- Files: `/Users/mark/Projects/wag/frontend/`
- Impact: Cannot run `npm run build` - blocks production deployment
- Fix approach: Install `@next/swc-darwin-arm64` or reinstall node_modules

**TypeScript Type Safety Gaps:**
- Issue: Multiple `as any` type casts used for blog article data
- Files: `/Users/mark/Projects/wag/frontend/app/resources/page.tsx` (lines 28, 30, 37)
- Impact: No compile-time checking for frontmatter fields
- Fix approach: Define proper TypeScript interfaces for blog frontmatter

**Unused Dependencies:**
- Issue: `resend` package installed but not used anywhere
- Files: `/Users/mark/Projects/wag/frontend/package.json`
- Impact: Larger bundle size, maintenance overhead
- Fix approach: Either use Resend for newsletter or remove from dependencies

**Zod Version Mismatch:**
- Issue: Using `zod@^4.3.6` which is not a stable version (latest stable is 3.x)
- Files: `/Users/mark/Projects/wag/frontend/package.json`
- Impact: May cause runtime errors or unexpected behavior
- Fix approach: Downgrade to `zod@^3.23.0` (latest stable 3.x)

## Known Bugs

**Error Boundary Silently Suppresses Errors:**
- Symptoms: Error component returns `null` instead of displaying error UI
- Files: `/Users/mark/Projects/wag/frontend/app/error.tsx`
- Trigger: Any runtime error in client components
- Workaround: User sees blank page with no feedback

**Newsletter Logs Personal Data:**
- Symptoms: Email addresses logged via `console.log` in production
- Files: `/Users/mark/Projects/wag/frontend/app/api/newsletter/route.ts` (line 16)
- Trigger: Any POST to `/api/newsletter`
- Workaround: N/A - privacy concern

## Security Considerations

**Email Authentication via Gmail App Password:**
- Risk: Using Gmail app password for SMTP is less secure than dedicated email service
- Files: `/Users/mark/Projects/wag/frontend/app/api/enquiry/route.ts`
- Current mitigation: Environment variables for credentials, HTML escaping for XSS
- Recommendations: Migrate to Resend API or dedicated transactional email service

**API Routes Lack Rate Limiting:**
- Risk: Enquiry and newsletter endpoints vulnerable to abuse/spam
- Files: `/Users/mark/Projects/wag/frontend/app/api/enquiry/route.ts`, `/Users/mark/Projects/wag/frontend/app/api/newsletter/route.ts`
- Current mitigation: Basic input validation with Zod
- Recommendations: Add rate limiting middleware or use API gateway

**Hardcoded Business Details in Multiple Locations:**
- Risk: Business information duplicated across components; maintenance burden
- Files: `/Users/mark/Projects/wag/frontend/app/layout.tsx`, `/Users/mark/Projects/wag/frontend/app/enquiry/page.tsx`, `/Users/mark/Projects/wag/frontend/app/api/enquiry/route.ts`
- Current mitigation: None
- Recommendations: Extract to shared constants or configuration

## Performance Bottlenunks

**Large Static Assets:**
- Problem: og-image.jpg is 3.2MB uncompressed
- Files: `/Users/mark/Projects/wag/frontend/public/og-image.jpg`
- Cause: No image optimization pipeline for public assets
- Improvement path: Compress or use Next.js image optimization

**No Build Optimization for Globe Library:**
- Problem: react-globe.gl is heavy; transpiled but not tree-shaken effectively
- Files: `/Users/mark/Projects/wag/frontend/next.config.js`
- Cause: Three.js dependency tree is large
- Improvement path: Consider lazy loading globe component or using lighter alternative

## Fragile Areas

**Blog Content File System Operations:**
- Why fragile: Synchronous fs operations in SSR; breaks if blog directory missing
- Files: `/Users/mark/Projects/wag/frontend/app/resources/page.tsx`, `/Users/mark/Projects/wag/frontend/app/sitemap.ts`, `/Users/mark/Projects/wag/frontend/app/resources/[slug]/page.tsx`
- Safe modification: Add try-catch and graceful fallback
- Test coverage: None - would fail at runtime if content missing

**Dynamic MDX Rendering:**
- Why fragile: Custom MDX components override standard elements; changes affect all articles
- Files: `/Users/mark/Projects/wag/frontend/app/resources/[slug]/page.tsx`
- Safe modification: Test rendering with sample content
- Test coverage: None

## Scaling Limits

**File-Based Blog System:**
- Current capacity: Limited by file system and manual frontmatter management
- Limit: No CMS; requires developer to add new content
- Scaling path: Consider headless CMS (Contentful, Sanity) or keep but add validation

**Synchronous File Reads:**
- Current capacity: Works for small blog (< 100 articles)
- Limit: Will block server response with larger content
- Scaling path: Implement caching or switch to database

## Dependencies at Risk

**nodemailer v8.0.1:**
- Risk: Old version (2023), has security issues in earlier versions
- Impact: SMTP auth vulnerabilities
- Migration plan: Upgrade to v6.x or switch to Resend API

**gray-matter v4.0.3:**
- Risk: Older package, minimal maintenance
- Impact: Potential parsing edge cases
- Migration plan: Consider front-matter (maintained) or keep if working

**zod v4.3.6:**
- Risk: Unusual version number - appears to be pre-release or fork
- Impact: Unclear stability
- Migration plan: Verify version and consider standard zod v3.x

## Missing Critical Features

**No Test Suite:**
- Problem: Zero unit or integration tests in codebase
- Blocks: Safe refactoring, regression detection

**No Admin Dashboard:**
- Problem: Referenced in CLAUDE.md (`dev:admin` script) but not implemented
- Blocks: Content management without code commits

**No Form Submission Storage:**
- Problem: Enquiry emails sent but not stored in database
- Blocks: Analytics, follow-up tracking, CRM integration

## Test Coverage Gaps

**API Routes:**
- What's not tested: Validation schemas, email sending, error handling
- Files: `/Users/mark/Projects/wag/frontend/app/api/*`
- Risk: Validation bypass, runtime errors uncaught
- Priority: High

**Form Validation:**
- What's not tested: Client-side validation logic
- Files: `/Users/mark/Projects/wag/frontend/app/enquiry/page.tsx`
- Risk: Invalid data submitted to API
- Priority: Medium

**Blog Rendering:**
- What's not tested: MDX parsing, component mapping, fallback states
- Files: `/Users/mark/Projects/wag/frontend/app/resources/[slug]/page.tsx`
- Risk: Broken rendering for malformed content
- Priority: Medium

---

*Concerns audit: 2026-03-16*
