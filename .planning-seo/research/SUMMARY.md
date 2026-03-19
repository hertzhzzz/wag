# Project Research Summary

**Project:** WAG SEO Project
**Domain:** B2B Sourcing/Consulting Service SEO (Australian Market)
**Researched:** 2026-03-19
**Confidence:** MEDIUM

## Executive Summary

WAG is an Australian B2B sourcing service helping companies safely procure from Chinese manufacturers via factory tours and supplier verification. The current website has a solid foundation with 9 blog posts using MDX, Next.js 14 App Router, and a well-configured layout with metadata. However, the site suffers from three critical issues preventing SEO growth: (1) a manually-maintained static sitemap missing all blog URLs, (2) client-side FAQSchema rendering that prevents rich result indexing, and (3) poor Core Web Vitals with LCP at 5.4s due to Unsplash image hosting. The path forward is a hub-and-spoke topic cluster architecture centered on two pillars — Factory Tours and Bulk Procurement — with WAG's competitive differentiator being founder Andy Liu's 200+ factory visits and 8 years hands-on experience (E-E-A-T signals competitors lack).

Research indicates WAG should prioritize technical SEO fixes (sitemap, schema, Core Web Vitals) before content expansion. The current 9 blog posts are high quality (1500-3000 words, author credentials, original experience data) but lack internal linking to pillar pages and proper cluster organization. A lightweight stack of free tools (Google Search Console, Ahrefs Webmaster, Google Keyword Planner) plus next-sitemap for automation will suffice until content volume justifies paid tools.

Key risks: AI-generated content without E-E-A-T signals will trigger Helpful Content penalties; thin vertical-specific landing pages will dilute ranking authority; and Core Web Vitals failure (mobile LCP 5.4s) directly harms mobile rankings. Mitigation requires: server-side schema, self-hosted hero images, and content that leverages WAG's irreplaceable field experience.

## Key Findings

### Recommended Stack

**Summary from STACK.md** — WAG's existing tech stack is well-suited but lacks automation. Next.js 14 with Metadata API is already correctly configured for titles, descriptions, Open Graph, and canonical URLs. The critical gaps are: (1) no automated sitemap generation (using static `public/sitemap.xml`), and (2) no Core Web Vitals monitoring beyond manual checks. The recommended stack leverages free authoritative tools.

**Core technologies:**
- **Google Search Console** — Keyword performance, indexing status, Core Web Vitals monitoring; primary data source for existing traffic
- **Ahrefs Webmaster Tools** (free) — Backlink monitoring, domain authority tracking; sufficient for SMB-level monitoring
- **Google Keyword Planner** — Search volume and competition for Australian market; directly from Google, most reliable for local data
- **next-sitemap** — Automated `sitemap.xml` and `robots.txt` at build time; replaces manual static sitemap that misses blog URLs
- **Notion** (free) — SEO content calendar and keyword tracking; visual, works with existing workflow
- **MDX + gray-matter** — Blog content authoring; WAG already uses this; keeps content in Git, simple workflow

**Avoid:** SEMrush ($120+/month enterprise), Ahrefs paid plans ($99+/month), Yoast SEO (WordPress-specific), all-in-one Next.js SEO plugins (bloat — WAG already has Metadata API)

### Expected Features

**Summary from FEATURES.md** — WAG's content quality exceeds typical competitor level (longer guides, author credentials, original experience data). The main gaps are Google Business Profile (not claimed) and industry-specific landing pages. Content prioritization should focus on earning links through original research and case studies, not volume.

**Must have (table stakes):**
- Optimized meta titles and descriptions — WAG already has `seoTitle` frontmatter but needs audit for uniqueness
- Schema markup (LocalBusiness, Service, Organization) — Missing on service pages; FAQPage only on About
- XML sitemap — Critical gap: current static sitemap misses all 9 blog posts
- Mobile-responsive design — Already implemented (v1.0 complete)
- Fast page load (Core Web Vitals) — Critical gap: LCP 5.4s on mobile from Unsplash images
- Internal linking structure — Weak: blog posts don't link back to service pillar pages
- Author byline with credentials (E-E-A-T) — Good: Andy Liu credentials present
- Clear NAP consistency — Not audited: GBP not claimed
- HTTPS — Already provided by Vercel
- Canonical URLs — Generally correct but needs verification on filtered views

