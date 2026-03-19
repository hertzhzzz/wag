---
phase: quick
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: []
autonomous: true
must_haves:
  truths:
    - "HTML page displays Phase 11 SEO tasks visually"
    - "Checklist allows manual tracking of directory submissions"
    - "NAP data is displayed correctly for reference"
  artifacts:
    - path: "phase-11-seo-tracker.html"
      provides: "Visual checklist interface for external SEO tasks"
  key_links: []
---

<objective>
创建一个简单的HTML页面，用于手动可视化跟踪Phase 11的外部SEO任务。
</objective>

<execution_context>
@/Users/mark/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@docs/local-seo-requirements.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Phase 11 SEO Tracker HTML</name>
  <files>phase-11-seo-tracker.html</files>
  <action>Create a single HTML file with:
- Inline CSS styling matching WAG brand (Navy #0F2D5E, Amber #F59E0B)
- NAP data display section (Business Name, Address, Phone, ABN, Website)
- Google Business Profile setup checklist (10 steps)
- Australian Directory Submission checklist with checkboxes:
  * High Priority: Google Business Profile, Apple Business Connect, Bing Places, TrueLocal.com.au, Yelp.com.au, Yellow Pages Australia, Australian Business Register
  * Industry: Import Export Institute, Australian Chamber of Commerce, alogcase, Procurement.org
  * Local: Adelaide CBD directory, SA business directories, Local chambers
  * B2B: Alibaba trade connections, Global Sources, TradeIndia Australia
- Guest Post Outreach tracker with columns: Site, DA, Contact, Status, Notes
- Target Guest Post Sites table: Logistics News Today, Purchasing & Procurement Center, Australian Business Coach, Supply Chain Digest, Sourcing Journal, Inbound Logistics, Smart Company, Business Insider, China Briefing, Global Sources Blog
- Monthly post strategy display (4-week rotation)
- Use localStorage to persist checkbox state
- Print-friendly styling</action>
  <verify>File created at phase-11-seo-tracker.html with all sections present</verify>
  <done>HTML page created with NAP display, directory checklists, guest post tracker, and localStorage persistence</done>
</task>

</tasks>

<verification>
Open phase-11-seo-tracker.html in browser to verify all sections render correctly
</verification>

<success_criteria>
- HTML file created successfully
- Contains NAP data section with exact values from local-seo-requirements.md
- All 7 high-priority directories listed with checkboxes
- Guest post tracker with 10 target sites
- localStorage persistence works for checkbox state
</success_criteria>

<output>
After completion, create `.planning/quick/260319-nma-html-phase-11-seo/260319-nma-SUMMARY.md`
</output>