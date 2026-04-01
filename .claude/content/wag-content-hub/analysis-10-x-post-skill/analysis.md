# WAG X (Twitter) Post Skill — 设计分析

**文档编号**: analysis-10
**创建时间**: 2026-04-01
**状态**: 设计稿
**依赖**: wag-linkedin-post v1, analysis-02-four-channel-architecture

---

## 1. X 在 WAG 四渠道矩阵中的定位

### 1.1 核心定位

```
X = 锐利度测试器 + 流量分发节点

定位逻辑：
- LinkedIn 是"完整论证"（3000字，3步框架，数据支撑）
- X 是"单一洞察压缩"（280字，强制提炼到只剩一个刺穿共识的点）
- 如果一个观点在 X 上说不清楚，它在 LinkedIn 上也可能缺乏核心主线
```

### 1.2 X vs 其他渠道的本质差异

| 维度 | LinkedIn | X | Facebook | SEO |
|------|----------|---|----------|-----|
| **叙事长度** | 完整论证（3000字） | 单一洞察（280字） | 故事叙述（中等） | 深度扩展（3000字） |
| **核心价值** | 专业框架 + ER | 锐利洞察 + 传播 | 社区共鸣 + 互动 | 信息密度 + 长尾 |
| **内容复用关系** | 原始锚点 | 提炼分发 | 故事化分发 | 深度扩展 |
| **算法特性** | 深度互动权重 | 即时传播权重 | 社群分享权重 | 搜索意图匹配 |
| **最佳发布时间** | Tue-Thu 9-11 AM AEDT | 同 LinkedIn | 时间灵活 | 无约束 |
| **Hashtag 使用** | 6-10个 | 0-2个 | 0-3个 | 关键词分布 |
| **CTA 类型** | 经验型问题 | 互动触发 | 软性引导 | 行动按钮 |

`★ Insight ─────────────────────────────────────`
**X 是所有渠道中"内容锐利度"要求最高的。**
LinkedIn 的3步框架可以掩盖一个弱的中心论点（结构替你背书）；
X 的280字符不允许任何缓冲——读者5秒内判断"这值不值得读下去"。
这意味着 X 生成的内容，是整个四渠道质量的最严格检验。
─────────────────────────────────────────────────`

---

## 2. X Skill 触发决策

### 2.1 何时调用 X Skill

```
用户输入
  │
  ├── 直接指定 X/Twitter: "帮我写一条 X" → 直接调用
  ├── 多渠道编排: /content-hub new-post → Phase 4 按顺序调用
  └── 现有 LinkedIn Post 提炼: "把刚才的 LinkedIn 帖发 X" → 直接调用
```

### 2.2 X 适配前置条件

X Skill 接受两种输入模式：

```
MODE A: CentralContent 输入（多渠道编排时）
  └── 从 wag-content-hub 接收完整的 CentralContent 对象
      包括: atoms[], anchors.wagPosition, topic.targetChallenge

MODE B: LinkedIn Post 直接引用（快速提炼时）
  └── 输入: 已有 LinkedIn Post 内容 + LinkedIn ER 数据
      目的: "这条 LinkedIn 帖的 X 版本是什么？"
      规则: 必须和 LinkedIn 不完全相同（X 需要独立存在）
