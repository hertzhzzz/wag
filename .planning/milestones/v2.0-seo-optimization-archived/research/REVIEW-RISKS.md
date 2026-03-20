# ROADMAP Review: Risks & Dependencies

**Reviewed:** 2026-03-20
**Confidence:** MEDIUM-HIGH

---

## Executive Summary

The WAG SEO v2.0 roadmap (Phases 14-17) follows a logical linear progression from technical foundation to content to authority building. However, three critical risks threaten delivery: (1) hidden external dependencies on client authorization and third-party acceptance, (2) a missing explicit keyword strategy phase that all content depends on, and (3) the entire roadmap is a rigid linear chain with no parallelization possible. Additionally, the competitor analysis timing is suboptimal - it happens after content is built rather than before.

---

## 1. Dependency Chain Analysis

### Current Dependency Structure

```
Phase 14 (Technical SEO Foundation)
    |
    v
Phase 15 (Content Architecture)
    |
    v
Phase 16 (Content Development)
    |
    v
Phase 17 (Authority Building)
```

### Assessment: CRITICAL RISK

**Problem:** The roadmap is a pure linear chain with zero parallelization. Every phase waits for the previous phase to complete.

**Why This Is Risky:**
- If any phase slips, all subsequent phases are delayed with no recourse
- Content Development (Phase 16) cannot start until Content Architecture (Phase 15) is 100% complete
- Authority Building (Phase 17) cannot begin until all content is written and published

**Recommended Fix:**
Consider splitting Phase 14 (Technical SEO Foundation) into two parallel tracks:

```
Track A: Technical Foundation (crawl, schema, Core Web Vitals)
Track B: Content Strategy (keyword research, content brief development)

Both must complete before Phase 15 can start
```

Or at minimum, add explicit checkpoints where work can begin in parallel.

---

## 2. Hidden External Dependencies

### 2.1 Client Authorization (Phase 16, Success Criteria #5)

**Issue:** Phase 16 requires "Case study published (with client authorization)" but this is listed as a success criterion, not a dependency.

**Reality:**
- Client authorization is NOT guaranteed
- Timeline is outside WAG's control
- If client authorization is delayed, Phase 16 cannot be marked complete

**Recommendation:**
Add explicit dependency notation:
```
**External Dependencies:** Client authorization for case study (timeline: TBD, could block Phase 16 completion)
```

**Mitigation:** Start the authorization request early in Phase 15 or even Phase 14. Have a backup plan (anonymous case study, or omit case study and use testimonial instead).

---

### 2.2 Guest Post Outreach Acceptance (Phase 17, Success Criteria #2)

**Issue:** "At least 3 guest post outreach opportunities identified and contacted"

**Reality:**
- Outreach acceptance rate is typically 5-20% for cold outreach
- "Contacted" does not mean "accepted"
- Phase 17 success criteria should be "3 guest posts published" not "contacted"

**Recommendation:**
Change success criteria to:
```
2. At least 3 guest posts published on external sites
```

Add explicit note that guest post success is dependent on third-party acceptance and may extend timeline.

---

### 2.3 Chamber of Commerce Relationship (Phase 17, Success Criteria #3)

**Issue:** "Relationship established with at least 1 Australian chamber of commerce or industry association"

**Reality:**
- Building relationships with associations takes months, not weeks
- This could easily slip beyond Phase 17 timeline

**Recommendation:**
Either:
1. Move this to Phase 18 (or treat as ongoing maintenance)
2. Set more achievable criteria: "Initial contact made with 2+ chambers" rather than "relationship established"

---

## 3. Missing Keyword Strategy Phase

### Problem

The PITFALLS.md explicitly identifies "Keyword Intent Mismatch" as a pitfall requiring a "Keyword Strategy phase." However, the ROADMAP.md has no explicit keyword strategy phase.

