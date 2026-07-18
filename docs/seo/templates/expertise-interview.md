# Expertise Interview and Consent Record

> Blank governance template only. It does not document an actual interview, contributor, quotation, approval, or verified finding. Complete it during a **45-minute human interview**. Keep raw notes, recordings, transcripts, personal data, and confidential operational details in an approved private store, never in the public repository.

## 1. Session identity

- Session ID (`intv.<opaque-id>`):
- Interview date and time with offset:
- Duration in minutes (maximum `45`):
- Selected cluster or opportunity:
- Internal raw-note reference (`note.<opaque-private-store-id>`):
  - Do not enter a URL, email address, phone number, absolute path, relative path, file URI, transcript, or raw note.

### Contributor

- Internal contributor reference (`contributor.<opaque-id>`):
- Contributor name (private record only):
- Role:
- Authority scope for this interview:

### Interviewer

- Internal interviewer reference (`interviewer.<opaque-id>`):
- Interviewer name (private record only):
- Role:

## 2. Consent boundaries

Record each decision independently as `granted`, `denied`, or `not-requested`. A denial of recording or transcript consent does not grant any other permission.

| Consent item                      | Decision | Boundary or condition |
| --------------------------------- | -------- | --------------------- |
| Recording                         |          |                       |
| Transcript creation or retention  |          |                       |
| Internal use of a bounded summary |          |                       |
| Public quotation                  |          |                       |
| Named attribution                 |          |                       |

- Consent captured on (`YYYY-MM-DD`):
- Consent expiry date (`YYYY-MM-DD` or `none`):
- Revoked on (`YYYY-MM-DD` or `none`):
- Revocation reason or private reference (`none` if not revoked):

Stop the workflow if internal-use consent is not granted. Public quotation requires explicit public-quotation consent and permission. Any non-anonymous attribution requires explicit named-attribution consent and permission. Expired or revoked consent cannot be overridden by an editorial decision.

## 3. Forty-five-minute interview plan

| Time          | Human interview activity                                                                                                                  | Required output                                             |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 0-5 minutes   | Confirm identity, authority scope, consent boundaries, privacy categories, and the selected cluster.                                      | Recorded consent decisions and scope only.                  |
| 5-13 minutes  | Ask for recurring buyer questions and the decisions buyers are trying to make.                                                            | Bounded question summaries.                                 |
| 13-21 minutes | Ask about field observations, escalation triggers, and document or supplier mismatches.                                                   | Observations separated from verified facts.                 |
| 21-29 minutes | Ask what each check can establish and what it cannot establish.                                                                           | Decision boundaries and limitations.                        |
| 29-36 minutes | Ask for safe, anonymised patterns that do not identify a person, supplier, address, price, bank detail, licence, or confidential process. | Candidate safe examples, still non-public.                  |
| 36-41 minutes | Identify claims that require current official or external support and any quantitative-method requirements.                               | External-support list and provenance gaps.                  |
| 41-45 minutes | Read back the bounded summaries, confirm consent, record limitations, and explain the two-review workflow and revocation route.           | Confirmed private record ready for review, not publication. |

## 4. Question capture

Create one stable question record for each item. Do not paste a transcript or raw answer into this template.

### Question record

- Question ID (`question.<kebab-case>`):
- Prompt:
- Internal response summary:
- Category: `recurring-buyer-question` | `field-observation` | `decision-boundary` | `safe-example` | `external-support-required` | `service-boundary`
- Fact, signal, inference, or limitation:
- Privacy categories present: `supplier` | `person` | `address` | `identifier` | `pricing` | `banking` | `other-confidential` | `none`
- Candidate bounded claim, if any:
- Claim kind: `decision-boundary` | `fact` | `inference` | `observation` | `quantitative` | `quotation` | `safe-example`
- External evidence required:
- Limitation:

Duplicate the question record as needed within the 45-minute limit.

## 5. Privacy classification and redaction

### Session classification

- Classification: `internal` or `restricted`
- Classified by internal reviewer reference (`reviewer.<opaque-id>`):
- Classified on (`YYYY-MM-DD`):
- Categories present: `supplier` | `person` | `address` | `identifier` | `pricing` | `banking` | `other-confidential` | `none`

### Redaction log

| Redaction ID | Category | Action (`removed`, `masked`, or `generalised`) | Rationale |
| ------------ | -------- | ---------------------------------------------- | --------- |
|              |          |                                                |           |

Redaction changes what may be reviewed; it does not create publication permission. Keep the original private material outside the repository under the approved retention policy.

## 6. Session limitations

Record at least one limitation. Examples must not be copied as answers; write only limitations that apply to the completed human interview.

-

## 7. Contribution handoff

An interview session is never public evidence by itself. For each candidate contribution:

1. Create a separate opaque contribution record linked only by the session ID.
2. Rewrite the material as one bounded claim; do not copy raw notes or a transcript.
3. Record permission status and exact scopes, privacy classification, allowed attribution, supported article IDs, method, limitations, review due date, and revocation state.
4. For a quantitative claim, also record a positive denominator, unit, date range, inclusion criteria, exclusion criteria, deduplication method, missing-data treatment, and limitations.
5. Obtain an independent factual review.
6. Obtain a separate disclosure/privacy review from a different reviewer.
7. Evaluate eligibility using an explicit caller-supplied as-of date.
8. Exclude synthetic, rejected, restricted, revoked, expired, unreviewed, or unsafe material from every public projection.

Nothing in this template approves an article, release, deployment, or indexing action for Winning Adventure Global.
