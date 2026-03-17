---
phase: 06
slug: seo-optimization
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-03-17
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual SEO audit + Google tools |
| **Config file** | N/A |
| **Quick run command** | Google PageSpeed Insights (web) |
| **Full suite command** | Lighthouse CLI: `npx lighthouse https://www.winningadventure.com.au --output html` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After each task:** Verify file changes exist and build passes
- **After each plan wave:** Run full Lighthouse audit
- **Before `/gsd:verify-work`:** Full suite should pass
- **Max feedback latency:** N/A (manual verification)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Page metadata unique per page | SEO-01 | Requires source inspection | View page source, check `<title>` and `<meta name="description">` |
| Structured data valid | SEO-02 | Google Rich Results Test required | Use https://search.google.com/test/rich-results |
| Blog articles target keywords | SEO-03 | Content review required | Check article content includes target keywords |
| Internal links present | SEO-04 | Crawl analysis needed | Use Screaming Frog or manual check |
| Core Web Vitals pass | SEO-05 | PageSpeed Insights required | Use https://pagespeed.web.dev |

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | SEO-01 | manual | N/A | N/A | ⬜ pending |
| 06-01-02 | 01 | 1 | SEO-02 | manual | N/A | N/A | ⬜ pending |
| 06-02-01 | 02 | 1 | SEO-03 | manual | N/A | N/A | ⬜ pending |
| 06-03-01 | 03 | 1 | SEO-04 | manual | N/A | N/A | ⬜ pending |
| 06-03-02 | 03 | 1 | SEO-05 | tool | Lighthouse CLI | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- None identified - SEO validation uses existing Google tools and manual inspection

---

## Validation Sign-Off

- [ ] All tasks have verification approach documented
- [ ] Manual verification instructions are clear
- [ ] Wave 0 complete (N/A for this phase)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

