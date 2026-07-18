# 13 — Strict Governance Graph Cutover Contract/Scaffold

**What is complete:** A self-contained, fail-closed Ticket 13 contract/scaffold that verifies the governed migration graph and exports a digest-bound dependency for downstream integration.

**Blocked by for production:** Explicit human approval and a future production execution ticket. Ticket 13 does not perform or authorize a production cutover.

**Status:** contract/scaffold complete; production blocked. Cutover is not done.

## Contract/scaffold delivered

- [x] Added exact-key runtime boundaries under `lib/seo/cutover/**`; unknown keys fail closed.
- [x] Accepted graph inputs are limited to the five governed Ticket 07–11 previews, the Ticket 12 overlay preview, an approved migration ledger, deterministic graph input, and the four governed SEO artifacts.
- [x] Enforced 23 planned articles, one pillar per cluster, reciprocal root connectivity, zero orphan articles, zero broken relationships, and no route/canonical drift.
- [x] Added one explicit shared `asOf` boundary: **2026-07-18**. No ambient clock is used.
- [x] Production dates after the shared `asOf` fail closed across ledger baseline, ledger approval, entry decision review, cannibalisation review, article reviewed/review-due, cluster preview, graph, and artifact timestamps.
- [x] Future dates are accepted only for explicitly private `synthetic_fixture` inputs; they cannot authorize actual or public production behavior.
- [x] `preview` and `dry-run` are always non-executable. Results always expose `executable: false`, `commands: []`, and `rollback: null`.
- [x] `mode === "actual"` is rejected immediately with an error diagnostic and a blocked result. No real executor is exported from Ticket 13.
- [x] A supplied release workflow cannot grant approval in this scaffold; it produces `approval-binding-not-accepted` and remains blocked.
- [x] Added trusted-result export plus strict parser for the downstream dependency. Copied result objects, unknown keys, mutated frozen values, digest drift, and lineage drift are rejected.

## Downstream GuidesIntegration dependency contract

Consumers should import the Ticket 13 dependency exporter/parser from `lib/seo/cutover` rather than rebuilding lineage from loose fields.

The dependency contains:

1. `ticket: "13"`;
2. `status: "scaffold-ready"` — this means the non-executable contract passed, not production readiness;
3. shared `asOf: "2026-07-18"`;
4. `mode: "preview" | "dry-run"`;
5. `executable: false` and `commands: []`;
6. `migrationLedgerDigest`;
7. exact Ticket 07–11 preview digests keyed by `"07"` through `"11"`;
8. `ticket12OverlayDigest`;
9. `graphDigest`;
10. `artifactSetDigest`;
11. `cutoverDigest`;
12. `dependencyDigest`, recomputed by the strict parser to detect copy or lineage drift.

A downstream consumer must reject any dependency with `mode === "actual"`, non-empty commands, executable state, a different `asOf`, missing/extra digest keys, or a mismatched dependency digest.

## Ticket 12 interface assumptions

Ticket 13 consumes the current `ChinaSourcingOverlaysMigrationPreview` read-only and assumes:

1. `ticket === "12"`, `clusterId === "china-sourcing"`, `status === "ready"`, and `contractReady === true` identify a valid overlay scaffold.
2. `executable === false` and an empty `mutationCommands` array are mandatory; Ticket 13 never executes overlay mutations.
3. `ledgerDigest` and the complete Ticket 12 preview value remain digest-bound into `ticket12OverlayDigest`.
4. Ticket 12 remains a contract/scaffold and is not production mutation authorization.

Ticket 13 also consumes the current Ticket 07–11 `cluster-migration-preview.v2` shape and assumes each preview shares `asOf: "2026-07-18"`, has provenance-aligned `dataMode`, is `previewReady`, exposes `executionAuthorization: "not-authorized"`, and remains non-executable with no mutation commands.

These assumptions are intentionally fail-closed. A future upstream interface must preserve them or introduce an explicitly versioned adapter.

## Test coverage

- [x] Actual mode is blocked with no commands or rollback.
- [x] Future production governance timestamps are rejected for ledger approval, entry decision review, cannibalisation review, article reviewed date, and article review-due date.
- [x] Explicit synthetic fixtures may use future generation timestamps without becoming executable.
- [x] Unknown top-level and nested keys are rejected.
- [x] Copied result objects cannot export a trusted dependency.
- [x] Frozen dependency mutation is rejected.
- [x] Dependency unknown keys and lineage/digest drift are rejected.
- [x] Non-deterministic graph input, artifact tampering, malformed nested input, and orphan relationships fail closed.

## Boundaries and remaining blockers

- No migration implementation, GuidesIntegration file, legacy source, public page, production data, deployment, or index was modified.
- No commit, push, deploy, indexing request, or production command is part of Ticket 13.
- Production execution requires a separately scoped ticket with explicit human approval, production rollback design, protected executor ownership, and independent release validation.
