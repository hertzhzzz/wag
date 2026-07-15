# ADR 0001 — Successful Enquiry conversion measurement

**Status:** Accepted  
**Date:** 2026-07-15  
**Context:** Industry landings + enquiry forms for Winning Adventure Global (Australia China sourcing)

## Decision

1. **Only a Successful Enquiry counts as a lead.** The browser may fire conversion pixels only after `/api/enquiry` returns success with an `enquiryId`.
2. **`generate_lead` is the sole GA4 lead KPI event.** Visiting `/enquiry` or clicking a CTA is not a lead.
3. **One analytics module** (`trackSuccessfulEnquiry`) owns GA4 `generate_lead`, Google Ads form conversion (`AW-18216448449/6Uh5CLv_z8QcEMHjo-5D` with `transaction_id = enquiryId`), and Meta `Lead`.
4. **Embedded and enquiry-page forms share the same lead event**, distinguished by `form_type`: `embedded` | `enquiry_page`.
5. **`enquiryId` is server-generated** (`enq_<uuid>`), returned in the JSON body, and used for session dedupe.
6. **`industry` means industry attribution**, never a service label. Missing value is `not_provided`.
7. **`path_intent` is required on the analytics payload**; until the qualified form collects it, send `not_provided`.
8. **`form_submit` may remain as a process event** on successful submits only; it is not the lead KPI.
9. **Thank-you page does not fire lead events by default.** Fire after API success (same-page success state in the C2 slice).
10. **Delivery is non-blocking** with bounded retries for GA4/Ads; analytics failure must not undo a successful email send.

## Consequences

- LeadForm and EnquiryForm must not call `gtag`/`fbq` conversion APIs directly for leads.
- GA4/Ads admin configuration should stop treating `/enquiry` pageviews as conversions (ops checklist).
- Later dual-path UI (C3/C4) can populate `path_intent` without changing the conversion seam.

## Rejected alternatives

- Fire Ads conversion on submit click before API success.
- Separate lead event names per form.
- Client-generated enquiry ids as source of truth.
- Counting `/enquiry` visits as leads.
