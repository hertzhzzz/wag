# WAG Content Hub — 技能复用策略分析

**任务编号**: #4
**分析时间**: 2026-04-01
**状态**: 深度分析完成

---

## 一、现有 Skills 能力地图

### 1.1 技能位置分布（关键发现）

```
Skills 存在于 3 个不同位置：

位置 A: /Users/mark/Projects/wag/.claude/skills/
  └── wag-linkedin-post/          ← WAG 项目专属

位置 B: /Users/mark/.claude/skills/
  ├── wag-seo-blog/               ← 全局复用（！）
  ├── geo-* (10个技能)            ← GEO SEO 全家桶
  ├── chrome-cdp/                 ← 浏览器自动化
  └── wag-marketing-wiki.md       ← 旧版营销 wiki（已过时）

位置 C: GitHub jimliu/baoyu-skills（未安装，仅引用）
  ├── baoyu-post-to-x/
  ├── baoyu-post-to-wechat/
  ├── baoyu-article-illustrator/
  └── +14 其他工具类技能
```

**关键问题 #1 — 技能位置不一致**：
`wag-linkedin-post` 在项目内，而 `wag-seo-blog` 在全局。两者理应在同一目录树下才方便复用。根源是 `wag-linkedin-post` 是在 wag 项目中创建的，而 `wag-seo-blog` 是通过 `npx skills add` 安装到全局的。

### 1.2 核心能力矩阵

| 能力维度 | wag-linkedin-post | wag-seo-blog | baoyu-post-to-x | baoyu-post-to-wechat | baoyu-article-illustrator |
|---------|------------------|--------------|-----------------|---------------------|--------------------------|
| **话题引导** | ✅ Socratic 5问（中文） | ❌ 直接变量输入 | ❌ | ❌ | ❌ |
| **内容生成** | ✅ LinkedIn Post 英文 | ✅ 完整 MDX Blog | ❌ (仅发布) | ❌ (仅发布) | ❌ (仅图片) |
| **RAG 检索** | ✅ Glob+Grep 博客内容 | ❌ | ❌ | ❌ | ❌ |
| **格式模板** | ✅ 3种（Steps/Story/Carousel） | ✅ MDX frontmatter | ❌ | ❌ | ❌ |
| **多渠道适配** | ❌ 仅 LinkedIn | ❌ 仅 Blog | ✅ X/Twitter | ✅ 微信公众号 | ❌ |
| **品牌规则** | ✅ 完整（Hook/CTR/CTA/标签） | ✅ 完整（Slug/Link规则） | ⚠️ 无 WAG 品牌 | ⚠️ 无 WAG 品牌 | ⚠️ 无 WAG 品牌 |
| **发布执行** | ❌（生成文本，用户手动发） | ❌（生成 MDX，用户部署） | ✅ Chrome CDP | ✅ API/Browser | ❌ |
| **自进化数据** | ✅ ER/CTR/评论数据内嵌 | ❌ | ❌ | ❌ | ❌ |
| **SKILL.md 格式** | YAML frontmatter (v1) | YAML frontmatter (v1) | YAML + metadata.openclaw | YAML + multi-account | YAML + metadata.openclaw |

### 1.3 RAG 机制对比

**wag-linkedin-post RAG 流程**（已实现）:
```
1. Glob: content/blog/*.mdx
2. Grep: 匹配用户话题（head_limit: 3）
3. Read: 读取前3个匹配文件
4. Incorporate: 将统计数据/案例注入帖子
```
**复用价值**: ⭐⭐⭐⭐⭐ — 这是内容一致性的核心，必须共享。

**wag-seo-blog RAG 状态**: 未实现。依赖 Reference 文件（`web/frontend/content/BLOG_PROMPT.md`）提供上下文，但不动态检索 WAG 已有内容。
**复用价值**: 补强优先级高。

### 1.4 Socratic Q&A 流程分析

**wag-linkedin-post 的 Socratic 流程**（5问，中文界面）:

