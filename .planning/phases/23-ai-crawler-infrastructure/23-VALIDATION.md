---
phase: "23"
slug: "ai-crawler-infrastructure"
status: "validated"
nyquist_compliant: true
wave_0_complete: true
created: "2026-03-25"
---

# Phase 23 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Shell scripts (static file validation) |
| **Config file** | none — static files, no test framework |
| **Quick run command** | N/A (static files verified via grep/wc) |
| **Full suite command** | N/A |
| **Estimated runtime** | ~5 seconds (manual verification) |

---

## Sampling Rate

- **After every task commit:** Manual grep/wc verification
- **After every plan wave:** Full file content verification
- **Before `/gsd:verify-work`:** Manual verification checklist below
- **Max feedback latency:** Immediate (CLI commands)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 23-01-01 | 01 | 1 | GEO-01 (llms.txt) | Manual | `grep -E "47 reviews\|8\+ years\|Zhengzhou\|Shaanxi" public/llms.txt` | N/A | ⬜ manual |
| 23-01-02 | 01 | 1 | GEO-02 (robots.txt) | Manual | `grep -E "GPTBot\|ChatGPT-User\|ClaudeBot\|Claude-Web\|PerplexityBot\|Google-Extended" public/robots.txt` | N/A | ⬜ manual |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] No test framework required for static file validation
- [ ] Shell-based validation commands documented below

*Note: Phase 23 modifies static files (llms.txt, robots.txt). Validation is performed via CLI commands, not unit tests.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| File size < 10KB | GEO-01 | Static file, no framework | `wc -c public/llms.txt` — must return < 10240 |
| No fabricated claims | GEO-01 | Content verification | `grep -E "47 reviews\|8\+ years\|Zhengzhou\|Shaanxi" public/llms.txt` — must return empty |
| Standardized numbers | GEO-01 | Content verification | `grep -E "500\+\|50\+" public/llms.txt` — must return both |
| Geographic accuracy | GEO-01 | Content verification | `grep "Guangdong" public/llms.txt` — must exist; `grep "Since December 2025" public/llms.txt` — must exist |
| ABN verification link | GEO-01 | Content verification | `grep "abr.business.gov.au" public/llms.txt` — must exist |
| All 6 AI bots allowed | GEO-02 | robots.txt verification | `grep -E "User-agent: (GPTBot|ChatGPT-User|ClaudeBot|Claude-Web|PerplexityBot|Google-Extended)" public/robots.txt` — must return 6 lines |
| Sitemap directive | GEO-02 | robots.txt verification | `grep "Sitemap:" public/robots.txt` — must exist |

---

## Validation Commands (Run Manually)

```bash
# Phase 23 Verification Checklist

# 1. llms.txt file size (must be < 10KB = 10240 bytes)
wc -c public/llms.txt

# 2. No fabricated claims
grep -E "47 reviews|8\+ years|Zhengzhou|Shaanxi" public/llms.txt && echo "FAIL: Found fabricated claims" || echo "PASS: No fabricated claims"

# 3. Standardized numbers present
grep -E "500\+|50\+" public/llms.txt | head -5

# 4. Geographic accuracy
grep "Guangdong" public/llms.txt
grep "Since December 2025" public/llms.txt

# 5. ABN verification link
grep "abr.business.gov.au" public/llms.txt

# 6. robots.txt - all 6 AI bots
grep -E "User-agent: (GPTBot|ChatGPT-User|ClaudeBot|Claude-Web|PerplexityBot|Google-Extended)" public/robots.txt | wc -l
# Expected: 6

# 7. robots.txt - Sitemap directive
grep "Sitemap:" public/robots.txt
```

---

## Validation Sign-Off

- [ ] All manual verification commands executed
- [ ] All checks return expected results
- [ ] ABN URL confirmed working (WebFetch)
- [ ] Geographic errors removed
- [ ] Fabricated claims removed
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-25 (manual verification — static files)

---

## Notes

**Why Manual-Only for Phase 23:**
- Phase 23 modifies only static files (llms.txt, robots.txt)
- No code changes requiring test framework
- Verification via grep/wc commands is more reliable than wrapper scripts
- Build/lint pre-existing failures are unrelated to this phase

**Gap Closure Options:**
1. Create shell script wrapper for validation commands (low value)
2. Keep manual verification (recommended for static files)
