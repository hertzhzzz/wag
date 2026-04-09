# Phase 01: Single Agent Verification - Research

**Researched:** 2026-04-09
**Domain:** Claude Code Agent Teams + WAG DevOps/Content workflows
**Confidence:** HIGH

## Summary

Phase 1 validates the Orchestrator Agent in single-agent mode, measuring accuracy against a 45% threshold using 6 tasks (3 DevOps + 3 Content Studio). The infrastructure requires: enabling experimental Agent Teams, creating the external state storage directory at `~/.claude/teams/wag-ai/state/`, and configuring task/accuracy logging. The WAG project uses Next.js 16.1 with TypeScript, deployed on Vercel. Content workflows use the wag-content-hub skill at `~/.hermes/skills/content-generation/wag-content-hub/`. Agent Teams are already enabled in the user's Claude settings (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`).

**Primary recommendation:** Start by creating the state storage infrastructure and configuring the Orchestrator Agent to use the WAG project context, then run 6 validation tasks and measure accuracy.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Single Agent起步 - do not immediately use multi-team architecture
- **D-02:** Centralized Orchestrator - Orchestrator is the sole decision point
- **D-03:** External state storage - filesystem at `~/.claude/teams/wag-ai/state/` (not Agent context persistence)
- **D-04:** Checkpoint frequency - hourly auto-save + after key tasks
- **D-05:** State fields - `currentTask`, `progress`, `errors`, `nextSteps`
- **D-06:** 45% accuracy threshold required to proceed to Phase 2
- **D-07:** Measurement method - each task records: intent understanding, actions taken, output, score

### Claude's Discretion
- Which specific DevOps and Content Studio tasks to use for validation
- State file JSON schema details
- Accuracy report format

### Deferred Ideas (OUT OF SCOPE for Phase 1)
- tmux session structure (Phase 2)
- DevOps / Content Studio team separation (Phase 2)
- Version sync protocol (Phase 2)
- Skill library expansion (Phase 3)

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REQ-01 | Orchestrator Agent config - reads external state, writes checkpoints, calls Agent Teams API | Section 2: Team Architecture |
| REQ-02 | External state storage at `~/.claude/teams/wag-ai/state/` - JSON format, fields: currentTask, progress, errors, nextSteps, checkpoint hourly + after key tasks | Section 3: State Storage |
| REQ-03 | Accuracy measurement - task completion status, accuracy calculation, 45% threshold judgment | Section 4: Accuracy Measurement |
| REQ-04 | DevOps task validation - code modification, build verification, deployment trigger | Section 5: DevOps Tasks |
| REQ-05 | Content Studio task validation - content generation, image prompt, publish preview | Section 6: Content Studio Tasks |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Claude Code | 2.1.97+ | Agent orchestration | Required for Agent Teams |
| Next.js | 16.1 | WAG website framework | Project framework |
| TypeScript | 5 | WAG website language | Project language |
| wag-content-hub skill | latest | Content intelligence & generation | Content Studio workflow |
| wag-linkedin-post skill | latest | LinkedIn post generation | Content Studio workflow |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| generate_content.py | - | Content scaffold generator | Creating LinkedIn/FB/X posts |
| generate_preview.py | - | HTML preview generator | Creating publish previews |
| master-prompts.md | - | Content generation prompts | AI content fill |
| publish-preview-template.html | - | HTML template | Preview generation |

**Source:** Project CLAUDE.md, wag-content-hub SKILL.md

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| External file state | In-context state | File state survives session restarts (required by D-03) |
| tmux split panes | In-process teammates | User already has `CLAUDE_CODE_TEAMMATE_MODE=tmux` configured |
| Custom accuracy logging | Hook-based logging | TaskCompleted hook provides native quality gate |

## Architecture Patterns

### Recommended Project Structure

