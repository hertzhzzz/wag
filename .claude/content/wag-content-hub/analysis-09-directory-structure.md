# wag-content-hub 文件结构与目录规范分析

**日期**: 2026-04-01
**任务**: #6 - 设计 wag-content-hub 的文件结构与目录规范
**状态**: 分析完成

---

## 一、参考基准分析

### 1.1 现有 Skill 结构模式

通过对 `wag-seo-blog`、`skill-creator`、`everything-claude-code` 的结构分析，提取出以下三种组织范式：

| 范式 | 来源 | 特征 | 适用场景 |
|------|------|------|----------|
| **扁平单文件** | wag-seo-blog | `SKILL.md` + 少量资源 | 单一职责、工具简单的 skill |
| **bundled resources** | skill-creator | `SKILL.md` + `scripts/` + `references/` + `assets/` | 需要脚本、模板、多文档的复杂 skill |
| **子 skill 目录** | everything-claude-code | `SKILL.md` + `skills/` 子目录（144 个子 skill） | 主入口协调多个专项 skill |

### 1.2 关键设计约束

```
约束1: wag-content-hub 是「协调层」而非「执行层」
  → 它不生成内容本身，而是协调子 skill 完成四渠道分发

约束2: 包含数据闭环流程（生成 → 收集 → 分析 → 进化）
  → 需要持久化的数据文件（analytics/、evolution/）

约束3: 需要与现有 wag-linkedin-post、wag-seo-blog 集成
  → 不是复制代码，而是引用/调用

约束4: 遵循 Claude Code skill 加载协议
  → YAML frontmatter + progressive disclosure（三层加载）
```

---

## 二、目录结构设计

### 2.1 完整目录树

```
wag-content-hub/
├── SKILL.md                          # 主入口（协调层总览）
├── MEMORY.md                         # hub 持久化记忆索引
│
├── skills/                           # Hub 子 skill（内聚于 hub，不独立）
│   ├── linkedin-post/
│   │   ├── SKILL.md                  # LinkedIn 帖子模板（引用 wag-linkedin-post）
│   │   └── prompts/
│   │       ├── linkedin-generate.md  # 生成 prompt 模板
│   │       └── linkedin-evaluate.md  # 评估 prompt 模板
│   │
│   ├── x-post/
│   │   ├── SKILL.md                  # X/Twitter 帖子模板
│   │   └── prompts/
│   │       └── x-generate.md
│   │
│   ├── facebook-post/
│   │   ├── SKILL.md                  # Facebook 帖子模板
│   │   └── prompts/
│   │       └── fb-generate.md
│   │
│   ├── seo-blog/
│   │   ├── SKILL.md                  # SEO Blog（引用 wag-seo-blog）
│   │   └── prompts/
│   │       └── blog-generate.md
│   │
│   └── analytics-collector/
│       ├── SKILL.md                  # 数据收集 skill
│       └── scripts/
│           ├── collect-gsc.py        # GSC API 数据收集脚本
│           ├── collect-linkedin.py   # LinkedIn 数据收集脚本
│           └── collect-x.py          # X 数据收集脚本
│
├── workflows/                        # 工作流编排
│   ├── daily-publish.yaml            # 每日发布流程
│   ├── weekly-analysis.yaml         # 每周数据分析流程
│   ├── self-evolution.yaml           # 自进化反馈循环流程
│   └── schema.yaml                   # workflow YAML Schema 定义
│
├── analytics/                        # 性能数据存储
│   ├── performance-rules.md          # 核心规则引擎（当前生效规则）
│   ├── content-matrix.md             # 内容矩阵（话题 × 渠道表现）
│   │
│   ├── daily/                        # 每日数据快照
│   │   ├── 2026-03-25.yaml          # 单日各渠道关键指标
│   │   ├── 2026-03-26.yaml
│   │   └── ...
│   │
│   ├── weekly/                       # 每周汇总报告
│   │   ├── 2026-W13.md
│   │   └── ...
│   │
│   └── raw/                          # 原始数据（未经处理的 API 响应）
│       ├── gsc-2026-03-25.json
│       └── linkedin-2026-03-25.json
│
├── evolution/                        # 自进化引擎
│   ├── rule-engine.md                # 规则引擎核心逻辑
│   ├── changelog/                    # 规则变更历史
│   │   ├── 2026-03-25-diff.md        # 单次规则更新的 diff 记录
│   │   └── ...
│   └── experiments/                  # 正在测试的实验性规则
│       ├── experiment-001.md         # 实验描述 + 预期结果 + 验证条件
│       └── ...
│
├── references/                       # 参考文档（按需加载）
│   ├── brand-voice.md                # WAG 品牌调性指南
│   ├── channel-specs.md               # 四渠道平台规范（字数/格式/禁忌）
│   ├── gsc-api-guide.md              # Google Search Console API 使用指南
│   └── integrations.md               # 外部 skill 集成说明
│
└── assets/                           # 输出资源
    └── templates/                     # 内容模板
        ├── hook-templates.md         # Hook 句式模板库
        └── cta-templates.md          # CTA 模板库
```

