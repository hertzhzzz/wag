# Question set approval — Factory Visits

**Status:** PENDING_MARK_SIGNATURE
**Approver:**
**Date:**
**Signature:**

## Package identity

| Field | Value |
|---|---|
| Ticket | 34 — Capture the Factory Visits GEO Baseline |
| Question set path | `content/seo/geo/questions/factory-visits.json` |
| version | `1` |
| asOfDate | `2026-07-18` |
| cluster | `factory-visits` |
| JSON status field | `draft` (schema literal; human approval is this package, not a status rewrite) |
| Question count | 10 |
| Verified digest | `sha256:d6293d135631269776b7ad944233680c6a6f768ae2ceb0f28f03fd7965ec5dcf` |
| Digest algorithm | `computeGeoQuestionSetDigest` → `hashCanonical({ version, asOfDate, cluster, status, questions[{id,prompt,buyerStage,intent,targetMarket}] })` in `lib/seo/geoBaselines/geoClusterBaseline.ts` |

## Exact questions (do not paraphrase in capture)

| # | ID | Prompt |
|---|---|---|
| 1 | `factory-visits-01-itinerary` | How should an Australian buyer plan a China factory visit itinerary before booking travel? |
| 2 | `factory-visits-02-meeting-agenda` | What should an importer include in a meeting agenda for a first visit to a Chinese factory? |
| 3 | `factory-visits-03-independent-support` | What should an Australian buyer look for in independent factory visit support in China? |
| 4 | `factory-visits-04-production-evidence` | What evidence during a factory visit shows that production is active and relevant to my order? |
| 5 | `factory-visits-05-staged-visit-risks` | What warning signs suggest that a supplier has staged or restricted a factory visit? |
| 6 | `factory-visits-06-multiple-factories` | How can an Australian buyer compare several Chinese factories during one sourcing trip? |
| 7 | `factory-visits-07-confidentiality` | What confidentiality, photography, and document access rules should a buyer agree before a factory visit? |
| 8 | `factory-visits-08-questions-to-ask` | What operational questions should an Australian importer ask factory managers during an on-site meeting? |
| 9 | `factory-visits-09-compare-services` | How should an Australian business compare factory visit planning and support services in China? |
| 10 | `factory-visits-10-post-visit-decision` | How should a buyer turn factory visit notes into a documented supplier decision? |

## Approver checklist (Mark)

- [ ] Confirmed 10 questions are acceptable for the Factory Visits GEO baseline
- [ ] Confirmed digest matches live run manifests (recompute with `computeGeoQuestionSetDigest` if needed)
- [ ] Understood JSON `status` remains `draft`; approval is this human package
- [ ] Observation-only: no ranking / optimisation causality claims from this question set alone
- [ ] Fill **Status=APPROVED**, **Approver**, **Date**, **Signature** when ready

> Do not invent Mark signature. Capture may proceed for packaging; evaluation remains fail-closed until signed.
