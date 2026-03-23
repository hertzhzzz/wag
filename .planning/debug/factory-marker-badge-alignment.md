---
status: investigating
trigger: factory-marker-badge-alignment
created: 2026-03-22T00:00:00Z
updated: 2026-03-22T00:00:00Z
---

## Current Focus
hypothesis: Root cause identified - badge is intentionally positioned outside circle using absolute positioning. User wants number inside circle.
test: Review createFactoryIcon function
expecting: Find where badge positioning occurs
next_action: Document root cause and propose fix

## Symptoms
expected: Factory count number should appear inside the circular marker (centered or clearly visible within the circle)
actual: Numbers appear in a badge positioned outside the circle at top: -8px; right: -8px
errors: []
reproduction: View the directory map at / on the homepage
started: After redesign with brand colors (Amber background, Navy border)

## Eliminated

## Evidence
- timestamp: 2026-03-22
  checked: Lines 52-111 in DirectoryMapInner.tsx
  found: |
    The createFactoryIcon function creates a circular marker (lines 82-95) containing only an SVG factory icon.
    The badge is a SEPARATE div positioned OUTSIDE the circle (lines 59-76):
      position: absolute;
      top: -8px;
      right: -8px;
    This creates a badge element that hangs off the top-right corner of the circle.
  implication: The number appears in an external badge, not inside the circle where the user expects it.

- timestamp: 2026-03-22
  checked: Lines 96-104
  found: |
    The SVG icon is hardcoded to display a factory building graphic.
    There is no text content rendered inside the main circle div.
    The badge (which contains the number) is injected after the SVG via template literal.
  implication: To show number inside circle, we need to either replace SVG with text OR overlay text on top of SVG.

- timestamp: 2026-03-22
  checked: Badge visibility condition
  found: Badge only shows when isPrimary && factories > 10 (line 59)
  implication: Small factory counts don't show any number at all currently

## Resolution
root_cause: |
  The factory count number is rendered as a separate badge div positioned OUTSIDE the circular marker
  using absolute positioning (top: -8px; right: -8px). This is by design in the current implementation,
  but it causes the misalignment issue the user reports. The user's expected behavior is to have the
  number INSIDE the circle, centered with the factory icon.

fix: |
  Modify createFactoryIcon to render the factory count number INSIDE the circular div instead of
  as an external badge. Options:
  1. Replace the SVG icon entirely with large text showing the count (simpler, more prominent)
  2. Overlay text on top of the SVG icon using absolute positioning within the circle

  Recommended approach (Option 1 - cleaner visual):
  - When factories > 10 and isPrimary, show the number prominently inside the circle
  - Use font-size that scales with circle size
  - Remove the external badge HTML entirely
  - For non-primary markers or small counts, keep the SVG icon

verification: []
files_changed: []
