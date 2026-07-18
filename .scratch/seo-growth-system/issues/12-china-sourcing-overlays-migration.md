# 12 — Migrate China Sourcing Supporting and Industry Overlays

**What to build:** Bring supporting and industry-specific China Sourcing articles into the governed graph without creating isolated mini-taxonomies. Each overlay must inherit a clear parent journey, disclose its evidence limits, and connect readers to the core pillar and the most relevant governed specialist cluster.

**Blocked by:** 06, 11.

**Status:** contract-complete / production-blocked

## Implemented preflight contract

- Derives the exact China Sourcing overlay set from the canonical registry, the current migration ledger, and the governed Ticket 11 preview output.
- Excludes the editorial pillar and splits the twelve ledger-assigned members into three `category-sourcing` industry overlays and nine supporting overlays without overlap.
- Preserves content ID, slug, route, canonical route, primary cluster membership, content role, search intent, funnel stage, target market, commercial root, and editorial pillar identity.
- Derives specialist relationships only from governed required links or recorded cross-cluster cannibalisation reviews. It reports missing or review-only bindings instead of inventing routes.
- Validates evidence readiness, methodology, claim boundaries, authorship/review metadata, link requirements, non-cannibalisation reviews, ledger/report digests, release binding, and ordered rollback binding.
- Fails closed on unknown fields, digest tampering, draft or gaps-visible content, null readiness, fixture/public mixing, future actual dates, duplicate membership, canonical drift, destructive actions, malformed rollback data, and mixed or oversized scopes.
- Returns `planned` with an explicit diagnostic and no commands if no governed industry overlay entries exist.
- Permanently returns `executable=false` and `mutationCommands=[]`; fixture, dry-run, and actual inputs cannot authorise production execution.

## Current source-derived result

- Parent journey: `/services` → `/article/importing-from-china-australia-guide`.
- Overlay membership: 12 routes total, split into 9 supporting routes and 3 industry-overlay routes.
- Current production state: blocked because the ledger remains approval-required and `locked=false`.
- Specialist-link gaps remain diagnostic-only. No route, canonical, content, navigation, indexing, deployment, or ledger mutation is performed.

## Acceptance status

- [x] The contract validates governed metadata and evidence status for every ledger-assigned overlay.
- [x] Every overlay inherits the exact China Sourcing pillar and commercial-root journey.
- [x] Specialist links are accepted only when source-backed and are blocked when missing or not ledger-bound.
- [x] The scope cannot create an ungoverned sixth cluster or isolated navigation branch.
- [x] Evidence dates, reviewers, methodology, and limitations are fail-closed inputs.
- [x] Public routes and canonical targets must remain unchanged.
- [x] Governed graph reachability is represented as exact required-link preconditions.
- [ ] Human approval, ledger lock, evidence review, release binding, and rollback review remain outstanding.
- [ ] Production migration remains prohibited for this ticket.

## Verification — 2026-07-18

- Ticket 12 focused Jest: 18/18 tests passed.
- Migration ledger plus Ticket 07–12 compatibility regression: 63/63 tests passed across four suites.
- ESLint passed for `overlaysMigrationPreview.ts`, its focused test, and the migration barrel export.
- Isolated strict TypeScript compilation passed for the implementation, test, and migration barrel export using the repository aliases and Jest/Node types.
- Prettier check passed for all four Ticket 12 owned files.
- `git diff --check` passed for tracked workspace changes; explicit no-index whitespace checks passed for the four untracked Ticket 12 owned files.
- No implementation change was required after audit: the existing contract and 18 focused tests already cover the requested fail-closed, deterministic, provenance/date, URL/canonical, fixture/public, scope, rollback, and non-execution boundaries.
- No production migration, content mutation, route or canonical change, navigation update, indexing request, deployment, deletion, commit, or push was performed.

## Two-axis self-review — 2026-07-18

### Standards

- Exact-key validation is fail-closed at input, ledger, Ticket 11 artifact, snapshot, frontmatter, evidence, scope, and governance-binding boundaries.
- Ledger/report/release/rollback artifacts bind the deterministic ledger digest; entries, routes, diagnostics, links, reviews, and scope splits use code-point ordering.
- `fixture`, `dry-run`, and `actual` provenance remain separated; public fixture data and fixture-backed actual/dry-run data are rejected, and non-fixture observed dates after 2026-07-18 fail closed.
- Content IDs, slugs, routes, canonical routes, cluster IDs, commercial roots, pillar URLs, and Ticket 11 plans must match governed sources exactly.
- Output is deeply frozen, `executable` is always false, and `mutationCommands` is always empty.

### Spec

- The source-derived contract retains one China Sourcing parent journey and excludes the pillar from the overlay set.
- The twelve governed members remain deterministically split into nine supporting articles and three industry overlays, without duplicate primary membership or a sixth taxonomy.
- Every overlay preserves evidence/review boundaries and the China Sourcing commercial root and editorial pillar links.
- Specialist links are admitted only from ledger-required links or governed cannibalisation reviews; missing/unbound links remain blockers instead of invented routes.
- Production remains blocked pending human approval, ledger lock, evidence review, release binding, and rollback review.
