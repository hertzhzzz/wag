# 全站中英双语切换（i18n）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: 用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务执行。步骤用 `- [ ]` 复选框跟踪。
> **配套 Spec:** `docs/superpowers/specs/2026-06-29-bilingual-i18n-design.md`（本计划以其为准）。

**Goal:** 为 WAG 营销站加中英双语切换——单一网址、客户端即时切换、默认英文、不影响现有英文 SEO、零闪烁。

**Architecture:** 自建轻量词典（`app/i18n/`）+ React Context。`(public)/layout.tsx` 读 cookie 决定首屏语言（Googlebot 无 cookie → 永远英文）；含文案组件转 client、用 `t('key')` 取词；切换 = 换词典 re-render，不刷新。批量文案处理用 **Haiku Subagents 并行**编排。

**Tech Stack:** Next.js 16 App Router、React 19、TypeScript、Tailwind。i18n **零新运行时依赖**。编排用 Workflow 工具 + Haiku subagents。

## Global Constraints

- 默认语言英文；Googlebot（无 cookie）始终命中英文分支；**不改** canonical / hreflang / JSON-LD schema
- 单一 URL，**无** `/zh/` 路由；语言走 cookie `wag_lang`（值 `en|zh`，`path=/`，`max-age=31536000`，`samesite=lax`）
- 零内容闪烁：cookie 驱动 SSR 初始语言
- 源码标识符、组件名、词典 key **一律英文**；**代码库禁止 emoji**；中文**仅**存在于 `app/i18n/dictionaries/zh.ts`
- 路径别名：`@/* → app/*`；i18n 模块在 `app/i18n/`，引用如 `@/i18n/useT`
- `<html lang>` 由根 layout 保持 `en-AU`（强化英文 SEO 信号）；客户端切换改 `document.documentElement.lang`
- 分阶段：每阶段独立可部署、可回滚
- **Git 提交：** 各 task 末尾标注建议提交点，但**执行时须经用户明确授权后触发**（遵守 WAG「不主动 git」规则）；不自动 commit/push
- 验证 gate：`npm run build` + `npm run lint` 必须通过（项目无单测 runner，见「测试与验证策略」）

## 测试与验证策略（务实取舍）

项目当前**无** jest/playwright/vitest 配置。为本任务**新建单测基建属于过度工程**（ponytail / YAGNI），且 i18n 重构的正确性主要靠"视觉不变 + 类型正确 + 构建通过"。因此：

1. **核心正确性 = TypeScript 类型**：`zh` 词典类型设为 `Partial<Record<keyof typeof en, string>>`——写错/多余 key 编译期报错；`t()` 返回类型由 `en` 推导，漏 key 编译期报错。
2. **自动化 gate = `npm run build`（含 tsc）+ `npm run lint`**：真实存在、能抓类型错与 JSX 错。
3. **端到端行为 = 手动验收 checklist**（见每阶段「验收」+ Spec 第 9 节）。
4. 若团队日后要回归自动化，升级路径：加 Playwright 冒烟（本计划末尾附可选骨架）。

---

## Execution Model：Haiku Subagents 并行编排

### 任务并行性分析

| 任务 | 并行 | 执行者 | 理由 |
|---|---|---|---|
| 地基（Provider/useT/dictionaries/toggle/layout） | 否 | 主流程（Phase 0） | 单点、全站依赖，拆分=过度调度 |
| 逐文件**文案抽取 + 中文初稿** | 是 | **Haiku 并行** | 文件独立、机械、量大——并行收益最高，Haiku 能力甜点 |
| 词典合并去重 | 否（barrier） | 主流程（纯代码） | 须拿到全部 key 才能去重 |
| **规则化改造**（already-client / server-no-metadata / data-file） | 是 | **Haiku 并行 + build 兜底** | 各改各文件无冲突；模板化，风险靠 build/lint/diff 控制 |
| **高判断改造**（server-with-metadata：抽 client 子组件） | 否 | 主流程手工 | 判断细、易错，不丢 Haiku |
| 集成验证（build/lint/视觉） | 否 | 主流程 | 全局动作 |

### 粒度规则（避免过度拆分）

