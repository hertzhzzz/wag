# WAG AI Native 重构设计方案

> Winning Adventure Global — AI Agent Team 架构设计
> 日期：2026-04-09
> 版本：v1.0

---

## 1. 背景与目标

### 1.1 项目背景

WAG（Winning Adventure Global）是一家帮助澳大利亚企业连接中国工厂的服务公司。当前项目是一个 Next.js 前端网站，托管于 Vercel。

**现有工具：**
- baoyu-skills（13K+ stars）：内容生成、图片生成、工具技能库
- Claude Code：主力 AI 编程助手

**目标：**
将 WAG 项目重构为 AI Native 项目，使用 Claude Code Agent Team 编排多个专业团队。

### 1.2 设计约束（来自用户回答）

| 约束 | 选择 |
|------|------|
| 协作模式 | 实时协作 |
| 运行模式 | 按需启动（不用时关闭） |
| 持久化需求 | 完整工作状态持久化 |
| 交互方式 | 主控台交互（一个主会话发号施令） |
| 成本态度 | 高预算无限制（质量优先） |
| 技能扩展 | 有上限（每团队最多10个核心技能） |

### 1.3 扩展策略

- 阶段式扩展：先验证单 Agent 能力，再逐步扩展到多团队
- 外部状态存储：不依赖 Agent 上下文限制

---

## 2. 架构设计

### 2.1 两阶段扩展方案

#### 第一阶段：单 Agent 验证（当前）

```
[主控台 - Mark]
      ↓
[Orchestrator Agent]
      ↓ 单Agent运行
[验证准确率 > 45% 后进入第二阶段]
```

#### 第二阶段：双团队扩展

```
[主控台 - Mark]
      ↓
[Orchestrator Agent] ← 外部状态存储（文件）
      ↓ 严格的版本同步检查点
 ┌────┴────┐
 ↓         ↓
[DevOps]  [Content Studio]
```

**版本同步规则：**
- 内容团队仅基于生产环境验证后的代码/内容生成
- DevOps 每次部署后通知 Content Studio
- 存在强制检查点，未验证不继续

### 2.2 团队职责

| 团队 | 职责 | 最大技能数 |
|------|------|-----------|
| **Orchestrator** | 战略决策、任务调度、质量门禁、意图翻译 | 5 |
| **DevOps** | 网站开发、技术运维、CI/CD、API 集成、测试 | 10 |
| **Content Studio** | 内容创作、图片生成、社交媒体发布、SEO 优化 | 10 |

### 2.3 工具映射

#### DevOps 团队工具栈

| 技能 | 用途 |
|------|------|
| Next.js | 网站框架 |
| TypeScript | 开发语言 |
| Tailwind CSS | 样式系统 |
| Vercel | 部署平台 |
| GitHub | 版本控制 |
| Jest/Playwright | 测试 |
| Nodemailer | 邮件服务 |
| Upstash Redis | 限流 |
| Zod | 验证 |
| (预留2个) | 扩展槽位 |

#### Content Studio 团队工具栈

| 技能 | 用途 |
|------|------|
| baoyu-post-to-x | X (Twitter) 发布 |
| baoyu-post-to-wechat | 微信公众号发布 |
| baoyu-post-to-weibo | 微博发布 |
| baoyu-imagine | AI 图片生成 |
| baoyu-xhs-images | 小红书图片生成 |
| baoyu-comic | 漫画生成 |
| baoyu-url-to-markdown | 内容采集 |
| baoyu-youtube-transcript | 视频转录 |
| (预留2个) | 扩展槽位 |

#### Orchestrator 团队工具栈

| 技能 | 用途 |
|------|------|
| Task Management | 任务创建、分配、追踪 |
| State Manager | 状态持久化、检查点 |
| Quality Gate | 质量门禁验证 |
| Team Coordinator | 团队间协调 |
| (预留1个) | 扩展槽位 |

---

## 3. 持久化架构

### 3.1 目录结构

```
~/.claude/teams/wag-ai/
├── config.json              # Agent Team 配置（Claude Code 自动管理）
├── state/                  # 外部状态（核心：不依赖 Agent 上下文）
│   ├── orchestrator.json   # 指挥官状态快照
│   ├── devops.json         # DevOps 检查点
│   └── content-studio.json # Content Studio 检查点
├── memory/                 # 长期记忆
│   ├── shared/             # 跨团队共享上下文
│   ├── devops/            # DevOps 专属记忆
│   └── content-studio/    # Content Studio 专属记忆
├── checkpoints/            # 定期检查点（每小时）
│   └── YYYY-MM-DD-HHMM.json
└── skills/                # 团队专属技能定义
    ├── orchestrator/
    ├── devops/
    └── content-studio/
```

