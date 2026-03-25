# Phase 24 Deep Validation: Schema Consistency

**Research Date:** 2026-03-25
**Validation Mode:** Direct site inspection + source code analysis
**Confidence:** HIGH (direct inspection of live site and source code)

---

## Executive Summary

Phase 24 has 6 tasks to validate. After thorough inspection of the live site (https://www.winningadventure.com.au) and source code:

| Task | Status | Finding |
|------|--------|---------|
| Geographic consistency | FAILED | Schema says Australia only, content mentions China locations |
| Supplier count standardization | FAILED | 500+ vs 100+ inconsistency across pages |
| Industry count standardization | FAILED | 15+ vs 50+ inconsistency across pages |
| BreadcrumbSchema on /enquiry | FAILED | Missing on /enquiry page only |
| Andy Liu LinkedIn in Person schema | PARTIAL | PersonSchema.tsx has correct URL, but Organization schema uses company LinkedIn |
| ABN verification link | FAILED | ABN displayed but no link to Australian Business Register |

---

## Validation Detail

### Task 1: Geographic Inconsistency

**Issue:** Schema `areaServed: Australia` but content mentions Shenzhen/Foshan/Guangzhou/China

**Findings:**

| Source | Geographic Claim |
|--------|-----------------|
| Organization schema (layout.tsx) | `areaServed: { "@type": "Country", "name": "Australia" }` |
| LocalBusiness schema (layout.tsx) | `areaServed: [{ "@type": "State", "name": "South Australia" }, { "@type": "Country", "name": "Australia" }]` |
| Service schema (/services) | `areaServed: { "@type": "Country", "name": "Australia" }` |
| FAQ content (homepage) | "Shenzhen, Foshan, and Guangzhou", "Pearl River Delta and Yangtze River Delta", "6 Chinese provinces" |
| About page content | "Shenzhen, Foshan, Guangzhou, Zhengzhou, Shaanxi", "6 Chinese provinces" |
| llms.txt | "China Operations: Shenzhen, Foshan, Guangzhou, Zhengzhou, Shaanxi (6 provinces)" |

**Source Code Evidence:**

```typescript
// app/layout.tsx - Organization schema (line 138-141)
"areaServed": {
  "@type": "Country",
  "name": "Australia"
},

// app/layout.tsx - LocalBusiness schema (line 173-182)
"areaServed": [
  { "@type": "State", "name": "South Australia" },
  { "@type": "Country", "name": "Australia" }
],

// app/components/ServiceSchema.tsx (line 13)
"areaServed": {
  "@type": "Country",
  "name": "Australia"
}
```

**Conclusion:** Geographic inconsistency is **CONFIRMED**. Schema only says Australia, but content extensively mentions China locations (Shenzhen, Foshan, Guangzhou, Zhengzhou, Shaanxi, Pearl River Delta, Yangtze River Delta).

---

### Task 2: Supplier Count Inconsistency

**Issue:** "100+ verified suppliers" vs "500+ suppliers" across pages

**Findings:**

| Source | Supplier Claim | Exact Text |
|--------|---------------|------------|
| Homepage FAQ | 500+ | "We have 500+ verified suppliers across 15+ industries" |
| Homepage FAQ | 500+ | "verified 500+ Chinese wholesalers" |
| About page (content) | 100+ | "100+ verified suppliers across Guangdong, Shenzhen, Foshan, Guangzhou, Zhengzhou, and Shaanxi" |
| llms.txt | 500+ | "Verified Suppliers: 500+" |
| Enquiry form trust stats | 500+ | "500+" (Verified stat) |

**Source Code Evidence:**

```typescript
// Homepage FAQ (extracted from live site)
"We have 500+ verified suppliers across 15+ industries"
"verified 500+ Chinese wholesalers"

// app/about/page.tsx (line 156)
"Our network of 100+ verified suppliers across Guangdong, Shenzhen, Foshan, Guangzhou, Zhengzhou, and Shaanxi"

// llms.txt
"Verified Suppliers: 500+"

// app/enquiry/EnquiryForm.tsx (line 339)
<p className="text-lg font-bold text-[#0F2D5E]">500+</p>
```

**Conclusion:** Supplier count inconsistency is **CONFIRMED**. Homepage FAQ + llms.txt + Enquiry form say "500+", but About page says "100+". Major inconsistency.

---

### Task 3: Industry Count Inconsistency

**Issue:** "15+ industries" vs "50+ industries" across pages

**Findings:**

| Source | Industry Claim | Exact Text |
|--------|---------------|------------|
| Homepage FAQ | 15+ | "across 15+ industries" |
| About FAQ | 50+ | "across 50+ industries including manufacturing, technology, food and health, construction, property, agriculture, automotive, and packaging" |
| llms.txt | 15+ | "across 15+ industries" |

**Source Code Evidence:**

```typescript
// Homepage FAQ (extracted from live site)
"We have 500+ verified suppliers across 15+ industries"

// app/about/page.tsx - aboutFaqs data
"Our team has experience across 50+ industries including manufacturing, technology, food and health, construction, property, agriculture, automotive, and packaging"

// llms.txt
"across 15+ industries"
```

**Conclusion:** Industry count inconsistency is **CONFIRMED**. Homepage FAQ + llms.txt say "15+", About FAQ says "50+".

---

### Task 4: BreadcrumbSchema on /enquiry Page

**Issue:** Only /enquiry page is missing BreadcrumbList schema

**Findings:**

| Page | BreadcrumbList Schema | Items |
|------|---------------------|-------|
| / (homepage) | Not present in extracted JSON-LD | - |
| /about | YES | Home > About |
| /services | YES | Home > Services |
| /resources | YES | Home > Resources |
| /enquiry | **NO** | **Missing** |

**Source Code Evidence:**

```typescript
// app/about/page.tsx (line 36-39)
<BreadcrumbSchema items={[
  { name: 'Home', url: 'https://www.winningadventure.com.au' },
  { name: 'About', url: 'https://www.winningadventure.com.au/about' }
]} />

// app/services/page.tsx - uses BreadcrumbSchema (similar pattern)

// app/resources/page.tsx - uses BreadcrumbSchema (similar pattern)

// app/enquiry/page.tsx - NO BreadcrumbSchema import or usage
// app/enquiry/EnquiryForm.tsx - NO BreadcrumbSchema import or usage
```

**Extracted from live /enquiry page JSON-LD:**
```json
// Only LocalBusiness schema present, NO BreadcrumbList
{"@type":"LocalBusiness", "name":"Winning Adventure Global", ...}
```

**Conclusion:** BreadcrumbSchema missing on /enquiry is **CONFIRMED**. Only /enquiry lacks this schema.

---

### Task 5: Andy Liu LinkedIn in Person Schema

**Issue:** Person schema `sameAs` links to company page, not personal profile

**Findings:**

| Schema Location | LinkedIn URL | Type |
|----------------|--------------|------|
| PersonSchema.tsx (line 28) | `https://www.linkedin.com/in/andyliu-wag` | Personal profile |
| Organization schema - embedded Person (layout.tsx line 124) | `https://www.linkedin.com/company/winning-adventure-global` | Company page |

**Source Code Evidence:**

```typescript
// app/components/PersonSchema.tsx (line 27-29) - CORRECT (personal profile)
"sameAs": [
  "https://www.linkedin.com/in/andyliu-wag"
],

// app/layout.tsx - Organization schema (line 123-125) - INCORRECT (company page)
"founder": {
  "@type": "Person",
  "name": "Andy Liu",
  "jobTitle": "Founder",
  "url": "https://www.winningadventure.com.au/about",
  "sameAs": [
    "https://www.linkedin.com/company/winning-adventure-global"  // <-- Company page!
  ],
  ...
}
```

**Issue Analysis:**

The Organization schema in layout.tsx has an embedded Person object for Andy Liu, but that Person's `sameAs` array uses the **company LinkedIn** (`linkedin.com/company/winning-adventure-global`) instead of the **personal LinkedIn** (`linkedin.com/in/andyliu-wag`).

The separate PersonSchema.tsx component (used on /about page) has the correct personal LinkedIn URL, but:
1. It's only used on the /about page
2. The Organization schema in layout.tsx (which appears on ALL pages) has the wrong URL

**Conclusion:** Andy Liu LinkedIn issue is **PARTIALLY FIXED**. PersonSchema.tsx has correct URL, but Organization schema embeds Person with company LinkedIn instead of personal LinkedIn.

---

### Task 6: ABN Verification Link

**Issue:** ABN displayed but no verification link to Australian Business Register

**Findings:**

| Location | ABN Display | Has Verification Link |
|----------|-------------|----------------------|
| Footer (all pages) | "ABN: 30 659 034 919" | NO - plain text only |
| About page (line 238) | "30 659 034 919" | NO - plain text only |
| Organization schema (layout.tsx line 137) | `"ABN": "30 659 034 919"` | NO - schema only |
| llms.txt | "ABN: 30 659 034 919" | NO - plain text |

**Source Code Evidence:**

```typescript
// app/components/Footer.tsx (line 141)
<span>ABN: 30 659 034 919</span>

// app/about/page.tsx (line 238)
<p className="text-gray-700">30 659 034 919</p>

// app/layout.tsx (line 137)
"ABN": "30 659 034 919",
```

**Expected Verification URL:** `https://www.abr.business.gov.au/ABN/View?id=30659034919`

**Conclusion:** ABN verification link is **MISSING**. ABN is displayed but never linked to Australian Business Register for verification.

---

## Summary of Required Fixes

| Priority | Issue | Current State | Required Fix |
|----------|-------|---------------|--------------|
| P0 | Geographic inconsistency | `areaServed: Australia` only | Add China to `areaServed` in schemas |
| P0 | Supplier count | 500+ vs 100+ | Pick ONE number, use consistently |
| P0 | Industry count | 15+ vs 50+ | Pick ONE number, use consistently |
| P1 | BreadcrumbSchema | Missing on /enquiry | Add BreadcrumbSchema to /enquiry |
| P1 | Andy Liu LinkedIn | Company URL in Org schema | Use personal LinkedIn in Organization's embedded Person |
| P1 | ABN verification | No link | Link ABN to ABR lookup |

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Geographic inconsistency | HIGH | Direct site inspection + source code confirms |
| Supplier count inconsistency | HIGH | Multiple pages with different numbers confirmed |
| Industry count inconsistency | HIGH | Multiple pages with different numbers confirmed |
| BreadcrumbSchema on /enquiry | HIGH | Confirmed missing via live site JSON-LD + source code |
| Andy Liu LinkedIn | HIGH | Source code analysis confirms Organization schema has wrong URL |
| ABN verification | HIGH | Confirmed missing - plain text only, no link |

---

## Sources

- Live site inspection: https://www.winningadventure.com.au (2026-03-25)
- Source code: /Users/mark/Projects/wag/app/layout.tsx
- Source code: /Users/mark/Projects/wag/app/components/PersonSchema.tsx
- Source code: /Users/mark/Projects/wag/app/components/ServiceSchema.tsx
- Source code: /Users/mark/Projects/wag/app/components/Footer.tsx
- Source code: /Users/mark/Projects/wag/app/about/page.tsx
- Source code: /Users/mark/Projects/wag/app/enquiry/page.tsx
- Source code: /Users/mark/Projects/wag/app/enquiry/EnquiryForm.tsx
- llms.txt: https://www.winningadventure.com.au/llms.txt

---

*Validation completed: 2026-03-25*
*Validator: GSD Research Agent*
