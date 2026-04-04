---
name: wag-content-hub
description: "WAG content orchestration hub — parallel generation, brand enforcement, state management"
version: 4.8
---

# WAG Content Hub (v4.6)

## Agent Output Schema (v4.5 — Standardized)

Every sub-agent MUST return a standardized output object. This is the **Observation Contract**.

```typescript
interface AgentOutput {
  status: "success" | "warning" | "error";
  summary: string;          // One-line result (< 80 chars)
  content: string;          // Generated content (or error detail)
  quality_checks: {
    emoji_free: boolean;
    english_only: boolean;
    specific_cta: boolean;
    fear_first?: boolean;   // For fear-driven content
    metrics_quantified?: boolean; // For case study
    actionable_value?: boolean; // For lead magnet
    eeat_signals?: boolean; // For SEO article (v4.6)
    carousel_structure?: boolean; // For carousel (v4.6)
  };
  next_actions: string[];   // Max 3 actionable follow-ups
  artifacts: string[];     // File paths written
  errors?: {
    code: string;
    detail: string;
    recovery_hint: string;  // Root cause + safe retry
    stop_condition: string; // When to give up
  }[];
}
```

**Why this matters:**
- `status` lets Hub make routing decisions without parsing content
- `quality_checks` pre-validates brand rules before Hub review
- `next_actions` gives Hub clear follow-up without LLM inference
- `artifacts` tracks what was written without re-reading
- `errors` with `recovery_hint` + `stop_condition` enables automatic retry logic

## Overview

The WAG Content Hub is a **parallel orchestration layer** — it collects context via Socratic Q&A, then spawns multiple content generation agents in parallel using the Agent tool, aggregates their outputs, and enforces WAG brand rules.

**Core Principle:** Hub coordinates parallel generation, does not generate content itself.

**When to use:** When a user wants to create, analyze, or manage WAG content across multiple channels.

**Language:** Q&A and orchestration in Simplified Chinese. Generated content in English.

---

## Architecture: Parallel Coordinator

```
┌─────────────────────────────────────────────────────────────────┐
│                     WAG CONTENT HUB (v4.6)                      │
│                                                                  │
│  1. Route    2. Socratic Q&A   3. Parallel Gen   4. Aggregate   │
│     │              │                │               │             │
│     ▼              ▼                ▼               ▼             │
│  ┌──────┐   ┌───────────┐   ┌─────────┐   ┌─────────────┐    │
│  │Route │   │ Collect   │   │ Spawn   │   │Brand Check  │    │
│  │Chan- │──▶│ Context   │──▶│ Agents  │──▶│+ Aggregate  │    │
│  │nels  │   │ (3-5 Qs)  │   │ (dmux)  │   │  Results    │    │
│  └──────┘   └───────────┘   └─────────┘   └─────────────┘    │
│                                                                  │
│  State: {execution_id, phase, channels[], artifacts{}, errors{}} │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┬───────────────────────┐
        │                       │                       │                       │
        ▼                       ▼                       ▼                       ▼
  ┌───────────┐         ┌───────────┐         ┌───────────┐         ┌───────────┐
  │ LinkedIn  │         │    X      │         │ Facebook  │         │   SEO     │
  │  Agent    │         │  Agent    │         │  Agent    │         │  Article  │
  └───────────┘         └───────────┘         └───────────┘         └───────────┘
                                │                       │
        ┌───────────────────────┴───────────┐             │
        ▼                                   ▼             ▼
  ┌───────────┐         ┌───────────┐ ┌───────────┐ ┌───────────┐
  │  Case    │         │Lead Magnet│ │  Carousel │ │Personal   │
  │  Study   │         │  Agent    │ │  Agent    │ │  Brand    │
  └───────────┘         └───────────┘ └───────────┘ └───────────┘
                                          │             │
                                          │         ┌───────────┐
                                          │         │  LinkedIn │
                                          │         │  Document │
                                          └─────────┤  Agent    │
                                                    └───────────┘
```

---

## Content Types (Hub Routes to These)

| Content Type | When to Use | Channel |
|--------------|-------------|---------|
| **Social Post** (LinkedIn/X/Facebook) | Thought Leadership, pain point hooks | LinkedIn, X, Facebook |
| **SEO Article** (blog post) | Long-form educational content, keyword targeting | /resources/[slug] |
| **Case Study** | Trust building, specific results with metrics | /resources/[slug], social |
| **Lead Magnet** | Email capture, early-funnel conversion | Website CTA, LinkedIn ads |
| **Fear-Driven Content** | Addressing procurement anxiety directly | Social, blog |
| **Template E: Carousel** (v4.6) | Tutorial, framework, step-by-step guide | LinkedIn |
| **Template G: Document Post** (v4.6) | PDF checklist, audit guide, framework | LinkedIn native PDF |
| **Template H: Thought Leadership Text** (v4.6) | Hot take, industry opinion, personal story | LinkedIn |
| **Template I: LinkedIn Native Video** (v4.6) | Factory footage, authority building, authenticity | LinkedIn, YouTube |

---

## Delegation Map

| When user wants... | Action |
|--------------------|--------|
| Social post (LinkedIn, X, Facebook) | Spawn 3 parallel content agents |
| Long-form article / blog post | Spawn article-writing agent |
| Case study | Spawn case study agent |
| Lead Magnet (PDF guide, checklist) | Spawn lead magnet agent |
| Fear-driven pain point content | Spawn fear-driven content agent |
| LinkedIn Carousel (轮播图) | Spawn carousel agent |
| LinkedIn Document Post (PDF) | Spawn linkedin-document agent |
| LinkedIn native video | Spawn video-content agent |
| YouTube long-form content | Spawn video-content agent |
| Multi-platform distribution | Route to crosspost |
| Performance analytics | Route to WAG analytics-collector |
| Content review / audit | Route to content review + brand check |
| Single channel | Spawn single agent for that channel only |

**Hub uses the Agent tool to spawn parallel sub-agents — this is the dmux pattern within Claude Code.**

---

## WAG Brand Rules (Enforced by Hub)

These rules apply to ALL content passing through Hub, regardless of which agent generated it:

| Rule | Standard |
|------|----------|
| Emoji | **禁止** — Never, no exceptions |
| UI text | English only |
| Colors | Navy `#0F2D5E` + Amber `#F59E0B` only |
| Company name | "Winning Adventure Global" or "WAG" — no "WA" |
| Tone | Professional, authoritative, no hype |
| CTA | Specific (book consult, not generic) |
| **Fear-first** | All content must name and address the user's anxiety before offering a solution |

**Hub rejects any content violating these rules before distribution.**

---

## File Structure (Fixed)

**All content artifacts use consistent, predictable paths.**

```
social/
├── linkedin-post/{YYYY-MM-DD-topic}/
│   ├── post.md              # LinkedIn post content
│   ├── carousel/            # Carousel slide content (v4.6)
│   │   └── slide-{n}.md
│   └── document/            # LinkedIn Document Post content (v4.6)
│       └── document.md
├── x-post/{YYYY-MM-DD-topic}/
│   └── post.md              # X/Twitter content
├── facebook-post/{YYYY-MM-DD-topic}/
│   └── post.md              # Facebook content
├── case-study/{YYYY-MM-DD-topic}/
│   └── case-study.md        # Case study content
├── lead-magnet/{YYYY-MM-DD-topic}/
│   └── lead-magnet.md       # Lead magnet content
├── video/{YYYY-MM-DD-topic}/           # Video content (v4.6)
│   ├── raw/                              # Unedited clips from trips
│   ├── edited/                          # Final polished videos
│   ├── shorts/                          # 15-60s clips for LinkedIn/YouTube Shorts
│   ├── captions/                        # SRT/VTT caption files
│   └── thumbnails/                      # YouTube thumbnails
└── publish-previews/                    # HTML previews ALWAYS here
    └── {YYYY-MM-DD-topic}.html         # Single HTML per batch
public/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/
└── *.png                               # Images ALWAYS here
public/social/video/{YYYY-MM-DD-topic}/
└── *.mp4                               # Final distributed videos
content/blog/
└── {slug}.mdx                 # SEO blog articles
```

**Rule: HTML preview ONE file per batch, fixed location `social/publish-previews/`. Never scatter previews.**

---

## Orchestration Flows

### Flow: new-post (Multi-Channel)

```
Step 1: Confirm channels (LinkedIn, X, Facebook, SEO — all default)
         │
         ▼
Step 2: Socratic Q&A (3-5 questions in Simplified Chinese)
         │
         ▼
Step 3: Spawn parallel content agents using Agent tool (dmux pattern)
         │
         ▼
Step 4: Aggregate results, enforce brand rules
         │
         ▼
Step 5: QA review + user confirmation
         │
         ▼
Step 6: Route to crosspost for distribution
```

### Flow: case-study

```
Step 1: Confirm topic (client name, industry, result metrics)
         │
         ▼
Step 2: Socratic Q&A for Case Study (5 questions)
         │
         ▼
Step 3: Spawn case study agent
         │
         ▼
Step 4: QA review (check for specific metrics, named references)
         │
         ▼
Step 5: Route to blog format + social adaptation
```

### Flow: lead-magnet

```
Step 1: Confirm lead magnet type (PDF Guide / Checklist / Assessment Tool)
         │
         ▼
Step 2: Socratic Q&A for Lead Magnet (4 questions)
         │
         ▼
Step 3: Spawn lead magnet agent
         │
         ▼
Step 4: QA review (completeness, actionable value)
         │
         ▼
Step 5: Create email capture page + delivery mechanism
```

### Flow: fear-driven-content

