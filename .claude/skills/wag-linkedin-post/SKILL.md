---
name: wag-linkedin-post
description: "Generate WAG-branded LinkedIn posts and expand to blog articles"
---

# WAG LinkedIn Post Generator

## Overview

This skill generates high-quality LinkedIn posts for Winning Adventure Global using a Socratic questioning approach to guide topic selection, combined with RAG-powered retrieval of relevant WAG content. It also handles expansion to blog articles.

**Language approach:** Socratic questions are presented in Simplified Chinese (to match WAG's client base), but the generated LinkedIn post is always in English (for LinkedIn audience reach).

**When to use:** When a user wants to create a LinkedIn post for WAG, invoke this skill to guide them through topic selection (in Chinese), retrieve relevant WAG insights, and produce a formatted English post ready to publish.

## WAG Business Model Context (Core Reference)

**Source:** WAG-Australia 商业模型 v1.0 (2026-03-22)

**Target Customer Pain Points:**
- Australian SME owners (AV/audio/lighting/event rental, automotive) facing 20-30% price premium when buying through Australian wholesalers/importers vs direct factory sourcing
- Three insurmountable barriers: Language, Trust, Logistics
- Cannot independently verify if a factory is real or trustworthy
- Existing sourcing agents take orders on behalf of clients — clients never build direct relationships with factories
- Some agents hide 20-25% rebates, adding cost without transparency

**WAG Differentiation:**
- NOT a middleman, trading company, or sourcing agent
- Core promise: "Tell me what you need. I get you a free factory quote. If the price works, I take you to see the factory yourself."
- Value layers: Access, Trust, Safety, Logistics, Direct Relationship, Transparent Pricing
- WAG accompanies clients to China, helping them sign contracts directly with factories — WAG is the guide, not the intermediary

**Key Market Data:**
- 85% of Australian SMBs use Alibaba.com to find overseas suppliers
- China accounts for 62% of all inquiry sources for Australian importers
- Australia-China供应链管理 market: USD 949.4M in 2025, projected USD 2,277.9M by 2034 (CAGR 10.21%)

**Service Flow:**
- Step 1 (Free): SME describes product needs + current purchase price
- Step 2 (Free): WAG contacts factories for confidential quotes, delivers to client; factory names kept confidential pre-visit
- Step 3 (Paid): WAG coordinates full China trip — flights, hotel, translator, factory appointments; client signs directly with factory

**Pricing Model:**
- Transparent cost-plus: flights (actual) + hotel (actual) + translator (per day) + coordination service fee
- Estimated total per trip: A$5,300-8,300 for one client; A$3,500-5,000 per client when 2-3 SMEs share

## Socratic Question Flow

Before generating any content, guide the user through exactly 5 questions to clarify the post direction. Present questions in Simplified Chinese to match WAG client base, but generate the final LinkedIn post in English.

**Question 1 — Topic Discovery:**
"你的目标读者目前正在面临哪些中国采购挑战？"
*(What specific China sourcing challenge are your ideal LinkedIn post readers dealing with right now?)*
[Context: This identifies the core pain point — e.g., factory verification, quality control, communication barriers, minimum order quantities. Reference WAG business model: new brand companies cannot find source factories, cannot trust if factories are real]

**Question 2 — Content Structure:**
"这个问题适合用什么结构来表达——步骤框架（1-2-3步）、案例分析、还是揭露误区？"
*(What structure works best for this topic — step framework, case study, or myth-busting?)*
[Context: Based on WAG data, step frameworks (3 steps) outperform all other formats. Prioritize "before doing X, check these 3 things" structure.]

**Question 3 — War Story:**
"你自己或客户有没有经历过这个问题的真实案例？"
*(Do you have a real story from yourself or a client who experienced this problem?)*
[Context: Real stories drive engagement. If user has a story, lead with it. If not, create a composite scenario based on WAG experience.]

**Question 4 — CTA Design:**
"读者读完文章后，你希望他们做什么——分享类似经历、联系咨询、还是转发给有需要的人？"
*(What do you want readers to do after reading — share their experience, reach out for consultation, or forward to someone who needs this?)*

**Question 5 — Posting Perspective:**
"这篇文章是以公司主页还是个人账号发布？"
*(Company Page or Personal Profile?)*

| 选择 | 影响 |
|------|------|
| **公司主页** | 使用"We"，突出WAG专业服务，品牌积累强 |
| **个人账号** | 使用"I"，创始人IP背书，触及率更高，更易病毒传播 |

[Context: Determines tone, pronouns, and how WAG is positioned in the post. Per 2026 LinkedIn algorithm data, personal profiles outperform company pages by 561% in reach]

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

## LinkedIn Post Templates

### Template A: Step-By-Step Framework (ER=33.33%, Highest Performance)

```
[HOOK - max 210 characters]
Formula: "Before [action], verify [N] things: [promise]"
Example: "Before paying any deposit for your China order, verify three things: factory, not trading company."

[BREAK]

[BODY - 3 numbered steps]

Step 1 — [Tool/Method name, specific action]
[One sentence explaining why this matters]

Step 2 — [Tool/Method name, specific action]
[One sentence explaining the consequence of skipping]

Step 3 — [Tool/Method name, specific action]
[One sentence about Australian legal responsibility]

[BREAK]

[CTA - specific yes/no with reasoning]
"Did you know gsxt.gov.cn is free for anyone to verify a Chinese business license? Were you ever asked to check one before placing an order?"

[HASHTAGS - 6-10 tags, mix broad + niche]
#ChinaSourcing #FactoryVerification #AustraliaChina #SupplyChain #ImportFromChina #AustralianBusiness
```

### Template B: Document Carousel (Best Format for 2026 Algorithm)

For carousel posts, use this structure:
```
Slide 1 (Title): [Problem statement - curiosity hook]
Slide 2: [Context - why this matters for Australian businesses]
Slide 3: [Step 1 with specific tool/website]
Slide 4: [Step 2 with specific tool/website]
Slide 5: [Step 3 with specific tool/website]
Slide 6 (CTA): [Question that invites comments]
```

**Carousel tip:** LinkedIn's 2026 algorithm gives Document Carousels 6.6% average engagement vs 4% for text-only posts.

### Template C: Story → Lesson → Framework

```
[HOOK - 210 chars max]
"A client paid a $12,000 deposit to a supplier in March. By April, the factory had vanished."

[BREAK]

[STORY - 2-3 short paragraphs]
Paragraph 1: What happened (specific details — amounts, platform, timeline)
Paragraph 2: What went wrong (the verification step that was skipped)
Paragraph 3: What we did (how WAG would have prevented this)

[BREAK]

[FRAMEWORK - the 3 things to check]
Before paying any deposit, verify:
1. [Check on gsxt.gov.cn — business license shows "manufacturing"]
2. [Live video of production lines during working hours]
3. [Certification verified directly with issuing body]

[BREAK]

[CTA - experience trigger]
"What verification step would you add to this list? I read every comment."

[HASHTAGS]
```

---

## Content Format Decision Tree

Before generating, determine format based on topic:

| Topic Type | Recommended Format | Why |
|------------|-------------------|-----|
| Factory verification how-to | Template A (Steps) | Data-proven ER=33% |
| Warning/myth-busting | Template C (Story+Framework) | Story creates emotional hook |
| Process explanation | Document Carousel | Highest algorithm preference |
| Brand introduction | Text-only post | Simple, authentic |
| Industry data/statistics | Carousel or graphic | Visual breaks up numbers |

**Format priority for WAG topics:** Steps > Story+Framework > Carousel > Text > Brand Intro

### CTA Frameworks (Data-Proven to Drive Comments)

**CRITICAL:** WAG's historical CTA "What would you do differently? Share in comments." generated **0 comments** across all 3 posts. Replace with specific, experience-based questions.

| CTA Framework | Example | Why It Works |
|---------------|---------|--------------|
| **War story request** | "Has a supplier ever failed this step for you? What happened?" | Personal storytelling triggers empathy + comments |
| **Specific yes/no with reasoning** | "Did you know gsxt.gov.cn was free to use? Were you ever asked to verify a license?" | Binary question with nuance invitation |
| **Complete the sentence** | "The biggest mistake I see Australian brands make when verifying factories is..." | Positions reader as expert, invites correction/addition |
| **Industry-specific** | "For those in [AV/event/automotive]: what's your factory verification process?" | Creates tribe affinity, more likely to respond |
| **反面教材 request** | "What's the most costly lesson you've learned about supplier verification?" | People share mistakes readily; creates trust |

**DO NOT use:**
- "What would you do differently?" — too abstract, 0 comments historically
- "Share in comments" alone — passive, no trigger
- "Let's discuss" — vague, no specific angle

**Post first-comment-on-LinkedIn rule:** After posting, FIRST comment should be the answer to your own CTA question — this seeds the conversation and makes comment section look active.

### Hook Formulas (Ranked by WAG Data Performance)

| Rank | Hook Formula | Example | ER | CTR |
|------|-------------|---------|-----|-----|
| 1 | "Before [action], verify [N] things..." | "Before paying any deposit, verify three things..." | 33.33% | 20.83% |
| 2 | "Step 1/2/3 — [specific action]" | "Step 1 — Check the business license on gsxt.gov.cn" | 33.33% | 20.83% |
| 3 | "When you [situation], one fact matters most" | "When you source from China as a new Australian brand, one fact matters most..." | 33.33% | 20.83% |
| 4 | "Hi everyone, let us introduce..." | Intro posts | 9.09% | 2.27% |
| 5 | "[Observation] too late" | "Most Australian businesses discover this truth too late" | 7.02% | 1.75% |

**Recommendation:** Lead with numbered frameworks. The "3 steps" structure consistently outperformed all other approaches.

## WAG LinkedIn Performance Data (2026-03)

**Source:** LinkedIn Analytics export (03/04 - 03/23/2026), 3 organic posts

| Metric | Value |
|--------|-------|
| Total Impressions | 125 |
| Total Clicks | 7 |
| Total Likes | 9 |
| **Total Comments** | **0** |
| **Total Reposts** | **0** |
| Avg ER | 16.48% |
| Comment Rate | **0.00%** |

### Post Performance Ranking

| Rank | Content Type | Hook Style | Impressions | ER | CTR |
|------|-------------|------------|-------------|-----|------|
| 1 | Educational/How-to | 3-step framework | 24 | **33.33%** | **20.83%** |
| 2 | Brand Intro | "Hi everyone" | 44 | 9.09% | 2.27% |
| 3 | Awareness/Reveal | "Truth too late" | 57 | 7.02% | 1.75% |

### Key Performance Insights

1. **Higher impressions do NOT mean higher engagement.** The post with most impressions (57) had worst ER (7.02%) and lowest CTR (1.75%). The post with fewest impressions (24) had best ER (33.33%) and highest CTR (20.83%).

2. **Step-by-step framework content wins.** The 3-step verification framework post (33.33% ER) outperformed the "truth too late" post (7.02% ER) by 4.7x in engagement rate.

3. **ZERO comments is the #1 problem.** All 3 posts generated 0 comments despite 125 total impressions. The CTA questions are not driving discussion.

4. **CTAs must be specific and experience-based** to drive comments, not generic questions.

### Content Type Preference (Based on Data)

| Do This | Avoid This |
|---------|------------|
| Step-by-step frameworks (3 steps, numbered lists) | "Truth too late" / "You didn't know..." awakening posts |
| Specific tactical advice (what to check, how to verify) | Generic warnings without actionable content |
| Pain point + solution promise | Provocative statements without follow-through |
| Hook with clear structure: "3 things to check before..." | Hooks with suspense only: "What nobody told you..." |

## 2026 LinkedIn Algorithm Context

**Key algorithm changes (2026):**
- Shift from "like-driven" to "deep engagement-driven" — NLP analyzes comment quality
- External links in post body = -60% reach penalty
- Engagement pods (互赞群) now detected with 97% accuracy, risk of shadow ban
- Best-performing format: Document Carousel (6.6% engagement), Text-only post (4%), Image/Graphic (4.85%)
- Personal Profile outperforms Company Page by 561% in organic reach
- Best posting time (Australia audience): Tuesday-Thursday, 9-11 AM AEDT
- First 60 minutes after posting: must be online to respond to comments (algorithm boost window)

**Optimal hook strategies (data-proven for WAG):**
- Framework/Steps: "Before paying any deposit, verify three things..." (ER=33.33%, CTR=20.83%)
- Specific scenario + consequence: "When you source from China as a new Australian brand, one fact matters most..."
- Tactical how-to: "Step 1 — Check the business license on gsxt.gov.cn..."

## Fact Check Procedure

After generating the LinkedIn post, verify claims against WAG's existing blog content and, if needed, use web search for real-time data.

**Simplified Protocol:**

1. **Check WAG blog content first** — RAG-retrieved content is pre-verified
2. **For new claims**, use `mcp__MiniMax__web_search` to verify
3. **Flag any claim** that cannot be verified with: "[Claim] — unverified, remove or rephrase"
4. **Present verification status** to user before final approval

**Do not use generic industry statistics** unless they can be cited from a named source. LinkedIn audiences in B2B respond to specificity, not vague claims.

## LinkedIn Post → Blog Article Workflow

When a LinkedIn post should be expanded into a blog article, follow this workflow:

### 1. Directory Structure

**Canonical Storage Path:** All generated LinkedIn posts are stored in:

```
social/linkedin-post/{YYYY-MM-DD-topic}/
├── post.md          # Original LinkedIn post content
├── outline.md       # Image outline/briefing
├── imgs/           # Original AI-generated images
│   ├── 01-factory-reality-check.png
│   └── 02-3step-verification.png
└── prompts/        # AI image generation prompt files
    └── 01-factory-reality-check.md
```

**Published Images (for MDX/blog use):** After image generation, copy images to:
```
public/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/
```

**Archive Path (after publishing):** Move completed posts to:
```
social/linkedin-post/archive/{YYYY-MM}/{YYYY-MM-DD-topic}/
```

**Date format:** Use `YYYY-MM-DD` prefix for unique identification and chronological sorting.

### 2. Image Naming Convention

Use zero-padded two-digit prefix for ordering:
- `01-fake-factory-reveal.png` — First image (appears earlier in article)
- `02-3step-verification.png` — Second image (appears later)

### 3. Blog MDX Frontmatter Template

```yaml
---
title: "{Post Title}"
date: "{YYYY-MM-DD}"
description: "{Meta description - max 160 chars, compelling summary}"
author: "Winning Adventure Global"
tags: ["tag1", "tag2", "tag3", "tag4", "tag5"]
category: "{Category Name}"
readTime: "{N} min read"
coverImage: "/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/01-description.png"
ctaTitle: "{CTA Title}"
ctaText: "{CTA Description Text}"
ctaButtonText: "{Button Text}"
---
```

### 4. Image Path Rules for MDX

**CRITICAL:** MDX images must use `/public/social/` paths, NOT relative paths.

| Location | Use | Example |
|----------|-----|---------|
| `public/social/...` | MDX blog posts | `/social/linkedin-post/.../imgs/01-foo.png` |
| `social/...` | Source assets only | Original AI generation prompts, outlines |

**Action:** Copy images to `public/social/` before creating MDX:
```bash
mkdir -p public/social/linkedin-post/{YYYY-MM-DD-topic}/imgs
cp social/linkedin-post/{YYYY-MM-DD-topic}/imgs/*.png public/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/
```

### 5. Blog Article Structure

Expand LinkedIn post (Hook→Body→CTA) into blog format:

| LinkedIn Section | Blog Expansion |
|------------------|----------------|
| Hook (1-2 sentences) | Introduction (2-3 paragraphs setup) |
| Body paragraphs | Expanded sections with sub-headings |
| CTA (hard question) | Soft CTA (educational next steps) |

### 6. QA Checklist Before Publishing

- [ ] MDX file in `content/blog/{slug}.mdx`
- [ ] Frontmatter complete: title, date, description, author, tags, category, readTime, coverImage, ctaTitle, ctaText, ctaButtonText
- [ ] Images copied to `public/social/` with correct paths
- [ ] MDX image paths use `/social/` (not `../social/` or `../../social/`)
- [ ] ResourcesContent links use `/resources/${slug}` (not just `${slug}`)
- [ ] `npm run build` passes
- [ ] Article accessible at `/resources/{slug}` after deployment

## Traffic Optimization Checklist

Before publishing, verify each item:

### Pre-Posting Checklist

- [ ] **Hook within 210 characters** — Test with LinkedIn character counter. If hook is 211+, the algorithm never shows the full post.
- [ ] **First 90 characters make sense standalone** — LinkedIn shows first ~3 lines before "see more". Does the hook work without reading the body?
- [ ] **CTA is specific and experience-based** — Not "What would you do differently?" (0 comments). Use the CTA frameworks above.
- [ ] **Hashtags: 6-10, mix broad + niche** — See hashtag matrix below
- [ ] **No external links in post body** — -60% reach penalty. Put links in first comment.
- [ ] **No emoji** — WAG brand rule
- [ ] **Personal Profile recommended** — Personal profiles outperform company pages by 561% in organic reach

### Hashtag Matrix for WAG Topics

| Topic | Primary Hashtags | Secondary Hashtags |
|-------|-----------------|-------------------|
| Factory verification | #ChinaSourcing #FactoryVerification #SupplyChain | #ImportFromChina #AustraliaChinaTrade |
| Quality control | #QualityControl #Manufacturing #QualityAssurance | #ChinaManufacturing #ProductSafety |
| Brand intro | #AustralianBusiness #Adelaide #NewBusiness | #SmallBusinessAustralia #Entrepreneur |
| Industry-specific | #[YourIndustry] #AudioVisual #Lighting #Events | #Automotive #AV #EventRentals |

**Never use:** #WAG #WinningAdventureGlobal (too niche, zero search volume)

### First Comment Template (Traffic Booster)

**After posting, immediately add this as first comment:**

```
[For verification topics:]
"In our experience working with Australian brands across AV, lighting, and automotive — Step 2 is where most companies cut corners. Has a supplier ever failed one of these checks for you?"

[For brand intro topics:]
"We help Australian SMEs build direct relationships with Chinese factories — without the risk of going in blind. Questions about sourcing from China? Ask below."
```

**Why this works:** LinkedIn's algorithm boosts posts with early comments. Answering your own CTA question first seeds the conversation and signals engagement intent.

### Posting Schedule (Australia AEDT)

| Day | Time | Quality |
|-----|------|---------|
| Tuesday | 9-11 AM AEDT | Best |
| Wednesday | 9-11 AM AEDT | Good |
| Thursday | 9-11 AM AEDT | Good |
| Monday | Any | Avoid |
| Friday | Any | Avoid |
| Weekend | Any | Avoid |

**After posting:** Stay online for 60 minutes. Respond to every comment within this window. LinkedIn's algorithm gives a 4x boost to posts with engagement in the first hour.

### Personal Profile vs Company Page

| Factor | Personal Profile | Company Page |
|--------|-----------------|--------------|
| Algorithm reach | 561% higher | Baseline |
| Trust signals | Founder credibility | Brand credibility |
| Viral potential | Higher | Lower |
| Content type | Personal stories, opinions | Educational, professional |

**Recommendation:** Post from Personal Profile (Zhe He) for reach. Cross-post to Company Page for brand building. Never post to Company Page alone.

## WAG Brand Voice Guidelines

**Reference:** CLAUDE.md brand personality — Reliable, Professional, Exclusive

| Do | Don't |
|----|-------|
| Practical, direct language | Salesy or hype-driven copy |
| Specific WAG insights from RAG | Generic B2B clichés |
| Trust signals and credentials | Aggressive CTAs or urgency tactics |
| Experienced, knowledgeable tone | Emoji or informal abbreviations |
| **Step-by-step frameworks** (data-proven ER=33%) | **Awakening/ revelation posts** (data-proven ER=7%) |

**Tone:** Professional but approachable. Position WAG as the knowledgeable guide, not the seller.

**Voice:** Speak from experience. Use specific numbers, dates, or case references when available from RAG content. WAG's best-performing post used a 3-step verification framework — emulate this structure.

**Content Priority (based on WAG data):**
1. How-to / Step-by-step frameworks (ER up to 33%)
2. Case studies with specific examples (from RAG)
3. Tactical advice with named tools (e.g., gsxt.gov.cn)
4. Myth-busting (only if paired with actionable framework)
5. Brand intro (lowest ER but needed for awareness)

## Critical Rules

- **Hook MUST be within 210 characters** — LinkedIn truncates at the "see more" line (~3 lines / 210 chars). If the hook exceeds this, readers never see it.
- **Hashtags: 6-10 maximum** — LinkedIn's algorithm penalizes spam signals from excessive hashtags. Mix broad (#Manufacturing) with specific (#AustraliaChinaTrade) tags.
- **CTA: Experience-based questions only** — Generic CTAs ("What would you do differently?") generated ZERO comments in WAG data. Use war story requests, specific yes/no questions, or "complete the sentence" prompts.
- **Seed the comment section** — After posting, add a FIRST comment answering your own CTA question. This starts the conversation and signals activity to LinkedIn's algorithm.
- **No emoji anywhere in the post** — WAG brand rule. Emoji dilute professional positioning.
- **Always invoke RAG before generating** — Retrieve at least 1 WAG blog post to source specific insights. Posts without WAG-specific content feel generic.
- **Avoid "WA" abbreviation** — Use "Winning Adventure Global" or "WAG" as appropriate.
- **Fact check required before publishing** — Verify all claims against WAG blog content or web search. Present fact check table to user for approval.
- **Blog images go in public/social/** — MDX files cannot reference `../social/` paths. Always copy to `public/social/` for Next.js static serving.
- **2026 Algorithm Rule: No external links in post body** — Put all links in the first comment. Links in post body receive -60% reach penalty.
- **Posting cadence** — WAG data shows 3 posts in 20 days with gaps. Maintain consistent posting schedule (1-2x per week) to build algorithmic momentum.

## Post-Generation Next Steps

After generating the LinkedIn post, present these options to the user:

---

### Suggested Next Steps (Present to User)

After the post is generated, ask the user what they want to do next:

**1. Generate Illustrations**
> "需要为这篇帖子生成配图吗？"
> - Use `baoyu-article-illustrator` skill
> - Creates visual assets (flowcharts, scene illustrations, comparison graphics)
> - Best for: Template A (flowchart) and Template C (scene + comparison)

**2. Expand to Blog Article**
> "需要把这篇帖子扩展成博客文章吗？"
> - Follow the "LinkedIn Post → Blog Article Workflow" section above
> - Creates MDX file in `content/blog/`
> - Best for: High-performing posts worth expanding

**3. Publish Directly**
> "帖子已就绪，可以直接复制发布"
> - Provide the final post text
> - Include first comment template for seeding
> - Best for: When illustrations are not needed

**4. Review & Iterate**
> "需要调整内容、语气或角度吗？"
> - Modify hook, CTA, or body based on user feedback
> - Re-generate with changes

---

## Image Iteration Protocol

When the user rejects an image, follow this structured process:

### Step 1: Diagnose the Problem

Do not assume — ask the user specifically:

> "这个配图哪个方面不符合标准？"
> - [ ] 风格不对（太花哨/太简单/不符合品牌）
> - [ ] 布局不对（信息太挤/留白太多/层次不清）
> - [ ] 数据呈现不对（数字不清晰/图表类型不对）
> - [ ] 整体不满意，想换个方向

Record the user's exact description for prompt update.

### Step 2: Apply Targeted Fix

| Problem Type | Fix Strategy |
|--------------|--------------|
| Style issue | Adjust style keywords; use more precise visual descriptors |
| Layout issue | Redesign ZONES/LABELS structure; emphasize spatial relationships |
| Data presentation | Switch chart type or use different illustration approach |
| Wrong direction | Return to outline to re-examine the purpose; concept may be flawed |

### Step 3: Iteration Limit

- **Maximum iterations**: 3 attempts
- Before each regeneration, verify the prompt actually addresses the previous rejection
- After 3 rejections, ask the user to describe the requirement in their own words

### Step 4: Offer Options (Optional)

If 2 valid solutions exist for the same problem, offer 2 variants on iteration 2 or 3 for user choice.

### Prompt File Update Requirement

After each user rejection:
1. Add comments in the prompt file's `style` or `ZONES` section explaining the rejection reason
2. Record keyword changes made in this revision
3. Avoid reusing description words that were previously rejected

---

### Do NOT Auto-Invoke Skills

**Important:** After generating the post, ALWAYS present these options to the user and let them decide. Do NOT automatically invoke `baoyu-article-illustrator` or any other skill without user confirmation.

**Reason:** The user may not need illustrations, may want to review the text first, or may have a different priority. Always give the user control over the next action.

---

## WCSP Output Contract

All LinkedIn post generation MUST return this structured response:

```yaml
output:
  status: success | warning | error

  summary: "Generated LinkedIn post: 3-step framework, 198 char hook, war story CTA"

  next_actions:
    - action: user-confirm
      description: "Present post to user for approval"
      blocking: true
    - action: generate-image
      description: "Create carousel or illustration images"
      blocking: false
    - action: expand-blog
      description: "Expand post to blog MDX article"
      blocking: false

  artifacts:
    post_text: "/social/linkedin-post/{YYYY-MM-DD-topic}/post.md"
    outline_text: "/social/linkedin-post/{YYYY-MM-DD-topic}/outline.md"
    hook_chars: 198
    body_chars: 892
    cta_type: war-story
    format_type: steps
    quality_flags:
      - type: hook-limit
        detail: "Within 210 char limit"
        severity: none
      - type: cta-specific
        detail: "Experience-based CTA, not generic"
        severity: none
      - type: rag-retrieved
        detail: "Sourced from 2 WAG blog posts"
        severity: none

  error:
    root_cause: "Hook exceeds 210 char limit"
    safe_retry: "Trim body sentences, preserve 3-step structure"
    stop_condition: "3 retries exceeded"
```

### Error Recovery

| Error | Recovery | Stop Condition |
|-------|----------|----------------|
| Hook >210 chars | Trim sentences, shorten step descriptions | 3 retries → present oversized |
| No RAG content found | Use generic WAG data, flag for user | Auto-continue |
| CTA too generic | Replace with war story framework | Must pass quality gate |
| Fact unverifiable | Flag + remove or cite source | Block if WAG data flagged |
| Blog expansion fail | Return post only, skip MDX | Partial output acceptable |

### Quality Gates

Before returning success:
- [ ] Hook ≤ 210 chars
- [ ] First 90 chars standalone-readable
- [ ] CTA is specific and experience-based (not "What would you do?")
- [ ] Hashtag count 6-10
- [ ] No emoji
- [ ] No external links in body
- [ ] External links in first comment (if any)
- [ ] RAG retrieved at least 1 WAG blog post
- [ ] Facts verified or flagged
- [ ] Format is steps/story/carousel (not brand intro if avoidable)