**Should have (competitive differentiators):**
- Long-form ultimate guides (3000+ words) — WAG has strong foundation (15-min and 10-min guides)
- Original data/research — WAG's "200+ factory visits" is unique data; leverage more prominently
- Case studies with specific outcomes — Gap: none exist yet
- Industry-specific landing pages — Gap: automotive, AV equipment verticals not covered
- Google Business Profile with posts — Critical gap: not claimed
- Featured snippet optimization — Q&A structure not implemented in existing content

**Defer (v2+):**
- Video content (factory tour footage) — Requires production budget; YouTube channel
- Interactive tools (supplier verification quiz) — Lead gen; requires dev resources
- Gated content (verification checklist PDF) — Email capture; requires design + email infra
- Multiple vertical landing pages — Only if first vertical performs well

### Architecture Approach

**Summary from ARCHITECTURE.md** — WAG needs to shift from flat blog listing to intentional topic clusters. The recommended architecture is Hub-and-Spoke with two distinct clusters (Factory Tours, Bulk Procurement) radiating from the `/services` pillar page. The current architecture has orphan blog posts (no links from pillar) and generic sidebar CTAs that miss clustering opportunities. URL structure should remain flat (`/resources/[slug]`) since site is small (<20 posts). The critical architectural change is bidirectional internal links: pillar page must link to ALL cluster content; each blog post must link back to pillar AND 2-3 related posts.

**Major components:**
1. **Homepage (/)** — Topical hub; must link to both `/services` clusters and featured blog posts from each cluster
2. **Services (/services)** — Primary pillar page for both topic clusters; must comprehensively link to all 9 blog posts grouped by cluster
3. **Blog posts (/resources/[slug])** — Cluster content; must link back to `/services` pillar, author byline links to `/about`, and include related posts section

### Critical Pitfalls

**Top 5 from PITFALLS.md:**

1. **Client-Side FAQSchema Rendering** — JSON-LD in client components invisible to crawlers; must move to server component or inject via `generateMetadata`
2. **Static/Outdated Sitemap** — Current `public/sitemap.xml` manually maintained with hardcoded dates, missing all 9 blog URLs; use `app/sitemap.ts` with dynamic generation
3. **Thin AI-Generated Content Without E-E-A-T** — Google's Helpful Content Update penalizes generic content; WAG's experience data ("200+ factory visits") is critical differentiator that must be explicit
4. **Keyword Cannibalization** — Multiple pages target identical keywords; requires keyword-to-URL mapping before content creation
5. **Image Core Web Vitals (LCP 5.4s)** — Unsplash CDN images add 2-3s to LCP; hero images must be self-hosted with `priority` prop

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Technical SEO Foundation
**Rationale:** Sitemap and schema issues block all other SEO work. Google cannot discover content that is missing from sitemap, and client-side schema prevents rich result indexing. These are prerequisite fixes that take 1-2 hours but have outsized impact.
**Delivers:** Dynamic sitemap generation (app/sitemap.ts), server-side FAQSchema, Organization schema on homepage, Service schema on /services page, canonical tag audit
**Addresses:** Pitfalls 1, 2, 7, 5 (FAQSchema, sitemap, service schema, canonicals)
**Avoids:** Sitemap missing blog URLs causing content go und_indexed

### Phase 2: Core Web Vitals Optimization
**Rationale:** Mobile LCP of 5.4s directly harms mobile rankings. With 60%+ searches on mobile and Google using mobile-first indexing, this is a critical ranking factor that also degrades user experience.
**Delivers:** Self-hosted hero images, next/image optimization with priority props, explicit width/height on all images, Unsplash images moved to remotePatterns or replaced
**Addresses:** Pitfall 6 (Image/LCP issues), Pitfall 9 (INP from heavy client components)
**Avoids:** Continued Core Web Vitals penalties

