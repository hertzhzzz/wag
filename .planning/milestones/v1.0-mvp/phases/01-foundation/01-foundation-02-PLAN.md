---
phase: 01-foundation
plan: 02
type: execute
wave: 2
depends_on:
  - 01-foundation-01
files_modified:
  - frontend/app/components/Hero.tsx
  - frontend/app/components/StatsBar.tsx
  - frontend/app/components/HowItWorks.tsx
  - frontend/app/components/industries/index.tsx
  - frontend/app/components/industries/IndustryCard.tsx
  - frontend/app/components/FAQ.tsx
  - frontend/app/components/CTABand.tsx
  - frontend/app/components/Footer.tsx
autonomous: true
requirements:
  - RESP-01
  - RESP-05
  - TOUCH-01
  - TOUCH-02
  - TYPE-01
  - TYPE-02
  - TYPE-03
  - SPACE-01
  - SPACE-02
user_setup: []
must_haves:
  truths:
    - "Home page displays correctly on 320px width without horizontal scroll"
    - "All buttons have minimum 44px height on mobile"
    - "Body text is minimum 16px on mobile"
    - "Vertical spacing between blocks is 32-48px"
    - "Side padding is 16px on mobile"
  artifacts:
    - path: "frontend/app/components/Hero.tsx"
      provides: "Responsive hero with half-screen height on mobile"
    - path: "frontend/app/components/StatsBar.tsx"
      provides: "Stats grid: 2 columns on mobile, 4 on desktop"
    - path: "frontend/app/components/HowItWorks.tsx"
      provides: "5-step process responsive layout"
    - path: "frontend/app/components/industries/index.tsx"
      provides: "Industry selector: stacked on mobile, sidebar+panel on desktop"
    - path: "frontend/app/components/FAQ.tsx"
      provides: "Responsive FAQ accordion"
    - path: "frontend/app/components/CTABand.tsx"
      provides: "Responsive CTA section"
    - path: "frontend/app/components/Footer.tsx"
      provides: "Responsive footer with stacked columns"
  key_links:
    - from: "Hero.tsx"
      to: "StatsBar.tsx"
      via: "Page flow"
      pattern: "Vertical stacking with space-y-8 or py-12"
---
<objective>
Apply responsive layout patterns to all home page components: Hero, StatsBar, HowItWorks, Industries, FAQ, CTABand, and Footer.
</objective>

<execution_context>
@/Users/mark/.claude/get-shit-done/workflows/execute-plan.md
@/Users/mark/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/01-foundation/01-CONTEXT.md
@.planning/phases/01-foundation/01-RESEARCH.md

From prior plan SUMMARY (01-foundation-01):
- globals.css updated with overflow-x: hidden and touch target utilities
- Navbar.tsx mobile navigation implemented with slide-in panel, X button, overlay
</context>

<tasks>

<task type="auto">
  <name>Task 1: Make Hero responsive (half-screen, 16px padding, 44px buttons)</name>
  <files>frontend/app/components/Hero.tsx</files>
  <action>
    Update Hero component for mobile:

    1. Change min-h-[600px] to min-h-[50vh] md:min-h-[600px] - user locked decision for half-screen Hero
    2. Change px-6 lg:px-20 to px-4 md:px-6 lg:px-20 - 16px side padding on mobile (SPACE-02)
    3. Change text-sm to text-base - ensure body text minimum 16px (TYPE-01)
    4. Add min-h-11 to both buttons - 44px touch target (TOUCH-01)
    5. Keep existing clamp() for heading sizes - already responsive

    Per user locked decisions:
    - Hero height: 50-60vh on mobile
    - Side padding: 16px (px-4) on mobile
  </action>
  <verify>
    <automated>grep -q "min-h-\[50vh\]" frontend/app/components/Hero.tsx && grep -q "px-4" frontend/app/components/Hero.tsx</automated>
  </verify>
  <done>Hero responsive: 50vh on mobile, 600px on desktop, 16px padding, 44px button touch targets</done>
</task>

<task type="auto">
  <name>Task 2: Make StatsBar responsive (2-col mobile, 4-col desktop)</name>
  <files>frontend/app/components/StatsBar.tsx</files>
  <action>
    Update StatsBar component for mobile:

    1. Change grid-cols-4 to grid-cols-2 md:grid-cols-4 - 2 columns on mobile (RESP-01)
    2. Change px-12 to px-4 md:px-12 - 16px side padding on mobile (SPACE-02)
    3. Ensure vertical spacing with py-7 (already has padding)

    The stat items need to wrap properly on mobile - grid-cols-2 handles this.
  </action>
  <verify>
    <automated>grep -q "grid-cols-2 md:grid-cols-4" frontend/app/components/StatsBar.tsx</automated>
  </verify>
  <done>StatsBar responsive: 2 columns on mobile, 4 columns on desktop, 16px side padding</done>
</task>

