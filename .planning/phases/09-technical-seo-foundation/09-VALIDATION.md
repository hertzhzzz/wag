---
phase: 9
slug: technical-seo-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification (PageSpeed Insights, browser inspection) |
| **Config file** | none — SEO verifications are manual |
| **Quick run command** | `n/a` |
| **Full suite command** | `n/a` |
| **Estimated runtime** | ~5-10 minutes per full verification |

---

## Sampling Rate

- **After each SEO task:** Manual verification of affected component
- **After wave completion:** Full SEO audit using PageSpeed Insights + browser inspection
- **Before `/gsd:verify-work`:** All manual checks must pass
- **Max feedback latency:** User-dependent (requires human action)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Verification Method | Status |
|---------|------|------|-------------|-----------|---------------------|--------|
| 09-01-01 | 01 | 1 | TECH-01 (LCP) | manual | PageSpeed Insights < 2.5s | ⬜ pending |
| 09-01-02 | 01 | 1 | TECH-02 (Sitemap) | manual | Visit /sitemap.xml | ⬜ pending |
| 09-01-03 | 01 | 1 | TECH-03 (robots.txt) | manual | Visit /robots.txt | ⬜ pending |
| 09-01-04 | 01 | 1 | TECH-04 (Schema) | manual | Inspect page source for JSON-LD | ⬜ pending |
| 09-01-05 | 01 | 1 | TECH-05 (Canonical) | manual | Inspect page source for canonical | ⬜ pending |
| 09-01-06 | 01 | 1 | MON-01 (GSC) | manual | Verify GSC property exists | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ needs review*

---

## Wave 0 Requirements

- [ ] No test framework needed — SEO verifications are manual
- [ ] Verify existing SEO infrastructure in codebase before tasks

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|-----------|-------------------|
| LCP performance | TECH-01 | Requires PageSpeed Insights API or manual testing | Run lighthouse or visit pages PSI |
| XML sitemap accessibility | TECH-02 | Static file check | Visit /sitemap.xml in browser |
| robots.txt accessibility | TECH-03 | Static file check | Visit /robots.txt in browser |
| Schema.org markup | TECH-04 | Requires page source inspection | View page source, search for schema.org |
| Canonical URLs | TECH-05 | Requires page source inspection | View page source, search for canonical |
| Google Search Console | MON-01 | Requires GSC account access | Log into GSC, verify property |

*All phase behaviors require manual verification.*

---

## Validation Sign-Off

- [ ] All tasks have manual verification method documented
- [ ] Wave 0 is not applicable for SEO phase
- [ ] No automated testing framework needed
- [ ] User understands manual verification requirements
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
