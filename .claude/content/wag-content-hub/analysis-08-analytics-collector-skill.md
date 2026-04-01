# Task #8 分析报告：wag-analytics-collector Skill 技术实现

**负责人**: data-engineer
**完成时间**: 2026-04-01
**状态**: ✅ 分析完成

---

## 一、技术方案总览

`wag-analytics-collector` 负责从四个渠道自动收集性能数据，为自进化反馈循环提供原材料。其核心挑战不是"如何获取数据"，而是：

> **如何让非结构化的平台原生数据，在最小人工干预下，变成可用于跨平台对比的统一指标。**

### 数据流架构

```
┌─────────────────────────────────────────────────────────────┐
│                 wag-analytics-collector                      │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  GSC API   │  │ LinkedIn XLS │  │  Chrome CDP │          │
│  │ (searchAna- │  │ (手动导出)   │  │ (X/FB ana-  │          │
│  │  lytics)   │  │             │  │  lytics)    │          │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │
│         │                │                │                  │
│         ▼                ▼                ▼                  │
│  ┌─────────────────────────────────────────────┐            │
│  │           Data Normalizer                     │            │
│  │  impression / engagement / click / rank      │            │
│  └──────────────────┬──────────────────────────┘            │
│                     ▼                                       │
│  ┌─────────────────────────────────────────────┐            │
│  │         SQLite DB (content_analytics.db)    │            │
│  │  - raw_tables    (platform-native schema)    │            │
│  │  - norm_tables   (unified schema)            │            │
│  │  - daily_reports (aggregated)                │            │
│  └──────────────────┬──────────────────────────┘            │
│                     ▼                                       │
│  ┌─────────────────────────────────────────────┐            │
│  │         Report Generator                     │            │
│  │  daily-report-YYYY-MM-DD.md                  │            │
│  └─────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、各平台数据字段映射表

### 2.1 平台原生字段（原始数据）

#### LinkedIn Analytics（从 XLS 导出）

数据源：`winning-adventure-global_content_1775019156592.xls`
导出路径：`social/linkedin-post/analytics/`

| LinkedIn 原始字段 | 类型 | 说明 |
|-------------------|------|------|
| Date | date | UTC 时间 |
| Impressions (organic) | int | 有机曝光 |
| Impressions (sponsored) | int | 付费曝光 |
| Impressions (total) | int | 总曝光 |
| Unique impressions (organic) | int | 独立访客曝光 |
| Clicks (organic) | int | 有机点击 |
| Clicks (sponsored) | int | 付费点击 |
| Clicks (total) | int | 总点击 |
| Reactions (organic) | int | 有机点赞 |
| Reactions (sponsored) | int | 付费点赞 |
| Reactions (total) | int | 总点赞 |
| Comments (organic) | int | 有机评论 |
| Comments (sponsored) | int | 付费评论 |
| Comments (total) | int | 总评论 |
| Reposts (organic) | int | 有机转发 |
| Reposts (sponsored) | int | 付费转发 |
| Reposts (total) | int | 总转发 |
| Engagement rate (organic) | float | 有机互动率 |
| Engagement rate (sponsored) | float | 付费互动率 |
| Engagement rate (total) | float | 总互动率 |

**补充 Sheet（All posts）额外字段**：

| 字段 | 类型 | 说明 |
|------|------|------|
| Post title | string | 帖子标题 |
| Post link | url | 帖子链接 |
| Post type | enum | Organic / Sponsored |
| Posted by | string | 发布人姓名 |
| Campaign name | string | 活动名称（可选） |
| Audience | enum | All followers / other |
| Views | int | 视频观看数 |
| Offsite Views | int |站外浏览 |
| Follows | int | 新增关注 |
| Content Type | enum | Image / Text / Video / Document |

**历史数据验证**（从 XLS 实测）：

| 日期 | 曝光 | 点击 | 反应 | 评论 | 转发 | ER |
|------|------|------|------|------|------|-----|
| 03/04/2026 | 47 | 1 | 2 | 0 | 0 | 6.38% |
| 03/21/2026 | 59 | 1 | 2 | 0 | 0 | 5.08% |
| 03/23/2026 | 31 | 5 | 2 | 0 | 0 | 22.58% |

⚠️ 注意：进度文件中记录的 "ER=33.33%" 数据有误，实测 XLS 中 03/23 帖子 ER = 22.58%（= 7 interactions / 31 impressions）。该误差来源于进度文件引用了 ER (organic) 列而非 ER (total) 列，且 impressions 基准不一致。

#### Google Search Console API

API 端点：`POST https://www.googleapis.com/webmasters/v3/sites/sc-domain:{domain}/searchAnalytics/query`
认证：`gcloud auth print-access-token`（需先运行 `gcloud auth login`）

