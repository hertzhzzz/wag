# WAG Content Hub — 四渠道内容分发协调层架构分析

**文档编号**: analysis-02
**创建时间**: 2026-04-01
**状态**: 设计分析稿，待实现
**依赖**: wag-linkedin-post (v1), wag-seo-blog (v1), wag-content-engine-v3-progress

---

## 1. 四渠道分发的流程设计

### 1.1 整体架构：双层内容模型

现有方案（如 content-engine/crosspost）的核心缺陷是**把适配当分发** — 把同一份内容做微调后发到各平台。这在 WAG 场景下会产生两个严重问题：

1. **LinkedIn/X/Facebook 的受众期待不同的叙事框架** — LinkedIn 读者要"可操作的框架"，X 读者要"一个刺穿共识的洞察"，Facebook 读者要"真实故事+情感共鸣"，SEO 读者要"信息密集+关键词覆盖"
2. **跨平台一致性不等于内容相同** — 一致的应该是"核心观点 + 品牌立场 + 数据引用"，而不是"措辞和结构"

因此本架构采用**双层内容模型**：

```
第一层：原子内容层（Central Content / 核心内容）
  └── 主题、核心观点、关键数据点、真实案例、WAG立场、CTA方向

第二层：渠道适配层（Channel Adapter）
  └── 各平台独特的叙事结构、格式规范、受众期待
```

### 1.2 完整分发流程图（ASCII）

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         WAG Content Hub — 四渠道分发流程                      │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────┐
  │ 用户输入   │  ← 原始话题 / 客户痛点 / 行业数据 / 竞品动态
  └────┬─────┘
       │
       ▼
  ┌─────────────────────────────────────────────────────────────┐
  │              PHASE 1: 话题澄清（Socratic 引导）              │
  │  ┌─────────────────────────────────────────────────────┐  │
  │  │  Q1: 目标读者面临什么采购挑战？                         │  │
  │  │  Q2: 适合什么结构？步骤/案例/误区？                     │  │
  │  │  Q3: 有无真实案例？                                    │  │
  │  │  Q4: 期望读者做什么？                                  │  │
  │  │  Q5: 公司主页还是个人账号？                            │  │
  │  └─────────────────────────────────────────────────────┘  │
  └──────────────────────────┬──────────────────────────────────┘
                              │
                              ▼
  ┌─────────────────────────────────────────────────────────────┐
  │              PHASE 2: 核心内容生产（Central Content）         │
  │  ┌─────────────────────────────────────────────────────┐  │
  │  │  RAG 检索 ──► 提取 WAG 相关洞察 + 统计数据             │  │
  │  │       │                                               │  │
  │  │       ▼                                               │  │
  │  │  原子观点 × N ──► 核心观点 ──► 关键数据点 ──► 真实案例   │  │
  │  │       │                                               │  │
  │  │       ▼                                               │  │
  │  │  写入 CentralContent 对象（统一数据结构）              │  │
  │  └─────────────────────────────────────────────────────┘  │
  └──────────────────────────┬──────────────────────────────────┘
                              │
           ┌──────────────────┼──────────────────┐
           │                  │                  │
           ▼                  ▼                  ▼
  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
  │   SEO Blog      │ │  LinkedIn Post  │ │   X Post        │
  │   Adapter       │ │   Adapter       │ │   Adapter       │
  └────────┬────────┘ └────────┬────────┘ └────────┬────────┘
           │                    │                    │
           ▼                    ▼                    ▼
  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
  │  3000+ 字深度文章  │ │  3步框架/Hook    │ │  单洞察+CTA     │
  │  H2/H3 结构       │ │  210字符内Hook   │ │  280字符限制    │
  │  关键词密度优化    │ │  ER优化 CTA     │ │  互动触发问题   │
  │  E-E-A-T 信号     │ │  6-10 Hashtag   │ │  0-2 Hashtag    │
  └────────┬────────┘ └────────┬────────┘ └────────┬────────┘
           │                    │                    │
           │          ┌─────────┴─────────┐          │
           │          │                   │          │
           │          ▼                   ▼          │
           │   ┌─────────────────┐ ┌─────────────────┐
           │   │   个人账号版     │ │   公司主页版     │
           │   │   (I / 561%↑)   │ │   (We / 品牌)   │
           │   └─────────────────┘ └─────────────────┘
           │          │                   │
           │          └─────────┬─────────┘
           │                    │
           ▼                    ▼
  ┌─────────────────┐   ┌─────────────────┐
  │ Facebook Post   │   │  配图生成        │
  │ Adapter         │   │  baoyu-article-  │
  └────────┬────────┘   │  illustrator    │
           │              └────────┬────────┘
           ▼                       │
  ┌─────────────────┐              │
  │  故事型叙述      │◄─────────────┘
  │  真实场景描述     │   复用同一
  │  软性CTA        │   核心内容
  └────────┬────────┘
           │
           ▼
  ┌─────────────────────────────────────────────────────────────┐
  │              PHASE 3: 质量门禁（Quality Gate）                │
  │  ┌─────────────────────────────────────────────────────┐   │
  │  │  • 每渠道内容 ≠ 其他渠道内容（平台原生性验证）            │   │
  │  │  • WAG 品牌立场一致性（数据点 / 价值观 / 语气）           │   │
  │  │  • 事实核查（RAG 数据 或 MiniMax 搜索）                  │   │
  │  │  • CTA 有效性检查（避免 0 评论陷阱）                    │   │
  │  │  • 格式规范检查（Hook 长度 / Hashtag 数量 / 链接）       │   │
  │  └─────────────────────────────────────────────────────┘   │
  └──────────────────────────┬──────────────────────────────────┘
                              │
                              ▼
  ┌─────────────────────────────────────────────────────────────┐
  │              PHASE 4: 发布编排（Publish Orchestration）        │
  │  ┌─────────────────────────────────────────────────────┐   │
  │  │  发布顺序：LinkedIn → X → Facebook → SEO Blog        │   │
  │  │  时间间隔：各平台间隔 30-60 分钟                        │   │
  │  │  LinkedIn 首评播种（Post 后的第一评论）                  │   │
  │  │  X 线程化（如需多帖）                                   │   │
  │  │  Facebook 软性引导（链接回 LinkedIn 帖子）              │   │
  │  │  SEO Blog 发布（无时间约束，可次日）                    │   │
  │  └─────────────────────────────────────────────────────┘   │
  └──────────────────────────┬──────────────────────────────────┘
                              │
                              ▼
  ┌─────────────────────────────────────────────────────────────┐
  │              PHASE 5: 数据收集 → 自进化闭环                    │
  │  ┌─────────────────────────────────────────────────────┐   │
  │  │  LinkedIn: ER / CTR / 评论数 / 转发数 / 曝光          │   │
  │  │  X: 曝光 / 互动 / 点击 / 转发                         │   │
  │  │  Facebook: 曝光 / 互动 / 分享 / 评论                   │   │
  │  │  SEO/GSC: 排名 / 点击量 / 曝光 / CTR                 │   │
  │  │  ──► 更新 performance-rules.md                       │   │
  │  │  ──► 识别最优话题类型 / 格式 / 发布时间                │   │
  │  └─────────────────────────────────────────────────────┘   │
  └─────────────────────────────────────────────────────────────┘
