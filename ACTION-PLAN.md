# SEO ACTION PLAN
**Website:** www.winningadventure.com.au
**Generated:** 23 April 2026
**Based on:** FULL-AUDIT-REPORT.md

---

## PRIORITY LEVELS

| Level | Definition | Timeline |
|-------|------------|----------|
| **Critical** | Blocks indexing or causes penalties | Immediate (1-2 days) |
| **High** | Significantly impacts rankings | 1 week |
| **Medium** | Optimization opportunity | 1 month |
| **Low** | Nice to have | Backlog |

---

## CRITICAL (Immediate Action Required)

### ✅ 1. Fix Author Name Conflict
**Problem:** Organization schema says "Andy Liu", Article schema says "Mark He" — three different identities destroy E-E-A-T trust.

**Fix:**
- [ ] Decision needed: Use "Andy Liu" or "Mark He" as the single author identity
- [ ] Update `app/resources/[slug]/article-utils.ts` — change Organization `founder.name` to match chosen identity
- [ ] Verify all BlogPosting schema `author.name` consistency
- [ ] Check if "Mark He" is a pseudonym — if so, decide whether to use real name or keep pseudonym consistently
- [ ] Update frontmatter `author` field in all 25 MDX files if identity changes

**Estimated effort:** 2-3 hours

---

### ✅ 2. Submit URLs to Google Indexing API
**Problem:** 7+ location/service pages are "Unknown to Google" — never crawled, not quality-rejected.

**Fix:**
- [ ] Run: `python .claude/skills/seo/scripts/google_index.py --url https://www.winningadventure.com.au/adelaide`
- [ ] Run: `python .claude/skills/seo/scripts/google_index.py --url https://www.winningadventure.com.au/melbourne`
- [ ] Run: `python .claude/skills/seo/scripts/google_index.py --url https://www.winningadventure.com.au/perth`
- [ ] Run: `python .claude/skills/seo/scripts/google_index.py --url https://www.winningadventure.com.au/services`
- [ ] Consider batch submit for all location pages: `python .claude/skills/seo/scripts/google_index.py --batch location_urls.txt`

**Note:** Google Indexing API works best for URLs with schema that supports it (Article, FAQ, JobPosting). For location pages, use Indexing API with `urlNotificationMetadata` endpoint.

**Estimated effort:** 1-2 hours

---

### ✅ 3. Preload LCP Image on Homepage
**Problem:** Homepage LCP is 7.4s — hero image not preloaded, causing render delay.

**Fix:**
- [ ] Identify the hero/LCP image on homepage
- [ ] Add to `app/page.tsx` or relevant hero component:
  ```tsx
  import { Head } from 'next/head';
  <Head>
    <link
      rel="preload"
      as="image"
      href="/path/to/hero-image.webp"
      fetchPriority="high"
    />
  </Head>
  ```
- [ ] Or use Next.js Image component with `priority` prop:
  ```tsx
  <Image src="/hero.webp" alt="..." width={1200} height={600} priority />
  ```
- [ ] Verify LCP improves to ≤2.5s via PageSpeed Insights

**Estimated effort:** 1 hour

---

## HIGH PRIORITY (Fix within 1 week)

### ✅ 4. Expand Thin Articles (< 500 words)

**Status:** COMPLETED
- Sydney article expanded from 674 to 1548 words
- Melbourne article expanded from 437 to 1706 words
- Both now include: first-person experience sections, SGS/BSI/CNCA/SAMR authority links, FAQ sections (6 questions each), client case studies, key takeaways

**Estimated effort:** 4-6 hours per article (writing + editing)

---

### ✅ 5. Update llms.txt

**Status:** COMPLETED
- Regenerated llms.txt with all 25 blog articles (previously missing 15 articles from pre-March 2025 version)
- Added semantic sections: Site Overview, Services, Main Pages, Blog Articles (24 articles listed with descriptions), Key Topics, Business Information, Author Information
- Articles now grouped by category: Location-Specific (5), Factory Verification (6), Sourcing Strategy (3), Import Process (3), Bulk Procurement/China Travel (4), Negotiation Skills (1)
- Author section correctly identifies Andy Liu (Founder) and Mark He (Managing Director)

**Estimated effort:** 1-2 hours

---

### 🔲 6. Add Internal Links from Homepage to Location Pages

