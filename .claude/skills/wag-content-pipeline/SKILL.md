---
name: wag-content-pipeline
description: |
  WAG automated content pipeline: discover trending keywords from Google Trends (Australia) → write SEO articles → generate cover images → create social posts → build HTML summary page → deploy to production. USE THIS SKILL whenever user wants to go from keyword/trend discovery to published blog article(s). Explicit triggers: "从关键词开始", "发现关键词", "找上升趋势", "run content pipeline", "start the pipeline", "trending keywords", "content pipeline", "从 Google Trends 开始", or any variation meaning "do the full content pipeline from keyword research to published article". This skill is for creating NEW articles, not for editing existing content, generating posts from existing articles, SEO tutoring, or analytics. If user asks for "从关键词开始" or mentions trending keywords + articles + pipeline in same breath, invoke this skill immediately without asking.
version: 6
---

# WAG Content Pipeline

## Overview

WAG 内容管道自动化：从 **Google Trends 澳大利亚上升趋势词**出发，并行完成 SEO 文章写作、封面图生成、社交文案撰写，最终输出 MDX 博客文件 + HTML 汇总页面 + 自动部署。

**核心价值：** 只需提供 10 个话题（从 Google Trends Top 50 表格中选择），skill 自动跑完全程，无需人工干预写作和配图。

**何时使用：** 当用户说"从关键词开始"、"run content pipeline"、"找上升趋势"或任何变体，触发从关键词研究到已发布博客文章的全流程。

**不适用的场景：** 编辑已有文章、从已有文章生成社交帖、SEO 辅导、数据分析。

## 环境变量与路径配置

使用本 skill 前，需配置以下环境变量：

| 变量 | 值 | 说明 |
|------|-----|------|
| GOOGLE_API_KEY | 见 ~/.zshrc | baoyu-imagine 图片生成必需 |
| BAOYU_IMAGINE | /Users/mark/Projects/baoyu-imagine | 图片生成脚本目录 |

已在本机配置的路径：
- WAG frontend: `/Users/mark/Projects/wag/frontend`
- browser-harness: 本地 Chrome CDP（无 API 限制）
- GSC inspect: `~/.claude/skills/seo/scripts/gsc_inspect.py`

## 流程总览

```
用户粘贴 Google Trends 关键词（手动复制）
    ↓
AI 解析 + 过滤 + 排序
    ↓
用户选择话题（每次 10 个）
    ↓
SEO 文章写作 (seo-content skill) — 并行执行
    ↓
信息图 Prompt 生成 (baoyu-infographic) — 并行执行
    ↓
封面图批量生成 (baoyu-imagine batch, 3张/批)
    ↓
Facebook Post + LinkedIn Post 文案 — 并行执行
    ↓
生成 HTML 汇总页面（social-posts.html）
    ↓
输出 MDX → frontend/content/blog/{slug}/
输出图片 → frontend/public/social/blog/{slug}/
输出 Post → ads/post/{YYYY-MM-DD}/{slug}/
输出 HTML → ads/post/{YYYY-MM-DD}/social-posts.html
```

## Step 1: 获取 Google Trends 上升趋势词（用户手动 → AI 筛选）

**方式：自动打开页面 → 用户手动复制粘贴 → AI 解析过滤**

Skill 激活时**自动打开** Google Trends Australia 页面（`https://trends.google.com/trending?geo=AU&sort=search-volume&hours=24`），无需用户请求。

### 我来做什么

1. **解析**——从粘贴内容中提取关键词 + traffic + change 数据
2. **过滤**——仅保留 traffic ≥ 1K+ 的关键词（排除长尾低流量词）
3. **排序**——按 traffic 降序
4. **输出**——Top 50 Markdown 表格

### 支持的粘贴格式

```markdown
# 格式 A: Markdown 表格
| # | Keyword | Traffic | Change |
|---|---------|---------|--------|
| 1 | neale daniher death | 100K+ | +1,000% |

# 格式 B: Excel / Numbers 复制（Tab 分隔）
1    neale daniher death    100K+    +1,000%

# 格式 C: CSV
1,neale daniher death,100K+,+1,000%
```

### 解析规则

- **流量值**：`100K+` → 100000，`20K+` → 20000，`5K+` → 5000，`2K+` → 2000，`1K+` → 1000
- **涨幅值**：`+1,000%` / `+500%` / `BREAKOUT` → 提取数字
- **标题行**：`#` 序号、关键词、流量、涨幅
- **过滤**：drop traffic < 1K+ 的行（`100`、`200`、`500` 这类无 `K` 的直接丢弃）
- **去重**：相同关键词保留最高流量那条

