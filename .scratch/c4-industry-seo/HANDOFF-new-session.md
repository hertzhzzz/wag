# C4 Industry SEO — Handoff for new Codex session

**Date:** 2026-07-15  
**Repo cwd:** `/Users/mark/Projects/wag`  
**Scratch:** `frontend/.scratch/c4-industry-seo/`

## Why this handoff exists

Previous Codex sessions hit `context_length_exceeded` on grok (~128k effective) after calling `view_image` on large full-page PNGs under `visual/05/`. Screenshots are offline so agents stop discovering them.

## Hard constraints (must follow)

1. **Do NOT** use `view_image` or load any PNG/JPG into context.
2. **Do NOT** open or list `frontend/.scratch/c4-industry-seo/visual._offline/` for model vision.
3. Visual QA is **human-only** (Finder/browser). Agent verifies via **source code + unit tests** only.
4. One ticket per session focus; stop when the ticket is done and summarize.
5. Public copy stays **English**; brand remains **Winning Adventure Global**.

## Progress map

| Ticket | File | Status |
|--------|------|--------|
| 01 | `issues/01-industry-qualified-form-surface.md` | **done** — commit `e34e22d` |
| 02 | `issues/02-industry-content-model-av-rewrite.md` | **done** — `7592b7a` + tracker `d4e5993` |
| 03 | `issues/03-construction-industry-rewrite.md` | **done** — `ea596c4` |
| 04 | `issues/04-agricultural-machinery-rewrite.md` | **done** — `1feb9f4` |
| 05 | `issues/05-homepage-services-light-retune.md` | **done** — `0589f67` |
| 06 | `issues/06-verification-pages-demotion.md` | **not started** (next) |

Spec: `frontend/.scratch/c4-industry-seo/spec.md`

## Ticket 05 — completed

Light retune of homepage + services for dual-path China sourcing (find-and-vet primary, visit/verify secondary) with SSR-friendly links into the three priority industries. No redesign / nav IA rebuild.

## Ticket 06 (next)

Demote supplier-verification pages to secondary path; keep live (no 301/merge/delete). Primary commercial intent stays on home, services, three industry pages.

## Screenshots (offline)

Moved to:

`frontend/.scratch/c4-industry-seo/visual._offline/05/`

Humans may open these files outside Codex. Agents must ignore this path.

## Paste block for new Codex session

```text
Read and follow: frontend/.scratch/c4-industry-seo/HANDOFF-new-session.md

Continue C4 industry SEO at /Users/mark/Projects/wag.

Hard rules:
1. Never use view_image; never load PNGs into context.
2. Ignore frontend/.scratch/c4-industry-seo/visual._offline/
3. Verify with source + jest only.
4. Finish ticket 05 (uncommitted WIP) then stop and summarize.
5. Do not start ticket 06 unless I say so.

Start by reading the handoff + ticket 05 + git diff under frontend/, then complete 05.
```
