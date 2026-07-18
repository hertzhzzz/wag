# 25 — Retire the Legacy Cluster YAML Sources

**What to build:** Remove the legacy cluster data only after proving the governed registry and article graph have equivalent or intentionally approved behavior across article membership, navigation, recommendations, sitemaps, and diagnostics. Runtime code must no longer depend on the legacy sources.

**Blocked by:** 24.

**Status:** contract-complete / production-blocked

- [ ] A parity report compares legacy and governed cluster membership for every article.
- [ ] Navigation, recommendations, sitemap, and diagnostics differences are reviewed and explicitly accepted.
- [ ] No runtime, generation, validation, or test path reads the legacy cluster sources.
- [ ] Intentional differences link back to an approved migration or URL disposition decision.
- [ ] Removing the legacy sources does not change unrelated public routes or commercial pages.
- [ ] A reviewer signs off on parity before deletion is considered complete.

## Progress — 2026-07-18

- Added a pure, deterministic, fail-closed source-retirement/parity preflight contract and report builder under `lib/seo/sourceRetirement/`; it does not delete, rename, write, fetch, redirect, deploy, or index any source.
- Added focused contract coverage for article identity/content, route/canonical/sitemap/index parity, navigation/recommendations/diagnostics, parser/read parity, graph parity, Ticket 24 URL disposition and release-gate binding, migration-ledger lock/approval state, rollback/restore evidence, artifact/version/digest binding, evidence provenance/date rules, deterministic canonical digests, deep freezing, input immutability, null-not-zero metrics, and disabled execution metadata.
- TDD evidence: the initial focused suite produced a real missing-module RED; regression tests then exposed parser-version drift and same-person Ticket 24 approval gaps before the minimal GREEN implementation was completed.
- The fixture-only pass path is explicitly `origin=fixture` and `public=false`; it is not production approval and does not close this ticket.

## Blockers — 2026-07-18

- The current real state remains blocked. Ticket 24 is still a fail-closed preflight dependency without executable production URL approval/probe evidence and production dual approval bound to this artifact.
- The migration ledger real state remains `approval-required` and `locked=false`; no locked migration ledger is available for retirement.
- Ticket 27A graph parity and corresponding production evidence/human sign-offs are not yet available and bound to the same artifact digest.
- No legacy source was deleted or renamed. Acceptance checkboxes and ticket status remain unchanged; this contract-only implementation must not be treated as retirement completion.

## Contract repair evidence — 2026-07-18

- Ticket 25 now uses recursive exact-key validation, including approved decisions, nested parity evidence, inventories, approvals, rollback, and the full Ticket 24 report reference.
- Legacy and governed inventories have independently computed subject digests. Parity validates those subject digests, the overall retirement artifact binds the complete input, and rollback binds the legacy inventory digest.
- Artifact canonicalisation omits generated binding digests only at explicit Ticket 25 paths. Nested Ticket 24 artifact and report digests remain part of the Ticket 25 artifact subject.
- Ticket 24 schema version, status, blockers, artifact/release binding, report digest, and disabled execution metadata are verified fail-closed. Digest tampering and legacy reports without `reportDigest` are rejected.
- The preflight report now carries the explicit Ticket 25 `asOf`, and that value is part of its deterministic report identity. Guides integration rejects a Ticket 25 report whose `asOf` differs from the shared chain date.
- The preflight report has its own deterministic digest that includes the reported Ticket 25 artifact digest and excludes only the root generated report digest.
