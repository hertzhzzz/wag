# 项目迁移计划：andrej-karpathy-skills → Hermes Skill

## 1. 目标

将 `forrestchang/andrej-karpathy-skills` 项目从 Claude Code 插件格式迁移为 Hermes Skill，在 Hermes Agent 中可用，并可直接复现运行。

---

## 2. 原项目分析

### 2.1 项目结构

```
forrestchang/andrej-karpathy-skills/
├── CLAUDE.md                              # 核心指南内容（12KB，纯 Markdown）
├── README.md                              # 说明文档
├── .claude-plugin/
│   ├── marketplace.json                   # Claude Code 插件市场配置
│   └── plugin.json                        # Claude Code 插件清单（含 skills 字段）
└── skills/
    └── karpathy-guidelines/
        └── SKILL.md                       # playbooks.com 格式的 Skill（含 frontmatter）
```

### 2.2 核心功能

项目**只有一个功能**：提供一套 LLM 编码行为准则，来自 Andrej Karpathy 对 LLM 编程缺点的观察。

四大原则：
1. **Think Before Coding** — 不要假设，主动暴露疑点
2. **Simplicity First** — 最小代码，不做投机性功能
3. **Surgical Changes** — 精准编辑，只改必要的代码
4. **Goal-Driven Execution** — 定义可验证的成功标准

### 2.3 依赖与运行方式

- **零依赖**：纯 Markdown 文本文件，无 npm 包、无 Python 库
- **Claude Code 插件方式**：通过 `/plugin marketplace add` + `/plugin install` 安装
- **SKILL.md 方式**：playbooks.com 的 skill 格式（含 YAML frontmatter）

---

## 3. Hermes Skill 格式规范

### 3.1 Hermes Skill 结构

```
~/.hermes/skills/<category>/<name>/SKILL.md
```

**必须包含 YAML frontmatter：**
```yaml
---
name: <skill-name>           # 唯一标识，lowercase, hyphens
description: <description>   # 一行描述
version: X.Y.Z
author: <author>
license: MIT
metadata:
  hermes:
    tags: [tag1, tag2]
    related_skills: [skill-name]
---
# Skill 内容（Markdown 正文）
```

### 3.2 Hermes 技能调用方式

- 在对话中加载：`/skill <name>` 或 `skill_view(name)`
- 启动时预加载：`hermes --skills skill1,skill2`
- 定时任务中加载：`cronjob` 的 `skills` 参数

---

## 4. 迁移方案

### 4.1 转换策略

| 原项目组件 | 处理方式 | 原因 |
|-----------|---------|------|
| `CLAUDE.md` 内容 | 改写为 SKILL.md body | 内容保留，格式转换 |
| `.claude-plugin/marketplace.json` | 丢弃 | Hermes 不使用此格式 |
| `.claude-plugin/plugin.json` | 丢弃 | Hermes 不使用此格式 |
| `skills/karpathy-guidelines/SKILL.md` | 参考 | 有部分 frontmatter，但不符合 Hermes 完整规范 |

### 4.2 目录结构（迁移后）

```
~/.hermes/skills/software-development/karpathy-coding-guidelines/SKILL.md
```

**为什么不放在根目录？**  
Hermes skills 遵循分类组织，`software-development` 是最合适的分类，行为准则是开发方法论，不是独立工具。

---

## 5. 详细实施步骤

### 步骤 1：创建 SKILL.md 文件

在 `~/.hermes/skills/software-development/karpathy-coding-guidelines/SKILL.md` 创建文件，内容如下：

```yaml
---
name: karpathy-coding-guidelines
description: LLM 编码行为准则 — 来自 Andrej Karpathy 的观察。四大原则：先思考、最简代码、精准修改、目标驱动。用于写代码、审查或重构时避免过度复杂化。
version: 1.0.0
author: forrestchang (Hermes port: Hermes Agent)
license: MIT
metadata:
  hermes:
    tags: [coding-guidelines, best-practices, software-development, karpathy]
    related_skills: [systematic-debugging, test-driven-development, writing-plans]
---

# Karpathy Coding Guidelines

LLM 编码行为准则，源自 Andrej Karpathy 对 LLM 编程缺点的观察。

**权衡：** 这些准则偏向谨慎而非速度。简单任务（改错字、明显的一行代码）请自行判断。

## 1. Think Before Coding

**不要假设。不要隐藏困惑。暴露权衡。**

实现之前：
- 明确陈述你的假设。不确定就问。
- 存在多个解释时，列出它们——不要沉默地选一个。
- 存在更简单方案时，说出来。有理由反对时就反对。
- 有不清楚的地方就停下来。说出困惑点。问。

## 2. Simplicity First

**最小代码解决问题。不做投机性功能。**

- 不做超出要求的功能。
- 不为一次性代码创建抽象。
- 不加没要求的"灵活性"或"可配置性"。
- 不处理不可能发生的错误场景。
- 写 200 行能改成 50 行时，重写。

自问："高级工程师会觉得这过度复杂吗？"如果会，简化。

## 3. Surgical Changes

**只碰必须碰的。只清理自己的烂摊子。**

编辑现有代码时：
- 不要"改进"相邻代码、注释或格式。
- 不要重构没坏的东西。
- 匹配现有风格，即使你会有不同做法。
- 发现无关死代码时，提出来——不要删。

你的修改产生孤立代码时：
- 删除你的修改导致不再使用的 import/变量/函数。
- 除非被要求，不要删除原本就有的死代码。

验证：每一行修改都应该能直接追溯到用户请求。

## 4. Goal-Driven Execution

**定义成功标准。循环直到验证通过。**

将任务转化为可验证的目标：
- "加验证" → "为无效输入写测试，然后让它们通过"
- "修 bug" → "写能复现它的测试，然后让测试通过"
- "重构 X" → "确保重构前后测试都通过"

多步骤任务，陈述简要计划：
```
1. [步骤] → verify: [检查方式]
2. [步骤] → verify: [检查方式]
3. [步骤] → verify: [检查方式]
```

强的成功标准让你能独立循环。弱的标准（"让它能用"）需要不断澄清。

---

## 使用场景

- 写代码时需求模糊
- 审查或重构现有代码
- 必须保守和可验证的自动化编码任务
- 为报告的 bug 创建测试或复现

## 验证方式

准则在起作用时的表现：
- PR diff 更少不必要变更——只有请求的变更
- 减少因过度复杂化而重写的情况——代码第一次就简洁
- 澄清问题出现在实现之前——而不是出错之后
- 干净、最小的变更——没有顺便重构或"改进"
```

