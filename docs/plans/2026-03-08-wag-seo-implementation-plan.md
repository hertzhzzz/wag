# WAG SEO 获客实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 建立完整的 SEO 基础设施，从 4 篇博客扩展到 15-20 篇，获取 Google 搜索流量

**Architecture:**
- 阶段 1：技术 SEO 基础（1-2 周）- 生成 sitemap，配置 Google Search Console
- 阶段 2：内容扩展（1-2 个月）- 每周产出 1-2 篇新文章
- 阶段 3：内链优化 - 建立内容集群

**Tech Stack:** Next.js 14, gray-matter, Google Search Console

---

## 阶段 1：技术 SEO 基础（1-2 周）

### Task 1: 创建 XML Sitemap

**Files:**
- Create: `app/sitemap.ts`

**Step 1: 创建 sitemap.ts 文件**

```typescript
import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

function getAllArticles() {
  return fs
    .readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map(filename => {
      const slug = filename.replace('.mdx', '')
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf-8')
      const { data } = matter(raw)
      return {
        slug,
        date: data.date || '2026-01-01',
      }
    })
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.winningadventure.com.au'
  const articles = getAllArticles()

  const blogUrls = articles.map(article => ({
    url: `${baseUrl}/resources/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/enquiry`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...blogUrls,
  ]
}
```

**Step 2: 验证构建**

Run: `cd web/frontend && npm run build`
Expected: 构建成功，包含 sitemap.xml

**Step 3: 验证 sitemap 访问**

Run: `curl https://www.winningadventure.com.au/sitemap.xml`
Expected: 返回 XML 内容

---

### Task 2: 配置 robots.txt

**Files:**
- Modify: `public/robots.txt:1-5`

**Step 1: 确认 robots.txt 配置**

当前配置：
```
User-agent: *
Allow: /

Sitemap: https://www.winningadventure.com.au/sitemap.xml
```

配置正确，无需修改。

---

### Task 3: 优化现有文章的 SEO Meta

**Files:**
- 检查并优化: `content/blog/*.mdx` 中的 frontmatter
- 修改: `app/resources/[slug]/page.tsx`

**Step 1: 检查现有文章 frontmatter**

确保每篇文章包含：
- title
- description
- keywords (数组)
- canonical (可选)

Run: `ls content/blog/`

**Step 2: 优化 page.tsx 的动态 SEO**

读取并确保 `app/resources/[slug]/page.tsx` 使用正确的 Metadata API。

---

### Task 4: 提交 Google Search Console

**Step 1: 创建 Search Console 任务（手动操作）**

1. 访问 https://search.google.com/search-console
2. 添加域名：winningadventure.com.au
3. 通过 DNS 验证所有权
4. 提交 sitemap：/sitemap.xml

**无代码任务，跳过。**

---

## 阶段 2：内容扩展（1-2 个月）

### Task 5: 扩展博客内容 - 第 1 批（P0 主题）

**Files:**
- Create: `content/blog/how-to-inspect-factories-china.mdx`
- Create: `content/blog/australia-china-sourcing-guide.mdx`

**Step 1: 使用 Perplexity 生成第 1 篇文章**

主题：How to Inspect Factories in China - Complete Guide for Australian Buyers

目标关键词：
- "how to inspect factories in China"
- "factory inspection guide"
- "Australian buyer China"

使用 Perplexity 生成 1500-2000 词的英文文章。

**Step 2: 创建文章文件**

参考现有文章格式：
```mdx
---
title: "[标题]"
seoTitle: "[SEO 标题] | WAG"
description: "[Meta 描述 - 150-160 字符]"
category: "Factory Visit"
author: "Andy Liu, Founder — Winning Adventure Global"
date: "8 Mar 2026"
updatedDate: "8 Mar 2026"
readTime: "X min read"
subtitle: "[副标题]"
desc: "[简短描述]"
slug: "/resources/how-to-inspect-factories-china"
primaryKeyword: "how to inspect factories in China"
secondaryKeywords:
  - "factory inspection China"
  - "Australian buyer factory visit"
tags:
  - "Factory visit"
  - "China sourcing"
ctaTitle: "Ready to inspect factories in China?"
ctaText: "We arrange pre-screened factory visits with full translation and coordination."
ctaButtonText: "Get in touch"
ctaButtonLink: "https://www.winningadventure.com.au/enquiry"
coverImage: "https://images.unsplash.com/photo-xxxxx?auto=format&fit=crop&w=1200&q=80"
---
```

**Step 3: 同样方式创建第 2 篇文章**

主题：Australia China Sourcing Guide for SMEs

**Step 4: 本地验证**

Run: `cd web/frontend && npm run build`
Expected: 构建成功，新文章可访问

---

### Task 6: 扩展博客内容 - 第 2 批（P1 主题）

**Files:**
- Create: `content/blog/factory-inspection-checklist.mdx`
- Create: `content/blog/negotiating-chinese-suppliers.mdx`

**Step 1: 使用 Perplexity 生成文章**

参考 Task 5 流程。

---

### Task 7: 扩展博客内容 - 第 3 批（P2 主题）

**Files:**
- Create: `content/blog/red-flags-factory-visits.mdx`
- Create: `content/blog/china-shipping-australia-guide.mdx`

---

### Task 8: 更新首页 / Services 页面关键词

**Files:**
- 修改: `app/services/page.tsx`
- 或: `app/page.tsx`

**Step 1: 检查现有 SEO 配置**

确保 Services 页面包含核心关键词：
- "China factory inspection service"
- "Australian buyer China supplier visit"
- "One-stop factory tour China"

---

## 阶段 3：内链优化

### Task 9: 建立文章内链

**Files:**
- 修改: `content/blog/*.mdx` 中添加内链

**Step 1: 为每篇文章添加 2-3 个相关文章链接**

在文章末尾 CTA 前添加：
```mdx
## Related Articles

- [How to Verify a Chinese Supplier](/resources/verify-chinese-supplier)
- [China Business Travel Guide 2026](/resources/china-business-travel-guide-2026)
```

**Step 2: 验证内链**

Run: `npm run build`
Expected: 构建成功

---

### Task 10: 部署与验证

**Step 1: 提交代码**

```bash
git add .
git commit -m "feat: add SEO foundation - sitemap, blog content expansion"
```

**Step 2: 部署**

Run: `vercel --prod` 或等待 GitHub 自动部署

**Step 3: 验证**

1. 访问 /sitemap.xml 确认生成
2. 访问 /resources 确认新文章显示
3. 在 Google Search Console 确认 sitemap 已提交

---

## 执行选择

**Plan complete and saved to `docs/plans/2026-03-08-wag-seo-implementation-plan.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
