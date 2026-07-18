# 28 — Build the Opportunity Queue and Produce the First Real Brief

**What to build:** Rank refresh, new-content, merge, evidence, and internal-link opportunities with a transparent six-factor model, then turn the highest eligible item into a reviewer-ready brief. Eligibility must respect service relevance and evidence readiness rather than rewarding traffic potential alone.

**Blocked by:** 13.

**Status:** ready-for-agent

- [ ] The queue exposes all six scoring factors, weights, raw inputs, and final score.
- [ ] Refresh, new article, merge, evidence, and internal-link task types are supported.
- [ ] Service relevance and Evidence Gate readiness are explicit eligibility gates.
- [ ] Every queued item names a reviewer, intended destination, cluster, and cannibalisation check.
- [ ] The first real brief contains target intent, reader outcome, evidence needs, graph changes, conversion path, and success measures.
- [ ] Changing an input produces a traceable score and ordering change.
- [ ] Queue generation performs no drafting, publishing, deployment, or indexing action.

## 2026-07-18 implementation progress

- Implemented the deterministic six-factor scoring contract, fixed freshness policy, hard-gated queue ranking, destructive-action review gates, immutable candidate snapshots, and a provisional brief scaffold under `lib/seo/opportunity/`.
- Focused validation passes: 1 Jest suite / 16 tests, ESLint, Prettier check, and isolated strict TypeScript compilation.
- This ticket is not complete: Ticket 13 remains a dependency, and governed real GSC/GA4/SERP/GEO inputs plus a real human reviewer/approval are still unavailable. No first real brief, drafting, publishing, deployment, or indexing was performed.
