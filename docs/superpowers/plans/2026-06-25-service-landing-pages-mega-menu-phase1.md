# Service Landing Pages + Mega Menu — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the mega-menu infrastructure plus the flagship `/supplier-verification` landing page, establishing the pattern the remaining Phases (2-4) replicate.

**Architecture:** A single nav-link data module (`nav-links.ts`) is the one source of truth for the mega menu *and* the sitemap. The menu renders **only links flagged `live`**, so planned-but-unbuilt pages (locations/industries) never emit a crawlable 404. The flagship page is a static server component reusing the existing `/services` page patterns (Navbar/Footer/FAQ/ScrollReveal/BreadcrumbSchema + inline Service JSON-LD).

**Tech Stack:** Next.js 16.2 App Router · TypeScript 5 · Tailwind 3.4 · lucide-react icons · browser-harness (verification).

## Global Constraints

- **Copy is English only** — page content, UI text, buttons, labels. No Chinese. (Code comments may be Chinese.)
- **No emoji** anywhere in the frontend codebase.
- **No "WAG" / "WA" abbreviation** — use "Winning Adventure Global".
- **Team wording**: "Australia-based" / "based in Australia" — never "Australian-owned" or "Chinese-owned".
- **City pages wording** (future Phases): WAG is a remote, Australia-based service — never imply a physical office in another city.
- **Tailwind colors**: `navy` = `#0F2D5E`, `amber` = `#C97A0A` (both already in `tailwind.config`).
- **Verification, not pytest**: this project has no JS unit-test runner. Each task verifies via `npm run lint`, `npm run build`, browser-harness screenshot/DOM checks, and grep assertions.
- **No git in this plan**: per project rule, the plan never commits or branches. Each task ends at a **CHECKPOINT** for the user to review and run git themselves if they choose.
- Run all commands from `frontend/`.

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `app/data/nav-links.ts` | Create | Single source of truth: service/location/industry menu columns with `live` flags + `liveNavLinks()` helper. |
| `app/components/ServicesMegaMenu.tsx` | Create | Desktop full-width mega-menu panel. Renders live links only, omits empty columns, includes CTA block. |
| `app/components/Navbar.tsx` | Modify | Desktop: hover state opens mega menu. Mobile: Services becomes an accordion of live links. |
| `app/(public)/supplier-verification/page.tsx` | Create | Flagship landing page (hero → process → factory-data proof → FAQ → CTA) + metadata + Service JSON-LD + Breadcrumb. |
| `app/sitemap.ts` | Modify | Register live nav-link URLs (drives off `liveNavLinks()`, so future Phases auto-register on flag flip). |

---

## Task 1: nav-links data module

**Files:**
- Create: `app/data/nav-links.ts`

**Interfaces:**
- Produces: `NavLink = { label: string; href: string; live: boolean }`, `NavColumn = { heading: string; links: NavLink[] }`, `servicesMenu: NavColumn[]`, `liveNavLinks(): NavLink[]`.

- [ ] **Step 1: Create the data module**

```typescript
// app/data/nav-links.ts
// 导航 mega menu 与 sitemap 的单一数据源。
// live=false 表示页面尚未上线（Phase 2-4 才建），不渲染、不进 sitemap，避免 404。

export interface NavLink {
  label: string
  href: string
  live: boolean
}

export interface NavColumn {
  heading: string
  links: NavLink[]
}

export const servicesMenu: NavColumn[] = [
  {
    heading: 'By Service',
    links: [
      { label: 'All Services Overview', href: '/services', live: true },
      { label: 'Supplier Verification', href: '/supplier-verification', live: true },
      { label: 'Factory Audit', href: '/factory-audit-china', live: false },
      { label: 'Quality Inspection', href: '/quality-inspection-china', live: false },
    ],
  },
  {
    heading: 'By Location',
    links: [
      { label: 'Sydney', href: '/locations/sydney', live: false },
      { label: 'Melbourne', href: '/locations/melbourne', live: false },
      { label: 'Brisbane', href: '/locations/brisbane', live: false },
      { label: 'Adelaide', href: '/locations/adelaide', live: false },
      { label: 'Perth', href: '/locations/perth', live: false },
    ],
  },
  {
    heading: 'By Industry',
    links: [
      { label: 'Mining', href: '/industries/mining', live: false },
      { label: 'Agricultural Machinery', href: '/industries/agricultural-machinery', live: false },
      { label: 'Activewear', href: '/industries/activewear', live: false },
      { label: 'Construction', href: '/industries/construction', live: false },
      { label: 'Electronics', href: '/industries/electronics', live: false },
    ],
  },
]

// 仅返回已上线链接 — 供 mega menu 渲染与 sitemap 注册共用。
export function liveNavLinks(): NavLink[] {
  return servicesMenu.flatMap((col) => col.links).filter((l) => l.live)
}
```

