# Governed Cluster Migration Preview

This template describes the preflight contract for Tickets 07–11. It is not a migration artifact and must not be treated as evidence of approval.

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
