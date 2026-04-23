# SEO 修复计划：winningadventure.com.au

**状态：** 已获批（用户选择方案 C：全面铺开）\
**日期：** 2026-04-21

---

## 背景摘要

基于 2026-04-21 的全面 SEO 审计：
- SEO 健康度：**64/100**
- 核心问题：sitemap 0 收录（规范 URL 不匹配）、3个核心页面 H1 渲染问题、移动端 LCP 5.5秒、城市页面 95% 重复内容、零外链、25篇博客缺 Article Schema

---

## 修复计划总览

| 阶段 | 时间 | 范围 |
|------|------|------|
| 第一阶段：技术紧急修复 | 第1-2周 | sitemap、H1 SSR、noindex |
| 第二阶段：城市页面差异化 | 第2-4周 | 4个城市页面内容重写 |
| 第三阶段：内容与技术升级 | 第1个月 | 博客 Schema、FAQ 缩短、隐私页面 |
| 第四阶段：外链与品牌信号 | 第2-3个月 | GBP、评价、外链建设 |

---

## 第一阶段：技术紧急修复（1-2周）

### 1.1 sitemap 规范 URL 不匹配

**问题：** GSC 显示 sitemap 提交 35 个 URL，但收录为 0。Google 抓取的是 `winningadventure.com.au`（无 www），sitemap 提交的是 `https://www.winningadventure.com.au/`。

**修复步骤：**
1. 在 `app/sitemap.ts` 中检查当前 sitemap 返回的 URL 格式
2. 确认是否统一为带 www 的版本
3. 在 GSC 中重新提交 `sc-domain:winningadventure.com.au`（域名级别属性）
4. 验证：用 `curl -sI https://www.winningadventure.com.au/sitemap.xml` 检查输出

**验证标准：** GSC 中 sitemap 状态从 "0 indexed" 变为 "35 indexed"

---

### 1.2 H1 标签 SSR 问题排查

**问题：** 代码中存在 `<h1>` 标签，但 Google URL Inspection 抓取结果无 H1。Next.js 服务端渲染可能在某些条件下跳过 H1。

**修复步骤：**
1. `curl -s https://www.winningadventure.com.au/ | grep -i '<h1'` 验证首页 SSR 是否输出 H1
2. 如果无输出：检查 `app/page.tsx` 中 H1 是否在条件渲染（`&&` 或三元运算）内部
3. 将 H1 移出条件渲染，确保 SSR 时必定输出
4. 对 `/about` 和 `/enquiry` 同样验证

**验证标准：** `curl` 输出中包含 `<h1` 标签

---

### 1.3 城市页面 noindex（临时保护）

**问题：** Adelaide/Sydney/Melbourne/Perth 四个页面 95% 内容相同，在完成差异化重写前持续积累 Google 惩罚风险。

**修复步骤：**
1. 在每个城市页面的 `<head>` 中添加：`<meta name="robots" content="noindex, follow">`
2. 文件位置：`app/[city]/page.tsx` 或对应的 layout/component
3. 等待第二阶段差异化完成后，逐步移除 noindex（每两周移除一个页面）

**验证标准：** GSC URL Inspection 显示每个城市页面为 "Excluded (noindex)"

---

## 第二阶段：城市页面差异化（2-4周）

### 整体策略

四城市不沿用同一模板，每个页面独立定位，差异化内容占比 ≥ 60%。

| 城市 | 目标行业 | 核心价值主张 | 目标关键词 |
|------|----------|-------------|-----------|
| **Sydney** | 进出口/电商/零售 | 大批量标准品快速采购，配套物流清关 | "Sydney import from China", "Sydney wholesale China" |
| **Melbourne** | 电子产品/OEM定制 | 产品开发到量产全链路，定制制造 | "Melbourne OEM manufacturing China", "Melbourne product development sourcing" |
| **Adelaide** | 传统制造业（食品/葡萄酒/小型工厂）| 设备升级换代，成本控制，产区配套 | "Adelaide food processing equipment China", "Adelaide wine manufacturing suppliers" |
| **Perth** | 矿业设备/资源/农业 | 重型工业采购，合规认证，ASX企业供应商 | "Perth mining equipment China", "Western Australia industrial suppliers China" |

### Adelaide 详细内容方向（已确认）

**核心痛点：** Adelaide 传统制造业（食品加工、葡萄酒酿造、精密机械）面临设备老化、成本上升压力，需要从中国采购现代化设备但缺乏专业支持。

**内容差异化：**
- 引入 Adelaide 本地制造业案例（如 Barossa 食品企业、Adelaide 葡萄酒庄设备升级）
- 对标 South Australia 特定行业标准（Australian Made 认证、Food Standards Code）
- 强调"小批量验厂 + 本地化配套服务"而非大批量采购

**目标长尾词：**
- "Adelaide food processing machinery suppliers China"
- "South Australia wine manufacturing equipment sourcing"
- "Adelaide small business China manufacturing partners"

### 各城市内容修改原则

1. **H2 标题差异化**：不能使用相同的 "Everything You Need to Know"，替换为包含目标关键词的城市专属 H2
2. **案例/数据差异化**：每个城市引用不同的真实数据点（行业、规模、验厂数量）
3. **FAQ 差异化**：每个城市的 FAQ 内容回应不同的具体问题（不能 4 个页面 FAQ 完全相同）

**验证标准：** Copyscape 或相似度检测 < 40% 重复率

---

## 第三阶段：内容与技术升级（第1个月，并行）

