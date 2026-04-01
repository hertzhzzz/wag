# WAG Content Hub - 自进化(Self-Evolution)反馈循环机制设计

**创建时间**: 2026-04-01
**状态**: 设计完成
**作者**: System Architect Agent

---

## 1. 每日反馈循环流程图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         WAG CONTENT HUB - 每日自进化闭环                          │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
  │   T-0 早晨    │      │   T+0 发布   │      │   T+6h 数据  │      │   T+12h 报告 │
  │  规则加载     │ ──►  │  内容生成     │ ──►  │  数据抓取     │ ──►  │  性能评估    │
  │  从规则库读    │      │  四渠道分发   │      │  GSC+CDP     │      │  对比基准     │
  │  最新规则版本  │      │  时间戳记录   │      │  聚合入库     │      │  异常检测    │
  └──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
         │                                                                     │
         │    ┌─────────────────────────────────────────────────────────┐       │
         │    │               规则触发评估引擎 (Rule Trigger Evaluator)      │       │
         │    │                                                           │       │
         │    │   输入: 当日报告 + 历史规则库                                    │       │
         │    │   输出: UPDATE / HOLD / ESCALATE                            │       │
         │    │                                                           │       │
         │    │   评估矩阵:                                                  │       │
         │    │   ┌────────────────────────────────────────────────────┐  │       │
         │    │   │ 指标          │ 当前值  │ 基准值  │ 阈值   │ 触发?  │  │       │
         │    │   │ ER (LinkedIn) │ 16.48%  │ 15%    │ 20%   │ 17%   │  │       │
         │    │   │ CTR (SEO)     │ 2.3%    │ 2.0%   │ 3.5%   │ 2.5%  │  │       │
         │    │   │ Comment Rate  │ 0.00%   │ 0.5%   │ 1.0%   │ 0.3%  │  │       │
         │    │   │ Share Rate    │ 0.00%   │ 0.3%   │ 0.8%   │ 0.2%  │  │       │
         │    │   └────────────────────────────────────────────────────┘  │       │
         │    └─────────────────────────────────────────────────────────────┘       │
         │                              │                                          │
         ▼                              ▼                                          ▼
  ┌──────────────┐           ┌──────────────┐                          ┌──────────────┐
  │   UPDATE     │           │    HOLD      │                          │  ESCALATE    │
  │  规则增量更新  │           │  维持现状     │                          │  人工介入    │
  └──────────────┘           └──────────────┘                          └──────────────┘
         │                                                                        │
         │    ┌──────────────────────────────────────────────────────────────┐    │
         │    │                    规则冲突仲裁层 (Rule Arbitration)              │    │
         │    │                                                            │    │
         └──► │   检测冲突 ──► 优先级排序 ──► 合并策略 ──► 版本锁定 ──► 发布规则  │    │
              └──────────────────────────────────────────────────────────────┘    │
                         │                                                          │
                         ▼                                                          │
              ┌──────────────────────┐                                             │
              │  规则版本快照 (vN+1)  │ ─────────────────────────────────────────►  │
              │  analytics/rules/   │        下一轮 T+24h 加载                          │
              └──────────────────────┘                                             │
                                                                                    │
  ┌─────────────────────────────────────────────────────────────────────────────┐  │
  │                        周/月度宏观优化循环                                       │  │
  │   weekly-analysis.flow: 大样本模式识别 (7篇+数据点)                             │  │
  │   monthly-deep-review: 主题漂移检测 + 规则体系重构                               │  │
  └─────────────────────────────────────────────────────────────────────────────┘  │
