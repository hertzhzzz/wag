# WAG X-Post Skill 设计分析

**创建时间**: 2026-04-01
**状态**: 设计完成，待实现
**任务编号**: #10

---

## 一、X 平台核心机制研究

### 1.1 字符限制与格式规范

| 格式类型 | 字符限制 | 发布方式 | 适用场景 |
|----------|----------|----------|----------|
| 标准推文 | 280 字符 | 单条发布 | 快速洞察、一句话 CTA |
| 超级推文（Twitter Blue） | 10,000 字符 | 单条发布 | 深度分析、案例展开 |
| 推文串（Thread） | 每条 280，多条串联 | 回复链式 | 步骤教程、故事叙述 |
| 投票推文 | 280 字符 | 附投票组件 | 意见收集、互动驱动 |

**关键差异（vs LinkedIn）**:
- LinkedIn 重视段落结构与视觉留白；X 重视单条信息密度与节奏感
- LinkedIn hook = 前 210 字符（"see more" 分界线）；X hook = 前 100 字符（移动端前扫视区）
- LinkedIn 推荐 3 步框架；X 推荐 1-3 条快节奏陈述

### 1.2 媒体规范

| 媒体类型 | 规格要求 | WAG 适用场景 |
|----------|----------|-------------|
| 单图 | 最大 16MB，建议 1200x675 | 数据图表、截图 |
| 4 图网格 | 总计 16MB | 步骤截图、案例展示 |
| 视频 | ≤ 2分20秒，MP4，最大 512MB | 工厂短视频（需配合 X 广告预算才有意义） |
| GIF | MP4 格式，最大 15MB | 低优先级 |
| 视频 Tweet | 不推荐（自然覆盖率低） | 仅在 X 广告中使用 |

**结论**: 对 WAG 而言，标准推文 + 图片截图是最优解。视频 Tweet 在无付费推广的自然流量下 ROI 极低。

### 1.3 X 算法分发逻辑（2026）

X 的算法排序因子优先级：

```
高优先级:
  1. 早期互动率（前 30 分钟）：点赞、回复、转发、书签
  2. 关注者回复（提升主页曝光）
  3. 投票参与（高参与信号）

中优先级:
  4. hashtag 相关性（非趋势 hashtag）
  5. 媒体附件（图片 > 视频 > 无媒体）

低/惩罚项:
  6. 外部链接（带链接推文降低分发）
  7. 推文频率过高（超过 5 条/天触发降权）
  8. 重复内容（多账号发布同一内容）
```

**★ Insight ─────────────────────────────────────**
- X 算法最看重**前 30 分钟**的互动速度，与 LinkedIn 的"60 分钟响应窗口"机制类似但更激进
- X 对**链接的惩罚比 LinkedIn 更重**（LinkedIn 是 -60% 曝光；X 是直接降低分发权重）
- **投票**是 X 独有的高权重信号：创建投票的推文在算法中被视为"问题/讨论启动器"，天然获得更高分发
─────────────────────────────────────────────────

---

## 二、X vs LinkedIn Hook 策略对比

### 2.1 核心差异矩阵

| 维度 | LinkedIn Hook | X Hook |
|------|--------------|--------|
| 长度 | 210 字符（"see more" 线） | 100 字符（移动端首屏） |
| 语气 | 专业、可信、引导式 | 挑衅、直接、反常识 |
| 结构 | 步骤框架最强 | 一句话冲击力最强 |
| 验证需求 | 低（LinkedIn 受众更包容） | 高（X 受众高度筛选，易被划走） |
| 热点时效 | 低（LinkedIn 内容半衰期长） | 高（X 内容 24-48 小时即沉） |
| 权威引用 | 高（LinkedIn 算法给认证账号加权） | 中（X Blue 认证有加成但非必须） |

### 2.2 LinkedIn vs X 同一内容的转化逻辑

**同一核心内容 "工厂验证三步法"**:

| 平台 | 转化方式 | 内容结构 |
|------|----------|----------|
| LinkedIn | 帖子（教育型） | Hook(210字符) → 3步展开 → CTA问题 → Hashtags |
| X | 推文串（快节奏） | Hook快句(100字符) → 3条短推 → 投票/CTA → Hashtag |
| X | 单推（高冲击） | 反常识Hook(100字符) → 1个核心洞察 → 投票 |
| X | 超级推文（深度） | Long-form + 分段标题 + 结论投票 |

**转化原则**:
1. **压缩**：LinkedIn 3步 → X 3条短推，每条 ≤ 280 字符
2. **换档**：LinkedIn 的教育语气 → X 的挑战语气
3. **增CTA**：LinkedIn 的问题CTA → X 的投票/引用转发

---

## 三、话题标签策略

### 3.1 Hashtag 最佳实践

| 策略 | 数量 | 位置 | 效果 |
|------|------|------|------|
| 标准推文 | 1-2 个 | 推文末尾或嵌入句中 | 最自然，算法不惩罚 |
| 超级推文 | 2-3 个 | 仅首条使用 | 后续推文不带标签 |
| 推文串 | 0 个（首条可选） | 首条末尾 | 避免显得 spam |
| 投票推文 | 0 个 | — | 投票本身已是互动钩子 |

**核心原则**: X 2026 算法对 hashtag 数量敏感度高于 LinkedIn。超过 2 个 hashtag 的推文被视为"低质量营销内容"，分发权重下降。

### 3.2 WAG 相关 Hashtag 库

**第一梯队（高相关性，WAG 专属受众）**:
```
#ChinaSourcing
#FactoryVerification
#AustraliaBusiness
#SMESourcing
```

**第二梯队（行业覆盖，触达相邻受众）**:
```
#ImportFromChina
#Manufacturing
#SupplyChain
#AudioVisual
#EventIndustry
#AutomotiveAustralia
```

**第三梯队（趋势借势，按需使用）**:
```
#TradeWars（中美贸易相关时使用）
#AustraliaChina（外交热点时使用）
#SmallBusiness（ SMB 普遍话题）
```

**不推荐**:
- `#WAG` / `#WinningAdventureGlobal`（搜索量=0，等同无标签）
- `#Adelaide`（地域过于狭窄，除非本地活动内容）

### 3.3 Hashtag 行为差异

| 行为 | LinkedIn | X |
|------|----------|---|
| 标签在正文内 | 视作内容词汇，正常 | 可接受 |
| 标签堆在末尾 | 最多 10 个，正常 | 超过 2 个 = spam 信号 |
| 标签用 CamelCase | 无区别 | 推荐 CamelCase（可读性） |

---

## 四、X 专属 CTA 形式

### 4.1 五种 X 专属 CTA 对比

| CTA 类型 | 互动率 | 适用内容 | 操作难度 |
|----------|--------|----------|----------|
| **投票（Poll）** | 最高（算法加权 3-5x） | 意见收集、"你最常遇到哪个问题" | 低 |
| **引用转发（Quote Tweet）** | 中高（扩大触达） | "这和你的经历类似吗？引用转发分享你的故事" | 低 |
| **回复引发讨论** | 中 | "你在哪个环节最容易踩坑？" | 中（需跟进回复） |
| **@提及引导** | 低-中 | "@[KOL] 你怎么看？" | 中（需对方配合） |
| **书签驱动** | 中 | "收藏这篇，下次去中国前必读" | 低 |

**★ Insight ─────────────────────────────────────**
- **投票是 X 最强的自然增长工具**：X 算法对带投票的推文有加权，因为投票 = 用户明确表示"我有意见要表达"，这是最强的参与信号
- LinkedIn 的"评论区回答 CTA"在 X 上效果弱，因为 X 的评论深度远低于 LinkedIn
- X 的 CTA 核心原则：**让用户做最小动作**（点投票 >> 写评论 >> 转发）
─────────────────────────────────────────────────

