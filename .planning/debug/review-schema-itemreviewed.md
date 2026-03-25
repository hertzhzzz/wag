---
status: resolved
trigger: "Google Search Console error: Invalid object type for field 'itemReviewed'"
created: 2026-03-25T00:00:00+10:00
updated: 2026-03-25T00:00:00+10:00
---

## Current Focus
hypothesis: "Service" type is not supported for itemReviewed in Google's Review rich results
test: Change itemReviewed from Service to LocalBusiness
expecting: Build passes and schema is valid
next_action: Apply fix to ReviewSchema.tsx

## Symptoms
expected: Review schema with itemReviewed should be valid for Google rich results
actual: Google Search Console reports "Invalid object type for field 'itemReviewed'"
errors: ["Invalid object type for field 'itemReviewed'"]
reproduction: Submit site to Google Search Console rich results test
started: Unknown (discovered via Search Console)

## Eliminated
<!-- empty -->

## Evidence
- timestamp: 2026-03-25
  checked: app/components/ReviewSchema.tsx
  found: itemReviewed uses "@type": "Service"
  implication: Service is not in Google's supported list for Review schema

## Resolution
root_cause: "Service" is not a supported type for itemReviewed in Google's Review rich results schema
fix: Change itemReviewed "@type" from "Service" to "LocalBusiness" and update fields accordingly
verification: npm run build passes, npm run lint passes
files_changed: [app/components/ReviewSchema.tsx]
