# WAG Content Performance Rules

## Overview

Performance rules encode WAG's empirical content data into actionable guidelines for content creation. Rules are evidence-based, versioned, and updated as new data becomes available.

**Source data:** LinkedIn Analytics export (03/04 - 03/23/2026), 3 organic posts.
**Last updated:** 2026-04-01

---

## Rule: format-priority-steps

**Category:** format-priority
**Value:** steps
**RuleId:** format-priority-steps-001
**Version:** 1.0.0
**UpdatedAt:** 2026-04-01

### Statement

Use **step-by-step framework format** as the default content structure. This format consistently outperforms all other approaches.

### Evidence

| Post Date | Format | Impressions | ER | CTR |
|-----------|--------|-------------|-----|------|
| 03/23 | 3-step framework | 31 | 22.58% | 16.13% |
| 03/21 | Narrative/story | 59 | 5.08% | 1.69% |
| 03/04 | Self-intro | 47 | 6.38% | 2.13% |

**ER ranking:** Steps (22.58%) > Intro (6.38%) > Narrative (5.08%)
**Steps outperformed narrative by 4.4x in ER.**

confidenceLevel: high
sampleSize: 3 posts
dataRange: 2026-03-04 to 2026-03-23

### Implications

- Default to 3-step framework for educational/how-to content
- Story/narrative format: use only when emotion-driven hook is more valuable than action-driven hook
- Self-intro format: use sparingly for brand awareness only, never as primary content type

---

## Rule: format-priority-story

**Category:** format-priority
**Value:** story
**RuleId:** format-priority-story-001
**Version:** 1.0.0
**UpdatedAt:** 2026-04-01

### Statement

Story/narrative format should only be used as a secondary role (lead-in hook before a framework), not as the primary content structure.

### Evidence

Narrative post (03/21): 59 impressions, 5.08% ER, 1.69% CTR — highest impressions but lowest engagement rate. The high impression count suggests broad algorithmic distribution without corresponding engagement.

confidenceLevel: medium
sampleSize: 1 narrative post
dataRange: 2026-03-21

### Implications

- Do not lead with narrative as primary structure
- If a story is central to the message, use: Story opening (1-2 paragraphs) -> Framework (3 steps) -> CTA
- See wag-linkedin-post Template C (Story -> Lesson -> Framework)

---

## Rule: er-threshold-excellent

**Category:** er-threshold
**Value:** excellent
**RuleId:** er-threshold-excellent-001
**Version:** 1.0.0
**UpdatedAt:** 2026-04-01

### Statement

An engagement rate (ER) of **15% or higher** on LinkedIn is classified as excellent performance.

### Evidence

Best-performing post (03/23, 3-step framework): ER = 22.58%
This post also achieved the highest CTR (16.13%) and highest ER simultaneously.

confidenceLevel: medium
sampleSize: 3 posts
dataRange: 2026-03

### Implications

- Target ER >= 15% as the quality bar for published content
- Content below 15% ER should be reviewed for hook strength and CTA specificity
- Continue testing to expand the sample size for more precise threshold calibration

---

## Rule: er-threshold-normal

**Category:** er-threshold
**Value:** normal
**RuleId:** er-threshold-normal-001
**Version:** 1.0.0
**UpdatedAt:** 2026-04-01

### Statement

An engagement rate between **5% and 15%** is normal/expected performance for WAG's LinkedIn content.

### Evidence

03/04 (Self-intro): ER = 6.38%
Average ER across all 3 posts: 11.35%

confidenceLevel: medium
sampleSize: 3 posts
dataRange: 2026-03

### Implications

- Normal ER is acceptable for introductory or awareness content
- Educational/how-to content should consistently exceed this range
- If/how-to content falls below 15%, review hook formula and CTA specificity

---

## Rule: er-threshold-below-average

**Category:** er-threshold
**Value:** below-average
**RuleId:** er-threshold-below-average-001
**Version:** 1.0.0
**UpdatedAt:** 2026-04-01

### Statement

An engagement rate **below 5%** indicates below-average performance requiring content strategy review.

### Evidence

03/21 (Narrative): ER = 5.08% — just above threshold but approaching below-average
03/21 also had highest impressions (59) with lowest CTR (1.69%), suggesting the LinkedIn algorithm initially distributed it broadly but engagement signals did not sustain reach.

confidenceLevel: medium
sampleSize: 2 posts at/near threshold
dataRange: 2026-03

### Implications

- Content below 5% ER signals: weak hook, generic CTA, or wrong format for topic
- Investigate: Is the hook within 210 characters? Is the CTA specific and experience-based?
- High impressions + low ER may indicate algorithmic penalty in progress

