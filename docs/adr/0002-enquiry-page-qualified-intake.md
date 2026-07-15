# ADR 0002 — Enquiry Page qualified intake (C3)

**Status:** Accepted  
**Date:** 2026-07-15  
**Context:** After Successful Enquiry conversion measurement (ADR 0001), deepen qualification only on `/enquiry` without breaking embedded Lead Forms.

## Decision

1. **C3 upgrades only the Enquiry Page Form** on `/enquiry`. Embedded Lead Forms stay three-field soft CTAs and do not collect `path_intent` or `timeline`.
2. **Six required fields** on Enquiry Page Form: `fullName`, `email`, `company`, `pathIntent`, `timeline`, `lookingFor`. Optional: `phone`, `industry`.
3. **`path_intent` means procurement intent** (`find_new` | `verify_existing`), not travel vs remote delivery. Educational copy about delivery mode may exist on the page but is not a form field in C3 (`engagement_mode` deferred).
4. **`timeline` is always accepted as a Successful Enquiry dimension** after API success; it never gates `generate_lead`.
5. **Single `POST /api/enquiry`**: `company`, `pathIntent`, `timeline` remain optional at the API for Lead Form compatibility. If present, values must match allowlists or the request is 400. Enquiry Page enforces required fields in the client.
6. **Success UX**: fire `trackSuccessfulEnquiry` (and process `form_submit`) on `/enquiry` after API success, then navigate to `/enquiry/thank-you` (optional `id=enquiryId`). Thank-you is `noindex, follow`, canonical `/enquiry`, displays optional Enquiry ID, and does **not** fire lead/conversion events.
7. **Payload/enums** deepen the existing Lead Capture Payload module with a single source of qualification enums for UI + Zod; no second enquiry endpoint.

## Consequences

- Analytics `path_intent=not_provided` remains valid for embedded Lead Forms only.
- Industry dropdown gets minimal fixes (e.g. construction) without a full slug migration.
- Industry-page dual-path collection stays out of C3 (C4).

## Rejected alternatives

- Upgrading all Lead Forms to six fields in the same slice.
- Server-side required qualification for every submit (would break soft CTAs or force a second API).
- Firing conversions on the thank-you page.
- Filtering `generate_lead` by self-reported timeline.
- Reusing `path_intent` for travel vs remote.
