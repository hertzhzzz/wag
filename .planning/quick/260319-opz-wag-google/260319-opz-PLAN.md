---
phase: quick-260319-opz-wag-google
plan: "01"
type: execute
wave: 1
depends_on: []
files_modified: []
autonomous: true
requirements: []
must_haves:
  truths:
    - "Keyword ranking data is extracted from Google Search Console"
  artifacts:
    - path: ".planning/quick/260319-opz-wag-google/keyword-rankings-report.md"
      provides: "Markdown report with keyword rankings, positions, clicks, impressions, CTR"
  key_links: []
---

<objective>
Query WAG website keyword rankings from Google Search Console for March 2026 and generate a clean markdown report.
</objective>

<context>
@/Users/mark/Projects/wag/CLAUDE.md
</context>

<tasks>

<task type="auto">
  <name>Query GSC for March 2026 keyword rankings</name>
  <files>.planning/quick/260319-opz-wag-google/keyword-rankings-report.md</files>
  <action>
    Use the Google Search Console MCP tool to query keyword rankings:

    1. Use `mcp__gsc__enhanced_search_analytics` with:
       - site_url: "winningadventure.com.au"
       - dimensions: ["query", "date"]
       - start_date: "2026-03-01"
       - end_date: "2026-03-19"
       - row_limit: 50

    2. Use `mcp__gsc__search_analytics` with:
       - site_url: "sc-domain:winningadventure.com.au"
       - request: { dimensions: ["query"], start_date: "2026-03-01", end_date: "2026-03-19", row_limit: 50 }

    3. Compile results into a markdown report with:
       - Title: "WAG Website Keyword Rankings — March 2026"
       - Date range covered
       - Table with columns: Keyword | Position | Clicks | Impressions | CTR
       - Sort by Position ascending (best rankings first)
       - Highlight keywords with position <= 20 (first page potential)
       - Summary statistics: total keywords, avg position, total clicks, total impressions
  </action>
  <verify>Report file created with GSC data and readable markdown table</verify>
  <done>Keyword rankings report generated at .planning/quick/260319-opz-wag-google/keyword-rankings-report.md</done>
</task>

</tasks>

<verification>
Report contains keyword data with Position, Clicks, Impressions, CTR columns.
</verification>

<success_criteria>
Markdown report exists at .planning/quick/260319-opz-wag-google/keyword-rankings-report.md with GSC data.
</success_criteria>

<output>
After completion, create .planning/quick/260319-opz-wag-google/260319-opz-SUMMARY.md
</output>
