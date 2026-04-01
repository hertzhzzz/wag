---
name: wag-facebook-post
description: "Generate WAG-branded Facebook posts. Use when: user wants a Facebook post, or when adapting core content from LinkedIn/SEO blog/X to Facebook format. Prioritizes community warmth and emotional connection over professional authority."
---

# WAG Facebook Post Generator

## Overview

Generates Facebook posts for Winning Adventure Global. Facebook is a **relationship-first platform** — content should feel like advice from a trusted community member, not a B2B consultant. Lead with emotional connection, not information delivery.

**When to use:** User wants a Facebook post for WAG, or adapting core content from LinkedIn/SEO blog to Facebook format.

**Key difference from LinkedIn:** LinkedIn = "Learn from an expert." Facebook = "We've all been through this."

## WAG Business Model Context

**Source:** WAG-Australia Business Model v1.0 (2026-03-22)

**Target Customer:** Australian SME owners (AV/audio/lighting/event rental, automotive) facing price premiums when buying through Australian wholesalers vs direct factory sourcing.

**Three barriers:** Language, Trust, Logistics

**WAG Differentiation:** "Tell me what you need. I get you a free factory quote. If the price works, I take you to see the factory yourself."

**Language approach:** Socratic questions in Simplified Chinese, but the generated Facebook post in English (for audience reach).

## Socratic Questions

**Q1 — Story Discovery:**
"这个话题背后有没有一个真实的经历——你、客户或行业内发生的事？"
*(Is there a real story behind this topic?)*

Facebook needs emotional hooks before educational value. If the user has a war story, lead with it.

**Q2 — Community Angle:**
"这篇内容是想让读者感到'我也是这样'，还是想让他们'学到新东西'？"
*(Does the audience need to feel "I've been there too" or "I just learned something new"?)*

For Facebook, prioritize "I've been there too" — this drives Saves and Shares.

