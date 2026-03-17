---
status: complete
phase: 06-seo-optimization
source: 06-01-SUMMARY.md, 06-02-SUMMARY.md, 06-03-SUMMARY.md
started: 2026-03-18T00:00:00Z
updated: 2026-03-18T00:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Homepage Loads with SEO Metadata
expected: Visit homepage (localhost:3000). Page loads without errors. View page source or use DevTools to verify: title contains "China Sourcing", description contains "Australian businesses" and "Adelaide", meta keywords include target keywords
result: pass

### 2. Services Page Loads with ServiceSchema
expected: Visit /services. Page loads without errors. View page source to verify ServiceSchema JSON-LD is present with @type: "Service" and areaServed includes "Australia"
result: pass

### 3. About Page Loads with Adelaide Keywords
expected: Visit /about. Page loads. View page source to verify description contains "Adelaide" in metadata
result: pass

### 4. Enquiry Page Form Works
expected: Visit /enquiry. Page loads. Form displays with fields (name, email, company, message). Submit a test inquiry - should show success message or redirect
result: issue
reported: "Failed to load resource: the server responded with a status of 500 (Internal Server Error)"
severity: blocker

### 5. Blog Article: China Sourcing Risks
expected: Visit /resources/china-sourcing-risks. Article loads with title "China Sourcing Risks". Contains internal links to /services and /enquiry
result: issue
reported: "文章加载正确，但是article的配图错误了没有按照我们的模板进行配图"
severity: cosmetic

### 6. Blog Article: China vs Alibaba
expected: Visit /resources/china-vs-alibaba. Article loads with comparison content. Contains internal link to /services
result: issue
reported: "没有链接到/services"
severity: major

### 7. Blog Article: Factory Tour Guide
expected: Visit /resources/china-factory-tour-guide (or /resources/factory-visit-china-guide). Article loads with factory visit content
result: pass

## Summary

total: 7
passed: 4
issues: 3
pending: 0
skipped: 0

## Gaps

- truth: "Enquiry form submits successfully and shows success message"
  status: failed
  reason: "User reported: Failed to load resource: the server responded with a status of 500 (Internal Server Error)"
  severity: blocker
  test: 4
  root_cause: "The API route uses Gmail SMTP for sending emails. The 500 error is caused by missing or incorrect environment variables GMAIL_USER and GMAIL_APP_PASSWORD. The code at lines 10-11 in route.ts references process.env.GMAIL_USER and process.env.GMAIL_APP_PASSWORD - if these are missing or incorrect, getTransporter() fails when creating SMTP transport, causing email sending to fail with 500 error."
  artifacts:
    - "app/api/enquiry/route.ts (lines 5-14, 62)"
  missing:
    - "Environment variables in .env.local: GMAIL_USER (Gmail address)"
    - "Environment variable: GMAIL_APP_PASSWORD (Gmail App Password, not regular password)"
  debug_session: ""

- truth: "Blog article displays with correct template image"
  status: failed
  reason: "User reported: 文章加载正确，但是article的配图错误了没有按照我们的模板进行配图"
  severity: cosmetic
  test: 5
  root_cause: "The article page Hero section (lines 134-153 in page.tsx) does NOT render the cover image in the page content. It only displays title and metadata text. The coverImage defined in frontmatter is only used in OpenGraph metadata (generateMetadata), but not displayed on the actual page as a hero image."
  artifacts:
    - "app/resources/[slug]/page.tsx (Hero section lines 134-153)"
    - "content/blog/china-sourcing-risks.mdx (coverImage: defined in frontmatter line 29)"
  missing:
    - "Cover image component in the Hero section that displays fm.coverImage"
  debug_session: ""

- truth: "Blog article contains internal link to /services"
  status: failed
  reason: "User reported: 没有链接到/services"
  severity: major
  test: 6
  root_cause: "The /services link EXISTS in the MDX source (line 47 in china-vs-alibaba.mdx: '[build direct factory relationships](/services)'). The link is present in the markdown content, so the issue is likely that: (1) The MDX is not rendering links correctly, OR (2) The user may have tested a cached/older version. Note: Both china-sourcing-risks.mdx and china-vs-alibaba.mdx contain /services links in their content."
  artifacts:
    - "content/blog/china-vs-alibaba.mdx (line 47 contains /services link)"
    - "content/blog/china-sourcing-risks.mdx (line 46 contains /services link)"
    - "app/resources/[slug]/page.tsx (MDXRemote component for rendering)"
  missing:
    - "Verify link is rendering correctly in browser (check if <a> or <Link> tag is present)"
  debug_session: ""
