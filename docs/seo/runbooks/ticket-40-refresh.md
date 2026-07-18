# Ticket 40 Refresh Publication Policy Runbook

## Current status

This runbook describes a deterministic dry-run policy scaffold. It does not edit or publish a real page and must not be used to mark Ticket 40 complete.

Direct blockers remain Tickets 28, 29, and 38. Complete programme closure also depends on Tickets 01–30 and Ticket 38. Until those dependencies are closed, the only valid deliverables here are reusable contracts, tests, templates, and instrumentation.

## What the policy does

`evaluateRefreshPublication`:

1. accepts an existing slug and URL plus an explicit target URL disposition;
2. rejects unknown fields and silent URL changes;
3. preserves before and after artifact digests, reviewed change reasons, evidence changes, internal-link changes, metadata changes, governed factual changes, source lineage, approvals, release state, rollback plans, review plans, and failure reasons;
4. requires human attribution for a changed fact, case study, statistic, or publication date;
5. permits unverified factual material only when it is removed or generalized; otherwise the event is blocked;
6. distinguishes no-op, blocked, ready, validated, approved, deployed, and live-verified states;
7. produces deterministic, deeply frozen output without modifying content or calling an external system.

## URL rule

The existing URL is the default target. A different target URL is invalid unless a separate human URL approval binds:

- the existing URL;
- the target URL;
- the before artifact digest;
- the after artifact digest;
- the review digest;
- an explicit UTC timestamp; and
- a reviewed redirect plan.

The policy records an approved disposition but does not create a redirect, change a slug, edit a sitemap, or deploy a route.

## Factual-change rule

The policy never invents or automatically rewrites a fact, case study, statistic, or publication date.

- A changed governed item requires a human actor.
- An unverified item may be removed or generalized.
- An unverified update remains blocked.
- An unchanged item does not claim an editor.
- Before and after digest drift without declared changes is blocked.
- Declared changes without a new after digest are blocked.

## Lifecycle semantics

| State           | Meaning                                                                                 | Published or completed |
| --------------- | --------------------------------------------------------------------------------------- | ---------------------- |
| `no-op`         | No substantive change and no artifact change                                            | No                     |
| `blocked`       | A hard contract, URL, content, digest, approval, deployment, or live-probe issue exists | No                     |
| `ready`         | A change is declared but one or more governed gates have not run                        | No                     |
| `validated`     | All governed gates passed                                                               | No                     |
| `approved`      | Independent approvals bind the after artifact and review digests                        | No                     |
| `deployed`      | A matching deployment record exists                                                     | No                     |
| `live_verified` | A matching live probe verifies the governed target and after artifact                   | Yes                    |

`deployed` never means completed. A search notification never means indexed.

## Search and measurement semantics

- Search notification uses `not_attempted`, `submitted`, or `failed`.
- Indexation independently uses `unknown`, `pending`, `indexed`, or `not_indexed`.
- `indexed` and `not_indexed` require real observation evidence and an explicit UTC time.
- Unavailable, pending, or blocked metrics use `null`; zero is reserved for a real available observation.
- The policy does not call Google Search Console, Google Analytics, a customer relationship management system, a generative-engine monitoring source, or any release platform.

## Dry-run procedure

1. Copy `docs/seo/templates/refresh-publication-event.md` into a temporary review record outside public content.
2. Start with the existing governed slug, URL, and before artifact digest.
3. Record only real reviewed changes and a real after artifact digest.
4. Preserve the URL unless a separate authenticated URL disposition exists.
5. Mark unsupported factual material for removal, generalization, or a blocked outcome; do not write a replacement.
6. Convert the reviewed record to `RefreshPublicationInput` in a test or controlled local harness.
7. Evaluate it with `evaluateRefreshPublication`.
8. Treat the result as policy evidence only, not approval or execution authority.

## Local verification

Run only focused, side-effect-free checks:

```bash
npx jest --runInBand lib/seo/publication/refreshPolicy.test.ts
npx eslint lib/seo/publication/contracts.ts lib/seo/publication/refreshPolicy.ts lib/seo/publication/refreshPolicy.test.ts
npx prettier --check lib/seo/publication/contracts.ts lib/seo/publication/refreshPolicy.ts lib/seo/publication/refreshPolicy.test.ts docs/seo/templates/refresh-publication-event.md docs/seo/runbooks/ticket-40-refresh.md
```

Expected properties include no-op behavior, URL approval enforcement, governed factual-change handling, gate progression, digest drift blockers, deployment not completing the event, notification and indexation separation, null metric handling, live URL drift blockers, deterministic summaries, deep freezing, rejection of unknown privilege fields, and absence of ambient time or external-action APIs.

## Requirements before a real event

A real Ticket 40 event requires all of the following outside this scaffold:

- Ticket 28 governed opportunity and reviewer-approved brief;
- Ticket 29 approved expertise and evidence records;
- Ticket 38 authenticated content approval and independent production approval;
- Ticket 38 immutable audit storage;
- Ticket 38 real release executor and deployment record;
- Ticket 38 authenticated live probe;
- closure of all dependencies required by the programme plan;
- real search and measurement observations, if reported.

No factual claim, case study, statistic, publication date, approver, timestamp, URL decision, metric, deployment, live result, indexing result, or completion checkbox may be fabricated to satisfy this runbook.

## Failure handling

- Keep the event blocked or at the highest state supported by evidence.
- Preserve sorted blocker and failure-reason records.
- Correct the reviewed input without mutating the policy result.
- Re-run the pure evaluation with the corrected immutable evidence set.
- Use rollback, redirect, and review plans only as instructions for separately authorized executors.
