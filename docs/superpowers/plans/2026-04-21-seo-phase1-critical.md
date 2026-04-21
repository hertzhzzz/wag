# Phase 1 Critical SEO Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the 3 critical SEO issues blocking Google indexing: sitemap canonical mismatch, verify H1 SSR, and temporarily noindex duplicate city pages.

**Architecture:** Three independent fixes. Each is a single-file edit. Execute in task order (Task 1 → 2 → 3).

**Tech Stack:** Next.js App Router (App Router metadata API), sitemap.ts, city page metadata.

---

## Pre-flight Verification (already done — for reference only)

| Check | Result | Action Needed |
|-------|--------|--------------|
| `curl -s https://www.winningadventure.com.au/ \| grep -oi '<h1'` | 12 H1 matches found | PASS — H1 SSR confirmed |
| `curl -s https://www.winningadventure.com.au/about \| grep -oi '<h1'` | H1 found | PASS |
| `curl -s https://www.winningadventure.com.au/enquiry \| grep -oi '<h1'` | H1 found | PASS |
| sitemap.ts baseUrl | `https://www.winningadventure.com.au` | NEEDS FIX |
| GSC indexed version | `winningadventure.com.au` (non-www) | MISMATCH |
| City pages noindex | Not present | NEEDS FIX |

---

## Task 1: Fix Sitemap Canonical URL Mismatch

**Files:**
- Modify: `app/sitemap.ts:24`

**Problem:** sitemap.ts uses `https://www.winningadventure.com.au` as baseUrl, but GSC shows Google indexes `winningadventure.com.au` (non-www). This canonical mismatch is why 35 URLs are submitted but 0 are indexed.

**Decision:** Change sitemap baseUrl to `https://winningadventure.com.au` (non-www) to match the URL Google is actually indexing. The next.config.js 301 redirect (non-www → www) still works for users; sitemap should reflect Google's indexed version.

- [ ] **Step 1: Edit app/sitemap.ts line 24**

```typescript
// BEFORE (line 24)
const baseUrl = 'https://www.winningadventure.com.au'

// AFTER
const baseUrl = 'https://winningadventure.com.au'
```

- [ ] **Step 2: Run build to verify no errors**

```bash
cd /Users/mark/Projects/wag-frontend && npm run build 2>&1 | tail -20
```

Expected: Build succeeds with no TypeScript or lint errors.

- [ ] **Step 3: Verify sitemap URL format**

```bash
curl -s https://winningadventure.com.au/sitemap.xml | head -5
```

Expected: First URL tag contains `https://winningadventure.com.au` (no www).

- [ ] **Step 4: Commit**

```bash
git add app/sitemap.ts && git commit -m "fix: align sitemap URLs with GSC indexed version (non-www)"
```

---

## Task 2: H1 SSR Verification (No-Code — Confirm Pass)

**Files:** None (verification only)

**Result:** H1 tags ARE present in SSR output on all 3 core pages. This was a false positive in the audit tool's rendering detection. No code change required.

- [ ] **Step 1: Confirm all 3 pages have H1 in SSR**

```bash
# Homepage
curl -s https://winningadventure.com.au/ | grep -oi '<h1[^>]*>' | head -3
# About
curl -s https://winningadventure.com.au/about | grep -oi '<h1[^>]*>' | head -3
# Enquiry
curl -s https://winningadventure.com.au/enquiry | grep -oi '<h1[^>]*>' | head -3
```

Expected: Each returns an `<h1...>` opening tag.

- [ ] **Step 2: Mark task complete — no code change needed**

No modifications to any file. This task is complete.

---

## Task 3: Add noindex to 4 City Pages (Temporary)

**Files:**
- Modify: `app/[city]/page.tsx:163` (inside generateMetadata return object)

**Problem:** Adelaide/Sydney/Melbourne/Perth pages share ~95% identical content. Until differentiation rewrite is complete, this risks Google duplicate-content penalties. Adding `noindex` stops Google from indexing the near-duplicate pages while preserving the link equity from incoming links.

**Note:** Brisbane is excluded from noindex (it was not in the original 4-city audit scope).

- [ ] **Step 1: Add robots noindex to generateMetadata in app/[city]/page.tsx**

Find the generateMetadata function's return block (lines 148-163). The current return:

```typescript
  return {
    title: content.headline,
    description: content.metaDescription,
    keywords: content.metaKeywords,
    openGraph: {
      title: content.headline,
      description: content.metaDescription,
      url: `${baseUrl}/${cityLower}`,
      siteName: 'Winning Adventure Global',
      locale: 'en_AU',
      alternateLocale: 'en_US',
    },
    alternates: {
      canonical: `${baseUrl}/${cityLower}`,
    },
  }
```

Change TO:

```typescript
  return {
    title: content.headline,
    description: content.metaDescription,
    keywords: content.metaKeywords,
    robots: {
      index: false,
      follow: true,
    },
    openGraph: {
      title: content.headline,
      description: content.metaDescription,
      url: `${baseUrl}/${cityLower}`,
      siteName: 'Winning Adventure Global',
      locale: 'en_AU',
      alternateLocale: 'en_US',
    },
    alternates: {
      canonical: `${baseUrl}/${cityLower}`,
    },
  }
```

**What changed:** Added `robots: { index: false, follow: true }` block after `keywords`. This outputs `<meta name="robots" content="noindex, follow">` in the `<head>`. `follow` preserves pass-through link equity from incoming links.

- [ ] **Step 2: Run build**

```bash
npm run build 2>&1 | tail -20
```

Expected: Build succeeds.

- [ ] **Step 3: Verify noindex in rendered HTML for all 4 cities**

```bash
# Adelaide
curl -s https://winningadventure.com.au/adelaide | grep -i 'noindex'
# Sydney
curl -s https://winningadventure.com.au/sydney | grep -i 'noindex'
# Melbourne
curl -s https://winningadventure.com.au/melbourne | grep -i 'noindex'
# Perth
curl -s https://winningadventure.com.au/perth | grep -i 'noindex'
```

Expected: Each returns `<meta name="robots" content="noindex, follow">`.

- [ ] **Step 4: Commit**

```bash
git add app/[city]/page.tsx && git commit -m "fix: add noindex to Adelaide/Sydney/Melbourne/Perth city pages (temporary until content differentiation)"
```

---

## Post-Deployment Checklist

After each fix is committed and pushed:

- [ ] Verify with `curl -sI https://winningadventure.com.au/<page> | grep -i 'HTTP'` — expect 200
- [ ] Check GSC for any immediate changes in crawl/index status (wait 24-48 hours after deploy)
- [ ] GA4 session data (small changes, 7-day monitoring window)

---

## Rollback Instructions

If any fix causes unexpected issues:

| Fix | Rollback Command |
|-----|-----------------|
| Task 1 sitemap | `git revert HEAD --no-edit` then push |
| Task 3 noindex | Remove the `robots:` block added in Task 3 Step 1, rebuild, push |
