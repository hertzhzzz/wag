# 设计文档：服务关键词落地页矩阵 + Mega Menu

- **日期**: 2026-06-25
- **状态**: 已确认，待转实现计划
- **作者**: Mark He / Claude
- **影响范围**: `frontend/` — 导航栏、新增 13 个落地页、sitemap、内链结构

---

## 1. 背景与问题

WAG 提供 Remote Verification（远程供应商验证）服务，但 "supplier verification China Australia" 这类高价值商业关键词**缺乏专属、高度优化的服务落地页**——目前主要靠博客文章（如 `/article/china-sourcing-agent`）在承接。文章承接转化弱、关键词排名吃亏。

**根本目的**：用一套"城市 × 行业 × 服务关键词"的落地页矩阵承接这些高价值关键词，提升排名与转化；Mega Menu 是把这些页面串起来、并为搜索引擎提供内链结构的入口。

**核心认知**：本项目重心不在菜单 UI，而在菜单背后的落地页内容。菜单链向不存在的页面 = 404，对 SEO 反害。

## 2. SEO 安全底线（防 doorway）

程序化批量生成"城市×行业"组合页（只换地名、正文模板克隆）是 Google 明令打击的 **doorway pages / 规模化内容滥用**。当前站点 SEO 73/100，硬铺薄页面会拖累整个域名。

**因此本设计采用的防薄机制**：
- 三组关键词**独立平铺**，不做笛卡尔积组合页（约 13 页，非 25+ 页）。
- 每页靠**独家数据 + 权威引用**做真实差异：1209 家工厂库（独家）+ 澳洲统计局 ABS / 海关官方进口数据（强 E-E-A-T）+ Tavily 补充 + AI 起草 + 人工过审。
- **每页独立 MDX/TSX 内容**，不用 `[city]` 动态模板共享正文（共享正文会滑向 doorway）。城市/行业页共享 React 布局组件，但数据与正文各自独立。

## 3. 页面矩阵

| 组别 | URL | 页面 | 优先级 |
|------|-----|------|--------|
| **服务**（核心转化页） | `/supplier-verification` | 远程供应商验证（旗舰） | P0 |
| | （其余服务页由 Phase 0 关键词验证后确定） | 例：factory-audit-china / quality-inspection-china | 待定 |
| **城市** | `/locations/sydney` | 悉尼 | P2 |
| | `/locations/melbourne` | 墨尔本 | P2 |
| | `/locations/brisbane` | 布里斯班 | P2 |
| | `/locations/adelaide` | 阿德莱德 | P2 |
| | `/locations/perth` | 珀斯 | P2 |
| **行业** | `/industries/mining` | 矿业 | P3 |
| | `/industries/agricultural-machinery` | 农业机械 | P3 |
| | `/industries/activewear` | 运动服饰 | P3 |
| | `/industries/construction` | 建筑 | P3 |
| | `/industries/electronics` | 电子 | P3 |

**URL 结构决策**：按类型分目录（服务页置顶级，城市/行业各自归类）。层级清晰，面包屑与内链好做，Google 易理解站点层级。

## 4. Mega Menu 交互与布局

### 行为
- **桌面端触发**：鼠标悬停 "Services" → 展开覆盖整个 navbar 宽度的横幅。
- **点击 Services**：仍跳转 `/services`（现有 3 档对比页），不丢失已有权重入口。
- **手机端**：navbar 无悬停 → Services 变为可展开折叠项（手风琴），点击展开三组链接。复用现有 mobile slide-in 菜单结构。

### 布局
横幅内 3 列 + 右侧 CTA：

```
┌─────────────────────────────────────────────────────────┐
│  By Service        By Location       By Industry         │
│  Supplier Verif.   Sydney            Mining              │
│  Factory Audit     Melbourne         Agricultural Mach.  │
│  Quality Insp.     Brisbane          Activewear         │
│                    Adelaide          Construction        │
│                    Perth             Electronics    [CTA]│
└─────────────────────────────────────────────────────────┘
```
右侧 CTA 块文案示例："Not sure which service? Get a free quote →"

