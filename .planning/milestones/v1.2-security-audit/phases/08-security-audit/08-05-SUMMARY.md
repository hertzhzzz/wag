---
phase: 08-security-audit
plan: 05
subsystem: Dependencies
tags: [security, npm-audit, nextjs, react, dependencies]
dependency_graph:
  requires:
    - 08-01 (Next.js security upgrade)
    - 08-02 (Security headers)
    - 08-03 (Rate limiting)
    - 08-04 (GitHub Actions security)
  provides:
    - SEC-01 (npm audit no vulnerabilities)
  affects:
    - package.json
    - Build system
    - All pages
tech_stack:
  added:
    - React 19.2.4
    - Next.js 16.1.7
  patterns:
    - ESLint flat config
    - TypeScript strict mode
key_files:
  created:
    - .eslintrc.json
  modified:
    - package.json
    - package-lock.json
    - app/components/Coverage.tsx
    - app/components/ResourcesContent.tsx
    - app/enquiry/EnquiryForm.tsx
    - app/not-found.tsx
    - app/resources/page.tsx
decisions:
  - Removed browser-use (unused dependency with vulnerabilities)
  - Upgraded eslint-config-next to 15+ for glob vulnerability fix
  - Upgraded to Next.js 16.x (requires React 19)
  - Used type casting for external library types (Globe, gray-matter)
metrics:
  duration: "~3 minutes"
  completed: "2026-03-18"
  tasks: 4
  files: 8
---

# Phase 08 Plan 05: npm Audit Gap Closure Summary

## Objective

Close the npm audit vulnerability gap by removing unused browser-use package, upgrading eslint-config-next to 15+, and upgrading Next.js to version 16.x. These changes fix the 21 high severity vulnerabilities from transitive dependencies.

## Completed Tasks

| Task | Name | Commit | Status |
|------|------|--------|--------|
| 1 | Remove unused browser-use dependency | e96310d9 | Done |
| 2 | Upgrade eslint-config-next to version 15+ | e96310d9 | Done |
| 3 | Upgrade Next.js to version 16.x and React 19 | 3386f0e9 | Done |
| 4 | Verify npm audit passes | 3386f0e9 | Done |

## Key Changes

### Dependencies Upgraded

| Package | Before | After |
|---------|--------|-------|
| next | ^14.2.35 | ^16.1.7 |
| react | ^18 | ^19.2.4 |
| react-dom | ^18 | ^19.2.4 |
| eslint-config-next | ^14.2.0 | ^15.5.13 |

### Dependencies Removed

- **browser-use**: Unused dependency with vulnerable transitive dependencies (fast-xml-parser, AWS SDK chain)

### New Files Created

- **.eslintrc.json**: ESLint configuration for Next.js 15+

### TypeScript Fixes

- Fixed stricter TypeScript checks in Next.js 16:
  - Coverage.tsx: Added eslint-disable for Globe component ref type
  - ResourcesContent.tsx: Fixed unused variable and unescaped entities
  - EnquiryForm.tsx: Fixed multiple unescaped entities and unused variable
  - not-found.tsx: Fixed unescaped apostrophes
  - resources/page.tsx: Added proper type casting for article data

## Verification

- npm audit --audit-level=high: **0 vulnerabilities**
- npm run build: **Passes**
- npm run lint: **Passes**

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing] ESLint configuration required**
- **Found during:** Task 2 (eslint-config-next upgrade)
- **Issue:** Next.js 15+ requires explicit ESLint configuration
- **Fix:** Created .eslintrc.json with Next.js recommended rules
- **Files modified:** .eslintrc.json (new)
- **Commit:** e96310d9

**2. [Rule 1 - Bug] Pre-existing lint errors exposed by v15**
- **Found during:** Task 2 (eslint-config-next upgrade)
- **Issue:** Stricter ESLint v15 rules exposed existing code issues
- **Fix:** Fixed all lint errors in 5 files
- **Files modified:** app/components/Coverage.tsx, app/components/ResourcesContent.tsx, app/enquiry/EnquiryForm.tsx, app/not-found.tsx, app/resources/page.tsx
- **Commit:** e96310d9, 3386f0e9

**3. [Rule 1 - Bug] TypeScript strict mode errors**
- **Found during:** Task 3 (Next.js 16 upgrade)
- **Issue:** Next.js 16 has stricter TypeScript checking
- **Fix:** Added type casting for external library types
- **Files modified:** app/components/Coverage.tsx, app/resources/page.tsx
- **Commit:** 3386f0e9

## Success Criteria

- [x] npm audit shows no critical or high vulnerabilities
- [x] browser-use removed (unused dependency eliminated)
- [x] eslint-config-next upgraded to 15+
- [x] Next.js upgraded to 16.x with React 19
- [x] Build passes with updated dependencies

## Self-Check

- [x] package.json shows next@^16.1.7
- [x] package.json shows react@^19.2.4
- [x] package.json shows eslint-config-next@^15.5.13
- [x] browser-use not in package.json
- [x] npm audit returns 0 vulnerabilities
- [x] npm run build passes
- [x] npm run lint passes
- [x] Commits exist: e96310d9, 3386f0e9
