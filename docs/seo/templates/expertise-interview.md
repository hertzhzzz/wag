# Expertise Interview and Consent Record

> Blank governance template only. It is not an interview, consent record, approval, person record, quotation, or verified evidence. Complete it with real humans in no more than 45 minutes. Store raw notes and sensitive data only in an approved private store. The repository may contain only opaque references and classified, bounded summaries.

## 1. Session identity

- Record class: `actual` | `synthetic`
- Public use: `governed` | `prohibited`
- Session ID (`intv.<12-lowercase-hex>`):
- Explicit `asOf` date (`YYYY-MM-DD`):
- Interview date and time with numeric offset:
- Duration in minutes (maximum `45`):
- Ticket 28 opportunity or brief ID, if supplied:
- Private raw-note reference (`note.<16-lowercase-hex>`):

Do not enter a URL, file path, email address, phone number, transcript, recording, or raw answer in the raw-note-reference field.

### Named contributor — private governance record

- Internal reference (`contributor.<12-lowercase-hex>`):
- Name:
- Role:
- Authority scope:

### Named interviewer — private governance record

- Internal reference (`interviewer.<12-lowercase-hex>`):
- Name:
- Role:

If either real named human is absent, stop at scaffold stage. Do not label the session `actual` and do not create public evidence.

## 2. Classification before storage

Classify each proposed note fragment before it is stored or summarised.

| Fragment ID | Storage decision     | Privacy level         | Categories                                                                               | Redaction action                      | Private rationale |
| ----------- | -------------------- | --------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------- | ----------------- |
|             | store / do-not-store | internal / restricted | supplier / person / address / identifier / pricing / banking / other-confidential / none | removed / masked / generalised / none |                   |

Rules:

- `restricted` information is never copied into a contribution candidate.
- A public contribution must have privacy level `public` and no confidential category.
- Supplier names, personal details, addresses, identifiers, prices, bank details, and confidential operational details remain private unless a separately governed policy explicitly permits a bounded public use.
- Classification must record an opaque reviewer reference and a governance date no later than the explicit `asOf` date for an actual record.

## 3. Consent boundaries

Record each decision independently as `granted`, `denied`, or `not-requested`.

| Consent item                      | Decision | Boundary or condition |
| --------------------------------- | -------- | --------------------- |
| Recording                         |          |                       |
| Transcript creation or retention  |          |                       |
| Internal use of bounded summaries |          |                       |
| Public quotation                  |          |                       |
| Named attribution                 |          |                       |

- Captured on (`YYYY-MM-DD`):
- Expires on (`YYYY-MM-DD` or `none`):
- Revoked on (`YYYY-MM-DD` or `none`):
- Revocation reason or private reference (`none` if not revoked):

Internal-use consent is mandatory for processing. Public quotation and non-anonymous attribution each require their own explicit consent and permission. Revoked or expired consent is fail-closed.

## 4. Forty-five-minute interview plan

| Time          | Activity                                                                                                      | Required structured output                             |
| ------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 0-5 minutes   | Confirm identity, authority, consent, classification rules, `asOf`, and the selected opportunity.             | Named private governance record and consent decisions. |
| 5-13 minutes  | Capture recurring buyer questions and the decisions buyers need to make.                                      | `buyerQuestions[]` records.                            |
| 13-21 minutes | Capture field observations and separate facts, signals, inferences, and unknowns.                             | `questions[]` records with privacy categories.         |
| 21-29 minutes | Ask what each check can and cannot establish.                                                                 | `practicalBoundaries[]`.                               |
| 29-36 minutes | Capture anonymised examples that remain useful after restricted details are removed.                          | `safeExamples[]` with permitted claim boundaries.      |
| 36-41 minutes | Identify claims that need current official, operational, quantitative, or third-party evidence.               | `externalSupportClaims[]`.                             |
| 41-45 minutes | Read back bounded summaries, confirm consent and limitations, and explain independent reviews and revocation. | Private record ready for review, never publication.    |

## 5. Structured capture fields

### Buyer question

- ID (`buyer-question.<kebab-case>`):
- Question:
- Buyer need or decision:
- Privacy categories:

### Interview question and response summary

- ID (`question.<kebab-case>`):
- Prompt:
- Bounded response summary, not transcript:
- Privacy categories:

### Practical boundary

- What the check can establish:
- What it cannot establish:
- Escalation trigger:

### Safe example

- ID (`example.<kebab-case>`):
- Generalised summary:
- Permitted claim boundary:
- Privacy categories after redaction:

### External-support claim

- ID (`support.<kebab-case>`):
- Claim needing support:
- Required evidence type:
- Why interview evidence alone is insufficient:

## 6. Candidate contribution handoff

Complete only after classification and consent are valid.

- Contribution ID (`contrib.<12-lowercase-hex>`):
- Interview session reference:
- Bounded claim:
- Permitted claim boundary:
- Claim kind:
- Disclosure level:
- Allowed attribution:
- Permission scopes:
- Supported article IDs:
- Method and limitations:
- Review due date:

This handoff is a candidate only. It is not approved evidence until separate factual and disclosure reviews pass with different real reviewers. A future governance date is invalid for an actual record; future dates are permitted only in explicitly synthetic, public-use-prohibited fixtures.
