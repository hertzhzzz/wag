---
name: navbar-feature-or-style-update
description: Workflow command scaffold for navbar-feature-or-style-update in wag.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /navbar-feature-or-style-update

Use this workflow when working on **navbar-feature-or-style-update** in `wag`.

## Goal

Implements or refines features and styles for the main navigation bar, often iteratively (e.g., adding buttons, updating layout, fixing logo).

## Common Files

- `app/components/Navbar.tsx`
- `public/logo-nav-trans-cropped.png`
- `public/logo-nav-trans.png`
- `public/logos/logo-nav-trans.png`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Edit app/components/Navbar.tsx to add or update feature (e.g., phone button, CTA, logo)
- Update related assets if needed (e.g., logo images in public/)
- Test Navbar visually and functionally
- Commit changes, often in small, focused commits

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.