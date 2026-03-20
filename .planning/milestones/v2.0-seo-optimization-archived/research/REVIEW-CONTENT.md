# Content Strategy Review: Phase 15 & 16

**Reviewed:** 2026-03-20
**Confidence:** MEDIUM

---

## Executive Summary

Phase 15 (Content Architecture) 和 Phase 16 (Content Development) 的内容策略方向正确，hub-and-spoke 架构适合目标关键词，但存在以下问题：

1. **Phase 16 scope 过于宽泛** - 6个 deliverables 在一个 phase 内不切实际
2. **缺少 Australia 本地化内容** - ChAFTA、进口法规等高价值内容未列入
3. **pillar page 主题过于宽泛** - "The Complete Guide to Factory Visits in China" 难以针对 "factory visit China" 建立垂直权威
4. **Trust content 分散且不足** - FEATURES.md 识别的欺诈防范内容只在 CONT-11 中一笔带过

---

## Review Question 1: Is Hub-and-Spoke Appropriate for Target Keywords?

### Assessment: YES, but needs refinement

**支持理由:**
- "factory visit China" 是明确的细分领域，适合建立 pillar-cluster 结构
- Jingsourcing 已验证此模式有效（他们的 "Source Products by Visiting China" cluster 表现良好）
- FEATURES.md 明确识别 "工厂实地考察" 为 WAG 核心差异化

**问题:**
- ARCH-02 要求 "pillar pages linking to topic clusters"，但未定义哪些是 pillar
- Phase 15 只要求创建 service detail pages (ARCH-01)，未定义 pillar page 的 URL 结构
- Phase 16 的 pillar page "The Complete Guide to Factory Visits in China" 应在 Phase 15 就确定 URL 层级

**建议修改:**

| 当前 | 建议 |
|-----|-----|
| Pillar page 在 Phase 16 创建 | Pillar page 的 URL 结构 + 内容大纲在 Phase 15 确定 |
| Service pages 独立存在 | Service pages 作为 pillar 的入口，而非独立节点 |
| 未定义 spoke content 范围 | 明确 spoke content 的主题和数量（建议每个 pillar 3-5篇） |

---

## Review Question 2: Are Content Deliverables Aligned with Keywords?

### Phase 16 Deliverables vs Keywords Matrix

| Deliverable | 目标关键词 | 对齐度 | 问题 |
|-------------|----------|-------|-----|
| "The Complete Guide to Factory Visits in China" | "factory visit China", "China factory tour" | Medium | 主题太宽，E-E-A-T 弱 |
| "How to Verify Chinese Suppliers" | "supplier verification" | High | OK |
| "Red Flags When Sourcing from China" | "China sourcing agent" | Low | 关键词不对应 |
| "China Factory Audit Checklist" | "factory audits" | High | OK |
| Case study | "Australia business...case study" | High | 依赖客户授权，风险项 |
| Monthly news review process | 长尾关键词 | Low | 不是独立 deliverable |

### Critical Gap: Keywords Missing Content

| 关键词 | 状态 | 建议 |
|-------|-----|-----|
| "China sourcing Australia" | 未覆盖 | 添加 pillar page |
| "ChAFTA" / "Australia China free trade" | 未覆盖 | 添加 Australia 本地化内容 |
| "Australia import permit" | 未覆盖 | 添加合规指南 |
| "factory audit vs visit" | 未覆盖 | FEATURES.md 识别的对比型内容 |

### 建议调整

**删除:**
- "Red Flags When Sourcing from China" (关键词不对应，改为 "How to Spot Fake Suppliers on Alibaba" 更精准)

**修改:**
- "The Complete Guide to Factory Visits in China" → 拆分为两个 pillar:
  1. "China Factory Visit: Complete Australian Guide" (针对 "factory visit China")
  2. "How to Verify Chinese Suppliers: A Step-by-Step Guide" (针对 "supplier verification")

**添加:**
- "ChAFTA Explained: What Australian Importers Need to Know" (高需求，无竞品覆盖)
- "Australia Import Regulations: Products That Need Approval" (本地化护城河)

---

## Review Question 3: Is Content Scope Realistic for One Phase?

### Phase 16 Scope Assessment: NOT REALISTIC

**当前 Phase 16 有 6 个 deliverables:**
1. Pillar page (2000+ words)
2. "How to Verify Chinese Suppliers" article
3. "Red Flags When Sourcing from China" article
4. "China Factory Audit Checklist"
5. Case study (需客户授权)
6. Monthly news review process (流程建立)

**问题:**
- 案例研究需要客户授权，时间不可控
- pillar page 2000+ words 需要大量研究和编辑
- 3篇独立文章 + 1个 checklist + 1个 pillar page = 5个独立内容产品
- Monthly news review process 是运营流程，不应算作 phase deliverable

**建议拆分 Phase 16:**

| Phase | Scope | Deliverables |
|-------|-------|-------------|
| Phase 16A | Pillar Content (Core) | 1. Factory Visit Pillar (2000+ words) 2. Supplier Verification Pillar (1500+ words) |
| Phase 16B | Supporting Content | 3. Audit Checklist 4. "How to Spot Fake Suppliers" 5. ChAFTA Guide |
| Phase 16C | Case Studies + Process | 6. Case study (with authorization) 7. Monthly news review process documented |

**或者更现实的方式:**

| Phase | Scope |
|-------|-------|
| Phase 16 | 核心 pillar content + checklist (3 deliverables) |
| Phase 16B (合并到 Phase 17) | Case study + news process |

---

## Review Question 4: Missing Content Types for "factory visit China"?

