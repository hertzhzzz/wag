# Winning Adventure Global — Domain Context

Glossary for the website conversion and industry-landing systems. Architecture reviews and ADRs should use these terms.

## Core commercial terms

**Qualified Lead** — An enquiry from Australia (or clearly AU-bound business intent), representing a real business or defined venture, planning China sourcing or supplier verification, intending to act within about 6 months, willing to pay for professional services, and made by a decision-maker. Product/KPI target is qualified leads, not raw traffic.
_Avoid_: raw lead, form fill, traffic conversion

**Successful Enquiry** — A form submission that the server has accepted and for which the enquiry email path has completed successfully. Only a Successful Enquiry may be counted as a conversion lead in analytics.
_Avoid_: form submit (process event), generate_lead without server success

**generate_lead** — The single GA4 event that means “real lead”. Fired only after a Successful Enquiry. Pageviews of `/enquiry`, CTA clicks, and failed submits must never fire `generate_lead`.

**form_submit** — Process event that a form completed a successful submit path. Useful for debugging. KPI and ad conversion must not use `form_submit` as the lead definition.

**enquiryId** — Server-generated opaque id for a Successful Enquiry (`enq_<uuid>`). Returned to the client, used for analytics dedupe and operational matching. Never contains PII.

## Form surfaces

**Enquiry Page Form** — The full intake form on `/enquiry`. C3 target: six required qualification fields plus optional phone and industry. Primary place to collect `path_intent` and `timeline`.

**Lead Form** — The three-field embedded soft CTA (name, email, need). Used on industry landings, service pages, and hero. Remains shallow capture; does not collect `path_intent` in C3.
_Avoid_: treating Lead Form as the qualified intake form

**Thank-you Page** — Post-success page at `/enquiry/thank-you` after Enquiry Page Form submit. May display `enquiryId` for operational reference. Does not fire lead or conversion events.
_Avoid_: counting thank-you pageviews as leads

## Qualification fields (Enquiry Page Form)

**path_intent** — Buyer procurement intent on the form (who/what they need in China):
- `find_new` — find and vet new suppliers in China
- `verify_existing` — visit or verify an existing supplier
- `not_provided` — field not collected (Lead Form and pre-C3 behaviour; must not remain on Enquiry Page Form after C3)
_Avoid_: using path_intent for travel vs remote delivery; calling both “path” without qualifier

**engagement_mode** — How work is delivered with the client (travel-assisted factory visits vs remote verification). Educational copy on `/enquiry` may describe this; it is **not** collected as a form field in C3 and must not reuse the `path_intent` field.
_Avoid_: conflating with path_intent

**timeline** — Stated window for taking action on the China sourcing or verification project:
- `0-3_months` — Within 3 months
- `3-6_months` — 3–6 months
- `6plus_months` — More than 6 months
- `exploring` — Still exploring
_Avoid_: free-text “when”, vague urgency labels without enum

**company** — Organisation or named venture the enquirer represents. Required on Enquiry Page Form; optional/absent on Lead Form.

**lookingFor** — Free-text project brief: what they need from China sourcing or verification.
_Avoid_: requirements dump of PII-heavy secrets in analytics payloads

**industry** — Industry slug or normalized industry value for attribution (e.g. `av-lighting`, `construction`). Must never be a service name such as “Supplier Verification”. Optional on Enquiry Page Form in C3; page-context attribution on industry landings for Lead Form.
_Avoid_: service name as industry

**sourcePath** — Page path where the submit happened (e.g. `/industries/av-lighting`, `/enquiry`). Operational attribution for email/CRM; also backs `page_path` in analytics.

**form_type** — Where the successful form lived:
- `embedded` — in-page Lead Form
- `enquiry_page` — the `/enquiry` page form

## Modules (architecture vocabulary)

**Successful Conversion Analytics module** — Deepens lead measurement: one interface (`trackSuccessfulEnquiry`) delivers GA4 `generate_lead`, Google Ads form conversion, and Meta Lead after API success, with session dedupe on `enquiryId`.

**Lead Capture Payload module** — Builds the enquiry request body from form values + page context so UI components do not hardcode attribution. Includes shallow Lead Form payloads and Enquiry Page Form payloads (`pathIntent`, `timeline`, required `company` on that surface). Qualification enums are single-sourced for UI and API validation.

## Related decisions

- ADR: `docs/adr/0001-successful-enquiry-conversion.md` — Successful Enquiry conversion measurement
- ADR: `docs/adr/0002-enquiry-page-qualified-intake.md` — Enquiry Page qualified intake (C3)
- Supersedes: `docs/superpowers/specs/2026-04-27-enquiry-form-optimisation-design.md` (shrink-to-3-fields / drop industry) for conversion and qualification direction