```

### 核心时间轴

| 阶段 | 时间点 | 操作 | 产出 |
|------|--------|------|------|
| T-0 | 每日 08:00 | 加载最新规则版本 | rules-v{N}.json |
| T+0 | 每日 09:00-10:00 | 四渠道内容发布 | content-{date}-{channel}.md |
| T+6 | 每日 15:00-16:00 | 数据抓取 (GSC API + CDP) | raw-metrics-{date}.json |
| T+12 | 每日 21:00 | 性能报告生成 + 触发评估 | daily-report-{date}.md |
| T+24 | 次日 08:00 | 规则加载 (可能更新) | 新一轮循环 |

---

## 2. 规则更新触发阈值设计

### 2.1 指标体系与分级阈值

#### A. 即时触发阈值 (Instant Trigger)
**条件**: 单日数据异常高/低，无需积累样本
**目的**: 快速捕捉病毒式传播或严重翻车

| 指标 | 上限触发 | 下限触发 | 原因 |
|------|----------|----------|------|
| ER (LinkedIn) | >40% | <5% | 内容质量异常 |
| CTR (SEO) | >8% | <0.5% | 标题/元数据异常 |
| 评论数 | >20 | =0 且曝光>100 | 引发讨论的能力 |
| 转发/曝光比 | >5% | - | 病毒系数 |

#### B. 统计触发阈值 (Statistical Trigger)
**条件**: 连续N天积累数据，t检验显著
**目的**: 避免噪声驱动，捕捉真实趋势

| 指标 | 基准值 (v1) | 触发阈值 | 最小样本 | 统计方法 |
|------|-------------|----------|----------|----------|
| ER (LinkedIn) | 15% | +20%相对提升 或 -15%相对下降 | 3篇同格式 | 配对t检验, p<0.05 |
| CTR (SEO) | 2.0% | +30%相对提升 或 -20%相对下降 | 5篇同话题群 | Mann-Whitney U |
| Comment Rate | 0.3% | 绝对值+0.5pp 或降至0 | 5篇 | 二项检验 |
| 最佳发布时间 | 09:00 | 与当前最优时间差异>1小时 | 7天数据 | 分箱ANOVA |
| Hook类型 | 当前最优 | 新Hook格式ER>当前2倍 且N≥3 | 3篇 | 效果量 Cohen's d>0.8 |

#### C. 趋势触发阈值 (Trend Trigger)
**条件**: 滑动窗口内指标持续单向变化
**目的**: 识别渐进式衰减/提升

| 指标 | 窗口大小 | 触发条件 | 统计方法 |
|------|----------|----------|----------|
| 曝光量趋势 | 7天 | 连续3天低于MA(7)-1σ | 滑动均值监控 |
| ER趋势 | 14天 | 斜率< -2%/周 且无反弹 | 线性回归 |
| 话题新鲜度 | 30天 | 同话题连续3篇ER下降 | 话题疲劳指数 |

### 2.2 触发决策矩阵

```
                    当前值 vs 基准值
                    高      |      低
              ┌─────────────┼─────────────┐
         统计显著 │  ✅规则强化  │  ⚠️规则预警  │
         (p<0.05) │  提升上限   │  缩小下限   │
              ────┼─────────────┼─────────────┤
         统计不显著│  🔒规则锁定  │  📊持续观测  │
         (p≥0.05) │  稳定输出   │  延长窗口   │
              ────┼─────────────┼─────────────┤
         即时异常 │  🚀紧急强化  │  🛑紧急回滚  │
         (单日极端)│  即时应用   │  暂停+告警  │
              ────┼─────────────┼─────────────┤
         趋势异常 │  📈渐进适应  │  ⚠️预警+人工 │
              (连续3天) │  权重调整   │  审查     │
              └─────────────┴─────────────┘
