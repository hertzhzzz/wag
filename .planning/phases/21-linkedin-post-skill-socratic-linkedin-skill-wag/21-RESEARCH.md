# Phase 21: LinkedIn Post Skill (Socratic) - Research

**Researched:** 2026-03-20
**Domain:** Claude Code Skill Development + LinkedIn B2B Content Strategy
**Confidence:** MEDIUM-HIGH

## Summary

This phase creates a Claude Code skill that uses Socratic questioning to help users generate LinkedIn posts for WAG (Winning Adventure Global). The skill must combine dynamic content retrieval (RAG pattern) from WAG's blog posts and homepage with a structured LinkedIn post format optimized for B2B engagement on LinkedIn's algorithm.

The core insight: LinkedIn's algorithm prioritizes **comments over likes**, so the skill must design posts that provoke thought and discussion, not just approval. The "see more" cutoff at ~3 lines means the hook must be embedded in the first 210 characters.

**Primary recommendation:** Build a single SKILL.md file that uses Socratic questions to guide users toward selecting a topic, then generates a post using WAG's existing content as source material. The skill invokes `Glob` and `Grep` tools to dynamically retrieve relevant WAG content at runtime.

---

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Use Socratic questioning approach (not template-based generation)
- Target: LinkedIn B2B posts for WAG client acquisition
- Brand voice: 可靠、专业、专属 (Reliable, Professional, Exclusive)

### Claude's Discretion
- Skill architecture: single SKILL.md vs multi-file
- RAG implementation details
- Specific Socratic question flow
- Post template structure

### Deferred Ideas (OUT OF SCOPE)
- Multi-platform posting (focus on LinkedIn only)
- Image generation or media suggestions
- Scheduling or posting automation

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| REQ-01 | Skill invokes via `/skill` command | Skill format established from wag-seo-blog |
| REQ-02 | Socratic questioning flow for topic selection | Socratic technique research |
| REQ-03 | RAG: Dynamic content retrieval from blog/app | Glob+Grep pattern confirmed |
| REQ-04 | LinkedIn post structure: Hook/Body/CTA/Hashtags | LinkedIn algorithm best practices |
| REQ-05 | WAG brand voice alignment | Brand guidelines from CLAUDE.md |

---

## Standard Stack

### Core Skill Structure
| Component | Format | Source |
|-----------|--------|--------|
| SKILL.md | YAML frontmatter + Markdown body | Claude Code Skills format |
| RAG Implementation | Native tool calls (Glob, Grep, Read) | Skills access project files |
| Post Template | Inline in SKILL.md | LinkedIn B2B best practices |

**Skill invocation:** `/skill wag-linkedin-post` (name from YAML frontmatter)

### Skill Format (Verified from wag-seo-blog)
```yaml
---
name: skill-name
description: "One-line description of when to use this skill"
---

# Skill Title

## Usage
[How to invoke and what inputs to provide]

## What It Does
[Step-by-step behavior]

## Brand Guidelines
[Company-specific rules]

## Critical Rules
[Must-follow constraints]
```

---

## Architecture Patterns

### Recommended Project Structure
```
.claude/skills/wag-linkedin-post/
└── SKILL.md    # Single file containing all instructions
```

### Pattern 1: Socratic Question Flow

**What:** Sequential questions that guide users from pain point to topic selection

**When to use:** When user wants to create a LinkedIn post but needs help narrowing focus

**Flow structure:**
```
1. Topic Discovery
   - "What challenge are your clients facing right now?"
   - "What misconception about China sourcing have you heard recently?"

2. Angle Selection
   - "Do you want to educate, challenge, or inspire?"

3. CTA Direction
   - "What action should readers take after reading?"

4. Content Retrieval (RAG)
   - Glob all MDX files
   - Grep for relevant keywords
   - Read top 3 matched files

5. Post Generation
   - Apply LinkedIn format
   - Insert sourced content
   - Output draft for user review
```

### Pattern 2: RAG for Dynamic Content

**What:** Skill retrieves relevant WAG content at runtime using Claude Code tools

**When to use:** When generating posts that should reference specific WAG expertise