```
~/.claude/teams/wag-ai/           # Agent Team root (per design spec)
├── config.json                    # Team config (auto-managed by Claude Code)
├── state/                         # External state storage (D-03)
│   ├── orchestrator.json         # Orchestrator checkpoint
│   ├── devops.json               # DevOps checkpoint (Phase 2)
│   └── content-studio.json       # Content Studio checkpoint (Phase 2)
├── memory/                       # Long-term memory (Phase 2+)
│   ├── shared/
│   ├── devops/
│   └── content-studio/
├── checkpoints/                  # Hourly snapshots (Phase 2+)
│   └── YYYY-MM-DD-HHMM.json
└── skills/                       # Team-specific skills (Phase 2+)
    ├── orchestrator/
    ├── devops/
    └── content-studio/

/Users/mark/Projects/wag/          # WAG project (target for DevOps tasks)
├── app/                          # Next.js App Router
├── content/blog/                 # MDX blog content
├── public/social/                # Social media images
└── social/                       # Content Hub social content

~/.hermes/skills/content-generation/wag-content-hub/  # Content Hub skill
├── social/                       # Content workflows
│   ├── linkedin-post/
│   ├── facebook-post/
│   ├── x-post/
│   ├── generate_content.py
│   └── generate_preview.py
└── references/
    ├── master-prompts.md
    └── publish-preview-template.html
```

### Pattern 1: Single Agent Validation Mode

**What:** Orchestrator Agent runs in single-agent mode, performing all 6 validation tasks sequentially without spawning teammates.

**When to use:** Phase 1 validation only - before expanding to multi-team architecture.

**Example:**
```
User: Run Phase 1 validation with 3 DevOps tasks and 3 Content Studio tasks.
Orchestrator: [Executes each task, records accuracy metrics to orchestrator.json]
```

### Pattern 2: TaskCompleted Hook for Quality Gates

**What:** Use `TaskCompleted` hook to validate task output before marking complete.

**When to use:** Enforcing build passing, lint clean, content tag presence.