<task type="auto">
  <name>Task 3: Make HowItWorks responsive with 44px button targets</name>
  <files>frontend/app/components/HowItWorks.tsx</files>
  <action>
    Update HowItWorks component for mobile:

    1. Change px-6 to px-4 md:px-6 - 16px side padding on mobile (SPACE-02)
    2. Add min-h-11 to both "View All Services" and "Industries We Cover" links/buttons (TOUCH-01)
    3. The grid-cols-1 md:grid-cols-5 is already correct - good!

    Note: The "See How It Works" link should also get min-h-11.
  </action>
  <verify>
    <automated>grep -q "px-4 md:px-6" frontend/app/components/HowItWorks.tsx && grep -q "min-h-11" frontend/app/components/HowItWorks.tsx</automated>
  </verify>
  <done>HowItWorks responsive: 16px side padding, 44px button touch targets</done>
</task>

<task type="auto">
  <name>Task 4: Make Industries section responsive (stacked on mobile)</name>
  <files>frontend/app/components/industries/index.tsx, frontend/app/components/industries/IndustryCard.tsx</files>
  <action>
    Update Industries component for mobile:

    1. Change px-10 to px-4 md:px-10 - 16px side padding on mobile (SPACE-02)
    2. Change grid-cols-[260px_1fr] to flex-col md:grid-cols-[260px_1fr] - sidebar+panel becomes stacked on mobile (RESP-01)

    For IndustryCard:
    1. Add min-h-11 to the clickable div for 44px touch target (TOUCH-01)
    2. On mobile: cards stack vertically with flex-col

    This transforms the sidebar+panel layout to stacked cards on mobile for thumb-friendly interaction.
  </action>
  <verify>
    <automated>grep -q "flex-col md:grid-cols-\[260px_1fr\]" frontend/app/components/industries/index.tsx && grep -q "min-h-11" frontend/app/components/industries/IndustryCard.tsx</automated>
  </verify>
  <done>Industries responsive: stacked on mobile, sidebar+panel on desktop, 44px touch targets</done>
</task>

<task type="auto">
  <name>Task 5: Make FAQ responsive with 44px button targets</name>
  <files>frontend/app/components/FAQ.tsx</files>
  <action>
    Update FAQ component for mobile:

    1. Change px-6 to px-4 md:px-6 - 16px side padding on mobile (SPACE-02)
    2. Add min-h-11 to the FAQ toggle button - 44px touch target (TOUCH-01)
    3. Ensure text-base for question text - 16px minimum (TYPE-01)

    The FAQ accordion should remain functional with adequate touch targets.
  </action>
  <verify>
    <automated>grep -q "px-4 md:px-6" frontend/app/components/FAQ.tsx && grep -q "min-h-11" frontend/app/components/FAQ.tsx</automated>
  </verify>
  <done>FAQ responsive: 16px side padding, 44px touch targets on accordion toggles</done>
</task>

<task type="auto">
  <name>Task 6: Make CTABand responsive with 44px button targets</name>
  <files>frontend/app/components/CTABand.tsx</files>
  <action>
    Update CTABand component for mobile:

    1. Change px-10 to px-4 md:px-10 - 16px side padding on mobile (SPACE-02)
    2. Add min-h-11 to both CTA buttons - 44px touch target (TOUCH-01)
    3. Ensure flex-wrap works properly for button stacking on small screens

    The flex-wrap and gap-4 already present should handle the layout gracefully.
  </action>
  <verify>
    <automated>grep -q "px-4 md:px-10" frontend/app/components/CTABand.tsx && grep -q "min-h-11" frontend/app/components/CTABand.tsx</automated>
  </verify>
  <done>CTABand responsive: 16px side padding, 44px button touch targets</done>
</task>

<task type="auto">
  <name>Task 7: Make Footer responsive with adequate side padding</name>
  <files>frontend/app/components/Footer.tsx</files>
  <action>
    Update Footer component for mobile:

    1. Change px-8 to px-4 md:px-8 - 16px side padding on mobile (SPACE-02)
    2. Ensure grid-cols-1 md:grid-cols-4 works - already present
    3. The gap-12 may need to reduce on mobile - change to gap-8 md:gap-12

    Footer links should remain easily tappable with adequate spacing.
  </action>
  <verify>
    <automated>grep -q "px-4 md:px-8" frontend/app/components/Footer.tsx</automated>
  </verify>
  <done>Footer responsive: 16px side padding, 4-column grid on desktop, stacked on mobile</done>
</task>

</tasks>

<verification>
- [ ] Hero: 50vh mobile, 600px desktop, px-4, min-h-11 buttons
- [ ] StatsBar: grid-cols-2 mobile, grid-cols-4 desktop, px-4
- [ ] HowItWorks: px-4, min-h-11 buttons, grid-cols-1 md:grid-cols-5
- [ ] Industries: flex-col mobile, grid-cols-[260px_1fr] desktop, px-4, min-h-11 cards
- [ ] FAQ: px-4, min-h-11 toggle buttons
- [ ] CTABand: px-4, min-h-11 buttons
- [ ] Footer: px-4, gap-8 md:gap-12
</verification>

<success_criteria>
- Home page displays correctly on 320px width (RESP-01)
- No horizontal scroll at 320px (RESP-05)
- All buttons minimum 44px height (TOUCH-01)
- 8px spacing between clickable elements (TOUCH-02)
- Body text minimum 16px on mobile (TYPE-01)
- Text readable without pinch-to-zoom (TYPE-02)
- Adequate line height on mobile (TYPE-03)
- Vertical spacing 32-48px between blocks (SPACE-01)
- Side padding 16px on mobile (SPACE-02)
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/01-foundation-02-SUMMARY.md`
</output>
