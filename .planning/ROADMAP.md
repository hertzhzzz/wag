# WAG Website Responsive Improvements Roadmap

## Project Overview

**Core Value:** Improve mobile responsive layout for excellent UX on all devices (320px to 1920px+)

**Total v1 Requirements:** 19
**Granularity:** Fine (natural boundaries, 4 phases)

## Phases

- [x] **Phase 1: Foundation** - Home page responsive + Global navigation
- [x] **Phase 2: Content Pages** - Services + About pages responsive
- [x] **Phase 3: Global UI Audit + Mobile Adaptation** - Comprehensive UI audit across all pages and fix mobile responsive issues
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

**Plans:** 2/2 plans complete

- [x] 01-foundation-01-PLAN.md — Global CSS + Mobile Navigation
- [x] 01-foundation-02-PLAN.md — Home Page Responsive Components

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

**Plans:** 1/1 plans complete

- [x] 02-01-PLAN.md — Services + About pages responsive

---

### Phase 3: Global UI Audit + Mobile Adaptation

**Goal:** Perform comprehensive UI audit across all pages and fix mobile responsive issues

**Depends on:** Phase 2

**Requirements:** RESP-04, FORM-01, FORM-02, FORM-03

**Success Criteria** (what must be TRUE):

1. All pages (Home, Services, About, Enquiry, Resources) have consistent mobile layout
2. No horizontal scroll at 320px width on any page
3. All touch targets meet 44px minimum
4. Navigation works correctly on all mobile pages
5. Forms are usable on mobile (keyboard doesn't cover inputs)

**Plans:** 6/6 plans complete

- [x] 03-ui-audit-01-PLAN.md — Test infrastructure setup (Playwright + browser-use)
- [x] 03-ui-audit-02-PLAN.md — Enquiry form mobile keyboard fixes
- [x] 03-ui-audit-03-PLAN.md — Form validation tests (FORM-01, FORM-02, FORM-03)
- [x] 03-ui-audit-04-PLAN.md — Comprehensive all-pages audit
- [x] 03-ui-audit-05-PLAN.md — Fix enquiry form 500 error (gap closure)
- [ ] 03-ui-audit-06-PLAN.md — Fix mobile navbar sticky + verify enquiry

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

**Plans:** 2/3 plans executed

- [x] 04-01-PLAN.md — Resources page responsive fixes (4 issues)
- [x] 04-02-PLAN.md — Resources page validation test
- [ ] 04-03-PLAN.md — Full site mobile validation

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete    | 2026-03-10 |
| 2. Content Pages | 1/1 | Complete    | 2026-03-11 |
| 3. Global UI Audit + Mobile Adaptation | 6/6 | Complete    | 2026-03-17 |
| 4. Resources + Testing | 2/3 | In Progress | - |

---

## Coverage

All 19 v1 requirements mapped to phases:

| Phase | Requirements |
|-------|--------------|
| 1 - Foundation | RESP-01, RESP-05, TOUCH-01, TOUCH-02, TOUCH-03, TYPE-01, TYPE-02, TYPE-03, NAV-01, NAV-02, NAV-03, SPACE-01, SPACE-02 |
| 2 - Content Pages | RESP-02, RESP-03 |
| 3 - Global UI Audit + Mobile Adaptation | RESP-04, FORM-01, FORM-02, FORM-03 |
| 4 - Resources + Testing | (Validation phase) |

**Total:** 19/19 requirements mapped ✓