### 4.2 WAG 内容 X 专属 CTA 模板

**工厂验证类内容**:
```
"3步验证你的中国供应商。你在哪一步最常出问题？
A) 查营业执照
B) 视频验厂
C) 合同条款
投票 → 👇"
```

**采购教训类内容**:
```
"澳洲买家去中国验厂，最容易忽略哪件事？
→ 投票"
```

**对比争议类**:
```
"工厂直采 vs 代理商：有人选错后多花了 30%
你的经历呢？引用转发分享 👇"
```

### 4.3 投票设计原则

- **2-4 个选项**：太多选项降低投票完成率
- **选项互斥且具体**：避免"以上都不是"类选项
- **与内容紧密相关**：投票选项 = 内容的自然延伸
- **设置 1 天投票期**：激发紧迫感

---

## 五、X 平台内容模板

### 5.1 模板 X-A：推文串（Thread）

适用于：步骤教程、案例分析、深度洞察

```
[推文 1 - Hook]
"帮一个澳洲客户省了 8 万澳元。只用了一招——验厂。"

[推文 2 - 背景]
"他在阿里巴巴找了 3 家供应商。
报价差不多。
直到我们做了第 2 步——"

[推文 3 - 揭秘]
"第 2 步：要求对方提供工厂实时视频。
不是照片。
是工作时间内的真实生产线。

结果：2 家拒绝，1 家含糊其辞。
那个'含糊其辞'的，报价最低。"

[推文 4 - 框架]
"中国验厂 3 步法：
1. gsxt.gov.cn 查营业执照（免费）
2. 要求工厂实时视频（工作时间）
3. 直接打电话给认证机构核实

省下的不只是钱。是时间和信任。"

[推文 5 - CTA/投票]
"你去中国验厂时，最难的是哪一步？
A) 找到真实工厂
B) 确认认证真假
C) 合同谈判
→ 投票"
#ChinaSourcing #FactoryVerification
```

### 5.2 模板 X-B：单推高冲击

适用于：反常识洞察、行业警告、快速记录

```
"一个澳洲老板付了 2 万定金。
供应商消失了。

不是因为运气差。
是因为他跳过了第 2 步。

验证中国工厂，我只用这一招 →"
```

### 5.3 模板 X-C：超级推文（Long-form）

适用于：深度复盘、行业报告节选、案例拆解

```
标题：[推文正文前 100 字符作为标题]

正文（分段落，每段 ≤ 280）：
第一段：核心反常识结论
第二段：案例/数据佐证
第三段：步骤框架
第四段：WAG 定位 + CTA

结尾投票：
"看完你下一步会做什么？
A) 查 gsxt.gov.cn
B) 找人一起去验厂
C) 先观望
D) 分享给需要的人"
```

### 5.4 模板 X-D：投票驱动型

适用于：社区调研、需求挖掘、话题预热

```
"澳洲企业从中国采购，踩坑率有多高？

A) 10% 以下
B) 10-30%
C) 30-50%
D) 超过 50%

→ 投票，看完数据再说。#ChinaSourcing"
```

---

## 六、X 专属 Hook 库

### 6.1 Hook 类型分类

#### 类型 1：反常识冲击型（最高互动）
```
结构: [反常识事实] + [暗示后果]
字数: 60-90 字符

示例:
"85% 的澳洲企业用 Alibaba 找供应商。
但 Alibaba 上 30% 的'工厂'是贸易公司。"
→ 34 字符余量，完美

"中国有 8000 万家注册企业。
免费查清任何一家，只需 5 分钟。
你用过吗？"

"工厂直采能省 30%。
但 90% 的澳洲买家卡在第 1 步。"
```

