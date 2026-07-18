# Expertise Evidence Review

> Blank governance template only. It does not prove an interview occurred and does not create consent, permission, approval, publication authority, or a Ticket 28 dependency. Use real named reviewers in the private system of record. Repository records use opaque reviewer references only.

## 1. Candidate identity and lineage

- Contribution ID (`contrib.<12-lowercase-hex>`):
- Interview session ID (`intv.<12-lowercase-hex>`):
- Record class: `synthetic` (fixed for the current preview-only linkage)
- Public use: `governed` | `prohibited`
- Explicit shared `asOf` (`YYYY-MM-DD`):
- Bounded claim:
- Permitted claim boundary:
- Claim kind:
- Disclosure level: `public` | `internal` | `restricted`
- Supported article IDs:
- Review due date:

Actual governance dates must be on or before the explicit shared `asOf`. Future dates are allowed only in a fixture explicitly marked `synthetic` and `prohibited`.

## 2. Permission and privacy gate

- Permission status: `permitted` | `restricted` | `revoked` | `unresolved`
- Permission scopes:
- Granted on:
- Expires on or `none`:
- Revoked on or `none`:
- Revocation reason or `none`:
- Privacy categories remaining:
- Attribution mode:
- Consent checks required for this claim:

A candidate with restricted, unresolved, revoked, or expired permission is not reviewable for public use. A public contribution must have disclosure level `public` and no confidential category.

## 3. Evidence and method completeness

- Source types used:
- Current external support required:
- Current external support supplied:
- Method summary:
- Denominator, if quantitative:
- Unit, if quantitative:
- Date range, if quantitative:
- Inclusion criteria, if quantitative:
- Exclusion criteria, if quantitative:
- Deduplication method, if quantitative:
- Missing-data statement, if quantitative:
- Limitations:

A claim identified by the interview as requiring external support remains blocked until that support is independently reviewed. The interview alone cannot establish external facts or current operating capability.

## 4. Factual review — Reviewer A

- Review ID (`review.<12-lowercase-hex>`):
- Reviewer reference (`reviewer.<12-lowercase-hex>`):
- Reviewed on (`YYYY-MM-DD`):
- Decision: `approved` | `changes-required` | `rejected`
- Claim is supported within the contributor's authority scope: `yes` | `no`
- Required external support is present and current: `yes` | `no` | `not-applicable`
- Method and quantitative fields are complete: `yes` | `no` | `not-applicable`
- Permitted claim boundary is accurate: `yes` | `no`
- Notes:

## 5. Disclosure review — Reviewer B

Reviewer B must be a different real person and use a different reviewer reference and review ID from Reviewer A.

- Review ID (`review.<12-lowercase-hex>`):
- Reviewer reference (`reviewer.<12-lowercase-hex>`):
- Reviewed on (`YYYY-MM-DD`):
- Decision: `approved` | `changes-required` | `rejected`
- Internal-use consent valid: `yes` | `no`
- Public-quotation consent valid where required: `yes` | `no` | `not-applicable`
- Named-attribution consent valid where required: `yes` | `no` | `not-applicable`
- Permission valid and in scope: `yes` | `no`
- Disclosure level is public with no confidential category: `yes` | `no`
- Public wording contains no raw-note reference, private path, direct contact detail, or internal person reference: `yes` | `no`
- Notes:

The same reviewer, duplicated reviewer reference, or caller-supplied approval assertion must fail closed.

## 6. Ticket 28 typed dependency linkage

Current Ticket 29 code consumes only the strict Ticket 28 provisional brief contract and derives a deterministic preview digest. That preview digest detects copy or mutation drift but is **not** a real brief approval and cannot unlock a public draft.

- Link schema version: `1`
- Ticket: `28`
- Ticket 28 brief ID:
- Ticket 28 brief status: `blocked` | `needs-research`
- Link provenance: `ticket28-provisional`
- Record class: `actual` | `synthetic`
- Shared `asOf`:
- Typed brief digest (`sha256:<64-lowercase-hex>`):
- Digest recomputation matches: `yes` | `no`
- Brief ID matches: `yes` | `no`
- Brief `asOf` matches: `yes` | `no`
- Trusted real Ticket 28 approval export present: `no`

Fail closed when the link or brief is missing, an unknown key is present, the ID or `asOf` differs, the digest drifts, or Ticket 28 has not supplied a trusted real approval export. The current builder does not accept a caller-supplied `recordClass`; it fixes the preview linkage to `synthetic`. A self-attested boolean, reviewer name, copied digest, or locally constructed object is not a trusted approval binding.

## 7. Public-draft eligibility

- Contribution status: `approved` | `restricted` | `rejected` | `expired`
- Consent valid and not revoked: `yes` | `no`
- Permission valid and not revoked: `yes` | `no`
- Factual review approved: `yes` | `no`
- Disclosure review approved: `yes` | `no`
- Review due date valid: `yes` | `no`
- Ticket 28 typed dependency valid: `yes` | `no`
- Public draft allowed: `no`
- Machine-readable reason codes:

At scaffold stage, public draft remains `no`. Restricted, rejected, revoked, expired, synthetic, unsafe, independently unapproved, or Ticket-28-unlinked material produces no public projection or public draft.

## 8. Revocation and re-review

- Revoked on or `none`:
- Revocation reason or `none`:
- Affected article IDs:
- Removal or replacement owner:
- Re-review required on:

Revocation is effective from its recorded date. Re-review creates a new decision and does not overwrite audit history.

## 9. Workflow boundary

This review can complete the Ticket 29 contract record only. It does not approve an article, real opportunity brief, release, deployment, publication, search submission, or indexing claim for Winning Adventure Global.
