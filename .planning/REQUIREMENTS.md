# Requirements: WAG Website Improvements

**Defined:** 2026-03-11
**Core Value:** Improve mobile responsive layout for excellent UX on all devices

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Responsive Layout

- [x] **RESP-01**: Home page adapts to mobile screens (320px to 1920px+)
- [ ] **RESP-02**: Services page adapts to mobile screens
- [ ] **RESP-03**: About page adapts to mobile screens
- [ ] **RESP-04**: Enquiry form page adapts to mobile screens
- [x] **RESP-05**: No horizontal scroll on any page at 320px width

### Touch Targets

- [x] **TOUCH-01**: All buttons have minimum 44px height
- [x] **TOUCH-02**: All clickable links have adequate touch spacing (8px minimum between targets)
- [x] **TOUCH-03**: Navigation menu is thumb-friendly on mobile

### Typography

- [x] **TYPE-01**: Body text is minimum 16px on mobile
- [x] **TYPE-02**: Text is readable without pinch-to-zoom
- [x] **TYPE-03**: Line height provides adequate breathing room on mobile

### Forms

- [ ] **FORM-01**: Enquiry form inputs are usable on mobile without keyboard issues
- [ ] **FORM-02**: Form labels remain visible when input is focused on mobile
- [ ] **FORM-03**: Submit button is easily accessible on mobile

### Navigation

- [x] **NAV-01**: Mobile navigation menu opens and closes properly
- [x] **NAV-02**: Navigation has clear close mechanism
- [x] **NAV-03**: All navigation links are easily tappable on mobile

### Spacing

- [x] **SPACE-01**: Adequate vertical spacing on mobile layouts
- [x] **SPACE-02**: Padding prevents content from feeling cramped on small screens

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Performance

- **PERF-01**: Images use modern formats (WebP/AVIF)
- **PERF-02**: Lazy loading implemented for below-fold images
- **PERF-03**: srcset implemented for responsive images

### Accessibility

- **A11Y-01**: Dark mode support with toggle
- **A11Y-02**: Reduced motion respects user system preferences
- **A11Y-03**: Focus states are visible for keyboard navigation

### Advanced Patterns

- **ADV-01**: Container queries for reusable components
- **ADV-02**: Foldable device support

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| New page creation | Focus on improving existing pages |
| Design system changes | Keep existing Navy (#0F2D5E) + Amber (#F59E0B) colors |
| Backend/API changes | No database or server changes needed |
| Content addition | Existing content remains as-is |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| RESP-01 | Phase 1 | Complete |
| RESP-02 | Phase 2 | Pending |
| RESP-03 | Phase 2 | Pending |
| RESP-04 | Phase 3 | Pending |
| RESP-05 | Phase 1 | Complete |
| TOUCH-01 | Phase 1 | Complete |
| TOUCH-02 | Phase 1 | Complete |
| TOUCH-03 | Phase 1 | Complete |
| TYPE-01 | Phase 1 | Complete |
| TYPE-02 | Phase 1 | Complete |
| TYPE-03 | Phase 1 | Complete |
| FORM-01 | Phase 3 | Pending |
| FORM-02 | Phase 3 | Pending |
| FORM-03 | Phase 3 | Pending |
| NAV-01 | Phase 1 | Complete |
| NAV-02 | Phase 1 | Complete |
| NAV-03 | Phase 1 | Complete |
| SPACE-01 | Phase 1 | Complete |
| SPACE-02 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 19
- Complete: 13

---
*Requirements defined: 2026-03-11*
*Last updated: 2026-03-11 after 01-foundation-02 plan completion*
