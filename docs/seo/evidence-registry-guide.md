# Evidence Registry Maintenance Guide

This guide explains how maintainers manage the public Evidence Registry for the SAMR pilot and later governed content. The registry records provenance and bounded support; it is not a repository for source documents, supplier dossiers, or generated reports.

## Files and ownership

- Registry source: `content/seo/evidence/registry.yaml`
- Article claim manifests: governed YAML artifacts associated with an article
- Review decisions: reviewer-authored artifacts associated with an article and its claim manifest
- Gate reports and analytics: generated, read-only outputs

Edit source records and review artifacts. Never edit generated gate reports or analytics to change an outcome.

## Record lifecycle

1. Capture an allowed source and record the `capturedDate`.
2. Classify its source type, jurisdictions, target markets, permission, privacy, and quantitative status.
3. State only the claims the source supports, using an explicit boundary for each claim.
4. Record non-empty limitations and a `reviewDueDate`.
5. Run the Evidence Gate with an injected `asOfDate`.
6. Review the source before its deadline or sooner if the source, law, service, or supported wording materially changes.
7. Correct, restrict, or mark the record unsupported when the source can no longer support the claim.

For the pilot, the as-of date is `2026-07-18`, the sources were captured on `2026-07-16`, and review is due on `2027-01-12`.

## Evidence statuses

Status evaluation uses this precedence:

`unsupported > expired > restricted > public`

| Status        | Meaning                                                                                                   | Required action                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `public`      | The record is supported, within its review window, `privacy: public`, and `permission.status: permitted`. | It may contribute a safe public trace within its claim boundary.                               |
| `restricted`  | Privacy is not public or permission is not permitted, including unresolved permission.                    | Keep protected material outside public output and resolve access or permission before release. |
| `expired`     | The injected `asOfDate` is later than `reviewDueDate`.                                                    | Re-review the source and update the record before governed publication.                        |
| `unsupported` | `supportStatus` is `unsupported`.                                                                         | Remove or rewrite the claim; do not publish it as supported.                                   |

A record remains current on its `reviewDueDate` and becomes expired on the next UTC calendar day.

## Claim boundaries

A claim boundary is the maximum wording the evidence supports. It is not a suggested conclusion and must not be broadened during drafting.

- Use a stable machine claim ID.
- Copy the canonical boundary exactly into the registry and the article claim manifest.
- Keep the article excerpt separate from the boundary.
- If article wording is stronger than the boundary, rewrite the article or obtain appropriate evidence.
- A public gate trace may show the canonical boundary but must never include the article claim excerpt.

## Review dates, permission, and privacy

- `capturedDate` records when the source was collected.
- `reviewDueDate` is the last valid UTC calendar date unless an earlier material change requires review.
- `asOfDate` must be supplied to the gate; core validation must not fall back to the system clock.
- `permission.status` is `permitted`, `restricted`, or `unresolved`.
- Set `attributionRequired: true` and provide `attribution` when publication requires attribution.
- `privacy` is `public`, `internal`, or `restricted`.
- A record is restricted whenever privacy is not public or permission is not permitted, subject to the higher unsupported and expired statuses.

## Add or update a record

1. Create a stable opaque ID matching `ev.<8 lowercase hexadecimal characters>`. Never encode a supplier, person, address, company identifier, or other source detail in the ID.
2. Choose an allowed `sourceType`: `official`, `first-party`, `industry-analysis`, `interview`, or `allowlisted-other`.
3. Use either an HTTPS `public-url` or an opaque `controlled-reference` with a `ref.<8 lowercase hexadecimal characters>` ID.
4. Add valid captured and review dates, at least one machine-readable jurisdiction, and at least one supported target market.
5. Add one or more supported claim IDs with exact, non-empty boundaries.
6. Add non-empty limitations that state what the source cannot establish.
7. Set support, permission, attribution, privacy, and quantitative fields explicitly.
8. For first-party quantitative evidence, add a method summary, positive denominator, and deduplication method. Do not add internal quantitative values to public records or outputs.
9. Keep set-like arrays and records in canonical order, avoid duplicate IDs, and do not use YAML aliases, anchors, or merge keys.
10. Format, parse, and run the gate before requesting review.

Unknown fields, duplicate keys, duplicate evidence or claim IDs, invalid dates, and non-canonical claim mappings must fail validation rather than being silently accepted.

## Restricted source handling

Restricted source material stays outside the public repository. If a governed workflow needs to refer to it, use only an approved opaque `controlled-reference` and a safe publishable claim boundary. Mark privacy and permission accurately so the gate blocks public use.

Never place real supplier or personal information, addresses, enterprise identifiers, licence data, banking details, confidential interview material, or restricted source values in:

- the public registry;
- article output;
- gate issues or reports;
- generated analytics;
- fixtures or examples.

Restricted test cases must be synthetic. Public reports must not expose controlled-reference values. Analytics may contain only safe article IDs, status and decision values, counts, sorted issue codes, and opaque evidence IDs with statuses.

## Run the Evidence Gate

Run the read-only pilot gate with an explicit UTC calendar date:

```bash
npm run seo:evidence:check -- --as-of 2026-07-18
```

The CLI is read-only, requires an explicit `--as-of YYYY-MM-DD`, prints deterministic JSON, and exits with status 1 when the report fails. It defaults to the four SAMR pilot artifacts and also accepts explicit `--article`, `--registry`, `--claims`, and `--review` paths.

Format and parse the registry before requesting review:

```bash
npx prettier --check content/seo/evidence/registry.yaml docs/seo/evidence-registry-guide.md
node -e "const fs=require('node:fs'); const YAML=require('yaml'); YAML.parse(fs.readFileSync('content/seo/evidence/registry.yaml','utf8')); console.log('registry YAML parsed')"
```

## Reviewer decisions

A reviewer records one of `approved`, `rejected`, or `correction-requested` in the review artifact. The artifact also records the article ID, reviewer, review date, and SHA-256 digests of the exact article source and claim-manifest source.

- `approved` permits the gate to continue only when both digests still match.
- `rejected` fails the gate.
- `correction-requested` fails the gate until the source artifact is corrected and reviewed again.
- Any source change requires fresh digests and a new review decision.

Reviewers approve, reject, or request correction through the review artifact. They do not edit generated gate reports, analytics, or other generated outputs.

## Maintenance checklist

- Source is allowed, reachable through the recorded reference, and captured on the stated date.
- Claim IDs and boundaries exactly match the governed manifest.
- Limitations prevent stronger unsupported conclusions.
- Review dates are valid and current for the injected as-of date.
- Permission and attribution are resolved.
- Privacy is correctly classified.
- Quantitative evidence includes the required method metadata without exposing internal values.
- No restricted supplier, person, address, identifier, licence, banking, or confidential data is present.
- Formatting, YAML parsing, Evidence Gate, and relevant tests pass.
