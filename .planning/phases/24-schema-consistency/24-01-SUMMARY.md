---
phase: 24-schema-consistency
plan: "01"
subsystem: schema
tags: [schema, seo, ai-crawler, geo]
dependency_graph:
  requires: []
  provides: [GEO-05]
  affects: []
tech_stack:
  added: []
  patterns: [server-rendered JSON-LD, dangerouslySetInnerHTML]
key_files:
  created: []
  modified:
    - app/components/PersonSchema.tsx
    - app/about/page.tsx
decisions:
  - "Removed Andy Liu LinkedIn URL from PersonSchema sameAs per D-04"
  - "Used server-compatible dangerouslySetInnerHTML pattern matching ArticleSchema/BreadcrumbSchema"
metrics:
  duration: "< 1 minute"
  completed: "2026-03-25"
---

# Phase 24 Plan 01: PersonSchema Server-Fix + ABN Verification Summary

## One-liner
PersonSchema converted to server-rendered JSON-LD with empty sameAs array; ABN on /about page now has clickable verification link.

## Completed Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Convert PersonSchema to server-compatible pattern | 8245a78c | app/components/PersonSchema.tsx |
| 2 | Add ABN verification link to /about page | 8245a78c | app/about/page.tsx |

## Acceptance Criteria Verification

### Task 1: PersonSchema Server-Render Fix
- `grep -n "use client" app/components/PersonSchema.tsx` — NO MATCHES (verified)
- `grep -n "useEffect" app/components/PersonSchema.tsx` — NO MATCHES (verified)
- `grep -n "linkedin" app/components/PersonSchema.tsx` — NO MATCHES (verified)
- `grep -n "dangerouslySetInnerHTML" app/components/PersonSchema.tsx` — 1 match (verified)
- `grep -n '"sameAs": \[\]' app/components/PersonSchema.tsx` — 1 match (verified)

### Task 2: ABN Verification Link
- `grep -n 'abr.business.gov.au' app/about/page.tsx` — 1 match with href containing ABN URL (verified)
- `grep -n '30659034919' app/about/page.tsx` — ABN appears in display and URL (verified)
- `grep -n 'rel="noopener noreferrer"' app/about/page.tsx` — 1 match (verified)

### Build Verification
- `npm run build` — PASSED

## Success Criteria

| Criteria | Status |
|----------|--------|
| PersonSchema renders server-side (visible to AI crawlers without JS) | PASS |
| PersonSchema sameAs array is empty (Andy Liu LinkedIn removed per D-04) | PASS |
| ABN on /about page has clickable verification link to abr.business.gov.au | PASS |

## Deviations from Plan
None — plan executed exactly as written.

## Known Stubs
None.
