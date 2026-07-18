# 09 — Migrate the Quality Inspection Cluster and Pillar

**What to build:** Convert all ledger-approved Quality Inspection content into the governed model and establish a clear pillar-led journey for inspection planning, defect control, reporting, and escalation. If the ledger confirms no suitable existing pillar, create and approve a new pillar before strict cutover.

**Blocked by:** 06.

**Status:** ready-for-agent

- [ ] Every ledger-assigned Quality Inspection article has valid governed metadata and evidence status.
- [ ] One unique Quality Inspection pillar is approved, whether migrated or newly created.
- [ ] Each cluster article links to the pillar and the pillar exposes every approved member article.
- [ ] Inspection stage, sampling, defect, and outcome claims state their limits and source basis.
- [ ] Intent, funnel, market, author, review, and methodology fields pass validation.
- [ ] Approved public URLs and canonical targets remain unchanged during this migration.
- [ ] No migrated article is simultaneously assigned as the primary member of another cluster.

## Progress — 2026-07-18

- Added the shared governed preview contract for `quality-inspection`, derived from the canonical registry and migration ledger rather than guessed routes or identities.
- The zero-baseline `planned-new` pillar remains fail-closed: the preview reports `planned-new-pillar-create-required` and emits no create or migration command.
- Added focused synthetic and tamper coverage alongside the existing Ticket 07/08 regression suite; no production content, route, canonical, or ledger data was changed.

## Blockers

- The production ledger is still `approval-required` with `locked=false`; real global, pillar, entry, and cannibalisation approvals are not present.
- Ticket 09 still needs an explicit governed create decision and approval for the new pillar before strict cutover can be considered.

## Progress update — 2026-07-18

- Hardened the shared preview preflight so Tickets 09–11 require an explicit governance binding; draft/gaps evidence, null readiness fields, digest drift, and malformed rollback data fail closed without throwing.
- The focused migration suites now pass 34/34 tests, including Ticket 07/08 regression, remaining-cluster synthetic/tamper coverage, scope-split checks, input immutability, deterministic ordering, and deep-freeze checks.
- No production approval, create command, migration command, route change, canonical change, redirect, rename, delete, or indexing action was performed.

## Blocker update — 2026-07-18

- Quality Inspection remains intentionally blocked as the canonical zero-baseline `planned-new` exception: the current ledger has no member entries and the schema/ledger expose no approved create action. The preview therefore reports `planned-new-pillar-create-required` and keeps `mutationCommands=[]` rather than fabricating a production migration.
- Production execution remains blocked until Ticket 06/Ticket 09 governance owners provide the create decision (if still required), real global/pillar/entry/cannibalisation approvals, and release/rollback binding.

## Contract-fixture clarification — 2026-07-18

- The synthetic coverage is contract-level only: identity, membership, links, canonical, and plan shape are validated, but `origin=fixture` and `public=false` keep the report blocked with `mutationCommands=[]`.
- Because Quality Inspection is the canonical zero-baseline `planned-new` case, its synthetic coverage does not claim an executable pass; no create action is invented.
