# Winning Adventure Global — 全站中英双语切换（i18n）方案设计

- **日期**：2026-06-29
- **作者**：Mark He（与 Claude 协作）
- **状态**：待团队审核
- **适用代码库**：`frontend/`（Next.js 16 App Router 营销站）

---

## 1. 背景与目标

WAG 官网（winningadventure.com.au）当前为纯英文营销站，面向澳洲企业，全部 SEO 押在英文关键词上（"china sourcing agent" 等）。现需为全站（除文章正文外）增加中英文双语切换能力。

经需求澄清，明确定位：中文版**仅为阅读便利**——给已通过英文或品牌到达网站的访客（如在澳华人客户、不习惯英文的访客）一个看中文的选项，**不需要**被搜索引擎单独收录、不追求中文流量。

由此确立核心原则：**单一网址、客户端切换、默认英文、不影响现有英文 SEO、零内容闪烁、逐步上线**。

## 2. 已确认的关键决策

| 决策点 | 选择 | 含义 |
|---|---|---|
| 中文版定位 | 仅阅读便利 | 单网址、客户端切换、不碰 SEO |
| 译文来源 | 机器初稿 + 人工校对 | Claude 产出初稿，WAG 团队润色品牌调性 |
| 实现路径 | 轻量自建词典 + React Context | 零新依赖，不用 next-intl、不建独立网址 |
| 默认语言 | 英文 | 新访客与搜索引擎均见英文 |
| 持久化 | cookie | 服务端可读，保证零闪烁且 SEO 安全 |
| 第一版范围 | 核心营销页全覆盖 | 见第 3 节 |
| 文章正文 | 不翻译 | 外壳跟切，正文保持英文，**不加"仅英文"提示** |
| 上线方式 | 分阶段 | 每阶段独立可上线/可回滚 |

## 3. 范围

**纳入（第一版）**：

- 全站公共组件：Navbar、Footer、AnnouncementBar、CTABand 等含文案组件
- 首页 `app/(public)/page.tsx`
- 服务页 `services`、关于页 `about`、行业页 `industries/[industry]`、城市落地页 `locations/[city]`、咨询表单 `enquiry`
- 文章列表 `article` 与文章详情 `article/[slug]` 的**外壳 UI**（导航、按钮、栏目名、面包屑、Key Takeaways 标签等）

**不纳入**：

- 文章正文（MDX 内容）——保持英文
- 工厂百科 `/factory`（1209 数据驱动页，后续单独评估）
- 客户门户 `/client`（私有 `noindex`）

## 4. 方案概览（它怎么工作）

给网站配一本"中英对照词典" + 一个语言开关：

- 默认英文；用户点开关切到中文，页面文字当场换成中文，**不刷新、不换网址、不丢浏览状态**
- 搜索引擎（Googlebot）抓取时不带 cookie，永远只看到英文 → 现有排名不受影响
- 用户的语言选择记在 cookie，下次访问首屏直接呈现正确语言 → 零闪烁

## 5. 技术设计

### 5.1 核心组件

- `app/i18n/LanguageProvider.tsx`（client）：React Context，持有 `lang: 'en' | 'zh'` 与 `setLang`
- `app/i18n/dictionaries/en.ts`、`zh.ts`：`as const` 词典对象，key → 文案，按"页面/区块.含义"组织（如 `nav.home`、`home.hero.title`、`footer.copyright`）
- `app/i18n/useT.ts`：`const t = useT(); t('home.hero.title')` 返回当前语言文案；类型从 `en` 词典推导，漏 key 在编译期报错
- **缺失回退**：`zh` 词典缺某 key 时，`t()` 回退到 `en`。保证分阶段迁移期间未翻译的文案显示英文而非空白，永不出现破损页面
- `app/components/LanguageToggle.tsx`（client）：`EN | 中` 开关，调用 `setLang`、写 cookie、同步 `document.documentElement.lang`；置于 Navbar（桌面与移动菜单）

**插值**：营销文案以静态为主。少量需要插值处（如年份、数字），`t('key')` 返回字符串后自行拼接即可，**不引入复数/格式化引擎**（YAGNI）。

### 5.2 默认语言、持久化与零闪烁（关键）

- 用户切换 → 写 cookie `wag_lang=zh`（有效期 1 年）
- **新建** `app/(public)/layout.tsx`（server）用 `cookies()` 读取 `wag_lang`，把初始语言作为 prop 传给 `LanguageProvider`。**仅营销页这一层读 cookie** —— 根 `app/layout.tsx` 不读，故 `/factory`、`/client` 不受动态渲染影响（爆炸半径精确收缩到第一版范围）
- 根 `app/layout.tsx` 的 `<html lang>` **恒为 `en-AU`**（强化对 Googlebot 的英文信号）；客户端切换时由 Provider 改 `document.documentElement.lang`
- 含文案的组件虽是 client component，但 Next 仍会在服务端将其 SSR 成 HTML —— 首屏即正确语言，无"先英后中"闪烁
- **Googlebot 不带 cookie → 始终命中默认英文分支 → SEO 安全**

### 5.3 组件改造方式

