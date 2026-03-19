---
phase: 11
slug: local-seo-authority
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-03-18
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None - Phase 11 is operational/outreach, not code |
| **Config file** | N/A |
| **Quick run command** | N/A |
| **Full suite command** | N/A |
| **Estimated runtime** | N/A |

---

## Sampling Rate

- **After every task commit:** N/A - operational tasks
- **After every plan wave:** N/A
- **Before `/gsd:verify-work:** All 5 manual verifications must be complete
- **Max feedback latency:** N/A

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | LOCAL-01 | Manual | N/A - verify at business.google.com | N/A | ⬜ pending |
| 11-02-01 | 02 | 1 | LOCAL-02 | Manual | N/A - verify each directory listing | N/A | ⬜ pending |
| 11-03-01 | 03 | 1 | LOCAL-03 | Manual | N/A - check page exists with Adelaide content | N/A | ⬜ pending |
| 11-04-01 | 04 | 2 | AUTH-01 | Manual | N/A - verify each published post | N/A | ⬜ pending |
| 11-05-01 | 05 | 2 | AUTH-02 | Manual | N/A - check Moz/Ahrefs for new links | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements - Phase 11 requires no code or test infrastructure setup

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Google Business Profile claimed and optimized | LOCAL-01 | External platform verification | Visit business.google.com, search for business name, verify all fields populated |
| Business listed in 5+ Australian directories | LOCAL-02 | External directory verification | Visit each directory (TrueLocal, Yelp, Yellow Pages, etc.), verify NAP consistency |
| Location-specific content published | LOCAL-03 | Content verification | Check site for Adelaide/South Australia content on About/Services pages |
| 3 guest posts published on DA 40+ sites | AUTH-01 | External backlink verification | Search for published posts, verify author bio with backlink |
| Backlinks from directories verified | AUTH-02 | SEO tool verification | Use Moz Link Explorer or Ahrefs to verify new directory backlinks |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < N/A
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