- **工作单元 = 文件**（组件本就是文件、改动隔离、词典片段可独立产出）
- **小文件打包**：几乎无文案的文件（如 `PhoneCallLink`）合并给同一 subagent，避免为 5 行文件起一个 agent
- 不按"每字符串一 agent"（过度），不"整站一 agent"（不并行）

### 编排形态（Workflow 脚本骨架）

Phase 1/2/3 每批文案用如下编排执行（`STAGE_A_SCHEMA` / 模板见下）。Stage A→B 之间是**硬 barrier**（B 依赖合并后的最终 key），故非纯 pipeline：

```js
export const meta = {
  name: 'i18n-batch',
  description: '逐文件抽取文案+中文初稿(Haiku并行) → 合并词典 → 规则化改造(Haiku并行)',
  phases: [{ title: 'Extract' }, { title: 'Apply' }],
}
// args = { files: string[] }  本批文件清单（主流程预先扫描确定）
const STAGE_A_SCHEMA = {
  type: 'object',
  required: ['filePath', 'refactorType', 'entries'],
  properties: {
    filePath: { type: 'string' },
    refactorType: { type: 'string', enum: ['already-client', 'server-no-metadata', 'server-with-metadata', 'data-file'] },
    entries: { type: 'array', items: {
      type: 'object', required: ['key', 'en', 'zh'],
      properties: { key: { type: 'string' }, en: { type: 'string' }, zh: { type: 'string' } } } },
  },
}
// Stage A：Haiku 并行抽取（只读，零风险）
const extracted = (await parallel(args.files.map(f => () =>
  agent(STAGE_A_PROMPT(f), { label: `extract:${f}`, phase: 'Extract', model: 'haiku', schema: STAGE_A_SCHEMA })
))).filter(Boolean)
// Barrier：主流程汇总（脚本内纯代码，非 agent）——检测 key 冲突 + 返回供主会话写词典
const allEntries = extracted.flatMap(r => r.entries)
const keyConflicts = findDupKeysWithDifferentEn(allEntries)  // 同 key 不同 en = 冲突，需人工裁决
// server-with-metadata 文件剔除，交主流程手工
const ruleBased = extracted.filter(r => r.refactorType !== 'server-with-metadata')
const manual = extracted.filter(r => r.refactorType === 'server-with-metadata')
// （主会话据 allEntries 写入 en.ts/zh.ts 并 build 通过后，再跑 Stage B）
// Stage B：Haiku 并行规则化改造（写文件，build 兜底）
const applied = await parallel(ruleBased.map(r => () =>
  agent(STAGE_B_PROMPT(r), { label: `apply:${r.filePath}`, phase: 'Apply', model: 'haiku' })
))
return { keyConflicts, manual: manual.map(m => m.filePath), appliedCount: applied.filter(Boolean).length }
```

**与主流程协同**：Workflow 返回 `{keyConflicts, manual, appliedCount}` 给主会话 → 主会话裁决 key 冲突、手工处理 `manual` 文件、跑 `build`+`lint`+`diff` review。**词典文件由主会话写入**（不让多个 agent 写同一文件，避免冲突）；agent 只**返回**词典片段与改各自的组件文件。

### Subagent Prompt 模板

**STAGE_A_PROMPT(filePath)：**
> 读取 `{filePath}`。提取所有**面向用户的可见英文文案**：JSX 文本节点、`aria-label`、`alt`、`placeholder`、button/link 文字。**排除** `className`、`href`、`id`、技术属性、已是变量的值。为每条设计 key，格式 `区块.含义`（小写点分，如 `nav.home`、`footer.tagline`）。判断 `refactorType`：文件首行是 `'use client'`→`already-client`；含 `export const metadata`→`server-with-metadata`；纯数据导出（如 `nav-links.ts`）→`data-file`；否则 `server-no-metadata`。返回 JSON `{filePath, refactorType, entries:[{key, en, zh}]}`，`zh` 为简体中文初稿（营销语气、专业、简洁，**禁用 emoji**）。只读，不修改文件。