```
Step 1: Identify the specific fear (from 5 core anxieties)
         │
         ▼
Step 2: Socratic Q&A for Fear-Driven Content (4 questions)
         │
         ▼
Step 3: Spawn fear-driven content agent + social adaptation
         │
         ▼
Step 4: QA review (fear acknowledged before solution offered)
         │
         ▼
Step 5: Route to distribution
```

### Flow: linkedin-carousel (v4.6 — New)

```
Step 1: Confirm topic for carousel format
         │
         ▼
Step 2: Socratic Q&A — Carousel (5 questions)
         │
         ▼
Step 3: Generate 7 slides (Slide 1 Hook + Slides 2-6 Framework + Slide 7 CTA)
         │
         ▼
Step 4: QA review — check carousel structure, slide count, brand rules
         │
         ▼
Step 5: Generate carousel images (7 PDF slides, 4:5 portrait)
         │
         ▼
Step 6: Route to LinkedIn distribution (Mark's personal account — Australia MD)
```

### Flow: personal-brand (v4.6 — New)

```
Step 1: Confirm topic and angle for Mark (Australia MD) voice
         │
         ▼
Step 2: Socratic Q&A — Personal Brand (3 questions)
         │
         ▼
Step 3: Spawn personal-brand agent (first-person, founder voice)
         │
         ▼
Step 4: QA review — check for first-person voice, founder perspective
         │
         ▼
Step 5: Route to Mark's personal LinkedIn account for publishing
         ▼
Step 6: Optional: Extract insights for official content adaptation
```

### Flow: linkedin-document (v4.6 — New)

```
Step 1: Confirm document topic (checklist, audit guide, framework)
         │
         ▼
Step 2: Socratic Q&A — LinkedIn Document (3 questions)
         │
         ▼
Step 3: Generate Document Post content (5-8 slides)
         │
         ▼
Step 4: QA review — actionable checklist items, professional design
         │
         ▼
Step 5: Generate PDF and LinkedIn Lead Gen Form setup
         │
         ▼
Step 6: Route to LinkedIn distribution + nurture trigger activation
```

### Flow: video-content (v4.6 — New)

```
Step 1: Confirm video type (LinkedIn native / YouTube long-form / Retargeting)
         │
         ▼
Step 2: Socratic Q&A — Video Content (3 questions)
         │
         ▼
Step 3: Script generation (hook + body + CTA)
         │
         ▼
Step 4: Generate video via ai-content-pipeline:
         │  Image → Video (wan-2-5) + Voiceover (kokoro-tts) + Captions
         │
         ▼
Step 5: QA review — check brand rules, hook strength, CTA clarity
         │
         ▼
Step 6: Cross-platform distribution:
         │  LinkedIn native (Mark's personal account T+0)
         │  → YouTube long-form (T+48h)
         │  → YouTube Shorts (T+72h, 3 clips)
         │  → Blog embed (text summary + video)
```

### Flow: topic-cluster-expansion (v4.6 — New)

```
Step 1: Identify which Pillar needs cluster content
         (Check: existing cluster has < 5 cluster pages?)
         │
         ▼
Step 2: Map 5-8 cluster subtopics based on keyword research
         (Use: Google Search Console + "People Also Ask" + AnswerThePublic)
         │
         ▼
Step 3: Prioritize by (search_volume x gap_score) — highest first
         │
         ▼
Step 4: For each cluster topic, run Socratic Q&A → generate SEO article
         │
         ▼
Step 5: Update Pillar page — add internal links to new cluster content
         │
         ▼
Step 6: Verify bidirectional linking (cluster → pillar, pillar → cluster)
```

---

## Socratic Q&A (Hub's Input Collection)

### Standard Q&A (3 Questions)

Present 3 questions in Simplified Chinese:

| Q# | Question | Purpose |
|----|----------|---------|
| Q1 | 你的目标读者目前面临什么采购挑战？（一句话） | Pain point / fear → hook |
| Q2 | 这篇内容最想让读者记住什么？（一句话） | Single takeaway |
| Q3 | 读者读完应该采取什么行动？ | CTA |

### Fear-Driven Content Q&A (4 Questions)

Present 4 questions in Simplified Chinese:

| Q# | Question | Purpose |
|----|----------|---------|
| Q1 |读者的核心恐惧是什么？（从5大焦虑中选：欺诈/质量/沟通/合规/供应商选择）| Identify the primary fear |
| Q2 |这个恐惧最极端的表现是什么？（一句话描述最坏情景）| Hook — name the fear vividly |
| Q3 | WAG 如何系统性地消除这一恐惧？（核心解决方案）| Bridge — solution from WAG |
| Q4 | 读者读完应该采取什么行动？ | CTA |

**The 5 Core Procurement Anxieties (采购焦虑矩阵):**

| # | Fear | Emotional Core | Content Direction |
|---|------|---------------|-------------------|
| 1 | 供应商欺诈/诈骗 | 深刻恐惧把钱转给陌生人后血本无归 | WAG 如何验证工厂真实性 |
| 2 | 质量不一致 | 第二批货和样品完全不一样 | WAG 如何确保批次间质量 |
| 3 | 沟通障碍 | 语言+文化+时区挫折 | WAG 双语人员如何解决 |
| 4 | 合规与物流 | 海关+生物安全+澳大利亚标准 | WAG 如何端到端支持 |
| 5 | 供应商选择困难 | 不知道哪个工厂真正靠谱 | WAG 实地考察如何做决策 |

### Case Study Q&A (5 Questions)

Present 5 questions in Simplified Chinese:

| Q# | Question | Purpose |
|----|----------|---------|
| Q1 | 客户背景：什么类型的企业？（行业、地点、规模、决策者角色） | Character establishment |
| Q2 | 核心挑战：客户最初面临的采购困境是什么？（恐惧驱动）| Problem definition |
| Q3 | WAG 做了什么？（具体的工厂/服务/流程）| Solution description |
| Q4 | 具体成果：量化结果是什么？（金额节省、时间缩短、供应商数量、质量改善）| Metrics (MUST be specific) |
| Q5 | 客户的一句话引言？（愿意公开姓名的具名推荐）| Social proof quote |

**Case Study Structure (Output):**
```
Title: [Company Type] + [Specific Result]
Subtitle: [Industry] in [Location] saves [Specific Amount] in [Timeframe]

Section 1: THE CHALLENGE (fear-driven)
  - What was the client's procurement fear?
  - What had they tried before (and failed)?

Section 2: THE APPROACH (WAG solution)
  - What did WAG do specifically?
  - How many factories visited/evaluated?
  - What process was followed?

Section 3: THE RESULTS (quantified)
  - Specific dollar savings: $[amount]
  - Time to find verified supplier: [X] weeks
  - Quality issues after engagement: [X]% reduction
  - Number of verified suppliers found: [X]

Section 4: CLIENT TESTIMONIAL
  - Direct quote from named client (if available)
  - Role + Company
```

### Lead Magnet Q&A (4 Questions)

Present 4 questions in Simplified Chinese:

| Q# | Question | Purpose |
|----|----------|---------|
| Q1 | Lead Magnet 类型？（PDF 完整指南 / Checklist 清单 / 评估工具 Quiz）| Format selection |
| Q2 | 这个工具针对哪个核心痛点？（一个具体恐惧或问题）| Pain point alignment |
| Q3 | 内容大纲：读者能获得什么具体可操作的信息？（3-5 个要点）| Content scope |
| Q4 | 下载后 CTA？（免费初步咨询 / 预约电话 / 订阅邮件）| Conversion goal |

**Lead Magnet Types:**

| Type | Format | Best For |
|------|--------|----------|
| **PDF 完整指南** | 10-20 page document, structured sections | Comprehensive education, email capture |
| **Checklist 清单** | Downloadable checklist, 1-2 pages | Quick wins, low commitment |
| **评估工具 Quiz** | Interactive assessment with results page | High engagement, personalized CTA |

### Carousel Q&A (v4.6 — New, 5 Questions)

Present 5 questions in Simplified Chinese:

| Q# | Question | Purpose |
|----|----------|---------|
| Q1 | 核心概念是什么？（一句话总结）| Slide 2-6 content anchor |
| Q2 | 受众最大的认知误区是什么？| Slide 1 Hook design |
| Q3 | 最想让受众记住哪 5 个要点？| Slides 2-6 framework |
| Q4 | 受众读完应该采取什么行动？| Slide 7 CTA |
| Q5 | 有哪些具体数据/案例可以引用？| Content credibility |

**Carousel Structure (7 slides):**
- Slide 1: HOOK — Surprising statistic or counter-intuitive claim (stop the scroll)
- Slides 2-6: CONTENT — One key point per slide (max 30 words each)
- Slide 7: CTA — Benefit-led specific action + "Save this post" prompt

**Image Specs:** 4:5 portrait (1080x1350), PDF upload to LinkedIn

### LinkedIn Document Q&A (v4.6 — New, 3 Questions)

Present 3 questions in Simplified Chinese:

| Q# | Question | Purpose |
|----|----------|---------|
| Q1 | 文档类型？（供应商验证清单 / 验厂 checklist / 谈判话术 / 风险评估）| Format selection |
| Q2 | 读者下载后最想解决什么问题？| Pain point alignment |
| Q3 | Lead Gen 表单如何配置？（落地页邮箱收集 / LinkedIn Lead Gen Form）| Capture mechanism |

### Video Content Q&A (v4.6 — New, 3 Questions)

Present 3 questions in Simplified Chinese:

| Q# | Question | Purpose |
|----|----------|---------|
| Q1 | 视频类型？（工厂实拍 / WAG团队口播 / 验厂过程 / 广交会记录）| Content type |
| Q2 | 发布平台？（LinkedIn 原生 / YouTube 长视频 / LinkedIn 广告重定向）| Platform selection |
| Q3 | 时长？（60-90s LinkedIn / 10-15min YouTube / 15-30s Retargeting）| Duration target |

