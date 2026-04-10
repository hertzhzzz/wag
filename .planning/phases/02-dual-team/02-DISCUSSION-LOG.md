# Phase 2: 双团队扩展 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-09
**Phase:** 02-dual-team
**Areas discussed:** 团队拆分边界, tmux 会话结构, 版本同步协议, 团队通信机制

---

## 团队拆分边界

| Option | Description | Selected |
|--------|-------------|----------|
| Orchestrator 直接分配 | Orchestrator 创建任务、分配给团队、追踪进度 | |
| 团队自主读取 | 团队从状态文件读取任务列表，自主认领 | |
| **混合模式** | **Orchestrator 分配高层面任务，团队自主拆解子任务** | ✓ |

**User's choice:** 混合模式
**Notes:** 平衡集中控制和团队自主性

| Option | Description | Selected |
|--------|-------------|----------|
| 严格分工 | Content Studio 只生成内容，DevOps 负责所有代码修改 | ✓ |
| Content Studio 可提交小改动 | 内容相关的简单代码改动 Content Studio 直接处理 | |
| 所有代码改动经 DevOps | 即使内容相关也走 DevOps review | |

**User's choice:** 严格分工
**Notes:** 避免职责混乱，保持清晰边界

---

## tmux 会话结构

| Option | Description | Selected |
|--------|-------------|----------|
| Orchestrator 创建并监控 | Orchestrator 创建会话、监控状态、定期 check-in | |
| Orchestrator 只在需要时唤醒 | 会话常驻但空闲，Orchestrator 需要时发送指令唤醒 | |
| **按需创建/销毁** | **每个任务创建新会话，完成后销毁** | ✓ |

**User's choice:** 按需创建/销毁
**Notes:** 符合设计约束：按需启动，不用时关闭

| Option | Description | Selected |
|--------|-------------|----------|
| **Orchestrator 保存完整检查点** | **每次任务前后 Orchestrator 保存完整状态到文件** | ✓ |
| 团队自己保存检查点 | 团队在销毁前自己写检查点到 state/ | |
| 增量同步 | 每次操作后自动增量保存 | |

**User's choice:** Orchestrator 保存完整检查点
**Notes:** 确保状态完整恢复

| Option | Description | Selected |
|--------|-------------|----------|
| wag-ai-{team}-{timestamp} | 如 wag-ai-devops-1712345678 | ✓ |
| wag-ai-{team}-{task-id} | 如 wag-ai-devops-task-042 | |
| wag-ai-{team}-{session-id} | 如 wag-ai-devops-sess-001 | |

**User's choice:** wag-ai-{team}-{timestamp}
**Notes:** 唯一且可追溯

| Option | Description | Selected |
|--------|-------------|----------|
| Agent 连接 tmux 执行命令 | Agent 通过 tmux 发送命令，实时交互 | |
| **Agent 提交任务后 tmux 后台运行** | **Agent 提交任务到 tmux，tmux 后台执行，Agent 做其他事** | ✓ |
| 混合模式 | 交互式任务用 tmux 实时，批处理任务直接执行 | |

**User's choice:** Agent 提交任务后 tmux 后台运行
**Notes:** 提高效率，但调试困难

| Option | Description | Selected |
|--------|-------------|----------|
| 单窗口运行 | 一个会话一个窗口，简化管理 | |
| **标准多窗口** | **devops: frontend/backend/monitoring，content-studio: content/images/publishing** | ✓ |
| 按需动态创建 | 启动时只创建基础窗口，需要时再创建 | |

**User's choice:** 标准多窗口
**Notes:** 保持设计文档的原规划

---

## 版本同步协议

| Option | Description | Selected |
|--------|-------------|----------|
| DevOps 主动通知 | DevOps 部署完成后主动调用事件/写入标记文件触发 Content Studio | |
| Content Studio 轮询检查 | Content Studio 定期检查 DevOps 的部署状态 | |
| **Orchestrator 中转** | **DevOps 通知 Orchestrator，Orchestrator 再通知 Content Studio** | ✓ |

**User's choice:** Orchestrator 中转
**Notes:** 最解耦的方案

| Option | Description | Selected |
|--------|-------------|----------|
| 作废并重新生成 | 检测到版本差异后自动作废旧内容，通知重新生成 | |
| 标记但不阻止 | 内容标记为基于旧版本，但不阻止发布 | |
| **DevOps 验证后才可用** | **新版本部署后，内容必须重新验证才可用于生产** | ✓ |

**User's choice:** DevOps 验证后才可用
**Notes:** 最严格的方案，避免内容代码不一致

---

## 团队通信机制

| Option | Description | Selected |
|--------|-------------|----------|
| **版本号 + 变更摘要** | **DevOps 写：{version, changelog, timestamp}** | ✓ |
| 完整部署报告 | DevOps 写完整部署报告（diff、影响范围） | |
| 只是事件标记 | DevOps 只写一个 deployment_completed 事件 | |

**User's choice:** 版本号 + 变更摘要
**Notes:** 平衡信息量和实用性

| Option | Description | Selected |
|--------|-------------|----------|
| **写入 state 文件** | **Content Studio 在自己的 state 文件中写 completed_tasks** | ✓ |
| 发送消息到 Orchestrator | Content Studio 直接发消息给 Orchestrator | |
| 生成制品 + 标记 | Content Studio 把内容放到约定路径 + 写标记文件 | |

**User's choice:** 写入 state 文件
**Notes:** 解耦的异步通信方式

---

## Deferred Ideas

无 — 所有讨论都在 Phase 2 范围内