**STAGE_B_PROMPT(record)：**
> 按映射改造 `{filePath}`（类型 `{refactorType}`），映射：`{entries 的 key→en}`。在文件内 `import { useT } from '@/i18n/useT'`，组件体内 `const t = useT()`，把每处硬编码英文**原样**替换为 `{t('key')}`（JSX 文本）或 `t('key')`（属性值）。
> - `already-client`：直接替换。
> - `server-no-metadata`：文件**首行**加 `'use client'` 后再替换。
> - `data-file`：把数据里的文案值改为 key 字符串，并在**渲染该数据的组件**处用 `t()`（若涉及跨文件，在返回中标注 `needsRenderSiteUpdate: filePath`）。
> 铁律：**只改文案，绝不动** className / 样式 / href / 结构 / 组件嵌套。完成后该文件应能通过 `tsc`。

---

## File Structure

**新建：**
- `app/i18n/dictionaries/en.ts` — 英文词典（key→原文，`as const`）
- `app/i18n/dictionaries/zh.ts` — 中文词典（`Partial<Record<keyof typeof en, string>>`）
- `app/i18n/LanguageProvider.tsx` — Context + Provider + `useLang` + `useT`（client）
- `app/i18n/useT.ts` — 重新导出 `useT`（稳定引用路径）
- `app/components/LanguageToggle.tsx` — `EN | 中` 开关（client）
- `app/(public)/layout.tsx` — 读 cookie + 挂 Provider（server，使 `(public)` 动态渲染）
- `app/components/HomeCaseStudy.tsx` — 首页 case study 区抽出的 client 子组件（Phase 1）

**修改：**
- `app/components/Navbar.tsx` — 挂 `LanguageToggle` + 文案转 `t()`
- `app/components/Footer.tsx` — 转 client + 文案转 `t()`
- `app/(public)/page.tsx` — 文案区抽到 `HomeCaseStudy`
- 各营销页与子组件（Phase 2/3，Haiku 并行）

---

## Phase 0：地基（主流程串行）

> 目标：机制就位、页面行为**零变化**（词典先只放英文、开关暂不挂载）。可独立部署验证不破坏现状。

### Task 0.1：英文词典骨架 + 类型

**Files:** Create `app/i18n/dictionaries/en.ts`, `app/i18n/dictionaries/zh.ts`

**Produces:** `en`（`as const` 对象）、`zh`（`Partial<Record<keyof typeof en, string>>`）

- [ ] **Step 1：写 `en.ts`**（先放 Phase 1 会用到的 Navbar key，后续批次追加）

```ts
// app/i18n/dictionaries/en.ts
export const en = {
  'nav.home': 'Home',
  'nav.services': 'Services',
  'nav.articles': 'Articles',
  'nav.about': 'About Us',
  'nav.aboutShort': 'About',
  'nav.enquiry': 'Enquiry',
  'nav.callUsToday': 'Call Us Today',
  'nav.bookConsult': 'Book Free Consult',
  'nav.menu': 'Menu',
  'nav.allServices': 'All Services Overview',
} as const
```

- [ ] **Step 2：写 `zh.ts`**（类型受 `en` 约束；先放对应中文初稿）

```ts
// app/i18n/dictionaries/zh.ts
import type { en } from './en'

export const zh: Partial<Record<keyof typeof en, string>> = {
  'nav.home': '首页',
  'nav.services': '服务',
  'nav.articles': '文章',
  'nav.about': '关于我们',
  'nav.aboutShort': '关于',
  'nav.enquiry': '咨询',
  'nav.callUsToday': '立即致电',
  'nav.bookConsult': '预约免费咨询',
  'nav.menu': '菜单',
  'nav.allServices': '全部服务概览',
}
```

- [ ] **Step 3：验证** `npx tsc --noEmit`，期望无错。
- [ ] **Step 4：建议提交点**（需授权）：`feat(i18n): add dictionary skeleton`

### Task 0.2：LanguageProvider + useT

**Files:** Create `app/i18n/LanguageProvider.tsx`, `app/i18n/useT.ts`
**Consumes:** `en`、`zh`（Task 0.1）
**Produces:** `LanguageProvider`、`useLang()`、`useT()`、`type Lang`

- [ ] **Step 1：写 Provider**

