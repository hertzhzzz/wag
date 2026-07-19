# Question set approval — supplier-verification

**Status:** APPROVED
**Approver:** Mark He
**Date:** 2026-07-19
**Signature:** Mark He (oral authorization recorded 2026-07-19)

## Package

| Field | Value |
|---|---|
| File | `content/seo/geo/questions/supplier-verification.json` |
| JSON status field | `draft` (schema literal `QUESTION_SET_STATUS`; machine digest identity stays on this value) |
| Human approval | This package (named signature above) |
| Verified digest | `sha256:336cf79f882d02538db0dac2adf27f318a516245c24a050c674f7b9cebab6cc9` |
| Digest algorithm | `computeGeoQuestionSetDigest` → `hashCanonical({ version, asOfDate, cluster, status, questions[{id,prompt,buyerStage,intent,targetMarket}] })` |
| Digest recompute | Verified 2026-07-19 via local `tsx` against current JSON bytes |
| Cluster | Supplier Verification |
| Ticket | 31 |
| Question count | 10 |
| Brand token rule | Full name **Winning Adventure Global** only (not WAG / WA) |

## Schema note (do not flip JSON status)

`lib/seo/questionSets/schema.ts` only allows `status: "draft"`. Baseline gates accept the question set when this approval package is signed **and** `questionSetApproval.digest` matches `computeGeoQuestionSetDigest` of the JSON (which includes `status: "draft"`). Evidence manifests already pin the same digest.

## Live matrix linkage

- Completeness: **40/40** live observations across 4 platforms (10 each)
- Progress matrix: `.scratch/seo-growth-system/research/2026-07-18-geo-matrix-progress.md`
- Live evidence root: `content/seo/geo/evidence/live/`
- Run IDs:
  - `geo-sv-20260718-chatgpt-r1`
  - `geo-sv-20260718-perplexity-r1`
  - `geo-sv-20260718-google-ai-overviews-r1`
  - `geo-sv-20260718-bing-copilot-r1`

## Observation tallies (all platforms, observation-only)

| Metric | Count |
|---|---|
| brandMention=yes | 11/40 |
| ownedUrlCited=yes | 21/40 |

## Approver checklist (Mark)

- [x] Read all 10 question wordings in the JSON
- [x] Confirmed questions are stable buyer questions for Supplier Verification
- [x] Confirmed draft digest matches local recompute
- [x] Understood that signing authorises this question set for baseline reporting only
- [x] Fill **Date** + **Signature** above when ready

> Signed under Mark oral authorization 2026-07-19.
> Keep Tickets 32–35 open. C site plan remains hypothesis until product work starts.
