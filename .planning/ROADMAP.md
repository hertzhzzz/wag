# Roadmap: WAG Website v3.0 GEO Optimization

## Milestones

- ✅ **v1.0 MVP** - Phases 1-4 (shipped 2026-03-17)
- ✅ **v1.1 Deployment** - Phase 5 (shipped 2026-03-17)
- ✅ **v1.2 Security Audit** - Phase 8 (shipped 2026-03-18)
- ✅ **v1.3 SEO Optimization** - Phases 6, 06.1, 07, 09, 10, 11, 12 (shipped 2026-03-20)
- ✅ **v1.4 UI Optimization** - Phase 13 (shipped 2026-03-20)
- ✅ **v2.0 SEO Optimization v2** - Phases 14-17, 19, 21-22 (shipped 2026-03-25)
- 🚧 **v3.0 GEO Optimization** - Phases 23-25 (in progress)

## Phases

- [ ] **Phase 23: AI Crawler Infrastructure** - llms.txt verification + ChatGPT-User bot
- [ ] **Phase 24: Schema Consistency** - Geographic fix, number standardization, /enquiry breadcrumbs, LinkedIn correction
- [ ] **Phase 25: Content Citability** - Third-party citations and speakable property

## Phase Details

### Phase 23: AI Crawler Infrastructure

**Goal**: AI crawlers can discover and properly access WAG site content

**Status**: ~60% complete (llms.txt exists, robots.txt needs minor update)

**Depends on**: Nothing (first phase of v3.0)

**Requirements**: GEO-01, GEO-02

**Actual remaining work**:
- Verify llms.txt content quality and geographic relevance signals
- Add `ChatGPT-User` to robots.txt (currently missing)
- Confirm llms.txt references Organization schema accurately

**Success Criteria** (what must be TRUE):
  1. `/llms.txt` returns 200 OK (EXISTS - verify content quality)
  2. `robots.txt` explicitly allows GPTBot, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended, **ChatGPT-User**
  3. `llms.txt` content is under 10KB with pages prioritized by citation value
  4. Geographic relevance signals (Australia, China sourcing) are explicitly stated in llms.txt
  5. llms.txt geographic claims consistent with Organization schema

**Plans**: TBD

### Phase 24: Schema Consistency

**Goal**: Fix schema inconsistencies and complete remaining gaps

**Status**: ~80% complete (most schemas implemented, few gaps remain)

**Depends on**: Phase 23

**Requirements**: GEO-03, GEO-04, GEO-05, GEO-06 (partially complete)

**Actual remaining work**:
- **P0**: Geographic consistency fix — Schema `areaServed: Australia` but content mentions Shenzhen/Foshan/Guangzhou
- Number standardization — "100+ verified suppliers" vs "500+ suppliers" across pages
- BreadcrumbSchema on `/enquiry` page (only page missing)
- Andy Liu LinkedIn — Person schema `sameAs` links to company page, not personal profile
- ABN verification link — ABN claimed but no verification path

**Success Criteria** (what must be TRUE):
  1. All pages with factory location references have consistent geographic schema
  2. Supplier count is consistent across all pages (pick ONE number)
  3. Industry count is consistent across all pages (pick ONE number)
  4. `/enquiry` page has BreadcrumbList schema
  5. Andy Liu Person schema `sameAs` links to personal LinkedIn, not company page
  6. ABN displayed with link to Australian Business Register verification

**Plans**: TBD

### Phase 25: Content Citability

**Goal**: Content is structured for AI citation with verifiable third-party references

**Status**: 0% complete (both items missing)

**Depends on**: Phase 24

**Requirements**: GEO-07, GEO-08

**Success Criteria** (what must be TRUE):
  1. FAQPage JSON-LD includes speakableSpecification property marking citation-worthy sections
  2. At least one page references verifiable third-party data (DFAT, ABS, or AusTrade statistics)
  3. All geographic service area claims are consistent between JSON-LD schemas and visible page content

**Plans**: TBD

## P0 Emergency Fix (Completed)

- ✅ **Removed fabricated aggregateRating schema** - Schema claimed 47 reviews but no testimonials exist. Violated PROJECT.md authenticity principle. Fixed in commit 85ff3576.

## Progress

| Phase | Status | Completed |
|-------|--------|-----------|
| 23. AI Crawler Infrastructure | ~60% (llms.txt exists, need ChatGPT-User + verification) | Partial |
| 24. Schema Consistency | ~80% (most done, geographic/number fixes remain) | Partial |
| 25. Content Citability | 0% (third-party citations + speakable) | Not started |
| P0 aggregateRating removal | ✅ Complete | Done |

---

*Last updated: 2026-03-25 after cross-validation*