### 展示格式（含中文简介 + WAG 业务角度推荐）

**🚨 重要：每次都必须包含以下两列，不得省略。**

输出 Markdown 表格，**必须包含 4 列**：

```
| # | Keyword | Traffic | 中文简介 + WAG 推荐角度 |
|---|---------|---------|------------------------|
| 1 | neale daniher death | 100K+ | 澳洲传奇教练去世 → 体育纪念品/IP授权商品采购机遇 |
| 2 | kimi antonelli | 20K+ | F1新星崛起 → 赛车运动周边/赞助商品采购 |
...
```

**中文简介 + WAG 推荐角度 规则：**
- 每行一句话中文简介
- 结合 WAG 业务（Australian businesses sourcing from China）给出推荐角度
- 推荐角度用 `→` 开头，说明这个趋势对澳洲采购/供应链的意义
- 如果关键词跟 WAG 业务完全无关，标注 `❌ 非 WAG 业务方向`

**Reference 输出格式（以此为准）：**

```
| # | Keyword | 中文简介 | 推荐 Topic 角度 |
|---|---------|---------|---------------|
| 4 | avg travels liquidation | 澳洲旅行社破产清算 | ✅ 澳洲企业破产/重组 → 可能是收购二手设备/库存的机会 |
| 10 | eid mubarak | 伊斯兰开斋节 | ✅ 穆斯林市场节日消费 → 礼品/节日商品采购机遇 |
| 14 | 007 first light | 詹姆斯邦德新电影 | ✅ 电影周边/IP产品采购 → 授权商品中国制造机遇 |
...
```

用户输入编号列表（如 `4, 10, 14, 18, 20, 29, 33, 34, 39, 44`）确认选择。

### 什么时候进入 Step 2

用户粘贴关键词 → 我过滤排序输出表格 → **用户输入编号列表** → 开始写文章。无需等满 50 条，表格输出即可进入选择环节。

## Step 2: 用户选择话题

用户从 Step 1 输出的 Top 50 表格中**直接选择 10 个**话题（输入编号列表）。

**确认格式**：`2, 6, 12, 17, 27, 32, 33, 35, 48, 49`

收到后解析编号，对应到表格中的关键词，即确定为本次 pipeline 的 10 个话题。

## Step 3: SEO 文章写作（并行执行）

使用 **seo-content skill** 写作文章。**多篇文章时使用 subagent 并行执行**，每个 article 单独一个 subagent。

**文章规范**（遵循 WAG 前端格式）：
- 文件路径：`/Users/mark/Projects/wag/frontend/content/blog/{slug}.mdx`
- **Slug 生成规则**：格式 `{keyword}-{category}-{variation}`
  - `{keyword}` = Google Trends 原始关键词（kebab-case，完整保留）
  - `{category}` = 文章品类（从主题推断，如 nrl-merchandise、basketball、football）
  - `{variation}` = 从 `-sourcing-guide`、`-china-sourcing-guide`、`-merchandise-sourcing-guide`、`-products-sourcing-guide`、`-manufacturing-guide`、`-supply-chain-guide` 中选择最贴合的
  - 例：`who won state of origin 2026` → `who-won-state-of-origin-2026-nrl-merchandise-sourcing-guide`
  - 例：`thunder vs spurs` → `thunder-vs-spurs-nba-basketball-sourcing-guide`
  - 核心关键词必须完整保留，不得换词、缩写或重构
- Frontmatter 必须包含全部字段（不省略任何字段）：
  ```yaml
  title: "..."
  seoTitle: "..."
  description: "..."
  category: "China Sourcing Strategy"
  author: "Mark He"
  date: "{{current_date}}"
  updatedDate: "{{current_date}}"
  readTime: "X min read"
  subtitle: "..."
  desc: "..."
  slug: "..."
  primaryKeyword: "..."
  secondaryKeywords: [...]
  tags: [...]
  ctaTitle: "Need help navigating the new tariff landscape?"
  ctaText: "Winning Adventure Global helps Australian businesses..."
  ctaButtonText: "Book a free strategy call"
  ctaButtonLink: "https://www.winningadventure.com.au/enquiry"
  coverImage: "/social/blog/{{slug}}/cover.png"
  ```
- frontmatter 中的 `coverImage` 字段**必须设置为封面图路径**（格式：`/social/blog/{slug}/cover.png`），用于 Hero Section 背景图渲染——这是 WAG 博客模板的必要字段，缺失会导致文章页面缺少 Hero 背景图