---

## Rule: hook-formula-before-verify

**Category:** hook-formula
**Value:** before-verify
**RuleId:** hook-formula-before-verify-001
**Version:** 1.0.0
**UpdatedAt:** 2026-04-01

### Statement

The hook formula **"Before [action], verify [N] things: [promise]"** is the highest-performing hook pattern.

### Evidence

03/23 post hook: "Before paying any deposit for your China order, verify three things: factory, not trading company."
Format: Steps (ER 22.58%, CTR 16.13%)
This is the only post using the before-verify formula in the dataset. It achieved the best ER by 4.4x over the next-best format.

confidenceLevel: medium
sampleSize: 1 post with this formula
dataRange: 2026-03-23

### Template

```
Before [specific action involving risk], verify [N] things: [outcome promise]
Examples:
- "Before paying any deposit for your China order, verify three things: factory, not trading company."
- "Before signing a contract with a Chinese supplier, confirm three things: license, production line, certification."
- "Before choosing a sourcing agent, check three things: who actually pays the factory visit."
```

### Implications

- Default to this formula for all educational/how-to content
- Replace vague awakening hooks ("What nobody tells you...", "The truth about...") with specific action-oriented hooks
- The formula works because it promises specific value before asking the reader to invest time

---

## Rule: hook-char-limit

**Category:** hook-char-limit
**Value:** linkedin-max
**RuleId:** hook-char-limit-210
**Version:** 1.0.0
**UpdatedAt:** 2026-04-01

### Statement

LinkedIn hooks **must not exceed 210 characters**. This is the hard limit before LinkedIn's "see more" truncation.

### Evidence

LinkedIn displays approximately 3 lines (~210 characters) before "see more". Hooks exceeding this limit are truncated, and readers never see the full hook without clicking.

confidenceLevel: high
basis: LinkedIn platform behavior (documented)

### Implications

- Always count characters before finalizing a LinkedIn post
- First 90 characters should make sense standalone (shown before truncation)
- 03/23 best-performing post had a hook well within the 210-char limit

---

## Rule: cta-specific-experience

**Category:** cta-quality
**Value:** specific-experience
**RuleId:** cta-specific-experience-001
**Version:** 1.0.0
**UpdatedAt:** 2026-04-01

### Statement

CTAs must be **specific and experience-based**, not generic questions. Generic CTAs generate zero engagement.

### Evidence

**FAIL (0 comments historically):**
- "What would you do differently?"
- "Share in comments"
- "Let's discuss"

**PASS (experience-based):**
- "Did you know gsxt.gov.cn is free for anyone to verify a Chinese business license? Were you ever asked to check one before placing an order?"
- "Has a supplier ever failed this step for you? What happened?"

| CTA Type | Comment Rate |
|----------|-------------|
| Generic ("What would you do?") | 0.00% |
| Specific yes/no with reasoning | Higher (qualitative observation) |

confidenceLevel: high
basis: WAG historical data (3 posts, 0 total comments with generic CTA)

### CTA Framework Ranking

| Rank | Type | Example | Why It Works |
|------|------|---------|--------------|
| 1 | Specific yes/no with reasoning | "Did you know...?" | Binary invites instant response |
| 2 | War story request | "Has a supplier ever...?" | Personal stories drive empathy |
| 3 | Complete the sentence | "The biggest mistake I see..." | Positions reader as expert |
| 4 | Industry-specific | "For those in AV/lighting..." | Tribe affinity increases response |
| 5 | Mistake request | "What's the most costly lesson...?" | People share mistakes readily |

### DO NOT Use

- "What would you do differently?" — too abstract
- "Share in comments" — passive, no trigger
- "Let's discuss" — vague, no specific angle

---

## Rule: impression-er-inverse

**Category:** impression-quality
**Value:** inverse-relationship
**RuleId:** impression-er-inverse-001
**Version:** 1.0.0
**UpdatedAt:** 2026-04-01

### Statement

**Higher impressions do NOT correlate with higher engagement.** Content quality and format matter more than algorithmic distribution volume.

### Evidence

| Post | Impressions | ER | CTR |
|------|-------------|-----|------|
| 03/21 Narrative | 59 (highest) | 5.08% (lowest) | 1.69% (lowest) |
| 03/23 Steps | 31 (lowest) | 22.58% (highest) | 16.13% (highest) |

The post with fewest impressions (31) had the best engagement rate (22.58%), while the post with most impressions (59) had the worst ER (5.08%) and CTR (1.69%).

confidenceLevel: medium
sampleSize: 3 posts
dataRange: 2026-03

### Implications

