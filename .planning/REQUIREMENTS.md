# Requirements: v2.0 SEO Optimization

## Overview

**Milestone:** v2.0 SEO Optimization
**Competitor:** chinafactorytours.com
**Goal:** Surpass competitor in relevant keyword rankings through content strategy, directory page, and UI improvements

---

## Requirements Summary

| ID | Requirement | Priority | Type |
|----|-------------|----------|------|
| SEO-01 | Create Factory Directory page with map integration | P0 | Feature |
| SEO-02 | Implement floating contact button (bottom-right) | P0 | Feature |
| SEO-03 | Create dedicated FAQ pages with Schema markup | P1 | Content |
| SEO-04 | Strengthen E-E-A-T signals throughout site | P1 | Content |
| SEO-05 | Optimize existing pages for target keywords | P1 | SEO |
| SEO-06 | Create sitemap.xml and robots.txt optimization | P2 | Technical |

---

## Detailed Requirements

### SEO-01: Factory Directory Page

**Description:**
Create a `/directory` page showcasing verified Chinese factories, organized by industry and location. Use interactive map to visualize factory clusters.

**Acceptance Criteria:**
- [ ] Directory page at `/directory`
- [ ] Filter by industry (Furniture, Electronics, Robotics, EV Battery)
- [ ] Filter by location/region
- [ ] Interactive Leaflet map with factory markers
- [ ] Factory cards showing: Name, Location, Category, Verification badge
- [ ] Responsive design for mobile

**Implementation Notes:**
- Use Leaflet.js + OpenStreetMap (same as competitor, free)
- Factory data can be curated list initially (not database)
- Map markers clustered by city

---

### SEO-02: Floating Contact Button

**Description:**
Implement a persistent floating contact button in the bottom-right corner that opens a contact form modal.

**Acceptance Criteria:**
- [ ] Fixed position: bottom-right (20px from edges)
- [ ] Visible on all pages
- [ ] Click opens modal overlay with contact form
- [ ] Form fields: Name, Email, Message
- [ ] Mobile responsive (smaller on mobile)
- [ ] Smooth hover animation
- [ ] Accessible (ARIA labels)

**Implementation Notes:**
Based on competitor analysis, the floating button uses:
- `.fc-btn` class for the button
- `.fc-overlay` class for the modal backdrop
- `.fc-modal` class for the dialog
- Z-index: 10000 (button), 10001 (overlay)
- Blue color scheme (#1d4ed8)

---

### SEO-03: FAQ Pages with Schema Markup

**Description:**
Create dedicated FAQ pages targeting long-tail manufacturing keywords, with JSON-LD Schema markup for rich results.

**Acceptance Criteria:**
- [ ] `/resources/faq` page
- [ ] FAQ schema markup (Schema.org/FAQPage)
- [ ] Questions addressing:
  - How to find reliable suppliers in China
  - What certifications to look for
  - How to protect IP when manufacturing in China
  - Typical MOQs and lead times
  - Factory audit process
- [ ] Accordion-style expandable answers
- [ ] Internal linking to relevant service pages

**Keywords to Target:**
- "China factory verification process"
- "how to find reliable Chinese manufacturers"
- "PCB assembly China guide"
- "furniture manufacturers China"
- "IP protection China manufacturing"

---

### SEO-04: E-E-A-T Signal Strengthening

**Description:**
Enhance Experience, Expertise, Authoritativeness, and Trustworthiness signals across the site.

**Acceptance Criteria:**
- [ ] Team page with real credentials (or realistic for WAG positioning)
- [ ] "About" page with company story and mission
- [ ] Trust badges visible: Factory audit count, Years in business
- [ ] Client testimonials with names and companies
- [ ] Certification/association mentions
- [ ] Contact information visible on all pages

**Page Requirements:**
- [ ] `/about` page with company narrative
- [ ] `/team` or `/about#team` with team credentials
- [ ] Footer with: Address, Phone, Email, ABN
- [ ] Homepage trust bar with key stats

---

### SEO-05: Page SEO Optimization

**Description:**
Optimize existing pages (Home, Services, About, Resources) with proper meta tags, heading structure, and keyword placement.

**Acceptance Criteria:**
- [ ] Each page has unique `<title>` tag (50-60 chars)
- [ ] Each page has unique `<meta description>` (150-160 chars)
- [ ] Proper H1/H2/H3 hierarchy
- [ ] Target keywords in first 100 words
- [ ] Image alt attributes populated
- [ ] Internal linking strategy implemented

**Page-by-Page Optimization:**

| Page | Primary Keyword | Secondary Keywords |
|------|-----------------|-------------------|
| Home | China sourcing company | Australian business, verified suppliers |
| Services | China factory visit | guided tours, supplier verification |
| About | About Winning Adventure Global | company story, team |
| Resources | China manufacturing resources | factory guide, supplier tips |
| Directory | China factory directory | verified manufacturers, supplier map |

---

### SEO-06: Technical SEO

**Description:**
Implement technical SEO elements for search engine crawlability and indexing.

**Acceptance Criteria:**
- [ ] `/sitemap.xml` generated and submitted to Google Search Console
- [ ] `robots.txt` allows crawling of main pages
- [ ] Canonical tags on all pages
- [ ] 301 redirects for known broken links
- [ ] Next.js metadata API used for SEO tags
- [ ] Core Web Vitals optimized (LCP < 2.5s, CLS < 0.1)

---

## Content Requirements

### New Pages to Create

| Page | URL | Purpose |
|------|-----|---------|
| Directory | `/directory` | Factory listings with map |
| About | `/about` | Company story and team |
| FAQ | `/resources/faq` | Manufacturing FAQ content |

### Content Updates

| Page | Update |
|------|--------|
| Home | Add trust bar, improve CTA placement |
| Services | Add industry-specific sections |
| Resources | Add more blog posts, case studies |
| Footer | Add contact info, physical address |

---

## Out of Scope

- Multi-language support
- E-commerce/payment functionality
- User accounts or dashboard
- Real-time chat support
- Database-driven directory (static initially)

---

## Dependencies

- None (can be implemented independently)

---

## Verification

Each requirement must be verified by:
1. Visual inspection of rendered page
2. Mobile responsiveness check (320px minimum)
3. Console error check
4. SEO audit withighthouse
5. `npm run build` passes

---

*Requirements created: 2026-03-20*
*Based on competitor analysis of chinafactorytours.com*