```

### 1.3 渠道调用顺序设计

| 顺序 | 渠道 | 理由 |
|------|------|------|
| 1 | **LinkedIn** | 数据最丰富（ impressions / clicks / ER / comments），是内容质量的 Primary Ground Truth。LinkedIn 算法最严格，失败信号最清晰 |
| 2 | **X** | 传播速度快（2小时内见分晓），与 LinkedIn 受众重叠度低，提供增量触达。字数限制强制内容极度精炼，验证核心观点是否够锐利 |
| 3 | **Facebook** | WAG 的 Facebook 受众文化背景更多元（澳洲华人社区 + 多元文化商业社群），内容需要更软的叙事。可复用 LinkedIn 的真实案例，换叙事框架 |
| 4 | **SEO Blog** | 信息密度最高、内容最完整。复用前3个渠道验证过的核心观点（降低 SEO 内容市场验证成本），同时补充长尾关键词 |

**关键原则**：四渠道**不是同时发布**，而是按"验证速度"依次发布 — 前面渠道的数据反馈用于判断后续渠道是否值得发布/如何调整。

---

## 2. 核心内容（Central Content）的数据结构设计

### 2.1 CentralContent 对象

```typescript
interface CentralContent {
  // 元信息
  id: string;                    // UUID，贯穿四渠道的同一标识
  createdAt: string;             // ISO 8601
  source: 'socratic' | 'topic' | 'data' | 'case';

