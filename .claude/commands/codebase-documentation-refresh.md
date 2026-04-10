---
name: codebase-documentation-refresh
description: Workflow command scaffold for codebase-documentation-refresh in wag.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /codebase-documentation-refresh

Use this workflow when working on **codebase-documentation-refresh** in `wag`.

## Goal

Keeps the codebase documentation up-to-date by mapping architecture, stack, integrations, concerns, conventions, and testing.

## Common Files

- `.planning/codebase/ARCHITECTURE.md`
- `.planning/codebase/STACK.md`
- `.planning/codebase/INTEGRATIONS.md`
- `.planning/codebase/CONCERNS.md`
- `.planning/codebase/CONVENTIONS.md`
- `.planning/codebase/STRUCTURE.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Edit or create markdown files in .planning/codebase/ (e.g., ARCHITECTURE.md, STACK.md, INTEGRATIONS.md, CONCERNS.md, CONVENTIONS.md, STRUCTURE.md, TESTING.md)
- Summarize or update each file with current information
- Commit all updated documentation files together

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.