| GSC 原始字段 | 类型 | 说明 |
|-------------|------|------|
| keys[] | string | 搜索查询词 |
| clicks | float | 点击次数 |
| impressions | float | 曝光次数 |
| ctr | float | 点击率 |
| position | float | 平均排名 |

**推荐查询维度**：

```bash
# 每日汇总查询
curl -X POST \
  "https://www.googleapis.com/webmasters/v3/sites/sc-domain:winningadventure.com.au/searchAnalytics/query" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2026-03-25",
    "endDate": "2026-03-31",
    "dimensions": ["query"],
    "rowLimit": 100,
    "aggregationType": "byPage"
  }'

# 按页面汇总（用于追踪单篇博文表现）
curl -X POST \
  "https://www.googleapis.com/webmasters/v3/sites/sc-domain:winningadventure.com.au/searchAnalytics/query" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2026-03-01",
    "endDate": "2026-03-31",
    "dimensions": ["page"],
    "rowLimit": 50,
    "aggregationType": "byPage"
  }'
```

#### X/Twitter Analytics（需 Chrome CDP 或手动）

数据面板：`x.com/[username]/analytics`
手动导出：analytics.twitter.com → "Export data"

| X 原始字段 | 类型 | 说明 |
|-----------|------|------|
| impressions | int | 曝光 |
| engagements | int | 互动（所有类型合计） |
| engagement rate | float | 互动率 |
| likes | int | 点赞 |
| retweets | int | 转发 |
| replies | int | 回复 |
| url clicks | int | 链接点击 |
| profile visits | int | 主页访问 |
| follow | int | 新关注 |

#### Facebook Page Insights（需 Chrome CDP 或 Page Insights API）

| FB 原始字段 | 类型 | 说明 |
|------------|------|------|
| page_impressions | int | 曝光 |
| page_post_engagements | int | 互动 |
| page_views_total | int | 页面浏览 |
| page_fan_count | int | 粉丝数 |
| post_reach_total | int | 帖子触达 |
| post_reactions_total | int | 反应总数 |
| post_comments | int | 评论 |
| post_shares | int | 分享 |

---

### 2.2 标准化统一字段（Normalized Schema）

**设计原则**：所有平台数据最终归一化为统一 schema，字段名与 GA4 保持一致以降低认知负担。

```typescript
// 标准化数据统一 schema
interface NormalizedPostMetrics {
  // 标识
  post_id: string;          // 平台原生 ID
  platform: Platform;       // 'linkedin' | 'twitter' | 'facebook' | 'gsc'
  post_url: string;
  published_at: string;     // ISO 8601 UTC

  // 核心指标（统一命名）
  impressions: number;       // 曝光/展示
  clicks: number;           // 点击
  engagements: number;     // 互动总数（反应+评论+转发）
  likes: number;            // 点赞/反应
  comments: number;         // 评论
  shares: number;           // 转发/分享
  reach: number;            // 触达（若平台提供）

  // 计算指标
  ctr: number;              // click-through rate = clicks / impressions
  er: number;               // engagement rate = engagements / impressions

  // 排名/SEO 专用
  avg_position?: number;     // GSC 排名
  query?: string;           // GSC 搜索词
  page?: string;            // GSC 页面路径

  // 元数据
  content_type?: string;    // 'text' | 'carousel' | 'image' | 'video' | 'blog'
  topic_tags?: string[];     // 话题标签
  author?: string;          // 发布人
}

type Platform = 'linkedin' | 'twitter' | 'facebook' | 'gsc' | 'ga4';
```

