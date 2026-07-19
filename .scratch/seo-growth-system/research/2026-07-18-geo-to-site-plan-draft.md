# GEO → site change plan (DRAFT) — observation only

- **Date:** 2026-07-18
- **Source matrix:** `.scratch/seo-growth-system/research/2026-07-18-geo-matrix-progress.md`
- **Evidence:** `content/seo/geo/evidence/live/`
- **claimMode:** `observation-only`
- **provenance:** `external-platform-observation`
- **Ticket 31 status:** live matrix complete; **awaiting Mark named approvals**
- **Hard rule:** This document does **not** close Tickets 31–35. Implementation suggestions are **hypotheses**, not approved work.

## What this is / is not

| Is | Is not |
|---|---|
| A draft prioritisation of pages/content/internal links based on 40 live observations | A ranking proof or “do X and we will appear in ChatGPT” claim |
| Input for human planning after Ticket 31 signatures | Automatic implementation backlog |
| Fail-closed: no synthetic fixtures used | Permission to flip question set to approved |

## Observation summary by platform

| Platform | Run ID | Surface result | brandMention=yes | ownedUrlCited=yes | Read as (observation only) |
|---|---|---|---|---|---|
| ChatGPT | `geo-sv-20260718-chatgpt-r1` | 10/10 observed-answer | 0/10 | 0/10 | Answers present; brand and owned URLs not observed in this window |
| Perplexity | `geo-sv-20260718-perplexity-r1` | 10/10 observed-answer | 2/10 | 10/10 | Owned URLs frequently cited; brand name less often |
| Google AI Overviews | `geo-sv-20260718-google-ai-overviews-r1` | 10/10 surface-absent | 8/10* | 8/10* | *brand/owned from organic SERP, not AIO text; no usable AIO block this window |
| Bing (SERP generative / package bing-copilot) | `geo-sv-20260718-bing-copilot-r1` | 10/10 observed-answer | 1/10 | 3/10 | Answers present; brand/owned sparse vs Perplexity/organic Google |

**Totals:** brandMention=yes **11/40**; ownedUrlCited=yes **21/40**.

## Hotspots by question (matrix)

See full matrix table in progress file. High-level patterns:

1. **ChatGPT column:** uniformly brand=no / owned=no for all 10 questions.
2. **Perplexity column:** owned=yes for all 10; brand=yes only on select questions (registration-records, compare-services).
3. **Google AIO column:** surface-absent everywhere; organic brand/owned often yes (except legal-identity, stop-findings).
4. **Bing column:** mixed; owned yes mainly on registration-records, export-evidence, compare-services.

## Owned URL patterns (hypothesis inputs)

Where `ownedUrlCited=yes`, cited winningadventure URLs in observations (frequency is citation occurrences, not unique questions):

| Owned URL (normalised) | Citation hits in owned=yes rows |
|---|---|
| `https://www.winningadventure.com.au/article/verify-chinese-supplier` | 9 |
| `https://www.winningadventure.com.au/supplier-verification` | 3 |
| `https://www.winningadventure.com.au/article/factory-vs-trading-company-china-guide` | 2 |
| `https://www.winningadventure.com.au/article/china-supplier-verification` | 2 |
| `https://www.winningadventure.com.au/services` | 1 |
| `https://www.winningadventure.com.au/article/pay-chinese-suppliers-safely` | 1 |
| `https://www.winningadventure.com.au/article/china-supplier-scams` | 1 |
| `https://www.winningadventure.com.au/article/virtual-factory-audit` | 1 |
| `https://www.winningadventure.com.au` | 1 |
| `https://winningadventure.com.au` | 1 |
| `https://www.winningadventure.com.au/article/china-sourcing-agent` | 1 |


## Candidate site actions (HYPOTHESIS only — not approved work)

Each item: **observation trigger → hypothesis → candidate action → out-of-scope until**.

### H1 — Entity / brand clarity for answer engines with empty brand column

- **Observation:** ChatGPT 0/10 brand and 0/10 owned; Bing brand 1/10.
- **Hypothesis:** Platforms that rely less on live web crawl of our site may under-surface brand unless third-party or strongly structured entity sources exist.
- **Candidate actions (after Mark signs 31):**
  - Review Organization / entity schema and About copy for unambiguous **Winning Adventure Global** legal entity wording (full name only).
  - Ensure high-intent service pages lead with full brand + Australia–China positioning in first screen of content (English only, no emoji).
  - Consider third-party verifiable profiles (GBP SAB, directories, independent listings) as separate tickets — not asserted here as proven fix.
- **Out of scope until:** Ticket 31 named approvals; any content change goes through normal SEO/content governance.