### 2.2 文件用途说明

| 文件/目录 | 类型 | 用途 | 加载时机 |
|-----------|------|------|----------|
| `SKILL.md` | 协调入口 | 协调层总览、工作流编排、规则引擎调用 | 始终加载（~100 words metadata） |
| `MEMORY.md` | 记忆索引 | 持久化上下文索引（由 hub 自行维护） | 按需 |
| `skills/` | 子 skill | 各渠道生成模板 + analytics collector | 按需调用 |
| `workflows/*.yaml` | 流程定义 | 声明式工作流编排（YAML 驱动） | 按需加载 |
| `analytics/` | 数据存储 | 每日/每周性能数据、RAG 上下文来源 | RAG 注入 |
| `evolution/` | 规则引擎 | 自进化逻辑、规则变更历史 | 规则更新时 |
| `references/` | 参考文档 | 品牌指南、平台规范、API 文档 | 按需读取 |
| `assets/` | 模板资源 | Hook/CTA 模板库 | 内容生成时 |

---

## 三、关键文件 Schema

### 3.1 主入口 SKILL.md Schema

```yaml
---
name: wag-content-hub
description: >
  Winning Adventure Global 内容分发协调中心。管理 LinkedIn/X/Facebook/SEO Blog 四渠道的
  内容生成、数据收集、性能分析和自进化规则引擎。当用户需要：生成分渠道内容、查看内容表现报告、
  运行每日/每周发布流程、分析内容效果趋势、或更新内容策略规则时触发。
triggers:
  - 生成分渠道内容
  - 内容表现报告
  - 每日发布流程
  - 每周分析
  - 内容策略更新
  - 查看内容数据
compatibility:
  tools: [Read, Write, Edit, Bash, Glob, Grep]
  dependencies:
    - wag-linkedin-post   # 已安装，独立 skill
    - wag-seo-blog        # 已安装，独立 skill
    - geo-content         # E-E-A-T 分析
    - geo-technical       # 技术 SEO
---

# wag-content-hub - 内容分发协调中心

## 架构定位

wag-content-hub 是 WAG 内容引擎的**协调层**，而非执行层：

```
用户请求
    │
    ▼
┌─────────────────────────────────────┐
│           wag-content-hub           │
│  (路由 · 编排 · 上下文注入 · 规则执行) │
└─────────────────────────────────────┘
    │           │           │           │
    ▼           ▼           ▼           ▼
linkedin-post  x-post   fb-post    seo-blog
  (wag-*    (sub-skill)(sub-skill) (wag-*)
   已安装)                            已安装)
    │           │           │           │
    ▼           ▼           ▼           ▼