```tsx
// app/i18n/LanguageProvider.tsx
'use client'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { en } from './dictionaries/en'
import { zh } from './dictionaries/zh'

export type Lang = 'en' | 'zh'
type TKey = keyof typeof en

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: 'en',
  setLang: () => {},
})

export function LanguageProvider({ initialLang, children }: { initialLang: Lang; children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  // 同步 <html lang>（含初始）；SSR 时由根 layout 固定 en-AU，hydrate 后纠正
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en-AU'
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    document.cookie = `wag_lang=${l}; path=/; max-age=31536000; samesite=lax`
  }, [])

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export function useLang() {
  return useContext(LangContext)
}

export function useT() {
  const { lang } = useContext(LangContext)
  return (key: TKey): string => (lang === 'zh' ? (zh[key] ?? en[key]) : en[key])
}
```

- [ ] **Step 2：写 `useT.ts`**（稳定引用路径，供组件 `import { useT } from '@/i18n/useT'`）

```ts
// app/i18n/useT.ts
export { useT, useLang } from './LanguageProvider'
```

- [ ] **Step 3：验证** `npx tsc --noEmit`，期望无错。
- [ ] **Step 4：建议提交点**（需授权）：`feat(i18n): add LanguageProvider and useT`

### Task 0.3：LanguageToggle 组件（暂不挂载）

**Files:** Create `app/components/LanguageToggle.tsx`
**Consumes:** `useLang`（Task 0.2）

- [ ] **Step 1：写组件**

```tsx
// app/components/LanguageToggle.tsx
'use client'
import { useLang } from '@/i18n/useT'

export default function LanguageToggle() {
  const { lang, setLang } = useLang()
  return (
    <div className="flex items-center text-[13px] font-medium" role="group" aria-label="Language">
      <button type="button" onClick={() => setLang('en')} aria-pressed={lang === 'en'}
        className={lang === 'en' ? 'text-navy' : 'text-navy/40 hover:text-navy/70'}>EN</button>
      <span className="mx-1 text-navy/20">|</span>
      <button type="button" onClick={() => setLang('zh')} aria-pressed={lang === 'zh'}
        className={lang === 'zh' ? 'text-navy' : 'text-navy/40 hover:text-navy/70'}>中</button>
    </div>
  )
}
```

- [ ] **Step 2：验证** `npx tsc --noEmit`，期望无错。
- [ ] **Step 3：建议提交点**（需授权）：`feat(i18n): add LanguageToggle (not yet mounted)`

### Task 0.4：`(public)/layout.tsx` 读 cookie + 挂 Provider

**Files:** Create `app/(public)/layout.tsx`
**Consumes:** `LanguageProvider`、`Lang`（Task 0.2）

- [ ] **Step 1：写 layout**

```tsx
// app/(public)/layout.tsx
import { cookies } from 'next/headers'
import { LanguageProvider, type Lang } from '@/i18n/LanguageProvider'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const lang: Lang = cookieStore.get('wag_lang')?.value === 'zh' ? 'zh' : 'en'
  return <LanguageProvider initialLang={lang}>{children}</LanguageProvider>
}
```

> 注意：本 layout **不写** `<html>`/`<body>`（根 `app/layout.tsx` 已有）。引入 `cookies()` 使 `(public)` 路由组转为按请求渲染——这是 Spec 第 7 节已接受的取舍，且**不影响** `/factory`、`/client`。

- [ ] **Step 2：验证** `npm run build`，期望成功；确认构建日志中 `(public)` 路由标记为动态（ƒ）而非静态（○）。
- [ ] **Step 3：手动验收**：`npm run dev`，打开首页——**外观与行为应与改造前完全一致**（开关未挂载、文案仍英文）。
- [ ] **Step 4：建议提交点**（需授权）：`feat(i18n): wire LanguageProvider into (public) layout`

### Task 0.5：更新规则文档

**Files:** Modify `CLAUDE.md`（WAG 根 `/Users/mark/Projects/wag/CLAUDE.md`）