#### 类型 2：数字量化型（高可信度）
```
结构: [大数字] + [具体动作/后果]
字数: 60-100 字符

示例:
"3 个步骤。5 分钟。0 费用。
验证任何中国供应商的真实身份。"

"一个 gsxt.gov.cn 账号。
让一个澳洲老板避免了 12 万的定金损失。"
```

#### 类型 3：故事反转型（高传播）
```
结构: [结果] → [原因揭示]
字数: 80-120 字符

示例:
"他付了定金，供应商失联了。
不是因为对方是骗子。
是因为他没做第 2 步。"

"报价最低的那家，反而最危险。
不是因为价格低。
是因为他跳过了验证。"
```

#### 类型 4：直接挑战型（高参与）
```
结构: [挑战读者] + [具体问题]
字数: 60-90 字符

示例:
"你在阿里巴巴找了几个供应商？
我赌你没见过任何一家的真实生产线。"

"下次去中国之前，问自己一个问题：
你能说出供应商的准确地址吗？"
```

#### 类型 5：数据引用型（高权威）
```
结构: [来源] + [具体数据] + [洞察]
字数: 80-120 字符

示例:
"中国占澳洲进口来源 62%。
但每 3 个采购商里，有 1 个跳过了一个关键步骤。"
```

### 6.2 Hook 禁用语料库

| X 禁用 | LinkedIn 可用 | 原因 |
|--------|--------------|------|
| "你可能不知道" | 可用 | X 受众对灌输式开头有强烈抵触 |
| "今天我要分享" | 可用 | X 受众不关心"分享者"，只关心内容 |
| "很多人问我" | 禁用 | 虚假社会证明，X 受众直接拉黑 |
| "史上最强" | 可用 | LinkedIn 更包容，X 更挑剔 |
| "请转发" | 禁用（改为引用转发） | 直接 CTA 太生硬 |

### 6.3 Hook vs LinkedIn 效果对比假设

| Hook 类型 | LinkedIn ER 预期 | X 互动预期 | 说明 |
|----------|-----------------|-----------|------|
| 反常识冲击 | 中（20-30%） | 最高（高转发/投票） | X 用户爱分享"反常识" |
| 数字量化 | 高（30%+） | 高（高书签） | X 用户爱收藏实用信息 |
| 故事反转 | 高（25%+） | 高（高回复讨论） | X 评论虽然浅，但故事能引发回复 |
| 直接挑战 | 低（10%） | 最高（高回复） | 挑战型 hook 在 X 上比 LinkedIn 更有效 |

---

## 七、接口定义：核心内容协调

### 7.1 X-Post 输入接口

```typescript
interface XPostInput {
  // 来自 LinkedIn Post 或 SEO Blog 的核心内容
  coreContent: {
    topic: string;           // 核心话题
    hook: string;            // LinkedIn Hook（需转换）
    body: string[];          // 正文段落列表
    keyInsights: string[];   // 关键洞察（1-3 条）
    cta: string;             // 原始 CTA
    hashtags: string[];      // LinkedIn Hashtags
  };

  // X 平台特定参数
  platformConfig: {
    format: 'thread' | 'single' | 'longform' | 'poll';  // 推文格式
    tone: 'provocative' | 'data' | 'story' | 'challenge'; // 语气风格
    maxHashtags: 2;       // X 最大 hashtag 数
    includePoll: boolean; // 是否附加投票
    pollOptions?: string[]; // 投票选项（如果 includePoll=true）
  };

  // 内容源追溯
  source: {
    type: 'linkedin-post' | 'seo-blog' | 'manual';
    filePath?: string;
    linkedinPostId?: string;
  };
}
```

### 7.2 X-Post 输出接口

