# 分析报告 #07：Facebook Post Skill 设计方案

**创建时间**：2026-04-01
**状态**：草稿
**依赖**：analysis-05/06（四渠道协调层 + X-post）

---

## 一、Facebook 与其他平台的本质差异

### 1.1 平台定位的根本分歧

LinkedIn 是**职业身份**平台——用户以"专业人士"身份消费内容，内容需要证明能力、输出洞察、建立思想领导力。X 是**即时信息**平台——用户以"公民记者"身份消费内容，极速、简短、观点鲜明是核心。Facebook 是**社区关系**平台——用户以"家庭成员/朋友圈一员"身份消费内容，情感共鸣和社区归属感才是驱动力。

这意味着，同一核心内容（"去中国验厂前要验证的三件事"）在三个平台上的正确表达方式完全不同：

| 维度 | LinkedIn | X/Twitter | Facebook |
|------|---------|-----------|----------|
| 身份角色 | 专业顾问 | 快讯播报员 | 社区老手 |
| 内容调性 | 权威 + 数据 | 简洁 + 观点 | 温暖 + 真实 |
| 核心价值 | 证明专业能力 | 第一时间知道 | 我们都是这么过来的 |
| 用户期待 | 学到东西 | 知道发生了什么 | 感同身受、产生连接 |

### 1.2 算法机制的三大差异

**第一，信号优先级不同。** LinkedIn 算法给"看完率"和"专业讨论"最高权重。X 算法给"转发速度"和"回复深度"最高权重。Facebook 算法的核心是**Saves > Shares > Comments > Reactions**，其中收藏（Saves）是最强信号。这意味着 Facebook 内容的目标不是"让人看"，而是"让人想以后再看"——这是一个完全不同的创作逻辑。

**第二，发现机制不同。** LinkedIn 主要靠"职业关系网络"触达。X 主要靠"热门话题 + 算法"触达。Facebook 在 2026 年的动态中有**50% 来自用户未关注的账户**（AI 推荐内容），而推荐内容中约 30% 由 AI 根据 UTIS 模型推送。这意味着 Facebook 内容要进入推荐流，需要通过 UTIS（用户真实兴趣调查）测试——用户需要被直接问"这条内容是否与你相关"，而他们的回答会直接影响分发。

**第三，链接惩罚最严。** LinkedIn 在帖子正文放外部链接有轻微惩罚，但可以通过蹭热点标题弥补。X 的链接卡是标准格式，没有额外惩罚。Facebook 的链接帖子触达率已降至 **<1%**——这意味着在 Facebook 上，内容必须**自身完成价值交付**，不能把 Facebook 当作流量跳转的跳板。

### 1.3 WAG 在 Facebook 上的战略定位

根据 wag-content-hub 的四渠道架构，WAG 的 Facebook 存在应该与 LinkedIn 有所区分：

- **LinkedIn**：B2B 思想领导力，触达职业决策者，强调"我懂你的专业困境"
- **Facebook**：社区渗透 + 情感连接，触达中小企业主作为"人"而非"采购经理"，强调"我们都走过这条路"
- **X**：即时动态、快讯、行业新闻评论
- **SEO Blog**：深度内容，长尾搜索捕获

WAG 在 Facebook 上的目标受众依然是 Australian SME owners（AV/音频/照明/汽车等行业），但接触方式从"专业顾问"转变为"同路人"。内容应该是：真实的、有温度的、带着亲身经历感的。

---

## 二、Facebook 内容格式策略

### 2.1 格式优先级矩阵

基于 2025-2026 平台数据和 WAG 的 B2B 定位：

| 优先级 | 格式 | 互动率 | WAG 适用度 | 理由 |
|--------|------|--------|-----------|------|
| **#1** | Reels（15-30秒） | 高（+22% vs 普通视频） | ★★★★☆ | 算法最高权重，但制作成本高 |
| **#2** | 照片帖子 | 最高（+35% vs 文字） | ★★★★★ | WAG 可拍工厂实景、客户合影 |
| **#3** | 轮播帖子 | 强（+35% vs 单图） | ★★★★★ | 最适合"3步验厂"类教育内容 |
| **#4** | 文字帖子（民调/问答） | 中等 | ★★★☆☆ | 低成本互动测试 |
| **#5** | 直播 | 实时最高 | ★★★☆☆ | Q&A、工厂参观直播 |

