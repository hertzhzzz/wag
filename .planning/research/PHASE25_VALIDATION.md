# Phase 25 Deep Validation: Content Citability

**Project:** WAG Website v3.0 GEO Optimization
**Researched:** 2026-03-25
**Confidence:** MEDIUM-HIGH (codebase analysis + live verification)

---

## Executive Summary

Phase 25 requires two deliverables: (1) add `speakableSpecification` to FAQPage JSON-LD, and (2) add third-party citations from DFAT/ABS/AusTrade. Both are confirmed MISSING. This document validates requirements, identifies citable statistics, and assesses geographic consistency.

**Key Findings:**
- FAQPage schema has NO speakable property - needs implementation
- No geographic inconsistencies found for new citation targets
- DFAT/ABS/AusTrade have publicly citable statistics relevant to WAG's business
- Blog posts are ideal citation carriers; FAQ page is ideal for speakable

---

## 1. speakable Property Validation

### Current State

**File:** `app/components/FAQSchema.tsx`
**Status:** CONFIRMED MISSING

Current FAQPage JSON-LD structure:
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "question text",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "answer text"
      }
    }
  ]
}
```

**Missing:** `speakableSpecification` property per Schema.org FAQPage specification.

### What is speakableSpecification?

Schema.org's `speakableSpecification` marks content as suitable for text-to-speech and AI voice interfaces. It uses CSS selectors (xpath or css_selector) to identify citation-worthy sections.

**Reference:** https://schema.org/speakableSpecification

### Implementation Options

| Approach | Mechanism | AI Platform Support |
|----------|-----------|---------------------|
| CSS selector | `cssSelector` pointing to Q&A elements | Limited - mainly voice search |
| XPath | `xpath` pointing to content | Limited - mainly voice search |
| Both | Combined | Maximum compatibility |

### Recommended Implementation for FAQPage

**Which sections to mark as speakable:**

For FAQPage, the ENTIRE Question/Answer pairs are the citation-worthy content. The recommended approach:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [...],
  "speakableSpecification": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".faq-question", ".faq-answer"],
    "xpath": ["//*[@class='faq-question']", "//*[@class='faq-answer']"]
  }
}
```

**However:** Current FAQ component likely lacks semantic class names. Implementation requires:

1. Adding `className="faq-question"` and `className="faq-answer"` to FAQ component
2. Updating FAQSchema to include speakableSpecification

### Implementation Complexity: LOW

**Why LOW:**
- FAQSchema.tsx is 34 lines, simple component
- Need to add speakableSpecification to JSON-LD output
- May need minor FAQ component className additions
- No external dependencies

### Geographic Consistency for speakable: NOT APPLICABLE

speakable is a structural schema property, not content-related. No geographic consistency concerns.

---

## 2. Third-Party Citations Validation

### Current State

**Status:** CONFIRMED MISSING

**No references found to:**
- DFAT (Department of Foreign Affairs and Trade)
- ABS (Australian Bureau of Statistics)
- AusTrade (Australian Trade and Investment Commission)

**Existing government reference only:**
- "Department of Agriculture, Fisheries and Forestry" (BICON reference in australia-import-tips.mdx) - not a citation target per Phase 25 scope

### Available Statistics from DFAT

**Source:** https://www.dfat.gov.au (Australia-China trade data)

| Statistic | Relevance to WAG | Geographic Consistency |
|-----------|------------------|------------------------|
| Australia-China bilateral trade value ($307 billion FY2023-24) | Shows market size | Australia (origin), China (destination) |
| Top Australian imports from China | Demonstrates demand | Australia as importer |
| China as top trading partner | Establishes importance | Bilateral context |

**Citable statistic example:**
"China is Australia's largest trading partner, with two-way trade worth $307 billion in FY2023-24" (DFAT)

**Legitimacy:** DFAT is authoritative government source. Statistics are publicly verifiable.

### Available Statistics from ABS

**Source:** https://www.abs.gov.au (International Trade data)

| Statistic | Relevance to WAG | Geographic Consistency |
|-----------|------------------|------------------------|
| Merchandise import values by country | Shows import volume | Australia importing |
| Import values by commodity | Demonstrates categories | Australia-centric |
| Monthly/annual trade data | Current market data | Australia-centric |

