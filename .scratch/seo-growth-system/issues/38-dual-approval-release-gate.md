# Ticket38 Request-Changes Hardening Addendum: Dual-Approval Release Gate

**Status:** contract-hardened; production command blocked by upstream trust-chain integration

This addendum records the fail-closed changes applied to the Ticket38 release workflow after the dual-axis review. The module remains an in-process, observation-only contract and does not deploy, notify search providers, or call production APIs.

## Completed hardening

- [x] Approval attestations and release workflows use a private `WeakSet` trust root. Copied objects, prototype inheritance, self-reported reviewer roles, and caller-forged trust fields are rejected.
- [x] Every approval binds the canonical principal and approval kind to `workflowInstanceId`, `releaseId`, `artifactDigest`, `reportDigest`, `preparedAt`, the opaque nonce, `rollbackPlanDigest`, and approval timestamp through a canonical binding digest.
- [x] Approval evidence is checked against the current workflow identity, so evidence cannot be replayed across preparations, workflow instances, releases, artifacts, reports, nonces, or rollback plans.
- [x] Content and production approvals require distinct canonical principals. A caller-supplied role or `verified` boolean is not a trust root.
- [x] Search notification requires current `live_verified` evidence, and notification `recordedAt` must be strictly later than live `verifiedAt`. The `deployed` state is not treated as live verification.
- [x] A typed rollback plan includes state, digest, readiness checks, verification command/evidence requirements, and target artifact binding before production approval.
- [x] Completing rollback clears prior live/search evidence, advances the rollback generation, and requires a fresh independent live verification before a later search notification.
- [x] Every root and nested object uses recursive exact-key validation.
- [x] Release URLs reject credentials, query strings, and fragments. Only explicitly permitted protocols and canonical destinations are accepted.
- [x] All timestamps must be valid RFC3339 UTC timestamps ending in `Z`. Invalid calendar dates, local timestamps, and future `actual` observations are rejected.
- [x] Explicit `actual`, `synthetic_fixture`, and `dry_run` provenance is enforced; actual workflows reject fixture provenance.
- [x] Regression tests cover forged principals, copied/prototype attestations, replay, pre-live notification, rollback re-verification, unsafe URLs, unknown keys, invalid/local/future timestamps, and provenance separation.

## Migration impact

Approval calls now require a trusted opaque attestation plus the matching current release identity. Production approval also requires a ready rollback plan already bound into the preparation. Search notification has moved from the `deployed` boundary to the stricter `live_verified` boundary. Existing callers that pass self-reported reviewers, local timestamps, undeclared fields, or URLs with credentials/query/fragment must migrate before the workflow will advance.

## Integration boundary

The current trust issuer is intentionally in-process and non-copyable for deterministic contract tests. A production integration must place attestation issuance behind authenticated release control or replace it with verifiable signed attestations; callers must not expose the issuer as an untrusted public endpoint.

## Verification scope

Focused Jest hardening tests, scoped ESLint, Prettier, and isolated strict TypeScript checks cover the Ticket38 write set. No deployment, notification, commit, push, or external production API is executed.

## 2026-07-18 integration review

- The release workflow still rejects caller-shaped workflows/attestations, keeps actual, synthetic-fixture, and dry-run provenance separate, and requires two distinct human approvals before deployment plus live verification.
- Ticket39/40 now reject caller-reported or copied release bindings at the parser boundary rather than type-laundering them into a trusted type.
- The contract suite is green, but the production release command remains blocked: no trusted adapters for the required Ticket13/24/25/27B/30/36/37 chain are available in this ticket's permitted write set. This review therefore does not claim an executable production release.
