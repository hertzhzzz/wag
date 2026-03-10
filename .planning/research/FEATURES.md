# Feature Research

**Domain:** Mobile Responsive Website Improvements
**Researched:** 2026-03-11
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels broken or unprofessional.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Viewport Meta Tag** | Without it, mobile browsers render desktop squeeze. Every mobile site needs `<meta name="viewport" content="width=device-width, initial-scale=1">` | LOW | Single line in HTML head. Non-negotiable. |
| **Responsive Layout (Mobile-First)** | 60%+ global traffic is mobile. Desktop-only layouts are broken on phones | LOW | Tailwind uses mobile-first prefixes (`md:`, `lg:`). Start small, scale up. |
| **Touch-Friendly Tap Targets** | Average fingertip is 15-20mm (0.6-0.8 inches). Targets < 44px are frustrating | LOW | Minimum 44x44px for buttons/links. 48px recommended. 8px spacing between targets. |
| **Responsive Images** | Large images on mobile waste bandwidth and slow load | MEDIUM | Use `srcset`, `sizes`, `loading="lazy"`, and modern formats (WebP/AVIF). |
| **Fluid Typography** | Text that scales with viewport prevents readability issues | MEDIUM | Use `clamp()` for smooth scaling. Tailwind supports this via config. |
| **Mobile Navigation** | Hamburger menu or bottom nav expected on mobile | LOW | Should be thumb-friendly (bottom third of screen). Must have clear close mechanism. |
| **Readable Text Without Zoom** | Users shouldn't pinch-to-read. Base font should work at any width | LOW | Minimum 16px body text. Use relative units (rem/em), not px. |
| **No Horizontal Scroll** | Horizontal scroll is a strong "broken site" signal | LOW | Test on 320px width (smallest phone). Use `overflow-x: hidden` or flexible layouts. |
| **Adequate Vertical Spacing** | Mobile needs breathing room. Cramped layouts feel amateur | LOW | Use Tailwind's spacing scale. More padding/margin on mobile than desktop. |
| **Functional Forms on Mobile** | Form inputs must be usable without zoom. Date pickers, dropdowns work natively | MEDIUM | Use correct input types (`type="tel"`, `type="email"`). Labels must be visible. |

### Differentiators (Competitive Advantage)

Features that set high-quality responsive sites apart. Not required, but demonstrate attention to detail.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Container Queries** | Components that respond to their container, not just viewport. More modular | MEDIUM | Use `@container` queries. Tailwind v3.4+ supports. Better than viewport-only. |
| **Fluid Typography with Clamp()** | Text scales smoothly across all sizes without discrete breakpoints | MEDIUM | `clamp(min, preferred, max)` provides continuous scaling. |
| **Dark Mode Support** | Users expect theme choice. Reduces eye strain, shows attention to detail | LOW | Use Tailwind's `dark:` prefix. Support `prefers-color-scheme` and manual toggle. |
| **Reduced Motion Preference** | Accessibility requirement. Shows care for users with vestibular disorders | LOW | Use `prefers-reduced-motion` media query. Respect user settings. |
| **Optimized Performance** | Core Web Vitals affect SEO and UX. 53% of users abandon sites > 3s load | MEDIUM | Lazy loading, image optimization, code splitting, minimal JS. |
| **Accessible Focus States** | Keyboard/switch users need visible focus indicators | LOW | Never remove outline without replacement. Use visible focus rings. |
| **Foldable Device Support** | 18% market share. Handle variable widths gracefully | HIGH | Use container queries + flexible grids. Test at various aspect ratios. |
| **Skeleton Loading** | Perceived performance. Shows content is coming vs. blank screens | MEDIUM | Use skeleton placeholders while content loads. Better than spinners. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems for mobile users.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Separate Mobile Site (m.dot)** | Historical pattern, simpler to manage | SEO issues (duplicate content), maintenance burden, no tablet support | Single responsive site with same URL |
| **Hover-Dependent Interactions** | Desktop UX pattern | No hover on touch devices. 0% of mobile users can hover | Always-visible states. Tap to reveal, don't hover |
| **Fixed-Width Layouts** | Easier to design for specific screens | Break on any screen size outside design | Flexible grids using fractional units (fr, %) |
| **Heavy Parallax Effects** | Visual interest, "premium" feel | Performance killer on mobile. Janky scrolling | Subtle CSS transforms only, test performance |
| **Full-Screen Pop-ups** | Capture attention, "high conversion" | Horrible mobile UX. Often blocked by browsers | Slide-ins, bottom sheets, inline CTAs |
| **Auto-Playing Video/Animations** | Engagement, "modern" feel | Battery drain, data usage, accessibility nightmare | User-initiated only. Muted by default if autoplay |
| **Infinite Scroll** | Keeps users engaged | Memory issues, no footer access, poor pagination | Load more button or proper pagination |

