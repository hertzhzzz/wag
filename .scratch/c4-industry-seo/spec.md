# Spec: C4 Industry Intent SEO + dual-path collection

**Status:** ready-for-agent  
**Date:** 2026-07-15  
**Parent decisions:** grill session for AU qualified leads; ADR 0001; ADR 0002; architecture candidates C1–C6  
**Tracker:** local markdown under `.scratch/c4-industry-seo/`

## Problem Statement

Australian businesses searching for China sourcing in AV & lighting, construction, and agricultural machinery can already land on industry pages, but those pages sell the wrong primary offer. Titles and H1s promise sourcing; the body, process, and soft CTAs still centre supplier verification, factory audit, and quality inspection. Embedded Lead Forms stay shallow three-field capture and always send `path_intent=not_provided`, so industry visitors who are ready to find new suppliers never complete a qualified intake on the page that ranked. Homepage and services still under-signal the three priority industries and still over-weight verification as the main product. As a result, organic traffic cannot convert into enough **Qualified Leads**, and Successful Enquiries lack industry-page dual-path intent.

## Solution

Rewrite the three priority industry intent pages as dual-path China sourcing landings, with finding and vetting new suppliers primary and visiting or verifying an existing supplier secondary. On those pages, replace the shallow embedded Lead Form with an industry-scoped six-field qualified form that collects path intent and timeline, still fires conversion only after a Successful Enquiry, and attributes industry correctly. Lightly retune homepage and services so they introduce the same dual-path offer and deep-link into the three industries. Keep existing supplier-verification pages as secondary-path support content rather than deleting them or letting them own the primary sourcing intent.

## User Stories

1. As an Australian AV integrator, I want an industry page that helps me find and vet new China suppliers, so that I can start a real sourcing project rather than only a verification request.
2. As an Australian construction buyer with an existing factory contact, I want a clear secondary path to visit or verify that supplier, so that I can still convert without being forced into “find new”.
3. As an Australian farm-equipment buyer, I want agricultural-machinery-specific risks and proof, so that I trust the page is not a generic template.
4. As a procurement decision-maker, I want a main CTA of “Discuss Your Sourcing Project”, so that I am not pushed into a low-trust “free quote” funnel.
5. As a qualified prospect, I want to complete a six-field form on the industry page itself, so that I do not lose context by bouncing to a generic enquiry page first.
6. As a prospect, I want to choose find-new vs verify-existing, so that Winning Adventure Global can route the conversation correctly.
7. As a prospect, I want to state my timeline, so that near-term projects can be prioritised without blocking conversion.
8. As a prospect, I want to name my company and project brief, so that spam and pure browsers are filtered without asking for budget on first contact.
9. As a prospect, I want optional phone, so that I can be reached without making phone a barrier.
10. As a prospect, I want the industry pre-attributed from the page I am on, so that I do not reselect AV, construction, or agricultural machinery incorrectly.
11. As a prospect who submits successfully, I want a thank-you experience with a reference id, so that I know the request was received.
12. As a prospect, I do not want thank-you pageviews counted as leads, so that conversion metrics stay honest.
13. As a marketer, I want `generate_lead` only after Successful Enquiry, so that Ads and GA4 optimise on real enquiries.
14. As a marketer, I want industry-page Successful Enquiries to carry real `path_intent` and `timeline`, so that embedded industry leads are no longer stuck at `not_provided`.
15. As a marketer, I want industry attribution as a slug such as `av-lighting`, never as the service label “Supplier Verification”.
16. As an SEO owner, I want a shared title skeleton of “[Industry] China Sourcing for Australian Businesses”, so that commercial intent is consistent across the three pages.
17. As an SEO owner, I want differentiated H1s per industry, so that Google does not treat the three pages as near-duplicate doorways.
18. As an SEO owner, I want an eight-section body skeleton rewritten per industry, so that each page has unique commercial content and still shares conversion logic.
19. As an SEO owner, I want FAQ answers present in initial HTML, so that crawlers and users both see the answers without client-only expansion.
20. As an SEO owner, I want stable internal links from homepage and services into the three industries, so that the pages gain crawl paths and topical support.
21. As an SEO owner, I want services copy to present find-and-vet as primary and visit/verify as secondary, so that site-wide positioning matches the industry pages.
22. As an SEO owner, I want existing supplier-verification pages retained but demoted, so that secondary demand is kept without cannibalising primary sourcing queries.
23. As a content operator, I want AV rewritten first, then construction, then agricultural machinery, so that the paid-path template is proven before the harder rewrite.
24. As a developer, I want one enquiry API and one conversion seam reused, so that C4 does not invent a second lead pipeline.
25. As a developer, I want qualification enums single-sourced, so that industry-page forms and `/enquiry` cannot drift.
26. As a developer, I want payload builders to own request body shape, so that UI components do not hardcode attribution.
27. As a developer, I want tests at the payload, conversion, and industry content seams, so that regressions are caught without snapshotting entire pages.
28. As a sales operator, I want enquiry emails to show path intent, timeline, industry, and source path, so that follow-up can start without re-asking basics.
29. As a business owner, I want the 90-day north star to remain Qualified Leads, not raw sessions, so that SEO work is judged commercially.
30. As a business owner, I want out-of-scope work kept out of this build, so that C4 ships dual-path collection and positioning without becoming a full-site redesign.

