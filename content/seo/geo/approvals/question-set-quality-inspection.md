# Question set approval — Quality Inspection

**Status:** PENDING_MARK_SIGNATURE
**Approver:**
**Date:**
**Signature:**

## Package identity

| Field | Value |
|---|---|
| Ticket | 33 — Capture the Quality Inspection GEO Baseline |
| Question set path | `content/seo/geo/questions/quality-inspection.json` |
| version | `1` |
| asOfDate | `2026-07-18` |
| cluster | `quality-inspection` |
| JSON status field | `draft` (schema literal; human approval is this package, not a status rewrite) |
| Question count | 10 |
| Verified digest | `sha256:7ea4fd81936885385e0d3a9322996609deda06f73345a9daca12ee56dc2cbd1e` |
| Digest algorithm | `computeGeoQuestionSetDigest` → `hashCanonical({ version, asOfDate, cluster, status, questions[{id,prompt,buyerStage,intent,targetMarket}] })` in `lib/seo/geoBaselines/geoClusterBaseline.ts` |

## Exact questions (do not paraphrase in capture)

| # | ID | Prompt |
|---|---|---|
| 1 | `quality-inspection-01-stage` | Which product inspection stage should an Australian importer use before goods leave a factory in China? |
| 2 | `quality-inspection-02-aql` | How should a buyer set an AQL standard and defect limits for a China production order? |
| 3 | `quality-inspection-03-report` | What should a pre-shipment inspection report include before an Australian buyer releases final payment? |
| 4 | `quality-inspection-04-checklist` | How can an importer create a product-specific inspection checklist instead of relying on a generic checklist? |
| 5 | `quality-inspection-05-defect-classes` | What is the difference between critical, major, and minor defects in a quality inspection? |
| 6 | `quality-inspection-06-during-production` | When should an Australian buyer arrange a during-production inspection rather than wait for pre-shipment inspection? |
| 7 | `quality-inspection-07-failed-inspection` | What should a buyer do when a China quality inspection fails? |
| 8 | `quality-inspection-08-reinspection` | When is reinspection necessary after a factory claims that defects have been corrected? |
| 9 | `quality-inspection-09-compare-services` | How should an Australian business compare quality inspection services in China? |
| 10 | `quality-inspection-10-packaging-compliance` | What packaging, labelling, and compliance checks should an AU-NZ importer add to a China inspection? |

## Approver checklist (Mark)

- [ ] Confirmed 10 questions are acceptable for the Quality Inspection GEO baseline
- [ ] Confirmed digest matches live run manifests (recompute with `computeGeoQuestionSetDigest` if needed)
- [ ] Understood JSON `status` remains `draft`; approval is this human package
- [ ] Observation-only: no ranking / optimisation causality claims from this question set alone
- [ ] Fill **Status=APPROVED**, **Approver**, **Date**, **Signature** when ready

> Do not invent Mark signature. Capture may proceed for packaging; evaluation remains fail-closed until signed.