```typescript
interface XPostOutput {
  // 推文内容
  tweets: XTweet[];  // 推文串或多条独立推文

  // 元数据
  metadata: {
    totalChars: number;
    tweetCount: number;
    format: string;
    hashtags: string[];
    pollAttached: boolean;
    recommendedPostingTime: string; // 格式: "HH:MM AEST"
  };

  // 发布指南
  postingGuide: {
    sequence: string;       // 发布顺序说明
    timing: string;         // 时间建议（基于 WAG 澳洲受众）
    firstComment?: string;  // 首评模板（用于种子互动）
  };
}

interface XTweet {
  index: number;       // 推文序号（0=首条）
  content: string;     // 推文正文
  media?: {
    type: 'image' | 'none';
    caption?: string;
  };
  poll?: {
    options: string[];
    durationDays: 1;
  };
  isPinned?: boolean;  // 首条是否置顶
}
```

### 7.3 核心内容 → X 内容转换规则

```typescript
// 转换规则引擎
const conversionRules = {
  // 1. LinkedIn Hook → X Hook（必须转换）
  hook: {
    linkedIn: "Before paying any deposit, verify three things: factory, not trading company.",
    x: "85% of Australian brands skip step 2. That's where the 12万定金 disappears.",
    transformation: "数据强化 + 反常识化 + 缩短至 100 字符"
  },

  // 2. LinkedIn 步骤框架 → X 推文串
  bodyStructure: {
    linkedIn: "3 步，每步 2-3 句展开",
    x: "3 条推文，每条 1-2 句核心信息",
    transformation: "每段 → 单条快节奏推文，增加悬念过渡"
  },

  // 3. LinkedIn Hashtags → X Hashtags
  hashtags: {
    linkedIn: "6-10 个标签",
    x: "1-2 个标签（嵌入正文末尾或首条末尾）",
    transformation: "精选最高相关性标签，去重"
  },

  // 4. LinkedIn CTA → X CTA
  cta: {
    linkedIn: "What verification step would you add?",
    x: "投票 + 引用转发",
    transformation: "问题 CTA → 投票/引用转发（降低用户行动门槛）"
  },

  // 5. 图片使用策略
  media: {
    linkedIn: "配图增强，视觉引导",
    x: "仅当图片能强化核心数据时才用（如：数据对比截图、工具截图）",
    transformation: "宁缺毋滥，避免纯装饰性图片"
  }
};
```

### 7.4 与 Content Hub 的协调接口

```typescript
interface ContentHub协调接口 {
  // X-Post 作为消费方：从 Hub 获取核心内容
  consume: {
    sourceTypes: ['linkedin-post', 'seo-blog', 'manual-topic'];
    ragContext: boolean;  // 是否注入 WAG 博客 RAG 内容
  };

  // X-Post 作为生产方：向 Hub 回传数据
  produce: {
    outputs: ['draft-tweets', 'poll-data', 'hashtag-suggestions'];
    feedbackLoop: boolean;  // 发布后的互动数据回传 Hub
  };

  // 跨平台内容映射
  crossPlatform: {
    linkedInToX: boolean;    // 支持从 LinkedIn 内容转换
    seoBlogToX: boolean;     // 支持从 SEO 博客转换
    xToLinkedIn: boolean;    // 支持从 X 内容反向补充分发
    xToFacebook: boolean;    // 支持从 X 内容转换到 Facebook
  }
}
```

---

## 八、发布时间策略

### 8.1 WAG 受众时区分析

| 时区 | 受众活跃时段 | 最佳发布时间 |
|------|------------|-------------|
| AEST（悉尼/墨尔本） | 7-9 AM, 12-1 PM, 6-8 PM | **7-8 AM AEST**（通勤时间刷 X） |
| ACST（阿德莱德） | 6:30-8:30 AM, 11:30-1:30 PM | **6:30-7:30 AM ACST** |
| AWST（珀斯） | 早间活跃度低 | 避免主动发布 |

### 8.2 发布节奏建议

| 发布类型 | 频率 | 理由 |
|----------|------|------|
| 标准推文 | 每周 3-5 条 | X 算法惩罚高频发布（>5条/天降权） |
| 推文串 | 每周 1-2 条 | 推文串需要更深度内容准备 |
| 投票推文 | 每周 1-2 条 | 投票驱动互动，应与内容发布分开 |
| 总计上限 | 每天不超过 5 条 | 超过触发降权 |

