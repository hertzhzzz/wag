# Pitfalls Research

**Domain:** GEO (Generative Engine Optimization) for existing websites
**Researched:** 2026-03-25
**Confidence:** MEDIUM

Note: Web search tools were unavailable during research. Findings are based on established SEO/GEO domain patterns and documented best practices. Some points may need validation against current AI crawler documentation as the field evolves rapidly.

---

## Critical Pitfalls

### Pitfall 1: Fabricated E-E-A-T Signals

**What goes wrong:**
AI systems (Perplexity, ChatGPT, Gemini) develop negative associations with your brand when caught fabricating trust signals. Unlike traditional SEO where fake signals might slip through, AI citation systems actively cross-reference and fact-check. Getting caught = permanent trust loss in AI responses.

**Why it happens:**
- Pressure to "look legitimate" competing against established players
- Misunderstanding that E-E-A-T signals must be demonstrable, not claimed
- Generic stock photos of "factory workers" / "business meetings" that AI has seen thousands of times
- Copying competitor's claimed credentials without verification

**How to avoid:**
- Only claim expertise you can substantiate with public, citable evidence
- Replace stock photos with authentic in-house imagery showing actual team, actual operations
- List only verifiable credentials: real business registrations, actual industry memberships, documented client relationships (with permission)
- Build topical authority through original content, not assertion

**Warning signs:**
- Content uses phrases like "trusted by 500+ clients" without specifics
- Team bios contain generic business school claims without linkedin verification
- "Established 2010" appears without supporting evidence on site
- Testimonials without identifying details or verification path

**Phase to address:** GEO-03 (Content Citability Optimization) — before any E-E-A-T markup

---

### Pitfall 2: llms.txt Misconfiguration

**What goes wrong:**
llms.txt generated incorrectly causes AI crawlers to miss or misinterpret content, resulting in your site not being cited or being cited incorrectly.

**Why it happens:**
- Treating llms.txt like robots.txt (blocking instead of allowing)
- Including too much content (AI ignores walls of text)
- Not prioritizing pages by citation value
- Missing geographic relevance signals
- Invalid or inconsistent YAML structure

**How to avoid:**
- Include only high-value pages optimized for citation (FAQ, About, Services summary)
- Use clear page descriptions that answer "what is this page about" + geographic context
- Prioritize content with factual claims that AI can verify
- Keep descriptions concise (2-3 sentences max per page)
- Mark geographic relevance explicitly (e.g., "Australian business serving clients in China sourcing")

**Warning signs:**
- llms.txt is longer than 10KB
- No geographic signals in descriptions
- Pages with thin content included
- No priority/importance ranking

**Phase to address:** GEO-01 (llms.txt generation) — requires understanding AI crawler behavior

---

### Pitfall 3: AI Schema Markup Overclaiming

**What goes wrong:**
Schema markup that claims AI-visible attributes you cannot substantiate (e.g., claiming "award" schema when no verifiable award exists, or "review" markup on unverified testimonials).

**Why it happens:**
- Copying competitor schema patterns without understanding requirements
- Believing "marked up = claimed" without realizing AI cross-checks
- Adding schema for things that exist but cannot be independently verified

**How to avoid:**
- Audit every schema claim against public verification sources
- Use OfficialRecordsSchema for verifiable registrations
- Use ProfessionalService schema only for genuinely licensed professionals
- Limit Person schema to individuals with public profiles (LinkedIn, industry databases)
- Add cite structured data for content you want attributed
- Avoid Review/MonetaryAmount schema unless backed by real transaction data

**Warning signs:**
- ReviewSchema present but testimonials are anonymous
- Award schema without corresponding press coverage
- MonetaryAmount/PriceSpecification on services without public pricing
- Statistics in schema ("helped 500+ clients") not cited elsewhere

**Phase to address:** GEO-05 (Schema完整性审查) — verify every schema claim

---

### Pitfall 4: Geographic Signal Confusion

**What goes wrong:**
Site claims to serve one geographic market but schema/llms.txt suggests another, confusing AI citation systems about who you are and who you serve.

**Why it happens:**
- Inheriting legacy SEO patterns from previous site redesign
- Mixing headquarters location with service area
- Not updating structured data when service geography changed
- Using generic "we serve global markets" without specifics

**How to avoid:**
- Be explicit: "Based in Australia, serving Australian businesses with China sourcing" not "global leader"
- Use PostalAddress schema consistently (one canonical location)
- Use Service geographicArea to define service boundaries
- Ensure llms.txt geographic signals match visible content

