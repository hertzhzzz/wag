# Mark human review checklist — GEO Ticket 31 (Supplier Verification)

**Date prepared:** 2026-07-18
**Date signed:** 2026-07-19
**Prepared for:** Mark (named approver)
**Ticket:** 31 — Capture the Supplier Verification GEO Baseline
**Ticket status:** live matrix complete; **named human approvals signed 2026-07-19**

This checklist is a review aid. Signatures live on the approval files.

## Before you start

1. Open progress matrix: `.scratch/seo-growth-system/research/2026-07-18-geo-matrix-progress.md`
2. Open question set: `content/seo/geo/questions/supplier-verification.json`
3. Open live evidence: `content/seo/geo/evidence/live/`
4. Language rule: brand token is **Winning Adventure Global** (full name only)

## Gate A — Question set — SIGNED

File: `content/seo/geo/approvals/question-set-supplier-verification.md`

- [x] 10 questions read and acceptable for Supplier Verification baseline
- [x] Digest verified: `sha256:336cf79f882d02538db0dac2adf27f318a516245c24a050c674f7b9cebab6cc9` via `computeGeoQuestionSetDigest`
- [x] Sign question-set approval (Status / Date / Signature)

## Gate B — Retention & privacy — SIGNED

File: `content/seo/geo/approvals/retention-privacy.md`

- [x] Accept evidence path + snapshot retention rules
- [x] Confirm no secrets in evidence trees
- [x] Sign retention-privacy approval

## Gate C — Per-platform packages — SIGNED

| Platform | Approval file | Run ID | Evidence |
|---|---|---|---|
| chatgpt | `content/seo/geo/approvals/platforms/chatgpt.md` | `geo-sv-20260718-chatgpt-r1` | `content/seo/geo/evidence/live/geo-sv-20260718-chatgpt-r1/` |
| perplexity | `content/seo/geo/approvals/platforms/perplexity.md` | `geo-sv-20260718-perplexity-r1` | `content/seo/geo/evidence/live/geo-sv-20260718-perplexity-r1/` |
| google-ai-overviews | `content/seo/geo/approvals/platforms/google-ai-overviews.md` | `geo-sv-20260718-google-ai-overviews-r1` | `content/seo/geo/evidence/live/geo-sv-20260718-google-ai-overviews-r1/` |
| bing-copilot | `content/seo/geo/approvals/platforms/bing-copilot.md` | `geo-sv-20260718-bing-copilot-r1` | `content/seo/geo/evidence/live/geo-sv-20260718-bing-copilot-r1/` |

For each platform:

- [x] Spot-check at least 2 observation JSON files + matching snapshot path
- [x] Confirm counts in approval file match your reading of the run
- [x] Note surface caveats (esp. Google AIO absent; Bing = SERP generative not full Copilot chat)
- [x] Sign that platform approval

## Gate D — Ticket 13 strict cutover — SIGNED

File: `content/seo/geo/approvals/ticket-13-strict-cutover.md`

- [x] Only after Gates A–C are signed (recommended order)
- [x] Sign when ready for strict production enforcement path

## What NOT to do

- Do **not** close Tickets 32–35 on the basis of this matrix alone
- Do **not** treat observation tallies as ranking proof or “we must change X to rank”
- Draft site plan remains hypothesis until product work starts
- Do **not** set JSON question-set `status` to a non-`draft` value while `QUESTION_SET_STATUS` is a draft literal

## After all signatures (done 2026-07-19)

1. Digest verified; JSON remains `status: "draft"` under current schema; human approval is this package set
2. Update Ticket 31 issue body with signed package paths
3. Proceed to work gated on 32–35 only when those tickets’ own criteria are ready

## Quick observation snapshot (not for ranking claims)

| Platform | Answer surface | brand yes | owned URL yes |
|---|---|---|---|
| ChatGPT | 10/10 observed-answer | 0/10 | 0/10 |
| Perplexity | 10/10 observed-answer | 2/10 | 10/10 |
| Google AIO | 10/10 surface-absent (organic still recorded) | 8/10 | 8/10 |
| Bing SERP gen | 10/10 observed-answer | 1/10 | 3/10 |
| **Total** | 40/40 | **11/40** | **21/40** |
