---
phase: quick
plan: "260323-qdm"
type: execute
wave: 1
depends_on: []
files_modified:
  - app/components/FAQ.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "FAQ section displays in 2-3 column grid on desktop"
    - "FAQ section displays in 1 column on mobile"
    - "Each FAQ item remains expandable via accordion"
  artifacts:
    - path: "app/components/FAQ.tsx"
      provides: "FAQ grid with accordion cards"
  key_links:
    - from: "app/components/FAQ.tsx"
      to: "app/data/faqs.ts"
      via: "import { faqs }"

---

<objective>
Refactor the homepage FAQ section from a single-column vertical accordion to a responsive 2-3 column grid card layout. 12 FAQs will display as cards in a grid (3 columns desktop, 2 tablet, 1 mobile), each card remains expandable on click.
</objective>

<context>
@app/components/FAQ.tsx
@app/data/faqs.ts (12 FAQ items)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Refactor FAQ to 2-3 column grid accordion</name>
  <files>app/components/FAQ.tsx</files>
  <action>
    Modify the FAQ component to use a responsive grid layout:

    1. Replace the single-column `space-y-4` wrapper with a grid:
       - `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`

    2. Wrap each FAQ item in a card container with:
       - `bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 h-full`
       - The button takes `flex-grow` to fill height
       - Answer section uses `flex-grow` to fill remaining space

    3. Keep existing accordion state logic (`openIndex` / `toggleFAQ`) unchanged

    4. Maintain existing styling:
       - Navy (#0F2D5E) for text and +/- icons
       - Amber accent on hover for visual feedback if desired
       - Section title and header remain unchanged

    5. Ensure consistent card heights by adding `flex flex-col` to each card wrapper, and `flex-grow` to the answer div so answers expand downward, not push cards down.

    DO NOT change: the data source, accordion behavior, section wrapper, or header styling.
  </action>
  <verify>npm run build --silent 2>&1 | tail -5</verify>
  <done>12 FAQ cards display in 3-column grid (desktop), 2-column (tablet), 1-column (mobile). Each card expands inline on click.</done>
</task>

</tasks>

<verification>
- `npm run build` passes
- FAQ section shows 3 columns on desktop viewport
- FAQ section shows 2 columns on tablet viewport
- FAQ section shows 1 column on mobile viewport
- Each card expands accordion on click without layout shift
</verification>

<success_criteria>
FAQ section refactored from single-column to grid layout with no breaking changes.
</success_criteria>

<output>
After completion, create `.planning/quick/260323-qdm-faq-12-accordion-2-3/260323-qdm-SUMMARY.md`
</output>
