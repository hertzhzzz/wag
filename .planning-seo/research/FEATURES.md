# Feature Research: WAG SEO

**Domain:** B2B Sourcing/Consulting Service SEO
**Researched:** 2026-03-19
**Confidence:** MEDIUM

> Note: Search results heavily rate-limited during research. Findings based on limited web search + industry knowledge + existing blog content analysis. Recommend validation through competitor analysis with Ahrefs/Semrush.

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or Google wont rank you.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Optimized meta titles and descriptions** | Users scan SERPs; descriptions influence CTR | LOW | Already implemented in existing blog posts with seoTitle frontmatter |
| **Schema markup (LocalBusiness, Service, Organization)** | Helps Google understand business context; enables rich results | MEDIUM | Next.js can use @schemaorg schemas or manual JSON-LD |
| **XML sitemap** | Table stakes for crawlability | LOW | Next.js generates sitemap.xml automatically |
| **Mobile-responsive design** | 60%+ searches on mobile; Google uses mobile-first indexing | LOW | WAG already has responsive layout (v1.0 complete) |
| **Fast page load (Core Web Vitals)** | Google ranking factor; LCP target <2.5s | MEDIUM | Known issue: WAG LCP 5.4s on mobile (Unsplash image source) |
| **Internal linking structure** | Helps Google crawl and understand site hierarchy | LOW | Blog posts already link between resources and services |
| **Author byline with credentials (E-E-A-T)** | YMYL-adjacent content requires trust signals | LOW | WAG already has "Andy Liu, Founder" bylines |
| **Clear NAP (Name, Address, Phone)** | Local SEO foundation; Google Business Profile requires consistency | LOW | Should appear in footer and contact page |
| **HTTPS** | Baseline security expectation | LOW | Vercel provides automatic HTTPS |
| **Canonical URLs** | Prevents duplicate content issues | LOW | Next.js App Router handles this |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable for ranking above competitors.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Long-form ultimate guides (3000+ words)** | Targets informational intent; earns backlinks; establishes authority | MEDIUM | WAG has "7 Things I Learned" (15 min read) and "China Sourcing Risks" (10 min read) - good foundation |
| **Original data/research** | Stand out from generic content; earns links and shares | HIGH | "200+ factory visits" is original data; leverage this more |
| **Case studies with specific outcomes** | Proves capability; converts high-intent visitors | MEDIUM | WAG does not have explicit case studies yet |
| **Industry-specific landing pages** | Targets vertical keywords (automotive, AV equipment) | MEDIUM | Currently only generic "china sourcing" content; need vertical pages |
| **Video content (factory tour footage)** | Engages users; YouTube SEO extends reach; demonstrates reality | HIGH | Competitors likely have static images only |
| **Interactive tools (cost calculator, supplier quiz)** | Engages users; differentiates; collects leads | HIGH | Not present in current WAG site |
| **Australian supplier verification checklist (gated)** | Lead magnet; targets high-intent "verify supplier" keywords | MEDIUM | Could be PDF download in exchange for email |
| **Google Business Profile with posts** | Local pack visibility; fresh content signal; customer trust | MEDIUM | WAG should claim and actively manage GBP |
| **Featured snippet optimization** | Position 0; voice search visibility | MEDIUM | Structure content with clear Q&A and numbered lists |
| **Competitor backlink analysis** | Identify linking opportunities competitors have | LOW | Use free tools (Google search manual) or paid (Ahrefs) |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Blog posts on every industry vertical (auto, AV, electronics, etc.)** | Seem like reaching more keywords | Thin content hurts rankings;分散精力 | Start with 1-2 verticals where you have real expertise |
| **Daily or weekly blog publishing** | "More content = more rankings" myth | AI-generated quantity content damages E-E-A-T; quality matters more | 1-2 thorough pieces per month beats 8 shallow ones |
| **Social media posting (LinkedIn, Facebook) for SEO** | Cross-promotion seems valuable | Social signals not direct ranking factor; splits focus | Only if genuinely useful for audience (not for links) |
| **Guest posting on low-quality directories** | Quick link building | Spammy links can penalize;浪费时间 | Focus on industry-specific, authoritative sites only |
| **Auto-generated meta descriptions** | Efficiency | Often poor quality; miss keyword opportunities | Write unique meta descriptions per page |
| **Keyword stuffing in content** | "More keywords = more ranking" outdated tactic | Harms readability; triggers spam detection | Natural keyword use; semantically related terms instead |
| **Separate mobile site (m.example.com)** | Historical best practice | Duplication issues; Google recommends responsive | Keep responsive design (already done) |

