# WAG 站内 SEO 收敛重构设计

**日期：** 2026-07-02

**状态：** 已确认

**执行周期：** 4 周改造，随后观察 90 天

**最终目标：** 第 6 个月稳定获得每月 8–10 条合格询盘

## 1. 业务目标

SEO 的唯一最终目标是真实询盘，不是文章数量、展示量或第三方评分。

一条合格询盘必须同时满足：

- 客户是澳大利亚高净值人士或中小企业主；
- 预计订单规模为 A$50,000–100,000；
- 计划在 6 个月内启动；
- 首次成交优先为供应商验证或工厂审核，后续争取升级为长期采购合作。

## 2. 已确认范围

### 包含

- 只优化英文 `en-AU` 页面；
- 重新评估用户提供的关键词清单，并结合 GSC、GA4、Bing 和页面搜索意图重新映射；
- 优化首页、Services、3 个服务页、5 个城市页、5 个行业页、About、Enquiry 和 Factory Directory；
- 调整 metadata、H1/H2、正文、FAQ、CTA、内链和页面结构；
- 治理现有文章：保留、合并、301、noindex 或 410；
- 必要时新建少量固定商业落地页；
- 修复询盘统计和发布后的数据闭环。

### 不包含

- 不生成新博客文章；
- 不做 GBP、客户评价、外链、目录会员或其他站外工作；
- 不公开价格；
- 不优化中文关键词或建立中文索引页面；
- 不处理尚未上线的 `/factory/[slug]` 工厂详情页；
- 不依赖新增工厂照片、视频或现场素材；
- 工厂数据库只允许用于汇总统计，不公开单个工厂记录。

## 3. 当前数据基线

2026-07-02 已通过 API 验证：

- **GSC：** 服务账号拥有 `sc-domain:winningadventure.com.au` Owner 权限；过去 28 天查询结果约 12 次点击、3,654 次展示；首页已提交并收录，抓取、robots 和 canonical 正常。
- **GA4：** Property `526384627` 可正常读取；过去 28 天有 270 次自然搜索会话、220 位用户和 687 次浏览。
- **Bing Webmaster：** API key 有效；站点、搜索流量、抓取和 sitemap 数据均可读取；最近 30 天约 32 次点击、1,163 次展示。
- **Sitemap：** Google 与 Bing 均成功读取 37 个 URL，无 sitemap 错误。
- **真实询盘：** 过去 90 天为 0，包含表单、电话、直接邮件、LinkedIn 和 WhatsApp。

当前流量主要来自低采购意图的历史趋势内容。Bing 仍显示约 307 个索引页面，并报告较多旧 URL 的 4xx、robots 屏蔽和抓取错误。这些数据包含迁移与清理的滞后，不代表当前 sitemap 有 307 个有效页面。

GA4 当前把 275 次 `generate_lead` 记为关键事件，但实际询盘为 0；另有 39 次 `form_submit`。现有转化数据不能用于判断 SEO 成效。

## 4. 核心策略

采用“收入优先的收敛重构”：

1. 先修复转化统计，建立可信基线；
2. 一个搜索意图只指定一个主页面；
3. 优先提升供应商验证和工厂审核页面；
4. 用一个固定页面承接工厂考察与商务行程词；
5. 用首页、Services 和现有进口指南承接宽泛采购与进口词；
6. 清理重复、偏题和无商业价值的历史内容；
7. 接受短期展示量下降，换取更高的采购相关性和询盘质量。

商业优先级固定为：

1. Supplier verification / factory audit；
2. China factory visits / business tours；
3. China sourcing agent / importing from China。

## 5. 页面归属

| 主页面 | 主要任务 | 代表关键词 |
|---|---|---|
| `/supplier-verification` | 获取供应商验证询盘 | supplier verification、china supplier verification、verify supplier china australia、how to verify a Chinese company |
| `/factory-audit-china` | 获取现场审核询盘 | factory audit China、Chinese factory verification、factory audit service |
| 新建 `/china-factory-tours` | 获取工厂考察和商务行程询盘 | china factory visit、china factory tour、china business tours、china sourcing tour、china factory visit agent |
| `/` | 解释 WAG 定位并承接宽泛商业词 | china sourcing、china sourcing agent Australia、sourcing agent in Australia |
| `/services` | 比较和选择服务 | china sourcing services、china sourcing solutions、manufacturing sourcing agent |
| 现有进口指南 | 获取进口流程流量并导向服务 | how to import from China to Australia、importing goods from China、importing from China costs |
| 5 个城市页 | 承接明确地域意图 | sourcing company Brisbane、China sourcing agent near me 等地域组合 |
| 5 个行业页 | 承接明确行业意图 | battery sourcing、automotive sourcing、mining equipment from China to Australia |

关键词清单只是评估输入，不是必须全部使用的词库。`BYD supply chain`、`Kmart suppliers`、泛运价和趋势型 low-cost sourcing 等词，只有在与 WAG 服务及现有页面高度匹配时才保留。

## 6. 页面统一组件

每个商业页面必须包含：

