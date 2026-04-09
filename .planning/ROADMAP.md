# Roadmap: WAG AI Native

## Overview

将 WAG 项目重构为 AI Native 项目，使用 Claude Code Agent Team 编排多个专业团队。两阶段扩展方案：先验证单 Agent 准确率（45% 阈值），通过后扩展为 DevOps + Content Studio 双团队架构。

## Phases

- [ ] **Phase 1: 单 Agent 验证** - 验证 Orchestrator Agent 单 Agent 模式准确率达到 45%
- [ ] **Phase 2: 双团队扩展** - DevOps + Content Studio 分离独立运行
- [ ] **Phase 3: 优化与扩展** - 根据需要扩展团队和技能库

## Phase Details

### Phase 1: 单 Agent 验证

**Goal**: 验证 Orchestrator Agent 在单 Agent 模式下完成 DevOps 和 Content Studio 任务的准确率达到 45% 阈值

**Depends on**: Nothing (first phase)

**Requirements**: [REQ-01, REQ-02, REQ-03, REQ-04, REQ-05]

**Success Criteria** (what must be TRUE):
  1. Orchestrator Agent 可正常运行并读取/写入外部状态文件
  2. 外部状态存储目录 `~/.claude/teams/wag-ai/state/` 可正常读写
  3. 单 Agent 完成至少 3 个 DevOps 任务（代码修改、构建验证、部署触发）
  4. 单 Agent 完成至少 3 个 Content Studio 任务（内容生成、图片生成、发布预览）
  5. 准确率测量报告完成，明确是否达到 45% 阈值进入 Phase 2

**Plans**: 3 plans

Plans:
- [x] 01-01: 配置 Orchestrator Agent（config.json + state 目录结构）
- [x] 01-02: 单 Agent DevOps 任务验证（3 个任务，准确率测量）
- [x] 01-03: 单 Agent Content Studio 任务验证（3 个任务，准确率测量）

---

### Phase 2: 双团队扩展

**Goal**: 将 DevOps 和 Content Studio 拆分为独立团队，建立版本同步协议

**Depends on**: Phase 1 (准确率验证通过)

**Requirements**: [REQ-06, REQ-07]

**Success Criteria** (what must be TRUE):
  1. DevOps 团队可独立运行
  2. Content Studio 团队可独立运行
  3. tmux 会话结构建立
  4. 版本同步检查点协议工作正常

**Plans**: TBD

---

### Phase 3: 优化与扩展

**Goal**: 根据 Phase 2 经验优化团队协作，扩展技能库

**Depends on**: Phase 2

**Requirements**: [REQ-08]

**Success Criteria** (what must be TRUE):
  1. 团队间协调开销可接受
  2. 技能库根据需要扩展

**Plans**: TBD

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. 单 Agent 验证 | 0/3 | Not started | - |
| 2. 双团队扩展 | 0/TBD | Not started | - |
| 3. 优化与扩展 | 0/TBD | Not started | - |

---

*Roadmap created: 2026-04-09*
*Source: docs/superpowers/specs/2026-04-09-wag-ai-native-team-design.md*