- [ ] **Step 2: Verify it compiles and exports**

Run: `npx tsc --noEmit app/data/nav-links.ts 2>&1 | head` (expect no errors), then confirm only `/services` and `/supplier-verification` are live:

Run: `node -e "require('esbuild-register'); const {liveNavLinks}=require('./app/data/nav-links.ts'); console.log(liveNavLinks().map(l=>l.href))"` — if `esbuild-register` is unavailable, instead grep: `grep -c "live: true" app/data/nav-links.ts`
Expected: exactly `2` live entries.

- [ ] **Step 3: CHECKPOINT** — show the file to the user. No 404 risk yet (data only). Proceed on approval.

---

## Task 2: ServicesMegaMenu component

**Files:**
- Create: `app/components/ServicesMegaMenu.tsx`

**Interfaces:**
- Consumes: `servicesMenu` from Task 1.
- Produces: `default export ServicesMegaMenu({ onNavigate?: () => void })` — a full-width panel meant to be rendered as an absolutely-positioned sibling under the navbar bar.

- [ ] **Step 1: Create the component**

```tsx
// app/components/ServicesMegaMenu.tsx
'use client'

import Link from 'next/link'
import { servicesMenu } from '@/data/nav-links'

export default function ServicesMegaMenu({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="absolute left-0 right-0 top-full bg-white border-t border-navy/10 shadow-[0_8px_24px_rgba(15,45,94,0.12)]">
      <div className="max-w-[1400px] mx-auto w-full px-6 py-8 flex gap-8">
        <div className="flex-1 grid grid-cols-3 gap-8">
          {servicesMenu.map((col) => {
            const live = col.links.filter((l) => l.live)
            if (live.length === 0) return null
            return (
              <div key={col.heading}>
                <h3 className="text-[11px] font-semibold uppercase tracking-wide text-navy/50 mb-3">
                  {col.heading}
                </h3>
                <ul className="flex flex-col gap-2 list-none">
                  {live.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        onClick={onNavigate}
                        className="text-[14px] text-navy hover:text-amber transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
        <div className="w-[220px] flex-shrink-0 bg-navy/5 p-5 flex flex-col justify-center">
          <p className="text-[14px] font-semibold text-navy mb-1">Not sure which service?</p>
          <p className="text-[12px] text-navy/60 mb-3">
            Tell us your sourcing goal and we will recommend the right fit.
          </p>
          <Link
            href="/enquiry"
            onClick={onNavigate}
            className="text-[13px] font-medium px-4 py-2 text-white bg-navy text-center hover:bg-navy/90 transition-colors"
          >
            Get a Free Quote →
          </Link>
        </div>
      </div>
    </div>
  )
}
```

> Note: In Phase 1 only the "By Service" column has live links, so the menu shows one column + CTA. Location/Industry columns appear automatically when their `live` flags flip in Phases 3-4. This is intentional — never render a link to a page that does not exist.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new errors referencing `ServicesMegaMenu.tsx`.

- [ ] **Step 3: CHECKPOINT** — proceed to wiring.

---

## Task 3: Wire mega menu into Navbar (desktop hover + mobile accordion)

**Files:**
- Modify: `app/components/Navbar.tsx`

**Interfaces:**
- Consumes: `ServicesMegaMenu` (Task 2), `servicesMenu` (Task 1).

- [ ] **Step 1: Add imports and state**

In `app/components/Navbar.tsx`, change the React import line and add the new imports near the top (the file already has `'use client'`):