- 正文章节：H2 标题开头，H3 子标题，表格数据，FAQ（H3 格式）
- 字数目标：1500+ words
- 结尾：CTA 段落

## Step 4: 信息图 Prompt 生成（并行执行）

使用 **baoyu-infographic skill** 生成信息图 prompt。**多篇文章时使用 subagent 并行执行**。

**配置**：
- **布局**：`bento-grid`
- **风格**：`corporate-memphis`
- **配色**：深蓝 `#0F2D5E` + 琥珀 `#F59E0B`，白色背景
- **比例**：`16:9`
- **语言**：英文

Prompt 文件保存到 `/tmp/wag-infographics/{slug}/prompts/infographic.md`。

## Step 5: 封面图生成（等待 Step 4 完成）

**🚨 CRITICAL DEPENDENCY — 封面图生成必须等 Step 4 所有信息图 Prompt 生成完毕。**

收到所有 prompt 文件路径后，立即使用 **baoyu-imagine batch** 生成封面图：

```bash
# 确保目录存在
mkdir -p /Users/mark/Projects/wag/frontend/public/social/blog/{slug}/

# 设置 GOOGLE_API_KEY（必须，从环境变量读取）
export GOOGLE_API_KEY=$GOOGLE_API_KEY

# batch 生成（每批最多3张）
bun $BAOYU_IMAGINE/scripts/main.ts \
  --batchfile /tmp/wag-infographics-batch.json --json
```

batch.json 格式（每批最多 3 张，并行生成）：
```json
{
  "jobs": 3,
  "tasks": [
    {
      "id": "slug-cover",
      "promptFiles": ["/tmp/wag-infographics/{slug}/prompts/infographic.md"],
      "image": "/Users/mark/Projects/wag/frontend/public/social/blog/{slug}/cover.png",
      "provider": "google",
      "model": "gemini-3-pro-image-preview",
      "ar": "16:9",
      "quality": "2k"
    }
  ]
}
```

**输出路径**：`frontend/public/social/blog/{slug}/cover.png`

**⚠️ 执行顺序**：Step 3（文章写作）、Step 4（信息图 Prompt）可以并行执行。Step 5（封面图生成）必须等 Step 4 所有信息图 Prompt 文件生成完毕。Step 6（Social Post 文案）必须等 Step 5 封面图生成完毕。

## Step 6: Facebook + LinkedIn Post 文案（并行执行）

根据文章标题、摘要、主要数据点，生成 **Facebook Post** 和 **LinkedIn Post**。**多篇文章时使用 subagent 并行执行**。

### Facebook Post
- 开头抓注意力（数据或问题）
- 简要说明文章价值
- CTA：点击链接
- 长度：50-80 words
- Hashtag：3-5 个

### LinkedIn Post
- 专业商务语气，受众为澳洲企业采购/供应链管理者
- 开头用强数据或反常识观点吸引注意力
- 正文逻辑：背景 → 关键变化 → 对采购的影响 → 建议行动
- CTA：点击链接阅读全文
- 长度：120-180 words
- Hashtag：最多3个，使用 $ 代替 s（如 #ChinaSourcing $Australia）
- 结尾加 `---` 分隔符后附上 cover image 说明

## Step 7: 生成 HTML 汇总页面

生成 `social-posts.html`，包含全部文章的所有社交文案和信息图 Prompt 预览。

**文件路径**：`/Users/mark/Projects/wag/ads/post/{YYYY-MM-DD}/social-posts.html`

**HTML 结构规范详见**：[references/social-posts-html-format.md](references/social-posts-html-format.md)

## Step 8: 输出文件到 WAG 博客目录

**MDX 文件**：`/Users/mark/Projects/wag/frontend/content/blog/{slug}.mdx`

**封面图片**：`/Users/mark/Projects/wag/frontend/public/social/blog/{slug}/cover.png`

**Post 文案**：保存到 `/Users/mark/Projects/wag/ads/post/{YYYY-MM-DD}/{slug}/`
- `facebook-post.md`
- `linkedin-post.md`

**HTML 汇总**：`/Users/mark/Projects/wag/ads/post/{YYYY-MM-DD}/social-posts.html`

## Step 9: 构建和部署

生成完所有内容后，执行构建部署：

```bash
cd /Users/mark/Projects/wag/frontend
npm run build        # 构建验证
git add content/blog/ public/social/blog/  # 暂存新文章和图片（不要 add 整个目录）
git commit -m "Add N new blog articles from content pipeline (YYYY-MM-DD)"
git push origin master  # 部署到 Vercel
```

