# WAG AI Native — Requirements

> Phase 1 需求文档（基于设计文档）

---

## REQ-01：Orchestrator Agent 配置

Orchestrator Agent 必须能够：
- 读取外部状态文件（`~/.claude/teams/wag-ai/state/*.json`）
- 写入检查点到外部存储
- 调用 Claude Code Agent Teams API

## REQ-02：外部状态存储

外部状态存储必须：
- 目录：`~/.claude/teams/wag-ai/state/`
- 状态文件格式：JSON
- 包含字段：当前任务、进度、错误记录、下一步计划
- 检查点频率：每小时 + 关键任务完成后

## REQ-03：准确率测量

必须记录并报告：
- 每个任务的完成状态（成功/失败/部分成功）
- 准确率计算：(成功完成任务数 / 总任务数) × 100%
- 45% 阈值判断

## REQ-04：DevOps 任务验证

单 Agent 必须能完成以下 DevOps 任务：
- 任务类型：代码修改、构建验证、部署触发
- 每个任务需记录：意图理解、执行动作、输出结果、准确率评分

## REQ-05：Content Studio 任务验证

单 Agent 必须能完成以下 Content Studio 任务：
- 任务类型：内容生成、图片生成 prompt、发布预览
- 每个任务需记录：意图理解、执行动作、输出结果、准确率评分

---

*Requirements derived from: docs/superpowers/specs/2026-04-09-wag-ai-native-team-design.md § Phase 1*