Replace:
```tsx
import { useState, useEffect } from 'react'
import { Menu, X, Phone } from 'lucide-react'
import PhoneCallLink from '@/components/PhoneCallLink'
```
With:
```tsx
import { useState, useEffect } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import PhoneCallLink from '@/components/PhoneCallLink'
import ServicesMegaMenu from '@/components/ServicesMegaMenu'
import { servicesMenu } from '@/data/nav-links'
```
> `Phone` was unused in the original imports list except via PhoneCallLink; removing it avoids a lint warning. `ChevronDown` is the mobile accordion caret.

Then add two state hooks immediately after the existing `mobileMenuOpen` state:
```tsx
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)
```

- [ ] **Step 2: Desktop — make Services a hover trigger + render the mega menu**

Replace the desktop Services `<li>` (currently):
```tsx
          <li>
            <Link href="/services" className="nav-link text-navy">Services</Link>
          </li>
```
With:
```tsx
          <li onMouseEnter={() => setServicesOpen(true)}>
            <Link
              href="/services"
              className="nav-link text-navy"
              aria-haspopup="true"
              aria-expanded={servicesOpen}
            >
              Services
            </Link>
          </li>
```

Then add `onMouseLeave` to the top-bar container so the menu closes when the pointer leaves the whole navbar region. Change:
```tsx
      <div className="max-w-[1400px] mx-auto w-full flex items-center">
```
to wrap the nav in a mouse-leave handler — change the opening `<nav ...>` line's child container by adding the handler to the `<nav>` element itself. Replace:
```tsx
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(15,45,94,0.08)] py-2 transition-all duration-300">
```
With:
```tsx
    <nav
      className="fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(15,45,94,0.08)] py-2 transition-all duration-300"
      onMouseLeave={() => setServicesOpen(false)}
    >
```

Render the mega menu as a sibling of the top-bar `div`, immediately after its closing `</div>` (the one that closes `max-w-[1400px] mx-auto w-full flex items-center`) and before the `{/* Mobile menu overlay */}` comment:
```tsx
      {/* Desktop mega menu */}
      {servicesOpen && (
        <div className="hidden md:block">
          <ServicesMegaMenu onNavigate={() => setServicesOpen(false)} />
        </div>
      )}
```

- [ ] **Step 3: Mobile — convert Services into an accordion**