**Warning signs:**
- Schema says one location, footer says another
- "Serving clients worldwide" in content but no specific markets
- Business listing data inconsistent across directories

**Phase to address:** GEO-04 (GEO Technical Audit) — verify geographic consistency

---

### Pitfall 5: Thin Content Citability Failure

**What goes wrong:**
Pages look substantial to humans but lack the specific factual claims AI needs for citation (numbers, dates, specific processes, named methodologies).

**Why it happens:**
- Writing marketing copy that sounds good but contains no citable facts
- Using generic value propositions ("we provide excellent service") instead of specifics ("our verification process includes 12-point factory assessment")
- No original data or unique insights that distinguish from competitors

**How to avoid:**
- Add specific, verifiable claims to every page:
  - Process steps with named phases
  - Statistics with methodology ("based on X factory audits since Y")
  - Named case studies (with permission) over generic "case studies"
  - Specific qualifications (e.g., "certified by SGS for factory assessment")
- Replace "we are the best" with "here's our specific approach and why it works"

**Warning signs:**
- Content uses only superlatives without specifics
- FAQ answers are generic without actionable details
- "Learn more" links instead of embedded information
- No dates, numbers, or named entities

**Phase to address:** GEO-03 (Content Citability Optimization) — requires content audit

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|-------------------|
| llms.txt + existing sitemap | llms.txt contradicts robots.txt directives | llms.txt should only reference allowed pages |
| FAQ schema + llms.txt | FAQ page in llms.txt but no FAQPage schema | Ensure FAQPage schema exists on pages listed |
| About page + Person schema | Multiple Person schemas without clear org relationship | Use Organization schema with member/memberOf |
| Service pages + LocalBusiness | Generic service descriptions without geographic bounds | Use Service with ServiceArea specification |
| Blog articles + Article schema | Article schema without author verification path | Author must have linked public profile or ORCID |

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Copy competitor schema | Fast implementation | Schema may not match actual business | Never — each claim must be verifiable |
| Add llms.txt last minute | Ships with milestone | Poor prioritization, wrong content | Never — needs content planning |
| Generic testimonials | Fills "social proof" gap | AI detects fabrication, destroys trust | Never — only real testimonials |
| "Global leader" claims | Sounds impressive | Geographic confusion in AI systems | Only if verifiable and specific |
| JSON-LD without visible change | Schema validates | No user-facing citation benefit | Only for truly non-visible claims |

---

## "Looks Done But Isn't" Checklist

- [ ] **llms.txt:** Often generated but contains wrong pages — verify AI-readable descriptions exist for each entry
- [ ] **FAQPage schema:** Often added but not tested with structured data testing tools — validate each property
- [ ] **E-E-A-T claims:** Often made in text but not backed by linked evidence — every claim needs a verification path
- [ ] **Geographic signals:** Often stated vaguely — verify "serving X area" matches Service schema and llms.txt
- [ ] **Author bylines:** Often included but without linked profiles — add ORCID or LinkedIn to Author schema

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Fabricated E-E-A-T discovered by AI | HIGH | Remove claims immediately, replace with authentic content, wait for AI re-crawl (months) |
| llms.txt misconfiguration | MEDIUM | Fix YAML, resubmit to AI platforms, monitor citation accuracy |
| Schema overclaiming | MEDIUM | Audit all schemas against actual evidence, remove unverifiable claims, resubmit |
| Geographic confusion | LOW | Ensure consistency across all structured data and content |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Fabricated E-E-A-T | GEO-03 (Content audit first) | Content matches verifiable evidence |
| llms.txt misconfiguration | GEO-01 (Plan before generation) | AI-readable validation tools |
| AI Schema overclaiming | GEO-05 (Schema audit) | Structured data testing tools |
| Geographic signal confusion | GEO-04 (Crawler compliance audit) | Consistent data across all sources |
| Thin content citability | GEO-03 (Content optimization) | Factual claim density check |

---

## Sources

**Low confidence** — Web search unavailable. Based on established SEO/GEO domain patterns:

- General Schema.org best practices (schema.org documentation)
- Google E-E-A-T guidelines (Google Search Central)
- llms.txt community discussion (GitHub/etc/lms.txt repository)
- AI citation system patterns (documented behavior of Perplexity, ChatGPT, Claude)

**Validation needed:** Current AI crawler documentation for llms.txt specification, as the format is still evolving.

---

*Pitfalls research for: GEO Optimization for WAG Website*
*Researched: 2026-03-25*
