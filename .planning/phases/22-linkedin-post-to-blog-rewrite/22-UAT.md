---
status: testing
phase: 22-linkedin-post-to-blog-rewrite
target_url: http://localhost:3000
source: 22-01-SUMMARY.md
started: 2026-03-21T04:52:00Z
updated: 2026-03-21T04:52:00Z
---

## Current Test

number: 1
name: Page Load - Blog Article
expected: |
  Navigate to /resources/how-to-verify-chinese-factories-1688
  - Page loads without 404 or error
  - Hero section shows article title "How to Verify Chinese Factories on 1688 Before Paying a Deposit"
  - Author "Winning Adventure Global" is displayed
  - Category shows "Factory Verification"
type: manual
awaiting: user response

## Tests

### 1. Page Load - Blog Article
expected: |
  Navigate to /resources/how-to-verify-chinese-factories-1688
  - Page loads without 404 or error
  - Hero section shows article title "How to Verify Chinese Factories on 1688 Before Paying a Deposit"
  - Author "Winning Adventure Global" is displayed
  - Category shows "Factory Verification"
type: manual
result: pending

### 2. Content Structure - Sections
expected: |
  Scroll through the article and verify:
  - Introduction paragraph setup (2-3 paragraphs about the problem)
  - Section 1: The Problem - Trading companies vs real factories
  - Section 2: The 3 Verification Steps (business license, live video, unannounced visit)
  - Section 3: What happens if you skip verification
  - Conclusion with soft CTA (not a hard LinkedIn-style question)
type: manual
result: pending

### 3. Image Display
expected: |
  Verify two images are displayed:
  - Image 1 (fake-factory-reveal) appears after Section 1 (The Problem)
  - Image 2 (3step-verification) appears in Section 2 (Verification Steps)
  Both images should load without broken image icons
type: manual
result: pending

### 4. SEO Frontmatter
expected: |
  View page source or use DevTools to verify:
  - Title tag: "How to Verify Chinese Factories on 1688 Before Paying a Deposit"
  - Meta description present and matches frontmatter
  - OG tags for social sharing
type: manual
result: pending

### 5. Build Verification
expected: npm run build completes without errors
type: automated
result: pending
automation_script: /tmp/playwright-test-5.js

## Summary

total: 5
automated_passed: 0
automated_failed: 0
manual_passed: 0
manual_issues: 0
pending: 5
skipped: 0

## Gaps

[none yet]
