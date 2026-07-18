# 04 — Pilot the Evidence Gate with the SAMR Article

**What to build:** Introduce a safe, reviewable evidence record and apply it to the SAMR company-check article as the first end-to-end pilot. Public claims must trace to permitted evidence, restricted evidence must never leak into generated pages, and unsupported or expired claims must block governed publication without removing the currently visible article.

**Blocked by:** 02, 03.

**Status:** completed on 2026-07-18

- [x] Evidence records distinguish public, restricted, expired, and unsupported material.
- [x] Public claims in the SAMR article can be traced to source, review date, reviewer, and claim boundary.
- [x] Restricted supplier, person, address, identifier, and banking details cannot enter public output or analytics payloads.
- [x] Unsupported, expired, or boundary-violating claims fail the governed validation path with actionable messages.
- [x] The currently published SAMR article remains available while the pilot is being introduced.
- [x] A reviewer can approve, reject, or request correction without editing generated artifacts directly.

## Implementation

- Added a strict, immutable evidence registry schema with canonical parsing, opaque IDs, real calendar-date validation, privacy and permission controls, claim boundaries, review decisions, and deterministic status evaluation.
- Added the SAMR pilot registry, claim manifest, and digest-bound review decision. The gate parses the reviewed manifest source internally and rejects any caller-supplied manifest object that drifts from that source.
- Added a deterministic read-only evidence gate and `seo:evidence:check` CLI. Reports expose only public trace fields, while analytics contain opaque evidence IDs, statuses, and counts.
- Added governed metadata to the existing SAMR article without changing its route or body.
- Added unit, CLI, privacy, expiry, boundary, reviewer-decision, digest-integrity, deterministic-output, and live-corpus integration coverage.

## Verification

- Ticket-focused Jest suites: 4 suites, 60 tests passed.
- All `lib/**/*.test.ts` suites except the pre-existing incompatible `lib/google-trends.test.ts` fixture: 26 suites, 266 tests passed.
- Current-date CLI output is byte-identical across repeated runs; the first day after the review window fails with `EVIDENCE_EXPIRED`.
- The published article body remains byte-identical with SHA-256 `506150258ea5568f6a53de9a2146202738f1c2543b692158bedca8dab386c977`.
- Independent privacy/spec and code/determinism reviews found no remaining P0/P1 blockers.
