---
name: wag-analytics-collector
description: "Multi-platform analytics collection, normalization, daily reporting. GSC API + LinkedIn XLS + Twitter CSV + Facebook Page Insights into unified SQLite schema."
---

# wag-analytics-collector

## Overview

Automates collection, normalization, and daily reporting of content performance data across WAG's four channels.

**Primary purpose**: Feed the self-evolution feedback loop with accurate, standardized performance data.

**Commands**:
- `/collect-daily` — Run all collectors and generate daily report
- `/generate-report` — Generate daily/weekly performance report from existing data
- `/query-performance` — Query specific post or keyword performance

## Data Collection Methods

### GSC API — Automated

Uses Google Search Console API via `gcloud auth print-access-token`.

**First-time setup:**
```bash
gcloud auth login
gcloud config set project [your-project-id]
```

**Daily collection** (automated via `collect_daily.sh`):
```bash
python3 scripts/gsc_collector.py --start-date 2026-03-25 --end-date 2026-03-31
```

**API endpoint**:
```
POST https://www.googleapis.com/webmasters/v3/sites/sc-domain:winningadventure.com.au/searchAnalytics/query
```

**Key queries**:
- By date range + query: captures keyword performance
- By page: tracks individual blog post SEO performance

### LinkedIn — Semi-automated (Manual Export Required)

LinkedIn does not provide public OAuth API for analytics. Manual export + auto-parse is the current workflow.

**Export steps**:
1. LinkedIn Analytics → Export → XLS
2. Place file in `social/linkedin-post/analytics/linkedin-analytics-YYYY-MM-DD.xls`
3. Run parser: `python3 scripts/linkedin_parser.py social/linkedin-post/analytics/linkedin-analytics-YYYY-MM-DD.xls`

