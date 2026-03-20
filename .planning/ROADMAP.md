# ROADMAP: WAG Website v2.0 SEO Optimization

**Milestone:** v2.0
**Phase range:** 14-18 (revised)
**Granularity:** Fine
**Created:** 2026-03-20
**Revised:** 2026-03-20 (based on 5-reviewer analysis)

## Overview

Help Australian businesses safely connect with verified China manufacturers through professional sourcing services and factory visit experiences.

**Target Keywords:**
- Primary: "factory visit China", "China factory tour"
- Secondary: "China sourcing agent", "supplier verification", "factory audits"
- Supporting: "quality control"

**Positioning Statement:**
> "For Australian businesses who need hands-on factory verification, WAG provides in-person factory visits that typical China sourcing agents cannot match."

**Success Metrics:**
- #1 for "factory visit China" within 6 months
- Top 5 for "China sourcing agent" within 12 months
- DA 20+ with 50+ referring domains
- Systematic content pipeline established

---
*Note: "Canton Fair tours" removed from keywords — commodity term, high competition, low differentiation*
---

## Phases

- [ ] **Phase 14: Technical SEO Foundation** - Fix crawl control, schema, Core Web Vitals (INP), E-E-A-T signals, sitemap, OG tags
- [ ] **Phase 15: Content Architecture** - Service detail pages, hub-and-spoke structure, internal linking
- [ ] **Phase 16: Core Content** - Pillar page, trust content, audit checklist
- [ ] **Phase 16B: Extended Content** - Localization content, case study, monthly pipeline
- [ ] **Phase 17: Authority Building** - Competitor gap analysis, guest post outreach, industry relationships

**Pre-Phase Note:** Keyword strategy + competitor analysis sprint should run parallel to Phase 14 to inform content strategy.

---
*Phase ordering rationale: Technical foundation (14) → Structure (15) → Core content (16) → Extended content (16B) → Authority (17)*
*External dependencies: Client authorization for case study (Phase 16B), guest post acceptance (Phase 17)*
---

## Phase Details

### Phase 14: Technical SEO Foundation

**Goal:** Search engines can properly crawl, index, and understand WAG site content

**Depends on:** Nothing (first phase of v2.0)

**Pre-requisite:** Run competitor analysis sprint (parallel to Phase 14) to inform Phase 15-16 content decisions

**Requirements:** TECH-10, TECH-11, TECH-12, TECH-13, TECH-14, TECH-15, TECH-16, TECH-17, EEAT-01, EEAT-02

**Success Criteria** (what must be TRUE):
1. robots.txt allows all public pages and blocks noindex paths
2. sitemap.xml exists and includes all public pages
3. All JSON-LD schema components render as Server Components (no 'use client' in schema files)
4. BreadcrumbList schema appears on all pages with correct itemListElement structure
5. Article schema on all blog posts with headline, author, datePublished, dateModified
6. Core Web Vitals pass: LCP < 2.5s, CLS < 0.1, INP < 200ms (FID deprecated March 2024)
7. All pages have correct canonical URLs pointing to preferred version
8. OpenGraph and Twitter Card metadata on all pages
9. Team expertise and experience visible on all pages (EEAT-01)
10. WAG China field experience (e.g., "Our team has visited 50+ factories in Guangdong") stated on site (EEAT-02)

**Plans:** TBD

---

### Phase 15: Content Architecture

**Goal:** Hierarchical site structure enables topical authority and distributes PageRank effectively

**Depends on:** Phase 14

**Requirements:** ARCH-01, ARCH-02, ARCH-03

**Success Criteria** (what must be TRUE):
1. Service detail pages exist at /services/factory-tours, /services/supplier-verification, /services/quality-inspection
2. Hub-and-spoke architecture implemented with pillar pages linking to topic clusters
3. Internal linking strategy connects pillar pages to all related spoke content
4. Each pillar page has explicit list of target keywords and related spoke content

**Plans:** TBD

---

### Phase 16: Core Content Development

**Goal:** Unique expertise-driven pillar content demonstrates E-E-A-T for primary keyword targets

**Depends on:** Phase 15

**Note:** External dependency — client authorization for any client-related content. Start authorization requests in Phase 14.

**Requirements:** CONT-10, CONT-11, CONT-12, CONT-14

**Success Criteria** (what must be TRUE):
1. "The Complete Guide to Factory Visits in China" pillar page published (2000+ words, targets "factory visit China", "China factory tour")
2. "How to Verify Chinese Suppliers" article published (targets "supplier verification")
3. "Red Flags When Sourcing from China" article published (targets "China sourcing agent")
4. "China Factory Audit Checklist" published (targets "factory audits")
5. Monthly news review process established and documented

**Plans:** TBD

---

### Phase 16B: Extended Content

**Goal:** Australian-localized content and case studies provide competitive differentiation

