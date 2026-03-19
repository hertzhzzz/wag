# WAG 网站关键词排名报告

**查询时间:** 2026-02-19 至 2026-03-19
**生成时间:** 2026-03-19
**数据源:** Google Search Console API (REST API)

---

## 概览

| 指标 | 值 |
|------|-----|
| 总 clicks | 2 |
| 总 impressions | ~78 |
| 覆盖页面数 | 4 |
| 覆盖关键词数 | 5 |
| 目标关键词进入前100 | **0** |

---

## 实际目标关键词

| 页面 | 关键词 |
|------|--------|
| Services page | factory visit, supplier sourcing, China procurement |
| Homepage | china sourcing, china sourcing australia |
| Blog | how to import from china, china supplier verification, australia import tips |

---

## 关键词排名 (Query Performance)

| 关键词 | Clicks | Impressions | CTR | 平均排名 |
|--------|--------|-------------|-----|---------|
| exporter | 0 | 1 | 0% | 3 |
| export and import | 0 | 1 | 0% | 5 |
| winning | 0 | 2 | 0% | 4.5 |
| event staffing | 0 | 1 | 0% | 11 |
| exports | 0 | 1 | 0% | 13 |

**目标关键词状态:**

| 关键词 | 状态 |
|--------|------|
| factory visit | ❌ 未进入前100 |
| supplier sourcing | ❌ 未进入前100 |
| China procurement | ❌ 未进入前100 |
| china sourcing | ❌ 未进入前100 |
| how to import from china | ❌ 未进入前100 |
| china supplier verification | ❌ 未进入前100 |
| australia import tips | ❌ 未进入前100 |

---

## 页面表现 (Page Performance)

| 页面 | Clicks | Impressions | CTR | 平均排名 |
|------|--------|-------------|-----|---------|
| https://www.winningadventure.com.au/ | 1 | 31 | 3.2% | 2.3 |
| https://www.winningadventure.com.au/about | 1 | 24 | 4.2% | 2 |
| http://winningadventure.com.au/ | 1 | 4 | 25% | 2.3 |
| http://www.winningadventure.com.au/ | 0 | 14 | 0% | 14.1 |

---

## 问题分析

### 1. 目标关键词完全没有排名
- "epic sourcing", "china direct" 等核心关键词未进入 Google Australia 前100名
- 说明网站内容尚未针对这些关键词进行优化，或外链建设不足

### 2. HTTP/HTTPS 重复内容
- `http://winningadventure.com.au/` 和 `https://www.winningadventure.com.au/` 被分别索引
- 建议设置 301 重定向统一到 HTTPS

### 3. 索引页面过少
- 仅 4 个页面有数据，但 GSC 显示 "7 not indexed"
- 需要提交 sitemap 并修复索引问题

### 4. 仅有 2 次 clicks
- 说明网站几乎没有自然搜索流量
- Phase 10-12 的 SEO 工作尚未产生效果（工作刚完成，Google 需要时间重新抓取和排名）

---

## 下一步建议

1. **修复 HTTP→HTTPS 重定向**
2. **提交 sitemap.xml** 给 Google（如果尚未提交）
3. **检查 robots.txt** 确保允许爬虫抓取重要页面
4. **等待 4-8 周** 让 Phase 10-12 的 SEO 优化生效
5. **Phase 12 建议:** 每月监控关键词排名变化

---

## GSC API 配置记录

成功查询方法:
```bash
gcloud auth application-default login --scopes=cloud-platform,webmasters.readonly
gcloud auth application-default set-quota-project gen-lang-client-0955676066

ACCESS_TOKEN=$(gcloud auth application-default print-access-token)
curl -X POST "https://www.googleapis.com/webmasters/v3/sites/sc-domain:winningadventure.com.au/searchAnalytics/query" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Goog-User-Project: gen-lang-client-0955676066" \
  -d '{"startDate":"2026-02-19","endDate":"2026-03-19","dimensions":["query"],"rowLimit":100}'
```
