---
target: "https://www.winningadventure.com.au/about"
total_score: 26
p0_count: 0
p1_count: 3
p2_count: 2
timestamp: 2026-06-25T05-54-17Z
slug: app-public-about-page-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Nav current-page highlight works; static page, limited status needs |
| 2 | Match System / Real World | 3 | Concrete locations and real numbers build credibility; "WAG" abbreviation violates user-facing rules |
| 3 | User Control and Freedom | 3 | Persistent nav, escape hatches everywhere, no traps |
| 4 | Consistency and Standards | 2 | Color drift from design tokens (`text-gray-700` vs navy), font weight deviations, rounded corner inconsistency |
| 5 | Error Prevention | 3 | Static content, minimal error surfaces; ABN verify link is a nice touch |
| 6 | Recognition Rather Than Recall | 3 | Clear headings, concrete case study evidence; no sticky TOC for a very long page |
| 7 | Flexibility and Efficiency | 2 | No skip-to-content link; long scroll without wayfinding aids |
| 8 | Aesthetic and Minimalist Design | 2 | Strong hero; undermined by eyebrow repetition on 6+ sections and 6 identical case-study cards |
| 9 | Error Recovery | 3 | N/A for static page; no error surfaces needed |
| 10 | Help and Documentation | 2 | FAQ section present; no contextual help for domain-specific terms |
| **Total** | | **26/40** | **Acceptable — significant improvements needed before users are fully satisfied** |

## Anti-Patterns Verdict

**LLM assessment:** The page does not read as "obviously AI-generated" at first glance — the copy is specific, the hero image is real industrial photography, and the case studies have genuine metrics. But the structural tells accumulate on closer inspection: six identical eyebrow kickers, six identical case study cards, side-border blockquotes, and a numbered-section strip (01/02/03). These are the "AI grammar" patterns the impeccable skill warns against. The designs are competent but formulaic — they follow the training-data scaffolding rather than the brand's own voice.

**Deterministic scan:** The automated detector found 2 `side-tab` warnings at lines 91 and 159 — both `border-l-4` on `<blockquote>` elements. Blockquotes with a left border are a legitimate semantic HTML convention, so these are partial false positives. However, the design system's absolute ban on side-stripe borders >1px applies regardless of element type, so the detector is technically correct. Consider replacing with a subtler treatment: a tinted background plus amber opening quote marks, or a full-bordered card style.

**Browser visualization:** Attempted injection of `detect.js` via live server on port 8400. Script injection succeeded but console logging is not yet implemented in this browser harness, so no overlay evidence was captured. The CLI scan is the primary detector evidence for this run.

## Overall Impression

The about page has a strong narrative skeleton — Mark He's credibility → company values → Andy Liu's origin story → comparative proof → case studies → bridge metaphor → location → FAQ → contact. The copy is specific and evidence-rich. But the page is exhaustingly long (11 distinct sections), the visual language drifts from the design system in a dozen small ways, and the repeated eyebrow + identical-card scaffolding makes the page feel assembled from a template rather than thoughtfully composed.

The single biggest opportunity: cut the section count by a third, kill the eyebrow repetition, and unify the typography to the design system.

## What's Working

1. **The hero H1 is excellent.** "We exist because Australian businesses deserve *direct access* to Chinese manufacturing — without the guesswork." It's a mission statement, not a tagline. The amber-italic rule is applied correctly to exactly two words. The navy gradient overlay on the container terminal photograph gives authority without feeling corporate.

2. **Evidence density in case studies.** Each case study names a real city, a real problem, a real metric (22% cost reduction, 99.2% defect rate, 12-day turnaround). This is "proof before claims" executed well — exactly what the design principles call for.

3. **The dual-perspective split section** (Australian B2B needs / Chinese supplier capabilities) is clever framing. It positions WAG as the translator between two worlds without saying it explicitly. The parallel structure reinforces the bridge metaphor that gets its own section later.

## Priority Issues

**[P1] Eyebrow repetition — same tiny kicker on 6+ sections**