- 含可见文案的组件加 `"use client"` 并改用 `t('key')` 取词
  - 这是为满足"切换不刷新、不丢状态"必须付的结构代价：文案需在客户端可即时 re-render；若允许"切换时刷新页面"则可省去，但与需求冲突
- 不含文案的纯数据/展示组件保持 server component
- `<html lang>`：SSR 按 cookie 设定（`en-AU` / `zh-CN`）；客户端切换时同步更新 `document.documentElement.lang`

### 5.4 文章模块特殊处理

- 文章详情页 `article/[slug]`：外壳 UI（Navbar/Footer/CTA/面包屑/Key Takeaways 标签等）走词典，跟随切换
- `<MDXRemote>` 渲染的正文**完全不动**，始终英文
- **不添加**任何"仅英文"提示（按用户确认）
- 结果：切到中文时，页面框架中文、正文英文，文章展示逻辑零改动

### 5.5 可扩展性

- 新增语言 = 新增一本 `xx.ts` 词典 + 开关多一个选项，机制不变
- 词典集中管理；英文文案变更时同步更新词典，比当前散落 27+ 文件更易维护

## 6. 分阶段实施路径

| 阶段 | 内容 | 可交付 |
|---|---|---|
| 0 骨架 | LanguageProvider + useT + LanguageToggle + cookie 机制；词典先只放英文；**开关暂不对外暴露**（或仅 feature flag 内部可见） | 机制就位，页面行为零变化，可上线验证不破坏现状 |
| 1 骨架+首页 | 迁移 Navbar/Footer/AnnouncementBar + 首页文案入词典；机器初稿 → 团队校对 | 第一个可切中文的版本上线 |
| 2 其余营销页 | 服务、关于、行业、城市落地页、咨询表单逐页迁移 + 校对 | 核心营销页全覆盖 |
| 3 文章外壳 | 文章列表/详情页外壳 UI 入词典 | 第一版范围完成 |

每阶段独立提交、独立部署、可回滚。

## 7. 风险与权衡

| 风险/代价 | 说明 | 缓解 |
|---|---|---|
| 翻译质量 | 机器初稿可能生硬、品牌调性不准 | 人工校对把关；分阶段小批量校对 |
| 性能 | 根 layout 读 cookie → `(public)` 页面由静态生成转为按请求渲染，TTFB 增加数十毫秒 | 内容站可忽略；Vercel CDN 缓解；为"零闪烁"必要代价 |
| bundle 增大 | 含文案组件转 client，客户端 JS 增加 | 营销组件多本就含交互；按需迁移，监控 bundle 体积 |
| 维护同步 | 改英文需同步改词典 | 词典集中 + TypeScript 漏 key 编译报错 |

## 8. 既有规则更新

WAG CLAUDE.md 现规定"禁止中文 — UI 必须全英文"。本方案不违背其初衷（默认与 SEO 仍英文），但需将该规则措辞更新为：

> 网站默认 UI 与 SEO 内容为英文；中文作为**可选阅读层**存在，仅通过词典（`app/i18n/dictionaries/zh.ts`）提供；源码标识符、组件、key 仍一律英文。

此更新在阶段 0 落地时一并提交。

## 9. 验收标准

- 默认（无 cookie / Googlebot）访问任意页 → 英文，HTML 源码为英文
- 点击 `EN | 中` → 当前页文字即时变中文，URL 不变、不刷新、滚动位置保留
- 刷新或重新访问 → 保持上次所选语言，无"先英后中"闪烁
- 文章详情页切中文 → 外壳中文、正文英文、无额外提示
- 现有英文页面的 canonical / hreflang / 结构化数据无变化
- `npm run build` 与 `npm run lint` 通过

## 10. 执行模型（Haiku Subagents 并行）

i18n 改造的 80% 是"逐文件、相互独立、机械重复"的文案活，天然适合并行；地基与高判断改造需主流程串行。**详细编排、Workflow 脚本、subagent prompt 模板与输出 schema 见实施计划** `docs/superpowers/plans/2026-06-29-bilingual-i18n.md` 的「Execution Model」节。要点：

| 任务 | 执行者 |
|---|---|
| 地基（Provider/useT/词典/开关/layout） | 主流程串行 |
| 逐文件文案抽取 + 中文初稿 | **Haiku 并行**（只读，零风险，收益最高） |
| 词典合并去重 | 主流程（barrier，纯代码） |
| 规则化改造（already-client / server-no-metadata / data-file） | **Haiku 并行** + `build`/`lint`/diff 兜底 |
| 高判断改造（含 `metadata` 的 page → 抽 client 子组件） | 主流程手工 |
| 集成验证 | 主流程 |

- **协同**：Workflow 返回词典片段与冲突清单给主会话；**词典文件由主会话统一写入**（避免多 agent 写同一文件冲突），组件文件各 agent 改各自的。
- **粒度**：工作单元 = 文件；几乎无文案的小文件打包给同一 subagent，避免过度调度。
- **真实提效非形式化**：Stage A 覆盖全部文件的抽取+翻译（最大体力活）并行化；Stage B 规则化改造并行化。