### 3.1 博客 Article Schema（25篇）

**问题：** 所有博客资源页缺少 `Article` 结构化数据，Google 无法在 Discover 和 AI Overview 中展示。

**修复步骤：**
1. 在每篇博客的 MDX frontmatter 中添加：`author`、`datePublished`、`image`
2. 在 `app/resources/[slug]/page.tsx` 中渲染 JSON-LD Article Schema
3. 参考现有 FAQPage Schema 模式，使用 `next-mdx-remote` 或 `<script type="application/ld+json">`

**验证标准：** Google Rich Results Test 检测到 Article schema

---

### 3.2 博客作者归属修复

**问题：** 作者 meta 标签 = "Winning Adventure Global"（公司名），削弱 E-E-A-T。

**修复步骤：**
1. 确认 Andy Liu 和 Mark He 各自的专长领域
2. 将博客 author meta 改为具体人名
3. 在 About 页面为每位创始人添加完整的 Person Schema（含 knowsAbout、award、jobTitle）

**验证标准：** View-source 中 author meta 为人名而非公司名

---

### 3.3 FAQ 答案缩短（AI 引用优化）

**问题：** FAQ 答案平均 3-4 段，AI Overview 只会引用 2-3 句简洁答案。

**修复步骤：**
1. 识别每个 FAQ 的核心答案（前 2-3 句）
2. 将答案结构改为：**直接回答（1句）→ 补充说明（1-2句）→ 具体数据/案例（可选）**
3. 保持 FAQPage Schema 中的完整答案文本（技术合规），同时在页面视觉上显示压缩版本

**验证标准：** FAQ 答案视觉呈现 ≤ 60 词

---

### 3.4 移动端 LCP 优化（5.5秒 → < 2.5秒）

**诊断方向（需进一步排查）：**
1. 首图优化：Hero 图片大小（WebP 格式、响应式 srcset）
2. 字体加载：`next/font` 是否启用 `display: swap`，是否预加载关键字体
3. CDN 配置：Vercel Edge 是否正确缓存

**修复步骤：**
1. 运行 Lighthouse CI 或 WebPageTest 精确定位阻塞资源
2. 按优先级处理：首图 → 字体 → JS bundle

**验证标准：** PSI 移动端 LCP < 2.5秒

---

### 3.5 隐私政策与服务条款页面

**问题：** 缺失隐私页面（信任信号 + 合规要求）。

**修复步骤：**
1. 创建 `app/privacy/page.tsx` 和 `app/terms/page.tsx`
2. 内容可参考标准模板，重点包含：数据收集声明、ABN、联系方式
3. 在 Footer 组件中添加链接

**验证标准：** Footer 中有 Privacy Policy 和 Terms of Service 链接

---

## 第四阶段：外链与品牌信号（第2-3个月）

### 4.1 Google Business Profile

为 Adelaide 办公室创建 GBP listing：
- 商家名称：Winning Adventure Global
- 地址：Adelaide, South Australia
- 电话、营业时间、网址
- 同步到 LocalBusiness Schema

### 4.2 客户评价与案例

首页添加 2-3 个真实成功案例（含客户姓名、公司、城市、具体节省金额）。

### 4.3 外链建设起步

**低成本快速方案：**
1. LinkedIn 公司页面 + 个人帖子（自然外链）
2. 在 Australian Business Register / 行业目录登记
3. 向行业媒体投稿（如 Inside Retail Australia、Australian Manufacturing）

---

## 部署节奏

遵循保守策略（方案 A）：
- 每周一个小改动
- `npm run build` 通过后再推送
- 部署后用 `curl -sI <URL>` 验证
- GA4 + GSC 监控变化（7天/14天/28天各看一次）

---

## 优先级排序（最终执行顺序）

| # | 任务 | 阶段 | 优先级 | 工作量估计 |
|---|------|------|--------|-----------|
| 1 | sitemap canonical 修复 + GSC 重新提交 | 第1周 | 🔴 Critical | 1-2小时 |
| 2 | H1 SSR 验证 + 修复 | 第1周 | 🔴 Critical | 2-3小时 |
| 3 | 城市页面加 noindex（临时） | 第1周 | 🔴 Critical | 30分钟 |
| 4 | Privacy/TOS 页面 | 第1-2周 | 🟠 High | 3-4小时 |
| 5 | FAQ 答案缩短（AI 优化） | 第2周 | 🟠 High | 2-3小时 |
| 6 | 博客 Article Schema（25篇） | 第2-3周 | 🟠 High | 4-6小时 |
| 7 | 博客作者归属修复 | 第3周 | 🟠 High | 1-2小时 |
| 8 | Adelaide 城市页面重写 | 第3-4周 | 🟠 High | 6-8小时 |
| 9 | Sydney/Melbourne/Perth 重写（3个） | 第4-6周 | 🟠 High | 各4-6小时 |
| 10 | 移动端 LCP 优化 | 第4-6周 | 🟠 High | 4-8小时 |
| 11 | Google Business Profile | 第2个月 | 🟡 Medium | 1小时 |
| 12 | 首页添加评价/案例 | 第2个月 | 🟡 Medium | 2-3小时 |
| 13 | 外链起步（目录+LinkedIn） | 第2-3个月 | 🟡 Medium | 持续 |

---

*本计划基于 2026-04-21 SEO 审计报告制定，审计数据来源：Google Search Console（实时）、GA4（实时）、PageSpeed Insights（实时）、Exa 竞争研究*
