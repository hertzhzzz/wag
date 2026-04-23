# WAG SEO + GEO Automation Workflow

> Data-Driven SEO 工作流 for winningadventure.com.au

## 数据源架构

```
┌─────────────────────────────────────────────────────────────┐
│                    SEO Automation                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ Google       │  │ Google       │  │ Serper.dev     │ │
│  │ Search       │  │ Analytics    │  │ (SERP 竞品)    │ │
│  │ Console      │  │ GA4          │  │                  │ │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘ │
│         │                  │                   │           │
│         ▼                  ▼                   ▼           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Gap Analysis Engine                     │   │
│  │  • 高展示低点击关键词 → 优化 SERP                    │   │
│  │  • 高展示低排名关键词 → 创建内容页                   │   │
│  │  • 高流量高跳失页面 → 优化 UX/内容                   │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                   │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Content Generator                      │   │
│  │  • Blog outline → MDX file                          │   │
│  │  • Keyword-optimized meta tags                     │   │
│  │  • Internal linking suggestions                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 三大数据源

| 数据源 | 用途 | 获取方式 | 免费额度 |
|--------|------|----------|----------|
| **Google Search Console** | 用户实际在搜的关键词、展示量、点击量、CTR、排名 | GSC API | 已配置 |
| **Google Analytics 4** | 用户实际访问的页面、会话数、跳失率、停留时间 | GA4 Data API | 已配置 |
| **Serper.dev** | 免费 SERP API（SERP 竞品分析） | REST API | **2,500次/月** |

### Serper.dev 免费方案配置

1. **注册账号**：https://serper.dev/signup（不需要信用卡）

2. **获取 API Key**：登录后在 Dashboard 复制 API Key

3. **配置方式（二选一）**：

   **方式 A：环境变量**
   ```bash
   export SERPER_API_KEY="你的API Key"
   ```

   **方式 B：配置文件**
   ```json
   // config/serper_config.json
   {
     "api_key": "你的API Key"
   }
   ```

4. **验证**：
   ```bash
   python scripts/seo_workflow.py --mode insight
   ```

### 其他免费 SERP API 备选

| 服务 | 免费额度 | 说明 |
|------|----------|------|
| **Serper.dev** | 2,500次/月 | 推荐，支持地理位置定向 |
| **HasData** | 1,000次 | 新用户赠送，无需信用卡 |
| **SerpBase** | 100次 | $0.30/1K，极低价 |
| **FetchSERP** | 250积分 | 支持关键词搜索量 |
| **Serpstack** | 100次/月 | 速度极快 |

## 快速开始

### 1. 配置 API 凭证

#### Google Search Console (GSC)

已配置服务账号凭证：`~/.claude/gsc-service-account.json`（软链接到 `config/gen-lang-client-0955676066-d044932c35c9.json`）

项目：`gen-lang-client-0955676066`
服务账号邮箱：`wag-439@gen-lang-client-0955676066.iam.gserviceaccount.com`

```json
// config/gsc_config.json
{
  "property_id": "sc-domain:winningadventure.com.au"
}
```

#### Google Analytics 4 (GA4)

已配置 Measurement ID：`G-VEGJ1YL8YR`（在 app/layout.tsx 中）

GA4 Admin Reporting API 使用同一个服务账号（GSC 服务账号已有 Analytics 读取权限）：

```json
// config/ga4_config.json
{
  "property_id": "456789012"
}
```

> **注意**：`property_id` 是 GA4 Property 数字 ID（在 GA4 Admin → Account Settings → Property ID 中查看）

### 2. 安装依赖

```bash
pip install google-api-python-client google-analytics-data

# 或一次性安装
pip install -r scripts/requirements.txt
```

### 3. 运行

```bash
# 完整工作流（差距分析 + 关键词研究 + 报告）
python scripts/seo_workflow.py --mode full

# 差距分析（识别高展示低点击的优化机会）
python scripts/seo_workflow.py --mode insight

# GSC 数据导出
python scripts/seo_workflow.py --mode gsc --output gsc_data.csv

# GA4 数据导出
python scripts/seo_workflow.py --mode ga4 --output ga4_data.csv

# 关键词研究
python scripts/seo_workflow.py --mode research --keywords "sourcing from china,factory audit"

# SEO 分析报告
python scripts/seo_workflow.py --mode analyze --output reports/seo_report_20260422
```

## 模式详解

### `--mode insight` 差距分析

识别三类内容差距：

| 类型 | 筛选条件 | 建议行动 |
|------|----------|----------|
| **CTR Gap** | 排名 ≤ 10 但 CTR < 5% | 优化 SERP 片段（标题+描述） |
| **Ranking Gap** | 排名 > 10 但展示量 > 500 | 创建专门内容页 |
| **Quick Win** | 竞争度 < 30% 且意图明确 | 快速占位 |

### `--mode full` 完整工作流

1. 从 GSC 获取 Top 100 查询
2. 从 GA4 获取 Top 20 页面
3. 识别高展示低点击的关键词（优化机会）
4. 调用 Serper 获取 SERP 竞争数据
5. 生成优先级排序的内容差距报告
6. 输出 Markdown + JSON 报告

### `--mode research` 关键词研究

```
输入: ["sourcing from china", "factory audit"]
  ↓
Serper Search API
  ↓
