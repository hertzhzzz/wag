# Requirements: WAG Website v3.0 GEO Optimization

**Defined:** 2026-03-25
**Core Value:** Help Australian businesses safely connect with verified China manufacturers

## v1 Requirements

Requirements for v3.0 release. Each maps to roadmap phases.

### AI Crawler Infrastructure

- [x] **GEO-01**: 生成 `llms.txt` — AI crawler discovery 文件，位于 `/llms.txt`
- [x] **GEO-02**: 更新 `robots.txt` — 显式允许 GPTBot、ClaudeBot、Claude-Web、PerplexityBot、Google-Extended

### Schema Foundation

- [ ] **GEO-03**: Article/BlogPosting Schema — 为全部10篇博客文章添加 Article schema
- [ ] **GEO-04**: Organization sameAs — 添加 LinkedIn、YouTube 等社交链接
- [ ] **GEO-05**: Andy Liu Person Schema 完善 — 添加 jobTitle、sameAs (LinkedIn)、knowsAbout
- [ ] **GEO-06**: BreadcrumbList Schema — 为所有页面添加面包屑导航 schema

### Content Citability

- [ ] **GEO-07**: Third-party Citations — 引用 DFAT、ABS、AusTrade 等官方数据
- [ ] **GEO-08**: speakable Property — 为 FAQPage 添加 speakable specification

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Trust Signal Accumulation

- **GEO-09**: Client Testimonials — 真实客户评价（必须真实，需客户授权）
- **GEO-10**: Video Content — YouTube 工厂参观视频（需内容制作能力）

### GEO Platform Presence

- **GEO-11**: Perplexity Brand Pages — 认领品牌页面
- **GEO-12**: Wikipedia Presence — 建立维基百科条目（需知名度门槛）

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Google Business Profile | 已完成（v2.0 或更早） |
| Fabricated testimonials | 违反 PROJECT.md 真实性原则；AI 会交叉验证 |
| Auto-generated FAQ content | 低质量内容，AI 会 penalize |
| AI-generated content | 违反 E-E-A-T 原则 |
| Review schema without real reviews | Schema 验证会检测到，与实际不符会损害信任 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| GEO-01 (llms.txt) | Phase 23 | Pending |
| GEO-02 (robots.txt AI rules) | Phase 23 | Pending |
| GEO-03 (Article schema) | Phase 24 | Pending |
| GEO-04 (Organization sameAs) | Phase 24 | Pending |
| GEO-05 (Person schema) | Phase 24 | Pending |
| GEO-06 (BreadcrumbList) | Phase 24 | Pending |
| GEO-07 (Third-party citations) | Phase 25 | Pending |
| GEO-08 (speakable property) | Phase 25 | Pending |
| GEO-09 (Client testimonials) | Future | Deferred |
| GEO-10 (Video content) | Future | Deferred |
| GEO-11 (Perplexity Brand Pages) | Future | Deferred |
| GEO-12 (Wikipedia presence) | Future | Deferred |

**Coverage:**
- v1 requirements: 8 total
- Mapped to phases: 8
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-25*
*Last updated: 2026-03-25 after initial definition*
