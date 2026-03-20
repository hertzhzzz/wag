---
phase: 01-foundation
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/app/globals.css
  - frontend/app/layout.tsx
  - frontend/app/components/Navbar.tsx
autonomous: true
requirements:
  - RESP-05
  - TOUCH-01
  - TOUCH-02
  - TOUCH-03
  - TYPE-02
  - NAV-01
  - NAV-02
  - NAV-03
  - SPACE-01
  - SPACE-02
user_setup: []
must_haves:
  truths:
    - "No horizontal scroll on home page at 320px width"
    - "Viewport meta configured for mobile (readable without pinch-to-zoom)"
    - "Mobile navigation menu opens with hamburger button"
    - "Mobile navigation menu closes with X button AND overlay tap"
    - "All navigation links have 44px minimum touch target"
    - "Vertical spacing between blocks is 32-48px"
  artifacts:
    - path: "frontend/app/layout.tsx"
      provides: "Viewport meta for mobile rendering (TYPE-02)"
    - path: "frontend/app/globals.css"
      provides: "Global overflow prevention and touch target utilities"
    - path: "frontend/app/components/Navbar.tsx"
      provides: "Mobile slide-in navigation with both close mechanisms"
      exports: ["Navbar component with mobileMenuOpen state"]
  key_links:
    - from: "Navbar.tsx"
      to: "globals.css"
      via: "Touch target classes applied"
      pattern: "min-h-11"
---
<objective>
Establish global CSS foundation for responsive design and implement mobile navigation with slide-in panel, X button, and overlay close mechanism.
</objective>

<execution_context>
@/Users/mark/.claude/get-shit-done/workflows/execute-plan.md
@/Users/mark/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/01-foundation/01-CONTEXT.md
@.planning/phases/01-foundation/01-RESEARCH.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add viewport meta to layout.tsx</name>
  <files>frontend/app/layout.tsx</files>
  <action>
    Add viewport export to layout.tsx to ensure proper mobile rendering (TYPE-02):

    Add after the metadata export:
    ```typescript
    export const viewport = {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 1,
    }
    ```

    This ensures the page is readable without pinch-to-zoom (TYPE-02).
  </action>
  <verify>
    <automated>grep -q "export const viewport" frontend/app/layout.tsx</automated>
  </verify>
  <done>Viewport meta configured for proper mobile rendering</done>
</task>

<task type="auto">
  <name>Task 2: Add global CSS foundation for responsive design</name>
  <files>frontend/app/globals.css</files>
  <action>
    Add the following to globals.css to prevent horizontal scroll and provide touch target utilities:

    ```css
    body {
      overflow-x: hidden;
      max-width: 100vw;
    }

    /* Prevent horizontal overflow on all elements */
    * {
      max-width: 100%;
    }

    /* Touch target utility - 44px minimum */
    .touch-target {
      min-height: 44px;
      min-width: 44px;
    }

    /* Mobile-first base typography */
    body {
      font-size: 16px; /* TYPE-01: 16px minimum */
      line-height: 1.6; /* TYPE-03: Adequate line height */
    }
    ```
  </action>
  <verify>
    <automated>grep -q "overflow-x: hidden" frontend/app/globals.css && grep -q "min-height: 44px" frontend/app/globals.css</automated>
  </verify>
  <done>Horizontal scroll prevented, touch target utility available</done>
</task>

<task type="auto">
  <name>Task 3: Implement mobile navigation with slide-in panel</name>
  <files>frontend/app/components/Navbar.tsx</files>
  <action>
    Rebuild Navbar.tsx mobile menu to implement:

    1. Add X import from lucide-react
    2. Add handleLinkClick function that closes menu on navigation
    3. Mobile hamburger button: add min-h-11 min-w-11 for 44px touch target (TOUCH-01)
    4. Add overlay (fixed inset-0 bg-black/50) with onClick to close (NAV-02)
    5. Add slide-in panel (fixed right-0, w-64, translate-x transition)
    6. Add X close button in panel header with min-h-11 min-w-11
    7. Navigation links: vertical flex-col, gap-2 (8px spacing - TOUCH-02), each link min-h-11 px-4 (TOUCH-03)
    8. Link onClick calls handleLinkClick to close menu and navigate

    Use these classes per user locked decisions:
    - Slide animation: slide-in from right (translate-x-full to translate-x-0)
    - Close mechanism: X button + click overlay (both required)
    - Link layout: vertical list
    - Touch target: 44x44px minimum
  </action>
  <verify>
    <automated>grep -q "translate-x-0" frontend/app/components/Navbar.tsx && grep -q "min-h-11" frontend/app/components/Navbar.tsx</automated>
  </verify>
  <done>Mobile navigation has slide-in panel, X button, overlay close, 44px touch targets</done>
</task>

</tasks>

<verification>
- [ ] globals.css has overflow-x: hidden
- [ ] Navbar has mobile slide-in menu with translate-x transition
- [ ] X button present and functional
- [ ] Overlay present and closes menu on click
- [ ] All mobile links have min-h-11 (44px)
- [ ] Mobile links have gap-2 (8px) spacing
</verification>

<success_criteria>
- No horizontal scroll at 320px viewport (RESP-05)
- Viewport meta configured (TYPE-02)
- Mobile navigation opens/closes properly (NAV-01)
- Navigation has X button AND overlay close (NAV-02)
- All mobile nav links 44px minimum (NAV-03, TOUCH-01)
- 8px spacing between mobile nav links (TOUCH-02)
- Mobile nav is thumb-friendly layout (TOUCH-03)
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/01-foundation-01-SUMMARY.md`
</output>
