# 29 — Turn Expertise Capture into Safe Evidence Records

**What to build:** Run a time-boxed expertise interview that captures recurring buyer questions, field observations, decision boundaries, and safe examples, then convert the approved material into governed evidence usable by the first opportunity brief. Confidential operational notes must remain outside public content.

**Blocked by:** 04, 28.

**Status:** ready-for-agent

- [ ] The interview can be completed in 45 minutes or less with a named contributor and reviewer.
- [ ] It captures recurring buyer questions, practical boundaries, safe examples, and claims requiring external support.
- [ ] Supplier, person, address, identifier, pricing, banking, and other confidential details are classified before storage or use.
- [ ] Approved contributions become traceable evidence records with disclosure level, review date, and permitted claim boundary.
- [ ] The first real brief references at least one approved contribution where genuinely relevant.
- [ ] Factual review and disclosure review are recorded separately.
- [ ] Rejected or restricted material cannot appear in generated public drafts.

## Implementation progress — 2026-07-18

The automatable safety scaffold is now present within the Ticket 29 write boundary:

- Strict interview-session and contribution schemas cover opaque references, consent, privacy classification, redaction, permission, attribution, quantitative provenance, limitations, revocation, status, and two independent reviews.
- Deterministic public-eligibility and public-projection gates fail closed for synthetic, rejected, restricted, revoked, expired, unsafe, or incompletely reviewed material.
- Synthetic fixtures are explicitly non-public and cannot represent an actual interview, contributor, quotation, reviewer, approval, or verified metric.
- The blank human interview and evidence-review templates document the 45-minute limit, private-storage boundary, consent choices, redaction, quantitative completeness, separate factual and disclosure/privacy review, expiry, and revocation.
- Focused tests exercise the automated contract. They do not constitute a real interview, consent grant, evidence approval, article approval, release approval, deployment, or indexing action.

The ticket remains `ready-for-agent`. The following human and cross-ticket work is still blocked or outstanding:

- [ ] Complete a real 45-minute human interview with a named contributor and interviewer.
- [ ] Capture explicit consent boundaries, expiry, revocation route, privacy classification, and private raw-note reference.
- [ ] Convert only genuinely supportable material into bounded contribution candidates.
- [ ] Complete independent factual and disclosure/privacy reviews with different reviewers.
- [ ] Record valid permission scopes and resolve any restricted, rejected, revoked, or expired material.
- [ ] Link at least one genuinely approved contribution to the first real opportunity brief after Ticket 28 supplies the destination and the dependency gates are satisfied.