| 问题 | 目的 | 复用价值 |
|------|------|---------|
| Q1: 读者面临什么挑战？ | 话题定位 | ⭐⭐⭐ 可跨渠道 |
| Q2: 什么结构？（步骤/案例/误区） | 格式选择 | ⭐⭐⭐ 可跨渠道 |
| Q3: 有无真实案例？ | 内容素材 | ⭐⭐⭐ 可跨渠道 |
| Q4: CTA 设计？ | 转化目标 | ⚠️ 渠道差异化 |
| Q5: 公司主页还是个人账号？ | 发布策略 | ⚠️ 渠道差异化 |

**复用判断**: Q1-Q3 是通用的"内容策略确认"，可提炼为共享的 `content-strategy-flow` 模块。Q4-Q5 需针对渠道定制。

`★ Insight ─────────────────────────────────────`
Socratic 流程的本质是"减少生成迭代"——通过提前确认话题/结构/素材，避免生成后大幅修改。这与 LLM 的"一次性生成"理念相悖，但实践证明确实有效（WAG ER 33%的帖子就来自明确的步骤框架）。
─────────────────────────────────────────────────`

---

## 二、复用优先级排序

### 2.1 优先级矩阵（按投入产出比）

| 优先级 | 复用项 | 从...到 | 复杂度 | 复用价值 | 理由 |
|-------|--------|--------|--------|---------|------|
| **P0** | RAG 检索机制 | linkedin-post → 所有渠道 | 低 | 极高 | 内容一致性基础，代码仅 4 行 Glob+Grep |
| **P0** | WAG 品牌规则库 | 独立提取 | 低 | 极高 | 品牌声音/CTR规则/CTA框架统一维护 |
| **P1** | Socratic Q1-Q3 流程 | linkedin-post → hub | 中 | 高 | 话题确认是跨渠道通用的 |
| **P1** | MDX 生成逻辑 | seo-blog → hub | 中 | 高 | 完整 frontmatter 模板可复用 |
| **P2** | 性能数据注入 | linkedin-post → hub | 低 | 中 | ER/CTR 数据结构统一 |
| **P2** | baoyu-post-to-x 适配 | baoyu → wag-x-post | 中 | 高 | 实际发布执行层 |
| **P2** | baoyu-post-to-wechat 适配 | baoyu → wag-wechat | 中 | 高 | 实际发布执行层 |
| **P3** | baoyu-article-illustrator 集成 | baoyu → wag-hub | 中 | 中 | 配图非核心流程，可选 |
| **P3** | LinkedIn 发布执行 | linkedin-post → hub | 高 | 低 | LinkedIn 无 API，需 Chrome CDP |

### 2.2 P0 优先级的核心理由

**RAG 检索机制**是最低成本、最高价值的复用：
- 代码量：4 行（Glob + Grep + Read）
- 效果：保证所有渠道内容引用 WAG 真实数据和案例
- 当前状态：`wag-linkedin-post` 已实现，`wag-seo-blog` 未实现
- 建议：提取为 `wag-content-hub/lib/rag.ts` 或直接内联到各 skill 的生成 prompt

**WAG 品牌规则库**应独立维护：
- 原因：品牌规则（Hook公式/CTA框架/标签矩阵/ER数据）分散在 `wag-linkedin-post` 中
- 建议：创建 `wag-content-hub/lib/brand-rules.md`，各 skill 通过相对路径引用

---

## 三、SKILL.md 调用协议设计

### 3.1 Frontmatter 标准化格式

当前存在两种格式：

**当前格式 A（wag-linkedin-post / wag-seo-blog）**:
```yaml
---
name: wag-linkedin-post
description: "Generate WAG-branded LinkedIn posts..."
---
```

**当前格式 B（baoyu-* skills）**:
```yaml
---
name: baoyu-post-to-x
description: Posts content to X (Twitter)...
version: 1.56.1
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-post-to-x
    requires:
      anyBins:
        - bun
        - npx
