# WAG Content Hub — 分析报告 #3
## 性能数据收集与 RAG 上下文注入机制

**创建时间**: 2026-04-01
**分析师**: Data Architect Agent
**状态**: 设计完成，待实现

---

## 目录

1. [数据流图](#1-数据流图)
2. [关键数据结构](#2-关键数据结构-json-schema)
3. [RAG 上下文注入策略](#3-rag-上下文注入策略)
4. [性能规则更新算法](#4-性能规则更新算法)
5. [GSC API 与社交平台数据融合](#5-gsc-api-与社交平台数据融合)
6. [实施优先级](#6-实施优先级)

---

## 1. 数据流图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        WAG CONTENT ENGINE — 数据闭环                          │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │  LinkedIn    │     │      X       │     │  Facebook    │     │    GSC/SEO   │
  │  Analytics   │     │  Analytics   │     │   Insights   │     │   Search API  │
  └──────┬───────┘     └──────┬───────┘     └──────┬───────┘     └──────┬───────┘
         │                     │                     │                     │
         ▼                     ▼                     ▼                     ▼
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                     统一数据收集层 (Analytics Collector)                     │
  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐             │
  │  │ linkedin   │ │  x-collect │ │ fb-collect │ │ gsc-query  │             │
  │  │ collector  │ │             │ │            │ │            │             │
  │  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └─────┬──────┘             │
  │        └──────────────┴──────────────┴──────────────┘                   │
  │                                │                                          │
  │                                ▼                                          │
  │                    ┌────────────────────┐                                 │
  │                    │  Raw Metrics JSON │                                 │
  │                    └─────────┬──────────┘                                 │
  └─────────────────────────────────┼─────────────────────────────────────────┘
                                  │
                                  ▼
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                        数据归一化层 (Normalizer)                            │
  │  • 日期统一 (UTC+10 AEST)                                                  │
  │  • 指标归一化 (Impressions→曝光数, ER = 互动/曝光)                          │
  │  • 来源标注 (organic/sponsored)                                            │
  │                                │                                          │
  │                                ▼                                          │
  │                    ┌────────────────────┐                                 │
  │                    │ NormalizedMetrics  │                                 │
  │                    │    (日聚合数据)      │                                 │
  │                    └─────────┬──────────┘                                 │
  └─────────────────────────────────┼─────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
  ┌──────────────────────────┐   ┌──────────────────────────┐
  │    SQLite/JSON 存储       │   │   向量数据库 (Qdrant)     │
  │  (structured metrics)    │   │  (semantic search)      │
  │                           │   │                          │
  │  analytics/               │   │  collections:            │
  │  ├── daily-metrics/       │   │  ├── content_vectors     │
  │  ├── content-posts/       │   │  ├── rules_vectors        │
  │  └── best-posts/          │   │  └── insights_vectors    │
  └─────────────┬──────────────┘   └─────────────┬──────────────┘
                │                                │
                │    ┌───────────────────────────┘
                │    │
                ▼    ▼
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                    自进化引擎 (Self-Evolution Engine)                         │
  │                                                                            │
  │   ┌─────────────────┐    ┌──────────────────┐    ┌────────────────────┐   │
  │   │  规则计算器      │───▶│  PerformanceRules │───▶│  规则驱动生成       │   │
  │   │  (每日批量)      │    │  (performance-    │    │  (context-aware    │   │
  │   │                 │    │   rules.md)        │    │   generation)      │   │
  │   └─────────────────┘    └──────────────────┘    └────────────────────┘   │
  │           │                                                            │   │
  │           │  周冠军帖子                                                 │   │
  │           │  Weekly Best Post                                         │   │
  │           ▼                                                            │   │
  │   ┌─────────────────┐                                                 │   │
  │   │  向量嵌入更新    │                                                 │   │
  │   │  (重新计算Top-K) │                                                 │   │
  │   └─────────────────┘                                                 │   │
  └─────────────────────────────────────────────────────────────────────────────┘
                │
                ▼
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                        RAG 上下文注入层                                      │
  │                                                                            │
  │   Generation Request ──▶ RAG Retriever ──▶ Context Assembler ──▶ LLM     │
  │                                                                            │
  │   RAG Retriever 查询:                                                     │
  │   • content_vectors   ──▶  最相似历史帖子 (Top-3)                          │
  │   • rules_vectors     ──▶  当前适用规则 (platform + topic)               │
  │   • insights_vectors  ──▶  近期洞察 (last 7d trends)                     │
  │                                                                            │
  │   Context Assembler 组合:                                                 │
  │   [System Prompt] + [昨日性能摘要] + [最佳帖子示例] + [适用规则] + [用户Query]│
  └─────────────────────────────────────────────────────────────────────────────┘
```

### 每日数据闭环时间线

```
T+0h   发布内容 ──────────────────────────────────────────────────────────▶
   │
T+6h   LinkedIn/X/FB 数据可查 (Chrome CDP / Manual export)
   │
T+12h  GSC 数据就绪 (Search Console API)
   │
T+18h  Analytics Collector 运行 ──▶ 归一化 ──▶ 写入存储
   │
T+20h  Self-Evolution Engine:
        ① 计算日/周/月指标
        ② 更新 PerformanceRules.md
        ③ 重新嵌入 Top-K 帖子向量
        ④ 生成每日报告
   │
T+22h  新规则就绪，次日生成使用更新后上下文
   │
T+24h  下一个发布周期开始 ───────────────────────────────────────────────▶
```

---

## 2. 关键数据结构 (JSON Schema)

### 2.1 ContentPost — 已发布内容记录

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://wag.analytics/content-post/v1",
  "title": "ContentPost",
  "description": "单条已发布内容的完整记录",
  "type": "object",
  "required": ["postId", "platform", "publishedAt", "content"],
  "properties": {
    "postId": {
      "type": "string",
      "pattern": "^[A-Z]{2}-[a-z]+-\\d{8}-[a-z0-9]{8}$",
      "examples": ["LI-post-20260323-a1b2c3d4"],
      "description": "平台-类型-日期-哈希，例: LI=LinkedIn, X=x, FB=Facebook, SE=SEO"
    },
    "platform": {
      "type": "string",
      "enum": ["linkedin", "x", "facebook", "seo"],
      "description": "发布平台"
    },
    "publishedAt": {
      "type": "string",
      "format": "date-time",
      "description": "发布时间 (ISO 8601, AEST = UTC+10)"
    },
    "content": {
      "type": "object",
      "properties": {
        "hook":    { "type": "string", "description": "开头钩子/标题" },
        "body":    { "type": "string", "description": "正文内容" },
        "cta":     { "type": "string", "description": "行动号召" },
        "hashtag": { "type": "array", "items": { "type": "string" } },
        "format": {
          "type": "string",
          "enum": ["3-step-framework", "story-hook", "listicle", "question-prompt", "stat-driven", "case-study"],
          "description": "内容格式分类"
        },
        "topic": {
          "type": "string",
          "description": "话题标签: immigration, tax, business-setup, marketing, general"
        },
        "targetAudience": { "type": "string" }
      }
    },
    "metadata": {
      "type": "object",
      "properties": {
        "generatedBy":   { "type": "string", "description": "skill名: wag-linkedin-post v1.2" },
        "approvedBy":    { "type": "string" },
        "originalBlogSlug": { "type": "string", "description": "SEO来源博客slug (一鱼两吃)" }
      }
    },
    "metrics": {
      "type": "object",
      "description": "性能指标 (由 collector 填充)",
      "properties": {
        "impressions":  { "type": "number" },
        "clicks":        { "type": "number" },
        "ctr":           { "type": "number" },
        "reactions":     { "type": "number" },
        "comments":      { "type": "number" },
        "reposts":       { "type": "number" },
        "engagementRate": { "type": "number" },
        "uniqueImpressions": { "type": "number" },
        "updatedAt":     { "type": "string", "format": "date-time" }
      }
    },
    "_vectorId": {
      "type": "string",
      "description": "Qdrant 中的向量 ID (嵌入后填充)"
    }
  }
}
```

### 2.2 DailyMetrics — 日聚合性能数据

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://wag.analytics/daily-metrics/v1",
  "title": "DailyMetrics",
  "description": "单平台单日聚合性能指标",
  "type": "object",
  "required": ["date", "platform", "metrics"],
  "properties": {
    "date": {
      "type": "string",
      "format": "date",
      "description": "日期 (YYYY-MM-DD, AEST)"
    },
    "platform": {
      "type": "string",
      "enum": ["linkedin", "x", "facebook", "seo"]
    },
    "metrics": {
      "type": "object",
      "properties": {
        "impressions":  { "type": "number" },
        "uniqueImpressions": { "type": "number" },
        "clicks":       { "type": "number" },
        "ctr":          { "type": "number", "minimum": 0, "maximum": 1 },
        "reactions":    { "type": "number" },
        "comments":     { "type": "number" },
        "reposts":      { "type": "number" },
        "engagementRate": { "type": "number", "minimum": 0, "maximum": 1 },
        "postsPublished": { "type": "number" }
      }
    },
    "gscData": {
      "type": "object",
      "description": "SEO/GSC 特有数据 (仅 seo platform)",
      "properties": {
        "totalClicks":      { "type": "number" },
        "totalImpressions": { "type": "number" },
        "avgPosition":      { "type": "number" },
        "topQueries": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "query":    { "type": "string" },
              "clicks":   { "type": "number" },
              "impressions": { "type": "number" },
              "ctr":      { "type": "number" },
              "position": { "type": "number" }
            }
          },
          "maxItems": 10
        }
      }
    },
    "source": {
      "type": "string",
      "enum": ["linkedin_api", "x_fxtwitter", "facebook_insights", "gsc_api", "manual"],
      "description": "数据来源"
    },
    "collectedAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

### 2.3 PerformanceRule — 性能规则

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://wag.analytics/performance-rule/v1",
  "title": "PerformanceRule",
  "description": "从历史数据中提炼的内容生成规则",
  "type": "object",
  "required": ["ruleId", "platform", "metric", "updatedAt"],
  "properties": {
    "ruleId": {
      "type": "string",
      "pattern": "^[a-z]+-[a-z]+-[a-z0-9]+$",
      "examples": ["li-format-story-001", "x-hook-question-003"]
    },
    "platform": {
      "type": "string",
      "enum": ["linkedin", "x", "facebook", "seo", "all"]
    },
    "category": {
      "type": "string",
      "enum": ["format", "hook", "topic", "timing", "length", "cta", "hashtag"]
    },
    "metric": {
      "type": "string",
      "description": "规则关联的核心指标: engagement_rate, ctr, impressions",
      "enum": ["engagement_rate", "ctr", "impressions", "clicks"]
    },
    "condition": {
      "type": "object",
      "description": "规则触发条件",
      "properties": {
        "format":      { "type": "string" },
        "topic":       { "type": "string" },
        "minLength":   { "type": "number" },
        "maxLength":   { "type": "number" },
        "dayOfWeek":   { "type": "array", "items": { "type": "integer", "minimum": 0, "maximum": 6 } },
        "hourRange":   { "type": "array", "items": { "type": "integer" } }
      }
    },
    "value": {
      "type": "object",
      "description": "规则取值或参数",
      "properties": {
        "threshold":   { "type": "number" },
        "optimal":     { "type": "number" },
        "recommendation": { "type": "string" }
      }
    },
    "evidence": {
      "type": "object",
      "description": "支撑规则的历史数据",
      "properties": {
        "supportingPosts": {
          "type": "array",
          "items": { "type": "string" },
          "description": "postId 列表"
        },
        "sampleSize":    { "type": "number" },
        "avgValue":      { "type": "number" },
        "stdDeviation":  { "type": "number" },
        "confidenceLevel": {
          "type": "string",
          "enum": ["low", "medium", "high"],
          "description": "规则置信度 (sampleSize < 5: low, < 15: medium, >= 15: high)"
        }
      }
    },
    "version": {
      "type": "integer",
      "minimum": 1
    },
    "updatedAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

### 2.4 RAGContext — 注入到 LLM 的上下文结构

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://wag.analytics/rag-context/v1",
  "title": "RAGContext",
  "description": "生成时的 RAG 上下文包",
  "type": "object",
  "required": ["generatedAt", "platform", "components"],
  "properties": {
    "generatedAt": {
      "type": "string",
      "format": "date-time"
    },
    "platform": {
      "type": "string",
      "enum": ["linkedin", "x", "facebook", "seo"]
    },
    "lookbackWindow": {
      "type": "string",
      "enum": ["7d", "30d", "90d"],
      "description": "历史数据回溯窗口"
    },
    "components": {
      "type": "object",
      "properties": {
        "yesterdayMetrics": {
          "$ref": "#/definitions/yesterdayMetrics"
        },
        "bestHistoricalPosts": {
          "type": "array",
          "items": { "$ref": "https://wag.analytics/content-post/v1" },
          "maxItems": 3
        },
        "activeRules": {
          "type": "array",
          "items": { "$ref": "https://wag.analytics/performance-rule/v1" }
        },
        "recentTrends": {
          "$ref": "#/definitions/recentTrends"
        },
        "platformNorms": {
          "$ref": "#/definitions/platformNorms"
        }
      }
    }
  },
  "definitions": {
    "yesterdayMetrics": {
      "type": "object",
      "properties": {
        "date":        { "type": "string", "format": "date" },
        "totalImpressions": { "type": "number" },
        "totalEngagement":  { "type": "number" },
        "avgEngagementRate": { "type": "number" },
        "deltaVsWeekAvg": { "type": "number", "description": "环比上周变化百分比" },
        "topPerformingPostId": { "type": "string" }
      }
    },
    "recentTrends": {
      "type": "object",
      "properties": {
        "formatTrend": {
          "type": "object",
          "description": "近7天各格式表现趋势",
          "properties": {
            "improving": { "type": "array", "items": { "type": "string" } },
            "declining": { "type": "array", "items": { "type": "string" } }
          }
        },
        "topicTrend": {
          "type": "object",
          "properties": {
            "improving": { "type": "array", "items": { "type": "string" } },
            "declining": { "type": "array", "items": { "type": "string" } }
          }
        }
      }
    },
    "platformNorms": {
      "type": "object",
      "description": "各平台内容规范",
      "properties": {
        "maxLength":    { "type": "number" },
        "optimalLength": { "type": "number" },
        "emojiAllowed": { "type": "boolean" },
        "hashtagLimit": { "type": "number" },
        "linkPlacement": { "type": "string" },
        "bestPostingHour": { "type": "number" }
      }
    }
  }
}
```

---

## 3. RAG 上下文注入策略

### 3.1 注入架构：Temporal-Weighted Multi-Query RAG

核心问题：如何将"昨日数据"精准注入"今日生成"？

**解决方案：时间加权多查询检索 + 上下文组装器**

```
用户请求: "生成一条关于小企业税务规划的 LinkedIn 帖子"

                        │
                        ▼
              ┌──────────────────┐
              │  Query Expansion  │
              │  (同义话题扩展)    │
              └────────┬─────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
  ┌───────────┐ ┌───────────┐ ┌───────────┐
  │ 内容向量库 │ │ 规则向量库 │ │ 洞察向量库 │
  │ (content_ │ │  (rules_  │ │ (insights_│
  │ vectors)  │ │  vectors) │ │  vectors) │
  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
        │             │             │
        ▼             ▼             ▼
  Top-3 帖子    适用规则      近7天趋势
  (语义相似)   (条件匹配)    (时间衰减)

                        │
                        ▼
              ┌──────────────────┐
              │  Context Assembler │
              │  (按优先级组装)    │
              └────────┬─────────┘
                       │
         ┌─────────────┼─────────────┐
         │ System: 角色设定 + 平台规范  │
         │ Yesterday: 昨日性能摘要     │
         │ BestPosts: Top-3 历史示例  │
         │ Rules:     适用性能规则     │
         │ Trends:    近7天趋势洞察   │
         │ Query:     用户原始请求     │
         └─────────────┼─────────────┘
                       │
                       ▼
                  ┌────────┐
                  │  LLM   │ ──▶ 生成内容
                  └────────┘
```

### 3.2 向量嵌入方案

#### 内容向量 (content_vectors)

```python
# 嵌入字段组合
content_text = f"""
{post.content.hook}
{post.content.body}
话题: {post.content.topic}
格式: {post.content.format}
平台: {post.platform}
""".strip()

embedding = embed_model.encode(content_text, dimension=1536)
```

- **Embedding 模型**: `text-embedding-3-small` (OpenAI) 或 `embed-english-v3.0`
- **Dimension**: 1536 (可压缩至 256 via PCA)
- **Index**: Qdrant (支持 metadata filtering)

#### 规则向量 (rules_vectors)

```python
rule_text = f"""
平台: {rule.platform}
类别: {rule.category}
条件: {json.dumps(rule.condition)}
推荐值: {json.dumps(rule.value)}
置信度: {rule.evidence.confidenceLevel}
""".strip()
```

#### 洞察向量 (insights_vectors)

```python
insight_text = f"""
日期范围: {period}
平台: {platform}
表现趋势: {trend}
关键洞察: {key_insight}
""".strip()
```

### 3.3 时间衰减权重

昨日数据权重最高，指数衰减回溯：

```
weight(t) = base_weight × exp(-λ × days_ago)

其中 λ = 0.07 (半衰期 ≈ 10天)
     base_weight = 1.0

weight(1天前)   = 1.00
weight(7天前)   = 0.61
weight(30天前)  = 0.12
weight(90天前)  = 0.0015
```

### 3.4 上下文组装 Prompt 模板

```markdown
## SYSTEM CONTEXT (固定前缀)

你是一位专业的 LinkedIn 内容营销专家。为 WAG (Winning Adventure Global)
创作商业移民/税务规划领域的高绩效内容。
平台规范: [从 platformNorms 注入]

## YESTERDAY'S PERFORMANCE (昨日数据 — 高权重)

日期: {yesterdayMetrics.date}
总曝光: {yesterdayMetrics.totalImpressions}
总互动: {yesterdayMetrics.totalEngagement}
平均互动率: {yesterdayMetrics.avgEngagementRate}%
环比上周变化: {yesterdayMetrics.deltaVsWeekAvg}% [{↑上升/↓下降/→持平}]
最佳帖子: {yesterdayMetrics.topPerformingPostId}

## TOP-PERFORMING EXAMPLES (历史最佳 — 参考学习)

{#each bestHistoricalPosts as post}
### 示例 {index + 1} (ER: {post.metrics.engagementRate})
Hook: {post.content.hook}
正文: {post.content.body}
格式: {post.content.format} | 话题: {post.content.topic}
{/each}

## ACTIVE RULES (当前适用规则)

{#each activeRules as rule}
- [{rule.category}] {rule.condition} → {rule.value.recommendation}
  (置信度: {rule.evidence.confidenceLevel}, 样本: {rule.evidence.sampleSize})
{/each}

## RECENT TRENDS (近7天趋势)

格式趋势: 上升中 {recentTrends.formatTrend.improving} | 下降中 {recentTrends.formatTrend.declining}
话题趋势: 上升中 {recentTrends.topicTrend.improving} | 下降中 {recentTrends.topicTrend.declining}

## USER REQUEST

{user_query}
```

### 3.5 "昨日数据"注入的关键设计

| 设计决策 | 选择 | 理由 |
|---------|------|------|
| 注入时机 | 生成请求时实时查询 | 不能硬编码，否则规则过期 |
| 数据新鲜度 | T-1 (昨天) | T-0 数据尚未稳定 |
| 回溯窗口 | 7d (日常) / 30d (周分析) | 避免老旧数据干扰 |
| 规则冷启动 | 用已知3条帖子做种子 | 有数据后再扩展 |
| 向量重算频率 | 每日批量 + 实时增量 | 平衡成本与精度 |

---

## 4. 性能规则更新算法

### 4.1 每日批量更新流程

```
每日 20:00 AEST (T+20h) — Self-Evolution Engine 启动

STEP 1: 收集昨日数据
  ├── 读取 daily-metrics/{date}/ 下的所有 JSON
  ├── 读取 content-posts/{date}/ 下的内容记录
  └── 合并，计算 ER = (reactions + comments + reposts) / impressions

STEP 2: 格式/话题分组聚合
  ├── 按 format 分组: 3-step-framework, story-hook, listicle...
  ├── 按 topic 分组: immigration, tax, business-setup...
  └── 计算每组: 平均ER, 样本数, 标准差

STEP 3: 统计显著性检验
  ├── 样本数 < 5 → 置信度 low, 规则暂存不发布
  ├── t-test (新分组 vs 全部历史) → p < 0.05 → 规则升级
  └── 新规则加入 performance-rules.md

STEP 4: 向量重嵌入
  ├── 新帖子 → encode → upsert 到 content_vectors
  ├── 更新的规则 → encode → upsert 到 rules_vectors
  └── 删除超过 90d 的旧向量 (避免存储膨胀)

STEP 5: 生成每日报告
  └── 输出: analytics/daily-report-{date}.md
```

### 4.2 规则更新伪代码

```python
def update_performance_rules(date: str, lookback_days: int = 30):
    # 1. 收集数据
    posts = load_posts_published_between(
        start_date=subtract_days(date, lookback_days),
        end_date=date
    )

    # 2. 按维度和指标分组
    dimensions = ["format", "topic", "platform"]
    metric = "engagement_rate"

    for dim in dimensions:
        groups = group_by(posts, dim)

        for group_name, group_posts in groups:
            avg_er = mean([p.metrics.engagementRate for p in group_posts])
            sample_size = len(group_posts)
            std_dev = stdev([p.metrics.engagementRate for p in group_posts])

            # 3. 与全局基准对比
            global_avg = mean([p.metrics.engagementRate for p in posts])
            delta = avg_er - global_avg
            delta_pct = delta / global_avg if global_avg > 0 else 0

            # 4. 统计显著性
            if sample_size >= 5:
                t_stat, p_value = ttest_ind(
                    [p.metrics.engagementRate for p in group_posts],
                    [p.metrics.engagementRate for p in posts if p not in group_posts]
                )
                is_significant = p_value < 0.05
            else:
                is_significant = False

            # 5. 置信度
            if sample_size < 5:
                confidence = "low"
            elif sample_size < 15:
                confidence = "medium"
            else:
                confidence = "high"

            # 6. 生成/更新规则
            rule = {
                "ruleId": f"{dim[:2]}-{group_name[:8]}-{date[-6:]}",
                "platform": "all",
                "category": dim,
                "metric": metric,
                "condition": {dim: group_name},
                "value": {
                    "threshold": global_avg,
                    "optimal": avg_er,
                    "recommendation": build_recommendation(dim, group_name, avg_er, delta_pct)
                },
                "evidence": {
                    "supportingPosts": [p.postId for p in group_posts],
                    "sampleSize": sample_size,
                    "avgValue": round(avg_er, 4),
                    "stdDeviation": round(std_dev, 4),
                    "confidenceLevel": confidence,
                    "statisticallySignificant": is_significant,
                    "pValue": round(p_value, 4) if sample_size >= 5 else None
                },
                "version": 1,
                "updatedAt": datetime.now().isoformat()
            }

            # 7. 合并到 performance-rules.md
            upsert_rule(rule)

    # 8. 更新周冠军
    update_weekly_best_posts(posts)


def build_recommendation(dim: str, group_name: str, avg_er: float, delta_pct: float) -> str:
    if delta_pct > 0.15:
        action = "优先使用"
    elif delta_pct < -0.15:
        action = "减少使用"
    else:
        return f"维持{group_name}格式，当前表现正常"

    return f"{action}「{group_name}」，相比基准{'高' if delta_pct > 0 else '低'}{abs(round(delta_pct*100,1))}%"
```

### 4.3 规则优先级与冲突解决

当多条规则同时适用时，按以下优先级降序处理：

```
1. platform-specific > platform-agnostic    (平台规范优先)
2. high confidence > medium > low            (高置信度优先)
3. newer version > older version             (新版本优先)
4. statistically significant > not significant (统计显著优先)
```

**冲突示例处理**:
- 规则A: "X平台 → story-hook格式 → ER+20%" (low置信度, 样本=3)
- 规则B: "所有平台 → 3-step-framework → ER+8%" (high置信度, 样本=25)

→ 输出时应同时展示，提示"X平台建议优先 story-hook (样本少但信号强)，其他平台建议 3-step-framework"

---

## 5. GSC API 与社交平台数据融合

### 5.1 GSC API 查询方案

```bash
# 每日查询 (通过 Google Cloud CLI)
gcloud auth print-access-token > /tmp/gsc_token.txt

curl -X POST \
  "https://www.googleapis.com/webmasters/v3/sites/sc-domain:winningadventure.com.au/searchAnalytics/query" \
  -H "Authorization: Bearer $(cat /tmp/gsc_token.txt)" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "'"$(date -v-1d '+%Y-%m-%d')"'",
    "endDate":   "'"$(date -v-1d '+%Y-%m-%d')"'",
    "dimensions": ["query", "page", "country"],
    "rowLimit": 100,
    "aggregationType": "byPage"
  }'
```

### 5.2 数据融合矩阵

| 维度 | LinkedIn | X | Facebook | GSC/SEO |
|------|----------|---|----------|---------|
| 曝光量 | Impressions | Impressions | Impressions | Impressions |
| 点击量 | Clicks | URL clicks | Link clicks | Clicks |
| 点击率 | CTR | CTR | CTR | CTR = Clicks/Impr |
| 互动 | Reactions+Comments+Reposts | Likes+Retweets+Replies | Reactions+Comments+Shares | (N/A) |
| 互动率 | ER(互动/曝光) | ER(互动/曝光) | ER(互动/曝光) | (N/A) |
| 排名 | (N/A) | (N/A) | (N/A) | Avg Position |
| 搜索query | (N/A) | (N/A) | (N/A) | Top Queries |

### 5.3 统一指标计算

```python
def compute_unified_metrics(raw: dict, platform: str) -> NormalizedMetrics:
    if platform == "linkedin":
        impressions = raw["impressions.total"]
        engagement  = raw["reactions.total"] + raw["comments.total"] + raw["reposts.total"]
        er = engagement / impressions if impressions > 0 else 0

    elif platform == "x":
        impressions = raw["impressions"]
        engagement  = raw["likes"] + raw["retweets"] + raw["replies"]
        er = engagement / impressions if impressions > 0 else 0

    elif platform == "facebook":
        impressions = raw["impressions"]
        engagement  = raw["reactions"] + raw["comments"] + raw["shares"]
        er = engagement / impressions if impressions > 0 else 0

    elif platform == "seo":
        impressions = raw["totalImpressions"]
        engagement  = raw["totalClicks"]  # SEO 用点击代替互动
        er = raw["ctr"]  # GSC 直接提供 CTR

    return {
        "impressions":  impressions,
        "engagement":   engagement,
        "engagementRate": round(er, 6),
        "ctr": round(raw["clicks"] / impressions, 6) if impressions > 0 else 0,
        "normalized": True
    }
```

---

## 6. 实施优先级

### Phase 1: 数据基础设施 (第1-2周)
- [ ] 创建 `analytics/` 目录结构
- [ ] 实现 `wag-analytics-collector` skill (LinkedIn + GSC)
- [ ] 建立 SQLite/JSON 存储层
- [ ] 配置 Qdrant 向量数据库

### Phase 2: RAG 上下文注入 (第3-4周)
- [ ] 实现内容向量嵌入 pipeline
- [ ] 构建 Context Assembler (性能数据 → prompt 片段)
- [ ] 将 RAG 上下文注入到 wag-linkedin-post
- [ ] 验证: 对比有/无 RAG 上下文的生成质量

### Phase 3: 自进化引擎 (第5-6周)
- [ ] 实现 PerformanceRules 更新算法
- [ ] 建立 weekly-best 帖子发现机制
- [ ] 自动生成每日/每周分析报告
- [ ] 将规则更新结果反馈到内容生成

### Phase 4: 全渠道覆盖 (第7-8周)
- [ ] X/Facebook 数据收集 (Chrome CDP)
- [ ] 融合 GSC + 社交数据统一分析
- [ ] 跨平台最优内容发现

---

## 参考数据摘要

### 历史帖子性能 (2026-03 实测)

| 日期 | 平台 | 曝光 | 点击 | ER | 格式 | 话题 |
|------|------|------|------|-----|------|------|
| 03/23 | LinkedIn | 31 | 5 | 22.6% | 3步框架 | immigration |
| 03/21 | LinkedIn | 59 | 1 | 5.1% | 叙述型 | business |
| 03/04 | LinkedIn | 47 | 1 | 6.4% | 自我介绍 | general |

**关键发现**: 3步框架 (ER 22.6%) >> 叙述型 (ER 5.1%)，样本虽小但信号明确。

### LinkedIn 月度汇总 (2026-03)
- 总曝光: 125 | 总点击: 7 | 总反应: 11
- 平均 ER: 16.48% (高于行业平均 ~3-5%)
- **结论**: WAG LinkedIn 内容 ER 表现优异，但绝对曝光量偏低 (增长瓶颈)

---

*本文件为设计文档，的实施需配合 wag-content-hub 整体架构进行。*