**关键洞察**：对于 WAG，轮播帖子是内容形式的最佳选择——"3步验厂核查清单"做成轮播，既满足了 Facebook 的 Save 信号（清单类内容天然适合收藏），又符合 WAG 教育型 B2B 的定位。

### 2.2 各格式最佳实践

**照片帖子**：
- 情感连接 > 产品展示
- 工厂实地拍摄 > 设计素材
- 客户见证合影（带授权） > 纯文字
- 图注（caption）要讲故事，而不只是描述图片
- 最佳尺寸：1200x630（Feed）、1080x1080（轮播单张）

**轮播帖子**：
- 第一张幻灯片：强力 hook + 问题引导（决定用户是否滑动）
- 中间幻灯片：干货信息，逐条展开
- 最后一张：明确 CTA（"收藏这张清单，下次验厂用得上"）
- 目标：用户保存轮播帖子而不是只浏览一遍
- 轮播 + Save CTA 是 Facebook 高效内容的黄金组合

**Reels**：
- 15-30 秒完播率最高（53.7%）
- 竖版 9:16 格式
- 前 3 秒必须有强力 hook
- WAG 适合的 Reels 题材：工厂实拍（生产线、仓库、验货场景）、客户好评片段、"验厂常见错误"快速科普
- **注意**：Reels 适合算法发现，但 WAG 的 Facebook 主要目标是社区渗透，不应将 Reels 作为主要格式

**文字/问答帖子**：
- 短句为主，每句一意
- 适合发问："有多少澳洲进口商知道可以在 gsxt.gov.cn 查到工厂营业执照？"
- 适合民调："你的上一次中国验厂是哪种形式？——自己去的 / 委托代理 / 还没去过"

---

## 三、Hook 与 CTA 策略

### 3.1 Facebook Hook 公式（区别于 LinkedIn）

LinkedIn 最强 hook 是"3步框架"结构（ER=33%），因为 LinkedIn 用户是来学东西的。Facebook 用户期待的是**情感共鸣**，hook 需要先建立连接，再传递价值。

**Facebook Hook 优先级**：

| 排名 | Hook 类型 | 公式 | WAG 示例 |
|------|----------|------|---------|
| **#1** | 真实经历开场 | "We just got back from..." / "A client told us..." | "一个澳洲客户告诉我们，他飞去广州验厂，结果工厂大门紧闭" |
| **#2** | 社区共鸣 | "If you've ever tried to verify a China factory..." | "如果你曾经试图验证一个中国工厂的真实性，你懂的" |
| **#3** | 数字冲击 + 承诺 | "X% of Australian importers skip this step. Don't be one of them." | "85% 的澳洲进口商用 Alibaba 找供应商，但有多少人真正验证过工厂真实性？" |
| **#4** | 快速清单 | "Save this factory verification checklist before your next China trip" | "收藏——下次去中国验厂前要检查的 5 项" |

**LinkedIn Hook vs Facebook Hook 的本质区别**：

LinkedIn hook 是**认知刷新**："你之前不知道的 X " → 用户因为"学到新东西"而点赞。
Facebook hook 是**情感连接**："你也有过这种感觉对不对" → 用户因为"被理解"而互动。

### 3.2 CTA 策略（Facebook 专属）

Facebook 的互动信号层级决定了 CTA 的设计方向：

**首要目标：驱动 Saves（收藏）**
- "Save this post — you'll want this checklist before your next factory visit"
- "Bookmark this for your next China trip"
- 收藏 CTA 对应的是**清单类、教育类内容**，这类内容在 WAG 的验厂/采购主题中天然丰富

**次要目标：驱动 Shares（分享）**
- "Tag a friend who's importing from China"
- "Send this to someone who needs to hear this"
- 分享 CTA 对应的是**普适性强的内容**，如"所有澳洲进口商都应该知道的事"

**第三目标：驱动 Comments（评论）**
- "Have you ever had a factory refuse a site visit? What happened?"
- "What's the biggest challenge you've faced verifying suppliers in China? Tell us below."
- 评论 CTA 对应的是**经验分享型内容**，制造"我也经历过"的共鸣

**避免的 CTA 类型**：
- "Like if you agree"（互动诱饵，被算法惩罚）
- "Tag a friend who needs this"在纯文字帖子中效果差（需配合视觉内容）
- 任何引导点击外部链接的 CTA（链接 = 算法毒药）

---

## 四、Hashtag 策略

### 4.1 Facebook Hashtag 效果远低于 Instagram/X

