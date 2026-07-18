# 40 — Complete the First Refresh or Evidence Publication Event

**What to build:** Run one real refresh, evidence-strengthening, or internal-link opportunity through briefing, evidence review, governed editing, validation, preview, dual approval, deployment, and live verification. Preserve the existing URL unless a separate approved disposition explicitly requires a change.

**Blocked by:** 28, 29, 38.

**Status:** contract-hardened-real-event-blocked

## Contract-layer implementation

The pure, fail-closed contract for `first_refresh_publication` is implemented in `frontend/lib/seo/publication/`. It consumes selected opportunity/evidence/articleUpgrade/quality digests and a trusted Ticket 38 release binding. It does not edit content, publish, deploy, call Search Console/indexing, or claim search/ranking evidence.

- [x] Exact recursive keys, RFC3339 timezone validation, and future-date isolation are enforced.
- [x] `selected` opportunity and approved `articleUpgrade`/evidence are required.
- [x] Existing URL is preserved by default; a changed URL requires an approved disposition digest.
- [x] Trusted release binding is required; caller-supplied `live_verified` and `deployed` values are rejected.
- [x] `workflowInstanceId`, `releaseId`, `artifactDigest`, `reportDigest`, and `nonce` are explicitly bound in the event.
- [x] Independent content/release approvals, rollback readiness, and rollback verification requirements are enforced for actual release evaluation.
- [x] Report generation is pure and records no side effects, indexation, or ranking claims.

## Real-event gates still open

- [ ] The opportunity is selected through the governed queue and has a reviewer-approved brief.
- [ ] Existing claims, evidence age, search intent, internal links, and conversion path are reviewed before editing.
- [ ] The current URL is preserved unless an approved URL disposition says otherwise.
- [ ] Updated evidence, authorship, review date, methodology, GEO passages, and graph changes pass validation.
- [ ] Content approval and production approval are recorded as separate trusted events.
- [ ] Live verification confirms the intended URL, canonical, content, structured data, links, and enquiry path.
- [ ] The event report records failures, corrections, timings, and lessons without claiming indexing or ranking outcomes prematurely.

No real event is claimed complete by this ticket implementation.

## 2026-07-18 integration review

- The shared publication parser now rejects untrusted caller-shaped and copied Ticket38 bindings before refresh evaluation.
- Actual publication chronology uses the same strict boundary as Ticket39: the event must occur after, not at, trusted live verification.
- A real refresh remains blocked by governed selection/evidence, approved URL disposition when applicable, the upstream Ticket13/24/25/27B/30/36/37 trust chain, two human approvals, deployment, and independent live verification. No production refresh, indexing, or ranking result is claimed.