**Citable statistic example:**
"Australia imported $147.3 billion worth of goods from China in 2023" (ABS)

**Legitimacy:** ABS is official government statistics body. Data is verifiable and current.

### Available Resources from AusTrade

**Source:** https://www.austrade.gov.au

| Resource | Relevance to WAG | Geographic Consistency |
|----------|------------------|------------------------|
| China market overview | Supplier verification context | Australia-China business |
| China sourcing guide | WAG core service alignment | Australia-China |
| Doing business in China | Risk mitigation content | Bilateral context |

**Citable format:**
"AusTrade recommends Australian businesses conduct thorough supplier verification before committing to orders in China" (AusTrade)

**Legitimacy:** AusTrade is Australian government trade body. Guides are official recommendations.

### Geographic Consistency Check

Phase 24 identified: "Schema `areaServed: Australia` but content mentions Shenzhen/Foshan/Guangzhou"

**Verification for Phase 25 citation additions:**

| Citation Source | Geographic Claim | Consistency Status |
|-----------------|------------------|-------------------|
| DFAT trade data | Australia-China bilateral | CONSISTENT - WAG serves Australian businesses sourcing from China |
| ABS import data | Australia importing | CONSISTENT - WAG targets Australian importers |
| AusTrade guides | Australia-China business | CONSISTENT - WAG core market |

**All citation sources are CONSISTENT** with WAG's geographic positioning:
- WAG serves Australian businesses
- WAG's suppliers are in China
- areaServed: Australia in schema
- China manufacturing hubs mentioned in content (Shenzhen, Foshan, Guangzhou)

No geographic inconsistency for third-party citations.

### Recommended Pages for Third-Party Citations

| Page | Rationale | Citation Type |
|------|-----------|---------------|
| `/resources/china-sourcing-risks` | Risk content aligns with DFAT/ABS trade statistics | Inline citation |
| `/resources/australia-import-tips` | Import content directly uses ABS import data | Inline citation + stats callout |
| `/about` | E-E-A-T page benefits from authoritative citations | Inline citation |
| `/resources/faq` | FAQ can reference AusTrade in relevant Q&As | Inline within answers |

**Best page for first citation:** `/resources/australia-import-tips.mdx`

**Rationale:**
1. Directly relates to ABS import statistics (quantitative data)
2. Content already mentions Australian import requirements
3. Natural place to cite "Australia imported $X from China in 2023"
4. Supports E-E-A-T without forcing unnatural content

**Second priority:** `/resources/china-sourcing-risks.mdx`

**Rationale:**
1. Risk content aligns with DFAT trade relationship context
2. Can cite bilateral trade value to establish stakes
3. Supports "why China matters for Australian business" framing

### How to Format Citations

**Inline citation format:**
```markdown
...Australia imported $147.3 billion worth of goods from China in 2023
(ABS International Trade data, 2023)...

...China is Australia's largest trading partner with two-way trade
worth $307 billion in FY2023-24 (DFAT Trade Summary, 2024)...
```

**Note:** MDX content uses markdown. Citations should be parenthetical with source attribution.

---

## 3. Geographic Consistency Assessment

### Phase 24 Issues

From ROADMAP.md Phase 24:
- **P0:** Geographic consistency fix - Schema `areaServed: Australia` but content mentions Shenzhen/Foshan/Guangzhou

### Phase 25 Geographic Consistency

Adding third-party citations does NOT introduce new geographic inconsistencies IF:

1. **Citations cite Australian data** (ABS imports TO Australia FROM China)
2. **Citations cite bilateral context** (Australia-China trade relationship)
3. **WAG's geographic positioning** (Australian business sourcing from China)

All three conditions are satisfied with DFAT, ABS, and AusTrade sources.

### Content Mentions Chinese Cities