输出: SERP 结果列表（竞品域名、标题、描述）
```

## 工作流阶段

### Phase 1: SERP 分析

```python
from seo_workflow import SerperClient

client = SerperClient()

# 执行 SERP 分析
results = client.search("sourcing from china", num_results=20)
for r in results:
    print(f"#{r['position']} {r['domain']}: {r['title']}")
```

### Phase 2: 竞品域名分析

```python
# 从 SERP 结果提取竞品域名
competitors = set(r['domain'] for r in results if r.get('domain'))
```

### Phase 3: 博客生成

```python
from blog_generator import BlogGenerator

generator = BlogGenerator()

# 生成内容大纲
outline = generator.generate_outline(
    keyword="sourcing from china to australia",
    search_intent="informational",
    competitors=serp_results,
    content_type="guide"
)

# 生成完整博客
blog = generator.generate_blog(outline)

# 保存到 MDX
path = generator.save_blog(blog)
```

### Phase 5: GEO/AI 可见度分析

```python
# LLM 品牌提及分析
mentions = client.llm_mention_analysis(
    target="winningadventure.com.au",
    platform="chat_gpt"
)

# AI 可见度分数
visibility = client.ai_visibility_score(
    domain="winningadventure.com.au",
    keywords=["sourcing from china", "factory audit"]
)
```

## 定时任务配置

### 使用 launchd (macOS)

创建 `~/Library/LaunchAgents/com.wag.seo-workflow.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.wag.seo-workflow</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>/Users/mark/Projects/wag-frontend/scripts/seo_workflow.py</string>
        <string>--mode</string>
        <string>schedule</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>9</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
</dict>
</plist>
```

加载定时任务：
```bash
launchctl load ~/Library/LaunchAgents/com.wag.seo-workflow.plist
```

### 使用 cron

```bash
# 每天早上 9 点运行
0 9 * * * cd /Users/mark/Projects/wag-frontend && python3 scripts/seo_workflow.py --mode full >> logs/cron.log 2>&1
```

## 报告示例

```markdown
# SEO Report - winningadventure.com.au
Generated: 2026-04-22

## GA4 Performance
- Total Sessions: 12,345
- Avg Bounce Rate: 58.2%
- Top Pages: 5
  - /services: 5,432 sessions
  - /about: 2,123 sessions
  - /resources: 1,876 sessions

## GSC Performance
- Total Impressions: 456,789
- Total Clicks: 8,765
- Avg CTR: 1.92%
- Keywords Ranked: 234

## Content Gaps (20)
- [HIGH] sourcing agent china to australia
  - Intent: informational
  - Action: optimize_title_meta
- [HIGH] factory audit checklist
  - Intent: informational
  - Action: create_content_page

## Recommendations
1. 优化 "sourcing from china" 的 SERP 片段（CTR 1.2% → 目标 3%+）
2. 创建 "factory audit checklist" 专门内容页
3. 改进 /resources 页面 UX（跳失率 72%）
```

## 目录结构

```
wag-frontend/
├── scripts/
│   ├── seo_workflow.py          # 主工作流编排器
│   ├── seo_mcp_client.py        # (已废弃，不再使用)
│   ├── blog_generator.py        # 博客内容生成器
│   └── README.md                # 本文档
├── config/
│   ├── seo_config.json          # SEO 配置
│   ├── gsc_config.json         # GSC 配置
│   ├── gsc_credentials.json    # GSC OAuth 凭证
│   └── ga4_credentials.json   # GA4 服务账号凭证
├── content/blog/                # 生成的博客 MDX
├── public/social/blog/          # 博客配图
├── reports/                     # SEO 报告
│   └── seo_report_YYYYMMDD.{md,json}
└── logs/                        # 日志文件
    └── seo_workflow_YYYYMMDD.log
```

## 故障排除

### GSC 返回空数据

1. 确认 Search Console 中已验证网站所有权
2. 检查 `gsc_config.json` 的 `property_id` 格式
   - 应使用 `sc-domain:example.com` 或 `https://example.com/`

### GA4 认证失败

1. 确认服务账号已在 GA4 Admin 中添加
2. 确认 `property_id` 是数字格式（不是资源名称）

### Serper API 连接失败

1. 确认 `config/serper_config.json` 中有有效的 API Key
2. 或设置环境变量 `SERPER_API_KEY`
3. 检查 API Key 是否还有余额（每月 2,500 次免费）

## 扩展开发

### 添加新的数据源

在 `seo_workflow.py` 中添加新的 Client 类：

```python
class NewDataSourceClient:
    def __init__(self, logger):
        self.logger = logger
        self.config = self._load_config()

    def fetch_data(self, **kwargs) -> list:
        """获取数据方法"""
        # 实现 API 调用
        pass
```

### 添加新的内容类型

在 `blog_generator.py` 的 `_load_templates` 中添加：

```python
"new_type": {
    "structure": "custom",
    "sections": [...],
    "word_count_range": (1000, 2000)
}
```

## 注意事项

1. **禁止 emoji** — 页面内容和代码注释都不能有 emoji
2. **禁止中文** — 页面 UI 内容必须是英文
3. **图片存储** — 博客配图放在 `public/social/blog/{slug}/`
4. **API 配额** — Serper 每月 2,500 次免费，注意监控用量

## 许可

Internal use only - WAG AI Agent