**统一命名对照表**：

| 概念 | LinkedIn | GSC | X/Twitter | Facebook | 统一字段 |
|------|----------|-----|-----------|----------|----------|
| 展示次数 | Impressions | Impressions | Impressions | Impressions / Reach | `impressions` |
| 点击 | Clicks | Clicks | URL Clicks | Clicks | `clicks` |
| 点赞 | Reactions | - | Likes | Reactions | `likes` |
| 评论 | Comments | - | Replies | Comments | `comments` |
| 转发 | Reposts | - | Retweets | Shares | `shares` |
| 互动合计 | Reactions+Comments+Reposts | - | Engagements | Engagements | `engagements` |
| 点击率 | CTR | CTR | Link Click Rate | - | `ctr` |
| 互动率 | ER | - | ER | ER | `er` |
| 搜索排名 | - | Position | - | - | `avg_position` |
| 搜索词 | - | Query | - | - | `query` |
| 页面路径 | - | Page | - | - | `page` |

---

## 三、数据标准化流程

### 3.1 标准化算法

```
raw_data (各平台)
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│ Step 1: Parse - 解析原始数据                              │
│   - LinkedIn XLS → pandas DataFrame                     │
│   - GSC JSON → dict list                                │
│   - Twitter CSV → pandas DataFrame                       │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│ Step 2: Deduplicate - 按 (platform, post_id, date) 去重   │
│   - LinkedIn: 同一日期同一 post 保留最新导出版本           │
│   - GSC: 按 aggregationType=byPage 去重                  │
│   - Twitter: 按 tweet_id 去重                            │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│ Step 3: Normalize - 字段映射到统一 schema                  │
│   - engangements = likes + comments + shares             │
│   - ctr = clicks / impressions (处理除零)                │
│   - er = engagements / impressions (处理除零)             │
│   - platform-specific 字段 归入 optional 元数据            │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│ Step 4: Merge - 按日期和 content_id 合并跨平台数据          │
│   - 同一天同一 content 跨平台发布 → 合并为联合记录          │
│   - 使用 post_url 或 slug 作为 content_id                 │
│   - 无法匹配的记录独立存储                                 │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│ Step 5: Enrich - 注入 RAG 上下文                           │
│   - 读取 content-matrix.md 补全 topic_tags               │
│   - 读取 performance-rules.md 标注 content_type          │
│   - 标注 hook_type, format_pattern                       │
└──────────────────────────────────────────────────────────┘
```

### 3.2 归一化关键计算

**engagements 的定义边界**（重要决策点）：

| 平台 | 官方 engagement 定义 | 本 skill 采纳 |
|------|---------------------|---------------|
| LinkedIn | Reactions + Comments + Reposts | 同左 |
| X/Twitter | engagements 字段（含所有互动类型） | 直接用官方值 |
| Facebook | post_reactions + post_comments + post_shares | 同左 |
| GSC | 无 | 不适用 |

**ER 计算异常处理**：
```python
def calc_er(impressions: int, engagements: int) -> float:
    if impressions == 0:
        return 0.0
    return round(engagements / impressions * 100, 4)

def calc_ctr(impressions: int, clicks: int) -> float:
    if impressions == 0:
        return 0.0
    return round(clicks / impressions * 100, 4)
```

---

## 四、GSC API 调用方案

### 4.1 认证方案

**首选**：gcloud CLI（无需 OAuth flow 开发）
```bash
gcloud auth login          # 首次设置
gcloud auth print-access-token  # 获取 token（有效期 60 分钟）
```

