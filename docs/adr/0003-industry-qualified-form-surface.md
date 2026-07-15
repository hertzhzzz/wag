# ADR 0003: Industry Qualified Form surface (C4)

**Status:** Accepted  
**Date:** 2026-07-15  
**Parent:** ADR 0001, ADR 0002; `.scratch/c4-industry-seo/spec.md`

## Context

Industry intent pages used the three-field Lead Form and always sent `path_intent=not_provided`. C3 already upgraded `/enquiry`. C4 needs qualified dual-path collection on the three priority industry pages without inventing a second enquiry pipeline or a third `form_type`.

## Decision

1. On industry intent pages, replace Lead Form with **Industry Qualified Form** (six required fields + optional phone).
2. Industry is page-context attribution from the industry slug; never a service label such as “Supplier Verification”.
3. Reuse `buildEnquiryPagePayload` + qualification enums; expose a thin `buildIndustryQualifiedIntake` seam that also builds the embedded conversion attributes (`form_type=embedded`, real `pathIntent`/`timeline`).
4. Conversion still fires only via `trackSuccessfulEnquiry` after Successful Enquiry; then route to `/enquiry/thank-you`.
5. Non-industry soft CTAs keep the shallow Lead Form.

## Consequences

- Industry-page Successful Enquiries carry real path intent and timeline for GA4/Ads attribution.
- Content rewrites (tickets 02–04) can land on a working qualified conversion surface.
- `form_type` remains `embedded | enquiry_page`; no third surface taxonomy in this ADR.
