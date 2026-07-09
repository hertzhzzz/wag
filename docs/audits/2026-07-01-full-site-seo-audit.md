---
date: 2026-07-01
type: audit
scope: full-site
trigger: post schema-100 fix handoff review
---

# 全站 SEO 复查报告 — 2026-07-01

背景：2026-06-01 上一次全面审计综合分 73/100，原始详细报告已丢失。本次复查紧接在 schema 结构化数据修复上线之后，目的是摸清真实现状、为下一阶段工作排优先级。

覆盖范围：技术 SEO、结构化数据、博客内容质量、sitemap、页面性能、Google Search Console 真实数据。全部为只读检查，未改动线上任何内容。

## Tier 1 — 严重，直接损失业务价值

### 1. 核心业务关键词几乎拿不到点击

- GSC 真实数据（近28天 vs 基线期）：168 个"sourcing/factory/supplier/verify"相关业务关键词，累计只有 1 次点击。"supplier verification"（68次曝光，排名第10.5）、"china factory visit agent"（48次曝光，第44.5名）、"china sourcing agent australia"（31次曝光，第40.1名）全部 0 点击。
- 核心问题：这些关键词排名普遍在 20-70 名开外，根本没进首页，曝光了也没人点。
- 说明：整体曝光量看起来暴涨（28天同比+2493%），但这主要是下面 Tier 3 提到的已下线旧内容的历史遗留数据，不代表真实业务流量在增长（详见下方"已排查确认无需担心"）。

## Tier 2 — 中等，影响内容质量和可信度

### 2. 5 篇博客文章存在文字重复/注入错误

疑似自动加内链脚本故障导致，读起来明显不通顺：
- `china-business-sourcing-tour.mdx`（第33行）：品牌名和短语整段重复
- `china-factory-tour-guide.mdx`（第149行）：句子语法不通
- `bulk-procurement-china-guide.mdx`（第29行）：短语重复
- `factory-vs-trading-company-china-guide.mdx`：frontmatter 的 subtitle 字段混入错误内链文字
- `china-sourcing-risks.mdx`（第36行）：较轻微的类似问题

### 3. 3 篇文章内容高度重叠，互相抢流量

`china-factory-tour-guide.mdx`、`china-business-sourcing-tour.mdx`、`china-factory-visit-agent-australia.mdx` 都是"中国工厂考察行程规划"主题，建议合并保留信息最完整、无错误的一篇（`china-factory-visit-agent-australia.mdx`，2026-06-22 发布），其余两篇 301 跳转过去。

### 4. 4 篇文章 frontmatter 自标注"AI生成未审核"，从未校对

`china-business-sourcing-tour`、`how-to-negotiate-chinese-factory-guide`、`china-factory-tour-guide`、`verify-chinese-supplier` — 与上面发现的文字错误相互印证。

### 5. Mark He 作者身份是"悬空引用"

`lib/schema.ts` 定义了 `MARK_ID`（`/#mark-he`），18 篇文章的结构化数据都引用这个身份，但全站没有任何页面真正声明这个人物的完整信息（职位/简介/所属机构）。Andy Liu 在 `/about` 有完整的人物信息，Mark He 没有对应节点。

### 6. 大部分文章正文没有真正体现作者背书

只有 2 篇文章在正文里写出"Mark He is the founder..."建立可信度，其余文章只在 frontmatter 挂名，读者看不到。

## Tier 3 — 轻微，可顺手清理

- `/services` 页面首图缺少加载优先级标记（`priority`/`fetchPriority="high"`），导致该页面加载最慢（LCP 6.5秒 vs 首页4.1秒）——项目自己的 CLAUDE.md 里已经记录了这个标准做法，只是这个页面没套用
- 一篇文章标题标签长达154字符（`bulk-procurement-china-guide`），远超 Google 显示上限（约60字符）
- sitemap 里的 `/solutions` 收录的是跳转链接（实际 308 跳到 `/services`），应删除
- sitemap 里所有静态页面的 lastmod 时间戳完全相同（构建时间，非真实更新时间），不影响排名但不准确
- 项目里有几个编辑器崩溃留下的临时文件（`.fuse_hidden*`）和一个空文件夹（`rr-vs-srh-ipl-guide/`），建议清理

## 已排查、确认没问题

- **`/factory` 工厂库线上 404 不是故障**：初步排查时误判为严重故障（怀疑是 Vercel 路由配置问题），经与产品方确认后澄清——工厂库代码和数据已开发完成并合并到 master，但**尚未正式对外上线**，404 是预期状态。已同步更正 `wag/CLAUDE.md` 里容易让人误读为"已上线"的措辞。上线是独立的产品决策，不在本次审计的行动项里。
- **这次 schema 修复已上线生效**：37个 sitemap 页面全部验证通过，Organization/Person/Article/Service 覆盖和业务页面完整对应，无遗漏页面
- 索引状态健康，没有"已抓取未编入索引"堆积
- robots.txt、canonical 标签、重定向链、移动端适配、HTTPS/HSTS 均无问题
- 18 篇博客文章选题都紧扣"中国供应链采购/工厂审核/合规验证"主业务，没有真正跑题的文章
- **"曝光暴涨但点击崩盘"的数据不是新问题**：追查发现这批高曝光低点击的页面（网球明星周边、足球新闻、地缘政治供应链、房价新闻等，共76个页面）全部指向 `/resources/` 路径下的内容，而这批内容其实是约两个月前（2026年4月）一次已废弃的实验性尝试留下的，且已经被正确下线——线上访问返回标准 410 Gone（"Content Removed"，附带引导链接），不是现在还在发生的问题。Google 处理 410 需要时间，Search Console 报表里的曝光是历史遗留数据，会随时间自然消退，不需要现在采取行动。

## 建议优先级

下一阶段设计候选（几个互相独立，需要另选一个深入）：
- 内容质量整顿（合并重叠文章、修复文字错误、补齐 Mark He 身份、建立 AI 内容校对流程）
- 核心关键词排名策略（为什么业务词排不上去，需要什么内容/内链/权威度建设）
- 留资表单转化率审计（这次没有覆盖，仍是独立未探索领域）
- Tier 3 小修小补可以打包成一次性清理任务，不需要单独设计
