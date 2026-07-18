# 36 — Aggregate and Version the 50-Question GEO Benchmark

**What to build:** Combine the five approved cluster baselines into one versioned 50-question benchmark with a repeatable methodology and month-to-month comparison model. Question or platform changes must create a new benchmark version rather than silently rewriting history.

**Blocked by:** 31, 32, 33, 34, 35.

**Status:** in-progress — contract and trust-boundary hardening verified; production evidence remains blocked

- [ ] The benchmark contains exactly 50 questions, ten from each governed cluster.
- [ ] Methodology defines platforms, locale, timing, repetitions, scoring, citation capture, and known variability.
- [ ] Raw observations remain traceable from every aggregate measure.
- [ ] Month-to-month views separate brand mention, owned citation, accuracy, completeness, and competitor visibility.
- [ ] Question, platform, scoring, or methodology changes create a new explicit version.
- [ ] Reports avoid presenting noisy answer-engine observations as deterministic ranking results.
- [ ] A rerun can be compared with the baseline without overwriting prior evidence.

The unchecked acceptance items require the real Tickets 31–35 baselines, retained live evidence, and human approvals. Passing synthetic/unit tests does not complete those production gates.

## Implementation progress

The pure Ticket 36 benchmark contract now implements and verifies the following safeguards:

- One normalized version identity binds the benchmark, methodology, question set, observation schema, scoring, and redaction policy versions. Version or digest changes fail closed instead of silently rewriting identity.
- Catalog validation requires all five canonical clusters, exactly ten questions per cluster, globally unique question IDs and normalized prompts, canonical ID namespaces, stable code-point ordering, and exact output shapes.
- Neutrality policy rejects brand inducement, recommendation, provider preference, ranking, guarantee, and causal/outcome claims while allowing tested neutral implementation and variability wording.
- Strict JSON parsing rejects a BOM, duplicate decoded object keys, malformed or trailing input, and non-finite numeric values before content digests are trusted.
- The input manifest requires an exact canonical root, exact repository-relative snapshot paths, exact nested methodology shapes, content-addressed snapshot digests, and a matching complete version identity. The contract is filesystem-independent and does not claim to eliminate external filesystem TOCTOU outside this pure boundary.
- Inputs are cloned and deeply frozen so caller mutation cannot alter validated definitions, manifests, lineage, comparisons, or rendered results.
- Public aggregation requires a runtime-issued opaque evidence boundary. A structurally identical boundary object is rejected. Production run and approval callbacks are captured at boundary creation, must return the literal boolean `true`, and fail closed into domain errors if they throw.
- Production classification fields are necessary but not sufficient evidence. Every production run and every approved gate must also be accepted by the opaque verifier using the exact runtime evidence identity; copied run envelopes and copied approval records are rejected.
- Aggregate results are runtime-trusted opaque values. Rendering and comparison reject structural copies, even if a copy self-reports `publishable: true` or otherwise resembles a valid result.
- Synthetic dry-run aggregation accepts only explicit `fixture`/`non_public` runs, rejects production approval claims, always returns `baselineReady: false` and `publishable: false`, and renders its data class and visibility explicitly. A production-shaped 200-slot fixture therefore cannot become actual production evidence.
- Missing, recorded-but-unresolved, and resolved slots are counted separately. A recorded blocked/unavailable/invalid observation is `partial_live_observations`, not `blocked_no_live_observations`; null and not-assessable values never become zero.
- Period comparison rejects rollback, reverse order, overlap, and a reused `periodId` with changed timestamp boundaries. Only the same ID with the exact same boundaries is `same_period`.
- Report rendering and period comparison preserve raw lineage, hide metrics until complete trusted production coverage and all five approvals exist, and describe answer-engine output as noisy observations rather than ranking, causality, or guaranteed outcomes.

Synthetic fixtures are used only by tests. The complete production-shaped fixture is synthetic and test-local: two platforms × 50 questions × two repetitions = 200 slots, with retained snapshot-shaped evidence. The test-only identity verifier exercises the trust-boundary contract but is not a production provenance adapter. No live observation, baseline, approval record, or synthetic production artifact was added outside tests.

## Verification

- TDD red phase reproduced four requested failures before the implementation change: structural production self-report was accepted, recorded unresolved evidence was classified as no live evidence, a reused period ID with changed boundaries was classified as the same period, and forged structural results reached render/compare logic.
- Ticket-focused Jest suite: 42 tests passed in `lib/seo/geoBenchmark/geoBenchmark.test.ts`.
- Related GEO suites: 69 tests passed across six suites (`lib/seo/geo` and `lib/seo/geoBenchmark`).
- Scoped strict TypeScript compilation passed with explicit `--strict`, `--noEmit`, `--moduleResolution Bundler`, `--module ESNext`, and `--target ES2022` flags for the six Ticket 36 implementation/test files.
- Scoped ESLint passed with `npx eslint lib/seo/geoBenchmark --ext .ts`.
- Prettier check passed for the Ticket 36 TypeScript files and this issue record.
- Untracked-file diff/whitespace checks pass when every Ticket 36 file is checked against an empty tree; no file was staged.
- Static scans found no live `fetch`, filesystem access, `Date.now`, `new Date`, environment lookup, or randomness in the Ticket 36 module. Explicit RFC3339 inputs are parsed only for supplied period ordering.

## Remaining blockers

This ticket is not complete and must not be marked Done until all external evidence gates are satisfied:

- [ ] Tickets 31–35 provide the real approved ten-question cluster baselines and matching human approvals.
- [ ] A trusted production composition root supplies a real provenance/approval verifier; the unit-test identity verifier is not sufficient production evidence.
- [ ] The approved five-cluster catalog is captured into a matching content-addressed input manifest.
- [ ] Real configured-platform observations cover every question, platform, and repetition slot with retained raw snapshot evidence.
- [ ] Observation quality review, retention/privacy requirements, and publication approval are complete.
- [ ] A real baseline and a later compatible rerun exist for month-to-month comparison without overwriting prior evidence.