  // 话题澄清（Socratic 5问的结果）
  topic: {
    targetChallenge: string;     // Q1: 读者面临什么采购挑战
    structure: 'steps' | 'case-study' | 'myth-busting';
    warStory: string | null;     // Q3: 真实案例（null = 使用通用场景）
    desiredAction: string;        // Q4: 读者读完应做什么
    publishAs: 'personal' | 'company'; // Q5
  };

  // 核心原子内容（RAG 检索后填充）
  atoms: Atom[];

  // WAG 一致性锚点（所有渠道必须复用）
  anchors: ContentAnchors;

  // 各渠道适配后的输出
  adaptations: {
    linkedin?: LinkedInPost;
    x?: XPost;
    facebook?: FacebookPost;
    seo?: SEOBlogPost;
  };

  // 发布状态
  publishing: {
    linkedin?: PublishRecord;
    x?: PublishRecord;
    facebook?: PublishRecord;
    seo?: PublishRecord;
  };

  // 性能数据（收集后填充）
  performance?: {
    linkedin?: LinkedInMetrics;
    x?: XMetrics;
    facebook?: FacebookMetrics;
    seo?: SEOMetrics;
  };
}

interface Atom {
  id: string;
  type: 'core-claim' | 'data-point' | 'case-detail' | 'tool-reference' | 'warning';
  content: string;               // 原始内容
  source: string;                 // 来源（blog文件名或"manual"）
  verificationStatus: 'verified' | 'unverified' | 'claimed';
  adaptationNotes?: string;       // 各渠道如何使用的备注
}

interface ContentAnchors {
  wagPosition: string;           // WAG 的核心立场（一句话）
  verifiedDataPoints: Array<{
    claim: string;
    source: string;
    url?: string;
  }>;
  keyInsight: string;             // 读者最该记住的一个点
  ctaDirection: string;          // CTA 的方向（不是具体文案）
  brandVoice: {
    tone: 'professional-guide' | 'expert-peer' | 'storyteller';
    pronouns: 'we' | 'i' | 'we-i-mix';
    emojiFree: boolean;          // WAG 始终无 emoji
  };
}

interface PublishRecord {
  publishedAt: string;
  url?: string;
  firstComment?: string;         // LinkedIn 首评内容
  account: 'personal' | 'company';
}

interface LinkedInMetrics {
  impressions: number;
  clicks: number;
  reactions: number;
  comments: number;
  reposts: number;
  er: number;                    // (reactions + comments + reposts) / impressions
  commentRate: number;           // comments / impressions
}

interface XMetrics {
  impressions: number;
  engagements: number;
  profileClicks: number;
  retweets: number;
  replies: number;
  er: number;
}

interface FacebookMetrics {
  impressions: number;
  engagements: number;
  shares: number;
  comments: number;
  er: number;
}

interface SEOMetrics {
  impressions: number;           // GSC
  clicks: number;                // GSC
  ctr: number;                   // GSC
  avgPosition: number;           // GSC
  topQueries: string[];
}
```

### 2.2 各渠道 Adapter 的输出结构

```typescript
interface LinkedInPost {
  contentId: string;             // CentralContent.id
  hook: string;                  // ≤210 字符
  structure: 'steps' | 'carousel' | 'story-framework';
  body: LinkedInBodySection[];
  cta: {
    question: string;            // 经验型问题（避免 0 评论陷阱）
    firstComment: string;        // 发布后立即播种用
  };
  hashtags: string[];            // 6-10 个
  account: 'personal' | 'company';
  template: 'A' | 'B' | 'C';     // A=Steps, B=Carousel, C=Story
  ragReferences: string[];       // 引用的 blog 文件列表
}

interface LinkedInBodySection {
  type: 'step' | 'paragraph' | 'break';
  content?: string;
  stepNumber?: number;
  stepTitle?: string;
}

interface XPost {
  contentId: string;
  primaryTweet: string;          // ≤280 字符
  thread?: string[];             // 线程模式下的后续推文
  hashtags: string[];            // 0-2 个（越少越好）
  cta: string;                   // 单洞察后的互动问题
  mediaSuggestion?: string;     // 配图建议
}

interface FacebookPost {
  contentId: string;
  narrative: string;             // 故事型叙述，更软的叙事
  coreInsight: string;           // 核心洞察（独立一行，高亮）
  softCta: string;               // 软性引导（不强制）
  mediaSuggestion?: string;
  crossReference?: {
    platform: 'linkedin';
    url?: string;               // 可选，引导读者去 LinkedIn 看详细版
  };
}

