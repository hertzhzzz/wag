# WAG Website Responsive Improvements Roadmap

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2026-03-17)
- ✅ **v1.1 Deployment & Minor Fixes** — Phase 5 (shipped 2026-03-17)
- ✅ **v1.3 SEO Optimization** — Phase 6 (complete)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-4) — SHIPPED 2026-03-17</summary>

- [x] Phase 1: Foundation (2/2 plans) — completed 2026-03-10
- [x] Phase 2: Content Pages (1/1 plan) — completed 2026-03-11
- [x] Phase 3: Global UI Audit + Mobile Adaptation (6/6 plans) — completed 2026-03-17
- [x] Phase 4: Resources + Testing (4/4 plans) — completed 2026-03-17

See: [.planning/milestones/v1.0-ROADMAP.md](.planning/milestones/v1.0-ROADMAP.md)

</details>

## Progress

| Phase | Milestone | Plans | Status |
|-------|-----------|-------|--------|
| 1. Foundation | v1.0 | 2/2 | Complete |
| 2. Content Pages | v1.0 | 1/1 | Complete |
| 3. Global UI Audit | v1.0 | 6/6 | Complete |
| 4. Resources + Testing | v1.0 | 4/4 | Complete |
| 5. Vercel Deployment | v1.1 | 2/2 | Complete |
| 6. SEO Optimization | 6/6 | Complete | |
| 06.1. Vercel Gmail Config | 1/1 | Complete    | 2026-03-17 |

**Total:** 6 phases, 24 plans (including gap closure)

---

*See [.planning/milestones/v1.0-ROADMAP.md](.planning/milestones/v1.0-ROADMAP.md) for archived phase details*

### Phase 6: SEO Optimization

**Goal:** Optimize website for "china sourcing" keyword ranking in Australia. Implement technical SEO, content strategy, and structured data to achieve top rankings.

**Target Keywords:**
- Primary: china sourcing, china sourcing australia
- Secondary: factory visit china, china sourcing adelaide, sourcing trip china, china factory tour

**Requirements:** SEO-01, SEO-02, SEO-03, SEO-04, SEO-05

**Depends on:** Phase 5

**Plans:** 6/6 plans executed

Plans:
- [x] 06-01-PLAN.md — Technical SEO foundation (page metadata + Service schema)
- [x] 06-02-PLAN.md — Content strategy (5 blog articles + internal linking)
- [x] 06-03-PLAN.md — Core Web Vitals + Local SEO optimization
- [x] 06-04-PLAN.md — Fix enquiry form 500 error (gap closure)
- [x] 06-05-PLAN.md — Add cover image to blog article Hero (gap closure)
- [ ] 06-06-PLAN.md — Verify /services link in blog articles (gap closure)

### Success Criteria

1. Homepage metadata includes primary keywords: "china sourcing", "china sourcing australia"
2. All 5 pages have unique metadata
3. Services page renders ServiceSchema with valid JSON-LD
4. 5 blog articles targeting long-tail keywords created
5. LocalBusiness schema enhanced with Adelaide address
6. Hero images optimized with priority loading for LCP
7. Enquiry form submits successfully without 500 error
8. Blog articles display cover images in Hero section
9. Blog articles contain internal links to /services

---

*Updated: 2026-03-18*

### Phase 06.1: 配置 Vercel 部署中的 gmailAPP_PASSWORD 和 user 以修复 enquiry 表单 (INSERTED)

**Goal:** Configure GMAIL_USER and GMAIL_APP_PASSWORD in Vercel production to fix enquiry form email functionality
**Depends on:** Phase 6
**Plans:** 1/1 plans complete

Plans:
- [x] 06.1-01-PLAN.md — Configure Gmail credentials in Vercel

### Phase 7: PageSpeed 性能优化 - 优化 Mobile LCP (从 9.2s 到 <2.5s)，减少图片大小

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 6
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd:plan-phase 7 to break down)

### Phase 8: security audit - analyze and fix all security risks in the WAG website

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 7
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd:plan-phase 8 to break down)

---

*Updated: 2026-03-18*