### FEATURES.md 识别的内容类型 vs ROADMAP 覆盖

| Content Type | WAG Opportunity | ROADMAP 覆盖 |
|-------------|----------------|--------------|
| **Pillar: Factory Visit** | "factory visit China" | PARTIAL (1个 pillar 不足) |
| **Checklist: Factory Audit** | 高实用性，易传播 | YES (CONT-12) |
| **Case Studies: Real Stories** | 社会证明强 | YES (CONT-13) |
| **Comparison: Visit vs Video Audit** | 对比型内容易排名 | **MISSING** |
| **Preparation: What to Expect** | 转化意图明确 | **MISSING** |
| **Trust: Red Flags/Fraud** | 欺诈防范是痛点 | PARTIAL (CONT-11 覆盖不足) |
| **Australian: ChAFTA/Regulations** | 本地化护城河 | **MISSING** |
| **Video: Factory Tour** | 视觉内容需求高 | **MISSING** (Phase 16B?) |

### Missing Content Types That Would Help Rank

1. **"Factory Visit vs Video Audit: Which is Right for You?"**
   - 目标关键词: "factory audit vs visit"
   - 为什么有效: 对比型内容在 SERP 中有优势，易获得 featured snippets
   - 竞品现状: Jingsourcing 有类似内容但未针对澳大利亚

2. **"What to Expect on Your First China Factory Visit"**
   - 目标关键词: "factory visit China"
   - 为什么有效: 转化意图明确，用户处于决策阶段
   - 建议: 作为 spoke content，链接到 pillar page

3. **"ChAFTA Explained: What Australian Importers Need to Know"**
   - 目标关键词: "ChAFTA", "Australia China free trade agreement"
   - 为什么有效: 竞品几乎无覆盖，澳大利亚进口商刚需
   - 建议: 作为 pillar page，建立 Australia 本地化权威

4. **Video Content: "Factory Tour Walkthrough"**
   - 目标关键词: "factory tour China", "China factory visit video"
   - 为什么有效: YouTube SEO + 网站停留时间提升 + E-E-A-T (Experience signal)
   - 注意: Phase 16B (CONT-21) 已识别，但 timeline 不明确

---

## Specific Recommendations

### Phase 15 Modifications

| Item | Current | Recommended |
|------|---------|-------------|
| ARCH-01 | 3 service pages | 3 service pages + 明确定义为 pillar 入口 |
| ARCH-02 | Hub-and-spoke architecture | 明确定义: 1) Factory Visit pillar 2) Supplier Verification pillar 3) Australia Sourcing pillar |
| ARCH-03 | Internal linking strategy | 明确每个 pillar 的 spoke content 数量 (建议 3-5篇/cluster) |

### Phase 16 Modifications

| Item | Current | Recommended |
|------|---------|-------------|
| CONT-10 | 1 pillar (2000+ words) | 1-2 pillars (拆分或选一个主 pillar) |
| CONT-11 | "How to Verify..." + "Red Flags..." | 合并为一个完整的 Supplier Verification pillar |
| CONT-12 | Audit checklist | OK |
| CONT-13 | Case study | 移至 Phase 16B (依赖授权) |
| CONT-14 | Monthly process | 移至 Phase 17 或作为运营 SOP |

### Suggested Phase 16 Revised Scope

**Realistic Phase 16 (Content Development):**
1. Pillar: "The Complete Guide to Factory Visits in China" (2000+ words)
2. Spoke: "What to Expect on Your First China Factory Visit" (800+ words)
3. Spoke: "Factory Visit vs Video Audit: Which is Right for You?" (1000+ words)
4. Pillar: "How to Verify Chinese Suppliers: A Complete Guide" (1500+ words)
5. Checklist: "China Factory Audit Checklist" (downloadable)
6. Document internal linking structure

**Phase 16B (Content Expansion):**
- "ChAFTA Explained" pillar
- "Australia Import Regulations" guide
- "Red Flags: How to Spot Fake Suppliers on Alibaba"
- Case study (when authorized)
- Monthly news review process

---

## Summary of Changes

### Keep
- Hub-and-spoke architecture (appropriate for niche)
- Service detail pages as pillar entry points
- Factory Audit Checklist (high utility, linkable asset)
- Supplier Verification content focus

### Add
- "Factory Visit vs Video Audit" comparison content
- "What to Expect on Your First China Factory Visit" (spoke)
- "ChAFTA Explained" (Australia localization moat)
- Australia Import Regulations guide
- Video content strategy (even just placeholder)

### Remove
- Case study from Phase 16 core (move to 16B due to authorization dependency)
- Monthly news review process from Phase 16 deliverables

### Modify
- Pillar page scope: 1 comprehensive pillar instead of 1 broad + 2 articles
- OR: Create 2 distinct pillars (Factory Visit + Supplier Verification) instead of 1 pillar + scattered articles
- Red Flags article: target keyword should be "fake supplier Alibaba" not "China sourcing agent"

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Architecture fit | Medium | Hub-and-spoke 正确，但需要更明确定义 pillar-spoke 关系 |
| Keyword alignment | Medium | 部分不对应，遗漏关键本地化关键词 |
| Scope realism | Low | 6 deliverables 过于激进，建议拆分 |
| Missing content types | Medium | 基于 FEATURES.md 分析，遗漏对比型和本地化内容 |

---

## Sources

- FEATURES.md: SEO Content Strategy for WAG (2026-03-20)
- REQUIREMENTS.md: v2.0 SEO Requirements (2026-03-20)
- ROADMAP.md: v2.0 Phase definitions (2026-03-20)
