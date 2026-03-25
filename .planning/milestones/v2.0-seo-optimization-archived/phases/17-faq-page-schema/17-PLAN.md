---
phase: 17-faq-page-schema
plan: '01'
type: execute
wave: '1'
depends_on: []
files_modified:
  - app/data/faqs.ts
  - app/page.tsx
autonomous: true
requirements:
  - SEO-03
must_haves:
  truths:
    - Homepage FAQ section shows exactly 10 questions
    - All 6 keyword-targeted FAQs are preserved on homepage
    - Dedicated /resources/faq page exists with all 18 FAQs
    - /resources/faq page has FAQPage JSON-LD schema
    - /resources/faq page has unique SEO metadata
  artifacts:
    - path: app/data/faqs.ts
      provides: homepageFaqs export (10) and faqs export (18)
    - path: app/page.tsx
      provides: Homepage uses trimmed 10-question FAQ
      modifies: FAQ and FAQSchema components receive homepageFaqs prop
    - path: app/resources/faq/page.tsx
      provides: Dedicated FAQ page with full 18 FAQs
      exports: page with metadata, FAQSchema, FAQ components
  key_links:
    - from: app/page.tsx
      to: app/data/faqs.ts
      via: imports homepageFaqs
      pattern: homepageFaqs
    - from: app/resources/faq/page.tsx
      to: app/components/FAQ
      via: imports and passes faqs prop
      pattern: FAQ faqs={faqs}
---

<objective>
Fix Google FAQ rich results limit (10 question max) by trimming homepage FAQ from 18 to 10 while preserving all 6 keyword-targeted SEO FAQs, and create a dedicated /resources/faq page with all 18 FAQs for comprehensive SEO coverage.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@app/data/faqs.ts
@app/components/FAQ.tsx
@app/components/FAQSchema.tsx
@app/page.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add homepageFaqs export to faqs.ts</name>
  <files>app/data/faqs.ts</files>
  <action>
    Add a new export `homepageFaqs` to `app/data/faqs.ts` containing exactly 10 FAQs:

    The first 6 are the keyword-targeted FAQs (MUST NOT be reordered or modified):
    1. "What is a China sourcing agent in Australia and why do I need one?"
    2. "How do I visit Chinese factories safely as an Australian business?"
    3. "What does a China sourcing tour include?"
    4. "What are China business tours and how do they work for Australian importers?"
    5. "How can Australian businesses find reliable Chinese wholesalers?"
    6. "What is included in a China business trip package?"

    Add these 4 from the original 12 (conversion-critical topics):
    7. "What is included in the service fee?" (addresses pricing transparency)
    8. "How far in advance do I need to book?" (addresses booking timeline)
    9. "What if I do not find a suitable supplier?" (addresses risk/reassurance)
    10. "Do I need to speak Mandarin?" (addresses language barrier concern)

    Keep the existing `faqs` export unchanged (all 18) for /resources/faq page.
  </action>
  <verify>
    <automated>grep -c "homepageFaqs" app/data/faqs.ts && grep -c "What is included in the service fee" app/data/faqs.ts</automated>
  </verify>
  <done>homepageFaqs array exported with exactly 10 items (6 keyword + 4 original)</done>
</task>

<task type="auto">
  <name>Task 2: Update homepage to use trimmed FAQ</name>
  <files>app/page.tsx</files>
  <action>
    Modify `app/page.tsx`:

    1. Add import: `import { homepageFaqs } from '@/data/faqs'`
    2. Update the FAQ component usage from `<FAQ />` to `<FAQ faqs={homepageFaqs} />`
    3. Update the FAQSchema component usage from `<FAQSchema />` to `<FAQSchema faqs={homepageFaqs} />`

    This ensures the homepage FAQ section shows only 10 questions (within Google limit) while preserving all 6 keyword-targeted FAQs.
  </action>
  <verify>
    <automated>grep -c "homepageFaqs" app/page.tsx</automated>
  </verify>
  <done>Homepage renders 10 FAQs via faqs prop passed to FAQ and FAQSchema components</done>
</task>

<task type="auto">
  <name>Task 3: Create /resources/faq page with all 18 FAQs</name>
  <files>app/resources/faq/page.tsx</files>
  <action>
    Create `app/resources/faq/page.tsx` as a dedicated FAQ resource page:

    1. Import `faqs` (all 18) from `@/data/faqs`
    2. Import `FAQ` and `FAQSchema` components
    3. Import `Navbar`, `Footer`, `Hero` components
    4. Add export const metadata with:
       - title: "China Sourcing FAQ | Factory Visit Questions Answered"
       - description: "Expert answers to 18 common questions about sourcing from China, visiting factories, and working with manufacturers. Includes guide on supplier verification."
       - keywords: "china sourcing faq, factory visit questions, chinese supplier guide, australia china trade"
    5. Return page structure:
       - `<Navbar />`
       - `<Hero>` with H1 "China Sourcing FAQ" and brief intro paragraph
       - `<FAQSchema faqs={faqs} />` for JSON-LD (all 18)
       - `<FAQ faqs={faqs} />` section with single-column layout
       - `<Footer />`

    Use single-column layout for the FAQ section (override the 3-col grid via a wrapping div with className="max-w-[800px] mx-auto" to match about/services page style, not the homepage grid).

    Add internal links in the FAQ section intro: link to /services and /about pages.
  </action>
  <verify>
    <automated>test -f app/resources/faq/page.tsx && grep -c "FAQSchema faqs={faqs}" app/resources/faq/page.tsx</automated>
  </verify>
  <done>App renders at /resources/faq with all 18 FAQs and FAQPage JSON-LD schema</done>
</task>

</tasks>

<verification>
- Homepage FAQ section renders exactly 10 questions (6 keyword + 4 original)
- /resources/faq page accessible and renders all 18 FAQs
- FAQPage JSON-LD on /resources/faq contains all 18 questions
- `npm run build` passes without errors
</verification>

<success_criteria>
- Homepage FAQ count: 10 (not 18)
- All 6 keyword-targeted FAQs preserved on homepage
- /resources/faq page exists with all 18 FAQs
- FAQPage schema on /resources/faq has 18 questions
- Build passes
</success_criteria>

<output>
After completion, create `.planning/phases/17-faq-page-schema/phase-17-SUMMARY.md`
</output>
