# Roadmap: WAG Website v3.0 GEO Optimization

## Milestones

- ✅ **v1.0 MVP** - Phases 1-4 (shipped 2026-03-17)
- ✅ **v1.1 Deployment** - Phase 5 (shipped 2026-03-17)
- ✅ **v1.2 Security Audit** - Phase 8 (shipped 2026-03-18)
- ✅ **v1.3 SEO Optimization** - Phases 6, 06.1, 07, 09, 10, 11, 12 (shipped 2026-03-20)
- ✅ **v1.4 UI Optimization** - Phase 13 (shipped 2026-03-20)
- ✅ **v2.0 SEO Optimization v2** - Phases 14-17, 19, 21-22 (shipped 2026-03-25)
- 🚧 **v3.0 GEO Optimization** - Phases 23-25 (in progress)

## Key Decisions (v3.0)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| areaServed scope | Australia only | WAG 帮助 Australian businesses 连接中国制造商；中国是供应商所在地，不是服务市场 |
| Supplier count | 500+ | 营销效果更好，统一使用 |
| Industry count | 50+ | 全面覆盖感，统一使用 |
| Geographic signal | Australia HQ, China operations | Schema: areaServed Australia；Content: 提及中国工厂位置 |

## Phases

- [x] **Phase 23: AI Crawler Infrastructure** - llms.txt fixes + ChatGPT-User + robots.txt (completed 2026-03-25)
- [ ] **Phase 24: Schema Consistency** - Geographic alignment, number standardization, breadcrumbs, LinkedIn, ABN
- [ ] **Phase 25: Content Citability** - Third-party citations and speakable property

## Phase Details

### Phase 23: AI Crawler Infrastructure

**Goal**: AI crawlers can discover and properly access WAG site content

**Status**: Completed (2026-03-25)

**Depends on**: Nothing (first phase of v3.0)

**Requirements**: GEO-01, GEO-02

**Success Criteria** (what must be TRUE):
  1. `robots.txt` explicitly allows GPTBot, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended, **ChatGPT-User**
  2. `llms.txt` contains NO fabricated claims (47 reviews, fake testimonials)
  3. `llms.txt` geographic signals: Australia HQ + China as supplier location (NOT areaServed)
  4. `llms.txt` content is under 10KB
  5. llms.txt uses standardized numbers: 500+ suppliers, 50+ industries

**Plans**:
- [x] 23-01-PLAN.md — Fix llms.txt data accuracy + add ChatGPT-User to robots.txt

### Phase 24: Schema Consistency

**Goal**: Fix schema inconsistencies and complete remaining gaps

**Status**: Planned (2 plans ready for execution)

**Depends on**: Phase 23

**Requirements**: GEO-03, GEO-04, GEO-05, GEO-06

**Scope Decisions**:
- **areaServed**: Australia only (confirmed by stakeholders)
- **Supplier count**: 500+ (standardize across all pages)
- **Industry count**: 50+ (standardize across all pages)
- **Geographic scope**: Guangdong Province only (Shenzhen, Foshan, Guangzhou)
- **No Zhengzhou/Shaanxi** references in any schema

**Tasks**:
1. Fix geographic consistency: Schema areaServed Australia, content clarifies China as supplier location
2. Standardize supplier count: 500+ across all pages
3. Standardize industry count: 50+ across all pages
4. Add BreadcrumbSchema to `/enquiry` page
5. Remove Andy Liu personal LinkedIn from PersonSchema sameAs (does not exist)
6. Add ABN verification link (link to Australian Business Register)
7. Fix server-rendered PersonSchema (convert from useEffect to dangerouslySetInnerHTML)

**Success Criteria** (what must be TRUE):
  1. PersonSchema is server-rendered (visible to AI crawlers)
  2. Andy Liu LinkedIn removed from PersonSchema sameAs
  3. All pages display: 500+ suppliers, 50+ industries
  4. `/enquiry` page has BreadcrumbList schema
  5. ABN has clickable verification link
  6. All geographic references mention only Shenzhen, Foshan, Guangzhou

**Plans**:
- [ ] 24-01-PLAN.md — PersonSchema server-fix + ABN verification link
- [ ] 24-02-PLAN.md — Numeric standardization + BreadcrumbSchema for /enquiry

### Phase 25: Content Citability

**Goal**: Content is structured for AI citation with verifiable third-party references

**Status**: 0% complete

**Depends on**: Phase 24

**Requirements**: GEO-07, GEO-08

**Tasks**:
1. Add `speakableSpecification` to FAQPage JSON-LD
2. Add third-party citations (ABS import data) to `/resources/australia-import-tips`
3. Optionally add DFAT citation to `/resources/china-sourcing-risks`

**Success Criteria** (what must be TRUE):
  1. FAQPage JSON-LD includes speakableSpecification marking Q&A sections
  2. At least one page cites verifiable third-party data (ABS, DFAT, or AusTrade)
  3. All geographic claims are consistent (Australia HQ, China supplier locations)

**Plans**:
- [ ] 25-01-PLAN.md — (to be created)

## P0 Emergency Fix (Completed)

- ✅ **Removed fabricated aggregateRating from schema** - commit 85ff3576

## Progress

| Phase | Status | Completed |
|-------|--------|-----------|
| 23. AI Crawler Infrastructure | ✅ Complete | Done |
| 24. Schema Consistency | 🚧 In progress | 2 plans ready |
| 25. Content Citability | ⏳ Not started | Not started |
| P0 aggregateRating (schema) | ✅ Complete | Done |

---

*Last updated: 2026-03-25 after Phase 24 planning*
