---
name: wag-content-hub
description: "WAG content engine coordinator — orchestrates multi-channel content creation, distribution, and performance analysis"
version: 2.0.0
---

# WAG Content Hub (v2.0)

## Overview

The WAG Content Hub is the **coordinator layer** for all Winning Adventure Global content operations. Rather than generating content directly, it orchestrates sub-skills via the **WCSP (WAG Content Skill Protocol)** — a structured interface that ensures reliable execution, clear state tracking, and deterministic recovery.

**When to use:** When a user wants to create, analyze, or manage WAG content across multiple channels (LinkedIn, X, Facebook, SEO/blog).

**Language:** Socratic Q&A in Simplified Chinese. Generated content in English. Brand rules enforced throughout.

---

## Architecture: Hybrid Coordinator Pattern

```
┌─────────────────────────────────────────────────────────────────────┐
│                        WAG CONTENT HUB                              │
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐   │
│  │  ReAct       │───▶│  WCSP        │───▶│  Typed Tool         │   │
│  │  Planning    │    │  Protocol    │    │  Execution          │   │
│  └──────────────┘    └──────────────┘    └──────────────────────┘   │
│                                                                      │
│  State: {phase, channels[], results{}, errors{}}                   │
└─────────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │  LinkedIn   │    │     X      │    │  Facebook   │
    │  Sub-Skill │    │  Sub-Skill  │    │  Sub-Skill  │
    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
           │                  │                  │
           └──────────────────┴──────────────────┘
                          │
                          ▼
              ┌─────────────────────────┐
              │   WCSP Response         │
              │   {status, summary,     │
              │    next_actions[],      │
              │    artifacts{}}         │
              └─────────────────────────┘
```

---

## WCSP — WAG Content Skill Protocol

Every Hub ↔ Sub-Skill interaction follows this contract:

### Invocation Contract

```yaml
invoke: <skill-name>
input:
  command: new-post | analyze | status | review
  context:
    central_content: <object>    # Core message/atoms
    channel: <string>           # Target channel
    constraints: <object>        # Hook limit, format, etc.
  state:
    phase: 1-6                  # Current pipeline phase
    checkpoint: <string>        # Resume point if needed
```

### Response Contract (All Sub-Skills Must Return)

```yaml
output:
  status: success | warning | error | blocked

  # One-line summary for Hub log
  summary: "Generated LinkedIn post: 3-step verification framework, 198 chars hook"

  # Explicit next actions (Hub decides whether to follow)
  next_actions:
    - action: user-confirm
      description: "Present post to user for approval"
      blocking: true
    - action: adapt-x
      description: "Adapt hook for X/Twitter (280 char limit)"
      blocking: false

  # File paths, IDs, or structured data for downstream use
  artifacts:
    post_text: "/social/linkedin-post/2026-04-01-factory-verification/post.md"
    hook_char_count: 198
    quality_flags: []

  # Error recovery (if status=error)
  error:
    root_cause: "Hook exceeds 210 char limit"
    safe_retry: "Trim hook to 210 chars, regenerate CTA"
    stop_condition: "3 retries exceeded"
```

---

## Context Files (Auto-Injected)

These files are guaranteed to exist and be loaded:

| File | Purpose | Required |
|------|---------|----------|
| `analytics/performance-rules.md` | ER benchmarks, format priorities | Yes |
| `analytics/content-matrix.md` | Topic×Channel priority matrix | Yes |
| `analytics/brand-voice.md` | Voice, tone, CTA rules | Yes |
| `analytics/channel-specs.md` | Platform technical limits | Yes |
| `lib/rag-protocol.md` | RAG context injection | Yes |

---

## Entry Decision Tree

| Keyword | Flow | Invokes |
|---------|------|---------|
| "new" / "write" / "post" / "create" / "publish" | `new-post` | Sub-skills per channel |
| "analyze" / "data" / "performance" / "report" | `analyze` | analytics-collector |
| "status" / "this week" / "this month" | `status` | Dashboard (read-only) |
| "review" / "check" / "audit" | `review` | Cross-channel QA |
| "optimize" / "improve" | `optimize` | Rule engine |
| Single channel named | Direct route | That channel's sub-skill only |

