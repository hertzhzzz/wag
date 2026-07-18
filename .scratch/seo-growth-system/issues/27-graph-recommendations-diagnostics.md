# 27 — Replace Category Recommendations with Graph Recommendations and Diagnostics

**What to build:** Generate article recommendations from governed cluster, relationship, and funnel data instead of category similarity. The same graph must produce diagnostics for orphan risk, broken relationships, missing pillars, weak anchors, and cannibalisation candidates with deterministic fallbacks.

**Blocked by:** 25.

**Status:** 27B-contract-complete / production-blocked

- [ ] Recommendations prioritise explicit cluster and relationship data, then apply a documented deterministic fallback.
- [ ] Results contain no self-links, duplicates, drafts, blocked content, or invalid destinations.
- [ ] Funnel-aware next steps can distinguish informational siblings from relevant service paths.
- [ ] Diagnostics report orphans, broken relationships, root connectivity, missing pillars, anchor gaps, and cannibalisation candidates.
- [ ] Hard graph violations and advisory optimisation warnings are clearly separated.
- [ ] Repeated runs on unchanged inputs produce the same recommendations and diagnostics.
- [ ] Existing article routes remain functional when a recommendation set is empty.

## Ticket 27B integration contract repair — 2026-07-18

- Guides integration now requires the strict Ticket 13 cutover dependency and verifies ticket identity, shared `asOf`, migration-ledger digest, Tickets 07–11 preview digests, Ticket 12 overlay digest, graph digest, artifact-set digest, cutover digest, non-actual scaffold mode, `executable=false`, and an empty command list.
- The Guides integration dependency now references the actual Ticket 25 source-retirement report rather than self-reported status, approval, or parity fields, and requires Ticket 25 to share the same explicit `asOf`.
- The full Ticket 24 input/report pair is rebuilt and compared canonically; schema versions, canonical report/artifact/disposition approval digests, governance/release gate, independent human approvals and timestamps, rollback/lineage, unaffected URLs, and disabled execution must remain intact.
- Ticket 27B recommendations/diagnostics bind schema, ready status, deterministic graph/recommendation/diagnostic/artifact/report digests, Ticket 25 lineage, shared `asOf`, and permanently disabled execution.
- The top-level integration artifact digest is recomputed over the complete current subject, including Ticket 25 identity, guides model/descriptors, graph, projections, URL dispositions, rollout scope, Ticket 13, and Ticket 27B while excluding only self/copy digest fields.
- Ticket 27B verifies the Ticket 25 schema and artifact versions, status, blockers, artifact digest, report digest, and permanently disabled execution metadata.
- Content and production release approvals must be independent human actors and bind the same release, report, and current integration artifact.
- Render acceptance binds both the current integration artifact and an immutable render artifact; every modality evidence digest must match that render artifact.
- Guides projections require known Guides source and target identities, consistent reference kinds, uniqueness, and deterministic canonical ordering.
- A real in-memory Ticket 24 to Ticket 25 to Ticket 27B integration test proves the cross-module digest chain without changing routes, content, indexing, or production state.
- Mutation regressions cover forged Ticket 24 report bindings, provenance/public mismatches, future timestamps, Ticket 25 `asOf` drift, Ticket 27B recommendation/report drift, and composite integration artifact drift.
