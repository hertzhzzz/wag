# 03 — Establish the Five-Cluster Registry

**What to build:** Create one governed registry for Supplier Verification, Factory Audit, Quality Inspection, Factory Visits, and China Sourcing. It must define stable cluster identities, intended pillar roots, market and funnel scope, and validation rules that every later article and navigation surface can consume.

**Blocked by:** 01.

**Status:** completed

- [x] Exactly five canonical cluster identities exist with stable machine-readable keys and human-readable names.
- [x] Each cluster declares one intended pillar root, with unresolved roots allowed only when explicitly marked for migration.
- [x] Duplicate keys, duplicate roots, invalid roles, and unknown cluster references fail validation.
- [x] Market, funnel, and commercial-service relationships are explicit rather than inferred from article categories.
- [x] One read-only diagnostic consumes the registry and reports current article membership without changing content.
- [x] Registry output is deterministic and suitable for generated indexes and navigation.

## Completion evidence — 2026-07-18

- Five canonical definitions and parsed registry output are recursively read-only at TypeScript and runtime boundaries.
- Focused Ticket 03 verification passed: 5 suites, 78 tests. Repository `lib` verification passed: 23 suites, 213 tests, excluding the known unrelated `google-trends` type fixture.
- The diagnostic produced byte-identical output across two runs: 5 clusters, 23 readable articles, 0 assigned, and 23 unassigned articles awaiting migration.
- The aggregate `content/blog` SHA-256 remained `7a33b1663807faf5e735e5be82b41a7b21d7332a59e9496122118828d442d2a9` before and after diagnostics.
- ESLint, scoped TypeScript, formatting, diff checks, and the 61-page production build passed. Full TypeScript remains blocked only by the pre-existing `lib/google-trends.test.ts` fixture mismatch.