| 平台 | 推荐数量 | 发现贡献度 |
|------|---------|-----------|
| Instagram | 10-30 个 | 高 |
| X/Twitter | 1-2 个 | 中 |
| **Facebook** | **2-3 个** | **极低** |

Facebook 算法不依赖 hashtag 发现内容。Hashtag 在 Facebook 上的主要作用是**帮助品牌追踪和归档**，而非触达新受众。

### 4.2 WAG Facebook Hashtag 矩阵

**核心标签（始终使用，2-3 个）**：
- #AustraliaChina —— 地域 + 贸易定位
- #SourcingFromChina —— 核心业务动作
- #AustralianBusiness / #SmallBusinessAustralia —— 受众标签

**行业标签（按内容主题轮换，1-2 个）**：
- #SupplyChain / #ImportExport —— 供应链通用
- #ManufacturingChina —— 制造相关
- #AVIndustry / #EventIndustry —— WAG 具体行业（视受众定位）

**品牌标签（谨慎使用）**：
- #WinningAdventureGlobal / #WAG —— 仅在品牌相关内容中使用
- 不超过 1 个品牌标签

**Hashtag 放置规则**：
- 放在帖子**最后一行**
- 用 2-3 行空行与正文隔开
- 不在正文中散落 hashtag
- 多词标签用首字母大写：#AustraliaChina 不是 #australiachina

---

## 五、发布时间策略

### 5.1 整体高峰（基于 50,000+ 账户、27 亿次互动分析）

- **最佳日期**：周二、周三、周四
- **最佳时段**：上午 8:00 - 下午 3:00
- **Reels 最佳**：工作日下午 6-9 点，周末上午 9 点至中午

### 5.2 WAG 受众特定时间

WAG 的目标受众是 Australian SME owners，主要群体为 AV/音频/照明/汽车行业。这些人的 Facebook 使用习惯：
- **工作日早晨**：通勤/早会前刷 Facebook（7-9 AM AEDT）
- **午休时间**：12-1 PM AEDT
- **下班后**：5-7 PM AEDT

**推荐发布时间（澳大利亚 AEDT）**：

| 优先级 | 时间 | 理由 |
|--------|------|------|
| **最优** | 周二/周三/周四 12:00-13:00 | 午休浏览，注意力相对集中 |
| **次优** | 周二/周三/周四 8:00-9:00 | 通勤时间，快速浏览 |
| **可选** | 周四 17:00-18:00 | 下班放松，愿意互动 |

**避免**：周一（开工焦虑期）、周五下午（周末心态，无心工作话题）

### 5.3 首发后 60 分钟是关键窗口

Facebook 算法给发布后第一个小时内有强互动的内容**算法助推**。这与 LinkedIn 一致——都需要运营者在首发后积极响应评论。

---

## 六、内容适配：从核心内容到 Facebook 帖子

### 6.1 跨平台内容改编逻辑

同一个 WAG 核心内容（以"3步验厂核查清单"为例），在各平台的改编路径：

```
核心洞察：去中国验厂前，必须验证（1）营业执照、（2）真实产线、（3）直接联系工厂

LinkedIn 版本：
→ Hook: "Before paying any deposit, verify three things: factory, not trading company."
→ Body: 3步框架 + 具体工具（gsxt.gov.cn）
→ Tone: 专业顾问，数据支撑
→ CTA: "Did you know gsxt.gov.cn is free? Were you ever asked to check one?"
→ Hashtags: #ChinaSourcing #FactoryVerification #AustraliaChina #SupplyChain #ImportFromChina #AustralianBusiness

Facebook 版本：
→ Hook: "A client flew to Guangzhou to visit a factory last month. The factory wasn't there."
→ Body: 先讲故事（发生了什么） → 教训（应该怎么避免） → 分享给大家的清单
→ Tone: 社区老手，有过相似经历，愿意分享
→ CTA: "Save this checklist before your next China trip — and comment: have you ever shown up and the factory wasn't ready?"
→ Hashtags: #AustraliaChina #SourcingFromChina #AustralianBusiness

X 版本：
→ Hook: "Before paying a China factory deposit: 3 checks most Aussie importers skip"
→ Body: 极短版，每条不超过 280 字符，可以拆成推文串
→ Tone: 快讯，直接，给干货
→ CTA: 引导看 link（但 X 链接惩罚低于 FB）
→ Hashtags: 1-2 个核心标签

SEO Blog 版本：
→ Hook: 标题党优化："What Really Happens When You Visit a Chinese Factory (And How to Verify It First)"
→ Body: 深度展开，多 H2，1500+ 字
→ Tone: 权威教育
→ CTA: 软性引导到 Enquiry 页面
```

