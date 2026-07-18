# 07 — Migrate the Supplier Verification Cluster and Pillar

**What to build:** Convert all ledger-approved Supplier Verification content into the governed model and deliver a coherent pillar-led journey from informational checks to the relevant commercial service. The cluster must preserve approved URLs, expose evidence gaps, and provide reciprocal navigation between the pillar and every member article.

**Blocked by:** 06.

**Status:** implementation/scaffold complete; approval-required / not done

## Progress — 2026-07-18

- Added a pure, deterministic migration preview for the exact six-route Supplier Verification frozen baseline.
- Added fail-closed gates for ledger lock/digest/approval, per-entry approval, exact identity and route preservation, one pillar, dual-root/member link planning, destructive actions, evidence readiness, and cross-cluster assignment.
- Added synthetic test-only approved fixtures. They do not alter or export production approval data.
- The current production ledger remains `approval-required` with `locked=false`; the preview therefore emits diagnostics and zero mutation commands.
- No MDX, route, sitemap, navigation, generated artifact, or migration-ledger content was changed.

## Remaining blockers

- A human reviewer must approve and digest-lock Ticket 06 without fabricated reviewer, approval date, or expected digest values.
- Current article snapshots must provide review ownership, evidence readiness, methodology references, and claim boundaries that pass the preview contract.
- Actual metadata/link application and Ticket 13 strict cutover remain separate post-approval work.

- [ ] Every ledger-assigned Supplier Verification article has valid governed metadata and evidence status.
- [ ] One unique Supplier Verification pillar is designated and satisfies pillar requirements.
- [ ] Each cluster article links to the pillar and the pillar exposes every approved member article.
- [ ] Intent, funnel, market, author, review, and methodology fields pass validation.
- [ ] Missing or weak evidence is visible to reviewers and cannot be represented as verified fact.
- [ ] Approved public URLs and canonical targets remain unchanged during this migration.
- [ ] No migrated article is simultaneously assigned as the primary member of another cluster.

## P1 contract hardening — 2026-07-18

- The public migration-preview entry now accepts `unknown` and validates a strict, exact-key runtime contract before invoking the typed internal implementation. Malformed, null, extra-key, custom-prototype, identity-drift, route-drift, canonical-drift, and digest-drift inputs fail closed.
- Actual/production evidence uses one explicit `asOf` and cannot exceed 2026-07-18. Ledger approval, entry decision, cannibalisation review, article review, and other occurred governance dates are bounded by `asOf`; `reviewDueDate` is explicitly a scheduled future-capable date and is not approval evidence. Future fixtures require `dataMode=synthetic_fixture`.
- Preview readiness is separate from execution authorization. The contract always returns `executionAuthorization=not-authorized`, `executable=false`, and `mutationCommands=[]`; it does not perform or authorize production cutover.
- Focused tests cover strict input/output shape, missing/null/extra/prototype rejection, the 2026-07-18 actual boundary, future-actual rejection, explicit synthetic-future fixtures, digest mutation, and preview non-executability.
- No production migration, content mutation, route or canonical change, indexing request, commit, push, or deployment was performed. Human ledger approval/digest lock and the separate cutover gates remain required.