### 8.3 LinkedIn vs X 发布时间差异

| | LinkedIn | X |
|--|---------|---|
| 最佳工作日 | 周二-周四 | 周一-周三 |
| 最佳时段 | 9-11 AM AEST | 7-8 AM AEST |
| 时区基准 | AEDT | AEST（对齐通勤场景） |
| 发布后响应窗口 | 60 分钟内 | **30 分钟内**（更短，更关键） |

---

## 九、WAG X 账号内容策略建议

### 9.1 内容类型优先级

| 优先级 | 内容类型 | 理由 | 推荐格式 |
|--------|----------|------|----------|
| ★★★ | 工厂验证教程 | WAG 核心差异化，解决核心痛点 | 推文串 + 投票 |
| ★★★ | 反常识数据 | X 用户最爱分享"反常识" | 单推 + 数据图 |
| ★★ | 验厂教训案例 | 故事性强，传播潜力高 | 推文串 |
| ★★ | 行业趋势评论 | 蹭热点，引关注 | 单推快评 |
| ★ | 品牌软推广 | X 用户反感硬广，慎用 | 极少出现 |

### 9.2 X vs LinkedIn 内容差异化原则

```
LinkedIn: 教育型 → "教你怎么做" → 专业形象积累
X: 挑战型 → "你可能一直做错了" → 情绪共鸣 + 快速传播

LinkedIn: 步骤要完整（3步缺一不可）
X: 步骤要精简（最关键 1 步即可）

LinkedIn: 引用专家/数据提升权威
X: 引用自身/客户经历更真实
```

### 9.3 X 账号增长策略（自然流量）

1. **每周 1 条投票**：算法加权，持续积累基础互动
2. **每月 2-4 条推文串**：深度内容，建立专业认知
3. **每日不超过 5 条**：避免触发降权
4. **回复所有评论（前 30 分钟）**：最大化算法加权窗口
5. **主动引用转发相关话题**：扩大触达圈

---

## 十、SKILL.md 草稿

