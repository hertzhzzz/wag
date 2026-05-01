# WAG SSG + SEO Rendering Audit — Revised Design

**Date:** 2026-05-01
**Author:** WAG AI Agent
**Status:** Draft — Pending Implementation

---

## 1. 问题汇总（来自3个并行Agent的完整诊断）

### 🔴 Critical（立即修复，阻塞索引）

| # | 问题 | 位置 | 影响 |
|---|------|------|------|
| C1 | `ServiceSchema.tsx` 和 `FAQSchema.tsx` 包含不必要的 `'use client'` | `app/components/ServiceSchema.tsx`, `app/components/FAQSchema.tsx` | Googlebot无法抓取JSON-LD，Service和FAQPage schema失效 |
| C2 | sitemap.ts canonical仍使用www版本 | `app/sitemap.ts` | GSC索引non-www，sitemap提交www，两者在Google眼中是两个不同页面，导致"Page with redirect" |
| C3 | City pages（Adelaide/Sydney/Melbourne/Perth）未添加noindex | `app/[city]/page.tsx` | 4个页面有95%重复内容，可被索引 = Google重复内容惩罚风险 |

### 🟡 High（本周内修复，影响排名）

| # | 问题 | 位置 | 影响 |
|---|------|------|------|
| H1 | "china business tours"关键词被3个URL同时竞争 | /services, /visiting-chinese-factories, /resources/china-factory-tour-guide | 排名分散，0 clicks |
| H2 | City pages内容单薄（<100字实际内容） | `app/[city]/page.tsx` | 页面质量低于quality gate阈值 |
| H3 | Organization schema的knowsAbout字段缺少"China business tours" | `app/layout.tsx` | 无法在知识图谱中建立"商务考察"领域关联 |

---

## 2. 当前状态确认

### 2.1 SSG渲染确认

- [x] 所有页面均为SSG或Static（67个页面，无ISR，无SSR except API routes）
- [x] `resources/[slug]` 通过 `generateStaticParams` 确认为SSG
- [x] `visiting-chinese-factories/page.tsx` SSG + ServiceSchema + FAQSchema + BreadcrumbSchema
- [x] `services/page.tsx` SSG + ServiceSchema + FAQSchema
- [x] `app/layout.tsx` Organization JSON-LD在服务端渲染（clean，无'use client'）

### 2.2 Schema组件审计结果

| 组件 | 文件 | 'use client' | 问题 | 状态 |
|------|------|-------------|------|------|
| ServiceSchema | `app/components/ServiceSchema.tsx` | ✅ 有 | 不必要的客户端渲染 | 🔴 需修复 |
| FAQSchema | `app/components/FAQSchema.tsx` | ✅ 有 | 不必要的客户端渲染 | 🔴 需修复 |
| ArticleSchema | `app/components/ArticleSchema.tsx` | ❌ 无 | — | ✅ 已正常 |
| PersonSchema | `app/components/PersonSchema.tsx` | ❌ 无 | — | ✅ 已正常 |
| BreadcrumbSchema | `app/components/BreadcrumbSchema.tsx` | ❌ 无 | — | ✅ 已正常 |
| HowToSchema | `app/components/HowToSchema.tsx` | ❌ 无 | — | ✅ 已正常 |

### 2.3 Phase 1计划状态（2026-04-21制定，从未实施）

| 计划项 | 状态 | 备注 |
|--------|------|------|
| sitemap.ts baseUrl改为non-www | ❌ 未实施 | 当前仍为`https://www.winningadventure.com.au` |
| Adelaide/Sydney/Melbourne/Perth添加noindex | ❌ 未实施 | Google Search Console显示"Discovered - currently not indexed" |
| GSC检查索引状态 | ✅ 已确认 | /visiting-chinese-factories 和 /services 均未被索引 |

---

## 3. 修复方案

### 3.1 Critical Fix C1 — 移除Schema组件的'use client'

**问题：** ServiceSchema和FAQSchema使用`'use client'`，但它们只渲染静态JSON-LD（无浏览器API依赖），导致Googlebot无法抓取结构化数据。

**解决方案：** 移除两文件的`'use client'`声明，使其恢复为Server Component。

**改动文件：**
- `app/components/ServiceSchema.tsx` — 删除第1行`'use client'`
- `app/components/FAQSchema.tsx` — 删除第1行`'use client'`

**验证方式：** 部署后使用GSC URL Inspection检查这两个页面是否返回有效结构化数据。

