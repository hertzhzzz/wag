---
phase: 24
slug: schema-consistency
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-03-25
---

# Phase 24 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — manual validation required |
| **Config file** | N/A |
| **Quick run command** | `npm run build && npm run lint` |
| **Full suite command** | Manual: Google Rich Results Test + page source inspection |
| **Estimated runtime** | ~30 seconds for build |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Full manual verification
- **Before `/gsd:verify-work`:** Full suite must be green

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 24-01-01 | 01 | 1 | GEO-05 (PersonSchema) | grep | `grep -n "use client\|useEffect" app/components/PersonSchema.tsx` | N/A | ⬜ pending |
| 24-01-02 | 01 | 1 | GEO-04 (LinkedIn removal) | grep | `grep -i "linkedin" app/components/PersonSchema.tsx` | N/A | ⬜ pending |
| 24-01-03 | 01 | 1 | ABN verification | grep | `grep -n "abr.business.gov.au" app/about/page.tsx` | N/A | ⬜ pending |
| 24-02-01 | 02 | 1 | GEO-06 (geography fix) | grep | `grep -n "Zhengzhou\|Shaanxi" app/about/page.tsx` | N/A | ⬜ pending |
| 24-02-02 | 02 | 1 | GEO-06 (numbers fix) | grep | `grep -n "500+" app/about/page.tsx` | N/A | ⬜ pending |
| 24-02-03 | 02 | 1 | GEO-03 (Hero industries) | grep | `grep -n "50+ Industries" app/components/Hero.tsx` | N/A | ⬜ pending |
| 24-02-04 | 02 | 1 | GEO-06 (BreadcrumbSchema) | grep | `grep -n "BreadcrumbSchema" app/enquiry/page.tsx` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] None — existing infrastructure covers all phase requirements (npm run build)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PersonSchema appears in page source without JS | GEO-05 | AI crawlers don't execute JS | Visit /about, View Source, search for Person schema JSON-LD |
| /enquiry has BreadcrumbList schema | GEO-06 | Requires page source inspection | Visit /enquiry, View Source, verify BreadcrumbList present |
| ABN link is clickable and correct | GEO-04 | UI interaction required | Click "(Verify)" link next to ABN on /about page |
| Google Rich Results Test passes | All | External tool required | Run Google Rich Results Test on /about and /enquiry |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (N/A — manual phase)
- [x] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
