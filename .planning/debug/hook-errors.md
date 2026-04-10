---
status: investigating
trigger: "PreToolUse:Read hook error, PreToolUse:Bash hook error (6x), PostToolUse:Bash hook error (4x)"
created: 2026-04-07T00:00:00Z
updated: 2026-04-07T00:00:00Z
---

## Current Focus
hypothesis: "scripts/hooks/ directory is missing, causing all hook commands referencing scripts/hooks/* to fail"
test: "Verify scripts/hooks/ directory does not exist, list all hook commands that reference it"
expecting: "Directory /Users/mark/.claude/scripts/hooks/ is missing, and ~30 hook entries reference files in that directory"
next_action: "CONFIRMED - create scripts/hooks/ directory with symlinks to ECC plugin cache"

## Symptoms
expected: All hooks execute successfully
actual: Multiple hook errors showing "PreToolUse:Bash hook error", "PostToolUse:Bash hook error"
errors:
  - "PreToolUse:Read hook error" (1x)
  - "PreToolUse:Bash hook error" (6x)
  - "PostToolUse:Bash hook error" (4x)
reproduction: Unknown - user reported these errors appearing
started: Unknown when this started

## Eliminated
<!-- No hypotheses eliminated yet -->

## Evidence
- timestamp: 2026-04-07T00:00:00Z
  checked: "/Users/mark/.claude/scripts/hooks/"
  found: "Directory does not exist"
  implication: "All hooks referencing scripts/hooks/* will fail"

- timestamp: 2026-04-07T00:00:00Z
  checked: "/Users/mark/.claude/hooks/"
  found: "9 gsd-* files exist: gsd-check-update.js, gsd-context-monitor.js, gsd-phase-boundary.sh, gsd-prompt-guard.js, gsd-read-guard.js, gsd-session-state.sh, gsd-statusline.js, gsd-validate-commit.sh, gsd-workflow-guard.js"
  implication: "Hooks referencing ~/.claude/hooks/* are valid, hooks referencing ~/.claude/scripts/hooks/* are broken"

- timestamp: 2026-04-07T00:00:00Z
  checked: "/Users/mark/.claude/settings.json hooks section"
  found: "Multiple hooks reference files under scripts/hooks/"
  implication: "Approximately 30 hook entries reference missing scripts/hooks/ files"

## Resolution
root_cause:
fix:
verification:
files_changed: []