interface SEOBlogPost {
  contentId: string;
  slug: string;
  title: string;
  metaDescription: string;        // ≤160 字符
  body: SEOBlogSection[];
  targetKeywords: string[];
  readTime: number;               // 分钟
  coverImage: string;
  linkedinPostId?: string;       // 可选，关联原始 LinkedIn 帖子
  ragReferences: string[];
  frontmatter: SEOMDXFrontmatter;
}

interface SEOBlogSection {
  heading: string;               // H2 / H3
  content: string;                // Markdown 内容
  keywords: string[];            // 本节目标关键词
  internalLinks?: string[];      // 链接到其他 blog 帖子的 slug
}
```

---

## 3. 各渠道适配器的职责定义

### 3.1 Adapter 职责矩阵

| 职责 | LinkedIn Adapter | X Adapter | Facebook Adapter | SEO Adapter |
|------|-----------------|-----------|------------------|-------------|
| **输入**：CentralContent | ✓ | ✓ | ✓ | ✓ |
| **RAG 检索填充** | ✓（核心渠道） | — | — | ✓ |
| **叙事结构选择** | Template A/B/C | Thread/Single | Narrative | H2/H3 |
| **Hook/标题优化** | ≤210字符 Hook | ≤280字符洞察 | 故事钩子 | SEO 标题 + meta |
| **格式规范执行** | 无 emoji / Hashtag | 无 emoji / 极少 Tag | 无 emoji / 软性 | Markdown |
| **CTA 设计** | 经验型问题（防0评论） | 互动触发 | 软性引导 | 行动按钮 |
| **数据验证** | 核查数据点 | 简化数据点 | 故事化数据点 | 详细引用 |
| **配图协调** | 指示配图需求 | 指示配图需求 | 可选 | coverImage |
| **发布后首评播种** | ✓ | — | — | — |
| **输出到 CentralContent** | ✓ | ✓ | ✓ | ✓ |

### 3.2 各 Adapter 的核心职责详解

#### LinkedIn Adapter（最重要渠道）

```
职责：
1. 决定使用哪个模板（Steps > Story+Framework > Carousel > Text）
   — 数据来源：wag-linkedin-post v1 的 ER 数据（33% ER > 7% ER）
2. 强制执行 Hook ≤210 字符规则（LinkedIn 算法截断点）
3. 从 CentralContent.atoms 中提取 3 个最强的步骤/观点
4. CTA 必须替换为"经验型问题"，彻底避免 "What would you do differently?"
5. 发布后立即播种 firstComment（算法boost窗口：60分钟内）
6. 对齐 RAG 检索到的 WAG 真实数据和案例

不负责：
- X/Facebook/SEO 的具体措辞
- 配图生成（调用 baoyu-article-illustrator）
- 发布操作（提供内容 + 首评文案，由用户执行）
```

#### X Adapter

```
职责：
1. 将核心洞察压缩到 ≤280 字符（强制提炼）
2. 选择：单帖模式 vs 线程模式
   — 线程模式：3-5 帖，每帖一个原子观点
3. 0-2 个 Hashtag（X 2026 算法对 hashtag 多的帖子降权）
4. 开头必须有 Hook，不能是总结（"Here's what happened" 开头 = 低互动）
5. 可引用 LinkedIn 帖（"Full breakdown on LinkedIn"）
6. 互动问题作为结尾（不同于 LinkedIn 的长问题，更短、更锐利）

不负责：
- LinkedIn/Facebook 的内容
- RAG 检索（X 限制决定内容必须极度精炼，来源不关键）
```

#### Facebook Adapter

```
职责：
1. 叙事框架优先于结构框架（讲故事 > 列步骤）
2. 核心洞察单独成段（Facebook 算法对高亮文本权重更高）
3. 软性 CTA（"如果你也有类似经历，欢迎分享"）
4. 可选：引用 LinkedIn 帖子作为"详细版本"
5. 配图可选（建议场景图而非信息图）

不负责：
- 专业框架输出（这不是 Facebook 受众的主要期待）
- SEO 优化
```

#### SEO Adapter

```
职责：
1. 以 LinkedIn Adapter 验证过的核心观点为锚点
2. 扩展为 1500-3000 字的长文（H2/H3 结构）
3. 关键词策略：
   — 1 个主关键词（URL slug）
   — 3-5 个 LSI 关键词（自然分布在 H2和小节中）
   — 0.5-2% 关键词密度
