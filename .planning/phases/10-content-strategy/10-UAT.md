---
status: testing
phase: 10-content-strategy
source: 10-01-SUMMARY.md, 10-02-SUMMARY.md, 10-03-SUMMARY.md
started: 2026-03-18T14:30:00Z
updated: 2026-03-18T14:52:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Blog post "How to Import from China"
expected: Visit /resources/how-to-import-from-china - article loads with full content, shows title, subtitle, body sections with Tip blocks, and Internal links to /services and /about in the content
result: pass

### 2. Blog post "China Supplier Verification"
expected: Visit /resources/china-supplier-verification - article loads with full content, shows Australia-market focus, includes practical red flags and verification checklist
result: pass

### 3. Blog post "Australia Import Tips"
expected: Visit /resources/australia-import-tips - article loads with full content, covers customs, GST, quarantine, compliance topics
result: pass

### 4. FAQ section on Services page
expected: Visit /services - scroll down to see FAQ accordion section with 10+ questions. Click a question, answer expands. View page source, find FAQPage JSON-LD schema
result: pass

### 5. FAQ section on About page
expected: Visit /about - scroll down to see FAQ accordion section with 10+ questions different from Services page. View page source, find FAQPage JSON-LD schema
result: pass

### 6. Services page keywords
expected: Inspect /services page metadata - contains "factory visit", "supplier sourcing", "China procurement" in keywords. Also see these phrases naturally in page content
result: pass

### 7. Homepage keywords
expected: Inspect homepage metadata - contains target keywords
result: pass

### 8. Site search finds blog posts
expected: Use site search on website to search "import from China" - the "How to Import from China" guide appears in results
result: issue
reported: "我没有看到有搜索框"
severity: major

## Summary

total: 8
passed: 7
issues: 1
pending: 0
skipped: 0

## Gaps

- truth: "Blog posts are searchable via site search"
  status: failed
  reason: "User reported: 没有看到有搜索框"
  severity: major
  test: 8
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
