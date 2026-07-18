# Ranked Opportunity Article Upgrade Contract

Use this template for one Ticket 14-23 article-upgrade evaluation. It is a contract and review record, not a draft and not a release instruction.

## Safety rules

- Use the canonical Ticket 14-23 registry. Do not create a new ticket ID, rank, URL, or cluster mapping outside the registry.
- `asOf`, capture, review, and approval dates must not be later than the evaluation date in live records. A later date is permitted only inside an explicitly named `synthetic-fixture` test environment.
- Use `null` when an observation does not exist. Do not encode unavailable ranking, Search Console, analytics, or conversion data as `0`.
- A synthetic fixture can exercise the evaluator but is never live ranking evidence, content approval, release approval, attribution approval, publication proof, or completion proof.
- Attribution is declarative metadata only. Keep `trackingParameters: null`. Do not invent UTM values or send free-text user data.
- Content approval and production release approval are separate records. Content approval does not authorize publication.
- Runtime context is parsed, not trusted by type assertion. `today` must be a real calendar date or RFC 3339 timestamp, and `environment` must be `test` or `production`.
- Data modes are mutually governed: omitted mode maps `live` to `actual` and `synthetic-fixture` to `synthetic_fixture`; contradictory declarations are blocked; `dry_run` is preview-only.
- Inputs must be finite JSON-compatible data. Cycles, sparse arrays, accessor or symbol properties, non-plain objects, and non-finite numbers are rejected before evaluation.
- The evaluator may produce a preview, evaluation, or report. It must not write production MDX, publish, deploy, submit an indexing request, execute rollback, or claim a ranking or causal result.

## Evaluation context

```yaml
today: "2026-07-18" # A real calendar date or an RFC 3339 timestamp
environment: production # test or production
dataMode: actual # actual, synthetic_fixture, or dry_run
```

`dataMode` is evaluator context, not part of the manifest. It cannot override provenance. `dry_run` never authorizes execution, and `synthetic_fixture` remains test-only.

## Required record

```yaml
version: 1
asOf: "2026-07-18"
provenance: live # or synthetic-fixture, only in a test environment
tickets:
  - ticketId: "14" # Ticket 14-23
    rank: 1 # Registry rank; immutable for the ticket
    cluster: null # Canonical cluster ID, never an ad hoc label
    target: null
    owner: null
    asOf: "2026-07-18"
    provenance: live
    source:
      baseline: null
      current: null
    opportunityLock:
      status: unlocked
      opportunityId: null
      rank: null
      cluster: null
      targetUrl: null
      opportunityDigest: null
      briefDigest: null
      rankingEvidenceDigest: null
      lockedAt: null
      provenance: live
    dependencies:
      strictCutover:
        status: pending
        evidenceDigest: null
        checkedAt: null
        provenance: live
      migrationLedger:
        status: pending
        currentDigest: null
        approvedDigest: null
        checkedAt: null
        provenance: live
      evidenceGate:
        status: pending
        packageDigest: null
        reportDigest: null
        checkedAt: null
        provenance: live
    requirements:
      answerPassage:
        status: pending
        passageRef: null
        evidenceDigest: null
        verifiedAt: null
        explanation: null
        provenance: live
      faq:
        status: pending
        visibleStatus: unreviewed
        eligibility: unreviewed
        schemaPlanned: false
        evidenceDigest: null
        verifiedAt: null
        explanation: null
        provenance: live
      internalLinks:
        status: pending
        graphDigest: null
        targets:
          pillar: null
          sibling: null
          service: null
          nextStep: null
        evidenceDigest: null
        verifiedAt: null
        explanation: null
        provenance: live
      expertEvidence:
        status: pending
        contributionId: null
        contributionDigest: null
        sourceKind: null
        evidenceDigest: null
        verifiedAt: null
        explanation: null
        provenance: live
      mobileReview:
        status: pending
        desktopPassed: null
        mobilePassed: null
        evidenceDigest: null
        verifiedAt: null
        explanation: null
        provenance: live
      metadataSchema:
        status: pending
        metadataEligible: null
        articleSchemaEligible: null
        faqSchemaEligible: null
        evidenceDigest: null
        verifiedAt: null
        explanation: null
        provenance: live
    attribution:
      mode: declarative-metadata-only
      contractRef: null
      allowlistRef: null
      campaign: null
      cluster: null
      contentId: null
      trackingParameters: null
      approval:
        status: pending
        approvalId: null
        actorId: null
        approvedAt: null
        subjectDigest: null
        provenance: live
    approvals:
      content:
        status: pending
        approvalId: null
        actorId: null
        approvedAt: null
        subjectDigest: null
        provenance: live
      release:
        status: pending
        approvalId: null
        actorId: null
        approvedAt: null
        subjectDigest: null
        provenance: live
    claims: []
    observations:
      - key: search-position
        status: unavailable
        value: null
        sourceDigest: null
        observedAt: null
      - key: search-clicks
        status: unavailable
        value: null
        sourceDigest: null
        observedAt: null
      - key: search-impressions
        status: unavailable
        value: null
        sourceDigest: null
        observedAt: null
      - key: conversions
        status: unavailable
        value: null
        sourceDigest: null
        observedAt: null
```