```

---

## 3. 内容生成流程

### 3.1 完整生成流程图（ASCII）

```
INPUT: CentralContent
  │
  ├── Step 1: 提取最强 Atom
  │     遍历 atoms[], 选"最锐利"的一个:
  │     - 类型优先: warning > core-claim > data-point
  │     - 情感强度: 警告 > 惊喜 > 陈述
  │     - 具体程度: 有数字/工具名 > 模糊概念
  │
  ├── Step 2: 判断发布模式
  │     │
  │     ├── 单帖模式（默认）
  │     │     └── 洞察足够锐利，一句话说完
  │     │
  │     └── 线程模式（条件触发）
  │           └── 满足任一: 3个+ Atoms / 数据对比 / 工具列表
  │               最多5帖，每帖一个原子观点
  │
  ├── Step 3: 撰写 Hook（第1行）
  │     规则:
  │     - 必须是洞察, 不是总结（禁止"Here's what happened"开头）
  │     - 第一个字符就要建立"知识缺口"（让读者想知道更多）
  │     - 可用公式:
  │       ① "[反常识数字]" — "3 in 4 Aussie SMBs..."
  │       ② "[场景+后果]" — "If you paid a deposit to a China supplier..."
  │       ③ "[直接挑战]" — "Your Alibaba supplier might not be a factory."
  │       ④ "[工具点名]" — "gsxt.gov.cn is free. Did anyone check it?"
  │
  ├── Step 4: 撰写 Body（第2-3行，可选）
  │     规则:
  │     - 最多1句补充背景
  │     - 禁止重复 Hook 的信息
  │     - 引导读者去 LinkedIn/博客（软引导，非硬链接）
  │
  ├── Step 5: CTA（最后）
  │     规则:
  │     - 单字/单词 CTA（如 "Exactly." / "Facts." / "Check yours."）
  │     - 或互动问题（1句，极短于 LinkedIn）
  │       "Did anyone verify their supplier on gsxt.gov.cn?"
  │     - 禁止: 问句太长、语法复杂、抽象问题
  │
  ├── Step 6: Hashtag（最多2个）
  │     规则:
  │     - 从 WAG Hashtag 库选（预定义的精准标签）
  │     - 宁可0个，不要错误标签
  │     - 放在末尾，不打断阅读流
  │
  └── Step 7: 质量门禁
        ├── Hook 是否在第1行就建立"知识缺口"？
        ├── 整条是否只传达一个核心观点？
        ├── 是否有任何渠道特有偏见（LinkedIn腔/X腔混搭）？
        ├── Hashtag 是否精准且最少化？
        └── 是否与 LinkedIn 版本有足够的差异性？
```

### 3.2 发布模式判断

```
发布模式决策表：

