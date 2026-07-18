# 39 — Complete the First High-Intent Publication Event

**What to build:** Run one real high-intent content opportunity through scoring, briefing, evidence, drafting, validation, preview, dual approval, deployment, and live verification. The event must leave a complete audit trail and prove that automation cannot skip editorial or production judgment.

**Blocked by:** 28, 29, 38.

**Status:** contract-layer-implemented-real-event-blocked

## Contract-layer implementation

The pure, fail-closed contract for `first_high_intent_publication` is implemented in `frontend/lib/seo/publication/`. It consumes selected opportunity/evidence/quality digests and a trusted Ticket 38 release binding. It does not write content, publish, deploy, call Search Console/indexing, or claim search/ranking evidence.

- [x] Exact recursive keys, RFC3339 timezone validation, and future-date isolation are enforced.
- [x] `selected` is required; recommendation cannot be treated as approval.
- [x] Trusted release binding is required; caller-supplied `live_verified` and `deployed` values are rejected.
- [x] `workflowInstanceId`, `releaseId`, `artifactDigest`, `reportDigest`, and `nonce` are explicitly bound in the event.
- [x] Independent content/release approvals, rollback readiness, and rollback verification requirements are enforced for actual release evaluation.
- [x] Report generation is pure and records no side effects, indexation, or ranking claims.

## Real-event gates still open

- [ ] The opportunity is selected through the governed queue and has a reviewer-approved brief.
- [ ] Required expertise and external evidence records are approved before final content approval.
- [ ] Intent, cluster, graph, GEO, attribution, disclosure, and mobile review requirements pass.
- [ ] Content approval and production approval are recorded as separate trusted events.
- [ ] Deployment occurs only through the approved release workflow.
- [ ] Live verification confirms the intended URL, canonical, content, structured data, links, and enquiry path.
- [ ] The event report records failures, corrections, timings, and lessons without claiming indexing or ranking outcomes prematurely.

No real event is claimed complete by this ticket implementation.