### 6.2 内容改编检查清单

在将核心内容适配到 Facebook 时，必须检查：

- [ ] Hook 是否从"教知识"转变为"讲故事"？
- [ ] 正文前两句话是否建立了情感连接，而不只是抛数据？
- [ ] CTA 是否驱动 Saves/Shares/Comments 而非外部点击？
- [ ] Hashtag 是否控制在 2-3 个？
- [ ] 正文是否有链接？（如有，移到评论区）
- [ ] 内容是否能独立在 Facebook 内部完成价值交付？

---

## 七、SKILL.md 草稿

```markdown
---
name: wag-facebook-post
description: "Generate WAG-branded Facebook posts adapted from core content"
---

# WAG Facebook Post Generator

## Overview

Generates Facebook posts for Winning Adventure Global that prioritize community engagement and emotional resonance over professional authority. Facebook is a relationship-first platform — content should feel like advice from a trusted community member, not a B2B consultant.

**When to use:** When a user wants to create a Facebook post for WAG, or when adapting core content (from LinkedIn or SEO blog) to Facebook format.

## WAG Business Model Context

Same as wag-linkedin-post — see that skill for full context.

## Platform Differences from LinkedIn

| Dimension | LinkedIn | Facebook |
|-----------|----------|----------|
| User Identity | Professional | Family/Community member |
| Content Tone | Authoritative + Data | Warm + Authentic |
| Core Value | "Learn from an expert" | "We all went through this" |
| Hook Strategy | Cognitive refresh (3-step frameworks) | Emotional connection (real stories) |
| Engagement Goal | Comments/Discussions | Saves > Shares > Comments |
| Link Treatment | Mild penalty | <1% reach (AVOID in body) |
| Hashtag Count | 6-10 | 2-3 |

## Socratic Question Flow

Before generating, clarify the post direction with exactly 4 questions (fewer than LinkedIn's 5 — Facebook audiences respond better to less structured, more conversational approaches):

**Q1 — Story Discovery:**
"这个话题背后有没有一个真实的经历——你、客户或行业内发生的事？"
*(Is there a real story behind this topic — from you, a client, or the industry?)*

Facebook needs **emotional hooks before educational value**. If the user has a war story, lead with it. If not, create a composite scenario based on WAG experience.

**Q2 — Community Angle:**
"这篇内容是想让读者感到'我也是这样'，还是想让他们'学到新东西'？"
*(Does the audience need to feel "I've been there too" or "I just learned something new"?)*

For Facebook, prioritize "I've been there too" — this drives Saves and Shares. "Learned something new" works better on LinkedIn.

**Q3 — Engagement Goal:**
"这条帖子的主要互动目标是收藏清单、分享给朋友、还是评论区讨论？"
*(What's the primary engagement goal: save the checklist, share with a friend, or join the discussion in comments?)*

This determines CTA type.

**Q4 — Visual Asset:**
"有适合配图的素材吗？——工厂实拍、客户合影、数据图表？"
*(Do you have visual assets? — factory photos, client photos, data graphics?)*

Photos get +35% higher engagement than text-only. Reels get the highest algorithmic boost. But WAG's sweet spot is carousel posts with real imagery.

## RAG Implementation

Same procedure as wag-linkedin-post:
1. Glob — find blog files
2. Grep — search matching content (head_limit: 3)
3. Read — extract from top matches
4. Incorporate — use WAG-specific stats, stories, case studies

Always invoke RAG to retrieve at least 1 WAG blog post before generating. This grounds the post in WAG's actual experience.

## Facebook Post Templates

### Template A: War Story → Lesson → Saveable Checklist
(Highest performance for B2B on Facebook — drives Saves and Shares)

```
[HOOK — emotional open, max 125 characters]
Formula: "A client did X. What happened next was..."
Example: "A client flew to Guangzhou to verify a factory last month. The factory wasn't there."

[BREAK]

[BODY — 3 paragraphs]
Paragraph 1: What happened (specific, sensory details — amounts, places, timeline)
Paragraph 2: What went wrong (the verification step that was skipped)
Paragraph 3: How to avoid it (the checklist — framed as "here's what we learned")

[BREAK]

