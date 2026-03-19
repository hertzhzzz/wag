---
phase: 10
slug: content-strategy
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification via build + curl |
| **Config file** | none — content phase |
| **Quick run command** | `npm run build && npm run lint` |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm run lint`
- **Before `/gsd:verify-work`:** Full build must pass
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | CONT-01 | manual | npm run build | ✅ | ⬜ pending |
| 10-01-02 | 01 | 1 | CONT-02 | manual | npm run build | ✅ | ⬜ pending |
| 10-01-03 | 01 | 1 | CONT-03 | manual | npm run build | ✅ | ⬜ pending |
| 10-02-01 | 02 | 2 | CONT-04 | manual | npm run build | ✅ | ⬜ pending |
| 10-03-01 | 03 | 3 | CONT-05 | manual | npm run build | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Verify blog MDX files compile correctly
- [ ] Verify FAQ accordion component renders
- [ ] Verify service pages build with new metadata

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Blog content published at /resources | CONT-01, CONT-02, CONT-03 | Content quality is subjective | Visit /resources, search for each guide |
| FAQ section visible | CONT-04 | Visual verification needed | Visit /services, check accordion |
| Service page keywords | CONT-05 | Content vs metadata check | Inspect page source, check headings |

*All phase behaviors have verification strategy defined.*

---

## Validation Sign-Off

- [ ] All tasks have verification strategy
- [ ] Build/lint commands cover technical correctness
- [ ] Manual verification steps defined for content quality
- [ ] No watch-mode flags
- [ ] Feedback latency acceptable

**Approval:** pending