**Shortcut rule:** If user names exactly ONE channel → route directly to that sub-skill. Do NOT invoke Hub flow.

---

## Execution State

Hub maintains state throughout pipeline:

```yaml
state:
  execution_id: "exec-20260401-001"
  phase: 3                         # Current phase (1-6)
  channels:
    - name: linkedin
      status: pending|generating|review|approved|published
      result: <WCSP response>
    - name: x
      status: pending
    - name: facebook
      status: pending
    - name: seo
      status: pending
  errors:
    linkedin: null
    x: null
  started_at: "2026-04-01T00:00:00Z"
```

**Phase definitions:**
1. Channel confirmation
2. Socratic Q&A
3. Quality gate
4. Sub-skill invocation
5. Content review
6. Distribution & archiving

---

## Flow: new-post (6-Phase Pipeline)

### Phase 1 — Channel Confirmation

**Purpose:** All channels activated by default.

All 4 channels are automatically selected. No user confirmation needed.

**Output:**
```yaml
phase: 1
next_channels: [linkedin, x, facebook, seo]
status: success
summary: "All 4 channels selected: LinkedIn, X, Facebook, SEO"
```

---

### Phase 2 — Socratic Q&A

**Purpose:** Clarify content intent via structured questioning.

Present 6 questions in Simplified Chinese. Wait for all answers before proceeding.

| Q# | Question | Purpose | Gate |
|----|----------|---------|------|
| Q1 | 你的目标读者目前面临什么采购挑战？ | Pain point | Required |
| Q2 | 这个话题有具体例子或数据支撑吗？ | Evidence | Required |
| Q3 | 这个问题适合什么结构？ | Format | Default: 3-step |
| Q4 | 读者读完应该采取什么行动？ | CTA | Required |
| Q5 | 这篇内容需要跨渠道分发吗？ | Coordination | Derived |
| Q6 | 有没有具体数据或第三方来源？ | Quality | Flag if missing |

**Output:**
```yaml
phase: 2
qa_answers:
  pain_point: <string>
  evidence: <string|null>
  structure: <string>
  cta: <string>
  has_data: <boolean>
status: success
summary: "Q&A complete, 2 quality flags raised"
next_actions:
  - action: quality-gate
    blocking: true
```

---

### Phase 3 — Quality Gate

**Purpose:** Evaluate readiness before invoking sub-skills.

| Quality Signal | Pass | Fail → Action |
|----------------|------|---------------|
| Pain point identified | Proceed | Return to Q1 |
| Evidence available | Proceed | Flag: use generic WAG data |
| Structure selected | Proceed | Default to 3-step framework |
| CTA defined | Proceed | Prompt for specific CTA |
| Data/sources | Proceed | Flag: verify via RAG |

**If quality gate fails:**
```yaml
status: warning
summary: "Quality gate: evidence missing"
next_actions:
  - action: ask-clarification
    description: "Ask user for specific example or confirm use of generic WAG data"
    blocking: true
```

**If quality gate passes:**
```yaml
phase: 3
status: success
summary: "Quality gate passed, ready for generation"
next_actions:
  - action: invoke-sub-skills
    blocking: true
```

---

### Phase 4 — Sub-Skill Invocation

**Purpose:** Generate content for each selected channel via WCSP.

**Parallel invocation rule:** Independent channels invoke simultaneously.
**Sequential rule:** If content shares core atoms (cross-channel) → LinkedIn first, then adapt.

#### LinkedIn (wag-linkedin-post)

```yaml
invoke: wag-linkedin-post
input:
  command: new-post
  context:
    central_content:
      pain_point: <from Q1>
      evidence: <from Q2>
      structure: <from Q3>
      cta: <from Q4>
    channel: linkedin
    constraints:
      hook_limit: 210
      format: 3-step-framework
  state:
    phase: 4
    checkpoint: linkedin-generation
```

#### X (wag-x-twitter)