条件                                      模式        理由
────────────────────────────────────────────────────────────────
atoms.length <= 2                       单帖模式    一句话说清楚
atoms.length >= 3                       线程模式    多维度展开
atoms[0].type == 'warning'              单帖模式    警告需要冲击力，单帖更锐利
atoms[0].type == 'data-point' 且有对比   线程模式    对比需要空间展示
LinkedIn ER >= 20%                       单帖模式    已有验证，快速分发
LinkedIn ER < 10%                        线程模式    LinkedIn 没打透，X 重新提炼
topic.targetChallenge 包含"如何"/"步骤"  线程模式    How-to 类型需要分解
```

---

## 4. X Post 模板库

### 4.1 单帖模板（Mode A: Single Post）

```
┌─────────────────────────────────────────────────────────────┐
│ 格式: [Hook Line]                                           │
│        [Optional 1-line context]                             │
│        [Optional link reference]                             │
│        [CTA 或 互动问题]                                      │
│        [#Tag #Tag]                                          │
└─────────────────────────────────────────────────────────────┘

示例:

"3 in 4 Aussie SMBs start supplier searches on Alibaba.
Most never verify if the supplier is actually a factory.

Full breakdown →

Did you ever check a supplier's license directly?
#ChinaSourcing #AustraliaChina

---

"Before paying any deposit to a China supplier, ask for one thing:
a live video of their production line during working hours.

Not a showroom. Not a stock video. Working hours.

This is the step most Australian brands skip. #FactoryVerification

---

"Your Alibaba supplier might not be a factory.

Here's how to check in 60 seconds — for free:

gsxt.gov.cn → Search → Business License → Look for 'manufacturing'

No registration needed. No Chinese language required.

Did you know this tool existed? #ChinaSourcing #AustraliaImport"
```

### 4.2 线程模板（Mode B: Thread）

```
┌─────────────────────────────────────────────────────────────┐
│ 线程结构: Tweet 1 (Hook) → Tweet 2-4 (展开) → Tweet N (CTA) │
└─────────────────────────────────────────────────────────────┘

Tweet 1 — Hook（必须独立成立）
"Before you trust any China supplier, verify 3 things. Here's the exact checklist — free and takes 60 seconds. 🧵"

Tweet 2 — 第一步
"1/ Check the business license on gsxt.gov.cn
Look for: 制造 (manufacturing) in the scope field.
If it's only 'trading' or 'export' — not a factory."

Tweet 3 — 第二步
"2/ Ask for a live video of production lines during working hours.
Not a showroom tour. Not a pre-recorded video.
Actual workers. Actual machines. Daylight hours."

Tweet 4 — 第三步
"3/ Call the certification body directly.
SGS, Bureau Veritas, TÜV — all publish verification numbers.
If the cert is real, it checks out in 10 minutes."

Tweet 5 — CTA
"3 checks. 60 seconds total. Most Australian brands skip all of them.

What verification step would you add to this list?
↓"

#FactoryVerification #ChinaSourcing

---

`★ Insight ─────────────────────────────────────`
**X 线程的本质是"压缩的播客"，不是"LinkedIn 的分段版"。**
线程的每一条 Tweet 必须能够**独立传播**（有人只看到 Tweet 3，它本身也要有意义）。
这与 LinkedIn 的3步框架完全不同——LinkedIn 的步骤是递进的，单独一步没有意义；
X 线程的每一步是可独立存在的原子洞察。
─────────────────────────────────────────────────`
```

---

## 5. 数据结构

### 5.1 X Post 输出结构

```typescript
interface XPost {
  contentId: string;              // CentralContent.id（关联）
  mode: 'single' | 'thread';
  threadLength?: number;          // 线程模式下的推文数量

  primaryTweet: {
    hook: string;                 // ≤280 字符，第一行
    contextLine?: string;         // 可选的1行背景
    ctaOrQuestion: string;        // 结尾互动
    hashtags: string[];           // 0-2 个
    characterCount: number;        // 验证 ≤280
  };

  thread?: XThreadTweet[];        // 线程模式下的后续推文

  // 来源信息
  source: {
    sourceType: 'central-content' | 'linkedin-refinement';
    linkedinPostId?: string;      // 如果是 LinkedIn 提炼版本
    atomsUsed: string[];           // 引用的 atom IDs
  };

  // 质量门禁结果
  gateCheck: {
    hookEstablishesGap: boolean;  // Hook 是否在第1行建立知识缺口
    singleInsight: boolean;        // 是否只传达一个核心观点
    noLinkedInTone: boolean;       // 是否没有 LinkedIn 腔
    hashtagMinimal: boolean;       // Hashtag 是否 ≤2 个
    distinctFromLinkedIn: boolean; // 是否与 LinkedIn 版本有差异
  };

  // 发布后填充
  publishedAt?: string;
  metrics?: XMetrics;
}

interface XThreadTweet {
  index: number;                  // 1 = Hook, 2-N = 展开
  content: string;                // ≤280 字符
  hashtags: string[];             // 0-2 个（仅最后一帖需要）
}
```

---

## 6. WAG X 专属规则

### 6.1 Hashtag 库（预定义精准标签）

```
#ChinaSourcing          ← 主标签，适用最广
#FactoryVerification    ← 验厂相关
#AustraliaChina         ← 澳洲+中国
#SupplyChain            ← 供应链
#ImportFromChina        ← 从中国进口
#AustralianBusiness     ← 澳洲商业（慎用，偏宽泛）
#Manufacturing          ← 制造业
#SmallBusinessAustralia ← 小微企业（慎用）
```

**使用规则**:
- 首选: `#ChinaSourcing` + 1个精准标签
- 可选: 仅 `#ChinaSourcing`（当帖子足够锐利时）
- 禁止: 超过2个；使用未经证实的标签

**禁止使用的标签**:
- `#WAG` / `#WinningAdventureGlobal`（零搜索量）
- 与内容无关的热门标签（冲流量）
- 任何 emoji 在 hashtag 中

### 6.2 与 LinkedIn 的差异性要求

```
质量门禁核心项：X 版本 ≠ LinkedIn 版本的简单压缩

检查清单：
[ ] X 的 Hook 不是 LinkedIn Hook 的缩减版
[ ] X 没有使用 LinkedIn 的"步骤1/2/3"结构（除非线程模式）
[ ] X 的 CTA 是单字/短句，而不是经验型长问题
[ ] X 没有" Here's what happened" / "Here's why" / "In this post" 开头
[ ] X 的语气更锐利（允许一定争议性），LinkedIn 更专业

区分度验证：
如果把 X 和 LinkedIn 并排展示，
读者能否立刻区分这是两个不同平台的内容？
```

### 6.3 X 品牌语调（与 LinkedIn 的区别）

| 规则 | LinkedIn | X |
|------|----------|---|
| 情感强度 | 专业但温和 | 允许锐利/争议性（受众多样） |
| 开头建立 | 专业形象 | 知识缺口 |
| CTA 类型 | 经验型问题 | 单字回应或极短问题 |
| 语气来源 | 专家向导 | 知情者内部视角 |
| 允许争议性观点 | 谨慎 | 可以直接 |
| 允许简短断言 | 可以 | 鼓励（越具体越好） |

---

## 7. 与 wag-content-hub 的集成

### 7.1 输入契约（来自 Hub）

```typescript
// Hub → X Skill 的输入格式
interface XSkillInput {
  centralContent: CentralContent;  // 完整对象
  mode: 'auto' | 'force-single' | 'force-thread';
  // mode=auto 时，X Skill 自行判断
  // mode=force-single 时，强制单帖（即使多个 Atoms）
  // mode=force-thread 时，强制线程（即使只有1个 Atom）
  linkedInVersion?: LinkedInPost;   // 可选，已有的 LinkedIn 版
}
```

### 7.2 Hub 调用 X Skill 的时机

```
Phase 4 发布编排中的 X 步骤：

Step 4a: 发布 LinkedIn（完成后）
  ↓ 等待 30 分钟（可选：先观察早期互动）
Step 4b: 发布 X
  → 模式判断: 如果 LinkedIn ER >= 20% → 单帖快速分发
              如果 LinkedIn ER < 10% → 线程重新提炼
  → 引用 LinkedIn: 可选（"Full breakdown on LinkedIn ↑"）
Step 4c: 发布 Facebook
```

### 7.3 X Skill 输出 → Hub

```typescript
// X Skill → Hub 的输出格式
interface XSkillOutput {
  status: 'generated' | 'rejected-quality-gate';
  post: XPost | null;
  qualityNotes: string[];         // 质量门禁检查说明
  recommendedPostingTime?: string; // AEDT 时间建议
  crossReferenceToLinkedIn?: {
    type: 'references' | 'independent';
    linkedInUrl?: string;
  };
}
```

---

## 8. 待验证假设

1. **X 单帖 vs 线程的边界假设** — 假设"3个+ Atoms = 线程"，但没有数据支持。需要在首月收集单帖/线程的 ER 对比数据来校准。
2. **X 的 LinkedIn 引用策略** — 假设"Full breakdown on LinkedIn"引导能提升 LinkedIn 互动，但可能分散 X 注意力。需要 A/B 测试。
3. **Hashtag 数量** — 假设0-2个是正确区间。如果0个标签反而比1-2个表现更差，需要收紧规则。
4. **发布时机** — 假设 X 和 LinkedIn 同时段（AEDT 9-11 AM）最佳，但 X 的全球受众可能需要不同时间。

---

## 9. 实施路径

### Phase 1: 最小可行版本（立即可做）
- 单一文件: `wag-content-hub/skills/x-post/SKILL.md`
- 仅支持 Mode B（LinkedIn Post → X 提炼）
- 仅支持单帖模式
- 预定义 Hook 公式 + Hashtag 库

### Phase 2: 完整版本（依赖 CentralContent）
- 支持 Mode A（直接接收 CentralContent）
- 支持线程模式
- 与 wag-content-hub 完全集成

### Phase 3: 数据驱动优化（依赖 analytics）
- 收集 X ER/Clicks 数据
- 对比单帖 vs 线程 vs 引用 LinkedIn 模式的差异
- 更新 Hook 公式排行榜