1. 唯一且清楚的 title、description 和 H1；
2. 首屏直接说明服务对象、问题和结果；
3. 清晰的服务流程与交付物；
4. 可公开的业务证据或工厂数据库汇总数据；
5. 回答购买疑虑的 FAQ；
6. 指向相关服务、城市、行业或指南的上下文内链；
7. 与搜索意图匹配的 CTA。

CTA 按页面意图变化：

- 验证页面：`Request a Supplier Verification Quote`；
- 审核页面：`Request a Factory Audit`；
- 考察页面：`Plan Your China Factory Visit`；
- 采购代理页面：`Discuss Your Sourcing Project`；
- 信息型指南：先导向相关服务，再提供询盘入口。

## 7. 文章与旧 URL 治理

`/resources/*` 已永久迁移到 `/article/*`，不再视为现行内容目录。

旧 `/resources/*` 只做三项检查：

- 有对应内容时，必须单跳 301 到正确的 `/article/*`；
- 已淘汰内容必须稳定返回 410；
- 不允许出现重定向链、循环或跳到不相关页面。

现有 `/article/*` 页面按以下规则处理：

- **保留并优化：** 与核心服务直接相关，且有独立搜索意图；
- **合并并 301：** 与另一页面意图重复或互相蚕食；
- **noindex：** 页面需要保留给用户，但不适合参与搜索；
- **410：** 偏题、过期、没有用户价值，也没有可保留的外链或流量。

任何有稳定相关点击、有效外链或商业辅助价值的页面，都不能未经评估直接删除。

## 8. 四周执行计划

### 第 1 周：测量和映射

- 修复 GA4 与 Google Ads 转化事件；
- 只有 `/api/enquiry` 返回成功后才记录一次真实 lead；
- 建立 GSC、GA4、Bing 基线快照；
- 完成关键词到页面的一对一归属表；
- 完成现有文章和旧 URL 的治理清单。

### 第 2 周：核心商业页面

- 优化首页、Services、Supplier Verification、Factory Audit 和 Enquiry；
- 统一价值表达、FAQ、CTA 和内部链接；
- 消除重复标题、重复意图和无效导航路径。

### 第 3 周：覆盖搜索意图

- 新建 `/china-factory-tours`；
- 优化城市页、行业页和现有进口指南；
- 将相关文章流量引导到正确的商业页面。

### 第 4 周：治理和发布

- 执行文章保留、合并、301、noindex 和 410；
- 验证全部 `/resources/*` 历史规则；
- 更新 sitemap 与真实 `lastmod`；
- 向 Google 和 Bing 提交更新；
- 完成发布后回归检查。

## 9. 数据流与容错

正确的数据流是：

`搜索 → 匹配页面 → 对应 CTA → 表单提交 → API 成功 → 唯一 lead 事件 → GA4 报告`

规则：

- 表单验证失败、网络失败或 API 失败时，不得记录 lead；
- 重复点击提交按钮不得产生多个 lead；
- Google Ads conversion 不得在 API 成功前触发；
- 发布失败时保留旧页面和旧跳转，不允许半完成迁移上线；
- 页面合并前保存旧 URL、目标 URL、理由和验证结果，方便回滚与审计。

## 10. 验收与测试

每批发布必须通过：

- Next.js build 与现有测试；
- 桌面和移动端关键页面检查；
- 表单成功、失败和重复提交测试；
- GA4 DebugView 或实时 API 的单次 lead 验证；
- canonical、robots、status code 和 sitemap 检查；
- 301 单跳、410 稳定性和无重定向循环检查；
- 原始 HTML 中存在 title、H1、正文、内链和 JSON-LD；
- GSC URL Inspection 与 Bing API 抽样验证。

## 11. 成功指标

### 最终指标

- 第 6 个月：每月 8–10 条符合业务定义的真实询盘。

### 领先指标

- 第 1 周：转化统计与真实询盘数量一致；
- 第 4 周：所有目标词都有唯一主页面；
- 第 4 周：旧 URL 无重定向链或错误承接；
- 第 2–3 个月：核心商业页面的非品牌展示、点击和前 20 名关键词数量上升；
- 第 3–6 个月：真实询盘从 0 开始持续增长。

如果第 90 天仍没有真实询盘，先检查商业关键词流量、页面到 CTA 的转化和表单投递，不用新增泛流量文章掩盖问题。

## 12. 主要风险

- 从 0 增长到每月 8–10 条高价值询盘是进取目标，站内 SEO 能提高机会，但不能保证搜索需求、排名速度或销售成交；
- 不公开价格、没有客户评价、没有现场素材，会降低信任与转化；页面必须用清晰交付物、风险说明和可公开的汇总证据补足；
- 清理低相关页面可能让展示量和索引页数量短期下降，这是预期结果；
- 现有工作区有大量未提交改动，实施时必须分批提交，避免混入无关数据文件。

## 13. 决策记录

- 采用收入优先的收敛重构；
- 只做站内、英文、现有内容与固定页面；
- 不生成新 SEO 文章；
- 允许新建少量商业落地页；
- 不显示价格；
- 不处理尚未上线的工厂详情页；
- 按数据治理现有文章；
- 用不同 CTA 匹配不同关键词集群；
- 4 周集中改造，随后观察 90 天。