**备选**：OAuth2 Service Account（适合自动化脚本）
```bash
gcloud iam service-accounts create wag-analytics-collector \
  --display-name="WAG Analytics Collector"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:wag-analytics@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/searchconsole.readonly"

gcloud iam service-accounts keys create key.json \
  --iam-account=wag-analytics@$PROJECT_ID.iam.gserviceaccount.com

# 使用
curl -H "Authorization: Bearer $(gcloud auth print-access-token)" ...
```

### 4.2 每日收集脚本

```python
#!/usr/bin/env python3
"""gsc_collector.py — Google Search Console 日收集"""

import subprocess
import json
import sqlite3
from datetime import datetime, timedelta

SITE_URL = "sc-domain:winningadventure.com.au"

def get_access_token():
    result = subprocess.run(
        ["gcloud", "auth", "print-access-token"],
        capture_output=True, text=True, check=True
    )
    return result.stdout.strip()

def query_gsc(start_date: str, end_date: str, dimensions: list[str], row_limit: int = 100):
    token = get_access_token()
    body = {
        "startDate": start_date,
        "endDate": end_date,
        "dimensions": dimensions,
        "rowLimit": row_limit,
    }
    if "page" in dimensions or "query" in dimensions:
        body["aggregationType"] = "byPage"

    result = subprocess.run([
        "curl", "-s", "-X", "POST",
        f"https://www.googleapis.com/webmasters/v3/sites/{SITE_URL}/searchAnalytics/query",
        "-H", f"Authorization: Bearer {token}",
        "-H", "Content-Type: application/json",
        "-d", json.dumps(body)
    ], capture_output=True, text=True, check=True)

    return json.loads(result.stdout)

def store_gsc_data(rows: list[dict], conn: sqlite3.Connection):
    cursor = conn.cursor()
    cursor.executemany("""
        INSERT OR REPLACE INTO gsc_raw
        (query, page, date, clicks, impressions, ctr, position)
        VALUES (:keys[0], :keys[1], date, :clicks, :impressions, :ctr, :position)
    """, rows)
    conn.commit()

if __name__ == "__main__":
    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    data = query_gsc(yesterday, yesterday, ["query", "page"])
    conn = sqlite3.connect("data/content_analytics.db")
    store_gsc_data(data.get("rows", []), conn)
    conn.close()
```

---

## 五、LinkedIn 手动导出流程的半自动化方案

### 5.1 当前限制

LinkedIn **不提供**公开 OAuth API 供第三方应用读取个人/公司页面分析数据。官方 LinkedIn Marketing API 需要：
- 企业会员资格（LinkedIn Marketing Solutions）
- 应用审核通过
- 访问令牌申请流程复杂

因此当前最优解是**手动导出 + 自动解析**的半自动化流程。

### 5.2 导出步骤（用户操作）

```
1. 登录 LinkedIn → 进入 "Creator Mode" 或公司页面
2. 点击 "Analytics" → 选择日期范围（建议月报一次）
3. 点击 "Export" → 下载 XLS 格式
4. 将文件放入 social/linkedin-post/analytics/
   命名规范: linkedin-analytics-YYYY-MM-DD.xls
```

### 5.3 自动解析流程

