# Governed Cluster Migration Preview

This template describes the preflight contract for Tickets 07–12. It is not a migration artifact and must not be treated as evidence of approval.

## Scope

- Supported clusters: `supplier-verification`, `factory-audit`, `quality-inspection`, `factory-visits`, and `china-sourcing`.
- Input: the canonical cluster registry, migration ledger, its validated report, a supported cluster ID, read-only current article snapshots, and (when supplied) one isolated scope and release/rollback binding.
- Output: deterministic diagnostics, per-article plans, expected governed frontmatter, expected links, and conditional mutation command descriptors.
- Side effects: none. The preview does not read files, write files, call a network service, deploy, submit indexing requests, or modify routes.
- `quality-inspection` remains a zero-baseline `planned-new` pillar exception until Ticket 09 records a separately governed create decision; this preview never emits a create command.

## Execution gate

`executable` may be `true` only when all of the following are true:

1. The ledger report is `valid` and `locked=true`.
2. The report digest and ledger protection digest match the canonical ledger payload.
3. The global ledger approval includes an approved status, a human reviewer, and a valid approval date.
4. The target cluster pillar plan is approved and exactly matches the frozen registry-derived cluster contract.
5. Every ledger entry decision and every cannibalisation review is approved with a human reviewer and valid review date.
6. The current snapshot has exact baseline membership and exact content ID, slug, route, and canonical-route identity.
7. The cluster has one frozen pillar where the plan is `existing-baseline`, its exact members, the required commercial/editorial navigation, and no cross-cluster primary assignment.
8. No merge, redirect, retire, route change, or canonical change is requested.
9. Review, evidence, methodology, and claim-boundary requirements are satisfied. Visible evidence gaps remain draft-only.
10. A supplied production release binding names a release, binds both release and rollback artifacts to the same canonical ledger digest, and includes an owner, triggers, and recovery steps. Fixture bindings are test-only and always fail closed.
11. The scope names one cluster and one bundle, declares a known non-null count, and does not exceed its maximum; unrelated or oversized scopes require a split.

If any error diagnostic exists, `executable=false` and `mutationCommands` is an empty array. The current production ledger is approval-required and unlocked, so its preview remains blocked and cannot authorize production migration.

## Ticket 12 China Sourcing overlays

Ticket 12 is a separate, read-only preflight layered on the governed Ticket 11 China Sourcing preview. It applies these additional rules:

- Overlay identities come only from the canonical registry, the current migration ledger, and the exact Ticket 11 article plans. Routes, content IDs, classifications, and specialist relationships are never guessed.
- The Ticket 11 China Sourcing member set is split without overlap: `category-sourcing` members are industry overlays and the remaining members are supporting overlays. The editorial pillar itself is not an overlay.
- Every overlay inherits the exact China Sourcing commercial root and editorial pillar. Its existing route and canonical route must remain identical.
- A specialist-cluster link may be derived only from an entry's governed required links or a recorded cross-cluster cannibalisation review. A review-derived route that is not bound in the entry remains a blocking diagnostic rather than an authorised change.
- Evidence readiness, intent, funnel stage, target market, primary membership, and non-cannibalisation review state must remain exact and reviewable. Draft, gaps-visible, null, duplicate, ambiguous, or destructive inputs fail closed.
- The ledger report, Ticket 11 preview, release artifact, and rollback artifact must bind the same computed ledger digest. Release ownership, rollback ownership, triggers, and ordered recovery steps must exactly retain the Ticket 11 binding.
- If the ledger has no industry overlay entries, the result is `planned` with an explicit diagnostic and an empty command list. No content is fabricated.
- `actual` and `fixture` modes are validation-only. Ticket 12 permanently returns `executable=false` and `mutationCommands=[]`, including for fully approved synthetic fixtures.

The current production ledger is approval-required and `locked=false`. Its missing or unbound specialist-link decisions also remain visible, so Ticket 12 is blocked pending human ledger approval and evidence/release review.

## Consumer contract for Ticket 13

A future strict cutover consumer must:

- recalculate and compare the ledger digest immediately before applying a command;
- verify every command precondition against the same current article identity;
- verify the production release and rollback binding still names the same artifact digest;
- reject commands with route or canonical changes;
- apply only the listed governed frontmatter and required-link additions;
- stop the entire cutover on the first precondition failure;
- run strict article validation after application;
- keep preview generation separate from file mutation and deployment.

Synthetic approved fixtures are permitted only in tests and must be clearly named as synthetic. They must use `origin=fixture`, `public=false`, never authorize execution, and must never be exported as production ledger data or generated migration artifacts.
