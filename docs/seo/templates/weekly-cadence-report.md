# Weekly SEO Growth Cadence Report

> Observation-only template. Completing or rendering this report does not publish content, deploy an artifact, submit a search notification, call an indexation API, or change approved publishing capacity.

## 1. Report identity and provenance

- Report ID:
- Data mode: `actual` | `synthetic_fixture` | `dry_run`
- Reporting week (UTC): `YYYY-MM-DD` to `YYYY-MM-DD`
- Generated at (RFC3339 UTC, ending in `Z`):
- Provenance source:
- Provenance captured at (RFC3339 UTC, ending in `Z`):
- Fixture ID: required only for `synthetic_fixture`; otherwise `null`
- Input audit digest (`sha256:`):
- Report digest (`sha256:`):
- Report owner:
- Human reviewer:

For an `actual` report, no reporting week, provenance timestamp, generated timestamp, event timestamp, search-notification timestamp, or indexation observation may be later than the observation cutoff. As of this contract revision, the latest permissible actual observation date is **2026-07-18**. Future dates such as 2026-07-19 or 2026-07-20 may appear only in explicitly identified synthetic fixtures and never contribute to actual completion counts.

## 2. Completion summary

- Target events:
- Verified actual completed:
- Actual completed:
- Synthetic-fixture completed (diagnostic only):
- Dry-run completed (diagnostic only):
- Completion source: `actual` | `none`
- Actual target met: yes | no

Only an opaque trusted Ticket38 release-event adapter envelope in `actual` mode may increment **Verified actual completed**. Caller-supplied gate flags, status strings, or copied event objects are not completion evidence. Synthetic and dry-run completions remain visible for diagnostics but never satisfy the actual target.

## 3. Trusted release-event evidence

An actual event counts as completed only when the Ticket38 workflow is trusted, production-approved by two independently bound principals, deployed, independently live-verified, and adapted into a non-copyable release-event envelope. A deployment alone is never completion.

| Event | Workflow instance | Release ID | Artifact digest | Review/report digest | Rollback plan digest | Content principal | Content approved at | Content binding digest | Production principal | Production approved at | Production binding digest |
| ----- | ----------------- | ---------- | --------------- | -------------------- | -------------------- | ----------------- | ------------------- | ---------------------- | -------------------- | ---------------------- | ------------------------- |
|       |                   |            |                 |                      |                      |                   |                     |                        |                      |                        |                           |

| Event | Deployment ID | Deployed at | Destination | Live verified at | Live checks digest | Rollback state | Rollback evidence | Gate evidence digest | Event digest | Envelope issuer/version | Envelope recorded at |
| ----- | ------------- | ----------- | ----------- | ---------------- | ------------------ | -------------- | ----------------- | -------------------- | ------------ | ----------------------- | -------------------- |
|       |               |             |             |                  |                    |                |                   |                      |              |                         |                      |

Required binding and audit fields include `workflowInstanceId`, `releaseId`, `artifactDigest`, `reportDigest`, `preparedAt`, the workflow nonce, `rollbackPlanDigest`, canonical approval principals, approval kinds and timestamps, approval binding digests, deployment/live evidence, rollback generation/evidence, `gateEvidenceDigest`, `eventDigest`, and trusted envelope provenance. Approval or event evidence from another preparation, release, artifact, report, nonce, rollback plan, or workflow instance must be rejected.

### Event disposition

| Event | Kind | Status | Owner | Next action | Schema | Evidence | GEO | Graph | Metadata | Build | Content approval | Release approval | Live verification |
| ----- | ---- | ------ | ----- | ----------- | ------ | -------- | --- | ----- | -------- | ----- | ---------------- | ---------------- | ----------------- |
|       |      |        |       |             |        |          |     |       |          |       |                  |                  |                   |

- Failed:
- Blocked:
- Deferred:
- Rescheduled:
- Pending or deployed but not live-verified:

Every non-completed item requires an owner and a concrete next action. Do not publish around a failed gate.

## 4. Search notification and indexation observation

Search notification and indexation are independent observations. A submitted notification is not proof of indexation, and an indexation observation does not imply that a notification was submitted.