**Q3 — Engagement Goal:**
"这条帖子的主要互动目标是收藏清单、分享给朋友、还是评论区讨论？"
*(What's the primary engagement goal?)*

| 目标 | CTA 类型 | 示例 |
|------|---------|------|
| Saves（收藏） | "Save this for later" | "收藏这张清单，下次去中国验厂用得上" |
| Shares（分享） | "Tag a friend who..." | "标注一个正在考虑去中国验厂的朋友" |
| Comments（评论） | "Have you ever...?" | "你有没有遇到过飞到工厂发现工厂不存在的经历？" |

**Q4 — Visual Asset:**
"有适合配图的素材吗？——工厂实拍、客户合影、数据图表？"
*(Do you have visual assets?)*

Photos get +35% higher engagement. Best for WAG: real factory/customer photos in carousel format.

## RAG Procedure

1. **Glob** — Find blog files: `content/blog/*.mdx`
2. **Grep** — Search matching content (head_limit: 3)
3. **Read** — Extract from top 3 matched files
4. **Incorporate** — Use WAG-specific stats, stories, case studies

Always invoke RAG before generating. Ground the post in WAG's actual experience.

## Post Templates

### Template A: War Story → Lesson → Saveable Checklist
**Best for:** Verification how-to, cautionary tales
**Drives:** Saves + Shares

```
[HOOK — emotional open, max 125 characters]
"A client flew to Guangzhou to verify a factory last month. The factory wasn't there."

[BREAK]

[BODY — 3 paragraphs]
Paragraph 1: What happened (specific, sensory details — amounts, places, timeline)
Paragraph 2: What went wrong (the verification step that was skipped)
Paragraph 3: How to avoid it (the checklist, framed as "here's what we learned")

[BREAK]

[CHECKLIST — numbered]
Before your next factory visit, verify:
1. [Business license on gsxt.gov.cn — takes 2 minutes]
2. [Live production lines during working hours — video call counts]
3. [Direct contact with the person who signs your contract]

[BREAK]

[CTA — Save-driven]
"Save this checklist for your next China trip. And if you've ever arrived at a factory that wasn't what you expected — tell us what happened in the comments."

[HASHTAGS — 2-3 only, at bottom]
#AustraliaChina #SourcingFromChina #AustralianBusiness
```

### Template B: Quick Wins List
**Best for:** Tips, hacks, fast actionable content
**Drives:** Saves

```
[HOOK — promise-led, max 90 characters]
"The one thing I wish I knew before my first China factory visit"

[BREAK]

[BODY — punchy, short sentences]

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
**Best for:** Opinions, industry observations
**Drives:** Comments

```
[HOOK — conversation opener, max 90 characters]
"How many Australian importers actually verify a factory's license before placing an order?"

[BREAK]

[BODY — 2 paragraphs]
Paragraph 1: The observation (what you noticed, why it matters)
Paragraph 2: Your take (WAG's perspective, honest and direct)

[BREAK]

[ENGAGEMENT PROMPT]
"What's been your experience? Have you ever skipped verification and regretted it?"

[HASHTAGS — 2-3]
```

## CTA Frameworks

| CTA Type | Formula | Primary Signal |
|----------|---------|----------------|
| **Save for later** | "Save this [checklist/guide] for when you need it" | Saves |
| **Share with network** | "Tag a [friend/colleague] who [specific situation]" | Shares |
| **Share your experience** | "Have you ever [specific situation]?" | Comments |
| **Complete the sentence** | "The biggest [industry problem] I see is..." | Comments |

**Never use:**
- "Like if you agree" — engagement bait, algorithm penalized
- External links in post body — <1% reach
- More than one CTA per post
- Generic CTAs without specific trigger

## Hashtag Strategy

Facebook hashtags have minimal discovery impact — use for tracking only.

| Type | Count | Examples |
|------|-------|----------|
| Core tags (always) | 1-2 | #AustraliaChina #SourcingFromChina |
| Audience tag | 1 | #AustralianBusiness #SmallBusinessAustralia |
| Brand tag | 0-1 | #WinningAdventureGlobal (brand content only) |

**Total: 2-3 hashtags maximum**

**Placement:** Bottom of post, separated by blank line. Never in body text.

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

**First 60 minutes:** Stay online to respond to comments. Facebook boosts posts with early engagement.

## Content Format Decision Tree

| Topic Type | Recommended Format | Why |
|------------|-------------------|-----|
| Verification how-to | Template A (Story+Checklist) | Drives Saves, community storytelling |
| Warning/Cautionary | Template A (War Story) | Emotional hook, shareability |
| Quick tips/Process | Template B (Quick Wins) | Digestible, saveable |
| Industry opinion | Template C (Question) | Discussion driver |
| Brand introduction | Story + Real Photo | Warm, human, authentic |

**Format priority:** Story+Checklist > Story Only > Quick Wins > Discussion > Brand Intro

## Critical Rules

- **No external links in post body** — <1% reach penalty. Use comments or Messenger for CTAs.
- **2-3 hashtags maximum** — Facebook doesn't use hashtags for content discovery.
- **Hook must be emotional** — "A client flew to Guangzhou..." not "3 steps to verify a factory"
- **Saves > Shares > Comments** — Design CTAs to drive saves first.
- **Always invoke RAG** — Retrieve at least 1 WAG blog post.
- **No emoji** — WAG brand rule.
- **Visual content whenever possible** — Photos get +35% engagement vs text-only.
- **First 60 minutes online** — Respond to comments for algorithmic boost.
- **Save-driven CTAs for checklists** — "Save this for later" is the most powerful Facebook CTA.
- **Content must complete value delivery within Facebook** — do not use Facebook as a traffic funnel.

## Brand Voice

Same WAG voice as wag-linkedin-post:
- Reliable, Professional, Exclusive
- Practical, direct, experienced
- No emoji, no salesy language
- Speak from first-hand experience

**Facebook-specific:**
- More conversational tone
- First-person plural ("we") or personal ("I") preferred over institutional ("WAG")
- Shorter sentences, more paragraph breaks
- Mobile-friendly reading pace