### 3.2 Critical Fix C2 — 修复sitemap canonical

**问题：** sitemap.ts使用`www.winningadventure.com.au`，但GSC索引的是`winningadventure.com.au`（non-www）。Canonical mismatch导致Google视两个URL为不同页面。

**解决方案：** 修改`app/sitemap.ts`的baseUrl为non-www。

**改动：** `const baseUrl = 'https://www.winningadventure.com.au'` → `const baseUrl = 'https://winningadventure.com.au'`

**验证方式：** 提交sitemap后，GSC中检查索引的canonical URL是否匹配。

### 3.3 Critical Fix C3 — City pages添加noindex

**问题：** Adelaide/Sydney/Melbourne/Perth四个页面内容高度重复（95%+），应阻止Google索引。

**解决方案：** 在`app/[city]/page.tsx`中添加：

```tsx
export const metadata = {
  robots: {
    index: false,
    follow: true,
  },
}
```

**验证方式：** GSC URL Inspection检查city page返回"Page is not indexed"（这是正确行为）。

### 3.4 High Fix H1 — 解决关键词 cannibalization

**问题：** "china business tours"被3个URL同时竞争（/services, /visiting-chinese-factories, /resources/china-factory-tour-guide），导致SERP排名分散。

**解决方案：** 明确每个页面的关键词定位：

| 页面 | 目标关键词 | 策略 |
|------|-----------|------|
| /visiting-chinese-factories | "visiting chinese factories" | 主推页面，强化内容深度 |
| /services | "china sourcing agent" | 保持现状 |
| /resources/china-factory-tour-guide | "china factory tour guide" | 博客文章，long-tail |

**注意：** 当前"china business tours"没有精确匹配的专门页面。建议将`/visiting-chinese-factories`的内容中强化"china business tours"关键词密度（自然出现2-3次）。

### 3.5 High Fix H3 — 扩展Organization schema的knowsAbout

**问题：** Organization schema的knowsAbout缺少"China business tours"领域词汇。

**解决方案：** 在`app/layout.tsx`的JSON-LDOrganization对象的knowsAbout数组中添加：

```json
"knowsAbout": [
  "Chinese manufacturing",
  "China business tours",    // ← 新增
  "factory verification",
  ...
]
```

---

## 4. 实施计划

### Phase 1（立即，0-2小时）

1. [ ] 修复ServiceSchema.tsx — 移除'use client'
2. [ ] 修复FAQSchema.tsx — 移除'use client'
3. [ ] 修复sitemap.ts — baseUrl改为non-www
4. [ ] City pages添加noindex metadata
5. [ ] Organization schema添加"China business tours"
6. [ ] `npm run build` 验证构建成功
7. [ ] `git push origin master` 部署

### Phase 2（本周，SEO内容优化）

1. [ ] 审查/visiting-chinese-factories内容，确保"china business tours"自然出现
2. [ ] GSC监控：部署后7天内检查Service和FAQPage rich results是否出现
3. [ ] 如有需要，创建专门的"china-business-tours"页面或强化现有页面

---

## 5. 验收标准

| 指标 | 当前值 | 目标值 |
|------|--------|--------|
| ServiceSchema/FAQSchema 'use client' | 有 | 无 |
| sitemap canonical | www | non-www |
| City pages indexing | indexed | noindex |
| GSC "Page with redirect" errors | 多 | 0 |
| "china business tours" 排名URL数 | 3个竞争 | 1个主推 |
| JSON-LD Schema有效率 | <50%（因client渲染） | >90% |

---

## 6. 依赖关系

```
C1（ServiceSchema/FAQSchema修复）
    ↓ Googlebot可抓取Schema后
H3（Organization knowsAbout扩展）才能在搜索结果中体现价值

C2（sitemap修复）
    ↓ 统一canonical后
H1（关键词竞争解决）才能正确追踪排名

C3（city pages noindex）
    ↓ 避免重复内容惩罚后
整体域名权重集中到核心页面
```

---

## 7. 参考文档

- Google Search Console: https://search.google.com/u/0/unit?siteSearch=winningadventure.com.au
- GSC URL Inspection: `python ~/.claude/skills/seo/scripts/gsc_inspect.py <url> --json`
- Next.js Server Components: https://nextjs.org/docs/app/building-your-application/rendering/server-components
- Schema.org Service: https://schema.org/Service
- Schema.org FAQPage: https://schema.org/FAQPage