### 技术点
- `Navbar.tsx` 已是 `'use client'`，新增 hover 状态控制展开。
- 新增组件 `app/components/ServicesMegaMenu.tsx`。
- 链接清单抽到 `app/data/nav-links.ts` —— **单一数据源**，菜单和 sitemap 共用，避免两处维护（DRY）。
- 遵守站点规则：菜单文案全英文，无 emoji，无中文，无 "WAG" 缩写。

## 5. 每类页面的内容结构

### 服务页（转化主力）
服务定义 → 流程（带图）→ 覆盖工厂数据规模（引用 1209 家库）→ 定价/交付 → FAQ（10 条）→ CTA。

### 城市页（如悉尼）
该市进口体量 / 主要港口（ABS 官方数据）→ 当地常见进口品类 → "我们如何远程为该市进口商验厂" → 相关案例 → CTA。
> 注意：WAG 是 Australia-based 远程服务，城市页措辞为"服务该市进口商"，不得暗示在该市设有实体办公室。

### 行业页（如矿业）
该行业从中国采购的典型风险点 → 该行业验厂要点 → 从工厂库筛出的该品类工厂数量/分布 → CTA。

## 6. 内容生产流水线

复用现有 MDX + AI 写作流水线，每页注入 4 类来源：

1. **工厂库（独家）** — `CMS/` SQLite 1209 家，按行业/品类筛选。
2. **政府官方数据（E-E-A-T 权威）** — 澳洲统计局 ABS 进口数据、港口数据。
3. **Tavily 搜索补充** — 行业趋势、本地化细节。
4. **AI 优化写作起草** → **人工过审** → 发布。

## 7. 技术落点

- 页面形态：每页独立 MDX/TSX 文件；城市/行业页共享一个布局组件（`LocationPageLayout` / `IndustryPageLayout`）+ 各自数据文件。
- 复用现有：`services/page.tsx` 组件、`ServiceSchema`、`BreadcrumbSchema`、ScrollReveal。
- Schema：服务页加 `Service` schema；城市/行业页加 `BreadcrumbSchema`。
- `sitemap.ts`：注册全部新页。
- 内链：服务页 ↔ 城市页 ↔ 行业页交叉链接，权重互导；从相关博客文章正文链入对应落地页。

## 8. 分期交付

| Phase | 内容 | 产出 |
|-------|------|------|
| **Phase 0** | 关键词验证：Tavily 看 SERP/竞品/长尾词 + （可选）Keyword Planner 拉精确搜索量 | "关键词 → 落地页 → 优先级"表，用户拍板服务页清单 |
| **Phase 1** | Mega menu 骨架 + `/supplier-verification` 旗舰页做满 | 可用菜单 + 第一个转化页 + SEO 入口 |
| **Phase 2** | 其余服务页 + 城市/行业共享布局组件（定型模板） | 模板成型 |
| **Phase 3** | 5 个城市页内容 | locations/* 上线 |
| **Phase 4** | 5 个行业页内容 | industries/* 上线 |

每个 Phase 单独成一个实现计划，做完停下汇报再继续。

## 9. 待确认 / 未决项

- **服务页清单**：Phase 0 关键词验证后由用户拍板（当前仅 `/supplier-verification` 确定为 P0）。
- **Keyword Planner 授权**：若要精确搜索量，需用户授权 `browser-harness` 登录 Google Ads 账号。
- **CTA 目标**：mega menu 右侧 CTA 与各落地页 CTA 统一指向 `/enquiry`（默认，待确认）。

## 10. 验收标准

- `npm run build` 通过、`npm run lint` 无新增错误。
- Mega menu 桌面悬停展开、点击 Services 跳 `/services`、手机折叠展开均正常。
- 新页面全部进入 sitemap，HTTP 200。
- 每个落地页含独家数据/权威引用，非模板克隆（防薄自检）。
- 文案全英文、无 emoji、无中文、无 "WAG" 缩写，符合站点 STRICT 规则。