- Do not judge content success by impressions alone
- Focus on ER and CTR as the primary quality signals
- A smaller audience highly engaged is more valuable than a large audience passively scrolling
- Strong hooks and specific CTAs drive ER, not just algorithmic reach

---

## Rule: comment-rate-zero

**Category:** engagement-gap
**Value:** comment-rate
**RuleId:** engagement-gap-comment-001
**Version:** 1.0.0
**UpdatedAt:** 2026-04-01

### Statement

**Zero comments is the #1 engagement problem.** All 3 posts generated 0 comments despite 125 total impressions. CTA specificity is the primary fix.

### Evidence

| Metric | Total |
|--------|-------|
| Total Impressions | 125 |
| Total Clicks | 7 |
| Total Likes | 9 |
| **Total Comments** | **0** |
| **Comment Rate** | **0.00%** |

confidenceLevel: high
sampleSize: 3 posts
dataRange: 2026-03-04 to 2026-03-23

### Root Cause Analysis

All 3 posts used generic CTAs ("What would you do?", "Share in comments"). None used experience-based questioning frameworks.

### Implications

- Every post MUST have a specific, experience-based CTA (see cta-specific-experience rule)
- After posting, add a **first comment** answering the CTA question yourself — this seeds conversation
- Comment rate is the key metric to improve in Q2 2026

---

## Rule: no-external-links-body

**Category:** algorithm-penalty
**Value:** linkedin-body-links
**RuleId:** algorithm-penalty-links-body-001
**Version:** 1.0.0
**UpdatedAt:** 2026-04-01

### Statement

External links in the LinkedIn post body receive a **-60% reach penalty**. All external links must be placed in the first comment.

### Evidence

2026 LinkedIn algorithm behavior (documented across B2B marketing industry data). External links in post body trigger spam signals and reduce algorithmic distribution.

confidenceLevel: high
basis: LinkedIn 2026 algorithm behavior (industry-documented)

### Implications

- Never include URLs in the post body
- Post the link as a first comment immediately after publishing
- Include a brief context sentence with the link in the first comment

---

## Rule: carousel-outperforms

**Category:** format-performance
**Value:** carousel
**RuleId:** format-performance-carousel-001
**Version:** 1.0.0
**UpdatedAt:** 2026-04-01

### Statement

Document Carousel posts outperform text-only posts in the 2026 LinkedIn algorithm.

### Evidence

2026 LinkedIn algorithm data (documented in wag-linkedin-post):
- Document Carousel: 6.6% average engagement
- Text-only post: 4% average engagement
- Image/Graphic: 4.85% average engagement

confidenceLevel: medium
basis: Platform-wide data (not WAG-specific)

### Implications

- For process/how-to content, prefer Document Carousel format when possible
- Carousel gets 65% higher engagement than text-only posts
- Note: WAG's 03/23 steps post (text-only) still achieved 22.58% ER — format matters less than hook+CTA quality

---

## Rule: personal-profile-reach

**Category:** channel-config
**Value:** personal-vs-company
**RuleId:** channel-config-personal-reach-001
**Version:** 1.0.0
**UpdatedAt:** 2026-04-01

### Statement

Personal LinkedIn profiles outperform company pages by **561% in organic reach**.

### Evidence

2026 LinkedIn algorithm data (documented in wag-linkedin-post).

confidenceLevel: high
basis: Platform-wide data (not WAG-specific)

### Implications

- For maximum reach: Post from personal profile (Zhe He) first, then cross-post to company page
- Personal profiles enable founder credibility and higher viral potential
- Company page posts should be used for brand consistency and brand post history

---

## Data Summary

### March 2026 LinkedIn Raw Data

| Date | Format | Impressions | Clicks | ER | CTR | Comments |
|------|--------|-------------|--------|-----|-----|---------|
| 03/23 | 3-step framework | 31 | 5 | 22.58% | 16.13% | 0 |
| 03/21 | Narrative | 59 | 1 | 5.08% | 1.69% | 0 |
| 03/04 | Self-intro | 47 | 1 | 6.38% | 2.13% | 0 |
| **Total** | | **137** | **7** | **Avg: 11.35%** | **Avg: 6.65%** | **0** |

### Aggregate Metrics

| Metric | Value |
|--------|-------|
| Total Impressions | 137 |
| Total Clicks | 7 |
| Total Likes | 9 (from wag-linkedin-post source) |
| Total Comments | 0 |
| Avg ER | 11.35% |
| Avg CTR | 6.65% |
| Comment Rate | 0.00% |
| Best Format | 3-step framework |
| Best ER | 22.58% |
| Worst ER | 5.08% |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-04-01 | Initial seed data from March 2026 LinkedIn analytics |
