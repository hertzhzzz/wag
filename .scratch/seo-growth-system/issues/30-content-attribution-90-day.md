# 30 — Measure 90-Day Content-to-Enquiry Attribution

**What to build:** Add consent-aware first-touch and assisted-touch attribution for governed content over a 90-day window, joining successful enquiries outside the browser through a non-sensitive enquiry identifier. Analytics payloads must contain only approved campaign, cluster, article, and funnel values and must exclude personal or free-text form data.

**Blocked by:** 03; external dependency: approved Unified Enquiry Form attribution contract and privacy review.

**Status:** contract implementation complete within the owned attribution scope; online/production completion is not claimed and remains blocked on the Unified Enquiry Form server adapter plus independent privacy approval.

## Contract-level acceptance (implemented and tested)

- [x] First-touch and assisted-touch attribution are stored and reported as distinct concepts.
- [x] Every journey, including direct-only journeys, has a deterministic `expiresAt` exactly 90 days after the earliest retained touch; the expiry boundary is exclusive.
- [x] Browser analytics projections contain only approved event/channel plus allowlisted campaign, cluster, article, funnel, and non-sensitive `public-route-v1` route IDs.
- [x] Names, emails, phone numbers, company names, message text, product details, query strings, raw/private paths, stable device identifiers, fingerprints, and other free text are excluded.
- [x] Actual capture requires a server-created opaque trust boundary and a verified consent proof bound to issuer, proof ID, anonymous session ID, fixed consent metadata, and the 90-day validity window.
- [x] Actual successful-enquiry joins require a separately verified server proof bound to issuer, opaque proof ID, anonymous session ID, opaque enquiry ID, and actual mode; the proof is atomically consumed to reject replay.
- [x] The literal `server-reporting` scope, caller-reported consent fields, caller-reported successful-enquiry fields, and caller-created lookalike boundary objects grant no authority and fail closed.
- [x] Caller timestamps may only tighten a trusted server observation boundary. Consent validity and attribution-window expiry are evaluated against trusted observation time, so a backdated caller clock cannot resurrect expired consent or an expired journey.
- [x] A trusted consent decision cannot be applied retroactively to a touch captured before `decidedAt`.
- [x] Consent denial, consent unavailability, storage unavailability, corrupt storage, and write failure degrade without throwing into or blocking the enquiry form.
- [x] `dry_run` is preview-only and performs zero storage reads or writes. Synthetic fixtures remain isolated from actual reporting.
- [x] Automated tests cover consent, direct/returning visits, exact 90-day expiry, successful submissions, replay, malformed/unknown/prototype-bearing decisions, adapter mutation, forged persisted proof references, ordering, deterministic serialization, and prohibited fields.

## Trusted server adapter boundary

`lib/seo/attribution/trustedServer.ts` is intentionally not re-exported from the browser-facing attribution index. Server composition must supply an adapter that:

1. derives `observedAt` from a trusted server clock;
2. verifies consent proof authenticity by server-side signature verification or opaque proof lookup, including issuer, anonymous session identity, fixed metadata (`seo-attribution-consent-v1`, `content-to-enquiry-attribution`, 90 days), decision time, and exact validity end;
3. re-verifies the persisted consent proof reference at the same trusted `observedAt` boundary before an actual journey is updated or joined;
4. verifies successful submission from the Unified Enquiry Form server result rather than request/body fields;
5. maps the successful submission to a non-sensitive high-entropy opaque enquiry ID; and
6. atomically consumes the successful-enquiry proof ID so replay fails closed.

If any of these adapter guarantees is absent, unavailable, malformed, expired, mismatched, or throws, actual capture/join is skipped. The contract never treats a caller assertion, the `server-reporting` string, or a structurally similar object as proof.

## Time and data-mode boundary as reviewed on 2026-07-18

- Actual tests use trusted observation no later than **2026-07-18**. An actual touch or successful-enquiry occurrence after its trusted/caller-tightened boundary is rejected.
- Dates after **2026-07-18** appear only as synthetic fixture data or as expected consent/retention expiry metadata; they are not accepted as already-observed actual events in this review.
- Production time advances only through the trusted server clock. A caller-supplied `now` or `joinedAt` can be earlier (stricter) but cannot move the observation boundary later.

## Remaining external human gates (not complete)

- [ ] Unified Enquiry Form owners approve and implement the trusted server adapter against the real successful-submission result.
- [ ] Privacy reviewer approves consent issuance, storage purpose, 90-day retention/deletion, proof lookup/signature handling, and the final analytics field map.
- [ ] Analytics/reporting owners verify the production destination accepts only the safe projections and does not enrich them with PII, form free text, query/raw path, or device/fingerprint identifiers.
- [ ] Human integration review confirms denied consent and unavailable storage never block a real enquiry submission.
- [ ] Production rollout, monitoring, deletion/retention operations, and any release approval are completed separately.

No Unified Enquiry Form files, actual enquiry data, analytics destination, deployment, indexing operation, production report, commit, push, or production configuration was changed by this contract work.