---
```

**推荐统一格式**（格式 B 更完善，建议以此为标准）:
```yaml
---
name: wag-{channel}-post
description: "Generate/adapter WAG content for {channel}.
  Invoked by wag-content-hub or standalone.
  Use when: user wants to create/publish {channel} content."
version: 0.1.0
type: channel-generator | channel-publisher | utility

# 跨 skill 调用约定
channels:
  - linkedin
  - x
  - facebook
  - blog
  - wechat

# 依赖的其他 skills（声明式引用）
depends_on:
  - skill: wag-content-hub
    purpose: RAG retrieval and brand rules
  - skill: baoyu-article-illustrator
    purpose: image generation (optional)

# RAG 数据源
rag:
  source_dir: content/blog/
  query_pattern: "*.mdx"
  top_k: 3

# 品牌规则引用
brand_rules_path: ../lib/brand-rules.md
---
```

### 3.2 Skill 间调用协议

**协议名称**: WAG Content Skill Protocol (WCSP) v0.1

**核心原则**: **声明式引用，运行时Resolve，禁止硬编码路径**

#### 协议 A：内容输入协议（Content Input Protocol）

当 skill A 生成的内容传递给 skill B 时，通过文件路径约定：

```
输出路径: {channel}/output/{YYYY-MM-DD-topic}/post.md
图像路径: {channel}/output/{YYYY-MM-DD-topic}/imgs/
元数据:   {channel}/output/{YYYY-MM-DD-topic}/meta.json
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `post.md` | string | 纯内容文本（或带 frontmatter 的 MDX） |
| `imgs/` | directory | 已生成的配图 |
| `meta.json` | object | `{topic, keywords, tone, cta_type, author_type}` |

**Example**: `wag-linkedin-post` 输出给 `wag-content-hub`：
```
social/linkedin-post/2026-04-01-factory-verification/post.md
social/linkedin-post/2026-04-01-factory-verification/imgs/01-cover.png
social/linkedin-post/2026-04-01-factory-verification/meta.json
```

#### 协议 B：RAG 上下文注入协议

当 skill A 需要调用共享 RAG 时，使用标准化的工具链：

```typescript
// 标准 RAG 工具链（4步，非链式）
const blogFiles = await glob("content/blog/*.mdx");
const relevantFiles = await grep(blogFiles, {
  pattern: userTopic,
  head_limit: 3
});
const contextContent = await Promise.all(
  relevantFiles.map(f => read(f))
);
// 将 contextContent 注入生成 prompt
```

**约定**: 所有内容生成类 skill 必须实现此协议，不论语言是 TypeScript/纯 Prompt。

#### 协议 C：品牌规则引用协议

```markdown
<!-- 在 SKILL.md 中引用品牌规则 -->
## Brand Rules
Source: `../../lib/brand-rules.md`
[内联关键规则，或提示 Agent 读取该文件]
```

**理由**: 避免品牌规则在多个 skill 中重复维护。

### 3.3 Skill 调用关系图

```
用户意图
    │
    ▼
┌─────────────────────┐
│  wag-content-hub   │  ← 主入口（待创建）
│  (协调层)            │
└──────────┬──────────┘
           │ 根据渠道分发
     ┌─────┼─────┬──────────┐
     ▼     ▼     ▼          ▼
┌────────┐ ┌───┐ ┌────────┐ ┌──────────────┐
│LinkedIn│ │ X │ │Facebook│ │ SEO Blog     │
│Post    │ │Post│ │Post    │ │(wag-seo-blog)│
│(复用)  │ │(新)│ │(新)    │ │(复用)        │
└────┬───┘ └─┬─┘ └────────┘ └──────┬───────┘
     │       │                     │
     │       ▼                     │
     │  ┌────────────┐             │
     │  │baoyu-post- │             │
     │  │to-x(发布)  │             │
     │  └────────────┘             │
     │                             │
     └──────────┬──────────────────┘
                │ 共享依赖
        ┌───────┴────────┐
        │ 共享模块 (P0)   │
        ├────────────────┤
        │ RAG检索 (4步)   │
        │ 品牌规则库      │
        │ Socratic Q1-3  │
        │ 性能数据结构    │
        └────────────────┘
```