| Event | Notification status | Notification recorded at | Notification detail | Indexation status | Indexation observed at | Indexation evidence |
| ----- | ------------------- | ------------------------ | ------------------- | ----------------- | ---------------------- | ------------------- |
|       |                     |                          |                     |                   |                        |                     |

A search notification may be recorded only after `live_verified`; its `recordedAt` must be strictly later than `verifiedAt`. A rollback invalidates prior live evidence and requires a fresh live verification before any later notification can be recorded.

## 5. Seven measurement categories

Record definitions, raw values, date ranges, cardinality, and source lineage. Use `null`/unavailable when a source is missing; never convert missing data to zero.

| Category | Signal type       | Measure | Definition | Cardinality | Status | Raw value | Numerator | Denominator | Date range | Source lineage |
| -------- | ----------------- | ------- | ---------- | ----------- | ------ | --------: | --------: | ----------: | ---------- | -------------- |
| Content  | Early operational |         |            |             |        |           |           |             |            |                |
| Search   | Lagging outcome   |         |            |             |        |           |           |             |            |                |
| GEO      | Early operational |         |            |             |        |           |           |             |            |                |
| Graph    | Early operational |         |            |             |        |           |           |             |            |                |
| Evidence | Early operational |         |            |             |        |           |           |             |            |                |
| Review   | Early operational |         |            |             |        |           |           |             |            |                |
| Enquiry  | Lagging outcome   |         |            |             |        |           |           |             |            |                |

### Interpretation boundary

- **Early operational signals:** content validation, evidence readiness, GEO/graph checks, review throughput, and release-gate completion.
- **Lagging outcomes:** ranking, indexing, organic search, qualified enquiries, revenue, and other outcomes that require a longer observation window.
- Missing lagging observations remain `null`; they are not zero and do not imply failure.

## 6. Next-week queue and capacity approval

- Human-approved capacity:
- Capacity approver:
- Capacity approval date:
- Capacity approval digest (`sha256:`):
- Recommended capacity:
- Selected capacity:
- Applied decision: `hold` | `eligible_for_human_review`
- Hold cap: `2`
- Selected candidate IDs:
- Deferred candidate IDs:

| Candidate | Kind | Opportunity score | Evidence ready | Destination approved | Links ready | Owner | Next action | Queue state | Reason |
| --------- | ---- | ----------------: | -------------- | -------------------- | ----------- | ----- | ----------- | ----------- | ------ |
|           |      |                   |                |                      |             |       |             |             |        |

`recommendedCapacity` records the approved recommendation. `selectedCapacity` records the enforceable queue selection. While the scaling decision is `hold`, selected capacity must not exceed the configured hold cap of two, even when approved or recommended capacity is higher.

## 7. Scaling decision

- Consecutive compliant weeks:
- Quality gates demonstrated:
- Safety gates demonstrated:
- Review throughput sustainable:
- Decision: `hold` | `eligible_for_human_review`
- Automatic increase: **always false**
- Human decision required before any capacity change: yes
- Decision reasons:

No publishing-volume increase is recommended before eight consecutive compliant weeks with complete quality, safety, and review-throughput evidence. Eligibility for human review is not automatic approval.

## 8. Audit fields

- Input digest:
- Report digest:
- Event digests:
- Gate evidence digests:
- Capacity approval digest:
- Data mode:
- Provenance source:
- Provenance captured at:
- Fixture ID or `null`:

All nested contract objects use exact-key validation. Unknown keys, local timestamps without a timezone, invalid calendar timestamps, unsafe URLs containing credentials/query/fragment, and untrusted copied attestations/envelopes must fail closed.

## 9. Exceptions and follow-up

| Issue | Owner | Next action | Due date | Evidence/reference |
| ----- | ----- | ----------- | -------- | ------------------ |
|       |       |             |          |                    |

## 10. Sign-off

- Content reviewer:
- Release reviewer:
- Measurement reviewer:
- Privacy/attribution reviewer (when applicable):
- Sign-off date:

## 11. Local renderer input policy

The local renderer accepts JSON only from its configured allowed root (default: `.scratch/seo-growth-system`), requires a regular non-symlink file, rejects symlinks in any traversed path component, re-checks the canonical path, applies `O_NOFOLLOW` where supported, and enforces a default maximum size of 1 MiB. Errors are stable and must not expose absolute paths, input contents, or secrets.