## Implementation Decisions

1. **Scope of this spec (C4 core + light site alignment)**  
   - In scope: three industry intent pages (`av-lighting`, `construction`, `agricultural-machinery`); industry-page dual-path qualified collection; homepage and services light retune; verification pages demoted in positioning and internal linking.  
   - Explicitly later / not this build: full 4–12 week support-article cluster production, C5 CTA entry indirection (`/enquiry?context=` routing matrix), full C6 public-rendering programme beyond what industry rewrites require, bidding strategy changes, blog mass cleanup, mobile LCP overhaul.

2. **Reuse existing conversion law (ADR 0001)**  
   - Only a Successful Enquiry may fire `generate_lead`, Google Ads form conversion, and Meta Lead.  
   - Same `trackSuccessfulEnquiry` interface; no second analytics module.  
   - Thank-you remains non-converting.

3. **Extend, do not replace, C3 qualification (ADR 0002)**  
   - C3 already upgraded the Enquiry Page Form.  
   - C4 upgrades **industry-page collection** to the same six required qualification fields while keeping non-industry soft CTAs shallow unless a page is one of the three target industries.  
   - `path_intent` remains procurement intent (`find_new` | `verify_existing`), never travel vs remote.  
   - `engagement_mode` remains educational copy only.

4. **Industry-page form surface**  
   - On the three target industry pages, the embedded form becomes a qualified industry intake, not the three-field Lead Form.  
   - Required: fullName, email, company, pathIntent, timeline, lookingFor.  
   - Optional: phone.  
   - Industry is page-context attribution from the industry slug, not a free-text service name.  
   - Primary CTA label: `Discuss Your Sourcing Project`.  
   - Submit stays on one `POST /api/enquiry`; after success, fire conversion then route to the existing thank-you experience with optional enquiry id.

5. **Lead Capture Payload deepening**  
   - Prefer extending the existing payload module so industry-page qualified values produce camelCase `pathIntent` / `timeline` plus industry slug and source path.  
   - Non-industry embedded Lead Forms may continue to omit path/timeline and therefore analytics `path_intent=not_provided`.  
   - Never hardcode industry as “Supplier Verification”.

6. **Successful Conversion Analytics**  
   - Industry-page Successful Enquiries must send real `path_intent` and optional `timeline` through the existing conversion payload.  
   - `form_type` remains `embedded` for on-page industry forms unless a later C5 decision changes the surface taxonomy; do not invent a third form_type in this spec without a glossary update.

7. **Industry Intent Page content model**  
   - Shared title skeleton: `[Industry] China Sourcing for Australian Businesses`.  
   - Differentiated H1s per industry; do not clone the title into every H1.  
   - Eight-section skeleton, each section rewritten with industry-specific copy:  
     1. Who this is for  
     2. Two paths  
     3. What we deliver (and explicit non-claims)  
     4. Industry-specific proof / risks / standards  
     5. How engagement works  
     6. What you need before contacting us  
     7. FAQ (answers in HTML)  
     8. Final CTA + qualified form  
   - Delivery claims limited to: find, shortlist, due diligence, visit planning, on-ground coordination.  
   - Do not claim: placing orders, paying suppliers, commercial negotiation, quality inspection as the primary offer, international freight/customs, turnkey installation.