## 命名规范

### Slug 铁律：{原始关键词}-{品类}-{变化后缀}

**🚨 STRICT — Slug 必须同时包含：原始关键词 + WAG 服务内容**

Slug 格式：`{keyword}-{category}-{variation}`

| 组成部分 | 说明 | 示例 |
|---------|------|------|
| `{keyword}` | Google Trends 原始关键词（kebab-case，完整保留，不得缩写或替换） | `who-won-state-of-origin-2026`、`thunder-vs-spurs` |
| `{category}` | 文章涉及的品类/行业关键词（从文章主题推断） | `nrl-merchandise`、`football-merchandise`、`nba-basketball` |
| `{variation}` | 服务内容后缀（从以下列表中选择最贴合的一个） | 见下方变体列表 |

**允许的后缀变体（选最贴合的一个）：**
- `-sourcing-guide` — 通用采购指南
- `-china-sourcing-guide` — 中国采购专项
- `-merchandise-sourcing-guide` — 商品采购专项
- `-products-sourcing-guide` — 产品采购专项
- `-manufacturing-guide` — 制造/生产指南
- `-supply-chain-guide` — 供应链指南

**规则：**
1. **关键词完整保留**：不得换词、缩写、重构原始关键词
2. **品类由 AI 根据文章主题推断**：从文章涉及的行业/产品品类中提取（如 NRL、NBA、IPL、football、basketball）
3. **选择最贴合的后缀**：根据文章实际内容选择最能描述 WAG 服务的变体
4. **禁止替换核心词**：如 `business-closure` 替代 `avg-travels-liquidation`
5. **禁止使用过时格式**：不再接受 `{keyword}-guide` 格式（旧的 `-guide` 后缀已停用）

**新旧格式对比：**
| Google Trends 关键词 | ❌ 旧 slug（停用） | ✅ 新 slug |
|---------------------|------------------|-----------|
| who won state of origin 2026 | `who-won-state-of-origin-2026-guide` | `who-won-state-of-origin-2026-nrl-merchandise-sourcing-guide` |
| thunder vs spurs | `thunder-vs-spurs-nba-guide` | `thunder-vs-spurs-nba-basketball-sourcing-guide` |
| nba | `nba-sourcing-guide` | `nba-basketball-merchandise-china-sourcing-guide` |
| backrooms | `backrooms-mystery-guide` | `backrooms-internet-culture-products-sourcing-guide` |
| laurie daley | `laurie-daley-nrl-guide` | `laurie-daley-nrl-memorabilia-sourcing-guide` |

**Slug 生成示例（供 AI 参考）：**
- 关键词 `rr vs srh` + 品类 `ipl-cricket` + 后缀 `-merchandise-sourcing-guide` → `rr-vs-srh-ipl-cricket-merchandise-sourcing-guide`
- 关键词 `robbie mortimer` + 品类 `entertainment` + 后缀 `-products-sourcing-guide` → `robbie-mortimer-entertainment-products-sourcing-guide`
- 关键词 `palace vs rayo vallecano` + 品类 `football` + 后缀 `-china-sourcing-guide` → `palace-vs-rayo-vallecano-football-china-sourcing-guide`

如 slug 冲突：末尾加时间戳 `{keyword}-{category}-{variation}-{YYYYMMDD}`（保留核心关键词和品类）。

## Frontmatter 验证函数

在 Step 3 完成后，立即验证每篇文章的 frontmatter：

```bash
# 验证必填字段存在（date, title, slug, coverImage, readTime, ctaTitle, ctaText, ctaButtonText, ctaButtonLink）
for f in /Users/mark/Projects/wag/frontend/content/blog/**/*.mdx; do
  for field in date title slug coverImage readTime ctaTitle ctaText ctaButtonText ctaButtonLink; do
    grep -q "^${field}:" "$f" || echo "MISSING $field in $f"
  done
done

# 验证 coverImage 路径格式
grep -rh '^coverImage:' /Users/mark/Projects/wag/frontend/content/blog/ | grep -v '/social/blog/' && echo "Bad coverImage path"

# 验证日期字段加引号（应为 "2026-05-18" 而非 2026-05-18）
grep -rh '^date:' /Users/mark/Projects/wag/frontend/content/blog/ | grep -v '"' && echo "Unquoted date"
```

## 并行执行策略

多篇文章时，使用 **Agent** 工具并行执行独立任务：