- [ ] **Step 1：** 将「禁止中文 — UI 必须全英文」条款更新为：
  > 网站默认 UI 与 SEO 内容为英文；中文作为**可选阅读层**存在，仅通过词典 `frontend/app/i18n/dictionaries/zh.ts` 提供；源码标识符、组件、key 仍一律英文。
- [ ] **Step 2：建议提交点**（需授权）：`docs: update bilingual UI rule`

---

## Phase 1：骨架 + 首页（首个可切中文版本）

> 范围：Navbar、Footer、AnnouncementBar、首页及其子组件。**挂载** LanguageToggle，上线后用户即可切中文。

### Task 1.1：扫描确定本批文件清单 + 跑 Extract 编排

**主流程动作：**
- [ ] **Step 1：** 扫描 Phase 1 文件清单（Navbar、Footer、AnnouncementBar、CTABand、Hero、TwoWaysAccess、HowItWorks、WhyChooseUs、ClientOutcomes、SupplierReportPreview、BlogPreview、`page.tsx`、`data/nav-links.ts`），打包小文件。
- [ ] **Step 2：** 调用 Workflow（Execution Model 的脚本），`args.files` = 上述清单，**只先跑 Stage A（Extract）**。
- [ ] **Step 3：** 收集返回的 `entries` 与 `keyConflicts`；人工裁决冲突 key（同义合并、歧义改名）。

### Task 1.2：主流程合并词典

**Files:** Modify `app/i18n/dictionaries/en.ts`, `zh.ts`

- [ ] **Step 1：** 将 Stage A 汇总的 `entries` 追加进 `en.ts`（en）与 `zh.ts`（zh 初稿），key 去重。
- [ ] **Step 2：** **人工校对** zh 初稿（品牌调性、术语）。这是 Spec 决策「机器初稿 + 人工校对」的落点。
- [ ] **Step 3：验证** `npx tsc --noEmit`，期望无错（漏译允许、回退英文；多余 key 会报错）。
- [ ] **Step 4：建议提交点**（需授权）：`feat(i18n): phase-1 dictionary entries`

### Task 1.3：规则化改造（Haiku 并行）

- [ ] **Step 1：** 跑 Workflow 的 Stage B（Apply），仅对 `refactorType ∈ {already-client, server-no-metadata, data-file}` 的文件（Navbar、Footer、AnnouncementBar、各子组件、`nav-links.ts`）。
- [ ] **Step 2：** 主流程 review 每个 diff——确认**只动文案、未动样式/结构**。
- [ ] **Step 3：验证** `npm run build` + `npm run lint`，期望通过。

### Task 1.4：手工改造首页（server-with-metadata）

**Files:** Create `app/components/HomeCaseStudy.tsx`；Modify `app/(public)/page.tsx`

- [ ] **Step 1：** 把 `page.tsx` 第 68–122 行的 `<section>`（AV importer case study）整段移入新建 `HomeCaseStudy.tsx`，文件首行 `'use client'`，文案改 `t('home.case.*')`（key 来自 Task 1.2 词典）。
- [ ] **Step 2：** `page.tsx`（保持 server、保留 `metadata`）引入并渲染 `<HomeCaseStudy />` 替换原 section。
- [ ] **Step 3：验证** `npm run build`，期望成功（`metadata` 仍在 server 文件、未被破坏）。

### Task 1.5：挂载 LanguageToggle

**Files:** Modify `app/components/Navbar.tsx`

- [ ] **Step 1：** 在 Navbar 桌面右侧（`hidden md:flex gap-3` 容器内，PhoneCallLink 前）与移动菜单顶部（`Menu` 行附近）各插入 `import LanguageToggle from '@/components/LanguageToggle'` 与 `<LanguageToggle />`。
- [ ] **Step 2：验证** `npm run build` + `npm run lint`，期望通过。
- [ ] **Step 3：手动验收**（Phase 1 全量）：
  - 无 cookie 访问首页 → 全英文；`curl -s localhost:3000/ | grep -c '首页'` 期望 `0`
  - 点 `中` → Navbar/Footer/首页文案即时变中文，**不刷新、URL 不变、滚动位置保留**
  - 刷新 → 仍中文，无"先英后中"闪烁
  - 点 `EN` → 变回英文
