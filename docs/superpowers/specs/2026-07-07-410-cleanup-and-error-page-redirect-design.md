# 设计文档：清理"假跳转"为真410 + 错误页5秒自动跳转首页

- **日期**: 2026-07-07
- **状态**: 已确认，待转实现计划
- **作者**: Mark He / Claude
- **影响范围**: `frontend/` — `lib/gone-paths.ts`、`next.config.js`、`proxy.ts`、`app/not-found.tsx`、`app/gone/page.tsx`，新增 1 个组件

---

## 1. 背景与问题

网站已经有一套处理"下架内容"的机制（`lib/gone-paths.ts` 单一注册表，被 `proxy.ts` 和 `app/sitemap.ts` 共用），232 篇文章已经是真 410。

但除此之外，还有一批"跳转"其实是伪装的下架内容：文章被删除后，为了不出现 404，临时把旧网址转到了一个跟原内容毫不相关的通用页面（文章列表页，甚至是另一个同样已经 410 的页面）。这类"假跳转"是 SEO 里的常见反面案例（业内称 soft 404）——Google 会认为原网址"内容还在"，只是排名权重会被转移到一个不相关的页面上，而不是被正确判定为"内容已彻底不存在"。

本次改动目的：把这批"假跳转"改成真 410，让 Google 得到准确信号；同时给 404/410 页面加上 5 秒自动跳转首页的功能，改善用户在踩到失效链接后的体验。

## 2. 需求一：把"假跳转"改成真 410

### 2.1 范围界定（已与用户确认）

网站里的"跳转"分三种性质，本次只处理第一种：

| 类型 | 特征 | 处理方式 |
|---|---|---|
| **内容真下架、转到不相关页面** | 原文章已删除，现转到文章列表页等通用页面，或转到另一个同样已410的页面 | **本次改成 410** |
| **内容搬家/合并，新地址有实际对应内容** | 文章改名、几篇合并成一篇，新网址是真实、具体的替代内容 | 保持 301 不变 |
| **功能性跳转，与内容下架无关** | 客户门户登录跳转等 | 不动 |

### 2.2 具体清单（共 22 个网址）

**A组 — 18 篇文章，现登记在 `lib/gone-paths.ts` 的 `BLOG_REDIRECT_TARGETS` 中，全部指向通用文章列表页 `/article`：**

```
tottenham-hotspur
bunnings-wesfarmers-merger-supply-chain
bbq-galore-retail
australian-retail-trends-grilld-coles
kmart-home-retail
bhp
droneshield
reneweconomy
fitbit-air-sourcing
oura-ring-5-wearable-tech-china-sourcing-guide
007-first-light-sourcing
adam-walton-policy-australian-businesses
australian-business-bankruptcy-2026
road-safety-australia-freight-operations
australia-mining-capital-gains-tax-importers
extreme-weather-supply-chain-risk
kenya-sourcing-destination
dubai-international-airport-australia-china-freight
```

**B组 — 4 条藏在 `next.config.js` 里的"死路跳转"：名义上 301 到一个新地址，但那个新地址自己也早已是 410（301 → 410 的矛盾链条，属于同一类问题，顺带修复）：**

| 旧网址 | 目前 301 到 | 那个地方现状 |
|---|---|---|
| `/china-vs-alibaba` | `/article/china-vs-alibaba` | 已 410 |
| `/china-supplier-verification` | `/article/china-supplier-verification` | 已 410 |
| `/article/byd-company-supply-chain-guide` | `/article/byd-company-china-supply-chain-guide` | 已 410 |
| `/article/electric-battery-supply-chain-china-sourcing-guide` | `/article/electric-battery-china` | 已 410 |

### 2.3 明确不动的（保持 301 不变）

- `lib/gone-paths.ts` 的 `BLOG_REDIRECT_TARGETS` 中另外 5 条（`services-wag`、`resource-how-to-verify-chinese-factories-1688` 等）—— 新地址是具体、真实的替代文章
- `next.config.js` 中另外 20 条文章合并/去重跳转 + 3 条首页锚点跳转（`/#capabilities`、`/#factory-visit`）—— 内容确实搬到了新位置
- `proxy.ts` 中 `/resources/{slug}` 的默认 301 兜底逻辑 —— 这是旧 URL 结构升级，非下架
- 客户门户登录跳转（302）—— 与内容下架无关，动了会导致客户无法登录

### 2.4 实现落点

- **`lib/gone-paths.ts`**：
  - A组 18 条：从 `BLOG_REDIRECT_TARGETS` 移到 `BLOG_GONE_SLUGS`
  - B组中 `byd-company-supply-chain-guide`、`electric-battery-supply-chain-china-sourcing-guide`：直接加入 `BLOG_GONE_SLUGS`（复用现有 `/article/:slug*` 匹配 + `isBlogGoneSlug` 逻辑，无需新代码）
  - B组中 `/china-vs-alibaba`、`/china-supplier-verification`（这两个是没有 `/article/` 前缀的旧式网址）：加入 `GONE_SLUGS` 数组
