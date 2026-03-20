---
phase: 05
slug: vercel-deployment
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright 1.58.2 |
| **Config file** | frontend/playwright.config.ts |
| **Quick run command** | `npx playwright test` |
| **Full suite command** | `npx playwright test --reporter=html` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** N/A - deployment phase
- **After every plan wave:** Manual verification of deployed site
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** N/A for manual verifications

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 05-01 | 1 | SOCIAL-01 | Playwright | `npx playwright test` | ❌ | ⬜ pending |
| 05-01-02 | 05-01 | 1 | MOBILE-01, MOBILE-02 | Playwright | `npx playwright test` | ❌ | ⬜ pending |
| 05-02-01 | 05-02 | 2 | DEPLOY-01 | Manual | Visit winningadventure.com.au | N/A | ⬜ pending |
| 05-02-02 | 05-02 | 2 | DEPLOY-04 | Manual | Check Vercel dashboard | N/A | ⬜ pending |
| 05-02-03 | 05-02 | 2 | DEPLOY-01 | Manual | Git push triggers deploy | N/A | ⬜ pending |
| 05-02-04 | 05-02 | 2 | DEPLOY-02, DEPLOY-03 | Manual | Custom domain + SSL | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/footer-social.spec.ts` — covers SOCIAL-01
- [ ] `tests/mobile-navbar.spec.ts` — covers MOBILE-01, MOBILE-02
- [ ] Tests folder exists but is empty - no test files yet

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Website deployed to Vercel | DEPLOY-01 | Infrastructure verification | Visit winningadventure.com.au |
| Custom domain accessible | DEPLOY-02 | DNS propagation check | `nslookup winningadventure.com.au` |
| HTTPS works | DEPLOY-03 | SSL certificate | Visit https://winningadventure.com.au |
| Env vars configured | DEPLOY-04 | Vercel dashboard | Check Vercel project settings |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < {N}s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

