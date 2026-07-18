# 06 — Lock the 23-Article Migration Ledger

**What to build:** Review every current article and approve a complete migration ledger that assigns cluster, role, intent, funnel stage, market relevance, score inputs, and a justified action. The ledger becomes the controlled source for migration and must expose cannibalisation risks before any URL or content consolidation occurs.

**Blocked by:** Human approval.

**Status:** implementation complete; `approval-required` (not done)

## Implementation state

- [x] All 23 frozen baseline identities appear exactly once and retain their existing `/article/<slug>` routes.
- [x] Every article has one cluster, role, search intent, funnel stage, market assignment, and auditable keep/refresh rationale.
- [x] The ledger exposes the six-factor 100-point opportunity model plus GSC, GA4, qualified-lead, migration-effort, cannibalisation, and evidence-risk inputs.
- [x] Missing live measurements use `value: null` with `dataStatus: unavailable`; no performance, lead, or effort value was fabricated.
- [x] Potential cannibalisation groups have machine-readable analysis and recommendations.
- [x] Low traffic alone is explicitly prohibited as sufficient merge, redirect, or retirement evidence.
- [x] A deterministic code-point canonicalisation and SHA-256 digest validator protects an approved snapshot from silent changes.
- [x] Runtime validation rejects unsupported ledger versions, invalid baseline IDs, impossible calendar dates, and non-SHA-256 protection metadata instead of relying only on TypeScript types.
- [ ] A human reviewer must approve every decision and cannibalisation recommendation.
- [ ] `reviewer`, `approvalDate`, and `protection.expectedDigest` must remain `null` until that approval occurs.
- [x] Ticket 05 exposes the frozen 23-article baseline contract consumed by this validation suite.
- [ ] Ticket 09 must resolve how a future `create` decision is represented for `/article/china-quality-inspection-guide`; it is deliberately absent from the 23-entry baseline and does not alter `articleSchema`.

## Canonical decisions awaiting approval

| Cluster                 | Frozen count | Proposed editorial pillar                                           | Commercial root               |
| ----------------------- | -----------: | ------------------------------------------------------------------- | ----------------------------- |
| `supplier-verification` |            6 | `/article/verify-chinese-supplier`                                  | `/supplier-verification`      |
| `factory-audit`         |            1 | `/article/supplier-audit-check-sheet-china`                         | `/factory-audit-china`        |
| `quality-inspection`    |            0 | planned `/article/china-quality-inspection-guide`                   | `/quality-inspection-china`   |
| `factory-visits`        |            3 | `/article/visiting-chinese-factories-australian-business-checklist` | `/visiting-chinese-factories` |
| `china-sourcing`        |           13 | `/article/importing-from-china-australia-guide`                     | `/services`                   |

The supplier-verification commercial root follows the approved cluster registry and design (`/supplier-verification`), not the unregistered `/supplier-verification-china` alternative. `content/seo/clusters.ts` intentionally remains migration-pending because recording these proposals as resolved before human approval would fabricate governance state.

## TDD evidence

- RED: `npx jest lib/seo/migrationLedger.test.ts --runInBand --no-cache` failed because `content/seo/migration-ledger.ts` did not exist.
- GREEN: the focused suite passes 11 tests covering exact identity, duplicate/missing/unexpected detection, URL preservation, enum validation, keep/refresh-only policy, pillar uniqueness, planned quality exception, dual-root membership, score-input null semantics, runtime metadata/calendar validation, approval blocking, code-point sorting, and digest tamper detection.
- Regression/type/style: 61 focused SEO tests pass across the ledger and cluster contracts; isolated strict TypeScript, focused ESLint, and Prettier checks pass.
- Current pending payload digest: `38ed6dc3e224c45aa39457b4193b0e7dc5ff491eaedda0ab52697eac0165d2dd`. This is diagnostic only, not an approval signature; `protection.expectedDigest` remains `null`.

## Files

- `content/seo/migration-ledger.ts` — canonical pending ledger and reviewed migration inputs.
- `lib/seo/migrationLedger.ts` — pure validator, report, code-point sort, and SHA-256 digest API.
- `lib/seo/migrationLedger.test.ts` — focused TDD contract.
- `content/seo/clusters.ts` — deliberately unchanged pending human pillar approval.
