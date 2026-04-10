# WAG AI Native — Roadmap

> Winning Adventure Global — AI Agent Team 架构重构路线图
> 创建：2026-04-09
> 基于：docs/superpowers/specs/2026-04-09-wag-ai-native-team-design.md

---

## Phase 1：单 Agent 验证

**目标：** 验证 Orchestrator Agent 在单 Agent 模式下完成 DevOps 和 Content Studio 任务的准确率

**阶段目标：**
配置 Orchestrator Agent，建立外部状态存储，在单 Agent 模式下验证 DevOps 任务和 Content Studio 任务，测量准确率是否达到 45% 阈值

**成功标准：**
- Orchestrator Agent 可正常运行
- 外部状态存储（`~/.claude/teams/wag-ai/state/`）可读写
- 单 Agent 完成至少 3 个 DevOps 任务并达到 45% 准确率
- 单 Agent 完成至少 3 个 Content Studio 任务并达到 45% 准确率

**Canonical refs：**
- `docs/superpowers/specs/2026-04-09-wag-ai-native-team-design.md` — 完整架构设计文档

**Phase 1 交付物：**
- [ ] Orchestrator Agent 配置完成（`.claude/teams/wag-ai/config.json`）
- [ ] 外部状态存储目录结构建立（`~/.claude/teams/wag-ai/state/`）
- [ ] 外部状态存储协议实现（每小时检查点 + 关键任务后保存）
- [ ] 单 Agent DevOps 任务验证（3 个任务，准确率测量）
- [ ] 单 Agent Content Studio 任务验证（3 个任务，准确率测量）
- [ ] Phase 1 验证报告（准确率数据，是否进入 Phase 2）

**Out of scope（Phase 2+）：**
- 多团队拆分（DevOps / Content Studio 分离）
- tmux 会话结构
- 版本同步协议

---

## Phase 2：双团队扩展（后续）

**目标：** 将 DevOps 和 Content Studio 拆分为独立团队，建立版本同步协议

**Phase 2 交付物：**
- [ ] DevOps 团队拆分
- [ ] Content Studio 团队拆分
- [ ] tmux 会话结构
- [ ] 版本同步检查点协议

**Out of scope：**
- 新团队添加
- 技能库扩展

---

## Phase 3：优化与扩展（后续）

**目标：** 根据需要添加新团队，优化检查点频率，扩展技能库

**Out of scope：**
- 特定扩展需求（待 Phase 2 完成后定义）

---

*Roadmap created from: docs/superpowers/specs/2026-04-09-wag-ai-native-team-design.md*
