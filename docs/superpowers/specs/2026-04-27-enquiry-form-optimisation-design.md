# Enquiry Form Optimisation — Design Spec

**Date:** 2026-04-27
**Status:** Approved
**Owner:** WAG Frontend

---

## 1. Concept & Vision

The enquiry page is the primary conversion point for WAG's website. The goal is to remove friction that causes users to abandon mid-form and to fix bugs that result in incomplete or failed submissions. The page should feel like a quick, low-commitment conversation starter — not a formal intake form.

---

## 2. Changes

### 2.1 Form Fields — Reduce to 3 Required Fields

**Keep:**
- `fullName` — required, text input
- `email` — required, email input
- `lookingFor` — required, textarea (renamed label to "What do you need?")

**Remove:**
- `companyName` — removed from UI and API schema. Business name can be asked in email follow-up.
- `industry` and `customIndustry` — removed from UI and API schema. Product category can be inferred from `lookingFor` content.
- `sourcingType` — removed from UI and API schema. This was a bug (the field was submitted but silently dropped by the API). Lead qualification can happen via email follow-up.

**API schema update (`app/api/enquiry/route.ts`):**
- Remove `companyName` (was required)
- Remove `industry` and `customIndustry` (was required)
- Remove `sourcingType` (was never in schema but existed in UI — bug fix)
- `lookingFor` label changes to "What do you need?" (no schema change)

### 2.2 Page Layout — Single-Column, Form-First

**Desktop:** Form is single-column, centred, max-width 600px. No two-column layout.

**Mobile:** Same single-column. No left/right split.

**"Book a Call" demoted to secondary link:**
- Removed from two-column layout
- Added below form as text link: "Prefer to talk? Book a call →"
- Calendly widget component removed entirely from this page
- Calendly tab selector (mobile) also removed — replaced with just the form
- This removes the Calendly script from page load, improving performance

### 2.3 Trust Signals — Repositioned

The trust stats bar ("Verified / 4hrs / $0") and the two process path cards remain but are **moved above the form**, before the user sees the fields. This sets expectations before asking for input.

**New section order (top to bottom):**
1. Hero (headline + subtext) — unchanged
2. What Happens Next (two path cards) — moved up, unchanged content
3. Trust stats bar — moved up above form
4. Form (3 fields only)
5. "Prefer to talk?" link
6. FAQ accordion
7. Contact info

### 2.4 Form UX Improvements

**Inline validation on blur:**
- When a user leaves a required field and it's empty, show error immediately
- Errors clear as soon as the user starts typing (not just on submit)
- On submit attempt, all empty required fields show errors simultaneously

**Submit button:**
- Text: "Submit Enquiry →"
- During submission: "Sending…"
- On error: inline error message above button, form stays filled in

**Success state:**
- Full-panel success confirmation (existing behaviour, kept)
- Success message unchanged

### 2.5 Bug Fixes

**`app/enquiry/metadata.ts`** — Fix wrong title/description
- Current: "China Sourcing Agent for Australian Businesses" (copied from homepage)
- Correct: "Contact WAG | Request a Free Discovery Call" (already correct in `page.tsx` metadata, just delete `metadata.ts` if it's redundant, or overwrite with correct content)

**`app/enquiry/layout.tsx`** — Remove duplicate metadata export
- The layout exports its own `Metadata` object with title "Book a Factory Tour | Free Consultation" which conflicts with page-level metadata
- Remove the metadata export from `layout.tsx` — only `page.tsx` should export metadata for this route

**`app/api/enquiry/route.ts`** — Remove `sourcingType` handling from email template (was never passed, but clean up any references)

### 2.6 Component Changes

**`EnquiryForm.tsx`** — Significant refactor
- Remove: `selectedContact` state, mobile tab selector
- Remove: `KeyboardAwareInput` instances for removed fields
- Remove: `sourcingType` radio group
- Remove: Calendly widget and `CalendlyWidget` component
- Add: `onBlur` validation per field
- Add: "Prefer to talk?" link below submit button
- Layout: single-column, centred, max-w-[600px]

**`KeyboardAwareInput.tsx` and `KeyboardAwareTextarea.tsx`** — Kept, used by remaining fields

---

## 3. Implementation Notes

### Files to Modify

| File | Change |
|------|--------|
| `app/enquiry/EnquiryForm.tsx` | Major refactor — remove fields, layout, validation |
| `app/enquiry/metadata.ts` | Fix or delete — wrong meta |
| `app/enquiry/layout.tsx` | Remove duplicate metadata export |
| `app/api/enquiry/route.ts` | Remove `companyName`, `industry`, `customIndustry` from Zod schema; update email HTML template |
| `app/enquiry/page.tsx` | No changes needed (metadata already correct here) |

### API Schema Change

```typescript
// Before
const enquirySchema = z.object({
  fullName: z.string().min(1).max(100),
  companyName: z.string().min(1).max(200),   // REMOVE
  email: z.string().email(),
  phone: z.string().optional(),
  industry: z.string().min(1).max(100),       // REMOVE
  customIndustry: z.string().optional(),        // REMOVE
  lookingFor: z.string().min(1).max(5000),
})

// After
const enquirySchema = z.object({
  fullName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  lookingFor: z.string().min(1).max(5000),
})
```

### Email Template Update

Remove `companyName`, `industry`, `customIndustry` rows from the HTML email table. Keep: Full Name, Email, Phone (optional), What They're Looking For.

---

## 4. Testing Checklist

- [ ] Form submits successfully with only 3 fields
- [ ] Inline validation shows errors on blur for empty required fields
- [ ] Submit error (e.g. rate limit) shows inline error, form retains values
- [ ] Success state displays after successful submission
- [ ] "Book a call" link points to Calendly URL
- [ ] Page loads without Calendly script on initial page load
- [ ] `metadata.ts` title matches "Contact WAG | Request a Free Discovery Call"
- [ ] `layout.tsx` does not export conflicting metadata
- [ ] API rejects empty `fullName`, `email`, `lookingFor`
- [ ] API accepts valid submission
- [ ] Rate limiting still works
- [ ] FAQ accordion still expands/collapses
- [ ] Mobile layout (single column) looks correct
- [ ] Desktop layout (centred, 600px max) looks correct