8. **Rewrite order**  
   - AV & lighting first (proven paid path).  
   - Construction second.  
   - Agricultural machinery third.

9. **Homepage + services light retune**  
   - Homepage primary promise: China sourcing for Australian businesses, with visible entries to the three industries.  
   - Services primary offer: find and vet suppliers in China; visit/verify secondary.  
   - Stable SSR-friendly internal links into the three industry URLs.  
   - No full visual redesign or nav IA rebuild in this spec.

10. **Verification pages demotion**  
    - Keep `/supplier-verification` and related support pages live.  
    - Reposition them as a step inside the sourcing journey / secondary path.  
    - Primary commercial queries for China sourcing and find-suppliers belong to homepage, services, and the three industry pages.  
    - No merge/301 of verification pages in this spec.

11. **i18n / language rules**  
    - Public SEO copy remains English.  
    - Any new form labels needed for industry qualified collection update English and Chinese dictionaries together if the form uses the i18n system.  
    - Visible brand name is always “Winning Adventure Global”, never “WAG”.

12. **Out-of-band measurement constraints**  
    - GA4 property remains Winning Adventure Global `526384627` / `G-VEGJ1YL8YR`.  
    - Do not use Footy Tonight property for acceptance.  
    - Ads primary conversion remains website Successful Enquiry / `generate_lead`; do not reintroduce pageview conversions.

## Testing Decisions

1. **Good tests assert external behaviour**, not private React structure or exact Tailwind class strings.
2. **Primary seams (preferred existing seams, no new parallel systems):**  
   - **Lead Capture Payload** — request body for industry qualified collection includes path intent, timeline, company, industry slug, source path; rejects service-label industry pollution.  
   - **Successful Conversion Analytics** — after Successful Enquiry from an industry page, conversion payload includes real path intent/timeline and never fires on render alone.  
   - **Industry Intent Page content/data** — title skeleton, differentiated H1 source data, dual-path primary/secondary positioning, CTA label, and section skeleton can be verified from the industry data/module outputs rather than browser-only inspection.
3. **Prior art:** existing `lead-form-payload` tests, `analytics` Successful Enquiry tests, `enquiry-qualification` enum tests, and schema/content assertions already used for commercial pages.
4. **API seam:** continue allowlist validation for present pathIntent/timeline values; missing values remain valid for shallow Lead Forms.
5. **Manual acceptance after code:** one production-like industry-page submit producing thank-you + enquiryId + GA4 `generate_lead` with industry slug and path intent; homepage/services expose links to all three industries.

## Out of Scope

- Creating a fourth industry vertical.
- Full support-article production for the 4–12 week cluster phase.
- C5 generic CTA-entry router / deep context matrix beyond what the industry form needs.
- Broad C6 rendering refactors unrelated to industry dual-path delivery.
- Changing Ads bidding strategy away from current setup.
- Restoring pageview or Google-hosted lead-form as primary conversion.
- Public pricing, Chinese-index pages, factory detail pages, or GBP/offsite SEO.
- Claiming negotiation, QC, freight, or turnkey installation as primary deliverables.
- Full homepage/services redesign or mega-menu rebuild.
- Re-grilling qualified-lead definition unless business scope changes.

## Further Notes

- Business KPI remains Qualified Lead volume quality, not raw traffic. Near-term baseline from grill: 8 real enquiries / 3 qualified / 1 closed in prior 90 days; target direction is roughly double qualified volume while keeping attribution trustworthy.
- Architecture order already executed for measurement: C2 conversion → C1 payload minimum → C3 enquiry-page qualified intake. This spec is the C4 industry intent + dual-path collection slice, with light homepage/services alignment required so the site does not contradict the new pages.
- Prefer local tracker files under `.scratch/c4-industry-seo/` for tickets; implement one unblocked ticket per fresh context window.
