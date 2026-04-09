# Phase 1: 单 Agent 验证 - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning
**Source:** PRD Express Path (docs/superpowers/specs/2026-04-09-wag-ai-native-team-design.md)

<domain>
## Phase Boundary

验证 Orchestrator Agent 在单 Agent 模式下完成 DevOps 和 Content Studio 任务的准确率达到 45% 阈值。Phase 1 是起步验证阶段，核心目标是建立基础设施（配置 + 状态存储），然后用 6 个任务（3 DevOps + 3 Content Studio）测量单 Agent 准确率。

</domain>

<decisions>
## Implementation Decisions

### 架构模式
- **D-01:** 单 Agent 起步 — 不立即使用多团队架构，先验证单 Agent 能力
- **D-02:** 集中式 Orchestrator — Orchestrator 是唯一决策点，不使用分布式 Agents
- **D-03:** 外部状态存储 — 使用文件系统（`~/.claude/teams/wag-ai/state/`）而非 Agent 上下文持久化状态

### 检查点协议
- **D-04:** 检查点频率 — 每小时自动保存 + 关键任务完成后立即保存
- **D-05:** 状态包含字段 — `currentTask`、`progress`、`errors`、`nextSteps`

### 准确率测量
- **D-06:** 成功标准 — 完成任务数 / 总任务数 >= 45% 才进入 Phase 2
- **D-07:** 测量方法 — 每个任务记录：意图理解、执行动作、输出结果、评分

### Claude's Discretion
- Claude 可决定具体使用哪些 DevOps 任务和 Content Studio 任务进行验证
- Claude 可决定状态文件的 JSON schema 细节
- Claude 可决定准确率报告的格式

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### AI Native 架构
- `docs/superpowers/specs/2026-04-09-wag-ai-native-team-design.md` — 完整架构设计文档（Section 1-3 定义 Phase 1 范围）

### Claude Code Agent Teams
- Claude Code Agent Teams Documentation — 已知限制：in-process teammates、无会话恢复、固定 Lead

### WAG 项目
- `CLAUDE.md` — 项目技术栈（Next.js, TypeScript, Tailwind CSS, Vercel）
- `.planning/REQUIREMENTS.md` — Phase 1 需求（REQ-01 到 REQ-05）

</canonical_refs>

<specifics>
## Specific Ideas

### 外部状态存储目录
- `~/.claude/teams/wag-ai/` — 根目录
- `~/.claude/teams/wag-ai/state/` — 状态存储目录
- `~/.claude/teams/wag-ai/state/orchestrator.json` — Orchestrator 状态

### DevOps 任务类型（Phase 1 验证用）
1. 代码修改 — 修改现有组件样式
2. 构建验证 — 运行 `npm run build`
3. 部署触发 — `git push` 到 master

### Content Studio 任务类型（Phase 1 验证用）
1. 内容生成 — 生成 LinkedIn post 草稿
2. 图片生成 prompt — 为文章生成 AI 生图 prompt
3. 发布预览 — 生成 HTML 预览

### 准确率阈值
- 45% 阈值来自 Google DeepMind + MIT (2025) 研究
- 单 Agent 准确率 > 45% 后，多团队反而降低性能

</specifics>

<deferred>
## Deferred Ideas

### Phase 2+ 才会考虑
- tmux 会话结构（Phase 2）
- DevOps / Content Studio 团队分离（Phase 2）
- 版本同步协议（Phase 2）
- 技能库扩展（Phase 3）

### 设计文档中明确排除
- 多 Agent 并行运行（当前研究显示单 Agent 更优）
- 嵌套团队结构（Claude Code Agent Teams 不支持）

</deferred>

---

*Phase: 01-agent*
*Context gathered: 2026-04-09 via PRD Express Path*
