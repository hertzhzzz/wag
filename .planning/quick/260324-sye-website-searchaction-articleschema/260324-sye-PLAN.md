---
phase: quick
plan: "260324-sye"
type: execute
wave: 1
depends_on: []
files_modified:
  - app/components/ArticleSchema.tsx
  - app/page.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "ArticleSchema renders JSON-LD in initial HTML response (not JS-injected)"
    - "WebSite+SearchAction schema present in homepage source HTML"
  artifacts:
    - path: app/components/ArticleSchema.tsx
      provides: Server-rendered Article/BlogPosting JSON-LD
      min_lines: 50
    - path: app/page.tsx
      provides: WebSite+SearchAction JSON-LD added
---

<objective>
Fix two critical SEO structured data issues: (1) Convert ArticleSchema from JS-injected to server-rendered, (2) Add WebSite+SearchAction schema to homepage.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
From GEO-SCHEMA-REPORT.md:
- ArticleSchema uses useEffect to inject JSON-LD client-side - Googlebot may not see it
- WebSite+SearchAction schema is missing entirely - prevents sitelinks search box

Existing patterns from codebase:
- FAQSchema.tsx uses inline script with dangerouslySetInnerHTML (server-compatible)
- app/page.tsx is a server component that renders multiple Schema components
</context>

<tasks>

<task type="auto">
  <name>Task 1: Convert ArticleSchema to server component</name>
  <files>app/components/ArticleSchema.tsx</files>
  <action>
    Rewrite ArticleSchema.tsx as a server component:
    - REMOVE: 'use client' directive
    - REMOVE: useEffect import and hook
    - REMOVE: document.createElement/appendsChild/removeChild logic
    - ADD: Inline <script type="application/ld+json"> tag with dangerouslySetInnerHTML

    Keep all existing props interface and schema structure intact.
    The component should return the script tag directly (not null).
  </action>
  <verify>
    <automated>grep -c "use client" app/components/ArticleSchema.tsx; grep -c "useEffect" app/components/ArticleSchema.tsx; grep -c 'dangerouslySetInnerHTML' app/components/ArticleSchema.tsx</automated>
  </verify>
  <done>ArticleSchema.tsx renders JSON-LD inline without client-side useEffect</done>
</task>

<task type="auto">
  <name>Task 2: Add WebSite+SearchAction schema to homepage</name>
  <files>app/page.tsx</files>
  <action>
    Add WebSite+SearchAction JSON-LD to app/page.tsx:
    - Import { Metadata } from 'next' if not already present (already imported)
    - Add WebSite JSON-LD using inline script pattern (same as FAQSchema)
    - Add after <Navbar /> opening tag

    Schema structure:
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Winning Adventure Global",
      "url": "https://www.winningadventure.com.au",
      "description": "China factory tours and sourcing services for Australian businesses",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://www.winningadventure.com.au/resources?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    }
  </action>
  <verify>
    <automated>grep -c "WebSite" app/page.tsx; grep -c "SearchAction" app/page.tsx</automated>
  </verify>
  <done>Homepage includes WebSite+SearchAction schema in source HTML</done>
</task>

</tasks>

<verification>
Run after deployment:
- View page source of homepage, confirm WebSite JSON-LD present
- View page source of a blog article, confirm Article JSON-LD in initial HTML (not JS-injected)
</verification>

<success_criteria>
1. ArticleSchema.tsx has no 'use client' and no useEffect - uses inline script tag
2. app/page.tsx includes WebSite+SearchAction JSON-LD
3. npm run build passes
</success_criteria>

<output>
After completion, create `.planning/quick/260324-sye-website-searchaction-articleschema/260324-sye-SUMMARY.md`
</output>