In the mobile slide-in `<ul>`, replace the mobile Services `<li>` (currently):
```tsx
          <li>
            <Link
              href="/services"
              className="block min-h-11 px-4 flex items-center text-navy"
              onClick={handleLinkClick}
            >
              Services
            </Link>
          </li>
```
With:
```tsx
          <li>
            <button
              type="button"
              className="w-full min-h-11 px-4 flex items-center justify-between text-navy"
              onClick={() => setMobileServicesOpen((v) => !v)}
              aria-expanded={mobileServicesOpen}
            >
              <span>Services</span>
              <ChevronDown
                size={18}
                className={`transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {mobileServicesOpen && (
              <ul className="flex flex-col list-none pl-4 border-l border-navy/10 ml-4">
                <li>
                  <Link
                    href="/services"
                    className="block min-h-11 px-4 flex items-center text-navy text-[14px]"
                    onClick={handleLinkClick}
                  >
                    All Services Overview
                  </Link>
                </li>
                {servicesMenu
                  .flatMap((col) => col.links)
                  .filter((l) => l.live && l.href !== '/services')
                  .map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="block min-h-11 px-4 flex items-center text-navy text-[14px]"
                        onClick={handleLinkClick}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            )}
          </li>
```

- [ ] **Step 4: Lint + build**

Run: `npm run lint` — Expected: no new errors in `Navbar.tsx`.
Run: `npm run build` — Expected: build succeeds.

- [ ] **Step 5: Browser verify desktop hover + mobile accordion**

Start dev server (`npm run dev`) in a background shell, then:
```bash
browser-harness <<'PY'
new_tab("http://localhost:3000/")
wait_for_load()
# Hover the Services nav item
js('document.querySelectorAll("nav ul li")[1].dispatchEvent(new MouseEvent("mouseenter",{bubbles:true}))')
capture_screenshot("/tmp/megamenu.png")
# Assert the live Supplier Verification link is present in the open menu
print("HAS_SV_LINK:", js('!!document.querySelector(\'a[href="/supplier-verification"]\')'))
# Assert NO link to an unbuilt page leaked into the DOM
print("NO_DEAD_LINK:", js('!document.querySelector(\'a[href="/locations/sydney"]\')'))
PY
```
Expected: `HAS_SV_LINK: True` and `NO_DEAD_LINK: True`. Open `/tmp/megamenu.png` to confirm the panel spans the navbar width with the CTA block on the right.

- [ ] **Step 6: CHECKPOINT** — user reviews the menu behavior on screenshot. Proceed.

---

## Task 4: Flagship `/supplier-verification` landing page

**Files:**
- Create: `app/(public)/supplier-verification/page.tsx`

**Interfaces:**
- Consumes: `Navbar`, `Footer`, `FAQ` (`{ faqs, hideHeading }`), `ScrollReveal`, `BreadcrumbSchema` (`{ items: {name,url}[] }`), lucide icons.

> Content note: the copy below is genuine initial marketing content derived from the existing `/services` page and the verified factory-database size (1209 factories). It is production-usable, not a placeholder. The content pipeline (factory DB + ABS data + Tavily) refines and expands it later; the `1,200+` figure is deliberately rounded so it stays accurate as the DB grows.

- [ ] **Step 1: Create the page**

```tsx
// app/(public)/supplier-verification/page.tsx
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Metadata } from 'next'
import FAQ from '@/components/FAQ'
import ScrollReveal from '@/components/ScrollReveal'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import { Search, ShieldCheck, FileText, ArrowRight, Building2, ClipboardCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: { absolute: 'Supplier Verification in China for Australian Importers' },
  description:
    'Remote supplier verification for Australian businesses sourcing from China. We authenticate licenses, audit capability, and inspect quality against a database of 1,200+ pre-screened factories — without you leaving Australia.',
  keywords: [
    'supplier verification china',
    'supplier verification china australia',
    'china supplier verification service',
    'verify chinese manufacturer',
    'remote factory verification',
  ],
  openGraph: {
    title: 'Supplier Verification in China | Winning Adventure Global',
    description:
      'Remote, Australia-based supplier verification: license authentication, capability audit, and quality inspection across 1,200+ pre-screened Chinese factories.',
    url: 'https://www.winningadventure.com.au/supplier-verification',
    siteName: 'Winning Adventure Global',
    locale: 'en_AU',
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/supplier-verification',
    languages: {
      'en-AU': 'https://www.winningadventure.com.au/supplier-verification',
      'x-default': 'https://www.winningadventure.com.au/supplier-verification',
    },
  },
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Supplier Verification in China',
  serviceType: 'Supplier Verification',
  provider: {
    '@type': 'Organization',
    name: 'Winning Adventure Global',
    url: 'https://www.winningadventure.com.au',
  },
  areaServed: { '@type': 'Country', name: 'Australia' },
  description:
    'Remote supplier verification for Australian importers sourcing from China: SAMR business-license authentication, capability and export-history audit, and pre-shipment quality inspection across a database of 1,200+ pre-screened factories.',
  priceRange: 'Contact for quote',
}

const steps = [
  {
    icon: Building2,
    title: '1. License & Identity Authentication',
    body: 'We confirm the SAMR business license, legal status, and registered scope of every shortlisted supplier — so you know the company you are paying actually exists and is authorised to export.',
  },
  {
    icon: ClipboardCheck,
    title: '2. Capability & Export-History Audit',
    body: 'We assess production equipment, workforce, certifications, and verified export history, cross-checked against our database of 1,200+ pre-screened Chinese factories.',
  },
  {
    icon: ShieldCheck,
    title: '3. Pre-Shipment Quality Inspection',
    body: 'Before your money leaves Australia, we inspect goods against your specification and deliver a documented verification report you can act on.',
  },
]

