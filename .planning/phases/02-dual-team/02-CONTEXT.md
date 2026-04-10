# Phase 2: 双团队扩展 - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

将 DevOps 和 Content Studio 拆分为独立团队，建立版本同步协议。Phase 2 在 Phase 1 验证单 Agent 准确率达标后执行，核心是将 Orchestrator 从单 Agent 模式扩展为多团队协调模式。

</domain>

<decisions>
## Implementation Decisions

### 团队拆分边界

- **D-01:** 混合协调模式 — Orchestrator 分配高层面任务，团队自主拆解子任务
- **D-02:** 严格分工 — DevOps 负责所有代码修改，Content Studio 只负责内容生成，不跨边界

### tmux 会话结构

- **D-03:** 按需创建/销毁 — 每个任务创建新会话，完成后销毁（Phase 1 约束：按需启动，不用时关闭）
- **D-04:** Orchestrator 保存完整检查点 — 销毁前 Orchestrator 保存团队完整状态，团队自主管理内部细节
- **D-05:** 会话命名格式 — `wag-ai-{team}-{timestamp}`（如 `wag-ai-devops-1712345678`），唯一且可追溯
- **D-06:** Agent 提交任务后 tmux 后台运行 — Agent 提交任务到 tmux 后台执行，可继续处理其他事
- **D-07:** 标准多窗口结构 — DevOps: frontend/backend/monitoring，Content Studio: content/images/publishing

### 版本同步协议

- **D-08:** Orchestrator 中转同步 — DevOps 部署完成后通知 Orchestrator，Orchestrator 再通知 Content Studio
- **D-09:** DevOps 验证后才可用 — 新版本部署后，Content Studio 的内容必须重新验证才可用于生产
- **D-10:** 冲突时自动作废 — 检测到版本差异后自动作废旧内容，通知 Content Studio 重新生成

### 团队通信机制

- **D-11:** 信息传递内容 — DevOps 传递版本号 + 变更摘要（`{version, changelog, timestamp}`）
- **D-12:** Content Studio 完成通知 — Content Studio 在自己的 state 文件中写 `completed_tasks`，Orchestrator 轮询读取
- **D-13:** 状态文件作为契约 — 所有团队通过约定路径的 state 文件交换信息，Orchestrator 管理契约

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### AI Native 架构
- `docs/superpowers/specs/2026-04-09-wag-ai-native-team-design.md` — 完整架构设计（Section 2.2 定义团队职责，Section 4 定义 tmux 结构）

### Phase 1 Context
- `.planning/phases/01-agent/01-CONTEXT.md` — Phase 1 已建立的基础：外部状态存储路径、Orchestrator 集中式决策、检查点协议

### WAG 项目
- `CLAUDE.md` — 项目技术栈（Next.js, TypeScript, Tailwind CSS, Vercel）
- `.planning/REQUIREMENTS.md` — REQ-06、REQ-07 定义 Phase 2 需求

</canonical_refs>

<code_context>
## Existing Code Insights

### Phase 1 已建立的结构（可复用）
- 状态存储目录：`~/.claude/teams/wag-ai/state/`
- 状态文件格式：JSON（字段：currentTask, progress, errors, nextSteps）
- 检查点频率：每小时 + 关键任务后

### 需要新建的结构
- 团队会话目录：`~/.claude/teams/wag-ai/sessions/`
- 团队 private 状态：`~/.claude/teams/wag-ai/state/devops.json`, `content-studio.json`
- 版本同步标记文件：待定义路径

</code_context>

<deferred>
## Deferred Ideas

None — all discussed items are within Phase 2 scope.

</deferred>

---

*Phase: 02-dual-team*
*Context gathered: 2026-04-09*
