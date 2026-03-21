---
name: wag-linkedin-post
description: "Generate WAG-branded LinkedIn posts using Socratic questioning and RAG-powered content retrieval"
---

# WAG LinkedIn Post Generator

## Overview

This skill generates high-quality LinkedIn posts for Winning Adventure Global using a Socratic questioning approach to guide topic selection, combined with RAG-powered retrieval of relevant WAG content.

**Language approach:** Socratic questions are presented in Simplified Chinese (to match WAG's client base), but the generated LinkedIn post is always in English (for LinkedIn audience reach).

**When to use:** When a user wants to create a LinkedIn post for WAG, invoke this skill to guide them through topic selection (in Chinese), retrieve relevant WAG insights, and produce a formatted English post ready to publish.

## Socratic Question Flow

Before generating any content, guide the user through exactly 4 questions to clarify the post direction. Present questions in Simplified Chinese to match WAG client base, but generate the final LinkedIn post in English.

**Question 1 — Topic Discovery:**
"你的目标读者目前正在面临哪些中国采购挑战？"
*(What specific China sourcing challenge are your ideal LinkedIn post readers dealing with right now?)*
[Context: This identifies the core pain point — e.g., factory verification, quality control, communication barriers, minimum order quantities]

**Question 2 — Pain Point Clarification:**
"关于这个挑战，你听到过哪些最常见的误解？"
*(What's the most common misconception about this challenge that you've encountered?)*
[Context: This surfaces the fear or myth to debunk — e.g., "all Chinese factories are the same," "websites prove legitimacy," "the cheapest option is most efficient"]

**Question 3 — Post Tone:**
"你希望这篇文章起到什么作用——教育（建立认知）、挑战（引发讨论）还是激励（展示可能性）？"
*(Do you want this post to educate, challenge, or inspire?)*
[Context: Guides the emotional register — educate for awareness, challenge for engagement, inspire for aspiration]

**Question 4 — CTA Direction:**
"读者读完文章后应该做什么——在评论区分享经验、联系咨询，还是改变对这个话题的看法？"
*(What should readers do after reading — share their experience in comments, reach out for a consultation, or think differently?)*

**Question 5 — Posting Perspective:**
"这篇文章是以公司主页还是个人账号发布？"
*(Company Page or Personal Profile?)*

| 选择 | 影响 |
|------|------|
| **公司主页** | 使用"We"，突出WAG专业服务，算法触及率较低但品牌积累强 |
| **个人账号** | 使用"I"，创始人IP背书，算法触及率更高，更易病毒传播 |

[Context: Determines tone, pronouns, and how WAG is positioned in the post]

## RAG Implementation

After gathering the user's answers, retrieve relevant WAG content before generating the post:

1. **Glob** — Find all blog files:
   ```
   Pattern: content/blog/*.mdx
   ```

2. **Grep** — Search for content matching the user's topic (use `head_limit: 3` to limit matches)

3. **Read** — Extract content from the top 3 matched files

4. **Incorporate** — Use sourced statistics, examples, case studies, or insights from the retrieved content in the generated post

**Important:** Always invoke RAG to retrieve at least 1 WAG blog post before generating. This ensures the post references specific WAG expertise rather than generic content.

## LinkedIn Post Template

```
[HOOK - max 210 characters, bold statement or question that creates curiosity]

[BREAK - line gap]

[BODY - 3-5 short paragraphs]
- Paragraph 1: Context (1-2 sentences establishing the situation)
- Paragraph 2-4: Core insight with specific WAG-relevant examples/data
- Paragraph 5: Transition to CTA

[BREAK]

[CTA - soft question that drives comments]
"What would you do differently? Share in comments."
OR
"How has this affected your sourcing strategy? Let's discuss."

[HASHTAGS - exactly 6-10 strategic tags]
#ChinaSourcing #AustralianBusiness #Manufacturing #etc
```

## Fact Check Procedure

After generating the LinkedIn post, perform a deep fact check using parallel research agents before presenting to the user.

**Requirement: Deploy at least 5 parallel research agents for cross-validation.**

### Research Agent Protocol

1. **Deploy 5+ research agents in parallel**, each focusing on a different verification angle:

   | Agent | Focus |
   |-------|-------|
   | Agent 1 | Platform supplier verification (1688, Alibaba - trading company vs factory) |
   | Agent 2 | LinkedIn B2B content engagement metrics and algorithm signals |
   | Agent 3 | Australia-China sourcing statistics and challenges 2025-2026 |
   | Agent 4 | Factory verification methods and business license verification in China |
   | Agent 5 | LinkedIn post optimal length, hook strategies, comment-driven engagement |

2. **Each agent must:**
   - Use `mcp__MiniMax__web_search` for real-time data
   - Search at least 3 different sources per claim
   - Cross-validate against multiple authoritative sources
   - Return findings with source URLs

3. **Merge findings** into a unified fact check table:

   ```
   | Claim | Agent 1 | Agent 2 | Agent 3 | Status | Confidence |
   |-------|---------|---------|---------|--------|------------|
   ```

4. **Apply cross-validation rules:**
   - **High Confidence** — Confirmed by 3+ agents across different source types
   - **Medium Confidence** — Confirmed by 2 agents, or single authoritative source
   - **Low Confidence** — Single source, or conflicting findings
   - **Disputed** — Agents return contradictory information

5. **Present to user** with clear confidence levels and source attribution

6. **Update the post** — remove or rephrase any Low Confidence or Disputed claims before final approval

**Note:** Do not skip parallel research. A single web search is insufficient for professional credibility. Cross-validation is mandatory.

## WAG Brand Voice Guidelines

**Reference:** CLAUDE.md brand personality — Reliable, Professional, Exclusive

| Do | Don't |
|----|-------|
| Practical, direct language | Salesy or hype-driven copy |
| Specific WAG insights from RAG | Generic B2B clichés |
| Trust signals and credentials | Aggressive CTAs or urgency tactics |
| Experienced, knowledgeable tone | Emoji or informal abbreviations |

**Tone:** Professional but approachable. Position WAG as the knowledgeable guide, not the seller.

**Voice:** Speak from experience. Use specific numbers, dates, or case references when available from RAG content.

## Critical Rules

- **Hook MUST be within 210 characters** — LinkedIn truncates at the "see more" line (~3 lines / 210 chars). If the hook exceeds this, readers never see it.
- **Hashtags: 6-10 maximum** — LinkedIn's algorithm penalizes spam signals from excessive hashtags. Mix broad (#Manufacturing) with specific (#AustraliaChinaTrade) tags.
- **CTA: Soft question only** — Drive comments with engagement questions, not direct links or lead forms. LinkedIn's algorithm rewards comment activity.
- **No emoji anywhere in the post** — WAG brand rule. Emoji dilute professional positioning.
- **Always invoke RAG before generating** — Retrieve at least 1 WAG blog post to source specific insights. Posts without WAG-specific content feel generic.
- **Avoid "WA" abbreviation** — Use "Winning Adventure Global" or "WAG" as appropriate.
- **Fact check required before publishing** — Verify all claims against WAG blog content or web search. Present fact check table to user for approval.
