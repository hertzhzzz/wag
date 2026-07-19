# Question set approval — Factory Audit

**Status:** APPROVED
**Approver:** Mark He
**Date:** 2026-07-19
**Signature:** Mark He (oral authorization recorded 2026-07-19)

## Package identity

| Field | Value |
|---|---|
| Ticket | 32 — Capture the Factory Audit GEO Baseline |
| Question set path | `content/seo/geo/questions/factory-audit.json` |
| version | `1` |
| asOfDate | `2026-07-18` |
| cluster | `factory-audit` |
| JSON status field | `draft` (schema literal; human approval is this package, not a status rewrite) |
| Question count | 10 |
| Verified digest | `sha256:3bec0f9c3de17e1cb2c6f36562d1b3f907460d34f66c795040f0d7c8259dec6d` |
| Digest algorithm | `computeGeoQuestionSetDigest` → `hashCanonical({ version, asOfDate, cluster, status, questions[{id,prompt,buyerStage,intent,targetMarket}] })` in `lib/seo/geoBaselines/geoClusterBaseline.ts` |

## Exact questions (do not paraphrase in capture)

| # | ID | Prompt |
|---|---|---|
| 1 | `factory-audit-01-scope` | What should a factory audit in China cover before an Australian importer places a large order? |
| 2 | `factory-audit-02-audit-or-verification` | How is a factory audit different from supplier verification and product inspection? |
| 3 | `factory-audit-03-records` | What documents and production records should an auditor review at a Chinese factory? |
| 4 | `factory-audit-04-capacity` | How can an audit test whether a factory has enough capacity for an Australian buyer's delivery schedule? |
| 5 | `factory-audit-05-subcontracting` | What subcontracting warning signs should an Australian buyer look for during a factory audit? |
| 6 | `factory-audit-06-quality-system` | How should an Australian importer assess a Chinese factory's quality management system? |
| 7 | `factory-audit-07-technical-audit` | When should a buyer use a technical audit instead of a general factory audit? |
| 8 | `factory-audit-08-report` | What should a factory audit report include so an Australian buyer can make a sourcing decision? |
| 9 | `factory-audit-09-compare-services` | How should an Australian business compare factory audit services in China? |
| 10 | `factory-audit-10-stop-findings` | Which factory audit findings should be resolved before approving a Chinese factory for production? |

## Approver checklist (Mark)

- [x] Confirmed 10 questions are acceptable for the Factory Audit GEO baseline
- [x] Confirmed digest matches live run manifests (recompute with `computeGeoQuestionSetDigest` if needed)
- [x] Understood JSON `status` remains `draft`; approval is this human package
- [x] Observation-only: no ranking / optimisation causality claims from this question set alone
- [x] Fill **Status=APPROVED**, **Approver**, **Date**, **Signature** when ready

> Signed under Mark oral authorization 2026-07-19.
> Keep Tickets 33–35 open. Observation-only baseline; no ranking causality claims.
