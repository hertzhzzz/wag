# 01 — Industry qualified form surface

**What to build:** On the three priority industry pages (`av-lighting`, `construction`, `agricultural-machinery`), a visitor can complete a six-field qualified intake in place (full name, email, company, path intent, timeline, project brief; optional phone). Industry is attributed from the page slug, not retyped as a service label. Submit uses the existing enquiry API; only a Successful Enquiry fires conversion, then routes to thank-you with an enquiry id. Non-industry soft CTAs stay on the shallow three-field form and may still send `path_intent=not_provided`.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] Industry-page form collects the six required qualification fields plus optional phone
- [x] Industry attribution is the page industry slug; never “Supplier Verification”
- [x] Successful industry submits include real `pathIntent`, `timeline`, industry slug, and source path in the lead payload
- [x] Conversion fires only after Successful Enquiry with enquiry id; thank-you itself is non-converting
- [x] Non-industry embedded soft CTAs remain three-field and do not require path/timeline
- [x] Primary CTA copy on industry intake is “Discuss Your Sourcing Project”
- [x] Tests cover the lead-capture payload and successful-conversion seams for industry qualified values