---

## Phase 3: Parallel Agent Spawning (dmux Pattern)

Hub spawns multiple content-generation agents in parallel using the Agent tool.

**Agent prompts are MINIMAL — large guidance lives in skill sections, not prompts.**
**All agents MUST return standardized AgentOutput object (see top of skill).**

```typescript
// Agent output template (all agents must follow this schema)
const agentOutput = {
  status: "success", // or "warning" or "error"
  summary: "Short one-line result",
  content: "The generated content",
  quality_checks: {
    emoji_free: true,
    english_only: true,
    specific_cta: true,
    fear_first: true, // if applicable
    metrics_quantified: true, // if case study
    actionable_value: true, // if lead magnet
    eeat_signals: true, // if SEO article (v4.6)
    carousel_structure: true, // if carousel (v4.6)
  },
  next_actions: ["Next step 1", "Next step 2"],
  artifacts: ["file path written"],
  errors: [] // empty if success
};

// Spawn LinkedIn agent
Agent({
  name: "linkedin-content",
  subagent_type: "general-purpose",
  prompt: `Generate a LinkedIn post for Winning Adventure Global.

Context: {topic} | {pain_point} | {takeaway} | {cta}

Brand rules (enforced by Hub):
- No emoji / English only / Navy+Amber / Specific CTA
- FEAR-FIRST: Name reader's anxiety in first 2 lines

Output: Return AgentOutput object with:
- status: "success" if all checks pass
- summary: "LinkedIn post: [hook preview]"
- content: full post text (150-300 words)
- quality_checks: {emoji_free, english_only, specific_cta, fear_first}
- next_actions: ["Approve/iterate/reject"]
- artifacts: ["social/linkedin-post/{date-topic}/post.md"]

Write file: social/linkedin-post/{YYYY-MM-DD-topic}/post.md`
})

// Spawn X/Twitter agent
Agent({
  name: "x-content",
  subagent_type: "general-purpose",
  prompt: `Generate a tweet/thread for X (Twitter) for Winning Adventure Global.

Context: {topic} | {pain_point} | {takeaway} | {cta}

Brand rules: No emoji / English only / Professional / Specific CTA

Output: Return AgentOutput object with:
- status, summary, content: tweet (280 chars) + thread (3-5 tweets)
- quality_checks: {emoji_free, english_only, specific_cta}
- next_actions, artifacts

Write file: social/x-post/{YYYY-MM-DD-topic}/post.md`
})

// Spawn Facebook agent
Agent({
  name: "facebook-content",
  subagent_type: "general-purpose",
  prompt: `Generate a Facebook post for Winning Adventure Global.

Context: {topic} | {pain_point} | {takeaway} | {cta}

Brand rules: No emoji / English only / Conversational+Professional / Specific CTA

Output: Return AgentOutput object with:
- status, summary, content: Facebook post (50-100 words)
- quality_checks: {emoji_free, english_only, specific_cta}
- next_actions, artifacts

Write file: social/facebook-post/{YYYY-MM-DD-topic}/post.md`
})

// Spawn SEO article agent (v4.6 — Enhanced E-E-A-T)
Agent({
  name: "seo-article",
  subagent_type: "general-purpose",
  prompt: `Write a SEO blog article for Winning Adventure Global.

Context: {topic} | {primary_keyword} | {pillar_cluster} | {takeaway} | {cta}

Article Requirements (v4.6):
1. FRONTMATTER (exact format):
   ---
   title: "{compelling title with primary keyword}"
   date: "{ISO date}"
   description: "{155-char meta description with keyword}"
   author: "Winning Adventure Global"
   tags: [{keyword}, {related}, {intent}]
   ---

2. STRUCTURE:
   - H1 (title, with primary keyword near front)
   - Opening: FEAR-FIRST — name the reader's anxiety in paragraph 1
   - H2 sections: 4-6 per article, each with H3 sub-points
   - Internal links: link to Pillar page within first 200 words
   - FAQ section: 5-8 Q&A pairs, EACH QUESTION 40-60 characters
   - FAQ A format: first sentence answers question directly (no preamble)
   - FAQ Q types: 2x paragraph (is/does), 2x list (how to), 1x comparison
   - FAQ Schema: JSON-LD at bottom of article body

3. E-E-A-T (v4.6 — CRITICAL):
   - Include 2+ first-person observations ("When we toured...", "I noticed...")
   - Name specific factory cities/regions (Shenzhen, Yiwu, Guangzhou...)
   - Reference specific negotiation outcomes or verification steps taken
   - Link author to /about page
   - Every H2 ends with a relevant internal link
   - Use original imagery references (not stock photo descriptions)

4. SEO:
   - Primary keyword density: 1.5-2.5% (natural, not forced)
   - Include secondary keywords in 2-3 H3 headings
   - Word count: 1,500-2,500 words (info articles) or 2,500-4,000 (pillar pages)
   - CTA: specific (book consultation, not generic "contact us")

5. FAQ SCHEMA (v4.6):
   Each question: 40-60 characters. Each answer: direct, first sentence answers Q.
   Include JSON-LD FAQPage schema at article bottom.

Output: Return AgentOutput object:
- status, summary: "SEO article: [title] — [word_count] words"
- content: full article with frontmatter + JSON-LD FAQ schema
- quality_checks: {emoji_free, english_only, specific_cta, fear_first, eeat_signals}
- errors: if E-E-A-T missing → eeat_signals: false
- next_actions, artifacts: ["content/blog/{slug}.mdx"]

Write file: content/blog/{slug}.mdx`
})

// Spawn Case Study agent
Agent({
  name: "case-study",
  subagent_type: "general-purpose",
  prompt: `Write a case study for Winning Adventure Global.

Context: {client_background} | {challenge} | {wag_solution} | {results} | {testimonial}

CRITICAL: Every claim MUST have quantified metrics (dollar amounts, timeframes, percentages).
Structure: Title+subtitle with key metric → The Challenge (fear-driven) → The Approach → The Results (quantified) → Client Testimonial → CTA

Output: Return AgentOutput object:
- status: "error" if metrics missing — set metrics_quantified: false
- summary: "Case study: [client type] saves $[amount] in [timeframe]"
- content: full case study
- quality_checks: {emoji_free, english_only, specific_cta, metrics_quantified}
- errors: if metrics missing, add error with code METRICS_MISSING and recovery_hint
- next_actions, artifacts: ["content/blog/{slug}.mdx"]

Write file: content/blog/{slug}.mdx`
})

// Spawn Lead Magnet agent
Agent({
  name: "lead-magnet",
  subagent_type: "general-purpose",
  prompt: `Generate a Lead Magnet for Winning Adventure Global.

Context: {type} (PDF Guide / Checklist / Assessment Tool) | {pain_point} | {content_outline} | {cta}

CRITICAL: Every section must provide actionable, usable information — no fluff.
Fear-first: Address anxiety before presenting solution.

Output: Return AgentOutput object:
- status: "error" if no actionable items — set actionable_value: false
- summary: "Lead magnet: [title] — [type]"
- content: complete lead magnet
- quality_checks: {emoji_free, english_only, actionable_value}
- errors: if empty, add error with code ACTIONABLE_EMPTY
- next_actions, artifacts

Write file: social/lead-magnet/{YYYY-MM-DD-topic}/lead-magnet.md`
})

// Spawn Fear-Driven Content agent
Agent({
  name: "fear-driven-content",
  subagent_type: "general-purpose",
  prompt: `Generate fear-driven content for Winning Adventure Global.

Context: {primary_fear} (from: fraud/quality/communication/compliance/supplier-selection) | {extreme_scenario} | {wag_solution} | {cta}

CRITICAL: FEAR-FIRST MANDATORY. Content must name and validate the fear in the FIRST paragraph before any solution.

Content structure:
1. OPENING: Name fear vividly (concrete scenario)
2. VALIDATION: Why this fear is rational
3. THE SOLUTION: How WAG eliminates this fear
4. SOCIAL PROOF: Others overcame this fear with WAG
5. CTA: Specific next step

Output: Return AgentOutput object:
- status: "error" if fear not in opening — set fear_first: false
- summary: "Fear content: [fear_name] addressed"
- content: full content
- quality_checks: {emoji_free, english_only, fear_first}
- errors: if fear_first false, add error FEAR_MISSING
- next_actions, artifacts
`)

// Spawn Carousel agent (v4.6 — New)
Agent({
  name: "linkedin-carousel",
  subagent_type: "general-purpose",
  prompt: `Generate a LinkedIn Carousel post for Winning Adventure Global.

Context: {topic} | {core_concept} | {audience_misconception} | {key_points} | {cta}

Carousel Structure (EXACT — 7 slides):
- Slide 1 (HOOK): Surprising statistic or counter-intuitive claim. Max 30 words. Stop the scroll.
- Slides 2-6 (CONTENT): One key point per slide. Max 30 words each. Clear hierarchy.
- Slide 7 (CTA): Benefit-led specific action. Include "Save this post" subtle prompt.

Caption (below carousel image):
- Personal hook story: 2-3 sentences in first person
- Reason for sharing: 1 sentence
- Engagement question: "What aspect of [topic] challenges your business most?"
- Hashtags: 3-5 max, industry-specific

