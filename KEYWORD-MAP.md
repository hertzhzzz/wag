# WAG Keyword Map — /services vs /resources/china-sourcing-agent

**Created:** 2026-05-12
**Purpose:** Resolve cannibalization risk between two service/commercial landing pages

---

## 1. Keyword Allocation

### `/services` — Service Overview Page

**Role:** Broad category + tour-focused service page. Targets informational-to-commercial transition queries.

| Type | Keywords |
|------|----------|
| **Primary** | china sourcing tour, china factory tour, factory visit china, supplier verification china |
| **Secondary** | australia china sourcing agent, sydney china procurement, melbourne import from china, brisbane alibaba alternative, perth china sourcing, Australia-based factory visit |

**SERP intent:** Users searching "china sourcing tours" or "factory visit china" want to understand the service category and compare options. The `/services` page serves as the category hub.

---

### `/resources/china-sourcing-agent` — China Sourcing Agent Landing Page

**Role:** Dedicated commercial landing page for the "china sourcing agent" product keyword.

| Type | Keywords |
|------|----------|
| **Primary** | china sourcing agent, china sourcing agent for australian businesses, australian business china sourcing |
| **Secondary** | china procurement agent, factory verification china, quality control china, supplier verification australia |

**SERP intent:** Users searching "china sourcing agent" want a specific service product. Google shows service landing pages (not blog indexes). This page is purpose-built for that intent.

---

## 2. Overlap Resolution

### Disputed zone: "factory verification china"

| Page | Usage | Decision |
|------|-------|----------|
| `/services` | keyword list + content section "How we verify factories" | **Keep** — generic category descriptor, informational framing |
| `/resources/china-sourcing-agent` | keyword list + "What We Do" section | **Primary owner** — commercial framing, specific value proposition |

**Rule:** When both pages could rank for the same keyword, the page with stronger commercial intent and more direct answer wins. `/resources/china-sourcing-agent` wins "factory verification china" because its page type (service landing page) matches SERP expectations for commercial queries.

### Disputed zone: "australia china sourcing agent"

| Page | Usage | Decision |
|------|-------|----------|
| `/services` | keyword list | **Secondary** — part of city/region cluster |
| `/resources/china-sourcing-agent` | keyword list | **Primary** — explicit "for australian businesses" in H1 and meta |

**Rule:** Exact-match modifiers ("for australian businesses") belong to the page with matching intent signal. `/resources/china-sourcing-agent` wins via H1 alignment.

---

## 3.分工说明

```
/services
├── Role: Service category hub (broader intent)
├── Targets: "china sourcing tour", "factory visit china", city-based queries
├── Content: Overview, 4 differentiators, case studies, verification process, tour vs procurement cards
└── Internal links to: /resources/china-factory-tour-guide, /resources/bulk-procurement-china-guide, blog articles

/resources/china-sourcing-agent
├── Role: Product landing page (specific intent)
├── Targets: "china sourcing agent", "china sourcing agent for australian businesses"
├── Content: Service definition, 4 capabilities, 6-step process, comparison table (DIY vs Alibaba vs WAG), FAQ
└── Internal links to: /enquiry, /china-sourcing-guide-australia
```

**No cannibalization** if each page targets its assigned keyword cluster. Cross-link from `/services` to `/resources/china-sourcing-agent` where the agent service is mentioned.

---

## 4. Meta Title / Description Optimizations

### `/services` — Current vs Recommended

| Element | Current | Recommended |
|---------|---------|-------------|
| **Title** | "China Sourcing Tour Services \| Factory Visits & Supplier Verification" | "China Sourcing Services for Australian Businesses \| Winning Adventure Global" |
| **Description** | "Join guided China sourcing tours in Shenzhen, Guangzhou & Shanghai..." | "Australia-based team offering factory visits, supplier verification and procurement support for Australian businesses importing from China. Pre-screened factories, no upfront cost." |
| **Primary keyword** | "China Sourcing Tour Services" | "China Sourcing Services" + Australian modifier |

**Rationale:** "China Sourcing Services" is broader and captures tour + procurement + agent queries. Australian city signals ("Australia-based") reinforce local credibility.

---

### `/resources/china-sourcing-agent` — Current vs Recommended

| Element | Current | Recommended |
|---------|---------|-------------|
| **Title** | "China Sourcing Agent for Australian Businesses \| Winning Adventure Global" | "China Sourcing Agent Services \| Factory Verification & Procurement Support" |
| **Description** | "We help Australian businesses source quality products from China with factory verification, quality control, and procurement services. Australia-based team with feet on the ground in China." | "Dedicated China sourcing agent for Australian businesses — factory verification, quality control and end-to-end procurement support. Australia-based team with feet on the ground in China." |
| **Primary keyword** | "China Sourcing Agent" | Keep "china sourcing agent" as primary; add "factory verification" and "procurement support" to description |

**Rationale:** Current title is close but repeats "for Australian Businesses" in both title and description. Adding "Factory Verification & Procurement Support" gives search engines more semantic signal about what the agent actually does. Description removes redundant phrase "with feet on the ground in China" (already in hero text) and adds concrete capabilities.

---

## 5. Implementation Checklist

- [ ] Update `/services` metadata (title + description + keywords)
- [ ] Update `/resources/china-sourcing-agent` metadata (title + description)
- [ ] Add cross-link from `/services` to `/resources/china-sourcing-agent` (e.g., in "Australia-based team" section or differentiator block)
- [ ] Ensure `/services` does NOT use "china sourcing agent" as a primary keyword (it belongs to the landing page)
- [ ] Ensure `/resources/china-sourcing-agent` does NOT try to rank for city-based queries (those belong to `/services`)

---

## 6. Verification Commands

```bash
# Check /services meta
curl -s https://www.winningadventure.com.au/services | grep -o '<title>[^<]*</title>'

# Check /resources/china-sourcing-agent meta
curl -s https://www.winningadventure.com.au/resources/china-sourcing-agent | grep -o '<title>[^<]*</title>'

# Verify no keyword cannibalization (both pages should NOT share primary keywords)
# Run after implementation:
curl -s https://www.winningadventure.com.au/services | grep -i "china sourcing agent"
# Should appear only in navigation/links, not as page focus

# Check cross-link exists
curl -s https://www.winningadventure.com.au/services | grep -o 'href="[^"]*china-sourcing-agent[^"]*"'

# Google Rich Results Test
# https://search.google.com/test/rich-results?url=https://www.winningadventure.com.au/services
# https://search.google.com/test/rich-results?url=https://www.winningadventure.com.au/resources/china-sourcing-agent

# GSC URL Inspection (verify indexed)
python ~/.claude/skills/seo/scripts/gsc_inspect.py https://www.winningadventure.com.au/services --json | python3 -c "import sys,json; d=json.load(sys.stdin); print('Indexing:', d.get('indexingState','unknown'))"
python ~/.claude/skills/seo/scripts/gsc_inspect.py https://www.winningadventure.com.au/resources/china-sourcing-agent --json | python3 -c "import sys,json; d=json.load(sys.stdin); print('Indexing:', d.get('indexingState','unknown'))"
```

---

## 7. Monitoring

After implementation, watch GSC Coverage report for:
- "Crawled - currently not indexed" on either page → investigate thin content
- Keyword rankings shift (should see `/resources/china-sourcing-agent` gain "china sourcing agent" rankings, `/services` maintain "factory tour" rankings)
- No new cannibalization signals in Search Console