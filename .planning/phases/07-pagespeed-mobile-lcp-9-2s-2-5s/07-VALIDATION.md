---
phase: 07
slug: pagespeed-mobile-lcp-9-2s-2-5s
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright + PageSpeed Insights |
| **Config file** | playwright.config.ts (existing) |
| **Quick run command** | `npx playwright test tests/performance.spec.ts` |
| **Full suite command** | Full PageSpeed Insights mobile test |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Quick build check (`npm run build`)
- **After every plan wave:** Run PageSpeed Insights mobile test
- **Before `/gsd:verify-work`:** Full suite must show LCP < 2.5s
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 07-02-01 | 02 | 1 | LCP-01 | manual | grep "preload=\"none\"" Hero.tsx | ✅ | ⬜ pending |
| 07-02-02 | 02 | 1 | LCP-02 | manual | grep "fetchPriority" Hero.tsx | ✅ | ⬜ pending |
| 07-02-03 | 02 | 1 | LCP-01 | manual | Verify build passes | ✅ | ⬜ pending |
| 07-05-01 | 05 | 2 | LCP-03 | build | npm run build | ✅ | ⬜ pending |
| 07-05-02 | 05 | 2 | LCP-03 | manual | @next/bundle-analyzer config | ✅ | ⬜ pending |
| 07-05-03 | 05 | 2 | LCP-03 | manual | Verify bundle size | ✅ | ⬜ pending |
| 07-06-01 | 06 | 2 | LCP-03 | manual | Check SVG optimization | ✅ | ⬜ pending |
| 07-06-02 | 06 | 2 | LCP-03 | manual | Verify build passes | ✅ | ⬜ pending |
| 07-07-01 | 07 | 3 | LCP-03 | pagespeed | PageSpeed mobile test | ⬜ | ⬜ pending |
| 07-07-02 | 07 | 3 | LCP-03 | manual | LCP < 2.5s verified | ⬜ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Build passes after each task
- [ ] Hero.tsx modified with fixes
- [ ] Bundle analysis completed
- [ ] SVG optimization applied
- [ ] PageSpeed mobile LCP < 2.5s verified

---

## Validation Gates

### Gate 1: Build Pass
- Command: `npm run build`
- Success: Exit code 0

### Gate 2: Code Changes Applied
- Hero.tsx contains `preload="none"`
- Hero.tsx contains `fetchPriority="high"`
- Files pass grep verification

### Gate 3: Performance Target
- Mobile LCP < 2.5s (Google PageSpeed Insights)
- Measured on production deployment

---

*Phase: 07-pagespeed-mobile-lcp-9-2s-2-5s*
*Created: 2026-03-18*
