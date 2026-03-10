# WAG Website Responsive Improvements Roadmap

## Project Overview

**Core Value:** Improve mobile responsive layout for excellent UX on all devices (320px to 1920px+)

**Total v1 Requirements:** 19
**Granularity:** Fine (natural boundaries, 4 phases)

## Phases

- [ ] **Phase 1: Foundation** - Home page responsive + Global navigation
- [ ] **Phase 2: Content Pages** - Services + About pages responsive
- [ ] **Phase 3: Enquiry Form** - Mobile-optimized contact form
- [ ] **Phase 4: Resources + Testing** - Resources page + Full validation

---

## Phase Details

### Phase 1: Foundation

**Goal:** Establish responsive layout patterns on home page and fix global navigation for mobile

**Depends on:** Nothing (first phase)

**Requirements:** RESP-01, RESP-05, TOUCH-01, TOUCH-02, TOUCH-03, TYPE-01, TYPE-02, TYPE-03, NAV-01, NAV-02, NAV-03, SPACE-01, SPACE-02

**Success Criteria** (what must be TRUE):

1. Home page displays correctly on 320px width without horizontal scroll
2. Navigation menu opens/closes on mobile with hamburger button
3. All buttons are minimum 44px height on mobile
4. Clickable links have 8px minimum spacing between targets
5. Body text is minimum 16px on mobile without requiring pinch-to-zoom
6. Navigation has visible close mechanism (X button or tap outside)
7. All navigation links are easily tappable (minimum touch target met)
8. Vertical spacing prevents cramped feeling on small screens

**Plans:** 2 plans

- [ ] 01-foundation-01-PLAN.md — Global CSS + Mobile Navigation
- [ ] 01-foundation-02-PLAN.md — Home Page Responsive Components

---

### Phase 2: Content Pages

**Goal:** Apply responsive patterns to Services and About pages

**Depends on:** Phase 1

**Requirements:** RESP-02, RESP-03

**Success Criteria** (what must be TRUE):

1. Services page adapts to mobile screens (320px to 1920px+)
2. About page adapts to mobile screens (320px to 1920px+)
3. Touch targets remain adequate on Services page
4. Touch targets remain adequate on About page

**Plans:** TBD

---

### Phase 3: Enquiry Form

**Goal:** Ensure enquiry form is fully functional and usable on mobile devices

**Depends on:** Phase 2

**Requirements:** RESP-04, FORM-01, FORM-02, FORM-03

**Success Criteria** (what must be TRUE):

1. Enquiry form adapts to mobile screens (320px to 1920px+)
2. Form inputs are usable on mobile without keyboard covering the field
3. Form labels remain visible when input is focused on mobile
4. Submit button is easily accessible on mobile (not hidden behind keyboard)

**Plans:** TBD

---

### Phase 4: Resources + Testing

**Goal:** Complete responsive improvements on Resources page and perform full validation

**Depends on:** Phase 3

**Requirements:** (All v1 requirements already covered in phases 1-3 - final validation)

**Success Criteria** (what must be TRUE):

1. All 5 pages (Home, Services, About, Enquiry, Resources) work on mobile
2. No horizontal scroll on any page at 320px width
3. All touch targets meet 44px minimum on all pages
4. Navigation functions correctly across all pages on mobile

**Plans:** TBD

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 1/2 | In progress | 01-foundation-01 |
| 2. Content Pages | 0/TBD | Not started | - |
| 3. Enquiry Form | 0/TBD | Not started | - |
| 4. Resources + Testing | 0/TBD | Not started | - |

---

## Coverage

All 19 v1 requirements mapped to phases:

| Phase | Requirements |
|-------|--------------|
| 1 - Foundation | RESP-01, RESP-05, TOUCH-01, TOUCH-02, TOUCH-03, TYPE-01, TYPE-02, TYPE-03, NAV-01, NAV-02, NAV-03, SPACE-01, SPACE-02 |
| 2 - Content Pages | RESP-02, RESP-03 |
| 3 - Enquiry Form | RESP-04, FORM-01, FORM-02, FORM-03 |
| 4 - Resources + Testing | (Validation phase) |

**Total:** 19/19 requirements mapped ✓