analytics-collector → 数据存储 → 规则引擎 → RAG 上下文
```

## 核心工作流

### 工作流1: 每日内容生成发布
1. 加载 `workflows/daily-publish.yaml`
2. 按配置顺序调用各渠道 sub-skill
3. 注入 `analytics/performance-rules.md` 中的最优规则
4. 输出到对应平台格式

### 工作流2: 每周性能分析
1. 加载 `workflows/weekly-analysis.yaml`
2. 调用 `analytics-collector` 收集本周数据
3. 与 `analytics/weekly/` 历史数据对比
4. 生成 `analytics/weekly/YYYY-WXX.md` 报告
5. 触发 `evolution/rule-engine.md` 评估是否需要规则更新

### 工作流3: 自进化规则更新
1. 当性能指标低于阈值时触发
2. 读取 `evolution/rule-engine.md` 中的分析逻辑
3. 生成规则变更建议
4. 写入 `evolution/changelog/YYYY-MM-DD-diff.md`
5. 更新 `analytics/performance-rules.md`

## 上下文注入机制

在调用子 skill 前，自动将以下数据注入上下文：

1. **performance-rules.md** (analytics/) — 当前最优规则集
2. **content-matrix.md** (analytics/) — 话题 × 渠道表现矩阵
3. **brand-voice.md** (references/) — 品牌调性
4. **channel-specs.md** (references/) — 平台规范

## 数据流

```
生成阶段
  sub-skills 输出 → 发布到平台