[CHECKLIST — 3-5 bullet points, numbered]
Before your next factory visit, verify:
1. [Business license on gsxt.gov.cn — takes 2 minutes]
2. [Live production lines during working hours — video call counts]
3. [Direct contact with the person who signs your contract]
... (add as many as relevant)

[BREAK]

[CTA — Save-driven with experience trigger]
"Save this checklist for your next China trip. And if you've ever arrived at a factory that wasn't what you expected — tell us what happened in the comments."

[HASHTAGS — 2-3 only, at bottom]
#AustraliaChina #SourcingFromChina #AustralianBusiness
```

### Template B: Quick Wins List
(For tips, hacks, or fast actionable content)

```
[HOOK — promise-led, max 90 characters]
Formula: "The [X] thing I wish I knew before [action]"
Example: "The one thing I wish I knew before my first China factory visit"

[BREAK]

[BODY — punchy paragraphs, short sentences]
[Context: why this matters for Australian SME owners]

[BREAK]

[LIST — 3-5 numbered quick wins]
1. [Quick win with specific tool or action]
2. [Quick win with consequence of skipping]
3. [Quick win with Aussie-specific angle]

[BREAK]

[CTA — share-driven]
"Save this for your next sourcing trip. And tag a fellow importer who needs to see this."

[HASHTAGS — 2-3]
```

### Template C: Question/Discussion Starter
(For opinion pieces, industry observations)

```
[HOOK — conversation opener, max 90 characters]
Formula: "[Question about a shared industry experience]"
Example: "How many Australian importers actually verify a factory's license before placing an order?"

[BREAK]

