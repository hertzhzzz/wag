# 29 — Turn Expertise Capture into Safe Evidence Records

**What to build:** Run a time-boxed expertise interview that captures recurring buyer questions, field observations, decision boundaries, safe examples, and claims requiring external support, then convert only independently approved material into governed evidence usable by a real opportunity brief. Confidential notes remain outside public content.

**Blocked by:** 04, 28.

**Status:** contract/scaffold complete; real interview, trusted Ticket 28 linkage, and production use blocked — 2026-07-18

## Acceptance status

- [x] Strict interview contract enforces a maximum of 45 minutes and requires named contributor and interviewer fields for future real records.
- [x] Structured fields cover buyer questions, practical boundaries, safe examples, and claims requiring external support.
- [x] Supplier, person, address, identifier, pricing, banking, and other confidential categories are classified before storage or use.
- [x] Contribution records carry a bounded claim, explicit permitted claim boundary, disclosure level, factual review date, disclosure review date, review due date, permission, and revocation state.
- [x] Factual and disclosure reviews are separate strict records and require different review IDs and reviewer references.
- [x] Restricted, rejected, revoked, expired, synthetic, unsafe, or independently unapproved material cannot produce a public projection or public-draft decision.
- [x] Ticket 28 linkage consumes a typed deterministic digest, rejects unknown keys, and blocks missing, copied, mutated, ID-drifted, or `asOf`-drifted inputs.
- [ ] A real 45-minute interview has been completed with a named contributor and named interviewer.
- [ ] Independent factual and disclosure reviews have been completed by two different real reviewers.
- [ ] Ticket 28 has supplied a trusted real approved-brief digest export.
- [ ] A genuinely approved contribution is linked to a genuinely approved real brief.

## Exact stage state — 2026-07-18

1. `contract-schema`: complete.
2. `synthetic-fixtures`: complete; fixtures are explicitly non-public and are not evidence or approval.
3. `interview-template`: complete.
4. `sensitive-classification`: contract complete; real human classification pending.
5. `candidate-contribution`: contract complete; no real candidate asserted.
6. `factual-review`: contract complete; real Reviewer A decision pending.
7. `disclosure-review`: contract complete; different real Reviewer B decision pending.
8. `ticket28-preview-linkage`: complete for deterministic drift detection only.
9. `ticket28-real-linkage`: blocked; no trusted real approved-brief export exists in the current dependency.
10. `public-draft-eligibility`: blocked and fixed fail-closed at scaffold stage.
11. `publication/deployment/indexing`: outside scope and not performed.

## Ticket 28 interface assumptions

- The current dependency is `ProvisionalOpportunityBrief` from `lib/seo/opportunity/types.ts`.
- Its status is limited to `blocked | needs-research`, provenance is `candidate-inputs-only`, human reviewer verification is `false`, and drafting/publishing are `false`.
- Ticket 29 parses that strict Ticket 28 contract at runtime and derives `sha256:<64 lowercase hex>` over canonical JSON using the same explicit `asOf`.
- The derived linkage has `ticket: 28`, schema `version: 1`, `provenance: ticket28-provisional`, brief ID, brief status, digest, shared `asOf`, and a fixed `recordClass: synthetic`; callers cannot self-assert an actual linkage.
- This digest is a preview integrity dependency only. It cannot prove a real brief, human review, or approval and therefore always keeps `publicDraftAllowed: false`.
- A future Ticket 28 production ticket must provide a trusted strict export that binds the real brief ID, immutable digest, shared `asOf`, human reviewer identity in the private system of record, and approval lineage. Ticket 29 must be deliberately updated to consume that export; caller-supplied booleans, reviewer names, or self-computed digests are insufficient.

## Human and production gates

- [ ] Conduct the real interview and record real consent in the approved private system.
- [ ] Classify every sensitive fragment before storage and create only opaque repository references.
- [ ] Extract bounded contribution candidates without copying restricted details.
- [ ] Obtain real factual review from Reviewer A.
- [ ] Obtain real disclosure/privacy review from a different Reviewer B.
- [ ] Resolve permission scope, expiry, revocation, attribution, and external-support requirements.
- [ ] Obtain the trusted real Ticket 28 approved-brief export.
- [ ] Re-run the strict linkage and public eligibility gates after those human dependencies exist.

No real interview, consent, person, approval, opportunity brief, public draft, publication, deployment, or indexing action is claimed by this ticket.
