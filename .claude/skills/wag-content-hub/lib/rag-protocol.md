# RAG Context Injection Protocol

Cross-channel content retrieval for WAG content generation.

## Overview

RAG context assembly for content generation. When generating LinkedIn posts, X/Twitter posts, or blog articles, inject performance-informed context from historical data, active rules, and recent trends.

## Query Expansion

Before vector search, expand the user query with semantically related terms.

**Strategy**: Use topic taxonomy from `analytics/content-matrix.md` to expand queries.

```
User query: "工厂验证"
Expanded: ["工厂验证", "factory verification", "supplier audit", "manufacturer inspection", "supplier vetting", "factory visit"]

User query: "quality control"
Expanded: ["quality control", "QC checklist", "product inspection", "quality assurance", "defect rate", "质量控制"]
```

**Implementation**:
```python
def expand_query(query: str) -> list[str]:
    """Expand query with synonyms and taxonomy siblings."""
    taxonomy = load_taxonomy()  # from content-matrix.md
    terms = [query]
    # Add direct synonyms
    terms.extend(taxonomy.get_synonyms(query))
    # Add sibling topics
    terms.extend(taxonomy.get_siblings(query))
    # Add parent/child relationships
    terms.extend(taxonomy.get_related(query))
    return list(set(terms))  # deduplicate
```

## Vector Collections

Three vector collections, stored as structured JSON (not actual embeddings — this is the retrieval protocol):

### 1. content_vectors

Content history with performance metadata.

```json
{
  "collection": "content_vectors",
  "schema": {
    "content_id": "string",
    "platform": "linkedin|twitter|facebook|gsc",
    "title": "string",
    "content_text": "string (truncated to 512 chars)",
    "topic_tags": ["string"],
    "hook_type": "knowledge-type|sharpness-test|relationship-type|long-tail",
    "published_at": "ISO8601 date",
    "performance": {
      "impressions": "int",
      "clicks": "int",
      "engagements": "int",
      "er": "float",
      "ctr": "float"
    },
    "vectors": {
      "topic_embedding": "[dim=768]",
      "style_embedding": "[dim=128]"
    }
  },
  "index_fields": ["topic_tags", "hook_type", "platform", "published_at"],
  "lookback_default": "30d",
  "lookback_long": "90d"
}
```

### 2. rules_vectors

Active content performance rules.

```json
{
  "collection": "rules_vectors",
  "schema": {
    "rule_id": "string",
    "platform": "linkedin|twitter|facebook|all",
    "dimension": "format|topic|hook_type|platform",
    "value": "string",
    "avg_er": "float",
    "sample_size": "int",
    "confidence": "low|medium|high",
    "statistical_significance": {
      "p_value": "float",
      "significant": "bool"
    },
    "trend": {
      "direction": "rising|falling|stable",
      "slope": "float"
    },
    "active": "bool",
    "generated_at": "ISO8601"
  },
  "index_fields": ["platform", "dimension", "confidence", "active"],
  "retrieval_priority": "confidence DESC, sample_size DESC"
}
```

### 3. insights_vectors

Summaries of performance analysis and strategic insights.

```json
{
  "collection": "insights_vectors",
  "schema": {
    "insight_id": "string",
    "type": "trend|anomaly|recommendation|weekly-summary",
    "title": "string",
    "body": "string (markdown, max 1024 chars)",
    "platform": "string|null",
    "topic": "string|null",
    "generated_at": "ISO8601",
    "evidence": {
      "data_points": "int",
      "sources": ["rule_ids or post_ids"]
    }
  },
  "index_fields": ["type", "platform", "topic", "generated_at"]
}
```

## Time Decay

Apply time decay to all retrieved content to prioritize recent performance.

```
weight(doc) = base_score * exp(-lambda * days_ago)

lambda = 0.07  # half-life ~ 10 days
```

**Example**:
- 1 day old: weight = base_score * 0.933
- 7 days old: weight = base_score * 0.612
- 14 days old: weight = base_score * 0.375
- 30 days old: weight = base_score * 0.122

## Context Assembly

Assemble RAG context in this order (system prompt is prepended first):

```
[System Prompt] +
[Yesterday's Metrics] +     # brief — platform totals, best/worst post
[Best Performing Posts] +    # top 3 by ER from last 7d, full text
[Active Performance Rules] + # rules with high confidence, platform-specific first
[Recent Trends] +           # 7d trend per platform, key direction changes
[User Query Context] +      # expanded query + relevant historical posts
```

### Component Details

#### Yesterday's Metrics (compact)
```
Yesterday ({date}):
- LinkedIn: {impressions} impressions, {er}% ER, best: "{post_snippet}" ({er}%)
- X/Twitter: {impressions} impressions, {er}% ER
- GSC: {clicks} clicks, {impressions} impressions, avg position #{pos}
```

#### Best Performing Posts (3 max)
```
Top performers last 7d:
1. [{platform}] "{title}" — ER={er}%, {impressions} impressions
   Hook: {hook_type} | Format: {content_type} | Topic: {topic_tags}
   [first 280 chars of content]
```

#### Active Performance Rules (priority-ordered)
```
Active rules (high confidence):
- linkedin/video: avg_er=8.2% (n=12, p<0.01, rising)
- linkedin/hook_type=sharpness-test: avg_er=6.8% (n=8, p<0.05, stable)
- twitter/format=text: avg_er=2.1% (n=15, p<0.01, falling)
```

#### Recent Trends
```
7d trend per platform:
- LinkedIn ER: 4.2% → 5.1% (+21%, rising)
- Twitter ER: 1.8% → 1.6% (-11%, falling)
- GSC clicks: 23 → 31 (+35%, rising)
Notable: Factory verification topic ER up 40% vs prior week
```

## Lookback Windows

| Purpose | Window | Used For |
|---------|--------|----------|
| Daily | 7d | Most recent performance, trend detection |
| Weekly analysis | 30d | Rule generation, statistical significance |
| Deep research | 90d | Historical patterns, seasonality |
| Blog/SEO | 30d | GSC keyword performance, content gap analysis |

## Retrieval Pipeline

```python
def retrieve_context(query: str, platform: str, lookback: str = "7d") -> dict:
    # 1. Expand query
    expanded = expand_query(query)

    # 2. Retrieve from each collection
    contents = vector_search("content_vectors",
                             query=expanded,
                             platform=platform,
                             lookback=lookback,
                             top_k=10)

    rules = vector_search("rules_vectors",
                          platform=platform,
                          confidence="high",
                          active=True,
                          top_k=10)

    insights = vector_search("insights_vectors",
                              type="recommendation|trend|anomaly",
                              lookback=lookback,
                              top_k=5)

    # 3. Apply time decay
    for doc in contents:
        doc.weight *= math.exp(-0.07 * days_ago(doc.published_at))

    # 4. Sort by weight
    contents.sort(key=lambda x: x.weight, reverse=True)

    # 5. Assemble context
    return assemble_context(contents, rules, insights, query, platform)
```

## Quality Rules

1. **Minimum retrieval**: Always return at least 1 relevant historical post if any exist in the lookback window
2. **Stale data warning**: If no data in lookback window, flag "no recent data for {platform}" in context
3. **Confidence anchoring**: Only surface rules with confidence >= medium in generated content recommendations
4. **Attribution**: Include post URL for any specific content recommendation
5. **No hallucination**: If specific metrics are unavailable, use "recent high-performing" language instead of fabricated numbers