**Implementation:**
```typescript
// Step 1: Identify keywords from user's topic
// Step 2: Glob all blog files
const blogFiles = await glob("content/blog/*.mdx", { cwd: "/Users/mark/Projects/wag" });

// Step 3: Grep for keyword matches
const matches = await grep(keyword, {
  path: "/Users/mark/Projects/wag/content/blog",
  glob: "*.mdx"
});

// Step 4: Read top 3 matched files
const content = await Promise.all(
  matches.slice(0, 3).map(f => read(f.path))
);
```

### Pattern 3: LinkedIn Post Structure

**What:** Optimized format for LinkedIn's algorithm and reading patterns

**When to use:** Every post generation

**Structure:**
```
[HOOK - 210 chars max, before "see more"]
Bold statement or question that creates curiosity gap

[BREAK - implied by line gap]

[BODY - 3-5 short paragraphs]
- Paragraph 1: Context (1-2 sentences)
- Paragraph 2-4: Core insight with specific examples/data
- Paragraph 5: Transition to CTA

[BREAK]

[CTA - Clear next action]
"What would you do differently? Share in comments."
OR
"Book a free consultation: [link]"

[HASHTAGS - 6-10, on separate line]
#ChinaSourcing #AustralianBusiness #Manufacturing #etc
```

**LinkedIn algorithm insight:** Comments signal value to the algorithm more than likes. Posts that end with questions or invite discussion get 3-5x more comment impressions.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Content references | Manually remember all WAG services | RAG via Glob+Grep | Content changes, skill should stay current |
| Brand voice | Assume generic B2B tone | Reference CLAUDE.md explicitly | WAG voice is specific: practical, not salesy |
| Post format | Invent structure from scratch | LinkedIn best practices | Algorithm-optimized structure proven |

---

## Common Pitfalls

### Pitfall 1: Hook buried below "see more" cutoff
**What goes wrong:** LinkedIn truncates posts at ~210 characters (3 lines). If the hook is not in the first 210 chars, readers never see the compelling part.
**Why it happens:** Starting with context or background instead of a bold statement
**How to avoid:** Put the most provocative claim or question in the first 210 characters
**Warning signs:** Generated hook starts with "In today's post..." or similar filler

### Pitfall 2: Generic B2B content without WAG differentiators
**What goes wrong:** Post sounds like every other China sourcing article, no unique value proposition
**Why it happens:** Not using RAG to pull specific WAG examples, statistics, or case studies
**How to avoid:** Always invoke RAG to retrieve at least one WAG blog post or service description as source material

### Pitfall 3: Socratic questions feel interrogative, not conversational
**What goes wrong:** User feels like they are being questioned rather than guided
**Why it happens:** Questions are too numerous, too direct, or lack conversational framing
**How to avoid:** Limit to 3-4 key questions, frame each with context about why it matters
**Warning signs:** Question count exceeds 5, questions lack explanatory context

