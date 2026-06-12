---
title: 1688 Factory Product Catalog URL Pattern
date: 2026-06-12
category: docs/solutions/conventions
module: factory-data
problem_type: convention
component: tooling
severity: medium
applies_when:
  - "Scraping 1688 factory product catalogs during data extraction"
  - "Finding product listings for a factory given only the memberId"
tags:
  - 1688
  - product-catalog
  - url-pattern
  - scraping
  - factory-data-extract
---

# 1688 Factory Product Catalog URL Pattern

## Context

When extracting product data from 1688 factories, the factory card page (`card.html?memberId=xxx`) shows only a subset of products in the "主推商品" section. The full product catalog is behind a "查看更多" link. Clicking through the browser to the catalog page then scraping is fragile; extracting the link's `href` directly is faster and deterministic.

## Guidance

All 1688 factory product catalogs share a single slug `l6rr893d`. The full catalog URL is:

```
https://sale.1688.com/factory/l6rr893d.html?memberId={memberId}
```

The "查看更多" link is located at:

```
CSS selector: #pc_card_shop > div:nth-child(1) > a[href*="l6rr893d"]
```

The product count is visible in a div near the "查看更多" link as `共{count}个商品`.

### Extraction steps

1. Navigate to the factory card: `https://sale.1688.com/factory/card.html?memberId={memberId}`
2. Extract the "查看更多" link's `href` attribute from `#pc_card_shop` — no click needed
3. Parse the product count from `共{N}个商品` in the same section
4. Navigate directly to the catalog URL to scrape full product listings

### Browser-harness example

```python
# Get catalog URL and count
more_link = js("""(() => {
    const shop = document.querySelector('#pc_card_shop');
    if (!shop) return '';
    const links = [...shop.querySelectorAll('a')];
    const more = links.find(a => (a.innerText || '').includes('查看更多'));
    return more ? more.href : '';
})()""")

count = js("""(() => {
    const shop = document.querySelector('#pc_card_shop');
    const m = (shop?.innerText || '').match(/共(\d+)个商品/);
    return m ? m[1] : 'N/A';
})()""")
```

## Why This Matters

- **Speed**: extracting the href attribute is instant; clicking and waiting for navigation adds 3-5 seconds per factory
- **Reliability**: the URL pattern is stable across all factories — the slug `l6rr893d` is shared
- **Batch efficiency**: five factories × 5 seconds saved = 25 seconds wall-clock time saved per batch

## When to Apply

- Any time you need a factory's full product catalog from 1688 and only have the `memberId`
- During factory-data-extract Phase 5 (1688 product extraction)
- During factory wiki maintenance when enriching product data

## Examples

All five tested factories use the same pattern:

| Factory | memberId | Catalog URL |
|---------|----------|-------------|
| 丰晟 | b2b-2219369342877423f2 | `.../factory/l6rr893d.html?memberId=b2b-2219369342877423f2` |
| 万马 | lenocrn | `.../factory/l6rr893d.html?memberId=lenocrn` |
| 聆音 | b2b-221601439672461f35 | `.../factory/l6rr893d.html?memberId=b2b-221601439672461f35` |
| 中悦 | b2b-22076459619083cdf1 | `.../factory/l6rr893d.html?memberId=b2b-22076459619083cdf1` |

## Related

- `factory-data-extract` skill — Phase 5 uses this pattern
- `factory-wiki` skill — product data enrichment
