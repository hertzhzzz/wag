# WAG Content Engine v3 - 进度记录

**创建时间**: 2026-04-01
**状态**: 分析完成，待实现

---

## 项目目标

创建一个自进化的内容生成引擎，服务于 WAG (Winning Adventure Global) 公司的四渠道内容分发：
- LinkedIn Post
- X (Twitter) Post
- Facebook Page Post
- SEO Blog

---

## 核心架构

```
┌─────────────────────────────────────────────────────────────────┐
│                     WAG Content Engine v2.0                      │
│                                                                     │
│   四渠道分发 + 数据闭环自进化                                       │
│                                                                     │
│   ┌───────────────────────────────────────────────────────────┐  │
│   │                 CONTENT GENERATION                       │  │
│   │  话题选择 ──► Socratic确认 ──► 同一核心内容              │  │
│   │  ──► LinkedIn Post / X Post / Facebook Post / SEO Blog   │  │
│   └───────────────────────────────────────────────────────────┘  │
│                               │                                  │
│                               ▼                                  │
│   ┌───────────────────────────────────────────────────────────┐  │
│   │                 DATA COLLECTION                            │  │
│   │  LinkedIn ─► ER/CTR/评论/转发/曝光                        │  │
│   │  X ─► 曝光/互动/点击/转发                                   │  │
│   │  Facebook ─► 曝光/互动/分享/评论                            │  │
│   │  SEO/GSC ─► 排名/点击量/曝光/CTR                          │  │
│   └───────────────────────────────────────────────────────────┘  │
│                               │                                  │
│                               ▼                                  │
│   ┌───────────────────────────────────────────────────────────┐  │
│   │                 SELF-EVOLUTION                            │  │
│   │  数据对比 ──► 发现最优话题/格式/发布时间                    │  │
│   │  规则更新 ──► 优化内容生成参数                              │  │
│   └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 每日闭环流程

```
DAY 0 白天发布 ──► DAY 0 晚收集数据 ──► 当晚出报告 ──►
DAY 1 早间应用规则 ──► DAY 1 新内容生成更优
```

---

## 已确认的 Skills

### 现有 Skills
| Skill | 来源 | 用途 |
|-------|------|------|
| wag-linkedin-post | 本地 | LinkedIn帖子生成 |
| wag-seo-blog | 本地 | SEO博客生成 |
| geo-content | 已安装 | E-E-A-T内容质量分析 |
| geo-technical | 已安装 | 技术SEO |
| baoyu-post-to-wechat | 已安装 | 微信适配 |
| baoyu-post-to-x | 已安装 | X适配 |
| baoyu-article-illustrator | 已安装 | 配图生成 |
| everything-claude-code:article-writing | ECC插件 | 文章写作 |

### 待创建 Skills
- wag-content-hub (主入口)
- x-post (X帖子模板)
- facebook-post (FB帖子模板)
- wag-analytics-collector (数据收集)

---

## 四渠道数据收集方案

### 方案对比

| 渠道 | 免费方案 | Chrome CDP可行 | 推荐度 |
|------|----------|----------------|--------|
| Google Search Console | API直接调用 | 不需要 | ⭐⭐⭐⭐⭐ |
| LinkedIn | 手动导出 / OAuth | ✅ 可行 | ⭐⭐⭐ |
| X/Twitter | FXTwitter / 手动 | ✅ 可行 | ⭐⭐ |
| Facebook | 手动导出 / Page Insights API | ✅ 可行 | ⭐⭐ |

### GSC API (最简单)
```bash
curl -X POST \
  "https://www.googleapis.com/webmasters/v3/sites/sc-domain:winningadventure.com.au/searchAnalytics/query" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{"startDate": "2026-03-25", "endDate": "2026-03-31", "dimensions": ["query"], "rowLimit": 100}'
```

### Chrome CDP 可抓取页面
| 渠道 | URL |
|------|-----|
| LinkedIn | linkedin.com/analytics/ |
| X | x.com/[account]/analytics |
| Facebook | business.facebook.com/.../insights |

---

## baoyu-skills 状态

**URL**: https://github.com/jimliu/baoyu-skills

**未注册到 plugin** - 需要在 settings.json 中添加

---

## 待办事项

- [ ] 将 baoyu-skills 注册到 plugin
- [ ] 创建 wag-content-hub 主入口
- [ ] 创建 x-post skill
- [ ] 创建 facebook-post skill
- [ ] 创建 wag-analytics-collector
- [ ] 创建 weekly-report workflow
- [ ] 创建 performance-rules.md
- [ ] 测试 GSC API

---

## 文件结构 (待创建)

```
/Users/mark/Projects/wag/.claude/content/wag-content-hub/
├── SKILL.md
├── skills/
│   ├── linkedin-post/
│   ├── seo-blog/
│   ├── x-post/
│   ├── facebook-post/
│   └── analytics-collector/
├── workflows/
│   ├── daily-publish.flow
│   ├── weekly-analysis.flow
│   └── self-evolution.flow
├── analytics/
│   ├── performance-rules.md
│   ├── daily-report-YYYY-MM-DD.md
│   └── content-matrix.md
└── evolution/
    └── rule-engine.md
```

---

## 参考数据

### LinkedIn 2026-03 数据
- 总曝光: 125
- 总点击: 7
- 总反应: 11
- 总评论: 0
- 总转发: 0
- 平均ER: 16.48%
- 评论率: 0.00%

### 最佳表现帖子 (2026-03-23)
- 曝光: 31
- ER: 22.58%
- 格式: 3步框架
- Hook: "Before paying any deposit..."

---

## 下次 Session 行动

1. 先创建 wag-content-hub 主入口 skill
2. 将 baoyu-skills 注册到 plugin
3. 创建 wag-analytics-collector skill
4. 测试 GSC API 数据收集
