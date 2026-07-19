# 32 — Capture the Factory Audit GEO Baseline

**What to build:** Run and document ten stable buyer questions for the Factory Audit cluster across the approved answer platforms, recording whether Winning Adventure Global is mentioned, which URL is cited, answer accuracy, and notable competitor visibility. The result is an observation baseline, not a causal performance claim.

**Blocked by:** 13.

**Status:** complete — live evidence + named human approvals signed 2026-07-19

The implementation scaffold has passed code-level review. This phase accepts only approved live capture evidence and named human approval; synthetic fixtures cannot satisfy or complete it.

- [x] Exactly ten stable Factory Audit questions are approved and versioned.
- [x] Each observation records platform, model or surface when available, date, locale, and question wording.
- [x] Brand mention, cited URL, factual accuracy, answer completeness, and competitor presence are recorded separately.
- [x] Unsupported answers and misleading citations are captured as quality risks.
- [x] Raw observations remain available for later audit.
- [x] The report distinguishes observed output from inferred causes or optimisation claims.

## Implementation progress — 2026-07-18

The shared GEO baseline contract now provides a fail-closed capture and evaluation scaffold for the Factory Audit cluster. It validates the versioned ten-question set, explicit as-of time, platform approvals, Ticket 13 strict-cutover approval, live-run provenance, prompt/question-set matching, raw snapshot integrity, separated observation quality risks, and null metrics when observations are absent or invalid.

A reusable capture template is available at `docs/seo/templates/geo-baseline-capture.md`. Synthetic test fixtures are used only to exercise the contract and are not production observations.

## Real-world gates — closed 2026-07-19

- [x] Approve the exact ten-question set and record its matching digest.
- [x] Record Ticket 13 strict-cutover approval.
- [x] Approve each answer platform and retention/privacy path (Ticket 32 package + reaffirmation).
- [x] Capture a complete live run with raw snapshots and independent quality review.
- [x] Reconcile unsupported answers, misleading citations, and missing slots before reporting (recorded per-observation; matrix rollup remains observation-only).

## Live matrix + signed packages (2026-07-19)

- **40/40** live observations under `content/seo/geo/evidence/live/geo-fa-20260719-*-r1/`
- Progress matrix: `.scratch/seo-growth-system/research/2026-07-19-geo-matrix-factory-audit.md`
- Checklist: `content/seo/geo/approvals/MARK-REVIEW-CHECKLIST-ticket-32.md` (signed)
- Question set approval: `content/seo/geo/approvals/question-set-factory-audit.md`
- Retention reaffirmation: `content/seo/geo/approvals/retention-privacy.md` (Ticket 32 appendix)
- Platforms (Ticket 32 sections):
  - `content/seo/geo/approvals/platforms/chatgpt.md`
  - `content/seo/geo/approvals/platforms/perplexity.md`
  - `content/seo/geo/approvals/platforms/google-ai-overviews.md`
  - `content/seo/geo/approvals/platforms/bing-copilot.md`
- Question set file: `content/seo/geo/questions/factory-audit.json`
- Verified digest: `sha256:3bec0f9c3de17e1cb2c6f36562d1b3f907460d34f66c795040f0d7c8259dec6d`
- JSON `status` remains `draft` (schema literal); human approval is the package set above
- Approver: Mark He · Date: 2026-07-19 · Signature: Mark He (oral authorization recorded 2026-07-19)

### Live run IDs

| Platform | Run ID | Count |
|---|---|---|
| chatgpt | `geo-fa-20260719-chatgpt-r1` | 10/10 |
| perplexity | `geo-fa-20260719-perplexity-r1` | 10/10 |
| google-ai-overviews | `geo-fa-20260719-google-ai-overviews-r1` | 10/10 |
| bing-copilot | `geo-fa-20260719-bing-copilot-r1` | 10/10 |

### Observation snapshot (not ranking claims)

| Metric | Count |
|---|---|
| brandMention=yes | 5/40 |
| ownedUrlCited=yes | 7/40 |

## Still open (do not close here)

- Tickets **33–35** (quality-inspection / factory-visits / china-sourcing) live capture + signatures
- Aggregate Ticket **36** must not race ahead of 33–35

## Acceptance honesty

- [x] Ten versioned Factory Audit questions exist at `content/seo/geo/questions/factory-audit.json` (digest verified)
- [x] Each live observation records platform, surface, date, locale, prompt, brand/owned, competitors, snapshot
- [x] Raw snapshots + observation JSON available under evidence runs
- [x] Matrix distinguishes observation-only counts (no ranking causality claims)
- [x] **Named Mark approval** of question set package (`content/seo/geo/approvals/question-set-factory-audit.md`)
- [x] **Named Mark approval** that Ticket 32 live packages are accepted under platform + retention policy
- [x] Ticket closed after the above signatures (this file)

**Status:** complete — live evidence + named human approvals signed 2026-07-19