**Depends on:** Phase 16

**Note:** External dependency — case study requires client authorization. Plan backup content if authorization denied.

**Requirements:** CONT-13 (case study), plus new requirements for localization content

**Success Criteria** (what must be TRUE):
1. "ChAFTA Import Guide for Australian Businesses" published (targets "Australia China sourcing")
2. "Australia Import Regulations Overview" published
3. Case study published (with client authorization — if denied, publish backup content)
4. All new content has Article schema and internal links to relevant pillar pages

**Plans:** TBD

---

### Phase 17: Authority Building

**Goal:** Backlink profile strengthens to compete with Epic Sourcing and ChinaDirect Sourcing

**Depends on:** Phase 16B (content assets needed for outreach)

**Note:** Guest post acceptance rate 5-20%. Success criteria uses "published" not "contacted".

**Requirements:** AUTH-10, AUTH-11, AUTH-12

**Success Criteria** (what must be TRUE):
1. Competitor backlink gap analysis documented (WAG vs Epic Sourcing) with specific DA and referring domain comparisons
2. At least 3 guest posts published on relevant sites (minimum DA 20, relevant audience)
3. Relationship established with Australian industry association (note: for networking, not SEO value — chambers have low DA)

**Plans:** TBD

---

## Progress Table

| Phase | Requirements | Plans | Status |
|-------|-------------|--------|--------|
| 14. Technical SEO Foundation | 10 | 0/10 | Not started |
| 15. Content Architecture | 3 | 0/4 | Not started |
| 16. Core Content | 4 | 0/5 | Not started |
| 16B. Extended Content | 3 | 0/4 | Not started |
| 17. Authority Building | 3 | 0/3 | Not started |

---

## Coverage

**Requirements:** 23 total (added TECH-16, TECH-17, CONT-15, CONT-16)
**Mapped:** 23 (100%)
**Unmapped:** 0

| Requirement | Phase | Category |
|-------------|-------|----------|
| TECH-10 (robots.txt) | Phase 14 | Technical SEO |
| TECH-11 (Schema Server Components) | Phase 14 | Technical SEO |
| TECH-12 (BreadcrumbList) | Phase 14 | Technical SEO |
| TECH-13 (Core Web Vitals) | Phase 14 | Technical SEO |
| TECH-14 (Article schema) | Phase 14 | Technical SEO |
| TECH-15 (canonical URLs) | Phase 14 | Technical SEO |
| TECH-16 (sitemap.xml) | Phase 14 | Technical SEO |
| TECH-17 (OG/Twitter metadata) | Phase 14 | Technical SEO |
| EEAT-01 (team expertise) | Phase 14 | E-E-A-T Signals |
| EEAT-02 (China field experience) | Phase 14 | E-E-A-T Signals |
| ARCH-01 (service detail pages) | Phase 15 | Content Architecture |
| ARCH-02 (hub-and-spoke) | Phase 15 | Content Architecture |
| ARCH-03 (internal linking) | Phase 15 | Content Architecture |
| CONT-10 (pillar page) | Phase 16 | Core Content |
| CONT-11 (supplier verification) | Phase 16 | Core Content |
| CONT-12 (red flags article) | Phase 16 | Core Content |
| CONT-14 (monthly pipeline) | Phase 16 | Core Content |
| CONT-15 (ChAFTA guide) | Phase 16B | Extended Content |
| CONT-16 (import regulations) | Phase 16B | Extended Content |
| CONT-13 (case study) | Phase 16B | Extended Content |
| AUTH-10 (competitor gap analysis) | Phase 17 | Authority Building |
| AUTH-11 (guest post outreach) | Phase 17 | Authority Building |
| AUTH-12 (chamber relationship) | Phase 17 | Authority Building |

---

## Dependencies

```
[Pre-Phase] Competitor Analysis Sprint (parallel to Phase 14)
    |
    v
Phase 14 (Technical SEO Foundation)
    |
    v
Phase 15 (Content Architecture)
    |
    v
Phase 16 (Core Content)
    |
    v
Phase 16B (Extended Content)
    |
    v
Phase 17 (Authority Building)
```

---

## Risk Flags

| Priority | Risk | Mitigation |
|----------|------|------------|
| P1 | Client credentials blocked | Start authorization in Phase 14 |
| P1 | Case study authorization denied | Create backup content (generic industry case study) |
| P1 | AI content detection | Expert review before publishing, focus on depth not volume |
| P2 | Guest post acceptance rate 5-20% | Build outreach list of 15+ targets |
| P2 | Core Web Vitals failures | Audit in Phase 14, fix before content push |
| P3 | Google algorithm change | Monitor updates, flexible content strategy |
| P3 | Competitor action | Monthly competitor monitoring |

---

*Last updated: 2026-03-20 after 5-reviewer analysis*