| Agent | 职责 | 依赖 |
|-------|------|------|
| Agent 1 | SEO 文章写作（多篇并行） | 无 |
| Agent 2 | 信息图 Prompt 生成（多篇并行） | 无 |
| Agent 3 | **封面图生成**（等 Agent 2 完成） | Agent 2 |
| Agent 4 | Facebook + LinkedIn Post 文案（多篇并行） | Agent 1 + Agent 3 |

主会话负责：Step 1（Google Trends）、Step 2（话题选择）、Step 7（HTML 汇总）、Step 9（构建部署）。

**⚠️ 关键依赖链**：Agent 2 信息图 Prompt → Agent 3 封面图 → Agent 4 Social Post。Agent 3 必须收到所有 prompt 文件路径后才能开始 batch 生成。Agent 4 必须等封面图生成完毕后再读取文章并撰写 Post 文案。

**重试逻辑**：
- baoyu-imagine batch 失败：检查 `GOOGLE_API_KEY` 环境变量 + quota exceeded 错误
- 单张重试：`bun $BAOYU_IMAGINE/scripts/main.ts --single [promptFile] [outputPath]`

## 关键约束

### 铁律：所有内容必须为英文
**🚨 STRICT — No Exceptions:**
- **所有 MDX 文章内容必须为英文** — 文章正文、标题、副标题、描述，全部英文
- Frontmatter 中的 `title`、`subtitle`、`description`、`ctaTitle`、`ctaText` 全部英文
- 社交 Post 文案（Facebook、LinkedIn）全部英文
- 图片 prompt 全部英文
- 即使关键词趋势来自中文背景，文章内容也必须翻译为英文
- 违反此规则的文章将被拒绝，必须重写为英文版

### 其他约束

1. **用户粘贴趋势词，AI 负责解析过滤** — Skill 激活时自动打开页面，用户手动复制后粘贴
2. **先解析趋势，后开始写文章**——不能假设知道当天趋势
3. **封面图生成必须设置 GOOGLE_API_KEY** — `export GOOGLE_API_KEY=$GOOGLE_API_KEY`，不带此变量 baoyu-imagine batch 会报 "GOOGLE_API_KEY or GEMINI_API_KEY is required"
4. **baoyu-imagine batch 每批最多 3 张** — 超过 3 张分多批执行
5. **遵循 WAG frontmatter 格式**——不简化、不省略字段
6. **作者固定为 Mark He**——不从文章内容推断作者
7. **MDX 中图片路径用 `/social/blog/{slug}/` 前缀**——对应 `public/social/blog/` 目录
9. **必须生成 LinkedIn Post**——每个话题都要写，不能跳过
10. **必须生成 HTML 汇总页面**——每批内容都要输出 social-posts.html，包含所有文章的封面图 Preview + Facebook Post + LinkedIn Post + 信息图 Prompt
11. **封面图必须生成完毕才能写 Social Post**——封面图是 Social Post 文案的视觉锚点，Agent 4 必须等 Agent 3 完成封面图生成后才能开始撰写 Post 文案
12. **GOOGLE_API_KEY 必须通过环境变量传入**——不要硬编码在脚本或 Skill 中

## 所需 Skills

- `seo-content` — SEO 文章写作
- `baoyu-infographic` — 信息图 prompt 生成
- `baoyu-imagine` — 图片批量生成（batch 模式）

## 输出摘要

**中文简介：** 每次汇总时，先给用户一句中文概括本次 pipeline 的整体进展和核心产出，帮助快速了解结果。

完成所有步骤后，向用户汇报：
- 选择的趋势话题（涨幅 + 流量）
- 文章 slug 和文件路径
- 封面图片路径（`frontend/public/social/blog/{slug}/cover.png`）
- Facebook Post 文案（字数）
- LinkedIn Post 文案（字数）
- HTML 汇总页面路径（ads/post/{YYYY-MM-DD}/social-posts.html）
- 构建状态和 Vercel 部署 URL
- 下一步建议（上线、分享到社交平台）

## 已知错误与防范

### 错误 1：coverImage 字段缺失导致 Hero 背景图不显示
**症状**：文章页面 Hero Section 无背景图，显示为纯色
**根因**：seo-content subagent 生成的 frontmatter 缺少 `coverImage` 字段
**防范**：
- Step 3 的 subagent prompt 中必须明确列出 frontmatter 全部字段，要求逐一出具
- 在 Step 8 输出文件检查时，运行 frontmatter 验证函数，验证所有必填字段存在
- 验证文件存在：`frontend/public/social/blog/{slug}/cover.png`