- [ ] **Step 4：建议提交点**（需授权）：`feat(i18n): phase-1 bilingual homepage + nav/footer`

---

## Phase 2：其余营销页

> 范围：`services`、`about`、`industries/[industry]`、`locations/[city]`、`enquiry`（及其专属子组件）。

对每个页面（或一批）重复 **Task 1.1→1.3 的编排**：
- [ ] **Step 1：** 主流程扫描该页文件清单（含其引用的子组件），打包小文件。
- [ ] **Step 2：** Workflow Stage A（Haiku 并行抽取）→ 主流程合并词典 + 人工校对。
- [ ] **Step 3：** 含 `metadata` 的 page 文件 → 主流程手工抽 client 子组件（同 Task 1.4 模式）；其余 → Workflow Stage B（Haiku 并行）。
- [ ] **Step 4：验证** `npm run build` + `npm run lint`；手动验收该页中英切换。
- [ ] **Step 5：建议提交点**（需授权）：`feat(i18n): phase-2 <page> bilingual`

> 建议按页分批提交，便于独立校对与回滚。

---

## Phase 3：文章模块外壳

> 范围：`article` 列表页与 `article/[slug]` 的**外壳 UI**（Navbar/Footer 已在 Phase 1 完成；本阶段补 `ReadingProgressBar` 无文案除外的：面包屑 "Home/Resources"、"Key Takeaways"、`AuthorBio`、`ServicesStrip`、`MidArticleCTA`、`BottomCTA` 的固定文案如 "Explore our services"、"Free initial consultation…"）。

- [ ] **Step 1：** 扫描文章外壳组件清单（`article/[slug]/*.tsx` 中含固定 UI 文案者）；**排除** `MDXRemote` 正文、frontmatter 字段（`fm.title`/`fm.ctaTitle` 等来自 MDX，保持英文）。
- [ ] **Step 2：** Workflow Stage A → 合并词典 + 校对 → Stage B（多为 server-no-metadata 子组件，Haiku 可做）。
- [ ] **Step 3：验证** `npm run build` + `npm run lint`。
- [ ] **Step 4：手动验收**：文章详情页点 `中` → 导航/按钮/"Key Takeaways"/面包屑变中文，**正文（MDX）保持英文、无任何"仅英文"提示**，文章展示逻辑无变化。
- [ ] **Step 5：建议提交点**（需授权）：`feat(i18n): phase-3 article shell bilingual`

---

## Self-Review（计划对照 Spec）

- **Spec 覆盖**：定位/单 URL（Phase 0 layout）、译文来源（Task 1.2 校对）、轻量自建（Phase 0）、默认英文+cookie+零闪烁（Task 0.2/0.4）、范围（Phase 1–3）、文章正文不译且无提示（Phase 3 Step 4）、缺失回退（Task 0.2 `?? en[key]`）、规则更新（Task 0.5）、可扩展（加 `xx.ts`）、验收标准（各阶段手动验收）——**全覆盖**。
- **Haiku 并行真实性**：Stage A（全部文件抽取+翻译）+ Stage B（规则化改造）跑在 Haiku 并行；地基与高判断改造留主流程——非形式化、粒度=文件级、小文件打包防过度调度。
- **占位符扫描**：无 TBD/TODO；地基代码完整；批量代码由 subagent 按模板+schema 产出（有意为之，已附模板与 schema）。
- **类型一致性**：`Lang`、`useT`、`useLang`、`en`/`zh`、cookie 名 `wag_lang`、key 命名 `区块.含义` 全计划统一。
- **冲突处理**：writing-plans 的「frequent commit」与 WAG「不主动 git」——已在 Global Constraints 显式调和（标注提交点 + 须授权）。

## 可选：Playwright 冒烟骨架（团队需要回归自动化时再启用）

```ts
// e2e/i18n.spec.ts （需先 npm i -D @playwright/test 已在 devDeps；加 playwright.config.ts）
import { test, expect } from '@playwright/test'
test('language toggle switches copy without navigation', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Home', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '中' }).click()
  await expect(page.getByText('首页', { exact: true })).toBeVisible()
  await expect(page).toHaveURL('/')  // 未跳转
})
```