### 3.2 状态持久化协议

**检查点频率：** 每小时自动保存，或在关键任务完成后保存

**状态包含：**
- 当前进行中的任务及进度
- 最近生成的内容/代码摘要
- 错误和警告记录
- 下一步行动计划

**恢复流程：**
1. 启动时读取 `state/*.json`
2. 恢复各团队最后状态
3. 从检查点继续工作

---

## 4. tmux 会话结构

### 4.1 会话布局

```bash
wag-ai/
├── orchestrator     # 主控制会话
├── devops          # DevOps 团队会话
│   ├── frontend    # 前端开发窗口
│   ├── backend     # 后端/基础设施窗口
│   └── monitoring  # 监控窗口
└── content-studio  # Content Studio 团队会话
    ├── content     # 内容创作窗口
    ├── images      # 图片生成窗口
    └── publishing  # 发布窗口
```

### 4.2 启动/关闭协议

**启动流程：**
1. 启动 `wag-ai-master` tmux session
2. 启动 Orchestrator Agent
3. Orchestrator 根据任务需求启动 DevOps / Content Studio
4. 所有团队状态同步到外部存储

**关闭流程：**
1. 各团队输出最终检查点到 `state/`
2. Orchestrator 汇总状态
3. 保存所有检查点
4. 优雅关闭所有 Agent

---

## 5. 研究依据与设计决策

### 5.1 关键研究发现

| 研究 | 来源 | 影响 |
|------|------|------|
| **45% 阈值** | Google DeepMind + MIT (2025) | 单 Agent 准确率 > 45% 后，多团队反而降低性能 → 采用阶段式扩展，先验证单 Agent |
| **错误放大 17.2x** | UC Berkeley MAST 研究 | 独立 Agents 错误放大 17.2x，集中式协调只放大 4.4x → 集中式 Orchestrator |
| **协调税** | Multi-Agent 系统研究 | 每个额外 Agent 增加 41-50% 工作重复 → 阶段式扩展，验证后添加 |
| **7x Token** | Anthropic 工程实践 | Agent Teams 使用 7x token → 用户选择高预算模式 |
| **3-5 最佳** | Claude Code Best Practices | 最佳团队规模 3-5 Agents → 严格控制团队大小 |

### 5.2 设计决策总结

| 决策 | 理由 |
|------|------|
| 单 Agent 起步 | 验证准确率，避免过早复杂化 |
| 外部状态存储 | 解决上下文限制与持久化的矛盾 |
| 技能上限 10 个 | 防止工具税，保持系统稳定 |
| 版本同步检查点 | 防止错误级联扩散 |
| 阶段式扩展 | 管理协调税，按需增长 |

---

## 6. 风险与缓解

| 风险 | 缓解措施 |
|------|----------|
| 错误级联扩散 | 强制检查点，内容基于验证后代码 |
| 上下文溢出 | 外部状态存储，定期检查点 |
| 协调税过高 | 阶段式扩展，验证后添加 |
| 工具复杂度 | 每团队 10 个技能上限 |
| 团队失控 | 主控台主动监控，定期 check-in |

---

## 7. 实施路线图

### Phase 1：单 Agent 验证（当前）
- [ ] 配置 Orchestrator Agent
- [ ] 建立外部状态存储
- [ ] 验证 DevOps 任务（单 Agent 模式）
- [ ] 验证 Content Studio 任务（单 Agent 模式）
- [ ] 测量准确率是否 > 45%

### Phase 2：双团队扩展
- [ ] 拆分 DevOps 和 Content Studio
- [ ] 实现 tmux 会话结构
- [ ] 建立版本同步协议
- [ ] 验证协调开销可接受

### Phase 3：优化与扩展
- [ ] 根据需要添加新团队
- [ ] 优化检查点频率
- [ ] 扩展技能库（每团队最多 10 个）

---

## 8. 附录

### 8.1 Claude Code Agent Teams 已知限制

- 无会话恢复（in-process teammates）
- 任务状态可能延迟
- 关闭较慢
- 一次只能管理一个团队
- 不支持嵌套团队
- 固定 Lead（创建者永为 Lead）

### 8.2 参考资料

- Claude Code Agent Teams Documentation
- Google DeepMind: "Towards a Science of Scaling Agent Systems" (2025)
- UC Berkeley MAST: "Why Do Multi-Agent LLM Systems Fail?" (NeurIPS 2025)
- Anthropic Engineering Blog: C Compiler Project (Feb 2026)

---

*本文档基于 2026 年 2-4 月最新研究编写*