```yaml
invoke: wag-x-twitter
input:
  command: new-post
  context:
    central_content:
      hook: <adapted from LinkedIn hook>
      insight: <core message>
      stat: <if available>
    channel: x
    constraints:
      hook_limit: 280
      standalone: true
  state:
    phase: 4
    checkpoint: x-generation
```

#### Facebook (wag-facebook)

```yaml
invoke: wag-facebook
input:
  command: new-post
  context:
    central_content:
      hook: <relationship-driven version>
      story: <if available>
      list: <format if applicable>
    channel: facebook
    constraints:
      hook_limit: 150
      cta_priority: saves
  state:
    phase: 4
    checkpoint: facebook-generation
```

#### SEO/Blog (wag-seo-blog)

```yaml
invoke: wag-seo-blog
input:
  command: new-post
  context:
    central_content:
      topic: <expanded from Q1>
      structure: guide
    channel: seo
    constraints:
      word_count: 1500-3000
      meta_limit: 160
  state:
    phase: 4
    checkpoint: seo-generation
```

---

### Phase 4.5 — Image Generation (baoyu-article-illustrator)

**Purpose:** Generate 3 shared illustrations for the article, shared across LinkedIn/social posts.

**When:** Invoked when SEO/blog article is generated. Images are shared assets for the entire content batch.

**Image Count:** 3 (balanced density)