`★ Insight ─────────────────────────────────────`
当前架构实际上是"每个 skill 自包含一切"——`wag-linkedin-post` 包含了 RAG、品牌规则、性能数据全部内容。复用不是"拆分"而是"提取共享层"。
这意味着新的 `wag-content-hub` 的核心价值不是"调用"各 skill，而是"提供共享依赖"，让各 channel skill 变薄。
─────────────────────────────────────────────────`

---

## 四、RAG 机制共享方案

### 4.1 当前 RAG 实现分析

**wag-linkedin-post 的 RAG 实现**（SKILL.md 内联）:
```markdown
1. Glob — Find all blog files:
   Pattern: content/blog/*.mdx

2. Grep — Search for content matching the user's topic
   (use `head_limit: 3` to limit matches)

3. Read — Extract content from the top 3 matched files

4. Incorporate — Use sourced statistics, examples,
   case studies from the retrieved content in the generated post
```

这是**朴素的 RAG**（Naive RAG），无向量嵌入、无重排序、无摘要。优点是零依赖，缺点是召回质量依赖关键词匹配。

### 4.2 共享方案：分层 RAG

```
┌─────────────────────────────────────────────┐
│  Layer 1: 朴素 RAG（当前，直接复用）          │
│  Glob + Grep + Read，head_limit:3           │
│  适用场景：小规模内容库（<100篇），关键词明确  │
└─────────────────────────────────────────────┘
           │
           ▼ (内容库 >100 篇时升级)
┌─────────────────────────────────────────────┐
│  Layer 2: 摘要 RAG（建议未来升级）            │
│  预生成 content/blog/*.summary.md           │
│  每次 Glob 后先读 summary 再决定是否读全文   │
└─────────────────────────────────────────────┘
```

**立即可实施的共享方案**:

**方案 A — 内联到 SKILL.md（零改造，最快）**:
```markdown
## RAG Retrieval (Shared)
Before generating, retrieve relevant WAG content:

1. Glob: content/blog/*.mdx
2. Grep: match user topic, head_limit: 3
3. Read: top 3 matched files
4. Incorporate: inject into prompt

## RAG Reference
This protocol is shared across all WAG channel skills.
Do NOT re-implement — copy the 4-step protocol above.
```

**方案 B — 提取为独立引用文件（推荐，长期维护）**:
```
wag-content-hub/
├── lib/
│   ├── rag-protocol.md      # 标准 RAG 流程
│   ├── brand-rules.md       # 品牌规则全集
│   └── socratic-q1-3.md     # 通用话题确认流程
├── skills/
│   ├── linkedin-post/SKILL.md   # reference: ../../lib/rag-protocol.md
│   ├── seo-blog/SKILL.md        # reference: ../../lib/rag-protocol.md
│   └── ...
```

**方案 C — 抽象为单一 `wag-content-core` skill（架构最优，工程量最大）**:
```
/skill wag-content-core generate --topic "..." --channel linkedin
```
优点：单一真相源。缺点：改造力度大，当前阶段不推荐。

### 4.3 内容源目录约定

为确保 RAG 检索有效，所有 WAG 内容应遵循统一存储：

| 内容类型 | 存储路径 | RAG 可检索 |
|---------|---------|-----------|
| Blog MDX | `content/blog/*.mdx` | ✅ |
| LinkedIn Post | `social/linkedin-post/**/*.md` | ✅（未来扩展） |
| Performance Data | `analytics/*.md` | ⚠️ 需单独索引 |
| Brand Assets | `public/social/*` | ❌ 不可检索 |

---

## 五、baoyu-skills 适配方案

### 5.1 安装状态

| Skill | 期望用途 | 当前状态 | 安装命令 |
|-------|---------|---------|---------|
| baoyu-post-to-x | X/Twitter 发布 | ❌ 未安装 | `npx skills add jimliu/baoyu-skills@baoyu-post-to-x` |
| baoyu-post-to-wechat | 微信公众号发布 | ❌ 未安装 | `npx skills add jimliu/baoyu-skills@baoyu-post-to-wechat` |
| baoyu-article-illustrator | 配图生成 | ❌ 未安装 | `npx skills add jimliu/baoyu-skills@baoyu-article-illustrator` |

**安装到全局**（推荐，与 wag-seo-blog 同级）:
```bash
npx skills add jimliu/baoyu-skills@baoyu-post-to-x -g -y
npx skills add jimliu/baoyu-skills@baoyu-post-to-wechat -g -y
npx skills add jimliu/baoyu-skills@baoyu-article-illustrator -g -y
```

### 5.2 baoyu-post-to-x 适配层

baoyu-post-to-x 是**发布执行层**（Browser CDP），不是内容生成层。它需要 WAG 格式的内容输入。

**WAG X-Post 适配架构**:
```
wag-content-hub (内容生成)
    │
    ▼ 输出标准格式
wag-x-post skill (WAG 品牌化包装)
    │
    ▼ 转换为 baoyu 期望的格式
baoyu-post-to-x (执行发布)
```

**适配要点**:
1. **字数限制**: X/Twitter 普通账号 280 字符，Premium 1万字符。WAG X-post skill 需先截断/精简 LinkedIn 内容。
2. **hashtag 格式**: Twitter 用 `#` 前缀（LinkedIn 也用，但 X 更依赖标签发现）
3. **媒体策略**: LinkedIn 帖子通常不带图，X 帖子带图效果更好（调用 baoyu-article-illustrator）
4. **CTA 差异**: LinkedIn CTA 是评论引导，X CTA 是转发/点击链接

**X-Post 与 LinkedIn Post 的内容转换**:
| LinkedIn 元素 | X 适配 |
|--------------|--------|
| Hook (210字) | 保留，截断到 280 字符 |
| 3步框架 | 压缩为 1-2 关键点 + 链接 |
| CTA (评论问题) | 改为 "RT if you agree" 或短问题 |
| Hashtags (6-10个) | 保留核心标签，X 算法更依赖标签 |
| 第一条评论 | X 无等价机制，改为帖子内链接 |

### 5.3 baoyu-post-to-wechat 适配层

微信公众号与 SEO Blog 是最接近的内容形式（都是长文），但存在关键差异：

| 维度 | SEO Blog MDX | 微信公众号 |
|------|--------------|-----------|
| 链接格式 | `/resources/slug` | 外部链接需转为文末引用 |
| 图片路径 | `/social/...` | 需上传到微信素材库 |
| 格式 | MDX | HTML（需转换） |
| CTA | 底部按钮 | 文末超链接 |

**适配要点**:
1. **MDX → HTML 转换**: baoyu-post-to-wechat 的 `md-to-wechat.ts` 已实现
2. **内部链接处理**: `wag-seo-blog` 的 `/resources/slug` 格式在微信中应转为文末引用（baoyu 支持 `--cite` 模式）
3. **封面图**: 需单独指定，baoyu 支持 frontmatter `coverImage`

### 5.4 baoyu-article-illustrator 集成

`baoyu-article-illustrator` 是纯执行层（调用 AI 图片生成），需要上游 skill 提供文章内容和配图位置。

**集成流程**:
```
wag-content-hub → 生成内容 → 识别配图位置 →
  → 生成 outline.md → baoyu-article-illustrator 处理 →
  → 输出图像 → 插回内容
```

**问题**: baoyu-article-illustrator 的工作流非常复杂（6步，含 first-time-setup、EXTEND.md、preset 确认等），与 WAG 的"快速生成"理念有冲突。

**建议**: 初期阶段，baoyu-article-illustrator 作为**可选手动步骤**，不纳入自动化流程。后续按需集成。

---

## 六、关键发现与风险

### 6.1 架构问题

**问题 #1 — 技能位置割裂**
`wag-linkedin-post` 和 `wag-seo-blog` 不在同一目录树下，SKILL.md 引用相对路径会失效。

**解决方案**: 统一迁移到 `wag-content-hub/skills/` 子目录。

**问题 #2 — 无统一的 skill 调用协议**
当前各 skill 独立运作，"下一个 skill" 仅通过文字描述告知用户，而非通过结构化协议传递数据。

**问题 #3 — baoyu skills 未安装**
baoyu-skills 在 progress 文档中被引用，但实际未安装到本地。所有 baoyu 相关的"复用"实际上是**适配层复用**（包装而非调用）。

### 6.2 快速启动路径

基于以上分析，最优实施路径：

```
Phase 1（立即可做，零依赖）:
1. 提取 RAG 协议到共享文件
2. 提取品牌规则到 lib/brand-rules.md
3. 安装 baoyu-post-to-x 和 baoyu-post-to-wechat

Phase 2（创建 wag-content-hub 后）:
4. 将 wag-linkedin-post 和 wag-seo-blog 迁移到统一目录
5. 创建 wag-x-post 和 wag-facebook-post skill
6. 实现跨 skill 内容转换流程

Phase 3（可选，复杂度高）:
7. 集成 baoyu-article-illustrator
8. 实现自动化发布流程
```

---

## 七、检验问题

**Q1: 为什么 `wag-linkedin-post` 的 RAG 能做到零依赖但有效？Naive RAG 的适用边界在哪里？**

A1: 朴素 RAG 有效的前提是内容库规模小（<50篇）+ 关键词匹配度高。WAG 的 `content/blog/` 目录目前规模有限，每篇博客有明确的主题标签（frontmatter tags），使得 Glob+Grep 的简单匹配召回率足够高。
适用边界：内容库 >100 篇时，朴素 RAG 的噪声召回会显著上升；主题模糊时（如"数字化转型"），关键词匹配容易遗漏相关内容。此时需要升级到摘要 RAG 或向量 RAG。

**Q2: baoyu skills 的 `metadata.openclaw` 格式与 wag skills 的纯 YAML frontmatter 格式能否兼容？哪个格式更优？**

A2: 两者在 `name` 和 `description` 字段完全兼容，可互相读取。差异在于 baoyu 格式多了 `version` 和 `metadata.openclaw` 元数据——这些是 baoyu/openclaw 框架的插件系统接口，用于声明依赖（浏览器、bun 运行时等）和技能主页。
对于 wag-content-hub 场景，baoyu 的扩展格式更优，原因：① `version` 字段支持 skill 演进管理；② `metadata.openclaw.requires` 声明运行时依赖，避免执行时才发现缺工具；③ 为未来可能的 skill marketplace 兼容预留字段。建议统一采用 baoyu 格式作为内部标准。

**Q3: "Socratic Q&A 流程"与"直接变量输入"两种交互模式的本质权衡是什么？能否统一？**

A3: Socratic 的本质是**引导式确认**（Guided Confirmation），变量输入是**清单式收集**（Checklist Collection）。前者依赖 LLM 的推理能力来追问和澄清，后者依赖用户的主动性来填写完整表单。
权衡：Socratic 适合话题模糊、用户不知道想要什么内容的场景（LLM 通过追问帮用户聚焦）；变量输入适合话题明确、用户已有清晰需求的场景（如 "写一篇关于 factory verification 的博客"）。
统一方案：设计一个**混合交互层**——先通过 Socratic Q1（"你想聊什么话题？"）确认意图，再用变量输入快速补全 SEO 关键词/CTA等结构化信息。这样两种模式互补而非互斥。