```

### 2.3 ER基准值校准机制

初始基准值来自 2026-03 数据：
- LinkedIn ER基准: **15%** (平均值约16.48%)
- SEO CTR基准: **2.0%**
- Comment Rate基准: **0.5%**
- Share Rate基准: **0.3%**

**动态校准规则**:
1. 每30天重新计算基准 = MA(30) 均值
2. 基准更新幅度限制: 单次变化≤±10%
3. 基准版本化存储: `rules/基准-v{N}-{date}.md`

---

## 3. 规则引擎核心算法

### 3.1 规则结构

```yaml
# rules/rule-schema.yaml
rule:
  id: "R-001"
  name: "linkedin-er-threshold"
  type: "performance-threshold"     # performance-threshold | format-preference | timing-optimization | topic-weight
  channel: "linkedin"               # linkedin | x | facebook | seo | global
  status: "active"                  # active | suspended | archived
  version: 3
  created: "2026-03-23"
  updated: "2026-04-01"

  # 条件定义
  condition:
    metric: "engagement_rate"
    operator: "gt"                  # gt | lt | eq | between
    threshold: 0.17                  # 17%
    aggregation: "post"             # post | day | week
    min_sample_size: 3

  # 动作定义
  action:
    type: "boost_weight"            # boost_weight | penalize | flag | suspend
    target: "format:3-step-framework"
    adjustment: 0.15                 # +15% weight
    confidence: 0.85                 # 置信度

  # 元数据
  evidence:
    trigger_events: 3
    sample_posts: ["2026-03-23-LI", "2026-03-26-LI", "2026-03-29-LI"]
    avg_er: 0.20
    baseline_er: 0.15
    effect_size: 0.72               # Cohen's d

  # 互斥与依赖
  conflicts_with: ["R-002", "R-015"]
  requires: ["R-010"]                # 依赖某个基础规则存在
```

### 3.2 规则更新算法

#### 增量更新算法 (Incremental Update)

```
ALGORITHM: incremental_rule_update(new_data, current_ruleset)
INPUT:
  - new_data: 当日性能数据 (JSON)
  - current_ruleset: 当前活跃规则集合

OUTPUT:
  - updated_ruleset: 更新后的规则集合
  - changelog: 变更日志

STEPS:

1. 加载历史规则库
   rules ← load_ruleset("analytics/rules/active/")

2. 遍历每条规则，执行触发评估
   FOR each rule IN rules WHERE rule.status == "active":
     result ← evaluate_trigger(rule, new_data)

     IF result == "TRIGGER":
       proposal ← generate_rule_proposal(rule, new_data)

       # 冲突检测
       conflicts ← detect_conflicts(proposal, rules)
       IF conflicts NOT empty:
         resolution ← arbitration(proposal, conflicts)
         proposal ← resolution.merged_rule

       # 验证最小样本
       IF proposal.confidence >= CONFIDENCE_THRESHOLD (0.75):
         rules.update(proposal)
         changelog.add(proposal)

3. 版本快照
   version_id ← increment_version(rules)
   snapshot ← rules.export_snapshot(version_id)
   snapshot.save(f"analytics/rules/versions/v{version_id}-{date}.json")

4. RETURN rules, changelog
```

#### 全量更新算法 (Full Refresh)

```
ALGORITHM: full_ruleset_refresh(baseline_window=30)
INPUT:
  - baseline_window: 基准计算窗口(天)

OUTPUT:
  - refreshed_ruleset: 完全重新校准的规则集

STEPS:

1. 加载30天全量数据
   data ← load_analytics(window_days=baseline_window)

2. 按维度分组分析
   dimensions ← [
     "format",      # 3步框架 vs 故事型 vs 清单型
     "hook_type",   # 痛点型 vs 数据型 vs 问答型
     "topic",       # 话题分类
     "posting_time", # 发布时间分箱
     "content_length" # 内容长度
   ]

3. FOR each dimension IN dimensions:
     analysis ← dimension_analysis(data, dimension)

     # A/B 测试风格的提升计算
     FOR each variant IN analysis.variants:
       IF variant.performance > baseline.performance * 1.2
         AND variant.p_value < 0.05
         AND variant.sample_size >= MIN_SAMPLE:
           new_rule ← create_rule(variant, analysis)
           ruleset.upsert(new_rule)

4. 规则去重与合并
   ruleset ← deduplicate(ruleset)