### Phase 3: Internal Linking & Topic Cluster Architecture
**Rationale:** The single highest-impact architectural change available. Current blog posts are orphaned from pillar pages. Implementing bidirectional links between `/services` and all 9 blog posts, plus related posts sections, establishes topic authority signals.
**Delivers:** Updated /services page linking to all cluster content, related posts section on each blog, blog listing organized by category (Factory Tours | Procurement), breadcrumb navigation
**Addresses:** Cluster architecture from ARCHITECTURE.md, internal linking strategy
**Avoids:** Orphan blog posts with no link equity flow

### Phase 4: Local SEO & GBP
**Rationale:** Google Business Profile is free and directly improves local search visibility. WAG has not claimed it, which is a critical gap for local SEO. NAP consistency audit must precede GBP claim.
**Delivers:** Claimed and optimized Google Business Profile, NAP consistency across site and directories, Australian business directory citations
**Addresses:** Table stakes (NAP), Differentiator (GBP with posts), Pitfall (NAP inconsistency)
**Avoids:** Inconsistent NAP across directories hurting local ranking

### Phase 5: Keyword Research & Content Mapping
**Rationale:** Before creating new content or industry-specific landing pages, keyword mapping prevents cannibalization. This phase creates the document that guides all future content.
**Delivers:** Keyword-to-URL mapping spreadsheet, primary/secondary keyword assignments per page, gap analysis for unaddressed keywords
**Addresses:** Pitfall 4 (Keyword cannibalization), FEATURES.md vertical landing page prerequisites
**Avoids:** Multiple pages competing for same keywords

### Phase 6: Content Enhancement & E-E-A-T Signals
**Rationale:** Existing content is high quality but can be enhanced with author credentials, experience signals, and FAQ schema. This phase converts existing content into linkable assets.
**Delivers:** Author byline links to /about on all posts, "200+ factory visits" prominence in content, FAQPage schema added to blog posts, meta description uniqueness audit
**Addresses:** Pitfall 3 (E-E-A-T), Pitfall 10 (Duplicate meta descriptions)
**Avoids:** E-E-A-T penalties from thin AI content

### Phase 7: Pillar Content Creation (v1)
**Rationale:** First original pillar content piece targeting primary keyword cluster. This establishes WAG's authority on "china sourcing australia" or "china factory tour."
**Delivers:** One 3000+ word ultimate guide targeting primary keyword, with internal links to services and related posts
**Addresses:** FEATURES.md MVP (ultimate guide), original research differentiation
**Avoids:** Thin content from covering too many verticals

### Phase 8: Case Studies & Linkable Assets
**Rationale:** Case studies prove capability and are high-value linkable assets for B2B. This phase creates content that earns links organically.
**Delivers:** 1-2 detailed case studies with specific outcomes, original research publication
**Addresses:** FEATURES.md differentiator (case studies), link building strategy
**Avoids:** Thin case studies that don't differentiate

### Phase 9: Industry Vertical Landing Pages
**Rationale:** Only after primary keyword clusters are established and validated should WAG expand to verticals. First vertical (automotive OR AV) should be chosen based on keyword research data from Phase 5.
**Delivers:** 1 industry-specific landing page targeting vertical keywords (e.g., "car parts sourcing china"), supporting content for that vertical
**Addresses:** FEATURES.md P2 (industry landing page)
**Avoids:** Thin content on multiple verticals before authority established

### Phase 10: Authority Building & Link Acquisition
**Rationale:** After content assets exist, outreach and earned media build backlinks. HARO responses and guest posts on Australian industry sites are highest quality for B2B sourcing niche.
**Delivers:** HARO response strategy, guest post outreach to Australian manufacturing/procurement blogs, Australian business directory citations
**Addresses:** Pitfall 8 (bad link building), link building strategy from STACK.md
**Avoids:** PBN links, irrelevant guest posts, link exchanges

