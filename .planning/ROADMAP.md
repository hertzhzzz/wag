# Roadmap: v2.0 SEO Optimization

## Milestone Overview

**Milestone:** v2.0 SEO Optimization
**Competitor:** chinafactorytours.com
**Target:** Surpass competitor in relevant keyword rankings
**Start Phase:** 14

---

## Phase Workflow

每个 Phase 必须经过：
```
discuss → plan → execute → verify
```

使用命令：
- `/gsd:discuss-phase [N]` — 收集 Phase 背景和需求
- `/gsd:plan-phase [N]` — 制定详细实施计划
- `/gsd:execute-phase [N]` — 执行计划
- `/gsd:verify-phase [N]` — 验证结果

---

## Phase Structure

| Phase | Name | Workflow Status | Description |
|-------|------|-----------------|-------------|
| 14 | Two Ways to Access Section | Complete | 2026-03-20 |
| 15 | 2/2 | Complete    | 2026-03-20 |
| 16 | Floating Contact Button | In Progress | 右下角悬浮按钮 + Modal |
| 17 | FAQ Page + Schema | Pending | /resources/faq + FAQPage JSON-LD |
| 18 | About Page | Pending | 公司故事 + E-E-A-T |
| 19 | Page SEO Optimization | Pending | Meta tags + 关键词 |
| 20 | Technical SEO | Pending | sitemap.xml + robots.txt |
| 21 | LinkedIn Post Skill (Socratic) | Planned | Socratic questioning + RAG for LinkedIn posts |

---

## Phase Details

### Phase 14: Two Ways to Access Section

**Goal:** 在 HowItWorks 和 Directory Section 之间新增服务对比区块

**Tasks:**
1. 创建 "Two Ways to Access" 组件
2. 左侧：Full Service (Guided Tours) 卡片
3. 右侧：Factory Directory Access 卡片
4. 每个卡片包含：图标、标题、描述、特性列表、CTA
5. 响应式布局（mobile: stacked, desktop: side-by-side）
6. 集成到 homepage

**Deliverable:** `/` 首页新增 section

**竞品参考:** chinafactorytours.com 的 "Two Ways to Access China's Best Manufacturers" 区块

---

### Phase 15: Directory Section (Landing Page)

**Goal:** 替换 "Select Your Sector"，创建工厂目录展示

**Tasks:**
1. 创建 DirectorySection 组件
2. 实现 Filter 筛选器（Electronics / Furniture / Robotics / EV Battery / More）
3. 左侧：工厂列表（城市 + 描述 + 数量 + 标签）
4. 右侧：Leaflet.js 地图（Leaflet + OpenStreetMap）
5. 列表与地图联动（点击列表 → 地图定位；点击地图 → 列表滚动）
6. 底部 CTA："View Full Directory →" 触发询价表单
7. 响应式设计

**Plans:** 2/2 plans complete

Plans:
- [ ] 15-01-PLAN.md — Create DirectorySection components (types, data, FilterTabs, CityList, DirectoryMap)
- [ ] 15-02-PLAN.md — Install Leaflet deps + integrate into homepage

**Deliverable:** `/` 首页替换 Industries section

**竞品参考:** chinafactorytours.com 的 "Major Electronics Manufacturing Hubs" 区块

---

### Phase 16: Floating Contact Button

**Goal:** 实现右下角悬浮联系按钮

**Plans:** 2/2 plans created

Plans:
- [ ] 16-01-PLAN.md — Create API endpoint + FloatingContactButton component (pulse ring, modal, form)
- [ ] 16-02-PLAN.md — Integrate FloatingContactButton into layout.tsx

**Tasks:**
1. 创建 FloatingContactButton 组件
2. 固定定位：bottom-right, 20px from edges
3. 悬停动画：transform + shadow
4. ContactModal：overlay + form（Email, Message）
5. ESC 键和 overlay 点击关闭
6. ARIA 无障碍标签
7. 移动端适配（smaller sizing）

