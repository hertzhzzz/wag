# 28 — Build the Opportunity Queue and Produce the First Real Brief

**What to build:** Rank refresh, new-content, merge, evidence, and internal-link opportunities with a transparent six-factor model, then turn the highest eligible item into a reviewer-ready brief. Eligibility must respect service relevance and evidence readiness rather than rewarding traffic potential alone.

**Blocked by:** 13 for governed real inputs and production use.

**Status:** code-contract-complete; first-real-brief-blocked

- [x] The queue exposes all six scoring factors, weights, raw inputs, and final score.
- [x] Refresh, new article, merge, evidence, and internal-link task types are supported.
- [x] Service relevance and Evidence Gate readiness are explicit eligibility gates.
- [x] Every queued item names a reviewer, intended destination, cluster, and cannibalisation check.
- [ ] The first real brief contains target intent, reader outcome, evidence needs, graph changes, conversion path, and success measures.
- [x] Changing an input produces a traceable score and ordering change.
- [x] Queue generation performs no drafting, publishing, deployment, or indexing action.

## 2026-07-18 implementation result

- Added strict runtime schemas for candidate input, queue input, scored/ranked opportunities, destructive-action evaluation, queue report, and provisional brief. Public scoring, queue, and brief entry points accept `unknown` and parse before the typed implementation.
- Runtime boundaries reject extra, missing, null/type drift, accessors, custom prototypes, self-reported version/score drift, non-canonical routes, queue identity/order drift, and aggregate trace mutations.
- The single explicit `asOfDate` boundary is `2026-07-18`. Actual/static evidence and human approval after that date fail closed. A future fixture requires an explicit `synthetic-fixture` factor marker.
- The six factors, fixed weights, raw values, normalized values, freshness trace, contributions, aggregate score, coverage, confidence, hard gates, reviewer, destination, cluster, and cannibalisation state remain inspectable in every ranked item.
- `buildFirstOpportunityBrief` converts only the first eligible ranked item into a `candidate-inputs-only` provisional brief. It always requires real human verification and keeps drafting/publishing disabled with null draft/publication outputs.
- Focused validation passes: 1 Jest suite / 21 tests, scoped strict TypeScript, scoped ESLint, Prettier check, and `git diff --check`.
- The real brief checkbox remains open. Ticket 13 is scaffold-ready but production-blocked, and no governed real GSC/GA4/SERP/GEO snapshot or verified human reviewer/approval was supplied. No drafting, publishing, deployment, indexing, production routing, or production evidence claim was performed.