### Phase Ordering Rationale

1. **Technical foundations first** — Sitemap and Core Web Vitals are prerequisites; nothing else matters if Google cannot crawl or if mobile UX is broken
2. **Architecture before content** — Internal linking strategy must be established before creating new content; prevents orphan pages
3. **Local SEO early** — GBP is free and provides immediate local visibility; low effort, high impact
4. **Keyword mapping before creation** — Prevents cannibalization; ensures new content fills gaps rather than competing
5. **E-E-A-T before scale** — Enhance existing content with experience signals before adding more content
6. **Vertical expansion last** — Only after core authority established; validates one vertical before committing to multiple

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 5 (Keyword Research):** Need actual search volume and competition data for Australian market; current research based on inference not verified keyword tools
- **Phase 7 (Pillar Content):** Need to validate primary keyword choice with keyword research first
- **Phase 9 (Vertical Pages):** Need to validate whether automotive or AV vertical has sufficient search demand

Phases with standard patterns (skip research-phase):
- **Phase 1 (Technical SEO):** Well-documented patterns; next-sitemap and server-component schema have clear implementations
- **Phase 2 (Core Web Vitals):** Known fix patterns for Unsplash LCP issue; next/image optimization is standard
- **Phase 3 (Internal Linking):** Topic cluster architecture is well-documented by Moz, Ahrefs

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Based on SEO best practices and official documentation; some tool recommendations (SerpWatch, Nozzle) from third-party comparisons of unknown rigor |
| Features | MEDIUM | Search tools rate-limited during research; competitor analysis incomplete; recommend Ahrefs/Semrush validation before committing to feature priorities |
| Architecture | MEDIUM-HIGH | Topic cluster architecture is well-established SEO pattern; current site audit findings confirmed by examining actual code; URL structure recommendation supported by Moz/Ahrefs |
| Pitfalls | MEDIUM | Codebase audit confirms most critical pitfalls (sitemap, FAQSchema, LCP); some pitfalls (INP, link building quality) require live testing to confirm |

**Overall confidence:** MEDIUM

### Gaps to Address

- **Keyword volume data:** Search volume for target keywords unverified; Phase 5 must use actual keyword tools before content decisions
- **Competitor backlink analysis:** Need Ahrefs/Semrush to see what links competitors have; informs link building strategy
- **SERP feature analysis:** Whether featured snippets, people also ask boxes exist for target keywords; affects content structure decisions
- **Industry vertical demand:** Whether "car parts sourcing china" has enough search volume to justify dedicated page; validate in Phase 5 before Phase 9
- **Current Core Web Vitals baseline:** While LCP 5.4s reported, INP and CLS not measured; Phase 2 should establish full baseline

## Sources

### Primary (HIGH confidence)
- Google Search Console official documentation — sitemap requirements, indexing, Core Web Vitals
- Next.js 14 Documentation — Metadata API, Image Component, Font Optimization, generateStaticParams
- Google Search Central — FAQ rich results, structured data guidelines
- Codebase audit of WAG — `app/layout.tsx`, `sitemap.ts`, `FAQSchema.tsx` examined directly (HIGH confidence)

### Secondary (MEDIUM confidence)
- Moz Blog: Topic Clusters Guide (2025) — cluster architecture recommendations
- Ahrefs: Website Structure for SEO (2023) — URL structure, internal linking
- Bluehost: WordPress SEO settings 2026 — general SEO factors (adapted for Next.js context)
- Search Engine Journal — Google Business Profile guide
- next-sitemap npm documentation — package compatibility

### Tertiary (LOW confidence)
- SERP tracking comparison (Nozzle, SerpWatch) — 99signals.com; need direct testing to validate recommendations
- Industry vertical keyword demand — not verified with actual keyword tools
- Content Marketing Institute: B2B Content Trends 2026 — general trends, not WAG-specific
- Local SEO best practices (Breakthrough Local, SearchXperts) — need verification with Australian market

---

*Research completed: 2026-03-19*
*Ready for roadmap: yes*