**Deliverable:** 所有页面显示悬浮按钮

**竞品参考:** chinafactorytours.com 的 `.fc-btn`, `.fc-overlay`, `.fc-modal`

---

### Phase 17: FAQ Page + Schema

**Goal:** 创建 FAQ 内容页 + JSON-LD 结构化数据

**Tasks:**
1. 创建 `/app/resources/faq/page.tsx`
2. 撰写 10+ 制造业 FAQ 内容
3. 实现手风琴 UI 组件
4. 添加 FAQPage JSON-LD Schema
5. 目标关键词布局
6. 内链到服务页面

**Deliverable:** `/resources/faq` + 搜索结果富片段

**竞品参考:** chinafactorytours.com 的 FAQ section（但竞品没有独立页面）

---

### Phase 18: About Page

**Goal:** 构建 About 页面 + E-E-A-T 信号

**Tasks:**
1. 完善 `/app/about/page.tsx`（如已存在则优化）
2. 撰写公司故事
3. 添加团队介绍（credentials, background）
4. 创建 trust badges
5. 添加关键数据（Years in business, clients served）
6. 添加联系信息

**Deliverable:** `/about` 页面完整 E-E-A-T

**竞品参考:** chinafactorytours.com/team.html

---

### Phase 19: Page SEO Optimization

**Goal:** 优化所有页面 SEO

**Tasks:**
1. Lighthouse SEO 审计
2. 撰写 unique title tags（50-60 chars）
3. 撰写 meta descriptions（150-160 chars）
4. 修复 H1/H2/H3 层级
5. 首 100 词布局目标关键词
6. 图片 alt 属性填充
7. 内链策略

**Deliverable:** 所有页面 Lighthouse SEO 90+

---

### Phase 20: Technical SEO

**Goal:** 技术 SEO 实现

**Tasks:**
1. Next.js sitemap 生成
2. robots.txt 配置
3. Canonical tags
4. 死链检查
5. Core Web Vitals 验证
6. 提交 sitemap 到 Google Search Console

**Deliverable:** 技术 SEO 完成

---

### Phase 21: LinkedIn Post Skill (Socratic)

**Goal:** Create a Claude Code skill that uses Socratic questioning to guide users through LinkedIn post generation, with RAG-powered content retrieval from WAG blog posts

**Requirements:** REQ-01 (Skill invocation), REQ-02 (Socratic flow), REQ-03 (RAG), REQ-04 (Post structure), REQ-05 (WAG voice)

**Plans:** 1/1 plan created

Plans:
- [ ] 21-01-PLAN.md — Create wag-linkedin-post SKILL.md with Socratic flow, RAG, and LinkedIn template

---

## Milestone Verification

| Metric | Target | Verification |
|--------|--------|-------------|
| Two Ways section | 渲染在首页 | Visual check |
| Directory section | 地图+列表联动 | Functional test |
| Floating button | 所有页面可见 | Visual check |
| FAQ page | Schema 验证通过 | URL inspection |
| About page | 包含团队+故事 | Content review |
| Lighthouse SEO | 90+ all pages | Lighthouse audit |
| Sitemap | 包含所有页面 | XML inspection |

---

## Success Criteria

- [ ] Two Ways to Access section 上线
- [ ] Directory section 替换 Select Your Sector
- [ ] 地图与列表完全联动
- [ ] Floating contact button 实现
- [ ] FAQ page with Schema markup
- [ ] About page with E-E-A-T
- [ ] All pages SEO 90+
- [ ] Technical SEO complete
- [ ] LinkedIn Post Skill creates brand-aligned posts

---

## Next Action

运行 `/gsd:execute-phase 15` 执行 Phase 15 计划

---

*Roadmap created: 2026-03-20*
*Updated: 2026-03-20 (Phase 21 plan created)*
*Competitor: chinafactorytours.com*