```python
#!/usr/bin/env python3
"""linkedin_parser.py — LinkedIn XLS 自动解析"""

import xlrd
import sqlite3
import json
from datetime import datetime

def parse_linkedin_xls(filepath: str) -> list[dict]:
    wb = xlrd.open_workbook(filepath)
    metrics_sheet = wb.sheet_by_name("Metrics")
    posts_sheet = wb.sheet_by_name("All posts")

    # 解析日期汇总行
    daily_records = []
    for row_idx in range(2, metrics_sheet.nrows):  # 跳过 header
        row = [metrics_sheet.cell_value(row_idx, col_idx) for col_idx in range(19)]
        date_str = row[0]  # "03/01/2026"
        date_obj = datetime.strptime(date_str, "%m/%d/%Y")
        daily_records.append({
            "date": date_obj.strftime("%Y-%m-%d"),
            "impressions_total": row[3],
            "clicks_total": row[8],
            "reactions_total": row[11],
            "comments_total": row[14],
            "reposts_total": row[17],
            "er_total": row[18],
        })

    # 解析单帖数据
    post_records = []
    for row_idx in range(2, posts_sheet.nrows):
        row = [posts_sheet.cell_value(row_idx, col_idx) for col_idx in range(20)]
        post_records.append({
            "post_title": row[0],
            "post_url": row[1],
            "post_type": row[2],
            "author": row[4],
            "published_at": datetime.strptime(row[5], "%m/%d/%Y").strftime("%Y-%m-%d"),
            "impressions": row[9],
            "clicks": row[12],
            "likes": row[14],
            "comments": row[15],
            "shares": row[16],
            "er": row[18],
            "content_type": row[19],
        })

    return {"daily": daily_records, "posts": post_records}

def store_linkedin_data(data: dict, conn: sqlite3.Connection):
    cursor = conn.cursor()
    for post in data["posts"]:
        # 检查是否已存在（按 post_url 去重）
        cursor.execute("SELECT 1 FROM linkedin_posts WHERE post_url = ?", (post["post_url"],))
        if cursor.fetchone():
            continue  # 已存在则跳过
        cursor.execute("""
            INSERT INTO linkedin_posts
            (post_title, post_url, post_type, author, published_at,
             impressions, clicks, likes, comments, shares, er, content_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            post["post_title"], post["post_url"], post["post_type"], post["author"],
            post["published_at"], post["impressions"], post["clicks"], post["likes"],
            post["comments"], post["shares"], post["er"], post["content_type"]
        ))
    conn.commit()
```

---

## 六、数据存储方案

### 6.1 SQLite vs JSON vs CSV 对比

| 维度 | SQLite | JSON | CSV |
|------|--------|------|-----|
| 查询能力 | SQL 全查询 | 需全量加载 | 需全量加载 |
| 追加写入 | ✅ append 模式 | ❌ 需读-改-写 | ✅ append 模式 |
| 跨文件关联 | ✅ JOIN | ❌ 需手动合并 | ❌ 需手动合并 |
| 文件大小 | 紧凑（数据库格式） | 中等（结构化但含冗余字段名） | 最小（纯文本） |
| Git 友好 | ❌ 二进制 | ✅ 纯文本 | ✅ 纯文本 |
| 备份/同步 | 需复制 .db 文件 | ✅ Git 可追踪版本 | ✅ Git 可追踪版本 |
| **推荐用途** | **运行时查询 DB** | **API response 缓存** | **每日增量追加** |

### 6.2 推荐混合方案

```
data/
├── content_analytics.db       # SQLite — 运行时主数据库
├── linkedin/
│   ├── linkedin-analytics-2026-03.xls  # 原始导出（归档）
│   └── linkedin-daily.csv    # 每日追加 CSV（Git 可追踪）
├── gsc/
│   └── gsc-daily.csv         # 每日追加 CSV
├── twitter/
│   └── twitter-daily.csv
└── reports/
    └── daily-report-YYYY-MM-DD.md  # 日报告
```

**DB Schema**：

