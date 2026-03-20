---
phase: 10-content-strategy
plan: "02"
subsystem: content
tags: [faq, seo, schema, content-expansion]
dependency_graph:
  requires:
    - 10-01
  provides:
    - FAQ sections on Services and About pages
    - FAQPage schema on multiple pages
  affects:
    - app/data/faqs.ts
    - app/data/faqs-services.ts
    - app/data/faqs-about.ts
    - app/components/FAQ.tsx
    - app/components/FAQSchema.tsx
    - app/services/page.tsx
    - app/about/page.tsx
tech_stack:
  added:
    - Separate FAQ data files (faqs-services.ts, faqs-about.ts)
  patterns:
    - Per-page FAQ content for SEO uniqueness
    - FAQPage JSON-LD schema for rich snippets
key_files:
  created:
    - app/data/faqs-services.ts (13 service-specific FAQs)
    - app/data/faqs-about.ts (13 company-specific FAQs)
  modified:
    - app/data/faqs.ts (expanded from 4 to 12 questions)
    - app/components/FAQ.tsx (added optional faqs prop)
    - app/components/FAQSchema.tsx (added optional faqs prop)
    - app/services/page.tsx (added FAQ section + schema)
    - app/about/page.tsx (added FAQ section + schema)
decisions:
  - Created separate FAQ data files per page to ensure unique content for SEO
  - Modified FAQ/FAQSchema components to accept optional faqs prop for reusability
metrics:
  duration: 15 minutes
  completed_date: "2026-03-18"
  tasks_completed: 3/3
  files_created: 2
  files_modified: 5
---

# Phase 10 Plan 02: FAQ Expansion Summary

## One-Liner

Expanded FAQ data from 4 to 12 questions and added unique FAQ accordion sections with FAQPage schema to Services and About pages.

## Overview

This plan expanded the FAQ section across the website to improve SEO and address audience-specific concerns on each page. Created separate FAQ data files to ensure unique content per page (avoiding SEO duplication), and modified FAQ components to accept custom data.

## Tasks Completed

| Task | Name | Status |
|------|------|--------|
| 1 | Expand FAQ data from 4 to 10-15 questions | Complete |
| 2 | Add FAQ section to Services page | Complete |
| 3 | Add FAQ section to About page | Complete |

## Changes Made

### FAQ Data Expansion
- Expanded main `faqs.ts` from 4 to 12 questions (general sourcing concerns)
- Created `faqs-services.ts` with 13 service-specific questions (factory tours, procurement, timelines)
- Created `faqs-about.ts` with 13 company-specific questions (founder story, verification process, values)

### Component Updates
- Modified `FAQ.tsx` to accept optional `faqs` prop for custom data
- Modified `FAQSchema.tsx` to accept optional `faqs` prop for custom data
- Both components default to main faqs.ts if no prop provided (backward compatible)

### Page Updates

**Services Page:**
- Added import for FAQ, FAQSchema components
- Added `<FAQSchema faqs={serviceFaqs} />` for JSON-LD structured data
- Added FAQ accordion section with service-specific questions

**About Page:**
- Added import for FAQ, FAQSchema components
- Added `<FAQSchema faqs={aboutFaqs} />` for JSON-LD structured data
- Added FAQ accordion section with company-specific questions

## Verification

- Build passes: `npm run build` completes successfully
- FAQ count: Main faqs.ts has 12 questions (within 10-15 target)
- Services page has FAQ component and FAQSchema component (both required)
- About page has FAQ component and FAQSchema component (both required)
- Each page has unique FAQ content (different data files)

## Deviations from Plan

None - plan executed exactly as written.

## Requirements Met

- [x] FAQ section with 10-15 questions visible on website
- [x] FAQ section visible on Services page
- [x] FAQ section visible on About page
- [x] FAQPage schema markup present on Services and About pages
- [x] FAQ content is unique per page (no duplicate with homepage)
- [x] About page includes BOTH FAQ component AND FAQSchema component

## Self-Check

- [x] app/data/faqs-services.ts exists
- [x] app/data/faqs-about.ts exists
- [x] app/services/page.tsx imports FAQ and FAQSchema
- [x] app/about/page.tsx imports FAQ and FAQSchema
- [x] Commit 0fdb96aa exists

## Self-Check: PASSED
