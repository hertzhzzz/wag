---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-11
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual visual testing (browser DevTools) |
| **Config file** | none — visual verification required |
| **Quick run command** | `npm run build && npm run lint` |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build && npm run lint`
- **After every plan wave:** Manual visual verification on mobile viewport
- **Before `/gsd:verify-work`:** Build + lint must pass
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|------------------|-------------|--------|
| 01-01-01 | 01 | 1 | RESP-01 | manual | Visual check 320px | - | ⬜ pending |
| 01-01-02 | 01 | 1 | RESP-05 | manual | No horizontal scroll 320px | - | ⬜ pending |
| 01-01-03 | 01 | 1 | TOUCH-01 | manual | Button min-height 44px | - | ⬜ pending |
| 01-01-04 | 01 | 1 | TOUCH-02 | manual | Link spacing 8px | - | ⬜ pending |
| 01-01-05 | 01 | 1 | TYPE-01 | manual | Body text 16px min | - | ⬜ pending |
| 01-01-06 | 01 | 1 | TYPE-02 | manual | Readable without zoom | - | ⬜ pending |
| 01-01-07 | 01 | 1 | SPACE-01 | manual | Vertical spacing adequate | - | ⬜ pending |
| 01-01-08 | 01 | 1 | SPACE-02 | manual | Padding prevents cramped | - | ⬜ pending |
| 01-02-01 | 02 | 2 | NAV-01 | manual | Hamburger opens/closes | - | ⬜ pending |
| 01-02-02 | 02 | 2 | NAV-02 | manual | Close mechanism works | - | ⬜ pending |
| 01-02-03 | 02 | 2 | NAV-03 | manual | Links tappable 44px | - | ⬜ pending |
| 01-02-04 | 02 | 2 | TOUCH-03 | manual | Nav menu thumb-friendly | - | ⬜ pending |
| 01-02-05 | 02 | 2 | TYPE-03 | manual | Line-height adequate | - | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Verify build passes: `npm run build`
- [ ] Verify lint passes: `npm run lint`
- [ ] Verify type-check passes: `npx tsc --noEmit`

*All checks use existing Next.js tooling.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 320px layout | RESP-01, RESP-05 | Visual rendering | Open DevTools, set viewport to 320x568, scroll horizontally - should not scroll |
| Touch targets 44px | TOUCH-01, TOUCH-02 | Visual + dev tools | Inspect button/link elements, verify min-height: 44px |
| Navigation open/close | NAV-01, NAV-02 | Interactive behavior | Click hamburger, verify slide-in; click X and overlay, verify close |
| Typography readable | TYPE-01, TYPE-02, TYPE-03 | Visual rendering | View at 320px, verify text readable without pinch-to-zoom |
| Spacing adequate | SPACE-01, SPACE-02 | Visual check | Compare mobile vs desktop, verify adequate breathing room |

---

## Validation Sign-Off

- [ ] Build + lint automation in place
- [ ] Manual test instructions documented
- [ ] All 13 requirements mapped to verification tasks
- [ ] Wave 0 covers build/lint verification

**Approval:** pending