## Feature Dependencies

```
[Touch Targets]
    └──requires──> [Proper Spacing]

[Fluid Typography]
    └──requires──> [Responsive Layout Base]

[Container Queries]
    └──enhances──> [Responsive Layout]

[Dark Mode]
    └──requires──> [CSS Variables/Design Tokens]

[Optimized Images]
    └──enhances──> [Performance Budget]

[Mobile Navigation]
    └──requires──> [Touch Targets]
```

### Dependency Notes

- **Touch Targets require Proper Spacing:** 44px minimum size with 8px minimum spacing between elements.
- **Fluid Typography requires Responsive Layout Base:** Foundation must work before scaling.
- **Container Queries enhance Responsive Layout:** More granular control than viewport-only.
- **Dark Mode requires CSS Variables:** Must have semantic tokens to switch themes.
- **Optimized Images enhance Performance:** Critical for Core Web Vitals (LCP).

## MVP Definition

### Launch With (v1)

Focus on making existing pages work on mobile. No new features.

- [ ] **Responsive Layout** — All 5 pages adapt to mobile screens (Home, Services, About, Resources, Enquiry)
- [ ] **Touch-Friendly Tap Targets** — All buttons/links minimum 44px, adequate spacing
- [ ] **Readable Typography** — Base 16px+, proper line-height, no zoom required
- [ ] **Mobile Navigation** — Hamburger menu works, thumb-friendly, closes properly
- [ ] **No Horizontal Scroll** — Test at 320px width
- [ ] **Functional Forms** — Enquiry form works on mobile without keyboard issues

### Add After Validation (v1.x)

Polish and accessibility improvements.

- [ ] **Dark Mode** — Toggle + system preference support
- [ ] **Reduced Motion** — Respect user accessibility settings
- [ ] **Optimized Images** — WebP, lazy loading, srcset
- [ ] **Skeleton Loading** — For resource pages with dynamic content

### Future Consideration (v2+)

Advanced responsive patterns for device diversity.

- [ ] **Container Queries** — Component-level responsiveness
- [ ] **Foldable Device Support** — Handle variable width/height
- [ ] **Advanced Fluid Typography** — Smooth scaling with clamp()

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Responsive Layout | HIGH | LOW | P1 |
| Touch Targets (44px+) | HIGH | LOW | P1 |
| Mobile Navigation | HIGH | LOW | P1 |
| Readable Typography | HIGH | LOW | P1 |
| No Horizontal Scroll | HIGH | LOW | P1 |
| Functional Forms | HIGH | MEDIUM | P1 |
| Vertical Spacing | MEDIUM | LOW | P1 |
| Dark Mode | MEDIUM | LOW | P2 |
| Reduced Motion | MEDIUM | LOW | P2 |
| Optimized Images | HIGH | MEDIUM | P2 |
| Container Queries | LOW | MEDIUM | P3 |
| Foldable Support | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch — Core mobile usability
- P2: Should have, add when possible — Polish and accessibility
- P3: Nice to have, future consideration — Edge cases and advanced patterns

## Project Context Alignment

From PROJECT.md:
- **Core Value:** Improve mobile responsive layout for excellent UX on all devices
- **Constraint:** Must use existing Next.js + Tailwind CSS stack
- **Constraint:** Keep existing design tokens (Navy #0F2D5E, Amber #F59E0B)
- **Constraint:** All existing content must remain

**Implication for Features:**
- Tailwind already has responsive prefixes (`md:`, `lg:`) — use mobile-first approach
- Use existing color tokens for dark mode implementation
- Focus on layout/sizing/spacing changes, not new components
- Test on real devices, not just DevTools

## Sources

- [Responsive Web Design Basics - web.dev](https://web.dev/articles/responsive-web-design-basics)
- [Mobile Website Design Best Practices for 2025 - WebStacks](https://www.webstacks.com/blog/mobile-website-design-best-practices)
- [Touch Design for Mobile - UXPin](https://www.uxpin.com/studio/blog/responsive-design-touch-devices-key-considerations/)
- [Tailwind Breakpoints Complete Guide 2025 - Tailkits](https://tailkits.com/blog/tailwind-breakpoints-complete-guide/)
- [Responsive Design Best Practices 2025 - Media Plus Digital](https://mediaplusdigital.com.my/responsive-web-design-best-practices/)
- [Mobile UX Mistakes to Avoid - UX Matters](https://www.uxmatters.com/mt/archives/2025/08/mobile-design-mistakes-that-cost-you-customers-and-money.php)

---
*Feature research for: Mobile Responsive Website Improvements*
*Researched: 2026-03-11*
