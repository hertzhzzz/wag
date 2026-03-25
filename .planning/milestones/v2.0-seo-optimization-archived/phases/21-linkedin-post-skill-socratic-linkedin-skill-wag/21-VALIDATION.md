---
phase: 21
slug: linkedin-post-skill-socratic-linkedin-skill-wag
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-20
---

# Phase 21 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — Manual Skill Verification |
| **Config file** | N/A |
| **Quick run command** | `/skill wag-linkedin-post` (invoke only) |
| **Full suite command** | N/A — Manual review |
| **Estimated runtime** | ~60 seconds per invocation |

---

## Sampling Rate

- **After skill file creation:** Manual review of SKILL.md content
- **Before `/gsd:verify-work`:** Full skill file review against requirements
- **Max feedback latency:** N/A (manual process)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 21-01-01 | 01 | 1 | REQ-01 (Skill invocation) | Manual | `/skill wag-linkedin-post` | ⬜ pending |
| 21-01-02 | 01 | 1 | REQ-02 (Socratic flow) | Manual | Inspect SKILL.md for 3-4 questions | ⬜ pending |
| 21-01-03 | 01 | 1 | REQ-03 (RAG pattern) | Manual | Check Glob+Grep+Read calls in SKILL.md | ⬜ pending |
| 21-01-04 | 01 | 1 | REQ-04 (Post structure) | Manual | Check Hook/Body/CTA/Hashtags format | ⬜ pending |
| 21-01-05 | 01 | 1 | REQ-05 (WAG voice) | Manual | Verify brand voice alignment in prompt | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `.claude/skills/wag-linkedin-post/SKILL.md` created
- [ ] SKILL.md contains YAML frontmatter with name + description
- [ ] SKILL.md contains Socratic question flow
- [ ] SKILL.md contains RAG implementation (Glob+Grep+Read pattern)
- [ ] SKILL.md contains LinkedIn post template

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Socratic questions are conversational | REQ-02 | Tone assessment requires human judgment | Review question framing |
| WAG brand voice applied | REQ-05 | Brand alignment subjective | Review against CLAUDE.md voice guidelines |
| LinkedIn post quality | REQ-04 | Output format requires visual inspection | Generate sample post and review |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < N/A (manual)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** {pending / approved YYYY-MM-DD}