5. RETURN ruleset
```

### 3.3 规则冲突仲裁机制

当新规则提案与现有规则冲突时（例如：规则A说"3步框架权重+15%"，规则B说"3步框架权重-10%"），执行以下仲裁：

```
ALGORITHM: rule_arbitration(proposal, existing_rules)
INPUT:
  - proposal: 新规则提案
  - existing_rules: 与之冲突的现有规则列表

OUTPUT:
  - resolution: 仲裁后的合并规则

RESOLUTION STRATEGY (按优先级):

Priority 1: 数据新鲜度 (Freshness)
  → 时间戳更近的数据权重更高
  → 公式: effective_weight = raw_weight * freshness_factor
  → freshness_factor = 1.0 if age < 7days
                        0.8 if 7-14days
                        0.6 if 14-30days
                        0.0 if > 30days (规则过期)

Priority 2: 样本量 (Statistical Power)
  → 更大样本量赋予更高置信度
  → 公式: sample_confidence = min(sample_size / required_sample, 1.0) * 0.3 + 0.7

Priority 3: 效果量 (Effect Size)
  → Cohen's d 越大，规则越稳健
  → d > 0.8: 大效果 → 权重 × 1.0
  → 0.5 < d < 0.8: 中效果 → 权重 × 0.7
  → d < 0.5: 小效果 → 权重 × 0.4

Priority 4: 规则类型优先级
  → timing_optimization > format_preference > topic_weight > performance_threshold
  → 更高优先级的规则在冲突时主导

Priority 5: 通道一致性
  → 同通道规则优先于全局规则
  → 跨通道影响需要两通道规则同时满足

FINAL SCORE CALCULATION:
  score = freshness_weight × freshness_factor
        + sample_weight × sample_confidence
        + effect_weight × effect_factor
        + type_weight × type_priority

  IF proposal.score > existing.score:
    → proposal PREVAILS (旧规则被覆盖)
  ELSE:
    → proposal REJECTED (保留旧规则)
    → proposal.merged_with ← existing_rule.id
    → proposal.resolution ← "suppressed_by_older_rule"

EDGE CASE - 双向冲突 (A↑ B↓ for same target):
  → 触发人工审查
  → flag: "arbitration_needed"
  → 规则进入 PENDING_REVIEW 状态
  → 人工确认前保留原规则
```

### 3.4 规则版本管理

```
版本命名: v{Major}.{Minor}-{date}
  v3.12-2026-04-01

版本层级:
  - Major: 规则体系重构 (手动触发)
  - Minor: 单条规则增删改 (自动)

版本存储策略:
  - 活跃规则: analytics/rules/active/rule-{id}.yaml
  - 版本快照: analytics/rules/versions/snapshot-v{N}-{date}.json
  - 变更日志: analytics/rules/changelog.md (append only)

回滚机制:
  - 保留最近10个版本快照
  - 触发条件: 新规则应用后连续3天指标下降>10%
  - 回滚命令: 回滚至 snapshot-v{N-1}-{prev_date}.json
```

---

## 4. self-evolution.flow 工作流 YAML

```yaml
# self-evolution.flow — WAG Content Hub 自进化工作流
# 触发: 每日 T+12 (21:00) 自动执行，或手动触发

name: wag-content-self-evolution
description: |
  WAG Content Hub 的每日自进化反馈循环:
  数据收集 → 性能评估 → 规则更新 → 规则仲裁 → 下一轮准备
version: "1.0"
trigger:
  schedule: "0 21 * * *"       # 每日 21:00 UTC (即 UTC+8 次日 05:00)
  manual: true
  conditions:
    - channel_data_collected: true
    - daily_report_generated: true

env:
  RULES_DIR: "analytics/rules"
  DATA_DIR: "analytics/daily"
  REPORTS_DIR: "analytics/reports"
  LOG_DIR: "evolution/logs"
  MIN_CONFIDENCE: 0.75
  MAX_CONFLICTS_PER_RUN: 5

