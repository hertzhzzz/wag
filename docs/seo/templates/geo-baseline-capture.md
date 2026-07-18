# GEO Baseline Capture Record

Use this record only for an approved, reproducible observation run. It is a capture and audit template, not a ranking report and not evidence that any optimisation caused an outcome.

## Run identity

- Cluster:
- Question-set version:
- Question-set digest:
- Benchmark version:
- Methodology version:
- Run ID:
- As-of timestamp (ISO 8601):
- Locale:
- Device:
- Account/auth state:
- Expected repetitions:
- Operator:
- Reviewers:

## Required approvals before capture

- [ ] The question set is approved and its digest matches the run.
- [ ] Ticket 13 strict cutover approval is recorded.
- [ ] Each answer platform used in this run has a separate approval record.
- [ ] The evidence path and retention policy are approved.
- [ ] Privacy, redaction, and disclosure review are complete.
- [ ] The run is not a synthetic or fixture run.

## Observation table

Record one row per question and repetition. Keep the raw answer snapshot at the referenced evidence path.

| Question ID | Platform | Surface/model | Observed at | Prompt hash | Status | Brand mention | Owned URL cited | Accuracy | Completeness | Competitors | Snapshot path | Snapshot hash | Review evidence |
| ----------- | -------- | ------------- | ----------- | ----------- | ------ | ------------- | --------------- | -------- | ------------ | ----------- | ------------- | ------------- | --------------- |
|             |          |               |             |             |        |               |                 |          |              |             |               |               |                 |

Use `not-assessable`, `unavailable`, or `invalid` where the observation cannot support a metric. Do not replace unknown values with zero or `false` merely to complete a table.

## Quality risks

- Unsupported answer observation IDs:
- Misleading citation observation IDs:
- Unverified citation observation IDs:
- Missing or incomplete observation slots:
- Platform or question wording drift:
- Future-dated or invalid evidence:

## Report boundary

The final report must state:

- what was directly observed;
- which raw snapshots and reviews support each observation;
- which metrics are unavailable or incomplete;
- that answer-engine output is noisy observation data;
- that the record makes no causal, ranking, guarantee, or optimisation-outcome claim.

Do not publish a baseline when any required approval, snapshot integrity check, question-set match, platform coverage requirement, or review gate is unresolved.
