# WAG Content Hub — 完整架构设计
**生成时间**: 2026-04-01
**状态**: 基于10个subagent分析汇总

---

## 一、核心定位

wag-content-hub 是四渠道内容引擎的**协调层**，三条基本原则：
1. **不在澄清渠道前调用子技能** — Hub生成内容策略，不是内容
2. **Hub是守门人** — 有权对低质量内容说"不"
3. **内容策略驱动分发** — CentralContent原子化，渠道自适应适配

---

## 二、双层内容模型

```
┌─────────────────────────────────────────────────────────────┐
│                    CENTRAL CONTENT                          │
│  (Atom: 核心观点/事实/数字 — 跨渠道锁定不变)                  │
│                                                              │
│  atoms: {观点, 事实, 数字}                                   │
│  anchors: {wagPosition锚点, 品牌规则}                         │
│  adaptations: {LinkedIn, X, Facebook, SEO}                  │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  LinkedIn   │    │     X      │    │  Facebook   │
│  知识型hook │    │ 锐利度测试  │    │  关系型hook │
│  3步框架    │    │ 挑衅式开头  │    │ 故事开场    │
│  ER目标33%  │    │ 100字符限制 │    │ 驱动Saves  │
└─────────────┘    └─────────────┘    └─────────────┘
```

---

## 三、四渠道分发顺序

按验证速度排序：**LinkedIn → X → Facebook → SEO**

| 渠道 | 定位 | Hook类型 | 格式 | CTA优先级 |
|------|------|----------|------|-----------|
| LinkedIn | 知识型（学从专家） | 认知刷新3步框架 | 150-300字+配图 | Comments |
| X | 锐利度测试器 | 挑衅/反常识100字符 | 280字/推文串/投票 | 投票>RT>评论 |
| Facebook | 关系型（我们都是这么过来的） | 情感共鸣故事开场 | 清单驱动收藏 | Saves>Shares |
| SEO | 长尾拦截 | 信息型结构 | MDX完整文章 | Internal Links |

---

## 四、用户交互流程

### 4.1 new-post 流程（6步）
```
用户输入 → Socratic Q&A（7问） → CentralContent生成
→ 渠道适配 → 内容输出 → 归档
```

### 4.2 Socratic Q&A（复用 LinkedIn 版）
- **Q1-Q3 通用**：话题选择 / 内容结构 / 素材准备
- **Q4-Q5 差异化**：CTA设计 / 发布账号
- **Q6-Q7 新增**：跨渠道确认 / 质量门槛

### 4.3 待对齐问题
> **X 是否允许软引导去 LinkedIn**（"Full breakdown on LinkedIn ↑"），还是X必须完全独立存在？
>
> 当前分析倾向：**X应独立**，但可从CentralContent的Atom引用事实

---

## 五、RAG 上下文注入

### 5.1 数据流（T-0 到 T+24）
```
T-0 规则加载 → T+0 内容发布 → T+6 数据抓取 → T+12 GSC就绪
→ T+18 归一化存储 → T+20 规则更新 → T+22 新上下文就绪 → 次日生成
```

### 5.2 时间衰减
- λ=0.07（半衰期10天）
- 昨日数据权重最高

### 5.3 关键发现
- **主要矛盾是曝光量不是互动率**：ER 16.48% 已远高于行业均值(3-5%)，但月曝光仅125
- **3步框架(ER 22.6%) vs 叙述型(ER 5.1%)**

---

## 六、自进化反馈循环

### 6.1 三层触发阈值
- **即时触发**：单日异常
- **统计触发**：连续样本，p<0.05
- **趋势触发**：滑动窗口，线性回归

### 6.2 更新策略
- **增量为主**（成本低、可回滚）
- **全量为辅**（30天窗口，防止噪声积累）
- **置信度阈值0.75**

### 6.3 冲突仲裁
五层优先级：新鲜度 → 样本量 → 效果量 → 类型优先级 → 通道一致性

---

## 七、数据收集方案

### 7.1 平台优先级
| 平台 | 方案 | 优先级 |
|------|------|--------|
| GSC | API直接调用 | P0（立即可做） |
| LinkedIn | 手动导出XLS + 自动解析 | P1 |
| X | Chrome CDP（需Premium） | P2（需确认订阅） |
| Facebook | 手动CSV为主 | P2 |

### 7.2 LinkedIn XLS 字段映射（19列 → normalized schema）
- 原始指标：Impressions, Clicks, CTR, Reactions, Comments, Shares, Engagement Rate
- 统一后：impression, click, ctr, engagement_rate

### 7.3 存储方案
- **SQLite**：运行时DB
- **CSV**：Git可追踪增量日志

---

## 八、Chrome CDP 技术方案

### 8.1 关键洞察
- **XHR拦截器 > DOM解析**：LinkedIn DOM类名每周变化，XHR更稳定
- **user profile browser**：继承真实Chrome登录态

### 8.2 各平台数据字段
详见 `analysis-05-chrome-cdp-collection.md` 完整映射表

---

## 九、SKILL.md 草稿

### 9.1 主入口 SKILL.md 结构
```yaml
name: wag-content-hub
version: 0.1.0
role: coordinator

commands:
  new-post: 6步Socratic流程
  analyze: 4步分析流程

context_inject:
  - performance-rules
  - content-matrix
  - brand-voice
  - channel-specs
```

### 9.2 渠道 Sub-Skills
| Skill | 位置 | 状态 |
|-------|------|------|
| wag-linkedin-post | 独立引用 | 已有 |
| wag-seo-blog | 独立引用 | 已有 |
| x-post | skills/ 子目录 | 待创建 |
| facebook-post | skills/ 子目录 | 已有关联草稿 |
| wag-analytics-collector | skills/ 子目录 | 待创建 |

### 9.3 SKILL间调用协议（WCSP v0.1）
- 通过文件路径约定传递：`{channel}/output/{date}/post.md` + `meta.json`
- hub规则优先，子skill强制规则不可覆盖

---

## 十、文件结构

```
wag-content-hub/
├── SKILL.md                          # 主入口
├── skills/
│   ├── x-post/
│   ├── facebook-post/
│   └── analytics-collector/
├── workflows/
│   ├── daily-publish.yaml            # 每日发布工作流
│   └── self-evolution.yaml           # 自进化工作流
├── analytics/
│   ├── performance-rules.md           # 性能规则
│   ├── content-matrix.md              # 话题×渠道矩阵
│   ├── daily/YYYY-MM-DD.yaml          # 每日快照
│   └── weekly/YYYY-WXX.md            # 周汇总
├── evolution/
│   └── rule-engine.md                 # 规则引擎逻辑
└── lib/
    └── rag-protocol.md                # RAG复用协议
```

---

## 十一、关键决策清单

| # | 决策点 | 当前倾向 |
|---|--------|----------|
| 1 | X是否引流至LinkedIn | X独立，Atom事实共享 |
| 2 | LinkedIn/SEO位置割裂 | 迁移至hub/skills/子目录 |
| 3 | RAG复用 | 提取rag-protocol.md |
| 4 | X订阅级别 | 待确认 |
| 5 | 数据收集频率 | GSC每日，LinkedIn每周 |

---

## 十二、P0 开发优先级

1. **GSC API + LinkedIn parser + SQLite schema**（预计4h）
2. **wag-content-hub 主入口 SKILL.md**
3. **x-post skill SKILL.md**
4. **self-evolution 工作流**

---

*基于10个subagent分析汇总生成*