### H2 — Consolidate high-citation owned URLs (Perplexity-heavy)

- **Observation:** Perplexity ownedUrlCited=yes 10/10; organic Google often shows owned URLs.
- **Hypothesis:** Existing articles/service URLs already enter some answer engines’ citation sets; reinforcing those URLs may be higher leverage than inventing many new URLs.
- **Candidate actions:**
  - Inventory URLs that appear in Perplexity citations + organic SERP observations; mark as **priority keep / internal-link hubs**.
  - Add internal links from related cluster pages (`/supplier-verification`, `/factory-audit-china`, `/quality-inspection-china`, SAMR article) to those hubs with descriptive anchors.
  - Avoid thin near-duplicate pages that dilute citation targets.
- **Out of scope until:** 31 approvals; Ticket 32+ content work if applicable.

### H3 — Google AIO separate from organic SEO

- **Observation:** AIO generative surface absent for all 10 prompts this window; organic still shows brand/owned frequently.
- **Hypothesis:** Traditional organic presence is not the same as AIO inclusion; AIO needs separate re-capture windows, not a one-shot conclusion.
- **Candidate actions:**
  - Schedule a second AIO capture window (locale en-AU) after approvals — do not close 31 based on surface-absent alone if process requires multi-window (follow ticket language).
  - Keep organic technical SEO / content quality work on existing track (separate from GEO claims).
- **Out of scope until:** Explicit re-capture plan; no “AIO optimisation guarantee” language.

### H4 — Bing generative visibility lag

- **Observation:** Bing SERP generative brand 1/10, owned 3/10 vs stronger organic Google owned presence.
- **Hypothesis:** Bing generative selection differs from Google organic; IndexNow / Bing Webmaster coverage and citation-friendly pages may matter — unproven here.
- **Candidate actions:**
  - Verify Bing Webmaster / sitemap submission status (ops check).
  - Ensure service pages return 200 and are in `sitemap.xml` (smoke already shows prod sitemap 200).
- **Out of scope until:** 31 approvals; separate technical ticket if gaps found.

### H5 — Competitor names observed in answer text

- **Observation:** Some Perplexity observations list competitor brands in `competitors` arrays.
- **Hypothesis:** Buyers see multi-brand answer sets; differentiation content (scope, Australia-based team, verification process) may help later — not causal from this matrix.
- **Candidate actions:**
  - Review service pages for clear “what we do / do not do” vs pure generic checklists.
  - Keep competitor mentions out of our own marketing copy; use for internal awareness only.
- **Out of scope until:** Content owner review post-31.

## Suggested page priority stack (hypothesis)

| Priority | URL / asset | Why (observation link) | Candidate work type |
|---|---|---|---|
| P0 | `/supplier-verification` | Cluster landing for Ticket 31 question set | Entity clarity + internal links |
| P0 | `/article/verify-chinese-supplier` | Highest owned-URL citation hits in this matrix (9) | Keep strong; hub links |
| P0 | `/article/check-chinese-company-samr` | Core registration/official-records topic in Q01-style prompts | Keep strong; hub links |
| P1 | `/factory-audit-china` | Adjacent verification path; secondary path pages live in prod | Cross-link cluster |
| P1 | `/quality-inspection-china` | Adjacent path | Cross-link cluster |
| P1 | `/visiting-chinese-factories` | Remote vs onsite / visit questions | Scope clarity |
| P2 | `/services` | General discovery | Ensure cluster links visible |
| P2 | Organization schema / About | Brand token consistency for machines | Entity only, no WAG abbreviation |

## Explicit non-claims

- No assertion that implementing H1–H5 will increase ChatGPT brandMention rate.
- No assertion that Perplexity owned citations prove ranking #1 or durable visibility.
- No acceptance of Tickets 32–35.
- No change to question set status without Mark signature.

## Next steps

1. Mark completes `content/seo/geo/approvals/MARK-REVIEW-CHECKLIST-ticket-31.md` and signs packages.
2. After 31 gates: convert selected hypotheses into scoped tickets (32–35 or content tickets) with owners and acceptance tests.
3. Optional: re-run ChatGPT + Google AIO capture windows for drift checks (new run IDs; keep fail-closed).

## References

- Matrix: `.scratch/seo-growth-system/research/2026-07-18-geo-matrix-progress.md`
- Capture plan: `.scratch/seo-growth-system/research/2026-07-18-geo-live-capture-plan.md`
- Ticket 31: `.scratch/seo-growth-system/issues/31-supplier-verification-geo-baseline.md`
- Approvals: `content/seo/geo/approvals/`
