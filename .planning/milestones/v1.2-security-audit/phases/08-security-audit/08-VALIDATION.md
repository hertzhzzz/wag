---
phase: 8
slug: security-audit
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Security Scanning (npm audit, manual checks) |
| **Config file** | none — Wave 0 sets up security scanning |
| **Quick run command** | `npm audit --audit-level=moderate` |
| **Full suite command** | `npm audit && npm outdated && npm run build` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Run security scan commands
- **After every plan wave:** Run full security suite
- **Before `/gsd:verify-work`:** All scans must pass
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | Dependency scan | npm audit | `npm audit --audit-level=moderate` | N/A | ⬜ pending |
| 08-01-02 | 01 | 1 | Upgrade Next.js | npm outdated | `npm outdated` | N/A | ⬜ pending |
| 08-02-01 | 02 | 1 | Security headers | manual | `curl -I https://...` | N/A | ⬜ pending |
| 08-02-02 | 02 | 1 | CORS config | manual | Check config | N/A | ⬜ pending |
| 08-03-01 | 03 | 1 | Rate limiting | test | `npm run test:rate-limit` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Create `.github/workflows/security.yml` — security scanning workflow
- [ ] Verify test infrastructure covers rate limiting tests

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Security headers present | REQ-SEC-01 | Requires HTTP response inspection | `curl -I https://www.winningadventure.com.au` and verify headers |
| CORS configured | REQ-SEC-02 | Requires API call testing | Test API endpoints with cross-origin requests |
| No vulnerabilities | REQ-SEC-03 | npm audit output analysis | `npm audit` returns 0 vulnerabilities |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
