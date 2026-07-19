# Question set approval — China Sourcing

**Status:** PENDING_MARK_SIGNATURE
**Approver:**
**Date:**
**Signature:**

## Package identity

| Field | Value |
|---|---|
| Ticket | 35 — Capture the China Sourcing GEO Baseline |
| Question set path | `content/seo/geo/questions/china-sourcing.json` |
| version | `1` |
| asOfDate | `2026-07-18` |
| cluster | `china-sourcing` |
| JSON status field | `draft` (schema literal; human approval is this package, not a status rewrite) |
| Question count | 10 |
| Verified digest | `sha256:b6b66e2c8796d2106866588f85df7ac46c859930116c56bdeafd61a4df1e89ef` |
| Digest algorithm | `computeGeoQuestionSetDigest` → `hashCanonical({ version, asOfDate, cluster, status, questions[{id,prompt,buyerStage,intent,targetMarket}] })` in `lib/seo/geoBaselines/geoClusterBaseline.ts` |

## Exact questions (do not paraphrase in capture)

| # | ID | Prompt |
|---|---|---|
| 1 | `china-sourcing-01-buying-brief` | What information should an Australian importer put in a China sourcing brief before contacting suppliers? |
| 2 | `china-sourcing-02-landed-cost` | How should an AU-NZ buyer calculate landed cost when comparing products sourced from China? |
| 3 | `china-sourcing-03-shortlist` | What evidence should a buyer use to narrow a long supplier list to a qualified shortlist? |
| 4 | `china-sourcing-04-direct-or-agent` | When should an Australian business source directly from a Chinese factory instead of using a sourcing agent? |
| 5 | `china-sourcing-05-moq-negotiation` | How can an Australian importer negotiate MOQ and pricing without creating quality or delivery risk? |
| 6 | `china-sourcing-06-payment-risk` | What payment terms and bank account checks reduce risk when buying from a new Chinese supplier? |
| 7 | `china-sourcing-07-samples-pilot` | When should a buyer use samples or a pilot order before committing to full production in China? |
| 8 | `china-sourcing-08-ip-confidentiality` | What intellectual property and confidentiality steps should an Australian buyer plan before sharing product files in China? |
| 9 | `china-sourcing-09-compliance-roles` | Who should own product compliance, freight, customs, and documentation tasks in an AU-NZ China sourcing project? |
| 10 | `china-sourcing-10-compare-services` | How should an Australian business compare China sourcing services and fee models? |

## Approver checklist (Mark)

- [ ] Confirmed 10 questions are acceptable for the China Sourcing GEO baseline
- [ ] Confirmed digest matches live run manifests (recompute with `computeGeoQuestionSetDigest` if needed)
- [ ] Understood JSON `status` remains `draft`; approval is this human package
- [ ] Observation-only: no ranking / optimisation causality claims from this question set alone
- [ ] Fill **Status=APPROVED**, **Approver**, **Date**, **Signature** when ready

> Do not invent Mark signature. Capture may proceed for packaging; evaluation remains fail-closed until signed.