# ─────────────────────────────────────────────────────────────────────────────
# STAGE 1: 数据聚合 (10分钟)
# ─────────────────────────────────────────────────────────────────────────────
stage_1_data_aggregation:
  name: "数据聚合"
  timeout: 10m
  steps:
    - id: collect_gsc
      skill: wag-analytics-collector
      args:
        channel: gsc
        date_range: yesterday
      continue_on_error: false

    - id: collect_linkedin
      skill: wag-analytics-collector
      args:
        channel: linkedin
        date_range: yesterday
      continue_on_error: false

    - id: collect_x
      skill: wag-analytics-collector
      args:
        channel: x
        date_range: yesterday
      continue_on_error: false

    - id: collect_facebook
      skill: wag-analytics-collector
      args:
        channel: facebook
        date_range: yesterday
      continue_on_error: false

    - id: merge_metrics
      type: transform
      script: |
        // 合并四个渠道数据为统一格式
        const merged = {
          date: env.TODAY,
          channels: {
            linkedin: stage_1_data_aggregation.collect_linkedin.output,
            x: stage_1_data_aggregation.collect_x.output,
            facebook: stage_1_data_aggregation.collect_facebook.output,
            seo: stage_1_data_aggregation.collect_gsc.output
          },
          aggregations: {
            total_impressions: sum(all_channels.impressions),
            weighted_er: weighted_average(all_channels.engagement_rate, all_channels.impressions),
            top_performer: max_by(all_channels, 'engagement_rate')
          }
        }
        emit(merged)
      output: "analytics/daily/metrics-{TODAY}.json"

# ─────────────────────────────────────────────────────────────────────────────
# STAGE 2: 性能评估与模式识别 (15分钟)
# ─────────────────────────────────────────────────────────────────────────────
stage_2_performance_evaluation:
  name: "性能评估"
  timeout: 15m
  depends_on: stage_1_data_aggregation
  steps:
    - id: load_baseline_rules
      type: transform
      script: |
        // 加载当前活跃规则集
        rules ← read_dir(env.RULES_DIR + "/active")
        baseline ← load(rules)
        emit({ rules: baseline, timestamp: now() })
      output: context.baseline_rules

    - id: evaluate_against_baseline
      type: analysis
      script: |
        // 逐指标对比评估
        results ← []
        FOR each rule IN context.baseline_rules:
          metric_value ← get_metric(data.channels, rule.condition.metric)
          status ← evaluate(rule.condition, metric_value)

          results.push({
            rule_id: rule.id,
            metric: rule.condition.metric,
            current_value: metric_value,
            threshold: rule.condition.threshold,
            status: status,  // TRIGGER | HOLD | ESCALATE
            evidence: {
              sample_size: count_samples(rule),
              avg_baseline: rule.baseline,
              current_vs_baseline: pct_diff(metric_value, rule.baseline)
            }
          })

        emit(results)
      output: "analytics/reports/evaluation-{TODAY}.json"

    - id: pattern_discovery
      type: analysis
      skill: geo-content
      args:
        mode: performance_analysis
        window: 7d
      script: |
        // 在top/bottom各30%内容中寻找模式
        high_performers ← filter(data.posts, er > percentile_70)
        low_performers ← filter(data.posts, er < percentile_30)

        patterns ← {
          hook_type: compare_dist(high, low, 'hook_type'),
          format: compare_dist(high, low, 'format'),
          topic: compare_dist(high, low, 'topic'),
          timing: compare_dist(high, low, 'posting_hour'),
          length: compare_dist(high, low, 'word_count')
        }

        emit(patterns)
      output: "analytics/reports/patterns-{TODAY}.json"

    - id: trend_detection
      type: analysis
      script: |
        // 滑动窗口趋势检测
        window ← load_rolling_window(days=7)
        trend ← linear_regression(window.impressions_by_day)

        alerts ← []
        IF trend.slope < -0.05:
          alerts.push({ type: "declining_impressions", severity: "warn" })
        IF consecutive_low_er(days=3):
          alerts.push({ type: "er_decline_streak", severity: "alert" })

        emit({ trend, alerts })
      output: "analytics/reports/trend-{TODAY}.json"

