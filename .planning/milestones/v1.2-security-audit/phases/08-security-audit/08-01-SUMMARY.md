---
phase: 08-security-audit
plan: 01
subsystem: dependencies
tags: [security, npm, dependencies, CVE]
dependency_graph:
  requires: []
  provides:
    - next@14.2.35
    - pnpm-lock.yaml
  affects:
    - build
    - runtime
tech_stack:
  added:
    - pnpm (package manager)
  patterns:
    - Semver dependency versioning
    - Security vulnerability scanning
key_files:
  created:
    - pnpm-lock.yaml
  modified:
    - package.json (next@14.2.0 -> 14.2.35)
decisions:
  - Used pnpm instead of npm due to npm cache corruption issues
  - Accepted remaining vulnerabilities as they require breaking changes
---

# Phase 8 Plan 1: Dependency Vulnerability Scan and Fix

## Summary

Scanned and fixed dependency vulnerabilities in the WAG website. Upgraded Next.js from 14.2.0 to 14.2.35 to fix CVE-2025-29927 (middleware authorization bypass vulnerability). Reduced total vulnerabilities from 24 (1 critical, 23 high) to 6 (3 moderate, 3 high).

## Completed Tasks

| Task | Name | Status | Commit |
|------|------|--------|--------|
| 1 | Run npm audit to identify vulnerabilities | Complete | - |
| 2 | Check for outdated packages with npm outdated | Complete | - |
| 3 | Upgrade Next.js to fix CVE-2025-29927 | Complete | 6f0c6467 |

## Verification Results

- Build: PASSED (pnpm run build successful)
- Next.js version: 14.2.35 (upgraded from 14.2.0)
- Vulnerability reduction: 24 -> 6 (75% reduction)

## Remaining Vulnerabilities

The remaining 6 vulnerabilities require breaking changes to fix:

| Severity | Package | Issue | Fix Required |
|----------|---------|-------|--------------|
| high | glob | Command injection | ESLint 9+ (requires config format change) |
| high | next | DoS via RSC | Next.js 15.x (requires React 19) |
| high | fast-xml-parser | Entity expansion | browser-use update |
| moderate | next | DoS via Image Optimizer | Next.js 15.5.10+ |
| moderate | next | HTTP request smuggling | Next.js 15.5.13+ |
| moderate | next | Unbounded disk cache | Next.js 16.1.7+ |

## Key Achievement

Fixed CVE-2025-29927: Next.js middleware authorization bypass vulnerability that affected versions < 14.2.25. This was the primary security objective.

## Deviation from Plan

- Used pnpm instead of npm due to npm cache corruption issues during installation
- Not all high/critical vulnerabilities resolved (require breaking version upgrades)

## Duration

Approximately 5 minutes

## Self-Check

- [x] package.json shows next@14.2.35
- [x] Build passes (npm run build)
- [x] Commit 6f0c6467 exists
- [x] pnpm-lock.yaml created