```markdown
---
name: wag-x-post
description: "Generate WAG-branded X/Twitter posts from core content. Converts LinkedIn/SEO
             content to X-native format with hooks, threads, polls, and hashtag optimization.
             Invoked when user wants to create X posts for WAG."
---

# WAG X-Post Generator

## Overview

Generates X/Twitter posts for Winning Adventure Global, adapting core content (LinkedIn posts,
SEO blogs, or manual topics) into X-native formats. X content is always in English.

**Key difference from LinkedIn**: X rewards provocation, speed, and interaction — not education.
The same "3-step verification" content works on both platforms, but requires completely
different hooks, tone, and CTAs.

## X Format Types

| Format | Characters | Use When |
|--------|-----------|----------|
| Single Tweet | 280 max | Provocative insight, quick take |
| Thread | 3-5 tweets × 280 | Step-by-step how-to, case studies |
| Long-form | 10,000 max (Blue) | Deep analysis, detailed guides |
| Poll Tweet | 280 + poll | Opinions, community questions |

## Content Conversion Rules

### LinkedIn Hook → X Hook

**LinkedIn**: "Before paying any deposit for your China order, verify three things: factory, not trading company."
↓
**X**: "85% of Australian brands skip step 2. That's where the 12万定金 disappears."

**Transformation logic**:
1. Add a counter-intuitive data point
2. Shorten to ≤ 100 characters (mobile first-view)
3. Replace educational tone with challenge/provocation

### LinkedIn CTA → X CTA

**LinkedIn**: "What verification step would you add? Share in comments."
↓
**X Poll**: "Which step do most brands skip?
A) gsxt.gov.cn check
B) Live factory video
C) Certification verification"

**Transformation logic**:
1. Convert open question → binary/multiple choice poll
2. Lower friction: tap vote >> write comment
3. Poll = algorithm-weighted engagement signal

### Hashtag Rules

- **Single tweet**: 1-2 hashtags, embedded in body or at end
- **Thread**: 0-1 hashtag on first tweet only
- **Poll tweet**: No hashtags (poll IS the engagement driver)
- **NEVER use more than 2 hashtags** — triggers spam detection

## RAG Implementation

Before generating, retrieve relevant WAG content:

1. **Glob** — Find all blog files: `content/blog/*.mdx`
2. **Grep** — Search for content matching the topic (`head_limit: 2`)
3. **Read** — Extract from top 2 matched files
4. **Incorporate** — Source specific stats, examples, case details for the X post

## X Hook Formulas (Ranked by Expected Performance)

1. **Counter-intuitive data**: "[Statistic]. Most people don't know this."
2. **Challenge**: "I bet you've never done this before."
3. **Story reversal**: "The cheapest supplier disappeared. Here's why."
4. **Poll hook**: "Quick question: [polarizing choice]"

## Critical Rules

- **Hook ≤ 100 characters** (not 210 like LinkedIn)
- **Max 2 hashtags** — X algorithm penalizes hashtag spam
- **Use polls** for CTAs — higher engagement than comment requests
- **No links in body** — links reduce reach. Put links in replies
- **First 30 minutes critical** — reply to all engagement immediately
- **Max 5 tweets/day** — exceeds = reach penalty
- **No emoji** — WAG brand rule
- **No soft CTA** — "share your thoughts" underperforms. Use polls or quote tweets

## Output

After generation, present to user:
1. Ready-to-copy X post(s)
2. Posting time recommendation (AEST)
3. Poll options (if applicable)
4. First reply template for seeding engagement
```

---

## 附录：核心洞察总结

### X vs LinkedIn 内容策略对比

| 维度 | LinkedIn | X |
|------|----------|---|
| **核心目标** | 专业形象积累 | 快速传播与互动 |
| **最佳内容** | 3步教育框架 | 反常识洞察 |
| **Hook 长度** | 210 字符 | 100 字符 |
| **CTA 类型** | 评论问题 | 投票/引用转发 |
| **Hashtag 数量** | 6-10 个 | 1-2 个 |
| **图片策略** | 配图必要 | 宁缺毋滥 |
| **最佳时间** | 9-11 AM AEST | 7-8 AM AEST |
| **互动窗口** | 60 分钟 | **30 分钟** |
| **内容半衰期** | 48 小时+ | 24 小时 |

### 跨平台内容漏斗

```
SEO Blog（深度教育）
    ↓ 提炼 → 核心洞察
LinkedIn Post（结构化教程）
    ↓ 转化 → 反常识Hook + 投票CTA
X Post（快节奏传播）
    ↓ 适配 → Facebook Post（社区运营）
```

### WAG X 内容差异化核心原则

**LinkedIn 说："学习这个方法"**
**X 说："你可能一直做错了——这里有一个数据"**

这是两种完全不同的心理框架：LinkedIn 受众处于"吸收"模式；X 受众处于"筛选+判断"模式。只有 provocative 的内容才能穿透 X 的噪音。

---

**★ Insight ─────────────────────────────────────**
1. **X 是速度游戏**：前 30 分钟的互动率决定算法分发量，同一内容在错误时间发布 vs 正确时间发布，曝光差距可达 10 倍以上
2. **投票是 X 独有的算法加权机制**：带投票的推文天然获得 3-5 倍的分发加权，这是 LinkedIn 完全不具备的优势——每次创建投票 = 主动请求算法给内容加权重
3. **LinkedIn → X 转化不是翻译而是再创作**：同样的"工厂验证三步法"，在 LinkedIn 用教育语气讲，在 X 用挑战语气讲，核心信息相同但传播逻辑完全不同——这是两种完全不同的内容基因
─────────────────────────────────────────────────