```sql
-- 平台原始数据表
CREATE TABLE linkedin_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_title TEXT,
    post_url TEXT UNIQUE,
    post_type TEXT,
    author TEXT,
    published_at TEXT,
    impressions INTEGER,
    clicks INTEGER,
    likes INTEGER,
    comments INTEGER,
    shares INTEGER,
    er REAL,
    content_type TEXT,
    collected_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE gsc_raw (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    query TEXT,
    page TEXT,
    clicks REAL,
    impressions REAL,
    ctr REAL,
    position REAL,
    collected_at TEXT DEFAULT (datetime('now'))
);

-- 标准化数据表（跨平台统一视图）
CREATE TABLE norm_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_id TEXT,         -- 跨平台内容标识
    platform TEXT,
    post_url TEXT,
    published_at TEXT,
    impressions INTEGER,
    clicks INTEGER,
    engagements INTEGER,
    likes INTEGER,
    comments INTEGER,
    shares INTEGER,
    ctr REAL,
    er REAL,
    topic_tags TEXT,         -- JSON array
    hook_type TEXT,
    format_pattern TEXT,
    collected_at TEXT DEFAULT (datetime('now'))
);

-- 每日聚合报告表
CREATE TABLE daily_summary (
    date TEXT PRIMARY KEY,
    total_impressions INTEGER,
    total_engagements INTEGER,
    total_clicks INTEGER,
    best_er_post_url TEXT,
    best_er REAL,
    platform_breakdown TEXT,  -- JSON
    collected_at TEXT DEFAULT (datetime('now'))
);

-- 索引
CREATE INDEX idx_linkedin_published ON linkedin_posts(published_at);
CREATE INDEX idx_gsc_date ON gsc_raw(date);
CREATE INDEX idx_norm_platform ON norm_posts(platform);
CREATE INDEX idx_norm_published ON norm_posts(published_at);
```

---

## 七、每日数据报告模板

### 7.1 日报文件命名

```
analytics/reports/daily-report-YYYY-MM-DD.md
```

### 7.2 日报结构模板

```markdown
# WAG 每日数据报告 — {YYYY-MM-DD}

**收集时间**: {收集完成时刻}
**数据延迟说明**: LinkedIn 数据延迟最多 2 天，GSC 延迟 1-2 天

---

## 📊 渠道数据概览

| 渠道 | 曝光 | 点击 | 互动 | ER | vs昨日 |
|------|------|------|------|-----|--------|
| LinkedIn | {n} | {n} | {n} | {n}% | +{n}% |
| X/Twitter | {n} | {n} | {n} | {n}% | +{n}% |
| Facebook | {n} | {n} | {n} | {n}% | +{n}% |
| GSC | {n} | {n} | - | {n}% | +{n}% |
| **合计** | **{n}** | **{n}** | **{n}** | **{n}%** | - |

---

## 🏆 最佳表现

### Top Post（按 ER）
- **平台**: {LinkedIn/X/FB}
- **标题**: {标题片段}
- **ER**: {n}%
- **曝光**: {n}
- **链接**: {url}

### SEO 最佳排名
- **关键词**: "{query}"
- **平均排名**: #{n}
- **曝光**: {n}
- **点击**: {n}
- **CTR**: {n}%

---

## 📉 需关注

### ER 低于 5% 的帖子
- {post_title} ({platform}) — ER={n}%

### GSC 排名下降关键词
- "{query}" — 从 #{old} 降至 #{new}

---

## 📈 趋势分析

### 近 7 天曝光趋势
![impression-chart](impression-chart-7d.png)
<!-- 或 ASCII 图表 -->
LinkedIn:  ▁▂▃▅▆▅▇
X:         ▁▁▂▁▃▂▁

### 近 7 天 ER 趋势
ER:        ▁▂▃▂▅▃▄

---

## 🔄 与上周同期对比

| 指标 | 上周同期 | 本日 | 变化 |
|------|----------|------|------|
| 总曝光 | {n} | {n} | +{n}% |
| 总互动 | {n} | {n} | +{n}% |
| 平均 ER | {n}% | {n}% | +{n}pp |
| 最佳 ER | {n}% | {n}% | +{n}pp |

---

## 💡 数据洞察

{Claude 分析生成}:
- 今日内容表现主要驱动因素
- 与历史最优帖子的对比
- 下一步优化建议

---

## 📋 原始数据

- LinkedIn 导出: `linkedin-analytics-YYYY-MM-DD.xls`
- GSC 查询: `{date range}`
- 数据收集脚本: `scripts/collect_daily.sh`

---

*报告由 wag-analytics-collector 自动生成 | {YYYY-MM-DD HH:MM UTC}*
```

