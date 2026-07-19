# 33 — Capture the Quality Inspection GEO Baseline

**What to build:** Run and document ten stable buyer questions for the Quality Inspection cluster across the approved answer platforms, recording whether Winning Adventure Global is mentioned, which URL is cited, answer accuracy, and notable competitor visibility. The result is an observation baseline, not a causal performance claim.

**Blocked by:** 13.

**Status:** complete — live evidence 40/40 and named human approvals signed 2026-07-19

The implementation scaffold has passed code-level review. This phase accepts only approved live capture evidence and named human approval; synthetic fixtures cannot satisfy or complete it.

- [x] Exactly ten stable Quality Inspection questions are versioned (JSON status remains `draft` as a schema literal; the human approval package is signed).
- [x] Each observation records platform, model or surface when available, date, locale, and question wording.
- [x] Brand mention, cited URL, factual accuracy, answer completeness, and competitor presence are recorded separately.
- [x] Unsupported answers and misleading citations are captured as quality risks.
- [x] Raw observations remain available for later audit.
- [x] The report distinguishes observed output from inferred causes or optimisation claims.

## Implementation progress — 2026-07-18

The shared GEO baseline contract now provides a fail-closed capture and evaluation scaffold for the Quality Inspection cluster. It validates the versioned ten-question set, explicit as-of time, platform approvals, Ticket 13 strict-cutover approval, live-run provenance, prompt/question-set matching, raw snapshot integrity, separated observation quality risks, and null metrics when observations are absent or invalid.

A reusable capture template is available at `docs/seo/templates/geo-baseline-capture.md`. Synthetic test fixtures are used only to exercise the contract and are not production observations.

## Live capture progress — 2026-07-19

- [x] Capture complete live run with raw snapshots (40/40 across four platforms)
- [x] Matrix rollup written (observation-only)
- [x] Platform approval sections approved and signed for Ticket 33
- [x] Retention appendix reaffirmed and signed for Ticket 33
- [x] **Mark named signature** on question set + four platform T33 sections + retention reaffirmation
- [x] Ticket closed after signatures

### Live run IDs

| Platform | Run ID | Count | Status mix |
|---|---|---|---|
| chatgpt | `geo-qi-20260719-chatgpt-r1` | 10/10 | 10 ans |
| perplexity | `geo-qi-20260719-perplexity-r1` | 10/10 | 10 ans |
| google-ai-overviews | `geo-qi-20260719-google-ai-overviews-r1` | 10/10 | 10 surface-absent |
| bing-copilot | `geo-qi-20260719-bing-copilot-r1` | 10/10 | 10 ans |

### Paths

- Evidence: `content/seo/geo/evidence/live/geo-qi-20260719-*-r1/`
- Matrix: `.scratch/seo-growth-system/research/2026-07-19-geo-matrix-quality-inspection.md`
- Question set: `content/seo/geo/questions/quality-inspection.json`
- Digest: `sha256:7ea4fd81936885385e0d3a9322996609deda06f73345a9daca12ee56dc2cbd1e`
- Question set approval (APPROVED): `content/seo/geo/approvals/question-set-quality-inspection.md`
- Checklist (APPROVED): `content/seo/geo/approvals/MARK-REVIEW-CHECKLIST-ticket-33.md`
- Platforms (T33 sections APPROVED):
  - `content/seo/geo/approvals/platforms/chatgpt.md`
  - `content/seo/geo/approvals/platforms/perplexity.md`
  - `content/seo/geo/approvals/platforms/google-ai-overviews.md`
  - `content/seo/geo/approvals/platforms/bing-copilot.md`
- Retention appendix (REAFFIRMED): `content/seo/geo/approvals/retention-privacy.md`

### Observation snapshot (not ranking claims)

| Metric | Count |
|---|---|
| brandMention=yes | 0/40 |
| ownedUrlCited=yes | 0/40 |

## Real-world gates

- [x] Approve the exact ten-question set and record its matching digest (Mark signature on human package).
- [x] Record Ticket 13 strict-cutover approval (already done for program).
- [x] Approve each answer platform and retention/privacy path for Ticket 33 packages.
- [x] Capture a complete live run with raw snapshots and independent quality review (matrix).
- [x] Reconcile unsupported answers, misleading citations, and missing slots before reporting (recorded per-observation; matrix remains observation-only).

## Follow-on work (outside this closed ticket)

- Tickets **34–35** (factory-visits / china-sourcing) live capture + signatures
- Aggregate Ticket **36** must not race ahead of 34–35

## Acceptance honesty

- [x] Ten versioned Quality Inspection questions exist at `content/seo/geo/questions/quality-inspection.json` (digest verified in live manifests)
- [x] Each live observation records platform, surface, date, locale, prompt, brand/owned, competitors, snapshot
- [x] Raw snapshots + observation JSON available under evidence runs
- [x] Matrix distinguishes observation-only counts (no ranking causality claims)
- [x] **Named Mark approval** of question set package
- [x] **Named Mark approval** that Ticket 33 live packages are accepted under platform + retention policy
- [x] Ticket closed after the above signatures

**Status:** complete — live evidence 40/40 and named human approvals signed 2026-07-19
