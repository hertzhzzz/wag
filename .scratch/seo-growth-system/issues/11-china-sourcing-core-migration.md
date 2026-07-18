# 11 — Migrate the China Sourcing Core and Pillar

**What to build:** Convert the ledger-approved core China Sourcing content into the governed model and establish the main pillar journey for Australian buyers. The core must organise supplier discovery, commercial preparation, payment, logistics, and risk escalation without absorbing specialist cluster intent.

**Blocked by:** 06.

**Status:** ready-for-agent

- [ ] Every core China Sourcing article has valid governed metadata and evidence status.
- [ ] One unique China Sourcing pillar is designated and satisfies pillar requirements.
- [ ] Each core article links to the pillar and the pillar exposes every approved core member.
- [ ] Australian-buyer context, funnel stage, and commercial-service relationship are explicit.
- [ ] Specialist verification, audit, inspection, and visit intent is linked rather than duplicated.
- [ ] Approved public URLs and canonical targets remain unchanged during this migration.
- [ ] No migrated article is simultaneously assigned as the primary member of another cluster.

## Progress — 2026-07-18

- Added the shared governed preview contract for `china-sourcing`, including the exact thirteen-entry baseline, pillar identity, dual-root links, canonical identity, scope split, digest, approval, release, and rollback gates.
- Added a synthetic approved pass fixture and fail-closed tamper matrix; contract derivation uses the canonical registry and ledger without changing content or generated artifacts.
- No production migration, route change, canonical change, redirect, rename, delete, or indexing action was executed.

## Blockers

- The production ledger is still `approval-required` with `locked=false`; real global, pillar, entry, and cannibalisation approvals are not present.
- No production release/rollback binding is available for an executable migration preview.

## Progress update — 2026-07-18

- Hardened the shared preview preflight so Ticket 11 requires an explicit governance binding; draft/gaps evidence, null readiness fields, digest drift, and malformed rollback data fail closed without throwing.
- The focused migration suites now pass 34/34 tests, including the exact thirteen-entry China Sourcing synthetic approved pass, tamper/fail-closed matrix, scope-split checks, Ticket 07/08 regression, input immutability, deterministic ordering, and deep-freeze checks.
- No production approval, migration command, route change, canonical change, redirect, rename, delete, or indexing action was performed.

## Blocker update — 2026-07-18

- Production execution remains blocked by the current `approval-required` ledger with `locked=false`, absent real global/pillar/entry/cannibalisation approvals, and absent release/rollback binding. Synthetic approvals remain test-only (`origin=fixture`, `public=false`).

## Contract-fixture clarification — 2026-07-18

- The synthetic approved fixture is contract-level only: exact identity, thirteen-entry membership, links, canonical, and plan shape are validated, but `origin=fixture` and `public=false` keep the report blocked with `mutationCommands=[]`.