**Style:** minimal-flat (WAG brand: Navy #0F2D5E + Amber #F59E0B)

**Image Generation Pipeline:**

#### Step 1: Analyze Content
- Identify key visual moments in the article
- Map to illustration types: `comparison`, `framework`, `scene`
- Determine 3 positions (hook, middle, CTA)

#### Step 2: Generate Outline

**Output file:** `{article-dir}/imgs/outline.md`

```yaml
---
type: framework
density: balanced
style: minimal-flat
image_count: 3
article: {article-mdx-path}
---

## Illustration 1
**Position**: Article opening / Hook section
**Purpose**: [why illustration adds value]
**Visual Content**: [what to show]
**Filename**: 01-{type}-{slug}.png

## Illustration 2
**Position**: [section]
**Purpose**: [why]
**Visual Content**: [what]
**Filename**: 02-{type}-{slug}.png

## Illustration 3
**Position**: CTA / conclusion
**Purpose**: [why]
**Visual Content**: [what]
**Filename**: 03-{type}-{slug}.png
```

#### Step 3: Generate Prompts

**Tool:** `baoyu-article-illustrator` skill

**Prompt file structure:**
```yaml
---
type: {comparison|framework|scene}
style: minimal-flat
aspect_ratio: "16:9"
filename: {NN}-{type}-{slug}.png
---

## ZONES
[Visual layout sections]

## LABELS
[Text overlays with article-specific data]

## COLORS
- Primary: Navy (#0F2D5E)
- Accent: Amber (#F59E0B)
- Background: White/light gray

## STYLE
[Style guidance]
```

**Prompt files saved to:** `{article-dir}/imgs/prompts/`

#### Step 4: Generate Images

**Tool:** `baoyu-danger-gemini-web` skill

**Consent check:**
```bash
test -f ~/Library/Application\ Support/baoyu-skills/gemini-web/consent.json && \
grep -q '"accepted":true' ~/Library/Application\ Support/baoyu-skills/gemini-web/consent.json && echo "CONSENT_OK"
```

**Generation command:**
```bash
bun main.ts \
  --promptfiles "{prompt-file-path}" \
  --image "{output-dir}/{filename}.png"
```

**Parallel generation:** All 3 images generate simultaneously.

#### Step 5: Verify Output

```yaml
phase: 4.5
status: {success|warning|error}
images_generated:
  - path: "{article-dir}/imgs/01-factory-vs-trading-company.png"
    size_bytes: 940139
    status: verified
  - path: "{article-dir}/imgs/02-three-step-framework.png"
    size_bytes: 583255
    status: verified
  - path: "{article-dir}/imgs/03-wag-consultation-cta.png"
    status: {generating|verified|failed}

next_actions:
  - action: proceed-to-qa
    description: "All images verified, proceed to Phase 5"
    blocking: false
  - action: retry-image
    description: "Regenerate failed image"
    blocking: true
```

**Quality gates:**
- [ ] All 3 images exist
- [ ] File sizes > 10KB (indicates actual image, not error)
- [ ] Aspect ratio approximately 16:9

**Error recovery:**
- If image generation fails: retry once with same prompt
- If retry fails: log error, proceed to QA with warning
- Images are optional for social post distribution (can post without images)

---

### Phase 5 — Double QA Review

**Purpose:** Two-layer quality verification before distribution.

#### QA Layer 1: Self-QA (Automated Checklist)

Present self-check results automatically before human review:

```yaml
phase: 5a
qa_type: self
automated_checks:
  - check: hook_length
    platform: linkedin
    limit: 210
    actual: 198
    result: PASS
  - check: hashtag_count
    platform: linkedin
    limit: 10
    actual: 8
    result: PASS
  - check: emoji_present
    platform: linkedin
    result: FAIL (emoji found)
  - check: cta_specificity
    platform: x
    result: FAIL (generic CTA)
```

**Self-QA Checklist (per platform):**

| Check | LinkedIn | X | Facebook | SEO |
|-------|----------|---|----------|-----|
| Hook length | ≤210c | ≤280c | ≤150c | N/A |
| Hashtags | 6-10 | 1-2 | 3-5 | N/A |
| Emoji | None | None | None | None |
| CTA type | Specific | Poll/Contrarian | Save/Share | Book consult |
| Links in body | None | None | None | None |
| Tone | Professional | Sharp | Conversational | Educational |
| Brand voice | Consistent | Consistent | Consistent | Consistent |

**If Self-QA FAIL:**
- Auto-correct if possible (trim hook, remove emoji)
- Flag for Human-QA review
- Do not proceed to distribution

---

#### QA Layer 2: Human-QA (User Confirmation)

Present to user after self-QA passes:

```yaml
phase: 5b
qa_type: human
status: awaiting_confirmation

review_table:
  linkedin:
    content_preview: "[First 200 chars of hook]..."
    self_qa_result: PASS
    human_notes: ""
  x:
    content_preview: "[Tweet text]..."
    self_qa_result: PASS
    human_notes: ""
  facebook:
    content_preview: "[Hook + list structure]..."
    self_qa_result: PASS
    human_notes: ""
  seo:
    content_preview: "[Title + meta]..."
    self_qa_result: PASS
    human_notes: ""

summary: "All channels PASS Self-QA, awaiting Human-QA confirmation"
next_actions:
  - action: human-review
    description: "User confirms each channel for distribution"
    blocking: true
```

**Human-QA Confirmation Options:**

| Option | Action |
|--------|--------|
| **APPROVE ALL** | Proceed to Phase 6 with all channels |
| **APPROVE SELECTED** | Proceed only with approved channels, iterate others |
| **ITERATE** | Return to Phase 4 with specific revision requests |
| **REJECT ALL** | Discard and restart from Phase 2 |

**Review table format (Human-QA):**

| Channel | Self-QA | Content Preview | Human Action |
|---------|----------|-----------------|--------------|
| LinkedIn | ✓ PASS | "Before you buy your next batch..." | [Approve/Iterate/Reject] |
| X | ✓ PASS | "Wrong. Most Aussie AV companies..." | [Approve/Iterate/Reject] |
| Facebook | ✓ PASS | "We've all been there..." | [Approve/Iterate/Reject] |
| SEO | ✓ PASS | "How to Verify Chinese Factories..." | [Approve/Iterate/Reject] |

**Human-QA Questions (if flags raised):**

If Self-QA found issues, ask user before proceeding:
- "LinkedIn post has 8 hashtags (max 10). Approve as-is or trim?"
- "X CTA is generic. Change to poll format?"

---

### Phase 6 — Distribution & Archiving

**Purpose:** Execute distribution timeline and archive outputs.

**Distribution Timeline:**

| Time | Action | Channels |
|------|--------|---------|
| T+0 | Publish | LinkedIn (approved) |
| T+30min | Publish | X (approved) |
| T+1h | Publish | Facebook (approved) |
| T+1h | Queue | SEO (if included) |

**Execution:**
```yaml
phase: 6
distribution:
  - channel: linkedin
    status: published
    url: <user provides>
    archived_at: "2026-04-01T00:00:00Z"
  - channel: x
    status: published
  - channel: facebook
    status: published
  - channel: seo
    status: queued

status: success
summary: "3 channels published, 1 queued (SEO)"
next_actions:
  - action: update-analytics
    description: "Record publish timestamps for performance tracking"
    blocking: false
```

**Archive structure:**
```
social/
├── linkedin-post/
│   └── archive/{YYYY-MM}/{YYYY-MM-DD-topic}/
├── x-post/
│   └── archive/{YYYY-MM}/{YYYY-MM-DD-topic}/
├── facebook-post/
│   └── archive/{YYYY-MM}/{YYYY-MM-DD-topic}/
└── seo-blog/
    └── archive/{YYYY-MM}/{YYYY-MM-DD-topic}/
```

---

### Phase 6.5 — HTML Preview & Distribution Pack

**Purpose:** Generate a self-contained HTML page with all content for easy copy-paste publishing.

**Output:** `{topic-dir}/publish-preview.html`

**HTML Template:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WAG Content Pack — {YYYY-MM-DD topic}</title>
  <style>
    :root {
      --navy: #0F2D5E;
      --amber: #F59E0B;
      --gray: #6B7280;
      --light: #F9FAFB;
    }
    body { font-family: 'IBM Plex Sans', system-ui, sans-serif; max-width: 900px; margin: 0 auto; padding: 2rem; }
    h1 { color: var(--navy); border-bottom: 3px solid var(--amber); padding-bottom: 0.5rem; }
    h2 { color: var(--navy); margin-top: 2rem; }
    .channel { background: var(--light); border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0; }
    .channel h3 { margin-top: 0; color: var(--navy); }
    .content-box { background: white; border: 1px solid #E5E7EB; border-radius: 4px; padding: 1rem; white-space: pre-wrap; font-size: 14px; line-height: 1.6; }
    .copy-btn { background: var(--navy); color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-size: 14px; }
    .copy-btn:hover { background: #1a3d6e; }
    .copy-btn:active { background: var(--amber); }
    .hashtags { color: var(--gray); font-size: 13px; margin-top: 0.5rem; }
    .images { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1rem; }
    .images img { max-width: 300px; border-radius: 4px; }
    .meta { color: var(--gray); font-size: 13px; margin-bottom: 1rem; }
    .warning { background: #FEF3C7; border-left: 4px solid var(--amber); padding: 1rem; margin: 1rem 0; }
    .thread-label { font-weight: bold; color: var(--navy); margin-bottom: 0.5rem; }
  </style>
</head>
<body>
  <h1>WAG Content Pack — {topic}</h1>
  <p class="meta">Generated: {YYYY-MM-DD HH:mm} | Target: {audience}</p>

  <!-- LinkedIn -->
  <div class="channel">
    <h3>LinkedIn Post</h3>
    <button class="copy-btn" onclick="copyContent('linkedin')">Copy Post</button>
    <div class="content-box" id="linkedin">${linkedin_content}</div>
    <p class="hashtags">{linkedin_hashtags}</p>
    <p><strong>First Comment:</strong> ${linkedin_first_comment}</p>
    <div class="images">
      <img src="/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/01-factory-vs-trading-company.png" alt="Cover">
    </div>
  </div>

  <!-- X / Twitter -->
  <div class="channel">
    <h3>X / Twitter Thread</h3>
    <p class="warning">Post in order: Tweet 1 → Poll (reply) → Link (reply)</p>

    <div class="thread-label">Tweet 1 (Main Hook)</div>
    <button class="copy-btn" onclick="copyContent('x1')">Copy Tweet 1</button>
    <div class="content-box" id="x1">${x_tweet1}</div>
    <p class="hashtags">${x_hashtags_1}</p>

    <div class="thread-label">Tweet 2 (Poll — reply to Tweet 1)</div>
    <button class="copy-btn" onclick="copyContent('x2')">Copy Poll</button>
    <div class="content-box" id="x2">${x_poll}</div>

    <div class="thread-label">Tweet 3 (Link — reply to Tweet 1)</div>
    <button class="copy-btn" onclick="copyContent('x3')">Copy Link Tweet</button>
    <div class="content-box" id="x3">${x_link}</div>
  </div>

  <!-- Facebook -->
  <div class="channel">
    <h3>Facebook Post</h3>
    <button class="copy-btn" onclick="copyContent('facebook')">Copy Post</button>
    <div class="content-box" id="facebook">${facebook_content}</div>
    <p class="hashtags">{facebook_hashtags}</p>
  </div>

  <!-- SEO Blog -->
  <div class="channel">
    <h3>SEO Blog Article</h3>
    <p class="meta">Deploy: <code>git add . && git commit -m "feat: {commit message}" && git push</code></p>
    <p class="meta">URL: <a href="/resources/{slug}" target="_blank">/resources/{slug}</a></p>
    <div class="images">
      <img src="/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/01-factory-vs-trading-company.png" alt="Cover">
      <img src="/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/02-three-step-verification-framework.png" alt="Framework">
      <img src="/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/03-wag-consultation-cta.png" alt="CTA">
    </div>
  </div>

  <script>
    function copyContent(id) {
      const el = document.getElementById(id);
      navigator.clipboard.writeText(el.innerText).then(() => {
        const btn = el.previousElementSibling;
        const original = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.background = '#F59E0B';
        setTimeout(() => {
          btn.textContent = original;
          btn.style.background = '#0F2D5E';
        }, 1500);
      });
    }
  </script>
</body>
</html>
```

**Execution:**

After Phase 5 (Double QA) passes, automatically generate HTML preview:

```yaml
phase: 6.5
output:
  file: "{topic-dir}/publish-preview.html"
  content:
    linkedin: <from Phase 4>
    x_thread:
      tweet1: <from Phase 4>
      poll: <from Phase 4>
      link: <from Phase 4>
    facebook: <from Phase 4>
    seo: <from Phase 4>
    images: <from Phase 4.5>
  open: true
  summary: "HTML preview generated — click to open and copy"
  prerequisites:
    - images_copied_to_public: true
    - image_paths_use_absolute: true
```

**⚠️ Image Path Requirement:**
- HTML 中图片路径必须使用绝对路径：`/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/01-xxx.png`
- 相对路径（如 `imgs/01-xxx.png`）在直接打开 file:// 时无法加载图片
- MDX 文章使用 `/social/...` 映射到 `public/social/...`，与 HTML 预览路径一致
next_actions:
  - action: open-preview
    description: "Open publish-preview.html in browser"
    blocking: false
  - action: publish
    description: "User publishes from HTML preview"
    blocking: true
```

**Quality gates:**
- [ ] All content sections present
- [ ] Copy buttons functional
- [ ] Images use absolute paths (`/social/linkedin-post/...`)
- [ ] Images display correctly
- [ ] Thread order clearly labeled
- [ ] Images copied to `public/social/` (prerequisite for HTML preview)

**Error recovery:**
- If HTML generation fails: output raw content as markdown
- Always provide copy-able content regardless of HTML success

---

## Flow: analyze

**Purpose:** Query and interpret performance data.

```yaml
invoke: wag-analytics-collector
input:
  command: query-performance
  context:
    date_range: last-30d
    channels: all
    metrics: [impressions, er, ctr, comments]
```

**Output format:**
```yaml
status: success
summary: "30-day performance: LinkedIn ER=16.5%, X ER=5.2%"
artifacts:
  report_path: /analytics/reports/weekly-2026-W13.md
  linkedin:
    posts: 3
    avg_er: 0.165
    best_post: "LI-post-20260323-xxx"
  x:
    posts: 0
    data_available: false
next_actions:
  - action: review-best-post
    description: "Analyze winning post for pattern extraction"
```

---

## Flow: status

**Purpose:** Dashboard view (read-only, no generation).

```yaml
status: success
summary: "This week: 2 published, 1 planned, 4 in draft"
artifacts:
  this_week:
    published: [linkedin, x, facebook]
    planned: []
    draft: [seo]
  pipeline:
    - topic: "Factory verification"
      channels: [linkedin, x, facebook, seo]
      status: draft
    - topic: "Supplier vetting checklist"
      channels: [linkedin, x, facebook, seo]
      status: idea
```

---

## Flow: review

**Purpose:** Cross-channel quality audit.

```yaml
invoke: <sub-skill>
input:
  command: review
  context:
    channels: [linkedin, x, facebook, seo]
    criteria:
      - brand_voice
      - no_emoji
      - no_chinese
      - cta_specificity
      - hashtag_limit
```

**Output:**
```yaml
status: success
summary: "Audit complete: 2 PASS, 1 FLAG"
artifacts:
  linkedin: PASS
  x: PASS
  facebook:
    status: warning
    issues:
      - type: hashtag_limit
        detail: "8 hashtags, limit is 5"
        severity: medium
```

---

## Flow: optimize

**Purpose:** Rule-based content strategy recommendations.

```yaml
invoke: wag-analytics-collector
input:
  command: self-evolution
  context:
    lookback_days: 30
    trigger: scheduled
```

**Output:**
```yaml
status: success
summary: "Rules updated: 2 new, 1 promoted, 1 deprecated"
artifacts:
  rules_updated:
    - rule_id: li-format-steps-001
      change: promoted
      evidence: 3 posts ER=22.6%
    - rule_id: fb-cta-saves-001
      change: new
      evidence: First Facebook post, saves=47
  recommendations:
    - priority: high
      action: "Increase LinkedIn posting frequency to 2x/week"
      reason: "ER consistently above 15%"
```

---

## Error Recovery

### Error Types & Responses

| Error | Root Cause | Recovery | Stop Condition |
|-------|-----------|----------|----------------|
| Sub-skill timeout | Service unavailable | Retry 3x with 30s backoff | Return to user with partial results |
| Quality gate fail | Insufficient input | Return to Q&A | Block until resolved |
| Hook exceeds limit | Format mismatch | Auto-trim + flag | User must approve trimmed version |
| RAG unavailable | Content not found | Continue without RAG | Flag for manual fact-check |
| Permission denied | File access issue | Skip archiving | Log error, continue |

### Recovery Flow

```yaml
error:
  type: hook-exceeds-limit
  channel: linkedin
  details:
    hook_chars: 247
    limit: 210
    over_by: 37

recovery:
  action: auto-trim
  attempt: 1
  result:
    hook_chars: 208
    message: "Auto-trimmed, review recommended"

  retry:
    attempt: 2
    action: manual-trim
    result: pending_user_approval
```

---

## Critical Rules

1. **Single channel = direct route** — Never invoke Hub flow for single-channel requests
2. **WCSP contract required** — All sub-skill invocations must follow WCSP format
3. **Quality gate blocks generation** — No sub-skill invocation without passing gate
4. **Parallel when independent** — Invoke independent channels simultaneously
5. **Sequential when sharing atoms** — LinkedIn first, then adapt
6. **No emoji anywhere** — Hard rule, no exceptions
7. **Hook limits are enforced** — Auto-trim with user approval for oversized hooks
8. **Archive everything** — All published content archived within 24h
9. **State survives context** — If interrupted, Hub resumes at last checkpoint

---

## Anti-Patterns (Per Agent Harness Principles)

| Anti-Pattern | Problem | Solution |
|-------------|---------|----------|
| Catch-all sub-skill | Opaque, undebuggable | WCSP contract with explicit outputs |
| Error-only output | No recovery path | error object with root_cause + safe_retry |
| No state tracking | Can't resume | execution_id + phase + checkpoint in state |
| Unbounded context | Token pressure | Phase compact at boundaries |
| Blocking parallel | Lost time | Non-blocking channels invoke first |

---

*Version 2.0 — Refactored with WCSP protocol and structured output contracts*
