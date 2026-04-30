---
name: pr-check
description: Run build and lint checks before commit (WAG CLAUDE.md requirement)
---

# pr-check Skill

Run the mandatory pre-commit checks: `npm run build` and `npm run lint`.

## Usage

Claude or user invokes before any git commit.

## Checks

1. `npm run build` - Production build (must pass)
2. `npm run lint` - ESLint check (must pass)

## Workflow

1. Run `npm run build`
2. If failed, show errors and stop
3. Run `npm run lint`
4. If failed, show errors and stop
5. Report success - safe to commit

## Output Format

```
=== WAG Pre-commit Check ===

[1/2] Running build...
✓ Build passed

[2/2] Running lint...
✓ Lint passed

✓ All checks passed - safe to commit
```