Six sections use the identical pattern: `text-[11px] font-semibold text-amber tracking-[0.12em] uppercase mb-3`. "AUSTRALIA TEAM", "THE FOUNDER'S STORY", "AUSTRALIAN PERSPECTIVE", "CHINESE RESOURCES", "OUR LOCATION", "RESULTS WE HAVE DELIVERED". This is the exact anti-pattern the design system warns against: "One named kicker as a deliberate brand system is voice; an eyebrow on every section is AI grammar."

**Why it matters:** The kickers lose all meaning through repetition. They become visual noise rather than navigation aids. A user scanning the page can't distinguish one section from another by its kicker because they all share the same visual weight and position.

**Fix:** Keep at most 2 kickers on the entire page — the ones that genuinely disambiguate (e.g., "Australian Perspective" vs "Chinese Resources" in the split section). Kill the rest. Let the H2s do the work of introducing each section.

**Suggested command:** `/impeccable quieter app/(public)/about/page.tsx` — tone down the repetitive scaffolding.

**[P1] "WAG" abbreviation in body copy violates project rules**

Lines 86, 89, 163 use "WAG" in user-facing text: "As Managing Director of WAG's Australia office", "direct access to WAG's verified factory network". The project STRICT rules explicitly ban this: "Don't use 'WAG' or 'WA' abbreviations — always 'Winning Adventure Global'."

**Why it matters:** Abbreviations erode brand recognition and feel insider-y. An Australian business owner reading this page doesn't know what "WAG" stands for — they just see letters.

**Fix:** Replace all three instances with "Winning Adventure Global".

**Suggested command:** `/impeccable clarify app/(public)/about/page.tsx` — fix UX copy violations.

**[P1] Font sizes below design system minimum**

The nav "Call Us Today" renders at 10px. The section eyebrows render at 11px. Case study bottom-line data (cost savings, verification costs) renders at 12px. The design system floor for labels is 12px (Label SM), and 10px badges are for "tiny uppercase metadata" only.

**Why it matters:** 10-11px text is hard to read for anyone over 40 — exactly the demographic of Australian business owners. The case study metrics (cost savings, defect rates) are the most persuasive content on the page and they're rendered at the smallest readable size.

**Fix:** Bump eyebrows to 12px minimum. Increase case study metric text to 13px. Move "Call Us Today" to 12px or restructure the nav CTA pattern.

**Suggested command:** `/impeccable typeset app/(public)/about/page.tsx` — fix the typographic scale.

**[P2] Color drift from design system tokens**

Multiple instances: `text-gray-700` (Tailwind `#374151`) used throughout instead of `text-secondary` (`#4B5563`). `bg-[#fffbf0]` on blockquotes is a one-off hardcoded color. `bg-[#F9FAFB]` on the split section is one hex digit off from `surface-warm` (`#F8F9FB`). The bridge section uses `blue-500/20`, `blue-400`, `red-500/20`, `red-400` — colors that don't exist in the design system.

**Why it matters:** Color drift makes the page feel like it was built by different people at different times. The blue and red in the bridge section are particularly jarring — they introduce new semantic colors (blue = Australia? red = China?) without establishing meaning.

**Fix:** Replace `text-gray-700` with `text-navy/70` or the design system's secondary. Replace one-off hex colors with design system tokens. Recolor the bridge section icons to navy/amber only.

**Suggested command:** `/impeccable colorize app/(public)/about/page.tsx` — unify to the Factory Floor palette.

**[P2] Conflicting metadata exports**

The about page has TWO metadata exports: one inline in `page.tsx` (lines 14-46) and one in `metadata.ts` (a separate file imported but never used). The inline metadata has a different title ("Australia China Sourcing Agent") vs the metadata.ts version ("About Us: Australia's China Sourcing Partner"). The `metadata.ts` import on line 5 is dead code — it imports `Metadata` type but the actual metadata object comes from a different import that shadows it.

