# Evidence retention & privacy

**Status:** APPROVED
**Approver:** Mark He
**Date:** 2026-07-19
**Signature:** Mark He (oral authorization recorded 2026-07-19)

## Scope

Approve storage, retention, redaction, and disclosure rules for **external-platform observations** used by Ticket 31 GEO baseline.

| Field | Value |
|---|---|
| Evidence path | `content/seo/geo/evidence/live/` |
| Provenance | `external-platform-observation` |
| Claim mode | observation-only |
| Account notes in captures | signed-in free-tier test accounts where applicable; do not store passwords or session cookies in evidence |
| Snapshots | UI/HTML or capture artifacts under each run `snapshots/` |

## Live packages covered (2026-07-18)

| Platform | Run ID | Observations |
|---|---|---|
| chatgpt | `geo-sv-20260718-chatgpt-r1` | 10 |
| perplexity | `geo-sv-20260718-perplexity-r1` | 10 |
| google-ai-overviews | `geo-sv-20260718-google-ai-overviews-r1` | 10 |
| bing-copilot | `geo-sv-20260718-bing-copilot-r1` | 10 |

## Approver checklist (Mark)

- [x] Accept live evidence root for repo-committed observation JSON + snapshots
- [x] Confirm no secrets (API keys, tokens, cookies) should be committed under evidence paths
- [x] Accept retention of competitor names / third-party URLs as observed citation metadata
- [x] Accept that these records may be audited later but are not public marketing claims
- [x] Fill **Date** + **Signature** when ready

> Signed under Mark oral authorization 2026-07-19.


## Ticket 32 live packages covered (2026-07-19) — REAFFIRMED

Scope extension for Factory Audit evidence under the same retention rules. **Mark reaffirmation recorded** for Ticket 32 live packages.

| Platform | Run ID | Observations |
|---|---|---|
| chatgpt | `geo-fa-20260719-chatgpt-r1` | 10 |
| perplexity | `geo-fa-20260719-perplexity-r1` | 10 |
| google-ai-overviews | `geo-fa-20260719-google-ai-overviews-r1` | 10 |
| bing-copilot | `geo-fa-20260719-bing-copilot-r1` | 10 |

- Matrix: `.scratch/seo-growth-system/research/2026-07-19-geo-matrix-factory-audit.md`
- Same secrets rule: no passwords, cookies, API tokens under evidence paths
- Observation-only; not public marketing claims

**Ticket 32 reaffirmation:** APPROVED — Mark He · 2026-07-19 · Mark He (oral authorization recorded 2026-07-19)

> Signed under Mark oral authorization 2026-07-19.


## Ticket 33 live packages covered (2026-07-19) — REAFFIRMED

Scope extension for Quality Inspection evidence under the same retention rules, reaffirmed under Mark written authorization on 2026-07-19.

| Platform | Run ID | Observations |
|---|---|---|
| chatgpt | `geo-qi-20260719-chatgpt-r1` | 10 |
| perplexity | `geo-qi-20260719-perplexity-r1` | 10 |
| google-ai-overviews | `geo-qi-20260719-google-ai-overviews-r1` | 10 |
| bing-copilot | `geo-qi-20260719-bing-copilot-r1` | 10 |

- Matrix: `.scratch/seo-growth-system/research/2026-07-19-geo-matrix-quality-inspection.md`
- Same secrets rule: no passwords, cookies, API tokens under evidence paths
- Observation-only; not public marketing claims
- brandMention=yes 0/40; ownedUrlCited=yes 0/40 (counts only; not causal)

**Ticket 33 reaffirmation:** APPROVED
**Ticket 33 Approver:** Mark He
**Ticket 33 Date:** 2026-07-19
**Ticket 33 Signature:** Mark He (written authorization recorded 2026-07-19)

> Signature recorded only after Mark explicit written authorization on 2026-07-19.

> Ticket 33 retention/privacy coverage reaffirmed under Mark written authorization 2026-07-19.
