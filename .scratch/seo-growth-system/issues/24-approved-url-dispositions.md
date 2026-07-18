# 24 — Execute the Approved URL Dispositions

**What to build:** Implement only the merge, redirect, retirement, or canonical changes approved in the locked ledger after all ten priority upgrades are reviewed. Preserve useful content and link value, keep redirect chains to one hop, and leave a reversible decision record. If the approved scope exceeds three source URLs or contains multiple unrelated destination bundles, split the work into smaller disposition tickets before executing this integration ticket.

**Blocked by:** 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23.

**Status:** contract-complete / production-blocked

- [ ] Every changed URL has an approved rationale, owner, source, destination, and rollback note.
- [ ] Scope is split first when it exceeds three source URLs or one coherent destination bundle.
- [ ] Redirects are permanent, resolve in one hop, and do not create loops or soft-404 destinations.
- [ ] Internal links, canonicals, sitemap entries, breadcrumbs, and structured data use the final destination.
- [ ] Valuable unique content and external-link equity are preserved at the approved destination.
- [ ] A pre-release report proves all unchanged URLs remain unaffected.
- [ ] Production deployment remains blocked until the dual-approval release workflow exists.

## Progress — 2026-07-18

- Added a pure, deterministic, fail-closed pre-execution validator and report builder under `lib/seo/urlDispositions/`.
- Added strict evidence, approval, unaffected-URL, rollback, equity-preservation, and dual-approval release-binding contracts.
- The contract exposes no production execution API and makes no redirect, route, content, sitemap, ledger, graph, or release mutations.

## Blockers — unchanged

- Tickets 13–23 are not complete.
- The migration ledger remains `approval-required` and `locked=false`.
- No real human URL disposition approvals are bound to a reviewed artifact digest.
- No production dual-approval release record is bound to that same artifact digest.
- Ticket 24 therefore remains blocked; no acceptance item above is marked complete.

## Contract repair evidence — 2026-07-18

- Ticket 24 reports now carry a deterministic `reportDigest` over the complete report subject, excluding only the root generated digest field. Content approval, production approval, release contract, release gate, and final report must all bind that same verified digest.
- The release gate exposes `verifiedReportDigest`; forged declarations and post-approval report drift fail closed.
- Evidence provenance is an exact matrix: `origin=production` requires `public=true`, while `origin=fixture` requires `public=false`.
- The explicit `asOf` timestamp bounds every nested evidence, approval, and preparation timestamp without consulting an ambient clock.
- The exported report schema recursively rejects unknown keys and requires version `1`, the artifact digest, the report digest, release-gate binding, blockers, and permanently disabled production execution metadata.
- Legacy Ticket 24 report fixtures without `reportDigest` are rejected by downstream contracts; no compatibility path fabricates a digest for an unverified historical report.