- **`proxy.ts`**：`matcher` 配置里补充 `/china-vs-alibaba`、`/china-supplier-verification` 这两个具体路径，使 proxy 能拦截到这两个旧式网址（现有 `isGonePath()` 逻辑无需改动，直接复用）
- **`next.config.js`**：删除 B 组对应的 4 条 `redirects()` 规则（否则 next.config 级别的跳转会在 proxy.ts 之前抢先执行，把新加的 410 又"跳"没了——这是 `CLAUDE.md` 里已经记录过的历史 bug 模式，本次要避免重蹈覆辙）
- **`app/sitemap.ts`**：无需改动 —— 该文件已经根据 `BLOG_GONE_SLUGS` 自动排除下架文章，本次新增的条目会自动被排除

## 3. 需求二：404 / 410 页面 5 秒后自动跳转首页

### 3.1 交互设计

- 页面上清楚显示提示文字，数字从 5 跳到 0（实时倒计时，而非一句不动的静态提示）
- 5 秒后自动跳转到首页 `/`
- 倒计时期间，页面原有的按钮（"Back to Home"、"Browse Articles"、"View Services" 等）保持完全可点击，用户可随时提前离开，不必等满 5 秒
- 同时应用于 `app/not-found.tsx`（404）和 `app/gone/page.tsx`（410）两个页面

### 3.2 技术方案

新增一个共享的客户端小组件 `app/components/AutoRedirectCountdown.tsx`：
- 用 `'use client'` + `useEffect` + `setTimeout` 实现倒计时与跳转（`router.push('/')`）
- 两个页面（`not-found.tsx`、`gone/page.tsx`）各自保持服务器端组件不变（`metadata` 导出等 SEO 相关逻辑不受影响），只在页面内引入并渲染这个客户端小组件
- 现有的 `Link` 按钮不需要任何改动，本身就是独立可点击的

**为什么这样做**：404/410 页面的 HTTP 状态码是由服务器（`proxy.ts` 的 rewrite，或 Next.js 对 `not-found.tsx` 的默认处理）在响应头里就已经设置好的，Google 等爬虫读的是这个状态码，不会执行页面里的 JavaScript 跳转。所以加一个客户端倒计时组件，只影响真人用户的浏览体验，不会干扰、也不会削弱本来就该发出的 404/410 信号。

### 3.3 曾考虑但不采用的方案

- **纯 HTML meta-refresh 标签**（零 JS，最简单）：可行，但做不出"5、4、3…"实时跳动的数字，只能是一句不会动的静态文字，用户体验上不如方案一精致，工程量差异也很小，因此不采用。

## 4. 明确不做的事情（YAGNI 边界）

- 不改变任何页面的 HTTP 状态码本身——410/404 该是什么还是什么，倒计时只是叠加在上面的客户端体验层
- 不做"无障碍降级"（比如检测用户开启了减少动画特效的系统设置就取消倒计时）——目前设计里按钮本身就是"提前退出"的入口，已经满足基本的可操作性，除非之后有人反馈需要，否则不额外处理
- 不新增配置项控制倒计时秒数/目标页——5 秒、首页是本次唯一需要的行为，写成固定值，不做成可配置项

## 5. 验收标准

- 名单中 22 个网址访问后返回 HTTP 410（用 `node -e "fetch(...).then(r=>console.log(r.status))"` 逐条验证，而非 301 或 404）
- 明确保留的其余跳转规则（301/302/308）行为不受影响，逐条抽查确认
- 客户门户登录跳转功能不受影响
- 访问 404 页面或 410 页面，5 秒后自动跳转到首页；倒计时期间点击页面原有按钮可正常提前跳转
- `npm run build`、`npm run lint` 通过
- `app/sitemap.ts` 生成结果中不包含本次新下架的 22 个网址

## 6. 风险与回滚

- 本次改动本质是数据/配置调整（数组条目搬移 + 删除几条 redirect 规则），出问题可直接 `git revert`，风险低
- 22 个网址一旦变成 410，此前排向"文章列表页"的那部分权重会彻底消失（不会再转移到任何地方）——这是本次改动有意为之的效果，符合"内容真的没了，不该假装还在"的判断
- 部署后建议对这 22 个网址走一遍 Google Indexing API 批量提交（`CLAUDE.md` 中已有现成脚本），加快 Google 重新抓取、确认新状态码的速度，避免像之前一样在 GSC 里挂着几周的过期状态