**Source:** [Claude Code Hooks Documentation](https://code.claude.com/docs/en/hooks)

```json
// .claude/settings.json
{
  "hooks": {
    "TaskCompleted": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/verify-task.sh",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

### Pattern 3: External State Checkpoint Protocol

**What:** Orchestrator writes state to JSON file after each key task and hourly.

**When to use:** Every task completion + hourly cron.

**Example (orchestrator.json):**
```json
{
  "currentTask": "DevOps-2: Build Verification",
  "progress": {
    "completed": 1,
    "total": 6,
    "successful": 0
  },
  "errors": [],
  "nextSteps": ["Run npm run build", "Verify build success"]
}
```

**Source:** Design spec Section 3.2 (D-04, D-05)

### Anti-Patterns to Avoid
- **Spawning multiple teammates in Phase 1:** Violates D-01. Single agent only.
- **Using in-context state:** Violates D-03. Must use external file storage.
- **Skipping accuracy logging:** Violates D-07. Every task must be measured.
- **Modifying team config manually:** Claude Code auto-manages `config.json`. Edits are overwritten.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Agent coordination | Custom IPC/message queue | Claude Code Agent Teams shared task list + mailbox | Native inter-agent communication, automatic delivery |
| State persistence | Custom database | JSON files in `~/.claude/teams/wag-ai/state/` | Design spec requirement (D-03) |
| Quality gates | Custom validation scripts | TaskCompleted hook | Native hook with exit-code blocking |
| Content generation | Manual post creation | generate_content.py + master-prompts.md | Existing skill infrastructure |

**Key insight:** Phase 1 is a validation baseline. Custom infrastructure added now would inflate coordination overhead before measuring actual performance.

## Common Pitfalls

### Pitfall 1: Team Config Auto-Overwrite
**What goes wrong:** Editing `~/.claude/teams/wag-ai/config.json` manually, only to have Claude Code overwrite it on next state change.
**Why it happens:** Claude Code auto-generates and manages team config. Manual edits are discarded.
**How to avoid:** Use external state files for persistent data. Config.json is runtime-only.
**Warning signs:** State changes not persisting, config fields disappearing.

### Pitfall 2: In-Process Teammate Session Loss on Resume
**What goes wrong:** Running `/resume` after a session ends loses all in-process teammates.
**Why it happens:** No session resumption with in-process teammates (known limitation).
**How to avoid:** Write checkpoints frequently. If resume loses teammates, respawn them.
**Warning signs:** Teammates not responding after resume, "teammate not found" errors.

### Pitfall 3: Task Status Lags
**What goes wrong:** Teammate completes work but task stays "in progress" blocking dependents.
**Why it happens:** Task status can lag behind actual completion (known limitation).
**How to avoid:** Check actual work completion manually. Update task status via lead or manually.
**Warning signs:** Tasks stuck in "in progress", dependent tasks not unblocking.

### Pitfall 4: One Team Per Session
**What goes wrong:** Trying to manage multiple teams from one session.
**Why it happens:** Lead can only manage one team at a time.
**How to avoid:** Clean up current team before starting new one.
**Warning signs:** "Team already active" errors.

## Code Examples

### Creating a Team (via natural language prompt)
```
Create an agent team for WAG Phase 1 validation. One orchestrator agent 
running in single-agent mode. Store state at ~/.claude/teams/wag-ai/state/.
```

### Spawning a Teammate (Phase 2 pattern)
```text
Spawn a devops teammate using the devops agent type to handle build 
verification tasks.
```

### Assigning Tasks
```text
Create these 6 validation tasks:
1. DevOps-1: Modify Navbar CTA button style
2. DevOps-2: Run npm run build and verify success
3. DevOps-3: Commit and push to master
4. Content-1: Generate LinkedIn post for factory verification
5. Content-2: Generate image prompt for post
6. Content-3: Generate publish preview HTML
```

### Reading External State
```bash
cat ~/.claude/teams/wag-ai/state/orchestrator.json
```

### Writing Checkpoint (within Claude Code)
```bash
mkdir -p ~/.claude/teams/wag-ai/state/
echo '{"currentTask":"DevOps-1","progress":{"completed":0,"total":6},"errors":[],"nextSteps":["Modify Navbar CTA"]}' > ~/.claude/teams/wag-ai/state/orchestrator.json
```

### Using generate_content.py (Content Studio)
```bash
cd ~/.hermes/skills/content-generation/wag-content-hub
python social/generate_content.py --topic "factory-verification" --type single-post --date "2026-04-09"
```

### Using generate_preview.py (Content Studio)
```bash
cd ~/.hermes/skills/content-generation/wag-content-hub
python social/generate_preview.py --topic "2026-04-09-factory-verification" --type single-post
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| In-context state | External file state | Phase 1 (D-03) | Survives session restarts |
| Single session | Agent Teams | Phase 1+ | Enables parallel coordination |
| Manual quality checks | Hook-based quality gates | Phase 1+ | Automated enforcement |
| Human-only content | AI-assisted content hub | Already in use | Existing WAG infrastructure |

**Deprecated/outdated:**
- Nested team structures: Not supported by Claude Code Agent Teams
- Session persistence with in-process teammates: Known limitation, work around with checkpoints

## Assumptions Log

> List all claims tagged `[ASSUMED]` in this research. The planner and discuss-phase use this section to identify decisions that need user confirmation before execution.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Agent Teams API is accessible via `claude` CLI | Environment | Team creation fails if API access differs |
| A2 | `~/.claude/teams/wag-ai/state/` directory can be created | State Storage | Checkpoint writes fail if permissions issue |
| A3 | wag-content-hub skill at `~/.hermes/skills/content-generation/wag-content-hub/` is functional | Content Tasks | Content generation tasks fail |
| A4 | User has tmux installed (since CLAUDE_CODE_TEAMMATE_MODE=tmux) | Environment | Split pane mode fails, falls back to in-process |

**If this table is empty:** All claims in this research were verified or cited - no user confirmation needed.

## Open Questions

1. **Where should the Orchestrator Agent run?**
   - What we know: Design spec says Orchestrator is the "lead" session
   - What's unclear: Should it run in a dedicated terminal session, or spawn from current session?
   - Recommendation: Run as lead in current session, use tmux split panes if available

2. **How to trigger the 6 validation tasks?**
   - What we know: 3 DevOps + 3 Content Studio tasks defined
   - What's unclear: Who assigns the tasks - user manually, or Orchestrator self-assigns?
   - Recommendation: User provides task list to Orchestrator at session start

3. **What constitutes "successful" for each task type?**
   - What we know: Accuracy = successful tasks / total tasks
   - What's unclear: Exact criteria for DevOps vs Content Studio success
   - Recommendation: Define in plan - DevOps success = build passes + changes applied; Content success = files generated + tags present

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Claude Code CLI | Agent Teams | Yes | 2.1.97 | - |
| tmux | Split pane display | Yes (assumed) | - | in-process mode |
| Python 3 | Content scripts | Yes | system default | - |
| git | DevOps deployment | Yes | system git | - |
| npm | DevOps build | Yes | via nvm/project | - |
| wag-content-hub skill | Content tasks | Yes | latest | - |
| wag-linkedin-post skill | Content tasks | Yes | latest | - |

**Missing dependencies with no fallback:**
- None identified

**Missing dependencies with fallback:**
- None identified

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual task execution + JSON accuracy logging |
| Config file | None - manual measurement |
| Quick run command | Not applicable (manual validation) |
| Full suite command | Run all 6 validation tasks sequentially |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| REQ-01 | Agent reads/writes state, calls Agent Teams API | Manual | Check `~/.claude/teams/wag-ai/state/orchestrator.json` after each task | Yes |
| REQ-02 | State file has correct JSON schema | Manual | `jq . ~/.claude/teams/wag-ai/state/orchestrator.json` | Yes |
| REQ-03 | Accuracy calculated correctly | Manual | Review orchestrator.json progress fields | Yes |
| REQ-04 | DevOps tasks modify WAG codebase | Manual | `git diff` after DevOps tasks | Yes |
| REQ-05 | Content tasks generate files | Manual | Check `~/.hermes/skills/content-generation/wag-content-hub/social/linkedin-post/` | Yes |

### Sampling Rate
- **Per task:** Manual verification + state file update
- **Per wave merge:** N/A (single phase)
- **Phase gate:** Accuracy >= 45% (3+ of 6 tasks successful)

### Wave 0 Gaps
- None identified - all validation infrastructure is existing or file-creation based

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | N/A - internal agent coordination |
| V3 Session Management | No | N/A - agents don't authenticate |
| V4 Access Control | Yes | File permissions on state directory |
| V5 Input Validation | Yes | Zod validation on state JSON schema |
| V6 Cryptography | No | N/A - no secrets in agent state |

### Known Threat Patterns for Agent Teams

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| State file injection | Tampering | Validate JSON schema before write, restrict directory permissions |
| Task injection via prompt | Spoofing | User approves task list before execution |
| Teammate going rogue | Repudiation | TaskCompleted hook validates output |
| File permission escalation | Information Disclosure | State directory in user home, not shared |

## Sources

### Primary (HIGH confidence)
- [Claude Code Agent Teams Documentation](https://code.claude.com/docs/en/agent-teams) - Full API reference, architecture, limitations
- [Claude Code Hooks Documentation](https://code.claude.com/docs/en/hooks) - TaskCompleted, TeammateIdle for quality gates
- [Claude Code Subagents Documentation](https://code.claude.com/docs/en/sub-agents) - Reusable teammate definitions

### Secondary (MEDIUM confidence)
- wag-content-hub SKILL.md - Content workflow specification
- WAG AI Native Team Design Spec (docs/superpowers/specs/) - Phase 1 scope definition

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH - all verified via official documentation and project files
- Architecture: HIGH - follows design spec exactly, verified via Claude Code docs
- Pitfalls: MEDIUM - based on documented known limitations, not hands-on verification yet

**Research date:** 2026-04-09
**Valid until:** 2026-05-09 (30 days - stable documentation)