const verificationFaqs = [
  {
    question: 'Do I need to travel to China for supplier verification?',
    answer:
      'No. This is a fully remote, Australia-based service. We verify suppliers on the ground in China on your behalf and report back to you in Australia, so you can make decisions without booking a flight.',
  },
  {
    question: 'How is this different from a factory tour?',
    answer:
      'A factory tour takes you to China to meet suppliers in person. Supplier verification is remote — we do the on-the-ground checking for you and deliver a written report. Many clients verify remotely first, then travel only if they decide to proceed.',
  },
  {
    question: 'What does a verification report include?',
    answer:
      'License and legal-status authentication, capability and certification assessment, export-history validation, and pre-shipment quality inspection findings against your product specification.',
  },
  {
    question: 'How many factories can you check against?',
    answer:
      'We maintain a database of more than 1,200 pre-screened Chinese factories, which we use to benchmark and shortlist suppliers for your specific product.',
  },
]

export default function SupplierVerificationPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <Navbar />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://www.winningadventure.com.au' },
          { name: 'Services', url: 'https://www.winningadventure.com.au/services' },
          {
            name: 'Supplier Verification',
            url: 'https://www.winningadventure.com.au/supplier-verification',
          },
        ]}
      />

      <main className="pt-24">
        {/* Hero */}
        <section className="bg-navy text-white">
          <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
            <p className="text-amber text-sm font-semibold uppercase tracking-wide mb-3">
              Remote · Australia-based
            </p>
            <h1 className="text-3xl md:text-5xl font-semibold leading-tight mb-5">
              Supplier Verification in China, Without Leaving Australia
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mb-8">
              Before you wire a deposit to a Chinese supplier, know exactly who you are dealing
              with. We authenticate licenses, audit capability, and inspect quality on the ground —
              and report back to you in Australia.
            </p>
            <Link
              href="/enquiry"
              className="inline-flex items-center gap-2 bg-amber text-navy font-semibold px-7 py-3 hover:translate-y-[-1px] transition-transform"
            >
              Get a Free Quote <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* Process */}
        <section className="max-w-[1100px] mx-auto px-6 py-16">
          <ScrollReveal>
            <h2 className="text-2xl md:text-3xl font-semibold text-navy mb-10 text-center">
              How Verification Works
            </h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <ScrollReveal key={s.title}>
                <div className="border border-navy/10 p-6 h-full">
                  <s.icon size={28} className="text-amber mb-4" />
                  <h3 className="text-lg font-semibold text-navy mb-2">{s.title}</h3>
                  <p className="text-navy/70 text-[15px] leading-relaxed">{s.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Data proof */}
        <section className="bg-navy/5">
          <div className="max-w-[1100px] mx-auto px-6 py-14 flex flex-col md:flex-row items-center gap-8">
            <Search size={40} className="text-amber flex-shrink-0" />
            <div>
              <p className="text-2xl font-semibold text-navy mb-2">
                Benchmarked against 1,200+ pre-screened factories
              </p>
              <p className="text-navy/70 max-w-2xl">
                Every verification is cross-checked against our proprietary database of Chinese
                manufacturers — so a supplier&apos;s claims are measured against real, comparable
                production data, not just their own sales pitch.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-[900px] mx-auto px-6 py-16">
          <h2 className="text-2xl md:text-3xl font-semibold text-navy mb-8 text-center">
            Supplier Verification FAQs
          </h2>
          <FAQ faqs={verificationFaqs} hideHeading />
        </section>

        {/* CTA */}
        <section className="bg-navy text-white">
          <div className="max-w-[1100px] mx-auto px-6 py-14 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              Verify your supplier before you commit
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Tell us your product and target supplier. We will scope a verification and send you a
              quote.
            </p>
            <Link
              href="/enquiry"
              className="inline-flex items-center gap-2 bg-amber text-navy font-semibold px-7 py-3 hover:translate-y-[-1px] transition-transform"
            >
              Get a Free Quote <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