收集阶段
  analytics-collector → analytics/raw/*.json

分析阶段
  raw/*.json → 解析 → analytics/daily/*.yaml

进化阶段
  weekly/*.md + rules → evolution/rule-engine.md → performance-rules.md

注入阶段
  performance-rules.md + content-matrix.md → sub-skill 上下文
```

## 与现有 Skills 的集成

| 现有 Skill | 集成方式 | 说明 |
|-----------|---------|------|
| wag-linkedin-post | **引用调用** | hub 生成内容后，调用该 skill 的 prompt 模板渲染 |
| wag-seo-blog | **引用调用** | 同上 |
| geo-content | **MCP 调用** | 内容生成后，用 geo-content 做 E-E-A-T 自检 |
| geo-technical | **MCP 调用** | 博客发布后，用 geo-technical 做技术 SEO 检查 |
```

**加载层级说明**: 主 SKILL.md < 500 行，bundled resources 放在 `references/`、`scripts/`、`assets/` 目录中按需读取。

---

### 3.2 Workflow YAML Schema

**文件**: `workflows/schema.yaml`（定义所有 workflow 的通用结构）

```yaml
# ============================================================
# wag-content-hub Workflow Schema
# 规范 version: 1.0
# ============================================================

workflow:
  # 元数据
  meta:
    name: string              # 工作流名称
    version: string            # 语义版本 e.g. "1.0.0"
    description: string       # 一句话描述
    trigger:                  # 触发条件
      type: enum              # manual | scheduled | event
      schedule?: string       # cron 表达式（scheduled 时必填）
      event?: string          # 事件名称（event 时必填）

  # 阶段定义
  stages:
    - id: string              # 阶段唯一标识
      name: string            # 阶段名称
      description?: string    # 阶段说明
      steps:                  # 步骤列表
        - step: number        # 步骤序号
          name: string        # 步骤名称
          action: enum        # 操作类型
            # 支持的操作类型:
            # - skill:invoke    调用子 skill
            # - script:run      运行脚本
            # - data:collect   数据收集
            # - data:analyze   数据分析
            # - rule:evaluate  规则评估
            # - rule:apply     规则应用
            # - report:generate 生成报告
          target?: string     # 目标资源（skill name / script path / file）
          input?:             # 输入参数
            var_name: value   # 键值对
          output?:            # 输出定义
            var_name: string  # 输出变量名
            dest: string      # 输出目标文件路径
          condition?: string  # 执行条件（Groovy 表达式）
          on_error:          # 错误处理
            action: enum      # continue | abort | fallback
            fallback?: string # 备用步骤

  # 数据依赖
  data_deps:
    - name: string            # 数据依赖名称
      source: string          # 来源（previous_stage.output_var 或 file path）
      target_var: string      # 注入到后续步骤的变量名
      required: boolean       # 是否必需

  # 上下文注入
  context_inject:
    - file: string            # 要注入的文件路径
      when: enum              # 何时注入: before_stages | before_stage_<id>
      as: string              # 注入后的变量名

  # 输出产物
  artifacts:
    - name: string            # 产物名称
      type: enum              # report | data | log
      path: string            # 产出路径
      format: enum            # md | yaml | json | csv
```

**示例: daily-publish.yaml**

```yaml
workflow:
  meta:
    name: daily-publish
    version: "1.0.0"
    description: 每日四渠道内容发布流程
    trigger:
      type: scheduled
      schedule: "0 9 * * 1-5"   # 工作日 9am (Australia ACST)

  stages:
    - id: s1_generate
      name: 内容生成
      steps:
        - step: 1
          name: 话题选择
          action: skill:invoke
          target: skills/linkedin-post
          input:
            mode: topic_selection
            context: $hub_rules
          output:
            topic: selected_topic

        - step: 2
          name: LinkedIn 帖子生成
          action: skill:invoke
          target: wag-linkedin-post
          input:
            topic: $s1_generate.topic
            rules: $hub_rules

        - step: 3
          name: X 帖子生成
          action: skill:invoke
          target: skills/x-post
          input:
            topic: $s1_generate.topic

        - step: 4
          name: Facebook 帖子生成
          action: skill:invoke
          target: skills/facebook-post
          input:
            topic: $s1_generate.topic

        - step: 5
          name: SEO Blog 生成
          action: skill:invoke
          target: wag-seo-blog
          input:
            topic: $s1_generate.topic

    - id: s2_collect
      name: 数据收集（前一日）
      steps:
        - step: 1
          name: GSC 数据收集
          action: script:run
          target: skills/analytics-collector/scripts/collect-gsc.py
          output:
            raw_data: analytics/raw/gsc-$date.yesterday.json

        - step: 2
          name: LinkedIn 数据收集
          action: script:run
          target: skills/analytics-collector/scripts/collect-linkedin.py
          output:
            raw_data: analytics/raw/linkedin-$date.yesterday.json

    - id: s3_qa
      name: 内容质检
      steps:
        - step: 1
          name: E-E-A-T 检查
          action: skill:invoke
          target: geo-content
          input:
            content: $s1_generate.blog_content

  context_inject:
    - file: analytics/performance-rules.md
      when: before_stages
      as: hub_rules

  artifacts:
    - name: daily_report
      type: report
      path: analytics/daily/$date.yesterday.yaml
      format: yaml
```

---

### 3.3 performance-rules.md Schema

**文件**: `analytics/performance-rules.md`

```yaml
---
version: "2026-03-25"
source: "weekly-report-2026-W12"
status: active          # active | draft | archived
---

# WAG 内容性能规则 v2026-03-25

## 当前生效规则

### LinkedIn 规则
| 规则ID | 指标 | 阈值 | 当前值 | 状态 |
|--------|------|------|--------|------|
| LI-ER-01 | Engagement Rate | > 12% | 16.48% | ✅ 达标 |
| LI-C-01 | 评论率 | > 1% | 0.00% | ❌ 需优化 |

**最优实践**:
- Hook 格式: 数字开头 + 痛点 → "3步框架" 表现最佳
- 最佳 ER: 22.58% (2026-03-23, "Before paying any deposit...")
- 避免: 纯文字叙述，无数字锚点

### X 规则
| 规则ID | 指标 | 阈值 | 状态 |
|--------|------|------|------|
| X-IM-01 | 曝光量 | > 500 | ⚠️ 待收集 |

### Facebook 规则
| 规则ID | 指标 | 阈值 | 状态 |
|--------|------|------|------|
| FB-ER-01 | Engagement Rate | > 5% | ⚠️ 待收集 |

### SEO 规则
| 规则ID | 指标 | 阈值 | 当前值 | 状态 |
|--------|------|------|--------|------|
| SEO-CTR-01 | 平均 CTR | > 2% | TBD | ⏳ 待 GSC 配置 |
| SEO-RANK-01 | Top 10 关键词数 | > 5 | TBD | ⏳ 待配置 |

## 生成参数（用于上下文注入）

```json
{
  "linkedin": {
    "hook_style": "数字开头 + 痛点框架",
    "min_paragraphs": 3,
    "max_paragraphs": 5,
    "cta_format": "问题导向 CTA",
    "optimal_length": "150-300 words",
    "emoji_density": "low (每段最多1个)"
  },
  "x": {
    "format": "hook (1-2句) + insight (3-4句) + CTA (1句)",
    "optimal_length": "200-280 chars",
    "hashtag_count": 1-2,
    "thread_preferred": false
  },
  "facebook": {
    "tone": "社区感 + 故事性",
    "optimal_length": "100-200 words",
    "media_preferred": true
  },
  "seo_blog": {
    "min_word_count": 1500,
    "heading_density": "1 H2 per 300 words",
    "internal_links_min": 3,
    "external_links_min": 2
  }
}
```

## 待验证假设

| 假设ID | 描述 | 验证条件 | 状态 |
|--------|------|----------|------|
| H-001 | "3步框架" Hook 普遍优于其他格式 | ER 差值 > 5% across 5 posts | 🔬 实验中 |
| H-002 | LinkedIn 最佳发布时间在工作日 9-11am ACST | engagement > baseline 20% | 🔬 待验证 |
```

---

### 3.4 content-matrix.md Schema

**文件**: `analytics/content-matrix.md`

```yaml
---
last_updated: 2026-03-31
data_range: 2026-03-01 to 2026-03-31
---

# 内容矩阵 - 话题 × 渠道表现

## 矩阵概览

| 话题 | LinkedIn ER | X 曝光 | Facebook ER | SEO CTR | 综合评分 |
|------|------------|--------|-------------|---------|----------|
| 供应商验证 | 16.48% | - | - | - | ★★★★☆ |
| 工厂实地考察 | 22.58% | - | - | - | ★★★★★ |
| ... | | | | | |

## Top 表现内容

### LinkedIn Top 3
1. [2026-03-23] "Before paying any deposit..." — ER: 22.58%
2. [2026-03-18] "[Topic]" — ER: XX.XX%
3. [2026-03-11] "[Topic]" — ER: XX.XX%

## 话题趋势
[按周统计各话题类型的平均 ER 变化趋势]
```

---

### 3.5 evolution/rule-engine.md Schema

**文件**: `evolution/rule-engine.md`

```yaml
---
version: "1.0.0"
last_run: 2026-03-31
auto_apply: false       # true = 自动应用规则变更; false = 人工确认
thresholds:
  er_decline: 0.15      # ER 下降 15% 触发警告
  ctr_threshold: 0.02   # SEO CTR 阈值
---

# 规则引擎 - 自进化核心逻辑

## 触发条件检查

规则评估在以下时机触发：
1. 每周分析报告生成后
2. 单日 ER 下降超过阈值（15%）
3. 手动触发（`/skill wag-content-hub --evolve`）

## 评估算法

### Step 1: 异常检测
```
对每个渠道，计算：
- ER_avg_last_7d vs ER_avg_last_30d
- 若 ER_last_7d < ER_avg * 0.85 → 触发规则审查
```

### Step 2: 根因分析
```
若触发审查：
1. 对比高 ER 帖子 vs 低 ER 帖子的 Hook 格式
2. 对比不同发布时间段的平均 ER
3. 对比不同话题类型的 ER
4. 输出: 可能是哪个变量导致性能下降
```

### Step 3: 规则变更建议
```
根据根因分析，生成以下格式的建议：
## 规则变更建议 #N

### 变更类型
[ADD | MODIFY | DEPRECATE | SPLIT]

### 影响的规则
RULE_ID: [当前规则描述]

### 建议变更
[具体变更内容]

### 预期影响
[量化预期效果]

### 验证方案
[如何验证变更有效]
```

### Step 4: 应用变更
- 写入 `evolution/changelog/YYYY-MM-DD-diff.md`
- 若 `auto_apply: true`：自动更新 `analytics/performance-rules.md`
- 若 `auto_apply: false`：人工确认后更新

## 规则变更历史索引

| 日期 | 变更摘要 | 变更ID | 状态 |
|------|---------|--------|------|
| 2026-03-25 | 初始规则集建立 | baseline-v1 | ✅ 已应用 |
```

---

## 四、与现有 Skills 的集成方案

### 4.1 集成架构

```
wag-content-hub (协调层)
    │
    ├── 调用 wag-linkedin-post (独立 skill，已安装)
    │     └─ SKILL.md 位于: ~/.claude/skills/wag-linkedin-post/
    │
    ├── 调用 wag-seo-blog (独立 skill，已安装)
    │     └─ SKILL.md 位于: ~/.claude/skills/wag-seo-blog/
    │
    ├── 调用 geo-content (MCP agent)
    │     └─ 通过 MCP tools 访问
    │
    ├── 调用 geo-technical (MCP agent)
    │     └─ 通过 MCP tools 访问
    │
    └── 管理 skills/x-post, skills/facebook-post, skills/analytics-collector
          (内聚于 hub，不独立发布)
```

### 4.2 集成方式选择

| 子模块 | 集成方式 | 理由 |
|--------|---------|------|
| linkedin-post | **引用独立 skill** | 已有完整实现，hub 只需注入上下文 |
| seo-blog | **引用独立 skill** | 同上 |
| x-post | **hub 子 skill** | 尚不存在，且可能需要与 hub 紧耦合 |
| facebook-post | **hub 子 skill** | 尚不存在，且 WAG 特定格式需求 |
| analytics-collector | **hub 子 skill + scripts** | 包含可执行脚本，与 hub 紧耦合 |

### 4.3 上下文注入协议

当 hub 调用 `wag-linkedin-post` 时，注入以下上下文：

```markdown
## WAG Content Hub 上下文

### 当前性能规则（来自 analytics/performance-rules.md）
[规则内容自动注入]

### 话题优先级（来自 analytics/content-matrix.md）
[矩阵数据自动注入]

### 品牌调性（来自 references/brand-voice.md）
- 公司: Winning Adventure Global (Adelaide, Australia)
- 受众: Australian SME owners, importers, procurement managers
- 调性: Practical, direct, experienced, credible — not salesy
- 话题: China factory tours, supplier verification, sourcing guidance

### 平台规范（来自 references/channel-specs.md）
- LinkedIn: 150-300 words, hook + body + CTA, low emoji
```

### 4.4 冲突解决

**场景**: hub 注入的规则与子 skill 原有指令冲突

解决原则：
1. **hub 注入的规则优先于子 skill 默认参数**
2. **子 skill 的强制规则（如 wag-seo-blog 的 slug 格式）不可覆盖**
3. **所有覆盖行为记录在 `evolution/changelog/` 中**

---

## 五、Sub-Skill 组织方式决策

### 5.1 决策: skills/ 目录 vs 独立目录

**结论**: 采用 **skills/ 子目录** 方式，理由如下：

| 考量因素 | skills/ 子目录 | 独立目录 |
|---------|--------------|---------|
| 可独立调用 | ❌ 只能通过 hub 调用 | ✅ 可被其他系统调用 |
| 部署粒度 | 与 hub 绑定发布 | 可独立发布更新 |
| Claude Code 可见性 | 在 hub 内部 | 可通过 `/skill x-post` 直接调用 |
| 维护成本 | 低（单一仓库） | 高（多仓库/多路径） |
| 适用性 | hub 强依赖的子模块 | 可复用的通用能力 |

**例外**: `wag-linkedin-post` 和 `wag-seo-blog` 已是独立 skill，不移动，继续引用。

### 5.2 Sub-Skill 命名空间

```
wag-content-hub skills/  下的子 skill 使用简短名称：
  linkedin-post/   (而非 wag-content-hub-linkedin-post/)
  x-post/           (而非 wag-content-hub-x-post/)
  facebook-post/   (而非 wag-content-hub-facebook-post/)
  analytics-collector/  (而非 wag-content-hub-analytics/)

原因: 命名空间由父级 SKILL.md 提供，调用时通过 hub 调用链
```

---

## 六、Analytics 数据文件命名规范

### 6.1 命名规则

```
analytics/
├── daily/
│   └── {date}.yaml              # 格式: YYYY-MM-DD.yaml
├── weekly/
│   └── {year}-W{week}.md         # 格式: 2026-W13.md
├── raw/
│   ├── gsc-{date}.json           # 格式: gsc-YYYY-MM-DD.json
│   ├── linkedin-{date}.json      # 格式: linkedin-YYYY-MM-DD.json
│   ├── x-{date}.json             # 格式: x-YYYY-MM-DD.json
│   └── facebook-{date}.json      # 格式: facebook-YYYY-MM-DD.json
└── performance-rules.md           # 主规则文件（含版本历史）
    └── content-matrix.md         # 矩阵文件
```

### 6.2 daily/*.yaml 结构

```yaml
---
date: 2026-03-25
source: analytics-collector
channels:
  linkedin:
    impressions: number
    clicks: number
    engagement_rate: number       # 计算字段
    reactions: number
    comments: number
    shares: number
  x:
    impressions: number
    engagements: number
    retweets: number
  facebook:
    impressions: number
    engagements: number
    shares: number
  seo:
    clicks: number
    impressions: number
    ctr: number
    top_keywords: number
---

# 计算的 Engagement Rate
engagement_rate: (reactions + comments + shares) / impressions * 100
```

---

## 七、Evolution 文件格式

### 7.1 changelog/{date}-diff.md 结构

```markdown
---
date: 2026-03-25
change_id: diff-2026-03-25-001
triggered_by: weekly-analysis / manual
status: proposed / approved / applied
---

## 规则变更 #diff-2026-03-25-001

### 变更摘要
[一句话描述]

### 变更详情
```diff
- 旧规则描述
+ 新规则描述
```

### 根因分析
[为什么会建议这个变更]

### 预期影响
- ER 预期变化: +X%
- 影响的话题: [列表]
- 风险: [描述]

### 验证条件
[如何判断变更有效]

### 人工审批
- [ ] 批准
- [ ] 拒绝
- 审批人: __________
- 审批日期: __________
```

### 7.2 experiments/{id}.md 结构

```markdown
---
experiment_id: exp-001
title: X-post thread 格式测试
hypothesis: "使用 thread 格式可提升 X 曝光量 30%"
start_date: 2026-04-01
end_date: 2026-04-07
status: running          # proposed | running | completed | abandoned
metrics:
  control_metric: avg_impressions_last_7d
  treatment_metric: avg_impressions_experiment_7d
  min_sample_size: 10
  confidence_threshold: 0.85
---

## 实验设计

### 控制组
[当前格式: 单条推文]

### 实验组
[新格式: thread 结构]

### 成功标准
- 主要指标: X 平均曝光量提升 30%
- 次要指标: engagement rate 不下降 > 10%
- 统计显著性: p < 0.15

## 中期结果（实验结束时填写）
## 最终结论（实验结束时填写）
```

---

## 八、实施优先级

### Phase 1: 骨架建立（立即）
1. 创建 `wag-content-hub/SKILL.md` 主入口
2. 创建 `analytics/performance-rules.md`（迁移 v3-progress 中的基准数据）
3. 创建 `analytics/content-matrix.md`
4. 创建 `references/brand-voice.md` 和 `references/channel-specs.md`

### Phase 2: 工作流系统
5. 创建 `workflows/schema.yaml`
6. 创建 `workflows/daily-publish.yaml`
7. 创建 `workflows/weekly-analysis.yaml`

### Phase 3: Sub-skills
8. 创建 `skills/x-post/SKILL.md`
9. 创建 `skills/facebook-post/SKILL.md`
10. 创建 `skills/analytics-collector/SKILL.md` + scripts

### Phase 4: 自进化引擎
11. 创建 `evolution/rule-engine.md`
12. 创建 `evolution/changelog/` 和 `evolution/experiments/`
13. 创建 `workflows/self-evolution.yaml`

---

## 九、检验问题

**Q1: 为什么选择 `skills/` 子目录而非独立 skill 目录？**
A: 因为 x-post、facebook-post、analytics-collector 与 hub 存在强耦合（共享 performance-rules.md、共享数据存储结构），且它们的价值主要体现在 hub 的协调上下文中。独立部署的成本（多路径管理、版本同步）超过收益。

**Q2: hub 如何在不「侵入」子 skill 的情况下注入上下文？**
A: 通过 SKILL.md 中的 `context_inject` 机制，在调用子 skill 前将 performance-rules.md、content-matrix.md 等文件内容注入为上下文变量。子 skill 的 SKILL.md 保持独立可运行，只是当被 hub 调用时会获得增强的上下文。

**Q3: 自进化规则引擎如何避免「过度优化」到过拟合历史数据？**
A: 通过三层机制：(1) 设定 `min_sample_size`（如每规则至少 10 个数据点）；(2) 使用 `confidence_threshold`（p < 0.15，非严格的 0.05）；(3) 实验系统（experiments/）隔离验证新规则，再小范围应用；(4) `auto_apply: false` 默认人工审批。
