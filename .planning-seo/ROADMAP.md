# Roadmap: WAG SEO Ranking Project

## Overview

Improve Google Australia rankings for target keywords to drive enquiry form submissions. WAG is a B2B service connecting Australian businesses with verified Chinese factories via factory tours. Core differentiator: trust and verification for businesses afraid of 1688/Alibaba. Journey: fix technical foundations (sitemap, schema, Core Web Vitals), establish topic cluster architecture with internal linking, build local SEO presence (GBP, NAP), create authoritative pillar content, then acquire links.

## Phases

- [ ] **Phase 1: Technical SEO Foundation** - Fix sitemap, schema, metadata issues blocking discovery
- [ ] **Phase 2: Core Web Vitals** - Optimize LCP, CLS, INP for mobile-first indexing
- [ ] **Phase 3: Architecture + Local SEO** - Implement topic clusters, internal linking, GBP, NAP
- [ ] **Phase 4: Content Strategy** - Keyword research, pillar content, case studies, E-E-A-T signals
- [ ] **Phase 5: Authority Building** - HARO, guest posts, Australian trade backlinks

## Phase Details

### Phase 1: Technical SEO Foundation
**Goal**: Search engines can discover, crawl, and index all content without technical barriers
**Depends on**: Nothing (first phase)
**Requirements**: TECH-01, TECH-02, TECH-03, TECH-04, TECH-05, TECH-06
**Success Criteria** (what must be TRUE):
  1. Sitemap.xml includes all blog post URLs (verified via `curl sitemap.xml`)
  2. FAQSchema visible in page source (not client-side, view-source shows JSON-LD)
  3. Blog generateMetadata uses frontmatter primaryKeyword (not hardcoded)
  4. Blog posts include Article/TechArticle schema in page source
  5. Blog posts include BreadcrumbList schema in page source
  6. All pages have correct canonical URLs (no duplicates)
**Plans**: TBD

Plans:
- [ ] 01-01: Fix sitemap (delete static, implement next-sitemap)
- [ ] 01-02: Convert FAQSchema to server component
- [ ] 01-03: Fix blog generateMetadata
- [ ] 01-04: Add Article/TechArticle schema to blog posts
- [ ] 01-05: Add BreadcrumbList schema to blog posts
- [ ] 01-06: Audit and fix canonical URLs

### Phase 2: Core Web Vitals
**Goal**: Users experience fast page loads on mobile devices (LCP < 2.5s)
**Depends on**: Phase 1
**Requirements**: PERF-01, PERF-02, PERF-03
**Success Criteria** (what must be TRUE):
  1. Mobile LCP measured < 2.5s via PageSpeed Insights
  2. All next/image components have explicit width/height (no CLS shift)
  3. INP (Interaction to Next Paint) meets Good threshold (< 200ms)
**Plans**: TBD

Plans:
- [ ] 02-01: Fix mobile LCP (self-host Unsplash hero images, add priority prop)
- [ ] 02-02: Add explicit width/height to all next/image components
- [ ] 02-03: Verify INP meets threshold

### Phase 3: Architecture + Local SEO
**Goal**: Users can navigate related content via topic clusters, and find consistent local business info
**Depends on**: Phase 1 (internal linking builds on fixed sitemap/schema)
**Requirements**: ARCH-01, ARCH-02, ARCH-03, ARCH-04, ARCH-05, LOCAL-01, LOCAL-02, LOCAL-03, LOCAL-04
**Success Criteria** (what must be TRUE):
  1. /services page links to all 9 blog posts grouped by cluster
  2. Each blog post links back to /services pillar page
  3. Related posts section displays on each blog post (within same cluster)
  4. Breadcrumb navigation visible on blog post pages
  5. Author byline links to /about page (E-E-A-T signal)
  6. Google Business Profile claimed and optimized
  7. NAP consistent across site and all directories
  8. Person schema for founder Andy Liu visible in page source
**Plans**: TBD

Plans:
- [ ] 03-01: Implement bidirectional topic cluster linking
- [ ] 03-02: Add breadcrumb navigation to blog posts
- [ ] 03-03: Link author bylines to About page
- [ ] 03-04: Add related posts section to blog posts
- [ ] 03-05: Add Organization schema to homepage
- [ ] 03-06: Claim/optimize Google Business Profile
- [ ] 03-07: Audit and fix NAP consistency
- [ ] 03-08: Submit to Australian business directories (19+)
- [ ] 03-09: Add Person schema for Andy Liu

### Phase 4: Content Strategy
**Goal**: Users find comprehensive, authoritative content matching their search intent
**Depends on**: Phase 3 (architecture enables proper content internal linking)
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06
**Success Criteria** (what must be TRUE):
  1. Keyword-to-URL mapping document created with primary/secondary assignments
  2. Pillar guide (3000+ words) published targeting primary keyword
  3. Industry landing page published for automotive OR AV vertical
  4. All pages have unique meta descriptions (no duplicates)
  5. At least 2 case studies published with specific outcomes
  6. AI-generated content includes author experience credentials (E-E-A-T signals)
**Plans**: TBD

Plans:
- [ ] 04-01: Conduct keyword research and create mapping document
- [ ] 04-02: Create 3000+ word ultimate pillar guide
- [ ] 04-03: Create industry landing page (automotive OR AV)
- [ ] 04-04: Audit and fix unique meta descriptions
- [ ] 04-05: Publish 2+ case studies
- [ ] 04-06: Add E-E-A-T signals to AI-generated content

### Phase 5: Authority Building
**Goal**: Users discover WAG through external authoritative sources (HARO, guest posts, trade publications)
**Depends on**: Phase 4 (content assets exist to promote)
**Requirements**: LINK-01, LINK-02, LINK-03
**Success Criteria** (what must be TRUE):
  1. HARO/Connectively profile active with expert responses submitted
  2. At least 1 guest post published on DA 40+ site relevant to Australian B2B sourcing
  3. Backlinks acquired from Australian trade/publication sources
**Plans**: TBD

Plans:
- [ ] 05-01: Set up HARO/Connectively profile and submit responses
- [ ] 05-02: Guest post outreach to Australian B2B blogs (DA 40+)
- [ ] 05-03: Acquire backlinks from Australian trade publications

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Technical SEO Foundation | 0/6 | Not started | - |
| 2. Core Web Vitals | 0/3 | Not started | - |
| 3. Architecture + Local SEO | 0/9 | Not started | - |
| 4. Content Strategy | 0/6 | Not started | - |
| 5. Authority Building | 0/3 | Not started | - |