4. E-E-A-T 信号注入：
   — Experience：WAG 真实案例
   — Expertise：具体工具名称（gsxt.gov.cn 等）
   — Authoritativeness：数据引用 + 来源
   — Trustworthiness：WAG 立场 + 透明定价承诺
5. 内部链接：链接到其他相关 blog 帖子
6. MDX frontmatter 完整填充
7. 配图：coverImage 路径规范化

不负责：
- 追求 LinkedIn 式的 ER
- 社交媒体格式规范
```

---

## 4. 一致性保证策略

### 4.1 三层一致性模型

```
┌─────────────────────────────────────────────────────────────┐
│                    一致性保证：三明治模型                      │
├─────────────────────────────────────────────────────────────┤
│  顶层：品牌层（Brand Anchors）                                │
│  └── 所有渠道共享，不允许任何适配修改                          │
│      • WAG 的核心价值主张（"直接与工厂签约，你是主导者"）        │
│      • 品牌语调（专业但不销售驱动，WAG 是向导而非中间商）        │
│      • 无 emoji 规则（所有渠道）                              │
├─────────────────────────────────────────────────────────────┤
│  中层：观点层（Atom Consistency）                            │
│  └── 核心数据点必须一致引用，但表达深度可调节                   │
│      • 同一个数据（85% SMB用Alibaba），LinkedIn 提、X 提、     │
│        Facebook 提、SEO 详细写，但数字必须一致                 │
│      • 真实案例可以换叙事视角，但关键事实（金额/时间/后果）不变  │
├─────────────────────────────────────────────────────────────┤
│  底层：格式层（Format Native）                               │
│  └── 各渠道自由发挥，不追求一致                               │
│      • LinkedIn 3步框架 vs X 单洞察 vs Facebook 故事叙述      │
│      • CTA 形式不同（LinkedIn 经验型问题 vs X 互动触发）       │
│      • 发布节奏不同（LinkedIn 最先，SEO 最后）                 │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 一致性执行机制

#### 4.2.1 原子观点共享（Atom Sharing）

CentralContent.atoms 是四渠道的**唯一事实来源**：

```
CentralContent.atoms[0] = {
  id: "atom-001",
  type: "data-point",
  content: "85% of Australian SMBs use Alibaba.com to find suppliers",
  source: "wag-linkedin-post/SKILL.md",
  verificationStatus: "verified",
}
       │
       ├──► LinkedIn Adapter: "85% of Australian SMBs use Alibaba..."
       ├──► X Adapter:          "3 in 4 Aussie SMBs start supplier
       │                         search on Alibaba" (同义压缩)
       ├──► Facebook Adapter:   "When most Aussie brands look for
       │                         suppliers, they start here..."
       └──► SEO Adapter:        "According to industry data, 85% of
                                Australian SMBs use Alibaba.com..."
                                [来源脚注]
```

**规则**：同一 Atom 在四渠道的出现**必须满足**：
- 数字一致（85% 不能变成 80%）
- 方向一致（"供应商搜索起点"不能变成"最佳平台"）
- 引用来源一致（SEO 详细注明来源，X 简化表达）

#### 4.2.2 WAG 立场锚（WAG Position Anchor）

每个 CentralContent 包含一个 `anchors.wagPosition` 字段，这是 WAG 品牌立场的最高层表达，四渠道**一字不改**地复用：

```
anchors.wagPosition = "我们不是中间商。我们帮你直接联系工厂，
                       你自己决定、自己签约——风险你掌控，
                       关系你拥有。"
       │
       ├──► LinkedIn: 作为 Post 的最后一段（或第三步的隐含逻辑）
       ├──► X:        "We're not the middleman — we help you
       │              sign directly with factories."
       ├──► Facebook: 故事叙述中隐含（"客户X来到工厂，签下合同"）
       └──► SEO:      出现在 Conclusion 段落
```

#### 4.2.3 事实核查表（Fact Check Gate）

在 Phase 3 质量门禁中，每个 Atom 的 `verificationStatus` 必须为 `verified` 或有明确免责。MiniMax 搜索用于验证新引入的数据点。

```
质量门禁检查项：
[ ] 所有 atoms.verificationStatus = 'verified'
[ ] 新数据点已通过 MiniMax 搜索验证
[ ] wagPosition 在所有4个渠道中都正确体现
[ ] 没有渠道引入与其他渠道矛盾的表述
[ ] 没有渠道删除了关键的警告性信息（WAG 的差异化优势）
```