# ─────────────────────────────────────────────────────────────────────────────
# STAGE 3: 规则更新提案 (15分钟)
# ─────────────────────────────────────────────────────────────────────────────
stage_3_rule_proposal:
  name: "规则更新提案"
  timeout: 15m
  depends_on: stage_2_performance_evaluation
  steps:
    - id: identify_update_candidates
      type: transform
      script: |
        candidates ← filter(evaluation_results, status == "TRIGGER")

        proposals ← []
        FOR each candidate IN candidates:
          p ← {
            type: "rule_update",
            target_rule_id: candidate.rule_id,
            current_value: candidate.current_value,
            threshold: candidate.threshold,
            adjustment_type: determine_adjustment(candidate),
            proposed_changes: compute_adjustment(candidate, data),
            confidence: compute_confidence(candidate),
            evidence: candidate.evidence
          }

          // 置信度门槛检查
          IF p.confidence >= env.MIN_CONFIDENCE:
            proposals.push(p)

        emit(proposals)
      output: context.rule_proposals

    - id: generate_new_rules
      type: transform
      script: |
        // 从模式识别结果生成新规则
        new_rules ← []

        FOR each pattern IN patterns WHERE pattern.significance > 0.8:
          IF pattern.type == "hook_type" AND pattern.winner != current_best_hook:
            rule ← {
              id: generate_rule_id(),
              name: "hook-boost-" + pattern.winner,
              type: "format_preference",
              channel: "global",
              condition: {
                metric: "engagement_rate",
                operator: "gt",
                threshold: pattern.threshold
              },
              action: {
                type: "boost_weight",
                target: "hook_type:" + pattern.winner,
                adjustment: pattern.effect_size
              },
              confidence: pattern.significance,
              evidence: { pattern_data: pattern }
            }
            new_rules.push(rule)

        emit(new_rules)
      output: context.new_rules

    - id: prepare_changelog
      type: transform
      script: |
        changelog ← {
          date: env.TODAY,
          proposals_count: len(context.rule_proposals),
          new_rules_count: len(context.new_rules),
          updates: context.rule_proposals,
          new_rules: context.new_rules,
          metadata: {
            top_performer: data.aggregations.top_performer,
            weighted_er: data.aggregations.weighted_er,
            triggers: count_triggers(evaluation_results)
          }
        }

        append_to_file(
          "analytics/rules/changelog.md",
          format_changelog_entry(changelog)
        )
      output: "analytics/rules/changelog.md"