**Why it matters:** The metadata.ts file's canonical title is better SEO (includes "About Us" as a qualifier). The inline metadata has a keyword that violates project rules ("Australian owned China sourcing company" — should be "Australia-based"). Dead imports confuse future maintainers.

**Fix:** Consolidate to one metadata source. Prefer the `metadata.ts` pattern since it separates concerns. Remove the dead import of `{ Metadata }` from 'next' in page.tsx if using a separate metadata file.

**Suggested command:** `/impeccable polish app/(public)/about/page.tsx` — cleanup pass.

**[P3] Identical case study card grid**

Six cards in a 3-column grid, all with the same structure: rounded icon circle → industry label → description → metric line. Same height (220px), same padding, same border, same everything. This is the "identical card grid" anti-pattern from the absolute bans.

**Why it matters:** When every card is identical, none stands out. Users scan the first two and skip the rest. The case studies are the most persuasive content on the page — they deserve varied presentation that makes each one feel like a distinct story.

**Fix:** Vary the layout — maybe 2 featured case studies with more detail + 4 condensed ones, or alternate card styles. At minimum, break the rigid 220px fixed height and let cards size to their content.

**Suggested command:** `/impeccable layout app/(public)/about/page.tsx` — fix card grid monotony.

## Persona Red Flags

**Jordan (First-Time China Sourcer)** — the primary audience:

- The page has 11 sections with no visible progress or structure overview. Jordan lands, scrolls, gets overwhelmed by the volume, and doesn't know what to read first.
- "WAG" abbreviation appears before the full name is established in context. Jordan sees it and wonders if they're on the right website.
- The bridge section's "Australian Business → WAG → Chinese Supplier" diagram uses `blue-400` and `red-400` colors that Jordan may unconsciously read as political/cultural coding — an unwelcome signal on a page about cross-border partnership.
- The FAQ section is buried at position 10/11. Jordan's anxiety questions ("how do I know the supplier is real?", "what if quality is bad?") aren't addressed until after 8 other sections.

**Riley (Deliberate Stress Tester):**

- The `metadata.ts` file exports different SEO metadata than the inline metadata in `page.tsx`. Which one does Google see? (Answer: the inline one, but this is confusing.)
- The "Call Us Today" nav item renders at 10px — is this intentional or a CSS bug? The inconsistency suggests drift rather than intent.
- The ABN verify link opens in a new tab without `aria-label` indicating this — minor but inconsistent with the LinkedIn link which also opens in a new tab.

**Casey (Distracted Mobile User):**

- The hero H1 at `clamp(1.6rem,4vw,3rem)` renders at ~25px on mobile — reasonable. But the two CTAs below the Mark He section (LinkedIn + Book Consultation) are side by side at `justify-center` on mobile, creating a tight pair of buttons that may be hard to tap accurately.
- The case study cards at fixed 220px height may truncate content on smaller viewports.

## Minor Observations

- The page has no `scroll-mt-20` on any anchorable section — the FAQ section, contact section, and bridge section all lack it. If linked from other pages, the fixed navbar would cover their headings.
- The blockquote amber `border-l-4` pattern, while semantically correct, is flagged by the design system's side-border ban. Consider replacing with a full-bordered or tinted-background treatment.
- "Call Us Today" in the nav at 10px — this is the smallest text on any WAG marketing page and it's a conversion element. That's backwards.
- Mark He section has a `TODO` comment for a headshot (line 117). A photo of the managing director would significantly increase trust — this is a high-value add.
- The page body text is center-aligned on mobile for the Mark He section but left-aligned elsewhere — the mixed alignment creates a subtle inconsistency in reading flow.

## Questions to Consider

- Does this page need 11 sections? Could the Values Strip merge into the Founder's Story? Could the Bridge section replace the Split section entirely?
- What if the case studies were 3 featured stories with depth rather than 6 identical cards with breadth?
- Would a single, confident kicker ("AUSTRALIA TEAM" at the top) paired with naked H2s everywhere else feel more deliberate than the current every-section-eyebrow approach?
- Does the bridge metaphor need its own section, or is it already implicit in the split comparison + the copy throughout?