Image Specs: 4:5 portrait (1080x1350), PDF upload to LinkedIn
Design: Navy (#0F2D5E) + Amber (#F59E0B), 40pt min body text, 80pt headlines

Output: Return AgentOutput object:
- status, summary: "Carousel: [topic] — 7 slides"
- content: slide-by-slide text content + caption
- quality_checks: {emoji_free, english_only, specific_cta, carousel_structure: true}
- errors: if slide count != 7, add error CAROUSEL_SLIDE_COUNT
- next_actions, artifacts: ["social/linkedin-post/{date-topic}/carousel/slide-{n}.md"]

Write files: social/linkedin-post/{YYYY-MM-DD-topic}/carousel/slide-{n}.md (for each slide)`
})

// Spawn LinkedIn Document agent (v4.6 — New)
Agent({
  name: "linkedin-document",
  subagent_type: "general-purpose",
  prompt: `Generate a LinkedIn Document Post (PDF) for Winning Adventure Global.

Context: {document_type} | {pain_point} | {checklist_items} | {capture_mechanism}

Document Structure (5-8 slides):
- Slide 1: Title + WAG branding + "Save this [checklist/guide]"
- Slides 2-6: Checklist/actionable items (one per slide, specific + usable)
- Slide 7: "Want help with these steps? WAG can do it for you."
- Slide 8: Contact CTA + website

Document Types:
- Supplier Verification Checklist: Step-by-step verification actions
- Factory Audit Checklist: Pre-visit, on-site, post-visit actions
- Negotiation Cheat Sheet: Key questions, tactics, objection handling
- Risk Assessment Framework: Risk categories, evaluation criteria

Design: Professional, clean, Navy/Amber, actionable language
Format: PDF (LinkedIn native document upload, not image carousel)

Caption Strategy:
- Hook: "We audited [X] factories [timeframe]. Here's what separates the real ones from the traders."
- CTA: "Full [checklist/guide] in the document above. Comment '[KEYWORD]' and I'll send it directly."

Output: Return AgentOutput object:
- status, summary: "Document post: [type] — [slide_count] slides"
- content: slide-by-slide text + caption
- quality_checks: {emoji_free, english_only, actionable_value: true}
- next_actions, artifacts: ["social/linkedin-post/{date-topic}/document/document.md"]

Write file: social/linkedin-post/{YYYY-MM-DD-topic}/document/document.md`
})

// Spawn Video Content agent (v4.6 — New)
Agent({
  name: "video-content",
  subagent_type: "general-purpose",
  prompt: `Generate video content for Winning Adventure Global via ai-content-pipeline.

Context: {video_type} | {platform} (LinkedIn/YouTube) | {duration} | {topic}

Video Content Types (ranked by priority):
1. Factory Verification Walkthrough: POV/narration, 60-90s, prove WAG's 3-step process
2. "What I Saw at [City] Factory": WAG team member talking to camera, 45-60s, company voice
3. Supplier Fraud Case Study: Slide + narration, 60-90s, fear-first
4. Behind the Scenes (AV Equipment): Raw footage, 30-60s, authentic
5. Canton Fair / Trade Show Recap: Highlights reel, 60-120s, event leverage

Hook Strategy (first 2-3 seconds):
- "This is how NOT to verify a Chinese supplier..."
- "We visited 3 factories in Shenzhen. Here's what we found."
- "Why 80% of 1688 suppliers are NOT actual manufacturers."

Technical Specs:
- LinkedIn native: 60-90s, 9:16 vertical, 1080p, captions REQUIRED
- YouTube long-form: 8-15 min, 16:9, 1080p, captions REQUIRED
- LinkedIn Ads retargeting: 15-30s, 9:16, captions REQUIRED

Pipeline (via ai-content-pipeline):
1. Generate image: infsh app run falai/flux-dev --input '{"prompt": "<scene>"}'
2. Animate to video: infsh app run falai/wan-2-5 --input '{"image_url": "<url>", "prompt": "<motion>"}'
3. Voiceover (optional): infsh app run infsh/kokoro-tts --input '{"text": "<script>", "voice": "am_george"}'
4. Add captions: infsh app run infsh/caption-video --input '{"video_url": "<url>"}'
5. Merge: infsh app run infsh/media-merger --input '{"video_url": "<v>", "audio_url": "<a>"}'
6. Output: MP4 at social/video/{YYYY-MM-DD-topic}/

Output: Return AgentOutput object:
- status, summary: "Video: [type] — [duration]s"
- quality_checks: {emoji_free, english_only, specific_cta, fear_first: true}
- artifacts: ["social/video/{YYYY-MM-DD-topic}/edited/{slug}.mp4"]
- pipeline_log: [{step: string, output_url: string, cost: string}]`
})
```

All agents run **in parallel** (spawn together, wait for all to complete).

---

## Hub State (v4.6 — Extended)

```yaml
state:
  execution_id: "exec-{date}-{seq}"
  phase: 1-6
  channels:
    - name: linkedin
      status: pending|generating|delivered|approved|published|error
      result: <AgentOutput>
      errors: []
    - name: x
      status: pending|generating|delivered|approved|published|error
      result: <AgentOutput>
      errors: []
    - name: facebook
      status: pending|generating|delivered|approved|published|error
      result: <AgentOutput>
      errors: []
    - name: seo
      status: pending|generating|delivered|approved|published|error
      result: <AgentOutput>
      errors: []
    - name: case-study
      status: pending|generating|delivered|approved|published|error
      result: <AgentOutput>
      errors: []
    - name: lead-magnet
      status: pending|generating|delivered|approved|published|error
      result: <AgentOutput>
      errors: []
    - name: linkedin-carousel  # v4.6
      status: pending|generating|delivered|approved|published|error
      result: <AgentOutput>
      errors: []
    - name: personal-brand  # v4.6
      status: pending|generating|delivered|approved|published|error
      result: <AgentOutput>
      errors: []
    - name: linkedin-document  # v4.6
      status: pending|generating|delivered|approved|published|error
      result: <AgentOutput>
      errors: []
    - name: video-content  # v4.6
      status: pending|generating|delivered|approved|published|error
      result: <AgentOutput>
      errors: []
  started_at: "{ISO timestamp}"
  errors: []  # v4.5: global error log with recovery tracking
```

**Hub maintains state throughout pipeline. If interrupted, resume at last checkpoint.**

---

## Benchmarking (v4.6 — Extended)

Track these metrics to optimize Hub over time:

| Metric | Target | Current | Notes |
|--------|--------|---------|-------|
| completion_rate | >90% | — | % tasks completed without error |
| retries_per_task | <1.5 | — | Avg retries before success |
| pass@1 | >70% | — | % tasks succeed on first attempt |
| pass@3 | >95% | — | % tasks succeed within 3 attempts |
| cost_per_success | minimized | — | Token cost / successful task |
| error_distribution | — | — | Which error codes appear most |

**Log format:**
```
{execution_id}|{channel}|{status}|{error_code}|{retry_count}|{latency_ms}
```

**Analysis triggers:**
- If retries_per_task > 2 → review prompt complexity
- If pass@1 < 50% → review error_recovery contract
- If cost_per_success spikes → review context budget

**LinkedIn Publishing Cadence (v4.6):**

| Cadence | Frequency | Format Distribution | Best Times (AEST) |
|---------|-----------|---------------------|-------------------|
| Sustain | 3/week | 2 Carousel + 1 Text Post | Tue + Thu + Wed |
| Growth | 5/week | 2 Carousel + 2 Text + 1 Video | Mon-Fri rotation |
| Sprint | Daily | Carousel/Text alternating | Mon-Fri |

**Note: Consistency > Quantity. 3 high-quality posts > 7 mediocre posts.**

---

## Phase 4: Aggregate + Brand Check

After parallel agents complete, Hub:

1. Collects all agent outputs
2. Runs brand rule checks:
   - [ ] No emoji
   - [ ] No Chinese in content
   - [ ] Colors use navy/amber tokens
   - [ ] CTA is specific
   - [ ] Hook is under character limit
   - [ ] **Fear-first: Does the content name the reader's anxiety before offering a solution?**
   - [ ] **Case study metrics are specific and quantified**
   - [ ] **Carousel: exactly 7 slides, Slide 1 is a hook, Slide 7 is CTA** (v4.6)
   - [ ] **Personal brand: first-person voice present, founder perspective** (v4.6)
3. Rejects any content violating rules

**SEO E-E-A-T Checks (v4.6):**
   - [ ] First-person narrative included ("When we toured...", "I noticed...")
   - [ ] Named author: Winning Adventure Global (not anonymous)
   - [ ] Original imagery reference (not generic stock photo description)
   - [ ] FAQ questions: 40-60 characters each
   - [ ] FAQ answers: direct (first sentence answers Q)
   - [ ] Internal links: to pillar page (within first 200 words)
   - [ ] FAQPage JSON-LD: present in output

---

## Phase 5: QA Review

Hub presents aggregated results for user confirmation:

| Channel | Content Preview | Self-QA | User Action |
|---------|----------------|---------|-------------|
| LinkedIn | [hook + body]... | PASS | [Approve/Iterate] |
| X | [tweet]... | PASS | [Approve/Iterate] |
| Facebook | [post]... | PASS | [Approve/Iterate] |
| SEO | [title + meta]... | PASS | [Approve/Iterate] |
| Case Study | [title + metrics]... | PASS | [Approve/Iterate] |
| Lead Magnet | [title + outline]... | PASS | [Approve/Iterate] |
| Carousel | [7 slides outline]... | PASS | [Approve/Iterate] |
| Personal Brand | [first-person hook]... | PASS | [Approve/Iterate] |
| Document Post | [slide count + outline]... | PASS | [Approve/Iterate] |
| Video | [hook + script outline]... | PASS | [Approve/Iterate] |

---

## Phase 6: Distribution

After user approval, route to `crosspost` for platform-native distribution:

```yaml
phase: 6
distribution:
  action: crosspost
  platforms: [linkedin, x, facebook]
  content: <aggregated approved content>
  staggered_timing:
    linkedin: T+0
    x: T+30min
    facebook: T+1h
  personal_brand_timing:  # v4.6
    personal_account: T+0  # Mark's personal LinkedIn account (Australia MD)
  seo:
    action: git-push
    instruction: "git add . && git commit -m 'feat: {title}' && git push"
  case_study:
    action: git-push
    path: content/blog/{slug}.mdx
    instruction: "git add . && git commit -m 'feat: case study — {title}' && git push"
  lead_magnet:
    action: upload
    path: public/downloads/{filename}.pdf
    instruction: "Create email capture landing page + PDF upload"
  carousel:
    action: upload
    path: public/social/linkedin-post/{date-topic}/carousel.pdf
    instruction: "Upload PDF to LinkedIn as Document Post"
  video:
    action: upload
    path: public/social/video/{date-topic}/edited/{slug}.mp4
    platforms: [linkedin, youtube, youtube_shorts]
    timing:
      linkedin: T+0
      youtube: T+48h
      youtube_shorts: T+72h

# v4.6: Email Capture + Nurture
email_capture:
  landing_page: "app/downloads/checklist/page.tsx"
  form_fields: [email]  # Name + Email for B2B quality
  crm_integration: "pending"  # See nurture_routing
  delivery: "Automated email with PDF attachment + enrollment in wag-7-email-nurture-v1"
  trust_signals:
    - "No spam. Unsubscribe anytime."
    - "Joining X+ Australian businesses who source from China"
  dual_cta:
    primary: "Book a Free Discovery Call"
    secondary: "Download the Checklist"
  benchmark: ">10% visitor-to-email rate"

nurture_routing:
  new_subscriber_sequence:
    trigger: "Email submitted via landing page"
    sequence_id: "wag-7-email-nurture-v1"
    cadence: "Days 0, 3, 7, 14, 21, 30, 45"
    segmentation:
      - tag: "downloaded_checklist"
      - tag: "interest:factory_verification"  # If clicked Email 2-3
      - tag: "interest:supplier_quality"       # If clicked Email 4
      - tag: "hot_lead"                       # If clicked 3+ emails or replied
    escalation:
      condition: "Lead replied to any email OR clicked 3+ emails"
      action: "Alert WAG team (Andy) via email notification"
      sla: "Personal response within 24 hours"

trigger_sequences:
  download_nurture:
    name: "Post-Checklist Download Nurture"
    trigger: "Email submitted on procurement checklist landing page"
    sequence: "wag-7-email-nurture-v1"
    emails:
      - day: 0
        type: "Welcome"
        subject: "Your China procurement checklist is ready"
        metric: "Delivery confirmation"
      - day: 3
        type: "Educational"
        subject: "The 1688 verification step most Australian businesses skip"
        metric: "Open rate >40%"
      - day: 7
        type: "Problem Awareness"
        subject: "Why your China supplier evaluation might be missing the point"
        metric: "Click-through rate"
      - day: 14
        type: "Social Proof"
        subject: "How a Melbourne importer found verified factories in 3 weeks"
        metric: "Reply rate"
      - day: 21
        type: "Resource Offer"
        subject: "The supplier evaluation template I wish I had 5 years ago"
        metric: "Conversion to asset"
      - day: 30
        type: "Re-engagement"
        subject: "Still thinking about China procurement?"
        metric: "Re-engagement rate"
      - day: 45
        type: "Sales Invite"
        subject: "Worth a 15-minute conversation?"
        metric: "Call bookings"
    exit_condition: "Lead books discovery call OR completes enquiry form"

  abandoned_inquiry:
    name: "Inquiry Started but Not Submitted"
    trigger: "User visited /enquiry page but did not submit form within 5 minutes"
    emails:
      - delay: "30 minutes"
        subject: "Were you about to submit an enquiry?"
        body: "Hi [Name], you started filling out our enquiry form but didn't hit submit. Happy to make this easier — just reply with what you're sourcing and I'll personally follow up within 24 hours."
      - delay: "24 hours (if no reply)"
        subject: "Quick follow-up on your WAG enquiry"
        body: "Hi [Name], just checking in. If you're still evaluating suppliers, here's what I can tell you in 2 minutes: [1-sentence WAG differentiation]. Reply here or book a 15-min call → [link]"

  blog_nurture:
    name: "Blog Reader to Lead"
    trigger: "Lead reads 3+ blog posts (GA event trigger)"
    emails: 4-email micro-sequence
    content: "1 educational + 1 case study + 1 checklist offer + 1 call invite"

  re_engagement:
    name: "90-Day Cold Lead Re-Engagement"
    trigger: "No engagement for 90 days after last email"
    emails: 3-email sequence over 2 weeks
    goal: "Re-qualify or suppress"
    exit_condition: "No opens on all 3 emails → suppress from active nurture"
```

---

## Sales Navigator Outreach Workflow (v4.6 — New)

### When to Use

For精准 B2B outreach targeting Australian manufacturing/wholesale/import decision-makers who have not yet converted through organic content.

### Trigger Events

| Trigger | Why It Works |
|---------|-------------|
| Company recent hiring (procurement/operations roles) | Expansion signal = evaluation opportunity |
| Company received funding round | Budget available for supplier optimization |
| New LinkedIn post about China sourcing | Active interest = warm outreach |
| Attended WAG content (engaged but no conversion) | Mid-funnel = right timing |

### Outreach Sequence (14-day multi-channel)

```
Day 1: Connection Request
  - Personalized note referencing specific trigger event
  - Low-friction opener (question, not pitch)
  Example: "Hi [Name], I noticed [Company] recently [trigger] — we're helping
   Australian businesses navigate exactly this. Worth a quick chat?"

Day 2-3: Profile Visit
  - View target's LinkedIn profile (appears in "Who viewed your profile")

Day 5: LinkedIn Message (follow-up to connection)
  - Reference the connection request
  - Share relevant content (blog post, case study link)
  - Ask a question (not sell)

Day 7: Voice/Video Mail
  - If phone number available: leave brief voice message
  - Reference prior LinkedIn touchpoint
  - Offer value: "I found something relevant to [their situation]..."

Day 10: InMail (for 2nd-degree connections)
  - More formal, longer message
  - Reference shared connection or content
  - Clear value proposition

Day 14: Final Follow-up Email
  - "Breakup" framework: no hard feelings
  - Leave door open for future
  Example: "Hi [Name], I didn't hear back so I'll assume timing isn't right.
   If that changes, I'm here. Best of luck with [their project]."
```

### Target Criteria

| Dimension | Specification |
|-----------|---------------|
| Industry | Manufacturing, wholesale, import, retail (consumer goods) |
| Company size | 10-200 employees |
| Geography | Australia (ALL states) |
| Role | CEO, COO, Procurement Manager, Operations Manager, Owner |
| Signals | Recently expanded, received funding, posted about China sourcing |

**Key Metrics:**
- Target reply rate: >25%
- Weekly outreach volume: 20-30 requests
- Personalized per target (no bulk templates)

---

## Error Recovery Contract (v4.5 — Structured)

Every error path includes: root cause hint, safe retry instruction, explicit stop condition.

| Error Code | Root Cause | Recovery Hint | Stop Condition |
|------------|------------|---------------|---------------|
| `AGENT_TIMEOUT` | Agent exceeded time limit | Retry 1x with same prompt, if still timeout → skip this channel, continue others | After 2 retries, present partial results |
| `QUALITY_GATE_FAIL` | Content failed brand rules | Identify specific rule violation, request single-agent iteration with corrected prompt | After 2 iterations, flag for human review |
| `HOOK_EXCEED_LIMIT` | Character count over limit | Auto-trim to limit, flag for Hub review | Manual approval required if trim breaks flow |
| `BRAND_VIOLATION` | Emoji / Chinese / wrong colors detected | Reject + list specific violation + rule reference | N/A — always reject |
| `METRICS_MISSING` | Case study lacks quantified results | Return to Case Study Q&A for re-prompt | After 2 failures, suggest human-written draft |
| `FEAR_MISSING` | Fear not acknowledged before solution | Reject, require re-write with fear-first opening | After 2 failures, flag for human rewrite |
| `ACTIONABLE_EMPTY` | Lead magnet has no usable content | Reject, require outline + at least 5 actionable items | After 2 failures, suggest template fill |
| `CONTEXT_OVERFLOW` | Sub-agent context exceeded | Reduce prompt length, remove non-essential Q&A context | If even minimal prompt overflows, use direct generation |
| `CAROUSEL_SLIDE_COUNT` | Carousel doesn't have exactly 7 slides | Reject, require exactly 7 slides (1 hook + 5 content + 1 CTA) | After 2 failures, flag for human review |
| `EEAT_MISSING` | SEO article missing E-E-A-T signals | Reject, require WAG authority narrative + original factory imagery references | After 2 failures, flag for human review |

**Recovery Protocol:**
```
1. Error detected → parse error.code
2. Lookup recovery_hint → apply safe retry
3. Check stop_condition → if met, escalate to human
4. Log error to Hub state.errors[]
```

---

## Critical Rules

1. **Parallel generation via Agent tool** — Hub spawns agents, does not generate directly
2. **dmux pattern** — All channel agents spawn together, run in parallel
3. **Brand rules are non-negotiable** — Hub enforces no-emoji, colors, tone, fear-first
4. **State survives interruption** — Resume at last checkpoint
5. **User confirmation before distribution** — No auto-publish
6. **Fear-first mandatory** — All content must validate the reader's anxiety before presenting WAG as the solution
7. **Case study specificity** — Every case study MUST include quantified metrics (dollar amounts, timeframes, percentages)
8. **Lead Magnet completeness** — Every lead magnet must provide actionable value, not marketing fluff
9. **Agent Output Schema** — All sub-agents MUST return standardized AgentOutput object (v4.5)
10. **Error Recovery Contract** — All errors must include recovery_hint and stop_condition (v4.5)
11. **SEO E-E-A-T** — All SEO articles MUST include WAG authority narrative, original factory imagery references (v4.6)
12. **Carousel structure** — All carousels MUST have exactly 7 slides (1 hook + 5 content + 1 CTA) (v4.6)
13. **Personal brand voice** — All personal brand content MUST use Mark's first-person voice as Australia MD, never corporate third-person (v4.6)
14. **Mark's personal account only** — All content publishes on Mark's personal LinkedIn account ONLY — WAG Australia Managing Director (v4.8)

---

## Related Skills (Hub Coordinates with These)

| Skill | Purpose | Use when |
|-------|---------|---------|
| `content-engine` | Reference for content style | Social post generation logic |
| `article-writing` | Reference for article structure | SEO article generation logic |
| `crosspost` | Multi-platform distribution | Publishing across platforms |
| `baoyu-danger-gemini-web` | Image generation | Social post images via Gemini |
| `wag-seo-blog` | SEO blog optimization | Blog-specific SEO checks |
| `ai-content-pipeline` | Video generation | LinkedIn video, YouTube long-form |

---

## Image Generation (baoyu-danger-gemini-web) — dmux Pattern

**Image generation uses `baoyu-danger-gemini-web` with parallel dmux pattern — 3 agents generate 3 images simultaneously.**

| Purpose | Path |
|---------|------|
| Prompt files | `social/linkedin-post/{YYYY-MM-DD-topic}/prompts/*.md` |
| Generated images | `public/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/*.png` |

**Image Specs:**
| Image | Filename | Aspect | Purpose |
|-------|----------|--------|---------|
| Hero | `01-hero-{slug}.png` | 16:9 | LinkedIn/SEO cover |
| Hook | `02-hook-{slug}.png` | 16:9 | Social post hook |
| CTA | `03-cta-{slug}.png` | 16:9 | Consultation CTA |
| Carousel Slide | `slide-{n}-{slug}.png` | 4:5 | LinkedIn Carousel (v4.6) |

**Workflow:**

```
1. Save prompts → social/linkedin-post/{YYYY-MM-DD-topic}/prompts/
                  (ALL prompts: aspect: 16:9, or 4:5 for carousel)

2. Install deps (first time):
   cd {skillDir}/scripts && bun install

3. Generate images in PARALLEL (dmux):
   Agent 1: bun main.ts --promptfiles {p1}.md --image {out1}.png --model gemini-3-flash
   Agent 2: bun main.ts --promptfiles {p2}.md --image {out2}.png --model gemini-3-flash
   Agent 3: bun main.ts --promptfiles {p3}.md --image {out3}.png --model gemini-3-flash

   → Spawn all 3 agents simultaneously

4. Verify: ls public/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/
```

**Example (Parallel 3 images):**
```bash
SKILL_DIR="$HOME/.claude/plugins/cache/baoyu-skills/baoyu-skills/b791ee5dc725/skills/baoyu-danger-gemini-web/scripts"
PROMPT_DIR="/Users/mark/Projects/wag/social/linkedin-post/{YYYY-MM-DD-topic}/prompts"
OUT_DIR="/Users/mark/Projects/wag/public/social/linkedin-post/{YYYY-MM-DD-topic}/imgs"

# Install deps once
cd "$SKILL_DIR" && bun install 2>/dev/null

# Run ALL 3 in parallel (dmux)
cd "$SKILL_DIR" && bun main.ts --promptfiles "$PROMPT_DIR/01-hero.md" --image "$OUT_DIR/01-hero-{slug}.png" --model gemini-3-flash &
cd "$SKILL_DIR" && bun main.ts --promptfiles "$PROMPT_DIR/02-hook.md" --image "$OUT_DIR/02-hook-{slug}.png" --model gemini-3-flash &
cd "$SKILL_DIR" && bun main.ts --promptfiles "$PROMPT_DIR/03-cta.md" --image "$OUT_DIR/03-cta-{slug}.png" --model gemini-3-flash &
wait
```

**Rule: Images saved directly to `public/social/...` — no copying between directories.**
**Rule: ALL social images are 16:9. Carousel images are 4:5 portrait.**

### Carousel Image Generation (v4.6 — Optimized)

**Carousel = 7 images generated in parallel dmux pattern.**

```bash
SKILL_DIR="$HOME/.claude/plugins/cache/baoyu-skills/baoyu-skills/b791ee5dc725/skills/baoyu-danger-gemini-web/scripts"
OUT_DIR="/Users/mark/Projects/wag/public/social/linkedin-post/{YYYY-MM-DD-topic}/carousel"
mkdir -p "$OUT_DIR"

# Install deps once
cd "$SKILL_DIR" && bun install 2>/dev/null

# Generate ALL 7 carousel slides in parallel (dmux)
cd "$SKILL_DIR" && bun main.ts --prompt "$(cat <<'EOF'
Professional B2B infographic. [Slide 1 specific content]. Navy #0F2D5E background, Amber #F59E0B accents, white text. 4:5 portrait aspect ratio.
EOF
)" --image "$OUT_DIR/slide-1.png" --model gemini-3-flash &

cd "$SKILL_DIR" && bun main.ts --prompt "..." --image "$OUT_DIR/slide-2.png" --model gemini-3-flash &
# ... slides 3-7 in parallel ...
wait
```

**Carousel Image Design Rules (v4.6):**
- Background: Navy (#0F2D5E) for all slides
- Accents: Amber (#F59E0B) for icons, arrows, badges
- Typography: 80pt min for headlines, 40pt min for body text
- Style: Professional B2B infographic, NO stock photos, NO emoji
- Visual metaphors: split-screen comparisons, red X on myths, step-by-step icons

**Carousel Prompt Template:**
```
Professional B2B infographic: [EXACT SLIDE CONTENT]. 
Color scheme: Navy #0F2D5E background, Amber #F59E0B accents, white text.
Clean corporate style. 4:5 portrait aspect ratio.
```

**典型 Carousel 主题 → Prompt 策略：**
| Slide | 策略 | 示例 |
|-------|------|------|
| Slide 1 (Hook) | 分屏对比 + 震惊数据 | "Split screen: factory vs office skyscraper, $50M loss stat" |
| Slide 2 (Myth) | 红色X + 颠覆认知 | "Gold badge crossed out, 'PAID fee ≠ factory proof'" |
| Slides 3-6 | 图标列表式 | "3 numbered steps with icons in amber circles" |
| Slide 7 (CTA) | 简洁价值主张 | "Navy bg, amber banner, 'Book Free Consultation'" |

---

## Video Content Hub (v4.6 — New)

### Video Content Types

| Type | Platform | Length | Frequency | Purpose |
|------|----------|--------|-----------|---------|
| Factory Verification Walkthrough | LinkedIn native | 60-90s | Per trip | Prove process, build trust |
| WAG Team Perspective | LinkedIn native | 45-60s | 1-2x/week | Company authority voice |
| AV Equipment Investigation | LinkedIn native | 30-60s | Per trip | Industry vertical proof |
| Factory Documentary | YouTube | 10-15 min | Monthly | SEO + deep trust |
| Trade Show Recap | YouTube | 5-10 min | Per event | Event leverage |
| Retargeting Reel | LinkedIn Ads | 15-30s | Ongoing | Nurture warm audiences |

### Video Production Workflow (End-to-End)

```
PHASE 1: Pre-Trip Planning
1. Identify factories to visit on upcoming China trip
2. Write video concept brief for each visit (hook + key points)
3. Prepare talking points (3-5 key differentiators per factory)
4. Check equipment: phone (1080p+), gimbal/stabilizer, lapel mic

PHASE 2: On-Site Filming
1. B-roll: Wide establishing shots, production line, QC process, warehouse
2. Talking head: WAG team member front-of-camera with factory in background
3. Interview: Factory representative (with interpreter if needed)
4. Detail shots: Certificates, machinery, finished products, packaging

PHASE 3: Post-Production (via ai-content-pipeline)
1. Select best clips (prioritize authenticity over polish)
2. Add captions (mandatory — 75% sound-off viewing)
3. Add WAG branding overlay (Navy #0F2D5E, Amber #F59E0B)
4. Add background music (subtle, professional — no catchy pop)
5. Export: LinkedIn native (9:16 + 16:9) + YouTube (16:9)

PHASE 4: Distribution
1. LinkedIn: Mark's personal account (T+0)
2. YouTube: Long-form (T+48h)
3. YouTube: Long-form uploaded within 48h
4. YouTube Shorts: 3 clips extracted within 72h
5. Blog: Text summary + embedded video
6. Newsletter: Link to YouTube video
```

### Video Hook Templates

```
TYPE: Factory Verification Walkthrough
HOOK: "This is what we found when we walked into a Shenzhen electronics factory."
BODY: Verification steps, factory conditions, WAG process
CTA: "Comment 'FACTORY' and I'll send you our free verification checklist."

TYPE: Myth vs Reality (WAG Team)
HOOK: "Most Australian buyers think this about 1688 suppliers... [myth statement]"
BODY: Reality from WAG's field experience, specific examples
CTA: "What's your biggest challenge sourcing from China? Tell me below."

TYPE: Case Study Video
HOOK: "[Company Type] came to us because [fear statement]..."
BODY: WAG solution + specific result
CTA: "Similar challenge? Book a free 20-min call: winningadventure.com.au/enquiry"

TYPE: Retargeting Reel
HOOK: "Still sourcing from 1688 without verifying first?"
BODY: Quick proof point or warning
CTA: "We visited [X] factories in [city]. Here's what to look for."
```

### YouTube Channel Strategy

```
Channel Name: Winning Adventure Global
Description: We help Australian businesses find verified manufacturers in China.
              No scams. No surprises. Just real factories.

Content Pillars:
1. Factory Tours (50%) — Visits to verified factories across China
2. Verification Education (30%) — How to identify real manufacturers
3. Procurement Insights (20%) — Negotiation, logistics, quality control

Upload Schedule: 1 video every 2 weeks (sustainable)
Video Length: 8-15 minutes (documentary-style)
SEO Tags: australia china sourcing, factory verification, 1688,
          chinese supplier, procurement china, verified manufacturer

Cross-Post Strategy:
YouTube → LinkedIn Shorts (3 clips per video)
YouTube → Blog embed (text summary + video player)
YouTube → Newsletter (link to latest video)
```

### What NOT to Do

| Mistake | Why to Avoid | Correct Approach |
|---------|-------------|------------------|
| Polished corporate narration | Authenticity > polish in B2B manufacturing | WAG team member speaks directly to camera |
| Generic "about our services" | Warm audiences need progress-oriented content | Specific factory visit, specific findings |
| Video without captions | 75% watch sound-off on mobile | Always add captions (auto-generate + edit) |
| Posting without engagement plan | First 60 min engagement determines algorithm reach | Reply to every comment immediately |
| Same content on all platforms | Platform-specific optimization matters | Adapt format/length per platform |
| Over-producing content | Creates unsustainable pace | Start with phone + basic editing |

---

## HTML Preview (v4.4 — Enhanced)

After content generation, create ONE HTML preview file per batch at:

```
social/publish-previews/{YYYY-MM-DD-topic}.html
```

**HTML Template (Complete, v4.4):**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WAG Content Pack — {YYYY-MM-DD Topic}</title>
  <style>
    :root { --navy: #0F2D5E; --amber: #F59E0B; --gray: #6B7280; --light: #F9FAFB; --danger: #DC2626; --success: #059669; }
    body { font-family: 'IBM Plex Sans', system-ui, sans-serif; max-width: 960px; margin: 0 auto; padding: 2rem; }
    h1 { color: var(--navy); border-bottom: 3px solid var(--amber); padding-bottom: 0.5rem; }
    h2 { color: var(--navy); margin-top: 2rem; }
    .channel { background: var(--light); border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0; }
    .channel h3 { margin-top: 0; color: var(--navy); display: flex; align-items: center; gap: 0.5rem; }
    .channel-type { font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: normal; }
    .type-fear { background: #FEE2E2; color: var(--danger); }
    .type-case { background: #DBEAFE; color: #1D4ED8; }
    .type-lead { background: #D1FAE5; color: var(--success); }
    .type-social { background: #F3F4F6; color: var(--gray); }
    .type-carousel { background: #EDE9FE; color: #7C3AED; }
    .type-personal { background: #FDF4FF; color: #A21CAF; }
    .content-box { background: white; border: 1px solid #E5E7EB; border-radius: 4px; padding: 1rem; white-space: pre-wrap; font-size: 14px; line-height: 1.6; }
    .copy-btn { background: var(--navy); color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-size: 14px; margin-right: 0.5rem; }
    .copy-btn:hover { background: #1a3d6e; }
    .copy-btn:active { background: var(--amber); }
    .hashtags { color: var(--gray); font-size: 13px; margin-top: 0.5rem; }
    .images { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1rem; }
    .images img { max-width: 300px; border-radius: 4px; border: 1px solid #E5E7EB; }
    .meta { color: var(--gray); font-size: 13px; margin-bottom: 1rem; }
    .warning { background: #FEF3C7; border-left: 4px solid var(--amber); padding: 1rem; margin: 1rem 0; }
    .thread-label { font-weight: bold; color: var(--navy); margin-bottom: 0.5rem; margin-top: 1rem; }
    .seo-meta { background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 4px; padding: 1rem; margin: 1rem 0; font-size: 13px; }
    .seo-meta strong { color: var(--navy); }
    .seo-content { background: white; border: 1px solid #E5E7EB; border-radius: 4px; padding: 1rem; font-size: 13px; line-height: 1.6; max-height: 400px; overflow-y: auto; }
    .case-study-box { background: linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%); border: 2px solid var(--navy); border-radius: 8px; padding: 1.5rem; margin: 1rem 0; }
    .case-metric { font-size: 2rem; font-weight: bold; color: var(--navy); }
    .case-label { font-size: 12px; color: var(--gray); text-transform: uppercase; letter-spacing: 0.05em; }
    .case-quote { border-left: 3px solid var(--amber); padding-left: 1rem; font-style: italic; color: #374151; margin-top: 1rem; }
    .lead-magnet-box { background: linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%); border: 2px solid var(--amber); border-radius: 8px; padding: 1.5rem; margin: 1rem 0; }
    .lm-type { display: inline-block; background: var(--amber); color: white; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .lm-outline { margin-top: 1rem; }
    .lm-outline li { margin-bottom: 0.5rem; }
    .lm-cta { background: var(--navy); color: white; padding: 1rem; border-radius: 4px; margin-top: 1rem; text-align: center; font-weight: bold; }
    .fear-box { background: #FEF2F2; border-left: 4px solid var(--danger); padding: 1rem; margin: 1rem 0; border-radius: 0 4px 4px 0; }
    .fear-label { color: var(--danger); font-weight: bold; font-size: 12px; text-transform: uppercase; }
    .fear-badge { display: inline-flex; align-items: center; gap: 0.25rem; background: #FEE2E2; color: var(--danger); padding: 2px 8px; border-radius: 4px; font-size: 11px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin: 1rem 0; }
    .metric-card { background: white; border: 1px solid #E5E7EB; border-radius: 4px; padding: 1rem; text-align: center; }
    .metric-value { font-size: 1.5rem; font-weight: bold; color: var(--navy); }
    .metric-label { font-size: 11px; color: var(--gray); text-transform: uppercase; }
    .metrics-section { background: var(--light); border-radius: 8px; padding: 1.5rem; margin: 1rem 0; }
    .deploy-cmd { background: #1F2937; color: #10B981; padding: 1rem; border-radius: 4px; font-family: monospace; font-size: 13px; margin: 0.5rem 0; white-space: pre-wrap; }
    .carousel-section { background: #F5F3FF; border: 2px solid #7C3AED; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; }
    .slide-preview { background: white; border: 1px solid #E5E7EB; border-radius: 4px; padding: 1rem; margin: 0.5rem 0; }
    .slide-num { display: inline-block; background: #7C3AED; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-right: 0.5rem; }
    .personal-brand-section { background: #FDF4FF; border: 2px solid #A21CAF; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; }
    .video-section { background: #ECFDF5; border: 2px solid #059669; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; }
  </style>
</head>
<body>
  <h1>WAG Content Pack — {YYYY-MM-DD Topic}</h1>
  <p class="meta">Generated: {date} | Target: {target_audience} | Type: {content_type}</p>

  <!-- LinkedIn -->
  <div class="channel">
    <h3>LinkedIn Post <span class="channel-type type-social">Social</span></h3>
    <button class="copy-btn" onclick="copyContent('linkedin')">Copy Post</button>
    <div class="content-box" id="linkedin">{linkedin_content}</div>
    <p class="hashtags">{hashtags}</p>
    <div class="images">
      <img src="../../public/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/01-hero-{slug}.png" alt="Hero">
      <img src="../../public/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/02-hook-{slug}.png" alt="Hook">
      <img src="../../public/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/03-cta-{slug}.png" alt="CTA">
    </div>
  </div>

  <!-- Carousel (v4.6) -->
  <div class="carousel-section">
    <h3 style="margin-top:0;">LinkedIn Carousel <span class="channel-type type-carousel">Carousel</span></h3>
    <p class="meta">7 slides | 4:5 portrait | PDF upload to LinkedIn</p>
    <div class="slide-preview"><span class="slide-num">1</span>HOOK — {slide_1_hook}</div>
    <div class="slide-preview"><span class="slide-num">2</span>{slide_2}</div>
    <div class="slide-preview"><span class="slide-num">3</span>{slide_3}</div>
    <div class="slide-preview"><span class="slide-num">4</span>{slide_4}</div>
    <div class="slide-preview"><span class="slide-num">5</span>{slide_5}</div>
    <div class="slide-preview"><span class="slide-num">6</span>{slide_6}</div>
    <div class="slide-preview"><span class="slide-num">7</span>CTA — {slide_7_cta}</div>
    <p class="hashtags">Caption: {carousel_caption}</p>
  </div>

  <!-- X / Twitter -->
  <div class="channel">
    <h3>X / Twitter <span class="channel-type type-social">Social</span></h3>
    <div class="thread-label">Main Tweet</div>
    <button class="copy-btn" onclick="copyContent('x1')">Copy Main Tweet</button>
    <div class="content-box" id="x1">{x_main_tweet}</div>
  </div>

  <!-- Facebook -->
  <div class="channel">
    <h3>Facebook Post <span class="channel-type type-social">Social</span></h3>
    <button class="copy-btn" onclick="copyContent('facebook')">Copy Post</button>
    <div class="content-box" id="facebook">{facebook_content}</div>
  </div>

  <!-- SEO Blog -->
  <div class="channel">
    <h3>SEO Blog Article <span class="channel-type type-lead">Long-form</span></h3>
    <div class="seo-meta">
      <strong>Title:</strong> {article_title}<br>
      <strong>URL Slug:</strong> /resources/{slug}<br>
      <strong>Primary Keyword:</strong> {primary_keyword}<br>
      <strong>Word Count:</strong> {word_count}<br>
      <strong>Author:</strong> Winning Adventure Global<br>
      <strong>FAQ Schema:</strong> {faq_count} Q&A pairs included
    </div>
    <div class="seo-content">
      {embed_first_500_words_of_article}
    </div>
    <p class="meta" style="margin-top:1rem;">Deploy command:</p>
    <code class="deploy-cmd">git add . && git commit -m "feat: {title}" && git push origin master</code>
    <p class="meta">Live URL: <a href="https://www.winningadventure.com.au/resources/{slug}" target="_blank">winningadventure.com.au/resources/{slug}</a></p>
  </div>

  <!-- Video (v4.6) -->
  <div class="video-section">
    <h3 style="margin-top:0;">Video Content <span class="channel-type" style="background:#D1FAE5;color:#059669;">Video</span></h3>
    <div class="seo-meta">
      <strong>Type:</strong> {video_type} | <strong>Platform:</strong> {platform} | <strong>Duration:</strong> {duration}<br>
      <strong>Hook:</strong> {video_hook}<br>
      <strong>Pipeline:</strong> Image → Video (wan-2-5) + Voiceover (kokoro-tts) + Captions
    </div>
    <p class="meta">Distribution: LinkedIn (T+0) → YouTube (T+48h) → YouTube Shorts (T+72h)</p>
  </div>

  <!-- Case Study (if generated) -->
  {CASE_STUDY_SECTION}

  <!-- Lead Magnet (if generated) -->
  {LEAD_MAGNET_SECTION}

  <!-- Images Gallery -->
  <div class="channel">
    <h3>Generated Images</h3>
    <div class="images">
      <div>
        <img src="../../public/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/01-hero.png" alt="Hero">
        <small>Hero: 16:9 infographic</small>
      </div>
      <div>
        <img src="../../public/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/02-hook.png" alt="Hook">
        <small>Hook: 16:9</small>
      </div>
      <div>
        <img src="../../public/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/03-cta.png" alt="CTA">
        <small>CTA: 16:9 landscape</small>
      </div>
    </div>
  </div>

  <script>
    function copyContent(id) {
      const el = document.getElementById(id);
      navigator.clipboard.writeText(el.innerText).then(() => {
        const btn = el.previousElementSibling;
        if (btn && btn.classList.contains('copy-btn')) {
          const original = btn.textContent;
          btn.textContent = 'Copied!';
          btn.style.background = '#F59E0B';
          setTimeout(() => { btn.textContent = original; btn.style.background = '#0F2D5E'; }, 1500);
        }
      });
    }
  </script>
</body>
</html>
```

### Case Study HTML Section Template

```html
<!-- Case Study (if generated) -->
<div class="channel" id="case-study">
  <h3>
    Case Study
    <span class="channel-type type-case">Trust Building</span>
  </h3>
  <div class="case-study-box">
    <div style="margin-bottom: 1rem;">
      <h4 style="margin:0; color: var(--navy);">{case_study_title}</h4>
      <p style="margin:0.5rem 0 0; color: var(--gray); font-size: 14px;">{client_industry} — {client_location}</p>
    </div>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="case-metric">{savings_amount}</div>
        <div class="case-label">Saved</div>
      </div>
      <div class="metric-card">
        <div class="case-metric">{timeframe}</div>
        <div class="case-label">Timeframe</div>
      </div>
      <div class="metric-card">
        <div class="case-metric">{suppliers_found}</div>
        <div class="case-label">Verified Suppliers</div>
      </div>
      <div class="metric-card">
        <div class="case-metric">{quality_improvement}</div>
        <div class="case-label">Quality Improvement</div>
      </div>
    </div>
    <div class="case-quote">
      "{testimonial_quote}"
      <br><strong>— {client_name}, {client_role}, {client_company}</strong>
    </div>
  </div>
  <button class="copy-btn" onclick="copyContent('case-study-content')">Copy Case Study</button>
  <div class="content-box" id="case-study-content" style="display:none;">
{case_study_full_content}
  </div>
  <p class="meta">Deploy path: content/blog/{case_slug}.mdx</p>
  <code class="deploy-cmd">git add . && git commit -m "feat: case study — {case_study_title}" && git push origin master</code>
</div>
```

### Lead Magnet HTML Section Template

```html
<!-- Lead Magnet (if generated) -->
<div class="channel" id="lead-magnet">
  <h3>
    Lead Magnet
    <span class="channel-type type-lead">Email Capture</span>
  </h3>
  <div class="lead-magnet-box">
    <span class="lm-type">{LM_TYPE}</span>
    <h4 style="margin: 1rem 0 0.5rem; color: var(--navy);">{lm_title}</h4>
    <p style="color: #374151; font-size: 14px;">{lm_description}</p>
    <div class="lm-outline">
      <strong style="font-size: 13px;">What's inside:</strong>
      <ul style="margin: 0.5rem 0 0 1.2rem; font-size: 13px;">
{lm_outline_items}
      </ul>
    </div>
    <div class="lm-cta">
      Download at: winningadventure.com.au/downloads/{lm_filename}.pdf<br>
      <small style="opacity: 0.8; font-weight: normal;">Email gate: {email_capture_mechanism}</small>
    </div>
  </div>
  <button class="copy-btn" onclick="copyContent('lm-content')">Copy Lead Magnet Content</button>
  <div class="content-box" id="lm-content" style="display:none;">
{lead_magnet_full_content}
  </div>
  <p class="meta">Upload path: public/downloads/{lm_filename}.pdf</p>
</div>
```

---

## Viewing HTML Previews (IMPORTANT)

**file:// URLs have security restrictions** — browsers block loading images from file:// URLs.

**Two options:**

### Option 1: Copy to public/ (Recommended for local viewing)
```bash
cp social/publish-previews/{YYYY-MM-DD-topic}.html public/
```
Then open: `http://localhost:3000/{YYYY-MM-DD-topic}.html`

### Option 2: Use local dev server
```bash
cd /Users/mark/Projects/wag && npm run dev
```
Navigate to: `http://localhost:3000/social/publish-previews/{YYYY-MM-DD-topic}.html`

**Image paths in HTML must use RELATIVE paths:**
- From `social/publish-previews/` → `../../public/social/...`
- Never use absolute `/social/...` paths in HTML preview

---

## Content Pipeline Summary (v4.6)

```
USER INPUT
    │
    ├── Socratic Q&A (3-5 questions, fear-first framework)
    │
    ├── CONTENT TYPE ROUTING
    │   ├── Social Post → LinkedIn + X + Facebook agents (parallel)
    │   ├── SEO Article → Blog article agent (E-E-A-T enhanced, v4.6)
    │   ├── Case Study → Case study agent (with metric checks)
    │   ├── Lead Magnet → Lead magnet agent (actionable value checks)
    │   ├── Fear-Driven → Fear content agent + social adaptation
    │   ├── LinkedIn Carousel → Carousel agent (7-slide structure, v4.6)
    │   ├── Personal Brand → Personal brand agent (first-person, v4.6)
    │   ├── LinkedIn Document → Document agent (PDF checklist, v4.6)
    │   └── Video Content → Video agent (ai-content-pipeline, v4.6)
    │
    ├── PARALLEL AGENT EXECUTION (dmux)
    │
    ├── BRAND + QUALITY GATES
    │   ├── No emoji / No Chinese / Navy+Amber / Specific CTA
    │   ├── Fear-first: anxiety named before solution (v4.4)
    │   ├── Case study: specific metrics required
    │   ├── Lead magnet: actionable value required
    │   ├── Carousel: exactly 7 slides (1+5+1 structure) (v4.6)
    │   ├── Personal brand: first-person founder voice (v4.6)
    │   └── SEO: E-E-A-T signals + FAQ Schema + Winning Adventure Global author (v4.7)
    │
    ├── QA REVIEW (user confirmation)
    │
    ├── EMAIL CAPTURE + NURTURE (v4.6)
    │   ├── Landing page email collection
    │   ├── 7-email nurture sequence (Day 0→45)
    │   └── Trigger sequences (abandoned inquiry, blog, re-engagement)
    │
    └── DISTRIBUTION (crosspost + git push + Sales Navigator outreach, v4.6)
```

---

## Version History

| Version | Changes |
|---------|---------|
| v4.0 | Initial parallel orchestration hub |
| v4.1 | Socratic Q&A expansion, Hub state management |
| v4.2 | dmux image generation, HTML preview improvements |
| v4.3 | Enhanced QA gates, staggered distribution timing |
| v4.4 | Fear-driven content templates, Case Study flow, Lead Magnet flow, Enhanced HTML preview |
| v4.5 | **Agent Output Schema (standardized), Error Recovery Contract, Benchmarking section, Context Budget optimization, Hub state error tracking** |
| **v4.6** | **Template E (LinkedIn Carousel), Template F (Personal Brand), Template G (LinkedIn Document Post), Template H (Thought Leadership Text), Template I (LinkedIn Native Video). New flows: linkedin-carousel, personal-brand, linkedin-document, video-content, topic-cluster-expansion. SEO E-E-A-T enhanced with company author + first-person narrative + FAQ Schema. Email nurture sequence (7-email, Day 0-45) + trigger sequences. Hub state extended with new content types. ai-content-pipeline video integration.** |
| **v4.7** | WAG company-only policy: removed all Andy Liu personal brand references. All content via WAG company page only. LinkedIn carousel integration via baoyu-danger-gemini-web. |
| **v4.8** | **Mark's personal account policy: all content publishes via Mark's personal LinkedIn account — WAG Australia Managing Director.** |

---

*Version 4.8 — Mark's personal account policy: all content publishes via Mark's personal LinkedIn account — WAG Australia Managing Director*