**What currently happens:**
- Keywords are listed in ROADMAP.md Overview ("factory visit China", "China sourcing agent", etc.)
- But there's no phase dedicated to keyword research, intent classification, and content mapping
- This work is implicitly buried in Technical SEO Foundation (Phase 14)

**Why This Is Risky:**
- Phase 15 (Content Architecture) creates service pages and hub-and-spoke structure
- Phase 16 (Content Development) creates pillar content and articles
- Both phases NEED keyword strategy to be finalized FIRST
- If keyword strategy changes after content is built, significant rework may be needed

**Recommendation:**
Add a Phase 14.5 (or restructure Phase 14) to explicitly include:
1. Full keyword research and intent classification
2. Keyword-to-page mapping
3. Content brief development for all target pages

This should complete BEFORE Phase 15 begins.

---

## 4. Competitor Analysis Timing

### Problem

Competitor gap analysis is in Phase 17 (Authority Building), which happens AFTER content is developed.

**Why This Is Backwards:**
- Content strategy should be informed by competitor analysis
- If Phase 17 reveals Epic Sourcing dominates certain keywords, Phase 16 content targeting those keywords may be wasted effort
- Guest post outreach should target competitor weaknesses, not arbitrary topics

**Recommendation:**
Move competitor analysis to BEFORE Phase 15 (Content Architecture). Consider merging with keyword strategy in a pre-architecture planning phase.

---

## 5. Phase-Specific Risks

### Phase 14: Technical SEO Foundation

| Risk | Severity | Mitigation |
|------|----------|------------|
| Core Web Vitals may require significant image/code optimization | HIGH | Audit current scores first, may need dedicated image optimization phase |
| JSON-LD schema as Server Components may conflict with existing client components | MEDIUM | Test early, may need refactor of existing components |
| EEAT signals require real team info (photos, credentials) | HIGH | Client must provide this - start collecting early |

### Phase 15: Content Architecture

| Risk | Severity | Mitigation |
|------|----------|------------|
| Service detail pages require deep expertise input | HIGH | Phase 16 content depends on accurate service descriptions - get SME input before architecture |
| Hub-and-spoke structure may not match existing URL structure | MEDIUM | Audit current URLs first, plan redirects if needed |
| Internal linking changes require canonical updates | MEDIUM | Coordinate with Phase 14 canonical URL work |

### Phase 16: Content Development

| Risk | Severity | Mitigation |
|------|----------|------------|
| "2000+ words" pillar content requires genuine expertise | HIGH | Per PITFALLS.md - thin AI content triggers Google penalties. Must have SME review |
| Client authorization for case study is not guaranteed | HIGH | Start authorization process early, have backup content plan |
| Monthly news review process requires ongoing resource commitment | MEDIUM | Document process, assign responsibility before Phase 17 |

### Phase 17: Authority Building

| Risk | Severity | Mitigation |
|------|----------|------------|
| Guest post acceptance rate is low (5-20%) | HIGH | Target 10+ outreach opportunities, start Phase 16 not Phase 17 |
| Relationship building with chambers takes months | HIGH | Set realistic criteria, consider moving to Phase 18 |
| Backlink gap analysis findings may require content changes | MEDIUM | Ensure analysis feeds back into content strategy |

---

## 6. What Could Cause This Roadmap to Fail

### Critical Path Risks (Highest Impact)

1. **Client Cannot Provide Team Credentials (EEAT-01, EEAT-02)**
   - Phase 14 requires team expertise visible on all pages
   - If client cannot provide photos, bios, or China experience statements, Phase 14 cannot complete
   - **Probability:** MEDIUM
   - **Impact:** Complete roadmap delay

2. **Case Study Client Authorization Denied**
   - Phase 16 success requires client authorization for case study
   - If client declines, Phase 16 cannot be marked complete
   - **Probability:** MEDIUM
   - **Impact:** Phase 16 incomplete, affects Phase 17 authority building

