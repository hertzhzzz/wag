---
phase: 16
plan: "01"
name: floating-contact-button
status: complete
completed: "2026-03-20T10:17:25Z"
duration: 188s
tasks:
  total: 2
  completed: 2
commits:
  - hash: be41195c
    message: "feat(16-01): add /api/contact endpoint for floating contact form"
  - hash: 82dc52a3
    message: "feat(16-01): add FloatingContactButton component with pulse ring animation"
files_created:
  - app/api/contact/route.ts
  - app/components/FloatingContactButton.tsx
files_modified:
  - app/globals.css
dependencies:
  requires: []
  provides:
    - FloatingContactButton component (default export)
    - /api/contact POST endpoint (email + message validation, nodemailer)
  affects: []
tech_stack:
  added:
    - "@/lib/rate-limit" (existing, used in contact route)
    - nodemailer (existing, used in contact route)
    - zod (existing, used in contact route)
  patterns:
    - CORS headers matching /api/enquiry pattern
    - Rate limiting via checkRateLimit helper
    - XSS prevention via escapeHtml function
    - Pulse ring keyframe animation with prefers-reduced-motion fallback
decisions:
  - "Created new /api/contact endpoint instead of reusing /api/enquiry due to payload mismatch (contact form only has email + message, enquiry requires fullName/companyName/industry)"
  - "Pulse ring positioned behind button using negative margin (absolute inset-0 -m-4) so ring appears behind the 56px button"
  - "Contact text label hidden on mobile (hidden sm:block) per UI-SPEC responsive spec"
key_links:
  - from: FloatingContactButton.tsx
    to: /api/contact
    via: fetch POST on form submit
    pattern: fetch.*api/contact.*POST
  - from: FloatingContactButton.tsx
    to: globals.css
    via: animate-pulse-ring class
    pattern: animate-pulse-ring
  - from: globals.css
    to: FloatingContactButton.tsx
    via: pulse-ring keyframe definition
    pattern: @keyframes pulse-ring
requirements:
  - SEO-02 (Floating contact button visible on all pages)
verification:
  build: PASSED (npm run build successful)
  lint: PASSED (ESLint on modified files passed; next lint has pre-existing config error unrelated to changes)
  api_schema: PASSED (contactSchema with email + message validation verified)
  component_exports: PASSED (FloatingContactButton default export verified)
---

# Phase 16 Plan 01: Floating Contact Button Summary

## Objective

Create the floating contact button component and its supporting API endpoint. Button is a Navy circle with pulse ring animation in the bottom-right corner, opening a modal with Email + Message fields.

## Completed Tasks

| # | Task | Commit | Status |
|---|------|--------|--------|
| 1 | Create /api/contact endpoint | be41195c | Done |
| 2 | Create FloatingContactButton component + pulse-ring CSS | 82dc52a3 | Done |

## What Was Built

### /api/contact (app/api/contact/route.ts)

- `POST` handler accepting `{ email: string, message: string }`
- Zod validation: email format, message 10-2000 chars
- CORS headers matching `/api/enquiry` pattern (ALLOWED_ORIGINS array)
- Rate limiting via `checkRateLimit()` from `@/lib/rate-limit`
- Nodemailer email sending to GMAIL_USER with brand-styled HTML template (Navy header, Amber accents)
- XSS prevention via `escapeHtml()` function
- Error responses: 400 validation, 429 rate limit, 500 server error, 200 success `{ ok: true }`

### FloatingContactButton (app/components/FloatingContactButton.tsx)

- Client component (`'use client'`) with useState/useEffect
- Fixed position: `bottom-5 right-5 z-[9999]`
- Pulse ring: absolute 64px ring with `animate-pulse-ring` class, hidden on mobile
- Button body: Navy (#0F2D5E) 56px circle with Mail icon
- Modal: backdrop-blur-sm overlay, ESC key + overlay click + X button all close
- Form: email input + message textarea with amber focus ring
- Submit: POST to `/api/contact`, loading + success + error states
- Success: checkmark icon, "Message Sent" heading, "Close" button
- Body scroll lock when modal open

### globals.css

- Added `@keyframes pulse-ring` before Tailwind directives
- `.animate-pulse-ring` class with 2s ease-in-out infinite animation
- `@media (prefers-reduced-motion: reduce)` disables animation

## Deviations from Plan

**None** — Plan executed exactly as written.

## Known Gap

The plan's `files_modified` list did NOT include `app/layout.tsx`. The FloatingContactButton component is created but NOT yet integrated into any page layout. Per the UI-SPEC, the component should be added to `app/layout.tsx` as a client component mounted once for site-wide visibility.

This gap should be addressed by either:
1. Adding `layout.tsx` modification to the plan's scope, or
2. Creating a follow-up task to integrate the component

## Self-Check

- [x] `app/api/contact/route.ts` created with contactSchema and z.object validation
- [x] `app/components/FloatingContactButton.tsx` created with default export
- [x] `app/globals.css` updated with pulse-ring keyframe and animate-pulse-ring class
- [x] Build passes (`npm run build` successful)
- [x] ESLint passes on modified files
- [x] Both commits exist: `be41195c`, `82dc52a3`

## Deferred Issues

- **layout.tsx integration**: FloatingContactButton not yet mounted in layout or any page. Component exists but not rendering on any page.
- **`next lint` pre-existing error**: `next lint` fails with "Invalid project directory provided" error. This is a pre-existing project configuration issue unrelated to these changes. ESLint passes directly on all modified files.