# ─────────────────────────────────────────────────────────────────────────────
# STAGE 4: 规则冲突仲裁 (10分钟)
# ─────────────────────────────────────────────────────────────────────────────
stage_4_arbitration:
  name: "规则冲突仲裁"
  timeout: 10m
  depends_on: stage_3_rule_proposal
  steps:
    - id: detect_conflicts
      type: analysis
      script: |
        all_proposals ← concat(context.rule_proposals, context.new_rules)
        conflict_groups ← []

        FOR each proposal IN all_proposals:
          conflicts ← []
          FOR each existing_rule IN ruleset:
            IF conflicts_with(proposal, existing_rule):
              conflicts.push({
                rule_id: existing_rule.id,
                direction: compare_direction(proposal, existing_rule),
                severity: compute_severity(proposal, existing_rule)
              })

          IF len(conflicts) > 0:
            conflict_groups.push({
              proposal_id: proposal.id,
              conflicts: conflicts,
              status: "needs_arbitration"
            })

        emit(conflict_groups)
      output: context.conflict_groups

    - id: resolve_conflicts
      type: transform
      script: |
        resolved ← []
        escalated ← []

        FOR each group IN context.conflict_groups:
          IF group.conflicts.length <= env.MAX_CONFLICTS_PER_RUN:
            resolution ← run_arbitration_algorithm(
              group.proposal,
              group.conflicts
            )
            resolved.push(resolution)
          ELSE:
            escalated.push(group)
            group.status ← "ESCALATED"
            group.reason ← "conflict_count_exceeded"

        emit({
          resolved: resolved,
          escalated: escalated,
          summary: {
            total_conflicts: len(context.conflict_groups),
            resolved_count: len(resolved),
            escalated_count: len(escalated)
          }
        })
      output: "analytics/reports/arbitration-{TODAY}.json"

    - id: apply_resolved_rules
      type: transform
      script: |
        FOR each resolution IN arbitration.resolved:
          rule ← resolution.merged_rule

          // 版本控制
          old_version ← load_rule(rule.id)
          rule.version ← old_version.version + 1
          rule.updated_at ← env.TODAY

          // 保存活跃规则
          save_rule(rule)

          // 创建回滚快照（仅当首次更新major参数时）
          IF resolution.is_significant_change:
            create_rollback_point(rule, old_version)

        emit({ applied: len(arbitration.resolved) })
      output: context.apply_result

# ─────────────────────────────────────────────────────────────────────────────
# STAGE 5: 下一轮准备与报告 (5分钟)
# ─────────────────────────────────────────────────────────────────────────────
stage_5_preparation:
  name: "下一轮准备"
  timeout: 5m
  depends_on: stage_4_arbitration
  steps:
    - id: generate_daily_summary
      type: report
      template: |
        # Daily Evolution Summary - {env.TODAY}

        ## 今日数据概览
        - 曝光总量: {data.aggregations.total_impressions}
        - 加权ER: {data.aggregations.weighted_er}
        - 最佳表现: {data.aggregations.top_performer.post_id}

        ## 规则更新状态
        - 提案数: {len(context.rule_proposals)}
        - 新规则: {len(context.new_rules)}
        - 冲突解决: {arbitration.summary.resolved_count}
        - 升级人工审查: {arbitration.summary.escalated_count}

        ## 活跃规则变更
        {format_rule_changes(changelog)}

        ## 下一步
        - 下一轮执行: {tomorrow} 08:00
        - 待人工审查: {len(arbitration.escalated)}
        - 告警: {trend.alerts}
      output: "analytics/reports/daily-summary-{TODAY}.md"

    - id: prepare_next_cycle
      type: transform
      script: |
        // 更新规则版本索引，供次日 T-0 加载
        index ← {
          version: current_max_version() + 1,
          date: env.TODAY,
          active_rules_count: count_active_rules(),
          source_files: list_rule_files()
        }
        save_json("analytics/rules/active-index.json", index)

        // 清理: 保留最近60天报告，压缩超过30天的原始数据
        cleanup_old_files(days=60, pattern="analytics/reports/*")
        archive_old_data(days=30)
      output: "analytics/rules/active-index.json"

    - id: send_digest
      type: notification
      if: len(arbitration.escalated) > 0 OR len(trend.alerts) > 0
      script: |
        digest ← {
          to: "content-team",
          subject: "WAG Content Evolution Digest - {TODAY}",
          priority: if escalation then "high" else "normal",
          body: format_digest(
            evaluation_results,
            changelog,
            arbitration,
            trend
          )
        }
        emit(digest)

