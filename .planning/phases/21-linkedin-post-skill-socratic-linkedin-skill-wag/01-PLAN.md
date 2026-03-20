---
phase: 21
plan: "01"
type: execute
wave: 1
depends_on: []
files_modified:
  - .claude/skills/wag-linkedin-post/SKILL.md
autonomous: false
requirements:
  - REQ-01
  - REQ-02
  - REQ-03
  - REQ-04
  - REQ-05
---

<objective>
Create the wag-linkedin-post SKILL.md that uses Socratic questioning to guide users through LinkedIn post generation, with RAG-powered content retrieval from WAG blog posts.

Purpose: Enable WAG to consistently create high-quality, brand-aligned LinkedIn content that drives engagement through comment-focused posts.
Output: `.claude/skills/wag-linkedin-post/SKILL.md`
</objective>

<context>
@/Users/mark/Projects/wag/.planning/phases/21-linkedin-post-skill-socratic-linkedin-skill-wag/21-RESEARCH.md
@/Users/mark/Projects/wag/.planning/phases/21-linkedin-post-skill-socratic-linkedin-skill-wag/21-VALIDATION.md
@/Users/mark/.claude/skills/brainstorming/SKILL.md
</context>

<must_haves>
  truths:
    - "Skill invokes via /skill wag-linkedin-post command"
    - "Socratic questions guide topic selection (3-4 questions)"
    - "RAG retrieves relevant WAG content at runtime"
    - "Generated posts follow LinkedIn format: Hook/Body/CTA/Hashtags"
    - "Posts align with WAG brand voice (reliable, professional, exclusive)"
  artifacts:
    - path: ".claude/skills/wag-linkedin-post/SKILL.md"
      provides: "Complete skill with Socratic flow, RAG, and post template"
      min_lines: 150
  key_links:
    - from: "SKILL.md"
      to: "content/blog/*.mdx"
      via: "Glob + Grep (head_limit: 3) + Read pattern"
      pattern: "RAG retrieval for content sourcing"
    - from: "SKILL.md"
      to: "CLAUDE.md brand guidelines"
      via: "Brand voice reference in skill"
      pattern: "WAG voice constraints applied"
</must_haves>

<tasks>

<task type="auto">
  <name>Task 1: Create wag-linkedin-post SKILL.md</name>
  <files>.claude/skills/wag-linkedin-post/SKILL.md</files>
  <action>
Create `.claude/skills/wag-linkedin-post/SKILL.md` with the following structure:

**YAML Frontmatter:**
```yaml
---
name: wag-linkedin-post
description: "Generate WAG-branded LinkedIn posts using Socratic questioning and RAG-powered content retrieval"
---
```

**Section 1: Overview**
- What this skill does (Socratic-guided LinkedIn post generation)
- When to use it (user wants to create a LinkedIn post for WAG)

**Section 2: Socratic Question Flow (exactly 4 questions)**

Question 1 - Topic Discovery:
"What specific China sourcing challenge are your ideal LinkedIn post readers dealing with right now?"

Question 2 - Pain Point Clarification:
"What's the most common misconception about this challenge that you've encountered?"

Question 3 - Post Tone:
"Do you want this post to educate (build awareness), challenge (spark debate), or inspire (show possibility)?"

Question 4 - CTA Direction:
"What should readers do after reading - share their experience in comments, reach out for a consultation, or think differently about the topic?"

**Section 3: RAG Implementation**
Describe the procedure using Claude Code tools:
1. Use `Glob` to find all blog files: `content/blog/*.mdx`
2. Use `Grep` to find relevant content matching user's topic (use `head_limit: 3`)
3. Use `Read` to extract content from top 3 matched files
4. Incorporate sourced statistics, examples, or insights into the generated post

**Section 4: LinkedIn Post Template**

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

**Section 5: WAG Brand Voice Guidelines**
Reference from CLAUDE.md:
- Tone: Reliable, professional, exclusive (not salesy or hype-driven)
- Voice: Practical, direct, experienced
- Avoid: Emoji, generic B2B clichés, aggressive CTAs
- Include: Specific WAG insights from RAG content, trust signals

**Section 6: Critical Rules**
- Hook MUST be within 210 characters (LinkedIn "see more" cutoff)
- Hashtags: 6-10 maximum (not 20+)
- CTA: Soft question to drive comments (not direct form links)
- Always invoke RAG to retrieve at least 1 WAG blog post before generating
- Do not use emoji anywhere in the post
  </action>
  <verify>
    <automated>grep -c "^name: wag-linkedin-post$" .claude/skills/wag-linkedin-post/SKILL.md && grep -c "Question [1-4]" .claude/skills/wag-linkedin-post/SKILL.md && grep -c "Glob\|Grep\|Read" .claude/skills/wag-linkedin-post/SKILL.md && grep -c "HOOK\|BODY\|CTA\|Hashtag" .claude/skills/wag-linkedin-post/SKILL.md</automated>
  </verify>
  <done>SKILL.md exists at .claude/skills/wag-linkedin-post/SKILL.md with: name: wag-linkedin-post frontmatter, 4 Socratic questions, RAG procedure, LinkedIn template (Hook/Body/CTA/Hashtags), and WAG brand voice guidelines</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>wag-linkedin-post SKILL.md</what-built>
  <how-to-verify>
    1. Verify skill is loadable: `/skill wag-linkedin-post`
    2. Invoke the skill and confirm it presents 4 Socratic questions
    3. Provide a sample topic (e.g., "factory verification") and verify:
       - RAG retrieves relevant blog content
       - Generated post has Hook within 210 chars
       - Post has Body, soft CTA, and 6-10 hashtags
       - Tone matches WAG brand (practical, not salesy)
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>

<verification>
1. SKILL.md file exists at `.claude/skills/wag-linkedin-post/SKILL.md`
2. Frontmatter contains `name: wag-linkedin-post` and description
3. Exactly 4 Socratic questions present in the skill
4. RAG implementation describes Glob+Grep+Read pattern with head_limit: 3
5. LinkedIn template includes Hook/Body/CTA/Hashtags sections
6. WAG brand voice guidelines referenced from CLAUDE.md
7. Critical rules include: Hook <210 chars, 6-10 hashtags, no emoji, soft CTA
</verification>

<success_criteria>
- Skill file created at `.claude/skills/wag-linkedin-post/SKILL.md`
- `/skill wag-linkedin-post` command loads the skill
- Skill presents 4 Socratic questions to guide topic selection
- RAG procedure uses Glob+Grep (head_limit: 3)+Read to retrieve blog content
- LinkedIn template structure: Hook (210 char max) / Body / CTA / Hashtags (6-10)
- WAG brand voice: practical, direct, reliable, professional, exclusive (not salesy)
- Critical constraints enforced: no emoji, soft CTA only
</success_criteria>

<output>
After completion, create `.planning/phases/21-linkedin-post-skill-socratic-linkedin-skill-wag/21-01-SUMMARY.md`
</output>