## Gate interpretation

The manifest fields below are self-reported schema inputs. Passing their structural checks establishes only `schemaValid: true`; it does not establish `evidenceVerified`, `authorizedForExecution`, `productionExecution`, or `executable`.

The following gates are necessary but not sufficient for execution:

1. Ticket 13 strict cutover has a passed attestation.
2. Ticket 06 migration-ledger `currentDigest` equals the human-approved `approvedDigest`.
3. The Evidence Gate has passed and has both a package digest and report digest.
4. The opportunity is locked to the ticket rank, cluster, and target, with opportunity, brief, and ranking-evidence digests.
5. The answer passage, FAQ decision, graph target set, expert or first-party evidence, mobile review, and metadata/schema eligibility are each passed with evidence and an explanation.
6. Ticket 30 attribution/privacy approval is approved and references an allowlist and contract. No tracking parameter may be emitted by this contract.
7. Content approval is approved against the canonical candidate digest.
8. Release approval is a separate approved record against the same candidate digest, with a distinct approval ID and actor, and with a later approval date.
9. A trusted external resolver verifies evidence, the issuer, the signature, the manifest digest, and ticket authorization, then supplies a separately governed execution attestation.

No trusted resolver, issuer registry, or signature verifier exists in this module. Therefore self-reported `passed` or `approved` values produce `evidenceVerified: false`, `authorizedForExecution: false`, `productionExecution: false`, `executable: false`, and `trusted_execution_attestation_missing`. This is an intentional fail-closed contract boundary, not an implied verification.

A report with `fixture-ready` status is useful for contract tests only. A report with `blocked` status must remain non-executable. Disposition is explicit: unchanged source digests are `no-op`; unresolved or untrusted work is `hold`; `upgrade` requires a future trusted execution boundary; `rollback` is never inferred or executed by this evaluator. `complete` stays `false` until an external, separately governed execution and verification process records what happened; this contract never marks a ticket complete.

## Claim and observation policy

Ranking and causal statements require an evidence digest. If no real observation exists, use an unavailable observation with all of `value`, `sourceDigest`, and `observedAt` set to `null`. A real observed zero is allowed only when its source digest and observation date are present.

## Review checklist

- [ ] Registry contains exactly Tickets 14-23 once each.
- [ ] No duplicate article ID or URL exists.
- [ ] Cluster, target, opportunity lock, and attribution metadata agree.
- [ ] No date is future-dated outside a test fixture.
- [ ] All reason codes are deterministic and sorted.
- [ ] Preview/report output contains no tracking parameters.
- [ ] Schema validity, evidence verification, authorization, and production execution are reported separately.
- [ ] Self-reported approvals cannot make a live record executable without a trusted execution attestation.
- [ ] `no-op`, `hold`, and `rollback` semantics are explicit and rollback is never inferred.
- [ ] No production content or release artifact was written.

## Canonical input, digest, and rollback boundary

- Input objects use exact keys only; unknown keys, duplicate registry slots, sparse arrays, cycles, non-plain objects, accessors, symbols, and non-finite numbers are rejected.
- Canonical serialization sorts object keys deterministically, preserves array order, and computes the candidate/manifest SHA-256 digest from the canonical JSON representation. Reason codes and report tickets use stable registry order.
- `rollbackBaselineDigest` is a read-only reference to the canonical `source.baseline.digest`, or `null` when no baseline exists. It is an audit pointer, not an instruction and not permission to mutate content.
- The evaluator never executes rollback, upgrade, publication, deployment, or indexing. `productionExecution` and `executable` remain `false` until a separate trusted execution system verifies approvals and performs the action.
- Content approval and release approval remain separate records with distinct actors/IDs and release-after-content ordering. A content approval cannot authorize release.
- Future dates are permitted only in explicitly named `synthetic-fixture` test data. The current real evaluation date is `2026-07-18`; future dates must not be introduced into live records.
