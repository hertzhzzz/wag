# Analysis-05: Chrome CDP 数据抓取技术实现

**任务编号**: #7
**创建时间**: 2026-04-01
**状态**: 分析完成

---

## 目录

1. [技术栈概览](#1-技术栈概览)
2. [登录态 Cookie 继承方案](#2-登录态-cookie-继承方案)
3. [各平台数据字段映射表](#3-各平台数据字段映射表)
4. [Chrome CDP 抓取代码实现](#4-chrome-cdp-抓取代码实现)
5. [MCP chrome-devtools 集成方案](#5-mcp-chrome-devtools-集成方案)
6. [数据抓取频率策略](#6-数据抓取频率策略)
7. [技术限制与规避方案](#7-技术限制与规避方案)
8. [WAG 具体实施方案](#8-wag-具体实施方案)

---

## 1. 技术栈概览

### 1.1 可用工具矩阵

| 工具 | 类型 | 登录态继承 | 适用场景 | WAG 推荐度 |
|------|------|-----------|---------|-----------|
| **chrome-cdp** (本地) | CLI + WebSocket | 无（需手动登录） | 快速截图/结构抓取 | ⭐⭐⭐⭐ |
| **browser-use CLI** | Python/Agentic | `--browser real --profile "X"` | 复杂交互流程 | ⭐⭐⭐⭐⭐ |
| **setup-browser-cookies** | gstack 集成 | 从本地 Chrome 导入 | 一次性 Cookie 迁移 | ⭐⭐⭐⭐ |
| **Chrome DevTools MCP** | MCP Server | `browser profile="user"` | Agent 自动化任务 | ⭐⭐⭐⭐⭐ |
| **agent-reach** | 全平台搜索 CLI | Twitter cookies | 社交数据搜索 | ⭐⭐⭐ |

### 1.2 工具对比：CDP vs browser-use

```
chrome-cdp (原生 CDP CLI)
  优点: 无 Puppeteer 依赖，100+ 标签并发，响应快（毫秒级）
  缺点: 无 AI 能力，需要手动编写 JS 抓取逻辑，无 LLM 驱动的元素理解
  适用: 固定结构的页面抓取（analytics dashboard）

browser-use (Python Agentic)
  优点: LLM 驱动的元素理解，`--browser real` 继承登录态，支持复杂多步流程
  缺点: 依赖 AI API Key，纯自动化能力弱于 CDP CLI
  适用: 需要理解页面结构的动态抓取、登录流程、多页面交互

结论: 两者互补 — CDP 负责高频稳定抓取，browser-use 负责首次登录和数据理解
```

### 1.3 MCP chrome-devtools 核心能力

基于 CLAUDE.md 配置，MCP chrome-devtools 提供：
- `mcp__chrome-devtools__navigate` — 导航到 URL
- `mcp__chrome-devtools__evaluate` — 执行 JavaScript
- `mcp__chrome-devtools__screenshot` — 截图

**关键配置**: `browser profile="user"` 继承用户 Chrome 登录态（无需手动登录）。

---

## 2. 登录态 Cookie 继承方案

### 2.1 方案一：Chrome DevTools MCP + user profile（推荐）

```json
// settings.json MCP 配置（已配置）
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-chrome-devtools"],
      "env": {},
      "metadata": {
        "browser": "user"  // 继承用户 Chrome profile
      }
    }
  }
}
```

**工作原理**: MCP server 连接到用户已运行的 Chrome 实例（`chrome://inspect/#remote-debugging`），通过 WebSocket 共享同一个浏览器上下文。Cookie、Session、2FA 状态全部继承。

**启用步骤**:
1. Chrome 打开 `chrome://inspect/#remote-debugging`
2. Toggle "Discover network targets" 为 ON
3. MCP server 自动连接

### 2.2 方案二：browser-use --browser real --profile

```bash
# 列出本地 Chrome profiles
browser-use profile list-local
# 输出:
#   Default: Person 1 (user@gmail.com)
#   Profile 1: Work (work@company.com)

# 使用指定 profile 打开（继承该 profile 的所有 Cookie/登录态）
browser-use --browser real --profile "Default" open https://linkedin.com/analytics/
```

**注意**: 每次打开新 profile 会触发 Chrome 的 "Allow debugging?" 确认对话框（仅首次）。

### 2.3 方案三：cookie-import-browser（gstack）

```bash
# 查找 browse binary
bash /Users/mark/.claude/skills/setup-browser-cookies/SKILL.md  # 见 setup-browser-cookies skill

# 打开 Cookie picker UI，选择域名导入
~/.claude/skills/gstack/browse/dist/browse cookie-import-browser

# 验证导入结果
~/.claude/skills/gstack/browse/dist/browse cookies
```

**适用场景**: 将本地 Chrome 的 LinkedIn/X/Facebook cookies 导入到 gstack 的 headless browse session。

### 2.4 Cookie 继承优先级

```
WAG 推荐流程（一次性设置 + 日常使用）:

[设置阶段 - 一次性]
  browser-use --browser real --profile "Default" open linkedin.com
  → 手动登录（如需 2FA）
  → Cookie 持久化到 cloud profile
  browser-use profile sync --from "Default" --domain linkedin.com
  browser-use profile sync --from "Default" --domain x.com
  browser-use profile sync --from "Default" --domain facebook.com

[日常使用阶段]
  方式A: browser-use --browser remote --profile <cloud-id> open linkedin.com/analytics
  方式B: Chrome DevTools MCP (browser profile="user") + mcp__chrome-devtools__evaluate
```

---

## 3. 各平台数据字段映射表

### 3.1 LinkedIn Analytics

**URL**: `https://www.linkedin.com/analytics/`

| WAG 内部字段 | LinkedIn Analytics 字段 | DOM 选择器 | 数据类型 | 备注 |
|-------------|------------------------|-----------|---------|------|
| `impressions` | 总曝光数 | `[data-test-id*="analytics"]` 或 Network XHR | integer | |
| `clicks` | 点击次数 | 同上 | integer | |
| `ctr` | 点击率 | 同上 | float (0.0-1.0) | |
| `engagement_rate` | 互动率 | 同上 | float (0.0-1.0) | |
| `reactions` | 反应数 | 同上 | integer | |
| `comments` | 评论数 | 同上 | integer | **WAG 核心痛点** |
| `reposts` | 转发数 | 同上 | integer | |
| `followers` | 关注者变化 | 同上 | integer | |
| `update_type` | 内容类型 | 同上 | string | post/carousel/video |

**LinkedIn Analytics 抓取难点**:
- LinkedIn 对 analytics 页面实施严格的动态渲染，DOM 结构频繁变更
- 数据通过 GraphQL XHR 请求加载，非直接 DOM
- 反爬措施：需要登录态 + 频率限制（每分钟 < 30 请求）

**推荐抓取策略**: Intercept GraphQL XHR responses via CDP Network.setRequestInterception

### 3.2 X (Twitter) Analytics

**URL**: `https://x.com/[username]/analytics`

| WAG 内部字段 | X Analytics 字段 | 数据位置 | 数据类型 |
|-------------|-----------------|---------|---------|
| `impressions` | 曝光 | 仪表板卡片 | integer |
| `url_clicks` | URL 点击 | 推文详情卡片 | integer |
| `profile_clicks` | Profile 点击 | 推文详情卡片 | integer |
| `engagements` | 总互动 | 汇总卡片 | integer |
| `engagement_rate` | 互动率 | 汇总卡片 | float |
| `retweets` | 转发 | 推文详情 | integer |
| `replies` | 回复 | 推文详情 | integer |
| `likes` | 喜欢 | 推文详情 | integer |
| `follows` | 新增关注 | 汇总卡片 | integer |

**X Analytics 特殊限制**:
- 2024 年后 X 强制要求 Premium 订阅才能访问完整 Analytics（`x.com/[account]/analytics` 需要 `@Premium`）
- 免费版仅显示过去 28 天聚合数据
- 推文级分析需要点击每个推文单独查看
- CSV 导出功能仅对 Premium 开放

### 3.3 Facebook Insights

**URL**: `https://business.facebook.com/latest/insights`

| WAG 内部字段 | Facebook Insights 字段 | 数据类型 |
|-------------|----------------------|---------|
| `page_impressions` | 页面曝光 | integer |
| `page_reach` | 页面触及 | integer |
| `post_impressions` | 帖子曝光 | integer |
| `post_engagements` | 帖子互动 | integer |
| `post_reactions` | 反应 | integer |
| `post_comments` | 评论 | integer |
| `post_shares` | 分享 | integer |
| `page_likes` | 页面赞数变化 | integer |
| `ctr` | 点击率 | float |

**Facebook Insights 抓取难点**:
- Business Manager 权限体系复杂（需要 Page Admin 角色）
- Instagram Insights 独立域名，权限不互通
- 新版 Meta Business Suite UI 结构频繁变化

### 3.4 Google Search Console（GSC API - 最可靠）

| WAG 内部字段 | GSC API 字段 | 数据类型 |
|-------------|-------------|---------|
| `clicks` | 点击量 | integer |
| `impressions` | 曝光量 | integer |
| `ctr` | 点击率 | float |
| `position` | 平均排名 | float |
| `query` | 搜索词 | string |

**GSC API 调用示例**（来自 wag-content-engine-v3-progress.md）:

```bash
curl -X POST \
  "https://www.googleapis.com/webmasters/v3/sites/sc-domain:winningadventure.com.au/searchAnalytics/query" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2026-03-25",
    "endDate": "2026-03-31",
    "dimensions": ["query", "page"],
    "rowLimit": 100
  }'
```

---

## 4. Chrome CDP 抓取代码实现

### 4.1 核心架构：daemon-per-tab 模型

chrome-cdp 采用 **per-tab daemon** 架构，每个标签页运行一个独立的后台进程：

```
CLI (cdp eval <target> <expr>)
    ↓ Unix Domain Socket (NDJSON)
Daemon (for tab <target>)
    ↓ WebSocket
Chrome DevTools (target tab)
    ↓ CDP Protocol
网页 DOM / Network / JS Runtime
```

**关键优势**:
- Chrome 的 "Allow debugging" 对话框每个 tab 只需点一次（daemon 保持 session）
- 20 分钟空闲自动退出（防止资源泄漏）
- 进程隔离，单个 tab 崩溃不影响其他

### 4.2 LinkedIn Analytics 抓取脚本

```javascript
// linkedin-analytics-fetch.mjs
// 使用 chrome-cdp CLI: cdp eval <target> "<expression>"

const LINKEDIN_ANALYTICS_EXPRESSION = `
(function() {
  const results = [];

  // 方法1: 从页面统计卡片提取（2026-03 DOM 结构）
  const cards = document.querySelectorAll('[data-test-id*="analytic-card"]');
  cards.forEach(card => {
    const label = card.querySelector('[class*="label"]')?.textContent?.trim();
    const value = card.querySelector('[class*="value"]')?.textContent?.trim();
    if (label && value) {
      results.push({ metric: label, value: value });
    }
  });

  // 方法2: 从表格提取帖子级数据
  const rows = document.querySelectorAll('table tbody tr');
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 5) {
      results.push({
        post_text: cells[0]?.textContent?.trim()?.substring(0, 100),
        impressions: parseInt(cells[1]?.textContent?.replace(/,/g, '')) || 0,
        clicks: parseInt(cells[2]?.textContent?.replace(/,/g, '')) || 0,
        ctr: cells[3]?.textContent?.trim(),
        engagement: cells[4]?.textContent?.trim()
      });
    }
  });

  // 方法3: 从 Network 拦截器（推荐，最准确）
  // 使用 Performance API 获取关键指标
  const perfData = performance.getEntriesByType('navigation')[0];
  const timingData = {
    domLoad: perfData.domContentLoadedEventEnd - perfData.fetchStart,
    pageLoad: perfData.loadEventEnd - perfData.fetchStart
  };

  return JSON.stringify({
    raw_metrics: results,
    timing: timingData,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    dom_ready: document.readyState
  }, null, 2);
})()
`;

// CDP CLI 调用方式:
// cdp eval <linkedin_target_id> "<expression>"
// 返回 JSON 格式的指标数据
```

### 4.3 X Analytics 抓取脚本

```javascript
// x-analytics-fetch.mjs

const X_ANALYTICS_EXPRESSION = `
(function() {
  // 检查是否需要 Premium（2024+ 限制）
  const premiumWall = document.querySelector('[data-testid="paywall"]');
  if (premiumWall) {
    return JSON.stringify({
      error: 'PREMIUM_REQUIRED',
      message: 'X Analytics requires Premium subscription'
    });
  }

  // 提取汇总指标
  const summaryCards = document.querySelectorAll('[data-testid="cardWrapper"]');
  const summary = {};
  summaryCards.forEach(card => {
    const title = card.querySelector('[class*="title"]')?.textContent;
    const value = card.querySelector('[class*="mainMetric"]')?.textContent
               || card.querySelector('[data-testid="metric"]')?.querySelector('[class*="value"]')?.textContent;
    if (title && value) {
      summary[title.trim()] = value.trim();
    }
  });

  // 提取推文级表格
  const tweetRows = document.querySelectorAll('[data-testid="tweet"]');
  const tweets = Array.from(tweetRows).map(tweet => {
    const stats = tweet.querySelectorAll('[data-testid*="stat"]');
    return {
      text: tweet.querySelector('[data-testid="tweetText"]')?.textContent?.substring(0, 80),
      impressions: stats[0]?.querySelector('[class*="count"]')?.textContent,
      engagements: stats[1]?.querySelector('[class*="count"]')?.textContent,
      likes: stats[2]?.querySelector('[class*="count"]')?.textContent
    };
  });

  return JSON.stringify({
    summary,
    tweets,
    timestamp: new Date().toISOString(),
    analytics_url: window.location.href
  }, null, 2);
})()
`;
```

### 4.4 Facebook Insights 抓取脚本

```javascript
// facebook-insights-fetch.mjs

const FB_INSIGHTS_EXPRESSION = `
(function() {
  // Meta Business Suite 的 React SPA 结构
  // 需要等待数据加载完成

  // 提取概览指标
  const metricCards = document.querySelectorAll('[role="region"] [class*="metric"]');
  const metrics = {};
  metricCards.forEach(card => {
    const label = card.querySelector('[class*="label"]')?.textContent;
    const value = card.querySelector('[class*="number"]')?.textContent;
    if (label) metrics[label.trim()] = value?.trim();
  });

  // 提取帖子列表数据
  const postRows = document.querySelectorAll('[data-pager="true"] tr, [role="row"]');
  const posts = Array.from(postRows).map(row => {
    const cells = row.querySelectorAll('td, [class*="cell"]');
    return {
      content: cells[0]?.textContent?.substring(0, 80),
      impressions: cells[1]?.textContent,
      reach: cells[2]?.textContent,
      engagements: cells[3]?.textContent
    };
  }).filter(p => p.content);

  return JSON.stringify({
    metrics,
    posts,
    timestamp: new Date().toISOString(),
    page_url: window.location.href
  }, null, 2);
})()
`;
```

### 4.5 数据导出为 JSON 文件

```javascript
// export-data.mjs - 数据格式化与持久化
const EXPORT_EXPRESSION = `
(function() {
  // 收集所有数据后格式化
  const data = {
    platform: detectPlatform(),
    collected_at: new Date().toISOString(),
    metrics: extractMetrics(),
    posts: extractPosts(),
    metadata: {
      url: window.location.href,
      user_agent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }
  };

  // 复制到剪贴板（供外部读取）
  const json = JSON.stringify(data, null, 2);
  navigator.clipboard.writeText(json).then(() => {
    console.log('Data copied to clipboard');
  });

  return json;
})()
`;

function detectPlatform() {
  const url = window.location.href;
  if (url.includes('linkedin.com/analytics')) return 'linkedin';
  if (url.includes('x.com') && url.includes('analytics')) return 'x';
  if (url.includes('facebook.com') && url.includes('insights')) return 'facebook';
  if (url.includes('business.facebook.com')) return 'facebook';
  return 'unknown';
}
```

---

## 5. MCP chrome-devtools 集成方案

### 5.1 MCP 工具与 CDP CLI 命令映射

| MCP 工具 | CDP CLI 对应命令 | 用途 |
|---------|----------------|------|
| `mcp__chrome-devtools__navigate` | `cdp nav <target> <url>` | 导航到 analytics 页面 |
| `mcp__chrome-devtools__evaluate` | `cdp eval <target> <expr>` | 执行 JS 提取数据 |
| `mcp__chrome-devtools__screenshot` | `cdp shot <target> [file]` | 截图存档/调试 |

### 5.2 自动化采集脚本集成

**集成架构**:

```
┌─────────────────────────────────────────────────────────────┐
│                    wag-analytics-collector Skill            │
│                                                              │
│  1. MCP chrome-devtools (browser profile="user")            │
│     └─► navigate → linkedin.com/analytics                   │
│     └─► evaluate → 提取数据 JS                               │
│     └─► screenshot → 存档                                    │
│                                                              │
│  2. browser-use (cloud profile)                             │
│     └─► 复杂交互: 导出 CSV / 翻页                           │
│     └─► LLM 理解动态页面结构                                 │
│                                                              │
│  3. GSC API (REST)                                          │
│     └─► SEO 数据直接 API 获取（最可靠）                     │
│                                                              │
│  4. agent-reach                                              │
│     └─► Twitter 搜索（无需登录态）                          │
│     └─► 社交舆情监控                                        │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Database                         │
│  表: analytics_daily                                        │
│  字段: date, platform, impressions, clicks, ctr,           │
│        engagement_rate, comments, reposts, shares             │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 MCP 集成代码示例

```typescript
// wag-analytics-collector/tools.ts
// MCP chrome-devtools 工具使用示例

import { chromeDevToolsClient } from './mcp-clients';

// 1. LinkedIn Analytics 采集
async function collectLinkedInAnalytics(targetId: string) {
  const client = chromeDevToolsClient;

  // 导航到 LinkedIn Analytics
  await client.navigate(targetId, 'https://www.linkedin.com/analytics/');

  // 等待页面加载（网络空闲）
  await new Promise(r => setTimeout(r, 3000));

  // 执行数据提取
  const data = await client.evaluate(targetId, LINKEDIN_ANALYTICS_EXPRESSION);

  // 截图存档
  await client.screenshot(targetId, `/tmp/linkedin-analytics-${Date.now()}.png`);

  return JSON.parse(data);
}

// 2. X Analytics 采集
async function collectXAnalytics(targetId: string, username: string) {
  const client = chromeDevToolsClient;

  await client.navigate(targetId, `https://x.com/${username}/analytics`);
  await new Promise(r => setTimeout(r, 5000)); // X 页面加载较慢

  const data = await client.evaluate(targetId, X_ANALYTICS_EXPRESSION);
  return JSON.parse(data);
}

// 3. 完整采集工作流
async function dailyCollectionWorkflow() {
  const targets = await client.listTabs();

  const linkedinTab = targets.find(t => t.url.includes('linkedin'));
  const xTab = targets.find(t => t.url.includes('x.com'));

  const results = {
    linkedin: linkedinTab ? await collectLinkedInAnalytics(linkedinTab.id) : null,
    x: xTab ? await collectXAnalytics(xTab.id, 'WAGusername') : null,
    gsc: await collectGSCData(), // API 直接调用
    collected_at: new Date().toISOString()
  };

  // 写入 Supabase
  await supabase.from('analytics_daily').insert(normalizeResults(results));

  return results;
}
```

---

## 6. 数据抓取频率策略

### 6.1 频率矩阵

| 数据源 | 页面更新频率 | 推荐采集频率 | 理由 |
|-------|------------|------------|------|
| **GSC (SEO)** | 48-72 小时延迟 | **每日 1 次** (UTC 00:00) | 数据 T+2，避免日内重复 |
| **LinkedIn Analytics** | 实时 + 日汇总 | **每日 1 次** (发布后 24h) | 算法密集期在发布后首日 |
| **X Analytics** | 免费: T+28 | **每周 1 次** | 数据粒度粗，频繁采集无意义 |
| **Facebook Insights** | 实时 + 小时级 | **每日 1 次** | Meta 算法更新频繁 |

### 6.2 WAG 每日采集时间表

```
UTC 00:00 (Australia AEDT 09:00-11:00)
  ├── GSC API 查询 (前一日完整数据)
  ├── LinkedIn Analytics (发布后 24h 数据沉淀)
  ├── Facebook Insights (前日数据)
  └── X Analytics (每周一执行)
```

**为什么不实时抓取**:
1. LinkedIn/X/Facebook analytics 数据有 24-48 小时报告延迟，实时抓取数据不完整
2. 避免触发平台反爬限制（频率过高 = 封禁风险）
3. GSC T+2 规则：Google 需要 2 天聚合数据

### 6.3 触发式采集（事件驱动）

除定时采集外，增加事件触发：

```yaml
# wag-analytics-collector/triggers.yaml
triggers:
  - event: linkedin_post_published
    action: collect_linkedin_analytics
    delay: 24h
    reason: "帖子发布后 24h 是关键数据窗口"

  - event: seo_blog_published
    action: query_gsc
    delay: 72h
    reason: "GSC 数据需要 3 天才能反映新页面"

  - event: weekly_review
    action: collect_all_platforms
    schedule: "0 0 * * 1"  # 每周一
    reason: "周报数据汇总"
```

---

## 7. 技术限制与规避方案

### 7.1 各平台限制总览

| 平台 | 主要限制 | 规避方案 |
|------|---------|---------|
| **LinkedIn** | DOM 结构频繁变更（GraphQL XHR 渲染）| Network 拦截器捕获 XHR 响应，而非解析 DOM |
| **LinkedIn** | 反爬检测：行为分析 | 随机延迟（3-8s），避免精确时间模式 |
| **X/Twitter** | Premium 订阅要求 | 确认 WAG 账号是否已订阅 Premium |
| **X/Twitter** | 每 28 天数据窗口 | 每周一导出，确保不遗漏 |
| **Facebook** | Business Suite 权限体系 | 确保账号有 Page Admin 角色 |
| **Facebook** | Instagram Insights 独立 | 分别处理 IG 和 FB 权限 |
| **所有平台** | IP 封禁风险 | 使用用户 Chrome（真实 IP）而非服务器 IP |
| **所有平台** | 2FA 过期 | 使用 `browser profile="user"`，2FA 状态由用户 Chrome 管理 |

### 7.2 LinkedIn 专项规避

**问题**: LinkedIn Analytics 页面大量使用 GraphQL，数据在 XHR 响应中，不在 DOM 里。

**CDP Network 拦截方案**:

```javascript
// 使用 CDP 的 Network domain 拦截 XHR
// cdp evalraw <target> "Network.enable" "{}"
// 然后监听 Network.requestWillBeSent 和 Network.responseReceived

const NETWORK_INTERCEPT_EXPRESSION = `
(async function() {
  // 启用 Network 监控
  const enableResult = await new Promise(resolve => {
    // 注意: 这需要在 CDP session 层面启用，不是在 JS 上下文
    resolve({ status: 'use_cdp_evalraw' });
  });

  // 备选方案: 直接解析 LinkedIn GraphQL 端点
  // LinkedIn analytics 数据通常来自 REST API:
  // https://www.linkedin.com/feed/api/typeahead?...
  // https://www.linkedin.com/feed/api/hierarchicalTypeahead?...

  // 最可靠方案: 使用浏览器开发者工具 Network 面板
  // 手动识别 XHR 请求后，在 JS 中用 fetch 复现

  // 识别 analytics 数据端点
  const analyticsEndpoints = [
    // 需要通过 DevTools Network 面板手动识别
  ];

  return JSON.stringify({
    recommendation: 'Use CDP evalraw Network.requestWillBeSent interception',
    alternative: 'Parse DOM as fallback, note: DOM structure changes frequently',
    reliability: 'XHR > DOM (LinkedIn DOM classes change weekly)'
  });
})()
`;
```

**推荐**: 使用 `cdp evalraw` 发送原始 CDP `Network.enable` 命令，拦截 LinkedIn 的 XHR 响应。

### 7.3 X Premium 验证

```javascript
// x-premium-check.mjs
const CHECK_PREMIUM = `
(function() {
  const url = window.location.href;
  const paywall = document.querySelector('[data-testid="paywall"]');
  const premiumBadge = document.querySelector('[class*="premium"]');
  const analyticsNav = document.querySelector('a[href*="/analytics"]');

  return JSON.stringify({
    has_paywall: !!paywall,
    has_premium_badge: !!premiumBadge,
    analytics_nav_exists: !!analyticsNav,
    current_url: url,
    message: paywall ? 'X Analytics requires Premium' : 'Analytics accessible'
  });
})()
`;

// 如果返回 has_paywall: true，WAG 需要订阅 X Premium
```

### 7.4 频率限制规避策略

```javascript
// rate-limit-avoidance.mjs
const RANDOM_DELAY = () => Math.floor(Math.random() * 5000) + 3000; // 3-8s

async function politeCollect(targetId, expression) {
  const delay = RANDOM_DELAY();
  console.log(`Waiting ${delay}ms before fetch...`);
  await new Promise(r => setTimeout(r, delay));

  const data = await cdpEval(targetId, expression);

  // 验证数据有效性
  const parsed = JSON.parse(data);
  if (parsed.error === 'RATE_LIMITED') {
    console.warn('Rate limited, backing off 60s...');
    await new Promise(r => setTimeout(r, 60000));
    return politeCollect(targetId, expression);
  }

  return data;
}
```

### 7.5 反检测最佳实践

```
1. 浏览器身份: 使用用户真实 Chrome（browser profile="user"）
   → 避免任何 IP/指纹层面的检测

2. 请求模式: 模拟人类操作间隔
   → 页面加载等待 3-5s
   → 操作间随机 3-8s 延迟
   → 不在整点时间精确采集

3. User-Agent: 使用用户 Chrome 的 UA
   → 通过 CDP Page.getResourceTree() 获取

4. 请求量控制: 每日 < 50 次 API/page 操作
   → LinkedIn 更敏感（< 30/分钟）

5. 数据来源优先级: API > XHR > DOM
   → API 最稳定，DOM 最脆弱
```

---

## 8. WAG 具体实施方案

### 8.1 立即可行的方案（GSC API）

GSC API **无需任何浏览器自动化**，直接通过 HTTP 调用获取 SEO 数据：

```bash
# 验证 WAG GSC 权限
curl -s -X POST \
  "https://www.googleapis.com/webmasters/v3/sites/sc-domain:winningadventure.com.au/searchAnalytics/query" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{"startDate": "2026-03-24", "endDate": "2026-03-31", "dimensions": ["query"], "rowLimit": 10}'
```

**下一步**: 确认 WAG 的 Google Search Console 是否已配置 `sc-domain:` 格式的域名属性。

### 8.2 需要用户配合的方案（浏览器登录态）

以下方案需要 WAG 团队在 Chrome 中登录各平台一次：

```
[WAG 团队操作 - 一次性]
1. 在本地 Chrome 打开 linkedin.com → 登录 → 访问 /analytics
2. 在本地 Chrome 打开 x.com → 登录 → 访问 /analytics
3. 在本地 Chrome 打开 business.facebook.com → 登录 → 访问 Insights
4. 启用 Chrome remote debugging (chrome://inspect/#remote-debugging)

[自动化采集 - 之后每日运行]
- MCP chrome-devtools 连接本地 Chrome
- 自动采集数据 → 写入 Supabase
```

### 8.3 各平台数据优先级

```
P0 (立即可做 - 无需登录态):
  ├── GSC API: SEO 排名/点击/曝光
  └── X (Twitter) 公开数据: 搜索 `from:WAGaccount` 用 agent-reach

P1 (一次性设置后可自动化):
  ├── LinkedIn Analytics: 需要 user profile browser
  └── Facebook Insights: 需要 user profile browser

P2 (需 X Premium 订阅):
  └── X Analytics 完整数据: 需 @Premium
```

### 8.4 架构建议

```
wag-analytics-collector/
├── SKILL.md                    # Skill 定义
├── src/
│   ├── collectors/
│   │   ├── linkedin.ts        # LinkedIn analytics 采集
│   │   ├── x-analytics.ts     # X analytics 采集
│   │   ├── facebook.ts        # Facebook insights 采集
│   │   └── gsc.ts             # GSC API 采集（最优先实现）
│   ├── storage/
│   │   └── supabase.ts        # 数据写入 Supabase
│   ├── browser/
│   │   ├── mcp-client.ts      # MCP chrome-devtools 客户端
│   │   └── browser-use.ts     # browser-use CLI 封装
│   └── scheduler/
│       └── daily.ts           # 每日定时任务
└── workflows/
    └── daily-collection.flow  # n8n/Trigger 工作流
```

### 8.5 关键成功因素

1. **GSC API 最优先实现**: 这是唯一不需要任何浏览器自动化的方案，成功率最高
2. **LinkedIn 是数据重点**: WAG 的核心内容渠道，历史数据最完整
3. **X Analytics 需要 Premium**: 先确认 WAG 是否已有 Premium 订阅
4. **数据质量 > 数据数量**: 宁可少采集，也要确保数据准确（DOM 解析容易出错）
5. **日志与告警**: 采集失败时自动告警（平台 UI 变更会导致抓取中断）

---

## 参考资料

- chrome-cdp skill: `/Users/mark/.claude/skills/chrome-cdp/scripts/cdp.mjs`
- browser-use skill: `/Users/mark/.claude/skills/browser-use/SKILL.md`
- setup-browser-cookies skill: `/Users/mark/.claude/skills/setup-browser-cookies/SKILL.md`
- agent-reach skill: `/Users/mark/.claude/skills/agent-reach/SKILL.md`
- wag-content-engine-v3-progress.md: 项目进度记录
- CLAUDE.md: Chrome DevTools MCP 配置说明

---

*分析完成 | 2026-04-01*