**Problem:** Homepage doesn't link to /adelaide, /melbourne, /perth — Google has no crawl path.

**Fix:**
- [ ] Check homepage for location page links in navigation/footer
- [ ] If not present, add "Our Locations" or "Factory Visit Services in Your City" section to homepage
- [ ] Link from homepage hero section to location pages
- [ ] Ensure nav has links to all 4 location pages (sydney, adelaide, melbourne, perth)

**Estimated effort:** 1 hour

---

## MEDIUM PRIORITY (Fix within 1 month)

### 🔲 7. Optimize Title Tags for High-Intent Keywords

**Problem:** "china sourcing agent australia" has 48 impressions at position 44 — page not optimized.

**Fix:**
- [ ] Identify which page ranks for this query (likely /about or /services)
- [ ] Update title tag to include "China Sourcing Agent Australia" as primary phrase
- [ ] Update meta description to mention Australia + sourcing agent value proposition
- [ ] Add H2 heading with the keyword phrase

---

### 🔲 8. Add External Authority Links

**Problem:** 0/25 articles link to authoritative sources (SGS, BSI, CNCA, SAMR).

**Fix:**
- [ ] Add links to CNCA registry (cnca.gov.cn) for certification verification
- [ ] Add SGS link (sgs.com) for third-party inspection services
- [ ] Add BCCIQ report link for Australian-China supply chain data
- [ ] Add SAMR link (samr.gov.cn) for Chinese regulatory information

**Example placement:**
```mdx
All partner manufacturers maintain ISO 9001 and ISO 14001 certifications — verifiable through the [CNCA certification registry](https://www.cnca.gov.cn).
```

---

### 🔲 9. Add Service Schema to Location Pages

**Problem:** Location pages (adelaide, sydney, melbourne, perth) lack LocalBusiness/Service schema.

**Fix:**
- [ ] Add JSON-LD Service schema to each location page
- [ ] Include: serviceType, provider, areaServed, hasOfferCatalog
- [ ] Reference: `.claude/skills/seo/references/schema-types.md`

---

### 🔲 10. Fix Meta Descriptions

**Problem:** Articles don't include primary keyword in first 120 characters of meta description.

**Fix:**
- [ ] Update all 25 MDX frontmatter `description` field to include primary keyword within first 120 chars
- [ ] Example for Adelaide article:
  - Current: "Adelaide SME owners can access direct factory visits..."
  - Better: "Adelaide China factory visit service for SME importers — professional verification..."

---

## LOW PRIORITY (Backlog)

### 🔲 11. Run Full Content Analysis
**Command:** `/seo content www.winningadventure.com.au`
**Purpose:** Readability scores, thin content flags, E-E-A-T detailed assessment

### 🔲 12. Run Full Image Audit
**Command:** `/seo images www.winningadventure.com.au`
**Purpose:** Alt text check, oversized images, format optimization

### 🔲 13. Run Backlink Analysis
**Command:** `/seo backlinks www.winningadventure.com.au`
**Purpose:** DA/PA scores, referring domains, toxic link detection

### 🔲 14. Add Review Schema
**Purpose:** Aggregate ratings for WAG services (if testimonials exist)

### 🔲 15. Blog Article Image Audit
**Purpose:** Verify all blog images use correct path `public/social/blog/{slug}/`

---

## IMPLEMENTATION ROADMAP

### Week 1 (CRITICAL + HIGH)
- Day 1-2: Fix author name conflict, submit URLs to Indexing API, preload LCP image
- Day 3-5: Expand melbourne + brisbane articles, update llms.txt, add homepage links

### Week 2-4 (MEDIUM)
- Title tag optimization for top queries
- Add external authority links across all articles
- Service schema on location pages
- Meta description updates

### Month 2+ (LOW)
- Full content + image audit
- Backlink analysis
- Review schema

---

## NOTES

- **Local SEO:** WAG is a local service business (Australia-based, serving Australian businesses). Consider running `/seo local www.winningadventure.com.au` for deeper GBP (Google Business Profile) analysis.
- **Maps:** If WAG has a physical office in Adelaide, verify Google Business Profile is claimed and optimized.
- **Google Business Profile:** Check if WAG has a GBP listing — if not, creating one would significantly help local discovery.

---

*Action plan generated from SEO audit. Track progress and update as items are completed.*