### 错误 2：date 字段格式错误导致构建失败
**症状**：`TypeError: a.split is not a function` 或 `Objects are not valid as a React child`
**根因**：frontmatter 中 `date: 2026-05-18`（裸数字），gray-matter 解析为 Date 对象而非字符串，传入 `<time>` 等组件时崩溃
**防范**：所有日期字段必须加双引号：`date: "2026-05-18"`、`updatedDate: "2026-05-18"`

### 错误 3：并行 agent 读取未生成的封面图
**症状**：Social Post 文案中提到封面图，但封面图尚未生成
**根因**：Agent 4（Social Post）在 Agent 3（封面图）完成前开始读取文章文件
**防范**：Agent 4 必须显式检查 `frontend/public/social/blog/{slug}/cover.png` 文件存在后再开始撰写 Post 文案。等待方式：循环检查文件存在（每 2 分钟一次，最多 15 分钟）

### 错误 4：HTML 汇总页面缺少封面图预览
**症状**：social-posts.html 中只有文字内容，看不到封面图
**根因**：Step 6 的 HTML 结构说明未要求加入 `<img class="cover-preview">`
**防范**：Step 6 规范已明确每个 `.article-block` 必须以封面图 `<img>` 开头

### 错误 5：frontmatter 字段不完整导致构建失败
**症状**：构建报错或页面缺少 CTA、readTime 等元素
**根因**：seo-content subagent 生成的文章省略了 `readTime`、`updatedDate`、`subtitle`、`desc`、`tags`、`ctaTitle`、`ctaText` 等字段
**防范**：Step 3 的 subagent prompt 必须提供完整的 frontmatter 模板（含所有字段），要求 agent 严格按模板出具，不得省略任何字段。可在 Step 7 用 `grep` 验证所有必填字段存在。

### 错误 6：HTML 汇总页面使用错误的 URL 域名
**症状**：文章链接指向不存在的域名（如 `winningadventure.global/blog/`）或错误的路径（如 `/blog/` 而非 `/resources/`）
**根因**：subagent 或 HTML 生成时使用了自行猜测的 URL，未参考 WAG 实际 URL 结构
**防范**：WAG 文章页面 URL 格式必须为 `https://www.winningadventure.com.au/resources/{slug}`，所有文章链接必须使用此格式，不得使用 `winningadventure.global`、`/blog/` 或任何其他域名/路径变体。

### 错误 7：HTML 汇总页面图片路径使用不存在的 URL
**症状**：social-posts.html 中 img src 指向 CDN URL，但图片实际不存在或未部署
**根因**：使用了 CDN URL 而非相对路径，图片尚在本地未部署
**防范**：HTML 汇总页面必须使用相对路径 `../../../frontend/public/social/blog/{slug}/cover.png`（从 ads/post/YYYY-MM-DD/ 出发）

### 错误 8：Facebook/LinkedIn Post 内容包含 localhost URL
**症状**：Post 文案内容中出现 `localhost:3000` 链接
**根因**：生成 post 时混入了开发环境 URL
**防范**：Facebook Post 和 LinkedIn Post 的文案内容中，URL 必须使用 production 格式 `https://www.winningadventure.com.au/resources/{slug}`，不得出现 localhost。localhost 仅允许出现在 HTML 汇总页面的 `.article-url` 区域（作为 Local 预览链接）

## Verification Checklist

部署前验证步骤：

```bash
# 1. 验证 frontmatter 必填字段存在
for f in /Users/mark/Projects/wag/frontend/content/blog/**/*.mdx; do
  for field in date title slug coverImage readTime ctaTitle ctaText ctaButtonText ctaButtonLink; do
    grep -q "^${field}:" "$f" || echo "MISSING $field in $f"
  done
done

# 2. 验证 coverImage 路径格式
grep -rh '^coverImage:' /Users/mark/Projects/wag/frontend/content/blog/ | grep -v '/social/blog/' && echo "Bad coverImage path"

# 3. 验证日期字段加引号
grep -rh '^date:' /Users/mark/Projects/wag/frontend/content/blog/ | grep -v '"' && echo "Unquoted date"

# 4. 验证封面图文件存在
ls /Users/mark/Projects/wag/frontend/public/social/blog/{slug}/cover.png

# 5. 验证 HTML 汇总页面存在
ls /Users/mark/Projects/wag/ads/post/{YYYY-MM-DD}/social-posts.html
```