## Feature Dependencies

```
[Long-form Guides]
    └──requires──> [Original Research/Data]
                       └──requires──> [Expert Credentials (E-E-A-T)]

[Industry-specific Landing Pages]
    └──requires──> [Keyword Research per Vertical]

[Google Business Profile Optimization]
    └──requires──> [NAP Consistency Audit]
                       └──requires──> [Footer/Contact Page Update]

[Featured Snippet Optimization]
    └──requires──> [Content Structure with Q&A]

[Case Studies]
    └──requires──> [Client Success Stories (need to collect)]

[Video Content]
    └──requires──> [Production Resources]
```

### Dependency Notes

- **Long-form guides require original research:** WAG's "200+ factory visits" and "8 years experience" is original data that should be referenced throughout. This is a competitive advantage not easily copied.
- **Industry landing pages require keyword research:** Before creating pages for "car parts sourcing china" or "av equipment sourcing china," validate search volume and competition. Do not assume all verticals equally valuable.
- **GBP optimization requires NAP consistency:** If WAG has different address/phone across directories, this hurts local SEO. Audit first.
- **Featured snippets require structured content:** Q&A format within blog posts, FAQ sections, clear numbered steps.

## MVP Definition

### Launch With (v1)

Minimum viable product -- what is needed to validate SEO direction.

- [ ] **Schema markup (LocalBusiness + Service)** -- Help Google understand WAG as a service business, not a product seller
- [ ] **Google Business Profile claim and optimize** -- Free; directly helps local search visibility
- [ ] **1 ultimate guide targeting primary keyword** -- "china factory tour" or "china sourcing australia" as pillar content
- [ ] **Meta description audit** -- Ensure all blog posts have unique, compelling descriptions
- [ ] **Internal linking audit** -- Ensure blog posts link to service pages and vice versa
- [ ] **NAP consistency check** -- Verify address/phone correct across site and GBP

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] **Industry-specific landing page (automotive OR AV first)** -- Expand keyword reach to vertical terms
- [ ] **Case study format content** -- 1-2 detailed client success stories with specific outcomes
- [ ] **Featured snippet optimization on existing guides** -- Restructure content for position 0
- [ ] **Backlink outreach for existing guides** -- Reach out to sites linking to generic China sourcing content

### Future Consideration (v2+)

Features to defer until product-market fit established.

- [ ] **Video content production** -- YouTube channel; factory tour footage; requires production budget
- [ ] **Interactive tool (supplier verification quiz)** -- Lead gen; requires development resources
- [ ] **Gated content (verification checklist PDF)** -- Email capture; requires design and email infrastructure
- [ ] **Multiple vertical landing pages** -- Only if first vertical performs well

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Google Business Profile optimization | HIGH | LOW | P1 |
| Schema markup (LocalBusiness + Service) | HIGH | MEDIUM | P1 |
| Long-form pillar guide | HIGH | MEDIUM | P1 |
| Meta description audit | MEDIUM | LOW | P1 |
| Internal linking audit | MEDIUM | LOW | P1 |
| NAP consistency check | MEDIUM | LOW | P1 |
| Industry landing page (automotive OR AV) | HIGH | MEDIUM | P2 |
| Featured snippet optimization | MEDIUM | MEDIUM | P2 |
| Case study content | HIGH | MEDIUM | P2 |
| Backlink outreach | MEDIUM | MEDIUM | P2 |
| Video content | MEDIUM | HIGH | P3 |
| Interactive tools | MEDIUM | HIGH | P3 |
| Gated content (PDF checklist) | MEDIUM | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch (or near-term)
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

Based on web search limitations, recommend direct competitor analysis using Ahrefs/Semrush. However, general observations from search results:

| Feature | Generic China Sourcing Blog | WAG Approach | Notes |
|---------|---------------------------|--------------|-------|
| Content length | 500-1000 words | 1500-3000 words (good) | WAG exceeds typical competitor |
| Author credentials | Often anonymous or generic | "Andy Liu, Founder" (good) | WAG has E-E-A-T advantage |
| Original data | Rare | "200+ visits, 8 years" (good) | WAG has differentiation |
| Industry verticals | Generic only | None yet (gap) | WAG could dominate auto/AV |
| Case studies | Rare in consulting niche | None yet (gap) | Opportunity to differentiate |
| Video content | Rare | None yet | Opportunity to differentiate |
| GBP presence | Inconsistent | Not claimed (gap) | P1 priority for WAG |
| Local citations | Varies | Not audited | P1 priority for WAG |

**Key insight:** WAG's existing content quality (depth, author credentials, original experience) is already above typical competitor level. The main gaps are:
1. Google Business Profile (local SEO)
2. Industry-specific landing pages
3. Case studies

## Content Type Analysis for Target Keywords

Based on SERP observation and content analysis:

| Keyword Type | Intent | Best Content Type | WAG Status |
|-------------|--------|-------------------|-------------|
| "china sourcing australia" | Informational + slight commercial | Ultimate guide (3000+ words) | Existing "china-sourcing-risks" covers related terms |
| "china factory tour" | Informational + commercial | How-to guide + service page | Existing "china-factory-tour-guide" is strong |
| "verify chinese supplier" | High commercial intent | Step-by-step guide + CTA | Existing "verify-chinese-supplier" covers well |
| "car parts sourcing china" | Vertical-specific informational | Industry landing page + guide | NOT covered - needs new content |
| "av equipment sourcing china" | Vertical-specific informational | Industry landing page + guide | NOT covered - needs new content |
| "factory inspection service" | High commercial intent | Service page + case study | Partially covered in services |
| Long-tail "what to check before visiting factory" | Informational | FAQ/guide | Covered in existing content |

**Content type recommendations by keyword cluster:**

1. **Primary cluster ("china sourcing australia", "china factory tour"):**
   - Keep existing long-form guides
   - Add clearer CTAs to service pages
   - Interlink aggressively

2. **Verification cluster ("verify chinese supplier", "supplier verification"):**
   - WAG already has strong content
   - Add downloadable checklist (lead gen opportunity)

3. **Vertical cluster ("car parts", "av equipment"):**
   - Create dedicated landing pages
   - Partner with or reference industry-specific content

## On-Page SEO Factors by Importance

Based on 2026 SEO best practices (sources: Search Engine Journal, Bluehost, MyTasker):

| Factor | Importance | WAG Status | Action |
|--------|------------|------------|--------|
| **E-E-A-T (Experience)** | HIGH | GOOD | Leverage "200+ factory visits"; add specific case details |
| **Content depth/comprehensiveness** | HIGH | GOOD | Existing guides are thorough |
| **Title tag optimization** | HIGH | GOOD | Already using seoTitle frontmatter |
| **Internal linking** | MEDIUM | NEEDS AUDIT | Check all posts link to services |
| **Page speed (Core Web Vitals)** | HIGH | NEEDS FIX | LCP 5.4s on mobile; image optimization needed |
| **Schema markup** | MEDIUM | NEEDS IMPLEMENT | Add LocalBusiness + Service schemas |
| **Meta descriptions** | MEDIUM | NEEDS AUDIT | Ensure unique descriptions per page |
| **Mobile usability** | HIGH | GOOD | Responsive layout complete |
| **HTTPS** | BASELINE | GOOD | Vercel provides this |
| **Image alt text** | LOW-MEDIUM | ASSUME OK | Check blog images have alt text |
| **URL structure** | LOW | GOOD | Clean /resources/[slug] structure |

## Link Building Strategies for B2B Sourcing Niche

Based on search results showing link building agency recommendations:

### Recommended (White Hat)

| Strategy | How | Difficulty |
|----------|-----|------------|
| **Digital PR / Earned media** | PR for factory visit stories, industry insights | MEDIUM |
| **Expert quotes** | Become source for journalists covering Australia-China trade | LOW-MEDIUM |
| **Guest posting on industry sites** | Supply chain, manufacturing, Australian business blogs | MEDIUM |
| **Create linkable assets** | Original research ("State of China Sourcing for Australian Businesses 2026") | MEDIUM |
| **Directory listings** | Industry-specific directories, Australian business directories | LOW |
| **Niche edits** | Add links to existing relevant content on other sites | MEDIUM |

### Avoid (Black Hat/Poor ROI)