# ─────────────────────────────────────────────────────────────────────────────
# ERROR HANDLING & RECOVERY
# ─────────────────────────────────────────────────────────────────────────────
error_handling:
  on_stage_failure:
    - stage: stage_1_data_aggregation
      action: retry
      max_retries: 2
      fallback: use_last_known_data

    - stage: stage_2_performance_evaluation
      action: skip_to_report
      fallback: generate_brief_report_without_evaluation

    - stage: stage_3_rule_proposal
      action: halt_and_notify
      message: "Rule proposal failed — no automatic rule changes"

    - stage: stage_4_arbitration
      action: escalate_immediately
      message: "Arbitration failure — manual review required"

  rollback:
    trigger: "new_rules caused 3 consecutive days of >10% metric drop"
    action: restore_previous_snapshot
    notification: true

  observability:
    metrics_logged:
      - rules_updated_count
      - conflicts_resolved_count
      - conflicts_escalated_count
      - processing_time_ms
      - confidence_distribution
    alert_on:
      - processing_time > 60m
      - escalated_conflicts > 3
      - no_data_collected
```

---

## 5. 关键设计决策说明

### 5.1 为什么选择增量更新而非全量更新作为默认策略？

**第一性原理分析**:

自进化系统的核心矛盾是**学习速度**与**稳定性**之间的张力。全量更新(重训练)代价高、风险大；纯增量更新则可能积累噪声。

**当前选择: 增量为主，全量为辅**

- **增量更新**: 每日执行，成本<5分钟Claude API调用，可回滚，影响范围小
- **全量更新**: 每月执行，或当增量更新连续3次方向矛盾时触发

**为什么不是纯增量？**
因为单一指标的短期波动可能误导规则。引入全量窗口(30天)确保基准线不被噪声带偏。

**为什么不是纯全量？**
内容营销的时效性极强。一个月才更新一次规则，错过的话题趋势和格式演变太多了。

### 5.2 为什么置信度阈值设为0.75？

基于内容营销场景的样本量约束：
- LinkedIn每条帖子是一个独立样本
- 统计显著(p<0.05)通常需要30+样本
- 但内容团队每天最多发布1-4篇
- 30天积累约30-120篇，但每篇异质性高

0.75是一个**务实折中**：
- 高于0.7意味着需要至少4-5篇验证
- 低于0.8避免过度保守
- 低于0.75的规则更新不执行，但记录供下次参考

### 5.3 冲突仲裁为何不直接让新规则覆盖旧规则？

因为**方向性冲突**是最危险的信号。如果规则A基于3月份数据说"3步框架ER高"，规则B基于4月份数据说"3步框架ER低"——这可能意味着：
1. 受众疲劳(overexposure)
2. 外部因素变化(算法改版、竞争对手模仿)
3. 样本偏差(不同话题群的表现差异)

直接覆盖会丢失这种信息。仲裁机制强制算法在冲突时**同时保留新旧规则及其证据**，供人工审查解读真正原因。

### 5.4 为什么不引入强化学习或更复杂的自适应机制？

**过度工程的陷阱**。当前阶段的核心约束：
1. **数据量不足**: 每月30-120篇，数据量远低于强化学习收敛需求
2. **人工可介入**: 内容营销不是高频交易，人工判断比算法更准确
3. **可解释性要求**: 规则必须可解释、可回滚、可审计
4. **变化速度**: 社交媒体趋势以周计，而非毫秒

当前设计的阈值/规则系统，实际上是一个**规则化的浅层学习**——足够复杂以捕捉关键模式，足够简单以避免在小数据集上过拟合。

---

## 6. 输出物清单

| 文件 | 路径 | 状态 |
|------|------|------|
| 每日反馈循环流程图 | (本文档 Section 1) | ✅ 设计完成 |
| 触发阈值设计 | (本文档 Section 2) | ✅ 设计完成 |
| 规则引擎算法 | (本文档 Section 3) | ✅ 设计完成 |
| self-evolution.flow | (本文档 Section 4) | ✅ YAML草稿完成 |
| performance-rules.md | 待创建 | 📋 下一步 |
| rule-engine.md | 待创建 | 📋 下一步 |

---

*本设计基于 WAG Content Engine v3 架构，可向 v4 演进时引入多臂老虎机(MAB)或贝叶斯优化以处理更大数据量场景。*