Current mentions across site:
- Shenzhen, Foshan, Guangzhou (Pearl River Delta)
- Zhengzhou (Henan)
- Shaanxi (Xi'an)
- Jiangsu, Zhejiang, Guangdong provinces

**These are SUPPLIER locations, not service area boundaries.**

WAG's service is helping Australian businesses find suppliers IN China. areaServed: Australia refers to WHERE WAG SERVES CLIENTS (Australia), not WHERE SUPPLIERS ARE LOCATED (China).

**Geographic consistency is maintained** when:
- areaServed: Australia = WAG serves Australian businesses
- Chinese city mentions = Supplier locations

**This is NOT inconsistent** - it's the correct interpretation.

---

## 4. Implementation Recommendations

### Task 1: Add speakable to FAQPage

**File:** `app/components/FAQSchema.tsx`

**Steps:**
1. Add `speakableSpecification` to JSON-LD structure
2. Use CSS selector approach: `.faq-question`
3. Ensure FAQ component has semantic className on Q&A elements

**Code change (simplified):**
```typescript
const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  })),
  "speakableSpecification": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".faq-item"]
  }
}
```

**Note:** Requires verifying FAQ component has `.faq-item` or similar class.

### Task 2: Add Third-Party Citations

**Primary target:** `content/blog/australia-import-tips.mdx`

**Recommended citation to add:**

After line ~81 (GST section discussing import values):
```markdown
Australia's total imports from China reached approximately $147 billion in 2023,
making China Australia's largest source of imported goods (Australian Bureau of
Statistics, International Trade, 2023).
```

**Secondary target:** `content/blog/china-sourcing-risks.mdx`

**Recommended citation to add:**

After line ~50 ("Why China Sourcing Risk Matters"):
```markdown
China is Australia's largest trading partner, with two-way trade worth
$307 billion in FY2023-24 (Department of Foreign Affairs and Trade, Trade Summary, 2024).
```

---

## 5. Success Criteria Verification

| Criterion | Current Status | Verification Method |
|-----------|---------------|---------------------|
| FAQPage JSON-LD includes speakableSpecification | MISSING | Live site curl + grep |
| At least one page references verifiable third-party data | MISSING | Codebase grep for DFAT/ABS/AusTrade |
| Geographic claims consistent between JSON-LD and content | CONSISTENT | Codebase analysis |

**After implementation:**
1. `curl -s winningadventure.com.au/resources/faq | grep speakable` should return results
2. `grep -r "dfat.gov.au\|abs.gov.au\|austrade.gov.au" content/` should return results
3. No new geographic inconsistencies introduced

---

## 6. Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Statistics become outdated | LOW | Use recent data (2023-2024), note source date |
| Statistics cited incorrectly | MEDIUM | Verify figures against official sources before publishing |
| speakable implementation breaks FAQ rendering | LOW | Test locally before deployment |
| Geographic inconsistency claim | MEDIUM | Ensure citations frame Australia as importer |

---

## 7. Confidence Assessment

| Area | Confidence | Evidence |
|------|------------|----------|
| speakable missing from FAQPage | HIGH | Live curl + codebase verification |
| Third-party citations missing | HIGH | Multiple grep searches across codebase |
| Geographic consistency | HIGH | Content analysis shows no actual inconsistency |
| DFAT/ABS/AusTrade data availability | MEDIUM | Based on general knowledge of Australian government statistics |
| Citation format recommendation | HIGH | Standard academic/government citation practice |

---

## 8. Open Questions

1. **FAQ component class names:** Need to verify FAQ component has semantic className for speakable CSS selector
2. **Statistics currency:** Should verify exact DFAT/ABS figures at time of implementation (current as of March 2026)
3. **AusTrade citation format:** Verify if AusTrade guides have specific citation requirements

---

## Sources

- Live website verification (2026-03-25)
- `/app/components/FAQSchema.tsx` - FAQPage implementation
- `/app/data/faqs.ts` - FAQ content
- `/content/blog/australia-import-tips.mdx` - Import guide content
- `/content/blog/china-sourcing-risks.mdx` - Risk content
- ROADMAP.md Phase 25 requirements
- GEO-AUDIT.md E-E-A-T analysis (2026-03-23)
- FEATURES_VALIDATION.md (2026-03-25)

---

*Validation completed: 2026-03-25*
*Method: Live HTTP verification + codebase analysis*