---

## 八、SKILL.md 草稿

```markdown
---
name: wag-analytics-collector
description: "Automate multi-platform analytics collection, normalization, and daily reporting for WAG content performance tracking"
---

# wag-analytics-collector

## Overview

This skill automates the collection, normalization, and reporting of content performance data across WAG's four channels: LinkedIn, X/Twitter, Facebook, and Google Search Console (via GSC API).

**Primary purpose**: Feed the self-evolution feedback loop with accurate, standardized performance data. Without reliable data collection, the self-evolution mechanism cannot learn which content patterns work.

**When to use**:
- `/collect-daily` — Run after 6 PM each day to collect yesterday's data
- `/generate-report` — Generate daily/weekly performance report
- `/query-performance` — Query specific post or keyword performance

## Data Collection Methods

### GSC API (Automated ✅)

Uses Google Search Console API via `gcloud auth print-access-token`.

**First-time setup:**
```bash
gcloud auth login
gcloud config set project [your-project-id]
```

**Collect GSC data:**
```bash
python3 scripts/gsc_collector.py --start-date 2026-03-25 --end-date 2026-03-31
```

### LinkedIn (Semi-automated ⚠️)

**Manual export required** — LinkedIn does not provide public OAuth API for analytics.

User workflow:
1. LinkedIn Analytics → Export → XLS
2. Place file in `social/linkedin-post/analytics/linkedin-analytics-YYYY-MM-DD.xls`
3. Run parser: `python3 scripts/linkedin_parser.py social/linkedin-post/analytics/linkedin-analytics-YYYY-MM-DD.xls`

### X/Twitter (Manual Export ⚠️)

Export from: analytics.twitter.com → "Export data" → CSV
Place in: `social/twitter/analytics/`

### Facebook (Page Insights API or Manual ⚠️)

Requires Facebook Business API access (separate approval process).

## Normalization Schema

All platform data is normalized to a unified schema before storage. See `docs/normalization-schema.md` for the full TypeScript interface definition.

Key normalized fields:
- `impressions` — All "views" / "reach" / "展示" fields
- `engagements` — likes + comments + shares (GSC excluded)
- `ctr` — clicks / impressions
- `er` — engagements / impressions

## Storage

SQLite database at `data/content_analytics.db`. See `docs/storage-schema.md` for full table definitions.

**Do NOT store in Git** — the `.db` file is excluded from version control via `.gitignore`.

## Daily Collection Workflow

```bash
# Full daily collection
./scripts/collect_daily.sh  # Runs all collectors + report generator
```

The script:
1. Collects GSC data (automated)
2. Parses new LinkedIn XLS files (checks for new files since last run)
3. Parses new Twitter CSV files
4. Writes all data to SQLite
5. Generates `analytics/reports/daily-report-YYYY-MM-DD.md`
6. Outputs summary to stdout

## Performance Query

Query specific content performance:
```bash
python3 scripts/query_performance.py --post-url "https://www.linkedin.com/feed/update/..."
```

Query keyword ranking:
```bash
python3 scripts/query_performance.py --keyword "factory verification Australia"
```

## Critical Rules

- **GSC data is authoritative for SEO** — do not manually override GSC rankings
- **LinkedIn data is delayed 2 days** — do not report same-day LinkedIn numbers
- **ER calculation uses impressions as denominator** — not reach (LinkedIn may report higher reach than impressions)
- **De-duplicate before storing** — check `post_url` uniqueness on every insert
- **Always store raw data separately** — never normalize in-place; keep original exports for audit

## Files

```
analytics-collector/
├── scripts/
│   ├── collect_daily.sh        # Main orchestrator
│   ├── gsc_collector.py        # GSC API collector
│   ├── linkedin_parser.py      # LinkedIn XLS parser
│   ├── twitter_parser.py       # Twitter CSV parser
│   ├── normalizer.py           # Data normalization
│   ├── report_generator.py     # Daily report MD generator
│   └── query_performance.py    # Ad-hoc queries
├── docs/
│   ├── normalization-schema.md  # Normalized data interface
│   ├── storage-schema.md        # SQLite schema
│   └── platform-fields.md       # Platform field mapping
├── data/                       # SQLite DB (gitignored)
│   └── content_analytics.db
└── SKILL.md
```

## Dependencies

```bash
pip install xlrd pandas sqlite3
# xlrd for reading LinkedIn .xls exports
# pandas for data manipulation
# sqlite3 (built-in)
```
```