### Pitfall 4: Hashtags稀释Engagement
**What goes wrong:** Using too many hashtags (20+) or irrelevant hashtags
**Why it happens:** Old LinkedIn advice suggested more hashtags; current algorithm penalizes spam signals
**How to avoid:** 6-10 highly relevant hashtags maximum, mix broad (#Manufacturing) with specific (#AustraliaChinaTrade)

---

## Code Examples

### LinkedIn Post Template (from best practices)
```markdown
Most Australian businesses sourcing from China make the same mistake:

They trust a supplier's website before verifying the factory behind it.

[Platform] listings often hide trading companies behind professional storefronts.
A factory audit takes 2 days.
A bad supplier relationship costs 6 months and five figures.

Questions to ask before your next order:
- Does their business license show "manufacturing" or just "trading"?
- Can they show live production footage from THIS week?
- Who attends if you visit? The decision-maker or a sales rep?

The verification framework most importers skip: cross-checking addresses across three documents.

What almost cost you this deal?

---

#ChinaSourcing #AustralianBusiness #ImportFromChina #FactoryAudit #SupplyChain
```

### RAG Invocation Pattern
```typescript
// In SKILL.md, describe this as a procedure:
// 1. Glob for blog files
// 2. Grep for keyword
// 3. Read top results
// 4. Extract relevant statistics/quotes
// 5. Incorporate into post draft
```

### Socratic Question Sequence
```
Step 1: "What specific China sourcing challenge are your ideal clients dealing with right now?"
        [If vague: "Are we talking about finding suppliers, verifying quality, or managing logistics?"]

Step 2: "What's the most common misconception you've heard about direct factory sourcing?"
        [Context: This surfaces the fear/pain point to address]

Step 3: "Do you want this post to educate (build awareness), challenge (spark debate), or inspire (show possibility)?"
        [Guides tone and structure]

Step 4: "What should readers do after reading - comment, click, or reach out?"
        [Defines CTA type]
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Generic "best practices" posts | WAG-specific insights via RAG | Now | Differentiates from competitors |
| Like-focused optimization | Comment-focused design | LinkedIn algorithm update | Questions at end of posts |
| 10-15 hashtags | 6-10 strategic hashtags | 2024-2025 algorithm shift | Reduces spam signal, improves reach |
| Template-based generation | Socratic guided creation | This skill | User agency + tailored output |

**Deprecated/outdated:**
- Posting without a hook (LinkedIn now requires immediate value signal)
- Long-form first paragraphs (see more cutoff means context must be compressed)

---

## Open Questions

1. **Skill name:** Should it be `wag-linkedin-post` or `wag-socratic-linkedin`?
   - What we know: wag-seo-blog uses `wag-` prefix
   - What's unclear: Whether the Socratic approach should be emphasized in name
   - Recommendation: `wag-linkedin-post` — describes function, Socratic is implementation detail

2. **Single vs multi-file skill:**
   - What we know: wag-seo-blog is single SKILL.md with reference file paths
   - What's unclear: Whether this skill needs supporting templates
   - Recommendation: Single SKILL.md — simplicity aligns with skill philosophy

3. **How many blog files should RAG retrieve?**
   - What we know: Top 3 matches seems reasonable
   - What's unclear: Performance impact of reading large MDX files
   - Recommendation: Limit to 3 files, use Grep head_limit parameter

---

## Validation Architecture

> Skip this section entirely if workflow.nyquist_validation is explicitly set to false in .planning/config.json. If the key is absent, treat as enabled.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None - Manual Skill Verification |
| Config file | N/A |
| Quick run command | `/skill wag-linkedin-post` (invoke only) |
| Full suite command | N/A |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Verification |
|--------|----------|-----------|-------------|
| REQ-01 | Skill visible to Claude Code | Smoke | `/skill wag-linkedin-post` should load skill |
| REQ-02 | Socratic questions appear | Manual | Output contains 3-4 guided questions |
| REQ-03 | RAG retrieves content | Smoke | Blog files accessed via Glob/Grep |
| REQ-04 | Post structure correct | Manual | Hook <210 chars, CTA present, 6-10 hashtags |
| REQ-05 | WAG voice applied | Manual | Practical, direct, not salesy |

### Wave 0 Gaps
- [ ] Skill file not yet created at `.claude/skills/wag-linkedin-post/SKILL.md`
- [ ] No test framework required for skill-only phase

---

## Sources

### Primary (HIGH confidence)
- `wag-seo-blog/SKILL.md` — Skill format verified
- `brainstorming/SKILL.md` — Socratic flow pattern confirmed
- `CLAUDE.md` (project) — WAG brand guidelines
- Blog posts (china-vs-alibaba, verify-chinese-supplier, australia-import-tips) — Content examples

### Secondary (MEDIUM confidence)
- LinkedIn algorithm observations — Web search results on engagement patterns
- Claude Code skill documentation — Web search for SKILL.md format

### Tertiary (LOW confidence)
- LinkedIn B2B post statistics — General web search, not verified against official LinkedIn documentation

---

## Metadata

**Confidence breakdown:**
- Skill format: HIGH — Verified against existing wag-seo-blog skill
- Socratic flow: MEDIUM — Pattern from brainstorming skill, not formally documented for LinkedIn
- LinkedIn algorithm: MEDIUM — Web search confirms practices but no official LinkedIn documentation
- RAG implementation: HIGH — Native Claude Code tools, well-understood pattern

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (skill format stable, LinkedIn algorithm less volatile)