### 步骤 2：验证 Hermes 可识别该 Skill

```bash
hermes skills list
# 或
hermes skills inspect software-development/karpathy-coding-guidelines
```

### 步骤 3：在对话中加载使用

```
/skill karpathy-coding-guidelines
```

或在 cronjob 中使用：
```python
cronjob(action='create', prompt='帮我审查 ~/Projects/myapp/src/auth.py 的安全性', skills=['karpathy-coding-guidelines'])
```

---

## 6. 关键代码片段汇总

### 6.1 SKILL.md frontmatter 模板

```yaml
---
name: <skill-name>
description: <one-line description>
version: X.Y.Z
author: <author>
license: MIT
metadata:
  hermes:
    tags: [<tags>]
    related_skills: [<related-skill-names>]
---
```

### 6.2 启动时预加载 Skill

```bash
hermes --skills karpathy-coding-guidelines
```

### 6.3 cronjob 中使用

```python
cronjob(action='create', prompt='审查代码...', skills=['karpathy-coding-guidelines'])
```

---

## 7. 不兼容 / 无法迁移的部分

| 部分 | 问题 | 替代方案 |
|------|------|---------|
| `.claude-plugin/marketplace.json` | Hermes 无插件市场机制 | 无需迁移，Hermes 用 `hermes skills install` 或直接放 `~/.hermes/skills/` |
| `.claude-plugin/plugin.json` | Hermes 无 plugin.json 格式 | 无需迁移，SKILL.md 就是 Hermes 的"插件"格式 |
| Claude Code `/plugin` 命令 | Hermes 不支持 | 改用 `hermes skills install` 或手动复制 SKILL.md |
| 原始 `CLAUDE.md` | Hermes 不会自动读取 CLAUDE.md | 已将内容合并进 SKILL.md |
| playbooks.com 的 SKILL.md 格式 | 部分 frontmatter 缺失 `metadata.hermes` | 重新编写完整的 Hermes 格式 frontmatter |

---

## 8. 安装与运行完整步骤

### 8.1 安装（手动方式）

```bash
# 1. 创建目录
mkdir -p ~/.hermes/skills/software-development/karpathy-coding-guidelines

# 2. 写入 SKILL.md（内容见步骤1）

# 3. 验证安装
hermes skills list | grep karpathy
```

### 8.2 安装（Git 克隆方式）

```bash
# 克隆到临时目录
git clone https://github.com/forrestchang/andrej-karpathy-skills /tmp/karpathy-skills

# 复制 CLAUDE.md 内容，手动添加 Hermes frontmatter（内容见步骤1）
cp /tmp/karpathy-skills/CLAUDE.md ~/.hermes/skills/software-development/karpathy-coding-guidelines/SKILL.md

# 用正确 frontmatter 替换顶部（参考步骤1的格式）
```

### 8.3 启动加载

```bash
# 方式 A：启动时预加载
hermes --skills karpathy-coding-guidelines

# 方式 B：对话中加载
hermes
# 进入对话后输入：
/skill karpathy-coding-guidelines
```

---

## 9. 风险与注意事项

1. **内容一致性**：CLAUDE.md 的四大原则原样保留，只改变格式，不改变语义
2. **分类选择**：`software-development` 分类合理，但也可考虑 `software-development/writing-plans`（如果只是方法论）或独立 `guidelines` 分类（目前 skills 目录中无此分类）
3. **版本维护**：上游仓库更新时，需要手动同步内容到 SKILL.md
4. **Hermes skill 注册机制**：目前 skills 放在 `~/.hermes/skills/` 即被自动识别，无需额外注册

---

## 10. 验证清单

- [ ] `~/.hermes/skills/software-development/karpathy-coding-guidelines/SKILL.md` 文件存在
- [ ] `hermes skills list` 能看到 `karpathy-coding-guidelines`
- [ ] 对话中执行 `/skill karpathy-coding-guidelines` 成功加载
- [ ] 四大原则内容完整无遗漏
- [ ] frontmatter 格式正确（含 `name`, `description`, `version`, `metadata.hermes.tags`）
