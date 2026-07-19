# 31 — Capture the Supplier Verification GEO Baseline

**What to build:** Run and document ten stable buyer questions for the Supplier Verification cluster across the approved answer platforms, recording whether Winning Adventure Global is mentioned, which URL is cited, answer accuracy, and notable competitor visibility. The result is an observation baseline, not a causal performance claim.

**Blocked by:** 13.

**Status:** complete — live evidence + named human approvals signed 2026-07-19

The implementation scaffold has passed code-level review. This phase accepts only approved live capture evidence and named human approval; synthetic fixtures cannot satisfy or complete it.

- [x] Exactly ten stable Supplier Verification questions are approved and versioned.
- [x] Each observation records platform, model or surface when available, date, locale, and question wording.
- [x] Brand mention, cited URL, factual accuracy, answer completeness, and competitor presence are recorded separately.
- [x] Unsupported answers and misleading citations are captured as quality risks.
- [x] Raw observations remain available for later audit.
- [x] The report distinguishes observed output from inferred causes or optimisation claims.

## Implementation progress — 2026-07-18

The shared GEO baseline contract now provides a fail-closed capture and evaluation scaffold for the Supplier Verification cluster. It validates the versioned ten-question set, explicit as-of time, platform approvals, Ticket 13 strict-cutover approval, live-run provenance, prompt/question-set matching, raw snapshot integrity, separated observation quality risks, and null metrics when observations are absent or invalid.

A reusable capture template is available at `docs/seo/templates/geo-baseline-capture.md`. Synthetic test fixtures are used only to exercise the contract and are not production observations.

## Real-world gates — closed 2026-07-19

- [x] Approve the exact ten-question set and record its matching digest.
- [x] Record Ticket 13 strict-cutover approval.
- [x] Approve each answer platform and retention/privacy path.
- [x] Capture a complete live run with raw snapshots and independent quality review.
- [x] Reconcile unsupported answers, misleading citations, and missing slots before reporting (recorded per-observation `qualityRisks`; matrix rollup remains observation-only).

## Live matrix + signed packages (2026-07-19)

- **40/40** live observations under `content/seo/geo/evidence/live/`
- Progress matrix: `.scratch/seo-growth-system/research/2026-07-18-geo-matrix-progress.md`
- Checklist: `content/seo/geo/approvals/MARK-REVIEW-CHECKLIST-ticket-31.md` (signed)
- Question set approval: `content/seo/geo/approvals/question-set-supplier-verification.md`
- Retention: `content/seo/geo/approvals/retention-privacy.md`
- Ticket 13 cutover: `content/seo/geo/approvals/ticket-13-strict-cutover.md`
- Platforms:
  - `content/seo/geo/approvals/platforms/chatgpt.md`
  - `content/seo/geo/approvals/platforms/perplexity.md`
  - `content/seo/geo/approvals/platforms/google-ai-overviews.md`
  - `content/seo/geo/approvals/platforms/bing-copilot.md`
- Question set file: `content/seo/geo/questions/supplier-verification.json`
- Verified digest: `sha256:336cf79f882d02538db0dac2adf27f318a516245c24a050c674f7b9cebab6cc9`
- JSON `status` remains `draft` (schema literal); human approval is the package set above
- Approver: Mark He · Date: 2026-07-19

## Still open (do not close here)

- Tickets **32–35** remain open.
- Site plan draft (C line) is still hypothesis until product/content work starts.
