# 08 — Migrate the Factory Audit Cluster and Pillar

**What to build:** Convert all ledger-approved Factory Audit content into the governed model and deliver a pillar-led journey that separates audit methodology, risk interpretation, and the commercial audit service. The result must preserve approved URLs and make every claim and cross-link reviewable.

**Blocked by:** 06.

**Status:** implementation/scaffold complete; approval-required / not done

## Progress — 2026-07-18

- Added a pure, deterministic migration preview for the exact one-route Factory Audit frozen baseline.
- Added fail-closed gates for ledger lock/digest/approval, per-entry approval, exact identity and route preservation, the unique pillar, commercial/editorial link planning, destructive actions, evidence readiness, and cross-cluster assignment.
- Added synthetic test-only approved fixtures. They do not alter or export production approval data.
- The current production ledger remains `approval-required` with `locked=false`; the preview therefore emits diagnostics and zero mutation commands.
- No MDX, route, sitemap, navigation, generated artifact, or migration-ledger content was changed.

## Remaining blockers

- A human reviewer must approve and digest-lock Ticket 06 without fabricated reviewer, approval date, or expected digest values.
- The current article snapshot must provide review ownership, evidence readiness, methodology reference, and claim boundary data that pass the preview contract.
- Actual metadata/link application and Ticket 13 strict cutover remain separate post-approval work.

- [ ] Every ledger-assigned Factory Audit article has valid governed metadata and evidence status.
- [ ] One unique Factory Audit pillar is designated and satisfies pillar requirements.
- [ ] Each cluster article links to the pillar and the pillar exposes every approved member article.
- [ ] Informational guidance is clearly distinguished from commercial service promises.
- [ ] Evidence gaps, claim boundaries, and review ownership are visible before strict validation.
- [ ] Approved public URLs and canonical targets remain unchanged during this migration.
- [ ] No migrated article is simultaneously assigned as the primary member of another cluster.
