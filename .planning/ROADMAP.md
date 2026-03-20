# WAG Website SEO Automation Roadmap

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2026-03-17)
- ✅ **v1.1 Deployment & Minor Fixes** — Phase 5 (shipped 2026-03-17)
- ✅ **v1.3 SEO Optimization** — Phase 6 (complete)
- ✅ **v1.4 Security Audit** — Phase 8 (shipped 2026-03-18)
- ✅ **v1.5 PageSpeed** — Phase 7 (shipped 2026-03-18)
- 🚧 **v1.6 UI Optimization** — Phase 13 (in progress)

---

## Phases

- [x] **Phase 9: Technical SEO Foundation** - Fix LCP and implement technical SEO infrastructure
- [x] **Phase 10: Content Strategy** - Create blog content and FAQ section (completed 2026-03-18)
- [x] **Phase 11: Local SEO & Authority** - Build local presence and backlinks (completed 2026-03-19)
- [ ] **Phase 12: Analytics & Optimization** - Set up monitoring and measure success

---

## Phase Details

### Phase 9: Technical SEO Foundation

**Goal:** Fix LCP performance and implement technical SEO infrastructure to meet search engine requirements

**Depends on:** Nothing (first phase of this milestone)

**Requirements:** TECH-01, TECH-02, TECH-03, TECH-04, TECH-05, MON-01

**Success Criteria** (what must be TRUE):

1. Mobile LCP performance measures <2.5s in PageSpeed Insights (user can verify)
2. XML sitemap accessible at /sitemap.xml (user can visit URL)
3. robots.txt configured and accessible (user can visit URL)
4. Schema.org Organization + LocalBusiness markup present in page source (user can verify via inspect)
5. Canonical URLs present on all 5 main pages (user can view page source)
6. Google Search Console shows site as indexed and tracked (user can see data in GSC)

**Plans:** 1/1 plans complete

- [x] 09-01-PLAN.md - Verify SEO infrastructure and optimize LCP

---

### Phase 10: Content Strategy

**Goal:** Create high-quality blog content to compete with Epic Sourcing and ChinaDirect

**Depends on:** Phase 9

**Requirements:** CONT-01, CONT-02, CONT-03, CONT-04, CONT-05

**Success Criteria** (what must be TRUE):

1. "How to Import from China" guide published at /resources and searchable (user can find via site search)
2. "China Supplier Verification" guide published at /resources (user can find via site search)
3. "Australia Import Tips" guide published at /resources (user can find via site search)
4. FAQ section visible on website with valid FAQPage schema (user can see FAQ content)
5. Service pages contain target keywords in headings and content (user can verify via page inspection)

**Plans:** 3/3 plans complete

- [x] 10-01-PLAN.md - Create 3 SEO blog guides (CONT-01, CONT-02, CONT-03)
- [x] 10-02-PLAN.md - Expand FAQ and add to services/about pages (CONT-04)
- [x] 10-03-PLAN.md - Optimize service pages with target keywords (CONT-05)

---

### Phase 11: Local SEO & Authority

**Goal:** Establish local presence in Australian market and build domain authority through backlinks

**Depends on:** Phase 10

**Requirements:** LOCAL-01, LOCAL-02, LOCAL-03, AUTH-01, AUTH-02

**Success Criteria** (what must be TRUE):

1. Google Business Profile claimed and optimized with business details (user can find on Google Maps)
2. Business listed in 5+ Australian directories (user can verify via directory searches)
3. Location-specific content about South Australia visible on site (user can find on About/Services pages)
4. 3 guest posts published on external industry websites (user can find via backlink check)
5. Backlinks from Australian business directories acquired (user can verify via SEO tools)

**Plans:** 1/1 plans complete

- [x] 11-01-PLAN.md - Local SEO & Authority (LOCAL-01, LOCAL-02, LOCAL-03, AUTH-01, AUTH-02)

---

### Phase 12: Analytics & Optimization

**Goal:** Set up monitoring systems to track keyword rankings and measure SEO success

**Depends on:** Phase 11

**Requirements:** MON-02, MON-03, AUTH-03

**Success Criteria** (what must be TRUE):

1. Keyword ranking tracking configured for "epic sourcing" and "china direct" (user can view tracking data)
2. Monthly SEO audit workflow documented and operational (user can run audit)
3. Domain Authority increased to 15+ (user can verify via Moz/Ahrefs)

**Plans:** 1/1 plans

- [ ] 12-01-PLAN.md - Analytics & Optimization (MON-02, MON-03, AUTH-03)

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 9. Technical SEO Foundation | 1/1 | Complete   | 2026-03-18 |
| 10. Content Strategy | 3/3 | Complete    | 2026-03-18 |
| 11. Local SEO & Authority | 1/1 | Complete    | 2026-03-20 |
| 12. Analytics & Optimization | 0/1 | Not started | - |
| 13. UI Optimization | 0/1 | Not started | - |

---

## Coverage Map

| Requirement | Phase | Status |
|-------------|-------|--------|
| TECH-01 | Phase 9 | Ready |
| TECH-02 | Phase 9 | Ready |
| TECH-03 | Phase 9 | Ready |
| TECH-04 | Phase 9 | Ready |
| TECH-05 | Phase 9 | Ready |
| MON-01 | Phase 9 | Ready |
| CONT-01 | Phase 10 | Ready |
| CONT-02 | Phase 10 | Ready |
| CONT-03 | Phase 10 | Ready |
| CONT-04 | Phase 10 | Ready |
| CONT-05 | Phase 10 | Ready |
| LOCAL-01 | Phase 11 | Planned |
| LOCAL-02 | Phase 11 | Planned |
| LOCAL-03 | Phase 11 | Planned |
| AUTH-01 | Phase 11 | Planned |
| AUTH-02 | Phase 11 | Planned |
| MON-02 | Phase 12 | Pending |
| MON-03 | Phase 12 | Pending |
| AUTH-03 | Phase 12 | Pending |

---

### Phase 13: UI Optimization

**Goal:** 基于 critique 报告，优化 WAG 前端视觉层次和品牌差异化

**Depends on:** Phase 12

**Scope:**
- B: 解决重复 `border-gray-200 rounded-lg` 卡片样式 — 视觉无层次问题
- C: 解决 Section 标签样式全为 `text-amber uppercase tracking` 模板感
- D: 解决 HowItWorks 5 步骤等权重问题 — 引导注意力
- E: 移除 Navbar CTA 无意义的 `bg-gradient from-navy to-navy` 渐变

**Not in scope:** Industries 移动端导航问题 (Issue A)

**Plans:** 0 plans

- [ ] TBD (run /gsd:plan-phase 13 to break down)

---

*Last updated: 2026-03-20*