#### 4.2.4 跨渠道引用机制

```
Cross-Reference Rules:
1. LinkedIn → SEO:  LinkedIn Post 可以引用 "完整分析见 [SEO Blog URL]"
2. X → LinkedIn:   X 可以引用 "详细步骤见 LinkedIn"
3. Facebook → LinkedIn: Facebook 可以引用 "以下是完整版本"
4. SEO → LinkedIn: SEO Blog 不引用社交帖（SEO 需要独立存在）

注意：SEO 是唯一"独立存在"的渠道，其他三者是相互引用的流量分发节点。
```

---

## 5. 输出格式标准化

### 5.1 统一输出结构（JSON Schema 简化版）

每个渠道适配后的输出必须包含：

```json
{
  "contentId": "cc-2026-04-01-factory-verification",
  "channel": "linkedin | x | facebook | seo",
  "status": "draft | approved | published",
  "atoms": ["atom-001", "atom-003", "atom-005"],
  "wagPositionIncluded": true,
  "hookOrTitle": "...",
  "characterCount": 1200,
  "ctaType": "experience-question | engagement-trigger | soft-cta",
  "ctaContent": "...",
  "hashtags": ["#ChinaSourcing", ...],
  "ragReferences": ["content/blog/xxx.mdx"],
  "factCheckStatus": "passed | failed",
  "factCheckNotes": "...",
  "createdBy": "wag-content-hub",
  "createdAt": "2026-04-01T..."
}
```

### 5.2 文件命名规范

```
CentralContent（存储在 wag-content-hub/content/ 下）:
  content/{YYYY-MM}-{content-id}/central.json

LinkedIn Post（存储在 social/linkedin-post/ 下）:
  social/linkedin-post/{YYYY-MM-DD-topic}/post.md

X Post（存储在 social/x-post/ 下）:
  social/x-post/{YYYY-MM-DD-topic}/thread.md

Facebook Post（存储在 social/facebook-post/ 下）:
  social/facebook-post/{YYYY-MM-DD-topic}/post.md

SEO Blog（存储在 content/blog/ 下）:
  content/blog/{slug}.mdx
```

---

## 6. 关键设计决策记录

| 决策 | 选择 | 备选方案 | 决策理由 |
|------|------|---------|---------|
| 内容复用层级 | Atom 共享（数据点级） | 全文复用 | 避免平台原生性问题；X/Facebook/LinkedIn 受众期待差异太大 |
| 发布顺序 | LinkedIn → X → Facebook → SEO | 同时发布 | 按数据反馈速度排序；SEO 无时效性约束 |
| SEO 定位 | 第四渠道（验证后的深度扩展） | 独立渠道 | 降低 SEO 内容的市场验证成本，复用已验证观点 |
| LinkedIn 重要性 | 最高（Primary Ground Truth） | 四渠道平等 | LinkedIn 数据最丰富，ER/CTR/Comments 三个指标齐全 |
| Facebook 定位 | 第三渠道（软性叙事 + 流量中转） | 独立渠道 | Facebook 互动数据质量较低，ROI 难量化 |
| X 线程策略 | 可选（视内容复杂度决定） | 强制线程 | X 单帖互动率往往高于线程；从简到繁 |

---

## 7. 待验证假设

以下假设在实现前需要数据验证：

1. **LinkedIn 作为 Primary Ground Truth** — 如果 LinkedIn ER 高但转化率低，这个假设需要修正
2. **Atom 数字一致性不会限制 X/Facebook 的表达** — 如果"85%"在 Facebook 上需要换成"Most"，则需要扩大 Atom 的定义范围
3. **Facebook 引用 LinkedIn 不会产生"读者流失"** — 需要测试跨平台引导 vs 独立内容的 ROI
4. **SEO Blog 作为第四渠道的顺序合理** — 如果 SEO 带来的咨询转化率高于 LinkedIn，应优先发布

---

## 8. 下一步

- [ ] Task #4 完成后，验证 LinkedIn/SEO Skill 的复用方案
- [ ] Task #5/10 完成后，完善 X/Facebook Adapter 的具体模板
- [ ] Task #8 完成后，验证数据收集机制对一致性的反馈闭环
- [ ] 建议创建 `wag-content-hub/SKILL.md` 作为主入口 Skill，整合以上架构