| Strategy | Why Avoid |
|----------|-----------|
| PBN networks | Risk of penalty; poor ROI |
| Paid link exchanges | Against Google guidelines |
| Low-quality directory submissions | Spammy; no value |
| Automated link building | Risk of penalty |

### WAG Link Building Priorities

1. **Claim Google Business Profile** (free; local signal)
2. **Australian business directories** (True Local, Start Local, Australian Business Register)
3. **Industry directories** (manufacturing, supply chain, import/export)
4. **Guest post outreach** to Australian business blogs / podcasts
5. **Create original research** that earns links organically

## Local SEO Factors for Australian Market

Based on local SEO best practices (Breakthrough Local, SearchXperts, localo.com):

### Must Have

| Factor | Description | WAG Status |
|--------|-------------|------------|
| **Google Business Profile** | Claim and verify; complete all fields; add photos | NOT CLAIMED (gap) |
| **NAP consistency** | Name, Address, Phone identical everywhere | NOT AUDITED |
| **Business categories** | Primary + secondary categories on GBP | N/A |
| **Business hours** | Include special hours for China visits | N/A |
| **Google Posts** | Regular updates (2-3x per month) | N/A |
| **Photos/Videos** | Authentic photos, not stock | N/A |

### Important for Australia

| Factor | Description | Priority |
|--------|-------------|----------|
| **Australian business directories** | True Local, Start Local, ozbacktour | MEDIUM |
| **Industry-specific directories** | Supply chain, manufacturing associations | MEDIUM |
| **Local keywords in content** | "China sourcing for Australian businesses" | ALREADY DONE |
| **Local link signals** | Australian websites linking to WAG | LOW-MEDIUM |
| **Review generation** | Ask satisfied clients to review on GBP | MEDIUM |

## Content Freshness and Update Frequency

Based on SEO best practices (Bluehost 2026 guide, Outbrain tips):

### Content Freshness Factors

| Factor | Recommendation | WAG Status |
|--------|----------------|-------------|
| **Publish date visibility** | Show "Updated [date]" on all posts | GOOD - frontmatter includes date |
| **Content update process** | Review guides annually; update statistics, links | NEEDS PROCESS |
| **Blog posting frequency** | 1-2 quality posts > 8 mediocre posts | WAG has 9 posts; needs consistency |
| **Google Business Profile posts** | 2-3 per month | NOT STARTED |
| **Internal linking updates** | When adding new content, update old relevant posts | NOT DONE systematically |

### Recommended Update Cadence

| Content Type | Freshness Frequency |
|--------------|--------------------|
| Blog posts (guides) | Update when data/claims change; minimum annual review |
| Service pages | Review quarterly; update as services change |
| GBP posts | 2-3x per month (use templates) |
| Statistics/claims | Update with new data as available |
| Contact/info pages | Review when anything changes |

### Warning Signs Content is Stale

- "Published 2+ years ago" without update notice
- Statistics from before 2024
- Links to outdated resources
- Missing information on new developments (e.g., new regulations)

## Sources

- Search Engine Journal: Google Business Profile guide
- Bluehost: WordPress SEO settings 2026
- MyTasker: Google ranking factors 2026
- Content Marketing Institute: B2B Content Trends 2026
- localo.com: Local business schema guide
- Overthink Group: B2B SEO content strategy
- Prodigy: B2B SEO copywriting
- Scribly Media: B2B content marketing
- SearchXperts: Local SEO services
- Breakthrough Local: Local SEO strategies
- WAG existing blog content (analyzed 3 representative posts)

## Research Gaps

- [ ] **Competitor backlink analysis** -- Need Ahrefs/Semrush to see what links competitors have
- [ ] **Keyword volume data** -- Search volume for target keywords unverified
- [ ] **SERP feature analysis** -- Whether featured snippets, people also ask boxes exist for target keywords
- [ ] **Industry vertical demand** -- Whether "car parts sourcing china" has enough search volume to justify dedicated page

## Validation Needed

1. Claim Google Business Profile and audit for completeness
2. Run site through PageSpeed Insights to confirm LCP issue
3. Check current NAP consistency across site
4. Use Ahrefs/Semrush for competitor backlink analysis
5. Validate keyword volumes with keyword research tool

---

*Feature research for: WAG SEO project*
*Researched: 2026-03-19*
*Confidence: MEDIUM (search rate limits affected research depth)*
