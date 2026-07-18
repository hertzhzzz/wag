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
