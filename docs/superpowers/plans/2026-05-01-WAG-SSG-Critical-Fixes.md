# WAG SSG JSON-LD Critical Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 3 critical SEO issues blocking Googlebot from reading JSON-LD structured data and causing canonical/indexing mismatches.

**Architecture:** Three targeted file edits — remove unnecessary `'use client'` from two schema components, fix sitemap canonical to match GSC's indexed domain, and add noindex to thin city pages.

**Tech Stack:** Next.js App Router, TypeScript, schema.org JSON-LD

---

## File Map

| File | Change |
|------|--------|
| `app/components/ServiceSchema.tsx` | Remove `'use client'` |
| `app/components/FAQSchema.tsx` | Remove `'use client'` |
| `app/sitemap.ts` | Change baseUrl `www.` → non-www |
| `app/[city]/page.tsx` | Add `robots: { index: false }` to generateMetadata |
| `app/layout.tsx` | Add "China business tours" to Organization knowsAbout |

---

## Verification Command

After each task, run:
```bash
cd /Users/mark/Projects/wag/frontend && npm run build
```
Expected: build succeeds, no new errors.

Final verification (after all tasks):
```bash
# Check sitemap URL
grep "baseUrl" app/sitemap.ts
# Expected: non-www

# Check city page for noindex
grep -n "index: false" app/[city]/page.tsx
# Expected: line with "index: false"

# Verify no 'use client' in schema files
grep "use client" app/components/ServiceSchema.tsx app/components/FAQSchema.tsx
# Expected: no output
```

---

### Task 1: Remove `'use client'` from ServiceSchema.tsx

**Files:**
- Modify: `app/components/ServiceSchema.tsx:1`

- [ ] **Step 1: Remove `'use client'` from ServiceSchema.tsx**

```diff
- 'use client'
-
 export default function ServiceSchema() {
```

**Run:** `grep -n "use client" app/components/ServiceSchema.tsx`
**Expected:** no output (already removed, or this was the only line)

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -5
```
**Expected:** `Compiled successfully` or `Route (app) ...`

- [ ] **Step 3: Commit**

```bash
git add app/components/ServiceSchema.tsx
git commit -m "fix: remove unnecessary 'use client' from ServiceSchema — allows Googlebot to crawl JSON-LD"
```

---

### Task 2: Remove `'use client'` from FAQSchema.tsx

**Files:**
- Modify: `app/components/FAQSchema.tsx:1`

- [ ] **Step 1: Remove `'use client'` from FAQSchema.tsx**

```diff
- 'use client'
-
 import { faqs as defaultFaqs } from '@/data/faqs'
```

**Run:** `grep -n "use client" app/components/FAQSchema.tsx`
**Expected:** no output

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -5
```
**Expected:** `Compiled successfully`

- [ ] **Step 3: Commit**

```bash
git add app/components/FAQSchema.tsx
git commit -m "fix: remove unnecessary 'use client' from FAQSchema — allows Googlebot to crawl FAQPage JSON-LD"
```

---

### Task 3: Fix sitemap.ts baseUrl to non-www

**Files:**
- Modify: `app/sitemap.ts:48`

- [ ] **Step 1: Change baseUrl from www to non-www**

```diff
- const baseUrl = 'https://www.winningadventure.com.au'
+ const baseUrl = 'https://winningadventure.com.au'
```

**Run:** `grep "baseUrl = 'https://" app/sitemap.ts`
**Expected:** `const baseUrl = 'https://winningadventure.com.au'`

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -5
```
**Expected:** `Compiled successfully`

- [ ] **Step 3: Commit**

```bash
git add app/sitemap.ts
git commit -m "fix: sitemap baseUrl to non-www — matches GSC indexed domain, fixes canonical mismatch"
```

---

### Task 4: Add noindex to city page metadata

**Files:**
- Modify: `app/[city]/page.tsx:148-163`

- [ ] **Step 1: Add `robots: { index: false }` to generateMetadata return**

In the `generateMetadata` function, after the `openGraph` block, add `robots` to the return object:

```diff
    openGraph: {
      title: content.headline,
      description: content.metaDescription,
      url: `${baseUrl}/${cityLower}`,
      siteName: 'Winning Adventure Global',
      locale: 'en_AU',
      alternateLocale: 'en_US',
    },
+   robots: {
+     index: false,
+     follow: true,
+   },
    alternates: {
```

**Run:** `grep -A2 "robots:" app/[city]/page.tsx | head -6`
**Expected:**
```
    robots: {
      index: false,
      follow: true,
    },
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -5
```
**Expected:** `Compiled successfully`

- [ ] **Step 3: Commit**

```bash
git add "app/[city]/page.tsx"
git commit -m "fix: add noindex to city pages — prevents Google from indexing thin duplicate content"
```

---

### Task 5: Extend Organization schema knowsAbout with "China business tours"

**Files:**
- Modify: `app/layout.tsx:181-189`

- [ ] **Step 1: Add "China business tours" to knowsAbout array**

```diff
            "knowsAbout": [
              "Chinese manufacturing",
+             "China business tours",
              "factory verification",
```

**Run:** `grep -A10 '"knowsAbout":' app/layout.tsx | grep "China business tours"`
**Expected:** `             "China business tours",`

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -5
```
**Expected:** `Compiled successfully`

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: add 'China business tours' to Organization schema knowsAbout — improves knowledge graph relevance"
```

---

## Final Verification

- [ ] **All tasks complete, all builds green, all commits done**
- [ ] **Push to trigger Vercel deploy:** `git push origin master`
- [ ] **GSC verification** (after deploy):
  - URL Inspection on `/services` → check "Structured data" shows Service schema
  - URL Inspection on `/visiting-chinese-factories` → check "Structured data" shows FAQPage schema
  - URL Inspection on `/adelaide` → shows "Page is not indexed" (correct behavior)
  - Submit sitemap at GSC → check no "Page with redirect" warnings

---

## Spec Coverage Checklist

| Spec Issue | Task |
|------------|------|
| C1: ServiceSchema 'use client' | Task 1 |
| C1: FAQSchema 'use client' | Task 2 |
| C2: sitemap www canonical | Task 3 |
| C3: city pages noindex missing | Task 4 |
| H3: Organization knowsAbout gap | Task 5 |

No gaps found. All 5 spec items covered.