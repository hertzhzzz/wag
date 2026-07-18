# 41 — Produce the First Weekly Cadence and Gate Report

**What to build:** Close the first operating week with a reusable report that counts only publication events that passed all gates, separates failed or deferred work, summarises content, search, GEO, graph, evidence, review, and enquiry signals, and prepares the next queue without recommending scale before the process is proven.

**Blocked by:** 37, 39, 40.

**Status:** request-changes-addressed; first actual report awaits trusted Ticket39/40 release envelopes

- [x] The contract counts only `actual` publication events supplied through the opaque Ticket38 release-event adapter after dual approval, deployment, current live verification, and rollback checks.
- [x] Synthetic-fixture and dry-run completions are reported separately and never contribute to the actual completed count or target.
- [x] Failed, blocked, deferred, rescheduled, and pending items are reported separately with owners and next actions.
- [x] Content, search, GEO, graph, evidence, review, and enquiry measures include definitions, raw values, cardinality, date ranges, and source lineage.
- [x] The report distinguishes early operational signals from ranking, indexing, enquiry, or revenue outcomes that need more time, while preserving `null` rather than zero for unavailable observations.
- [x] Search notification and indexation observation are independent fields; submitted and indexed evidence may coexist without either being inferred from the other.
- [x] The next-week queue separates approved/recommended capacity from selected capacity. A `hold` decision hard-caps selected work at two.
- [x] A reusable weekly template, gate checklist, approval/digest evidence table, capacity approval audit, and renderer are provided.
- [x] Markdown renderer output escapes raw HTML-sensitive characters and contains approval, digest, gate, rollback, capacity, provenance, and audit evidence.
- [x] The local CLI accepts only bounded regular non-symlink files inside the configured allowed root and emits safe errors without paths, contents, or secrets.
- [x] No recommendation to increase publishing volume is made until eight consecutive compliant weeks demonstrate quality, safety, and sustainable review throughput; any increase still requires human approval.
- [x] The implementation remains observation-only and performs no publication, deployment, notification, indexation, or production write.

## Actual-report boundary on 2026-07-18

No trustworthy Ticket39/40 production event envelopes were available in this worker's permitted write set, so the implementation does not fabricate the originally anticipated two completed events. The first actual report must remain at zero verified completions until those tickets provide trusted Ticket38 adapter outputs. Dates after 2026-07-18, including 2026-07-19 and 2026-07-20, are accepted only in explicitly labelled synthetic fixtures and never feed actual counts.

## Request-changes evidence

- Completion evidence binds workflow/release/artifact/report/rollback digests, both approval principals and binding digests, deployment evidence, fresh live verification, rollback evidence, gate evidence digest, event digest, event ID, and trusted provenance.
- Copied, forged, dry-run, or fixture envelopes fail closed for actual completion.
- Recursive exact-key validation rejects unknown nested fields.
- RFC3339 UTC `Z` validation rejects local timestamps and invalid calendar dates.
- Unsafe event URLs containing credentials, query strings, or fragments are rejected.
- Renderer and CLI hardening have dedicated regression tests.
