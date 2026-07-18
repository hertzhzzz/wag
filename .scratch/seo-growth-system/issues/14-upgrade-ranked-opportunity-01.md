# 14 — Upgrade Ranked Opportunity 01 as the Tracer Pilot

**What to build:** Upgrade the highest-ranked approved article opportunity end to end as the reusable model for the remaining nine. The result must improve intent satisfaction, evidence traceability, GEO answerability, graph placement, conversion attribution, and mobile readability while keeping content approval separate from release approval.

**Blocked by:** 13.

**Status:** contract complete within scope; blocked by external gates

- [ ] The selected article is rank 01 in the locked opportunity ledger and its selection rationale is recorded.
- [ ] The article directly satisfies its primary query and includes concise, citable answer passages and relevant visible FAQs.
- [ ] Claims, examples, author expertise, methodology, review date, and limitations pass the Evidence Gate.
- [ ] Required pillar, sibling, service, and next-step links pass graph validation without self-links or duplicates.
- [ ] Enquiry attribution uses only the approved campaign and cluster allowlist.
- [ ] Desktop and mobile review confirms readable tables, images, calls to action, and no layout regressions.
- [ ] Content approval is recorded, but production release remains blocked pending the release workflow.

## Implementation progress — 2026-07-18

The reusable fail-closed article-upgrade contract now models Ticket 14 / locked opportunity rank 1 through the shared Ticket 14-23 registry. It records the canonical cluster and target fields, locked opportunity and brief digests, ranking-evidence digest, evidence-package and migration-ledger gates, baseline/current source digests, owner, `asOf`, answer/FAQ/graph/expertise/mobile/metadata checks, declarative attribution metadata, and separate content/release approvals. Reports are preview-only, deterministic, deeply frozen, and never write production content or release artifacts. Runtime context is schema-parsed, schema validity is separated from evidence verification and execution authorization, and self-reported approval, evidence, or ledger status cannot authorize production execution. Because this module has no trusted resolver, issuer, or signature verifier, `evidenceVerified`, `authorizedForExecution`, `productionExecution`, and `executable` remain false.

The contract tests cover synthetic test-only happy paths, missing gates, digest drift, duplicate tickets/targets and internal-link targets, cluster drift, invalid runtime dates and environments, contradictory data modes, dry-run preview guards, unsupported ranking/causal claims, attribution tracking-parameter rejection, null-not-zero observations, approval separation, self-reported trust rejection, cycle/sparse/non-plain/non-finite JSON rejection, explicit no-op/hold/rollback behavior, mutation isolation, and stable digests/reason codes. Focused validation passes: 44 article-upgrade Jest tests and 66 tests across the combined Ticket 30 and Ticket 14-23 run, plus scoped ESLint, Prettier check, and isolated strict TypeScript compilation.

This ticket remains `ready-for-agent` and is not Done. No real target article, ranking/Search Console evidence, source snapshot, approved opportunity brief, Ticket 13 strict cutover, Ticket 06 approved ledger digest, Ticket 30 attribution/privacy approval, human content approval, mobile review, or independent release approval has been fabricated or recorded. No article content was edited, published, deployed, or submitted for indexing.

## Contract hardening update (2026-07-18)

- Ticket 14 remains bound to the shared registry at rank 1; no ad hoc target, URL, cluster, or opportunity key is accepted.
- Candidate and manifest inputs use exact keys, canonical deterministic serialization, stable registry ordering, and SHA-256 digests.
- Reports expose `rollbackBaselineDigest` as the canonical baseline source digest only; the evaluator never executes rollback or publication.
- Content approval and production release approval remain separate, independently attributed records. Self-reported approvals/evidence cannot authorize execution without a trusted external resolver.
- Attribution stays declarative and server-governed; no browser lead-quality inference, PII, free text, or tracking parameters are accepted.
- Future dates are restricted to explicit synthetic fixtures; the current real date is `2026-07-18`.

This ticket is still blocked by the external ranked-opportunity/approval gates and remains non-published. No article content, deployment, production release, or indexing request was changed.