**Recommended frequency**: Export weekly (every Monday for previous week's data) — LinkedIn data has up to 2-day delay.

**XLS structure** (two sheets):
- `Metrics`: daily aggregated time-series (19 columns)
- `All posts`: per-post breakdown (20 columns, includes Content Type)

**Important**: Use column names, not column indices, to avoid errors. The XLS has two ER columns (organic / total) — always use `Engagement rate (total)` and `Impressions (total)` together.

### X/Twitter — Manual CSV Export

Export from: `analytics.twitter.com` → "Export data" → CSV
Place in: `social/twitter/analytics/`

### Facebook — Manual Page Insights Export

Requires Facebook Business API access (separate approval process). Manual export via Facebook Business Suite.

## Normalization Schema

All platform data normalizes to this unified schema:

```typescript
interface NormalizedPostMetrics {
  post_id: string;           // platform-native ID
  platform: 'linkedin' | 'twitter' | 'facebook' | 'gsc' | 'ga4';
  post_url: string;
  published_at: string;      // ISO 8601 UTC

  impressions: number;
  clicks: number;
  engagements: number;        // likes + comments + shares (GSC excluded)
  likes: number;
  comments: number;
  shares: number;
  reach: number;

  ctr: number;               // clicks / impressions
  er: number;                // engagements / impressions

  // GSC-specific
  avg_position?: number;
  query?: string;
  page?: string;

  // enrichment
  content_type?: string;      // 'text' | 'carousel' | 'image' | 'video' | 'blog'
  topic_tags?: string[];
  author?: string;
}
```

**Field mapping**:

| Concept | LinkedIn | GSC | X/Twitter | Facebook | Unified |
|---------|----------|-----|-----------|----------|---------|
| Impressions | Impressions (total) | Impressions | Impressions | Impressions/Reach | `impressions` |
| Clicks | Clicks (total) | Clicks | URL Clicks | Clicks | `clicks` |
| Likes | Reactions (total) | — | Likes | Reactions | `likes` |
| Comments | Comments (total) | — | Replies | Comments | `comments` |
| Shares | Reposts (total) | — | Retweets | Shares | `shares` |
| Engagements | Reactions+Comments+Reposts | — | Engagements (native) | Engagements | `engagements` |

**Calculation formulas**:
```python
engagements = likes + comments + shares
ctr = (clicks / impressions * 100, 4) if impressions > 0 else 0.0
er  = (engagements / impressions * 100, 4) if impressions > 0 else 0.0
```

## Storage

**SQLite DB**: `data/content_analytics.db` (gitignored — do NOT commit)

**CSV append logs**: `analytics/daily/*.csv` (git-tracked)

**Daily reports**: `analytics/reports/daily-report-YYYY-MM-DD.md`

### SQLite Schema

```sql
-- Per-platform raw tables
CREATE TABLE linkedin_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_title TEXT, post_url TEXT UNIQUE, post_type TEXT, author TEXT,
    published_at TEXT, impressions INTEGER, clicks INTEGER,
    likes INTEGER, comments INTEGER, shares INTEGER, er REAL,
    content_type TEXT, collected_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE gsc_raw (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT, query TEXT, page TEXT,
    clicks REAL, impressions REAL, ctr REAL, position REAL,
    collected_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE twitter_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tweet_id TEXT UNIQUE, tweet_url TEXT, content TEXT,
    published_at TEXT, impressions INTEGER, engagements INTEGER,
    likes INTEGER, retweets INTEGER, replies INTEGER, url_clicks INTEGER,
    er REAL, collected_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE facebook_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id TEXT UNIQUE, post_url TEXT, published_at TEXT,
    impressions INTEGER, engagements INTEGER,
    reactions INTEGER, comments INTEGER, shares INTEGER,
    er REAL, collected_at TEXT DEFAULT (datetime('now'))
);

-- Normalized cross-platform table
CREATE TABLE norm_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_id TEXT, platform TEXT, post_url TEXT, published_at TEXT,
    impressions INTEGER, clicks INTEGER, engagements INTEGER,
    likes INTEGER, comments INTEGER, shares INTEGER,
    ctr REAL, er REAL,
    topic_tags TEXT, hook_type TEXT, format_pattern TEXT,
    collected_at TEXT DEFAULT (datetime('now'))
);

-- Daily aggregated summary
CREATE TABLE daily_summary (
    date TEXT PRIMARY KEY,
    total_impressions INTEGER, total_engagements INTEGER, total_clicks INTEGER,
    best_er_post_url TEXT, best_er REAL,
    platform_breakdown TEXT,
    collected_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX idx_linkedin_published ON linkedin_posts(published_at);
CREATE INDEX idx_gsc_date ON gsc_raw(date);
CREATE INDEX idx_norm_platform ON norm_posts(platform);
CREATE INDEX idx_norm_published ON norm_posts(published_at);
CREATE INDEX idx_twitter_published ON twitter_posts(published_at);
CREATE INDEX idx_facebook_published ON facebook_posts(published_at);
```

## Daily Report Template

```markdown
# WAG Daily Data Report — {YYYY-MM-DD}

**Collection time**: {HH:MM UTC}
**Data delay note**: LinkedIn up to 2 days, GSC 1-2 days

---

## Channel Overview

| Channel | Impressions | Clicks | Engagements | ER | vs Yesterday |
|---------|-------------|--------|-------------|-----|-------------|
| LinkedIn | {n} | {n} | {n} | {n}% | {+/-n%} |
| X/Twitter | {n} | {n} | {n} | {n}% | {+/-n%} |
| Facebook | {n} | {n} | {n} | {n}% | {+/-n%} |
| GSC | {n} | {n} | — | {n}% | {+/-n%} |
| **Total** | **{n}** | **{n}** | **{n}** | **{n}%** | — |

---

## Top Performer (by ER)

- **Platform**: {LinkedIn/X/FB}
- **Title**: {post title snippet}
- **ER**: {n}%
- **Impressions**: {n}
- **Link**: {url}

## SEO Top Ranking

- **Keyword**: "{query}"
- **Avg Position**: #{n}
- **Impressions**: {n} | **Clicks**: {n} | **CTR**: {n}%

---

## Attention Needed

### Posts with ER < 5%
- {post_title} ({platform}) — ER={n}%

### GSC Ranking Drops
- "{query}" — #{old} → #{new}

---

## 7-Day Trend

| Metric | 7d Avg | vs Prev 7d |
|--------|--------|------------|
| Impressions | {n} | {+/-n%} |
| Engagements | {n} | {+/-n%} |
| Avg ER | {n}% | {+/-n}pp |

---

## Week-over-Week Comparison

| Metric | Same Day Last Week | Today | Change |
|--------|--------------------|-------|--------|
| Total Impressions | {n} | {n} | {+/-n%} |
| Total Engagements | {n} | {n} | {+/-n%} |
| Avg ER | {n}% | {n}% | {+/-n}pp |
| Best ER | {n}% | {n}% | {+/-n}pp |

---

## Insights

{Claude-generated analysis}:
- Key drivers of today's performance
- Comparison vs historical best posts
- Suggested optimizations for tomorrow

---

*Auto-generated by wag-analytics-collector | {YYYY-MM-DD HH:MM UTC}*
```

## Critical Rules

1. **GSC data is authoritative for SEO** — do not manually override GSC ranking data
2. **LinkedIn data delayed 2 days** — do not report same-day LinkedIn numbers; flag when data is stale
3. **ER uses impressions as denominator** — not reach (LinkedIn reach may exceed impressions; always use impressions)
4. **De-duplicate before storing** — check `post_url` / `tweet_id` uniqueness on every insert; use `INSERT OR IGNORE`
5. **Keep raw data separate** — never normalize in-place; always preserve original platform exports for audit
6. **Use column names not indices** — LinkedIn XLS has two ER columns (organic/total) and two impressions columns (organic/total); always reference by name
7. **Cross-validate exports** — Metrics sheet totals should approximately equal All posts sheet sums

## File Structure

```
analytics-collector/
├── scripts/
│   ├── collect_daily.sh        # Main orchestrator
│   ├── gsc_collector.py        # GSC API collector
│   ├── linkedin_parser.py      # LinkedIn XLS parser
│   ├── twitter_parser.py       # Twitter CSV parser
│   ├── facebook_parser.py       # Facebook Page Insights parser
│   ├── normalizer.py           # Data normalization engine
│   ├── report_generator.py     # Daily report MD generator
│   └── query_performance.py    # Ad-hoc performance queries
├── docs/
│   ├── normalization-schema.md  # Full TypeScript interface
│   ├── storage-schema.md        # SQLite DDL
│   └── platform-fields.md       # Platform field mapping tables
├── data/                       # SQLite DB (gitignored)
│   └── content_analytics.db
└── SKILL.md
```

## Dependencies

```bash
pip install xlrd pandas sqlite3 jinja2
```

---

## WCSP Output Contract

All analytics-collector operations MUST return this structured response:

```yaml
output:
  status: success | warning | error | partial

  summary: "Collected GSC data: 2026-03-25 to 2026-03-31, 1,247 queries processed"

  next_actions:
    - action: generate-report
      description: "Generate daily report from collected data"
      blocking: false
    - action: query-performance
      description: "Query specific post or keyword metrics"
      blocking: false

  artifacts:
    report_path: "/analytics/reports/daily-report-YYYY-MM-DD.md"
    db_path: "/analytics-collector/data/content_analytics.db"
    raw_csvs:
      - "/analytics/daily/gsc-YYYY-MM-DD.csv"
      - "/analytics/daily/linkedin-YYYY-MM-DD.csv"
    normalized_count: 1247
    quality_flags:
      - type: data-delay
        detail: "LinkedIn data 2 days delayed"
        severity: warning
      - type: coverage
        detail: "X/Twitter data missing for this period"
        severity: warning

  error:
    root_cause: "GSC API authentication failed"
    safe_retry: "Run 'gcloud auth login' to refresh credentials"
    stop_condition: "3 retries exceeded"
```

### Command-Specific Outputs

#### /collect-daily
```yaml
artifacts:
  platforms_collected: [gsc, linkedin]
  platforms_missing: [twitter, facebook]
  total_records: <number>
  collection_duration_seconds: <number>
  next_collection: "YYYY-MM-DD 09:00 UTC"
```

#### /generate-report
```yaml
artifacts:
  report_path: "/analytics/reports/{daily|weekly}-YYYY-MM-DD.md"
  report_type: daily | weekly
  period: "YYYY-MM-DD to YYYY-MM-DD"
  top_performer:
    platform: <string>
    post_url: <string>
    er: <number>
  attention_needed_count: <number>
```

#### /query-performance
```yaml
artifacts:
  query_type: post | keyword | trend | summary
  results_count: <number>
  data:
    - post_url: <string>
      platform: <string>
      published_at: <ISO8601>
      impressions: <number>
      engagements: <number>
      er: <number>
```

### Error Recovery

| Error | Recovery | Stop Condition |
|-------|----------|----------------|
| GSC API auth fail | Run `gcloud auth login` | 3 retries → skip GSC, continue others |
| LinkedIn XLS parse fail | Check file format, use column names not indices | Skip LinkedIn, continue |
| SQLite write fail | Check write permissions, disk space | Stop collection, report error |
| Missing platform data | Mark in quality_flags, continue others | Never block entire pipeline |
| Report generation fail | Return raw data with error flag | Partial output acceptable |

### Quality Gates

Before returning success:
- [ ] All available platforms collected
- [ ] Data deduplicated (check post_url uniqueness)
- [ ] ER calculated correctly (engagements/impressions)
- [ ] LinkedIn data delay flagged if <2 days old
- [ ] Missing platforms marked in quality_flags
- [ ] Raw data preserved (not normalized in-place)
- [ ] Collection timestamp recorded

### Status Definitions

| Status | Meaning |
|--------|---------|
| success | All requested platforms collected/reported |
| partial | Some platforms failed, results returned with flags |
| warning | Data quality issues detected (delay, missing fields) |
| error | Fatal error, no meaningful output |
| blocked | Missing required input (credentials, file path) |
