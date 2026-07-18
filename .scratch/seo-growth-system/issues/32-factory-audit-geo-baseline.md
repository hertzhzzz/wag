# 32 — Capture the Factory Audit GEO Baseline

**What to build:** Run and document ten stable buyer questions for the Factory Audit cluster across the approved answer platforms, recording whether Winning Adventure Global is mentioned, which URL is cited, answer accuracy, and notable competitor visibility. The result is an observation baseline, not a causal performance claim.

**Blocked by:** 13.

**Status:** ready-for-agent

- [ ] Exactly ten stable Factory Audit questions are approved and versioned.
- [ ] Each observation records platform, model or surface when available, date, locale, and question wording.
- [ ] Brand mention, cited URL, factual accuracy, answer completeness, and competitor presence are recorded separately.
- [ ] Unsupported answers and misleading citations are captured as quality risks.
- [ ] Raw observations remain available for later audit.
- [ ] The report distinguishes observed output from inferred causes or optimisation claims.

## Implementation progress — 2026-07-18

The shared GEO baseline contract now provides a fail-closed capture and evaluation scaffold for the Factory Audit cluster. It validates the versioned ten-question set, explicit as-of time, platform approvals, Ticket 13 strict-cutover approval, live-run provenance, prompt/question-set matching, raw snapshot integrity, separated observation quality risks, and null metrics when observations are absent or invalid.

A reusable capture template is available at `docs/seo/templates/geo-baseline-capture.md`. Synthetic test fixtures are used only to exercise the contract and are not production observations.

This ticket is not complete. The following real-world gates remain outstanding:

- [ ] Approve the exact ten-question set and record its matching digest.
- [ ] Record Ticket 13 strict-cutover approval.
- [ ] Approve each answer platform and retention/privacy path.
- [ ] Capture a complete live run with raw snapshots and independent quality review.
- [ ] Reconcile unsupported answers, misleading citations, and missing slots before reporting.
