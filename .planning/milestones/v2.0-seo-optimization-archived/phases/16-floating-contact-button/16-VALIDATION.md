---
phase: 16
slug: floating-contact-button
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-20
---

# Phase 16 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None detected — UI component phase |
| **Config file** | N/A |
| **Quick run command** | `npm run build && npm run lint` |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build && npm run lint`
- **After every plan wave:** Run `npm run build && npm run lint`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 16-01-01 | 01 | 1 | FloatingContactButton component | Build | `npm run build` | ✅ | ⬜ pending |
| 16-01-02 | 01 | 1 | ContactModal component | Build | `npm run build` | ✅ | ⬜ pending |
| 16-01-03 | 01 | 1 | Integration in layout.tsx | Build | `npm run build` | ✅ | ⬜ pending |
| 16-02-01 | 02 | 1 | /api/contact endpoint | Build + Lint | `npm run build && npm run lint` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] No new test infrastructure needed — UI component phase
- [ ] Existing `npm run build && npm run lint` covers all automated verification

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Floating button visible on all pages | SEO-02 | Visual verification across pages | Load /, /services, /about, /resources, /enquiry — verify button appears bottom-right |
| Click opens modal | SEO-02 | UI interaction | Click button — verify modal animates in |
| ESC closes modal | SEO-02 | Keyboard interaction | Open modal, press ESC — verify modal closes |
| Overlay click closes modal | SEO-02 | Click interaction | Open modal, click overlay — verify modal closes |
| Form submission works | SEO-02 | E2E flow | Fill email + message, submit — verify success state |
| Pulse ring animation | SEO-02 | Visual effect | Verify pulse ring animates on button |
| Mobile responsive | SEO-02 | Cross-device | Test at 320px, 375px, 768px widths |
| Contact button smaller on mobile | SEO-02 | Responsive design | Verify smaller sizing on mobile |

*All phase behaviors have automated verification via build + lint, plus manual UI verification for visual/interaction aspects.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