```

- [ ] **Step 2: Lint + build**

Run: `npm run lint` — Expected: no new errors.
Run: `npm run build` — Expected: build succeeds and lists `/supplier-verification` as a generated route.

- [ ] **Step 3: Browser verify the page renders + English-only + schema present**

```bash
browser-harness <<'PY'
new_tab("http://localhost:3000/supplier-verification")
wait_for_load()
capture_screenshot("/tmp/sv-page.png")
print("H1:", js('document.querySelector("h1").innerText'))
print("HAS_SCHEMA:", js('!!document.querySelector(\'script[type="application/ld+json"]\')'))
PY
```
Expected: `H1` contains "Supplier Verification in China", `HAS_SCHEMA: True`.

Run a no-Chinese / no-emoji guard on the source:
```bash
grep -nP '[\x{4e00}-\x{9fff}]' app/\(public\)/supplier-verification/page.tsx | grep -v '//' || echo "OK: no Chinese in copy"
```
Expected: `OK: no Chinese in copy` (the only Chinese permitted is in `//` code comments — none here).

- [ ] **Step 4: CHECKPOINT** — user reviews `/tmp/sv-page.png` and copy. Proceed.

---

## Task 5: Register live pages in sitemap

**Files:**
- Modify: `app/sitemap.ts`

**Interfaces:**
- Consumes: `liveNavLinks()` (Task 1).

- [ ] **Step 1: Import and append live nav-link URLs**

In `app/sitemap.ts`, add the import after the existing imports (line 5 area):
```typescript
import { liveNavLinks } from '@/data/nav-links'
```

Inside `sitemap()`, build the nav URLs from live links, excluding `/services` (already listed) to avoid duplicates. Add this just before the `return [` statement:
```typescript
  const navUrls = liveNavLinks()
    .filter((l) => l.href !== '/services')
    .map((l) => ({
      url: `${baseUrl}${l.href}`,
      lastModified: new Date(),
    }))
```

Then add `...navUrls,` into the returned array, immediately after the `/services` entry line:
```typescript
    { url: `${baseUrl}/services`, lastModified: new Date() },
    ...navUrls,
```

- [ ] **Step 2: Build and verify sitemap output**

Run: `npm run build` — Expected: success.
Then check the generated sitemap includes the flagship page:
```bash
npm run dev &  # if not already running
sleep 4
curl -s http://localhost:3000/sitemap.xml | grep -c "/supplier-verification"
```
Expected: `1`. Confirm no `/locations/` or `/industries/` URLs leaked:
```bash
curl -s http://localhost:3000/sitemap.xml | grep -cE "/locations/|/industries/"
```
Expected: `0`.

- [ ] **Step 3: CHECKPOINT** — Phase 1 complete. User reviews and runs git/deploy when ready. Optionally submit `/supplier-verification` to the Indexing API (see project CLAUDE.md "Indexing API").

---

## Self-Review

**Spec coverage** (against `2026-06-25-service-landing-pages-mega-menu-design.md`):
- §3 page matrix → `nav-links.ts` holds all 13 planned URLs with live flags (Task 1); flagship `/supplier-verification` built (Task 4). Remaining pages are Phases 2-4 (out of scope here, flags pre-seeded).
- §4 mega menu (hover desktop, click→/services, mobile accordion, 3-col + CTA, single data source) → Tasks 2-3.
- §5 content structure (hero/process/data-proof/FAQ/CTA) → Task 4.
- §6 content pipeline → noted as the refinement source; Task 4 ships usable initial copy + the real 1,200+ figure.
- §7 technical (reuse Navbar/Footer/FAQ/ScrollReveal/BreadcrumbSchema, Service schema, sitemap, internal links) → Tasks 2-5.
- §2 doorway-safety → enforced structurally: menu/sitemap render live-only (no 404s); flagship page carries unique data + schema.
- §10 acceptance (build/lint pass, menu behavior, sitemap 200, English-only, no emoji/abbrev) → verification steps in Tasks 3-5.

**Phase 0 (keyword validation)** and **Phases 2-4 (more service pages, 5 city pages, 5 industry pages)** are deliberately separate plans — each produces independently shippable software. Phase 0 is interactive research (Tavily / Keyword Planner), not a code plan.

**Placeholder scan:** none — all steps contain real code/commands. The `1,200+` figure is intentional rounding of the verified 1209-factory DB.

**Type consistency:** `NavLink`/`NavColumn`/`servicesMenu`/`liveNavLinks` names match across Tasks 1, 2, 3, 5. `BreadcrumbSchema` `items` shape and `FAQ` `{faqs, hideHeading}` props match the existing components verified in the codebase.