[BODY — 2 paragraphs]
Paragraph 1: The observation (what you noticed, why it matters)
Paragraph 2: Your take (WAG's perspective, honest and direct)

[BREAK]

[ENGAGEMENT PROMPT]
"What's been your experience? Have you ever skipped verification and regretted it? Or got caught out by a trading company posing as a factory?"

[HASHTAGS — 2-3]
```

## CTA Frameworks (Ranked by Engagement Value)

Facebook's algorithm values: Saves > Shares > Comments

| CTA Type | Formula | Example | Primary Signal |
|----------|---------|---------|----------------|
| **Save for later** | "Save this [checklist/guide] for when you need it" | "Save this factory checklist before your next China trip" | Saves |
| **Share with network** | "Tag a [friend/colleague] who [specific situation]" | "Tag an importer who's about to visit a China factory" | Shares |
| **Share your experience** | "Have you ever [specific situation]?" | "Have you ever shown up and the factory wasn't ready?" | Comments |
| **Complete the sentence** | "The biggest [industry problem] I see is..." | "The biggest mistake Aussie brands make is..." | Comments |
| **Poll/Opinion** | "Which would you choose: [A] or [B]?" | "Would you rather: pay for a site visit upfront, or..." | Comments |

**Never use:**
- "Like if you agree" — engagement bait, algorithm penalized
- External links in post body — <1% reach
- More than one CTA per post
- Generic CTAs: "Share your thoughts" alone

## Engagement Signal Priority

```
Saves (highest value) → Shares → Comments → Reactions → Clicks
Algorithm weight:    10x       5x        3x          1x         0.5x
```

**Implication:** A post with 10 saves and 5 comments outperforms a post with 50 reactions. Design for Saves first.

## Content Format Decision Tree

| Topic Type | Recommended Format | Why |
|------------|-------------------|-----|
| Verification how-to | Template A (Story+Checklist) | Drives Saves, community storytelling |
| Warning/Cautionary | Template A (War Story) | Emotional hook, shareability |
| Quick tips/Process | Template B (Quick Wins) | Digestible, saveable |
| Industry opinion | Template C (Question) | Discussion driver |
| Brand introduction | Story + Image (Template A without checklist) | Warm, human, authentic |
| Client milestone | Story + Real Photo | Community celebration |

**Format priority for WAG topics:** Story+Checklist > Story Only > Quick Wins > Discussion > Brand Intro

## Hashtag Strategy

Facebook hashtags have minimal discovery impact — use for **tracking and branding only**.

| Type | Count | Examples |
|------|-------|----------|
| Core tags (always) | 1-2 | #AustraliaChina #SourcingFromChina |
| Audience tag | 1 | #AustralianBusiness #SmallBusinessAustralia |
| Brand tag | 0-1 | #WinningAdventureGlobal (only for brand content) |

**Total: 2-3 hashtags maximum**

**Placement:** Bottom of post, separated from body by blank line. Never in body text.

## Posting Schedule (Australia AEDT)

| Day | Time | Quality |
|-----|------|---------|
| Tuesday | 12:00-13:00 AEDT | Best |
| Wednesday | 12:00-13:00 AEDT | Best |
| Thursday | 12:00-13:00 AEDT | Best |
| Thursday | 17:00-18:00 AEDT | Good |
| Tuesday | 8:00-9:00 AEDT | Good |
| Monday | Any | Avoid |
| Friday | Any (after 15:00) | Avoid |
| Weekend | Any | Avoid for B2B |

**Reels-specific timing:** Workdays 18:00-21:00, Weekends 9:00-12:00

**First 60 minutes rule:** Stay online to respond to comments. Facebook boosts posts with early engagement — your responses seed the conversation.

## Image/Carousel Guidelines

**Photo posts:** +35% engagement vs text-only
- Real photos > designed graphics
- Factory/warehouse/customer photos (with permission)
- Dimensions: 1200x630 for Feed, 1080x1080 for square

**Carousel posts:** Best for step-by-step content
- First slide: Strong hook + question (determines if user swipes)
- Middle slides: Numbered steps with icons or photos
- Last slide: Save-driven CTA
- Dimensions: 1080x1080 per slide

**Carousel + Save CTA = High-value Facebook content**

## No External Links in Post Body

**Critical rule:** Facebook algorithm suppresses link posts to <1% reach.

| What to do | How to do it |
|-----------|-------------|
| Blog posts | Mention the topic without linking; offer to share details in comments/DM |
| Contact/CTA | Ask users to comment "interested" or DM — not "click the link" |
| Resources | Upload as PDF carousel or image, offer to send via Messenger |
| WAG service | "Questions about sourcing from China? Comment below or send us a message." |

If you must link (only for Reels or when absolutely necessary): Put link in **first comment**, not in body.

## Performance Metrics to Track

| Metric | Target | Why |
|--------|--------|-----|
| Saves | High ratio to reach | Strongest algorithm signal |
| Shares | > 2% of reach | Community trust amplification |
| Comments | > 1% of reach | Active discussion signal |
| Engagement Rate | > 5% | General benchmark |
| Reach | Secondary | Don't chase vanity metrics |

**Note:** Unlike LinkedIn (where ER up to 33% was achieved), Facebook ER benchmarks are lower (average 0.06-0.15%). Aim for 3-5% ER on educational posts and 5%+ on story-driven content.

## Brand Voice

Same WAG voice as wag-linkedin-post:
- Reliable, Professional, Exclusive
- Practical, direct, experienced
- No emoji
- No salesy language
- Speak from WAG's first-hand experience

**Facebook-specific additions:**
- More conversational tone than LinkedIn
- First-person plural ("we") or personal ("I") preferred over institutional ("WAG")
- Shorter sentences, more paragraph breaks
- Match the reading pace of someone scrolling on mobile during lunch

## Critical Rules

- **No external links in post body** — <1% reach penalty. Use comments or Messenger for CTAs.
- **2-3 hashtags maximum** — Facebook doesn't use hashtags for content discovery.
- **Hook must be emotional, not just informative** — "A client flew to Guangzhou..." not "3 steps to verify a factory"
- **Saves > Shares > Comments** — Design CTAs to drive saves first, shares second, comments third.
- **Always invoke RAG** — Retrieve at least 1 WAG blog post for grounding.
- **No emoji** — WAG brand rule applies across all platforms.
- **First 60 minutes online** — Respond to comments for algorithmic boost.
- **Visual content whenever possible** — Photos get +35% engagement vs text-only.
- **Save-driven CTAs for checklists** — "Save this for later" is the most powerful Facebook CTA.

## Cross-Platform Adaptation

When adapting from LinkedIn or SEO blog to Facebook:

1. **Identify the core insight** — what is the one thing the reader should take away?
2. **Find the emotional entry point** — what real experience makes this relevant?
3. **Lead with story, not structure** — Facebook needs feeling before information
4. **Replace professional tone with community tone** — "we've helped clients" → "a client told us, and honestly, we've been there too"
5. **Convert data hooks to emotional hooks** — "85% skip this step" → "Most Aussie importers find out the hard way"
6. **Change CTA** — LinkedIn's "answer this question" → Facebook's "save this for later"
7. **Cut hashtags** from 6-10 (LinkedIn) to 2-3 (Facebook)

## Interface Definition (for Coordination Layer)

```typescript
interface FacebookPostRequest {
  coreContentId?: string;        // Reference to existing WAG core content
  topic: string;                // Post topic
  format: 'story-checklist' | 'quick-wins' | 'discussion';
  tone?: 'professional' | 'conversational' | 'personal';
  includeVisual?: boolean;
  adaptationSource?: 'linkedin' | 'seo-blog' | 'x-post' | 'original';
  adaptedFromPostId?: string;    // If adapting from existing post
}

interface FacebookPostOutput {
  post: {
    hook: string;               // 90-125 characters
    body: string[];             // Array of paragraphs
    checklist?: string[];       // Numbered list items (for Template A)
    cta: string;                // Engagement CTA
    hashtags: string[];         // 2-3 tags
  };
  recommendedFormat: string;
  suggestedPostingTime: string;  // AEDT
  performanceNotes: string[];
  crossPlatformSuggestions?: {
    adaptToLinkedIn?: string;    // LinkedIn version notes
    adaptToX?: string;           // X version notes
  };
}
```
```

---

## 八、与核心内容协调的接口

### 8.1 输入接口（接收来自协调层或其他 skill 的内容）

Facebook post skill 应能接收来自以下来源的内容请求：

1. **直接从用户话题输入**（原生创建）
2. **从 wag-linkedin-post 适配**（同一核心内容的多渠道分发）
3. **从 wag-seo-blog 适配**（将长文精华提炼为 Facebook 帖子）
4. **从 wag-x-post 适配**（X 的快讯内容扩展为 Facebook 故事）

### 8.2 输出接口（向协调层或下游 skill 提供内容）

1. **向协调层报告**：已发布帖子的内容摘要、使用的 Hook/CTA 框架、期望的互动类型
2. **向 analytics-collector 提供**：帖子内容用于后续数据对比分析
3. **向 LinkedIn skill 提供反馈**：如发现某类故事在 Facebook 表现好，建议同步到 LinkedIn

### 8.3 协调层契约

```typescript
// wag-content-hub 协调层调用 facebook-post skill 的标准接口
interface ContentAdaptationRequest {
  sourcePlatform: 'linkedin' | 'seo-blog' | 'x' | 'original';
  sourcePostId?: string;
  coreContentHash: string;      // 用于去重和关联分析
  topic: string;
  adaptationInstruction: 'cross-post' | 'expand' | 'condense' | 'new';
  wagContext: {
    targetAudience: string;
    postingObjective: 'awareness' | 'engagement' | 'conversion';
    brandVoice: string;
  };
}

// facebook-post skill 返回
interface ContentAdaptationResponse {
  adaptedContent: string;       // 纯文本内容（不含元数据）
  contentHash: string;           // 用于关联分析
  platformSpecific: {
    hook: string;
    cta: string;
    hashtags: string[];
    recommendedFormat: 'photo' | 'carousel' | 'reel' | 'text';
    postingWindow: string;       // "Tue-Thu 12:00-13:00 AEDT"
  };
  performancePrediction: {
    estimatedSaveRate: string;
    estimatedShareRate: string;
    estimatedCommentRate: string;
  };
  crossPostSuggestions: {
    linkedInVersion?: string;   // 建议如何反向适配到 LinkedIn
    xVersion?: string;          // 建议如何反向适配到 X
  };
}
```

---

## 九、与 LinkedIn 和 X 的模板差异对比

| 维度 | LinkedIn | Facebook | X |
|------|----------|----------|---|
| **Hook 长度** | 210 chars | 90-125 chars | 280 chars (first tweet) |
| **Hook 类型** | 认知刷新（3步框架） | 情感连接（真实故事） | 即时吸引力（热门角度） |
| **Body 结构** | 步骤编号，专业论证 | 故事弧线，情感叙事 | 极简要点，线程展开 |
| **CTA 目标** | 评论（讨论） | 收藏（保存） | 转发（传播） |
| **Hashtag 数量** | 6-10 | 2-3 | 1-2 |
| **Hashtag 类型** | 混合（宽泛+细分+品牌） | 核心+受众（极简） | 热门话题标签 |
| **正文链接** | 首次评论（-60%惩罚） | 首次评论（<1% reach） | 正文可放（轻微惩罚） |
| **视觉要求** | 强烈建议（+ER） | 强烈建议（+35% ER） | 可选 |
| **最佳格式** | Document Carousel | Carousel + Photo | Text threads |
| **发布时间** | Tue-Thu 7-8am/午间 AEDT | Tue-Thu 12:00-13:00 AEDT | 工作日（非周五）上午 |
| **首发响应要求** | 60 分钟内在线 | 60 分钟内在线 | 30 分钟内（X 算法更快） |
| **核心指标** | CTR + 评论率 | 保存率 + 分享率 | 转发速度 |

---

## 十、检验问题

**Q1：为什么 Facebook 帖子的 CTA 应该优先驱动"收藏"（Saves）而不是"评论"（Comments），而这与 LinkedIn 的策略完全相反？**

A1：因为 Facebook 算法的信号权重是 **Saves > Shares > Comments > Reactions**，收藏意味着用户主动将内容标记为"以后还想再看"——这告诉算法这条内容具有长期价值，值得推荐给更多用户。相比之下，LinkedIn 的算法更看重"讨论深度"（长篇评论、多线程回复），因为 LinkedIn 是知识型平台，用户以"学东西"为目的消费内容，评论是讨论发生的证据。Facebook 是关系型平台，用户以"被理解/找到共鸣"为目的消费内容，收藏比评论更能代表用户对内容质量的真实认可——收藏是有意识的价值判断，评论可能只是一句情绪化的感叹。对于 WAG，这意味着 Facebook 上的"3步验厂清单"应该包装成"收藏这张清单，下次去中国前对照着检查"，而不是"评论区说说你的验厂经历"。

**Q2：Facebook 对外链的"<1% 触达率"惩罚背后的平台经济学是什么？这如何改变了内容创作的基本假设？**

A2：Facebook 的核心商业模式是**广告收入 = 用户时长 × 广告库存**。每有一个用户点击外链离开平台，这个人就暂时脱离了 Facebook 的变现环境。更糟糕的是，如果用户养成了"在 Facebook 发现内容，去别处消费"的习惯，Facebook 的广告价值就会持续流失。因此，Meta 的产品战略（Reels、Marketplace、Messaging 整合）全部围绕"锁住用户"设计，外链与平台核心利益根本对立。对于 WAG，这意味着 Facebook 不应该被视为"流量入口"，而应该被视为"价值交付场所"——内容必须在 Facebook 内部完成它对用户的承诺。如果 WAG 想在 Facebook 上引导用户咨询，应该通过"在评论区留言"或"发消息"这样的站内行为完成，而非引导点击外部链接。

**Q3：Facebook 的 UTIS 模型（2026 年 1 月更新）对内容创作者意味着什么？这与 X/Twitter 的热门话题机制有何本质区别？**

A3：UTIS（User True Interest Survey）让 Meta 直接向用户提问："这条内容是否与你的兴趣相关？"用户的回答被纳入推荐算法，使推荐对齐度从 48.3% 提升至 70% 以上。这意味着 Facebook 在 2026 年从"基于行为预测"升级到"直接询问真实偏好"——内容不仅要吸引用户点击，还要能通过用户的理性审视。X 的热门话题机制是**外部事件驱动**的——当某个新闻事件爆发，相关话题下的所有内容都会被推送，不管内容质量如何，X 的算法主要追踪"话题热度"而非"用户满意度"。Facebook 的 UTIS 模型则把质量控制权部分交给了用户——差的内容会因为用户选择"不相关"而被压制，好的内容会因为用户选择"相关"而被强化。对于 WAG，UTIS 模型意味着 Facebook 上的内容必须真正服务于目标受众的实际需求，而不是靠蹭热点或情绪化标题博取点击——短期诱饵可能在 UTIS 调查中暴露质量短板，最终损害长期触达。

---

## 十一、附录：文件结构

```
/Users/mark/Projects/wag/.claude/content/wag-content-hub/
├── analysis-01-architecture.md          # 四渠道协调层架构
├── analysis-02-rag-mechanism.md         # RAG 上下文注入机制
├── analysis-03-hub-entry.md             # wag-content-hub 入口设计
├── analysis-04-skill-reuse.md           # 现有 skill 复用分析
├── analysis-05-linkedin-template.md     # LinkedIn 模板（已有）
├── analysis-06-x-post-template.md       # X-post 模板
├── analysis-07-facebook-post-skill.md    # 本文件
├── wag-content-hub-SKILL.md             # 协调层 skill（主入口）
├── linkedin-post-SKILL.md              # LinkedIn skill
├── x-post-SKILL.md                      # X skill
├── facebook-post-SKILL.md              # Facebook skill
└── analytics-collector-SKILL.md        # 数据收集 skill
```