---

## 九、关键实现注意事项

### 9.1 LinkedIn XLS vs GSC 数据的一致性问题

进度文件中记录 "ER=33.33%" 的帖子（03/23），实测 XLS 数据为 22.58%。差异原因：

- 进度文件引用了 `Engagement rate (organic)` 列（= 7 / 31 = 22.58%）
- 但进度文件手写时误推算了 CTR = 20.83%，实际 CTR = 5/31 = 16.13%
- XLS 中有 19 列数据，两列 ER 数据（organic / total），容易混淆列索引

**建议**：在 normalizer 中明确指定列名而非列索引，避免类似错误。

### 9.2 LinkedIn 导出 XLS 的真实结构

实测 XLS 包含两个 Sheet：
1. **Metrics** — 每日汇总时序数据，19 列，日期行格式
2. **All posts** — 单帖明细，20 列（含 Content Type 列）

两个 Sheet 数据可交叉验证：Metrics 汇总应 ≈ All posts 总和。

### 9.3 LinkedIn 手动导出的频率

考虑到 LinkedIn 数据延迟 2 天，建议：
- **每周一**导出上周完整数据（覆盖 7 天延迟）
- 配合每日自动解析脚本，每次运行时检查 `social/linkedin-post/analytics/` 目录是否有新文件

### 9.4 GSC API 配额限制

GSC Search Analytics API 限制：
- 每次查询最多 25,000 行
- 每项目每天 quota 无公开限制，但高频请求可能触发限流
- 建议每日收集使用 1-2 次查询（按日期范围 + 按页面维度各一次）

### 9.5 X/Twitter 和 Facebook 的自动化替代方案

| 平台 | 推荐自动化方案 | 难度 |
|------|--------------|------|
| X/Twitter | nitter / FXTwitter 第三方镜像（非官方） | 中等，数据不完整 |
| X/Twitter | 官方 Analytics CSV 导出（手动） | 低，最实用 |
| Facebook | Facebook Graph API (Page Insights) | 高，需 Business 账号 + 审核 |

**现实建议**：目前阶段以 GSC API 全自动 + LinkedIn 手动导出为核心，X/FB 数据收集作为次优级，待业务规模扩大后再投入资源开发 API 集成。

---

## 十、后续开发优先级

| 优先级 | 任务 | 工作量 | 依赖 |
|--------|------|--------|------|
| P0 | GSC API collector 脚本 | 1h | gcloud auth |
| P0 | LinkedIn XLS parser | 2h | xlrd |
| P0 | SQLite schema + 初始化 | 1h | - |
| P0 | 每日报告模板生成器 | 2h | jinja2 |
| P1 | collect_daily.sh 编排脚本 | 1h | P0 全部 |
| P1 | Chrome CDP X/Twitter 数据抓取 | 4h | Task #7 成果 |
| P2 | Facebook Page Insights API | 8h | FB Business 账号 |
| P2 | 查询性能 CLI 工具 | 3h | sqlite3 |
| P3 | 趋势图表生成（ASCII/Mermaid） | 3h | matplotlib |

---

*分析完成 | Task #8 | data-engineer | 2026-04-01*
