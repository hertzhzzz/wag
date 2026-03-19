# Requirements: WAG SEO Ranking Project

**Defined:** 2026-03-19
**Core Value:** Drive qualified enquiry form submissions from Australian businesses searching for Chinese factory verification and inspection services.

## v1 Requirements

### Technical SEO Foundation

- [ ] **TECH-01**: Fix static sitemap.xml — delete or replace with next-sitemap for dynamic generation
- [ ] **TECH-02**: Convert FAQSchema.tsx from 'use client' to server component
- [ ] **TECH-03**: Fix blog generateMetadata to use frontmatter primaryKeyword instead of hardcoded keywords
- [ ] **TECH-04**: Add Article/TechArticle schema to blog post pages
- [ ] **TECH-05**: Add BreadcrumbList schema to blog article pages
- [ ] **TECH-06**: Audit and fix canonical URL configuration across all pages

### Core Web Vitals

- [ ] **PERF-01**: Fix mobile LCP 5.4s — self-host or optimize Unsplash hero images
- [ ] **PERF-02**: Ensure all next/image components have explicit width/height to prevent CLS
- [ ] **PERF-03**: Verify INP (Interaction to Next Paint) meets Core Web Vitals thresholds

### Internal Architecture

- [ ] **ARCH-01**: Implement topic cluster architecture — bidirectional links between pillar pages and cluster content
- [ ] **ARCH-02**: Add breadcrumb navigation to blog post pages
- [ ] **ARCH-03**: Link author bylines to About page for E-E-A-T signals
- [ ] **ARCH-04**: Add related posts section within same topic cluster
- [ ] **ARCH-05**: Add Organization schema to homepage (currently missing)

### Local SEO

- [ ] **LOCAL-01**: Claim and optimize Google Business Profile (if not already done)
- [ ] **LOCAL-02**: Audit NAP (Name, Address, Phone) consistency across all directories
- [ ] **LOCAL-03**: Submit to Australian business directories (minimum 19 directories)
- [ ] **LOCAL-04**: Add Person schema for founder Andy Liu

### Content Strategy

- [ ] **CONT-01**: Conduct keyword research to validate keyword-to-URL mapping
- [ ] **CONT-02**: Create 1 ultimate pillar guide (3000+ words) for primary keyword
- [ ] **CONT-03**: Create industry landing page for automotive OR AV equipment sourcing
- [ ] **CONT-04**: Add unique meta descriptions to all pages (audit existing)
- [ ] **CONT-05**: Collect and publish client case studies (2+)
- [ ] **CONT-06**: Add E-E-A-T signals to AI-generated content (author experience credentials)

### Link Building

- [ ] **LINK-01**: Sign up for HARO/Connectively to provide expert quotes
- [ ] **LINK-02**: Guest post on DA 40+ sites relevant to Australian B2B sourcing
- [ ] **LINK-03**: Build backlinks from Australian trade/publication sources

## v2 Requirements

### Analytics & Monitoring

- [ ] **ANAL-01**: Set up rank tracking for target keywords (SerpWatch or similar)
- [ ] **ANAL-02**: Configure GSC API for automated keyword position monitoring
- [ ] **ANAL-03**: Set up conversion tracking for enquiry form submissions

### Content Expansion

- [ ] **EXP-01**: Create second industry landing page (whichever vertical not chosen in CONT-03)
- [ ] **EXP-02**: Develop downloadable verification checklist (lead magnet)
- [ ] **EXP-03**: Add video content for key service explanations (if budget allows)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Paid ads / SEM | Focus on organic SEO only |
| Product e-commerce | WAG is a service business |
| Design overhaul | Keep existing design system (Navy #0F2D5E + Amber #F59E0B) |
| Backend/API changes | No database or authentication changes needed |
| Social media marketing | Not in scope for SEO project |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| TECH-01 - TECH-06 | Phase 1: Technical SEO Foundation | Pending |
| PERF-01 - PERF-03 | Phase 2: Core Web Vitals | Pending |
| ARCH-01 - ARCH-05 | Phase 3: Architecture + Local SEO | Pending |
| LOCAL-01 - LOCAL-04 | Phase 3: Architecture + Local SEO | Pending |
| CONT-01 - CONT-06 | Phase 4: Content Strategy | Pending |
| LINK-01 - LINK-03 | Phase 5: Authority Building | Pending |

**Coverage:**
- v1 requirements: 27 total
- Mapped to phases: 27
- Unmapped: 0

---
*Requirements defined: 2026-03-19*
*Last updated: 2026-03-19 after roadmap creation*