3. **AI Content Detection During Development**
   - PITFALLS.md warns: thin/AI content triggers Google penalties
   - If Phase 16 content is perceived as AI-generated without expert editing, rankings may drop
   - **Probability:** HIGH if not carefully managed
   - **Impact:** SEO performance regression

### Resource Risks

4. **Content Production Bottleneck**
   - Phase 16 requires 2000+ word pillar page + 3-4 articles + case study
   - If content production is slow, all subsequent phases wait
   - **Probability:** HIGH for solo execution
   - **Impact:** Timeline slippage

5. **Guest Post Outreach Yield**
   - Phase 17 requires published guest posts (not just contacted)
   - With 5-20% acceptance rate, need 15-60 outreach attempts for 3 posts
   - **Probability:** MEDIUM
   - **Impact:** Phase 17 incomplete without sufficient outreach volume

### External Risks

6. **Google Algorithm Changes**
   - Core updates in 2024-2025 heavily penalized AI thin content
   - If Google releases another major update, strategy may need pivoting
   - **Probability:** LOW-MEDIUM (within 3-6 month roadmap timeline)
   - **Impact:** Could invalidate entire content strategy

7. **Competitor Action**
   - Epic Sourcing or ChinaDirect could launch major content push
   - Gap analysis in Phase 17 may reveal WAG is already too far behind
   - **Probability:** LOW-MEDIUM
   - **Impact:** May require strategic pivot

---

## 7. Recommendations Summary

### Keep

1. **Linear phase ordering** - The 14 → 15 → 16 → 17 logic is sound
2. **Success criteria specificity** - Clear, measurable outcomes per phase
3. **100% requirement mapping** - All 19 requirements mapped to phases
4. **E-E-A-T signals in Phase 14** - Trust signals before content push is correct

### Add

1. **Explicit keyword strategy phase** (before Phase 15)
2. **External dependency notation** for client authorization, guest post acceptance
3. **Backup content plans** for case study if authorization fails
4. **Parallel work streams** where possible (e.g., content briefs while technical fixes happen)

### Modify

1. **Phase 17 success criteria #2** - Change from "contacted" to "published"
2. **Phase 17 success criteria #3** - Set more achievable criteria or move to Phase 18
3. **Competitor analysis timing** - Move before content architecture, not after content development

### Remove / Rethink

1. **Nothing to remove** - All phases seem necessary

---

## 8. Suggested Dependency Diagram (Revised)

```
[Pre-Phase] Keyword Strategy + Competitor Analysis
    (run parallel to Phase 14 technical work)
           |
           v
Phase 14: Technical SEO Foundation
    (Track A: technical fixes)
    (Track B: E-E-A-T content collection from client)
           |
           v
Phase 15: Content Architecture
    (based on keyword strategy output)
           |
           v
Phase 16: Content Development
    (E-E-A-T compliant content with SME review)
    [EXTERNAL DEPENDENCY: Client case study authorization]
           |
           v
Phase 17: Authority Building
    [EXTERNAL DEPENDENCY: Guest post acceptance]
    [EXTERNAL DEPENDENCY: Chamber relationship building]
```

---

## 9. Risk Matrix

| Risk | Likelihood | Impact | Priority |
|------|------------|--------|----------|
| Client credential collection blocked | MEDIUM | HIGH | P1 |
| Case study authorization denied | MEDIUM | HIGH | P1 |
| AI content detection penalty | HIGH | HIGH | P1 |
| Content production bottleneck | HIGH | MEDIUM | P2 |
| Guest post acceptance rate | MEDIUM | MEDIUM | P2 |
| Core Web Vitals failures | LOW | HIGH | P2 |
| Competitor dominant positioning | LOW | HIGH | P2 |
| Google algorithm change | LOW | HIGH | P3 |
| Chamber relationship timeline | HIGH | LOW | P3 |

---

*Review completed: 2026-03-20*
*Files reviewed: ROADMAP.md, PITFALLS.md*
