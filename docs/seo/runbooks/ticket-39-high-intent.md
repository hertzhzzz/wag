# Ticket 39 High-Intent Publication Policy Runbook

## Current status

This runbook describes a deterministic dry-run policy scaffold. It does not execute a real publication event and must not be used to mark Ticket 39 complete.

Direct blockers remain Tickets 28, 29, and 38. Complete programme closure also depends on Tickets 01–30 and Ticket 38. Until those dependencies are closed, the only valid deliverables here are reusable contracts, tests, templates, and instrumentation.

## What the policy does

`evaluateHighIntentPublication`:

1. accepts explicit event data;
2. rejects unknown fields;
3. validates the candidate query, intent, cluster, target URL, and page type;
4. requires verified schema, evidence, graph, metadata, privacy, review, and release-preflight gates bound to one artifact digest;
5. preserves source lineage, independent human approvals, artifact and review digests, deployment evidence, live-probe evidence, search records, metrics, rollback plans, review plans, and failure reasons;
6. produces a deterministic, deeply frozen decision and summary digest;
7. performs no file write, network request, deployment, approval, notification, analytics query, or other external action.

## Lifecycle semantics

| State           | Meaning                                                                                                    | Published or completed |
| --------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------- |
| `draft`         | Required candidate or gate evidence is not ready                                                           | No                     |
| `validated`     | Governed gates passed; release approval is not yet valid                                                   | No                     |
| `approved`      | Independent content and production approvals bind the reviewed artifact                                    | No                     |
| `deployed`      | A matching deployment record exists                                                                        | No                     |
| `live_verified` | A matching live probe verifies URL, canonical, artifact, content, structured data, links, and enquiry path | Yes                    |

A claimed later state is reduced to the highest supported state when a digest, URL, approval, deployment, or live-verification record drifts. There is no override control in the input contract.

## Search and measurement semantics

- `submitted` records only a real transport submission.
- Indexation remains `unknown` or `pending` until a real observation exists.
- `indexed` and `not_indexed` require observation evidence and an explicit UTC time.
- Unavailable, pending, or blocked metrics use `null`, never a synthetic zero.
- The policy does not call Google Search Console, Google Analytics, a customer relationship management system, a generative-engine monitoring source, or any release platform.

## Dry-run procedure

1. Copy `docs/seo/templates/high-intent-publication-event.md` into a temporary review record outside public content.
2. Populate only fields backed by real source records. Keep unavailable external data null.
3. Convert the reviewed record to `HighIntentPublicationInput` in a test or controlled local harness.
4. Evaluate it with `evaluateHighIntentPublication`.
5. Store the returned blockers, state, summary, and summary digest as policy evidence only.
6. Do not interpret `eligible=true` as approval to release.
7. Do not interpret `deployed` as completion.
8. Do not interpret search notification submission as indexation.

## Local verification

Run only focused, side-effect-free checks:

```bash
npx jest --runInBand lib/seo/publication/highIntentPolicy.test.ts
npx eslint lib/seo/publication/contracts.ts lib/seo/publication/highIntentPolicy.ts lib/seo/publication/highIntentPolicy.test.ts
npx prettier --check lib/seo/publication/contracts.ts lib/seo/publication/highIntentPolicy.ts lib/seo/publication/highIntentPolicy.test.ts docs/seo/templates/high-intent-publication-event.md docs/seo/runbooks/ticket-39-high-intent.md
```

Expected properties include happy-path evaluation, gate blockers, digest and URL drift, deployment not completing the event, notification and indexation separation, null metric handling, deterministic summaries, deep freezing, rejection of unknown privilege fields, and absence of ambient time or external-action APIs.

## Requirements before a real event

A real Ticket 39 event requires all of the following outside this scaffold:

- Ticket 28 governed opportunity and reviewer-approved brief;
- Ticket 29 approved expertise and evidence records;
- Ticket 38 authenticated content approval and independent production approval;
- Ticket 38 immutable audit storage;
- Ticket 38 real release executor and deployment record;
- Ticket 38 authenticated live probe;
- closure of all dependencies required by the programme plan;
- real search and measurement observations, if reported.

No approver, timestamp, URL, metric, deployment, live result, indexing result, or completion checkbox may be fabricated to satisfy this runbook.

## Failure handling

- Keep the event in the state supported by evidence.
- Preserve sorted blocker and failure-reason records.
- Correct the governed input; do not mutate the policy result.
- Re-run the pure evaluation with the corrected immutable evidence set.
- Use the rollback and review plans only as recorded instructions for a separately authorized executor.
