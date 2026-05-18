---
name: Winning Adventure Global
description: China sourcing agency design system for Australian business audiences
version: "1.0"

colors:
  navy: "#0F2D5E"
  navy-light: "#1A4A8A"
  navy-dark: "#0A1F3D"
  amber: "#F59E0B"
  amber-light: "#FBBF24"
  amber-dark: "#D97706"
  surface: "#FFFFFF"
  surface-warm: "#FEF9F3"
  on-navy: "#FFFFFF"
  on-amber: "#0F2D5E"
  text-primary: "#0F2D5E"
  text-secondary: "#4B5563"
  text-muted: "#6B7280"
  border: "#E5E7EB"
  border-navy: "rgba(15, 45, 94, 0.2)"

typography:
  display:
    fontFamily: "IBM Plex Sans"
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: "IBM Plex Sans"
    fontSize: 36px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.01em
  headline-md:
    fontFamily: "IBM Plex Sans"
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0
  headline-sm:
    fontFamily: "IBM Plex Sans"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  body-lg:
    fontFamily: "IBM Plex Sans"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  body-md:
    fontFamily: "IBM Plex Sans"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  body-sm:
    fontFamily: "IBM Plex Sans"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  label-lg:
    fontFamily: "IBM Plex Sans"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0.01em
  label-md:
    fontFamily: "IBM Plex Sans"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0.01em
  serif-display:
    fontFamily: "IBM Plex Serif"
    fontSize: 32px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: 0

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  4xl: 96px

rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px

shadows:
  sm: "0 1px 2px rgba(15, 45, 94, 0.05)"
  md: "0 4px 6px rgba(15, 45, 94, 0.08)"
  lg: "0 10px 15px rgba(15, 45, 94, 0.1)"
  xl: "0 20px 25px rgba(15, 45, 94, 0.12)"

components:
  button-primary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.on-navy}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: "{spacing.md} {spacing.lg}"
  button-primary-hover:
    backgroundColor: "{colors.navy-light}"
  button-secondary:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.on-amber}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: "{spacing.md} {spacing.lg}"
  button-secondary-hover:
    backgroundColor: "{colors.amber-light}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.navy}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: "{spacing.md} {spacing.lg}"
    border: "1px solid {colors.navy}"
  card:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
    shadow: "{shadows.md}"
  input-field:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  nav-link:
    textColor: "{colors.text-primary}"
    typography: "{typography.label-md}"
    hoverColor: "{colors.navy}"
  section:
    paddingTop: "{spacing.3xl}"
    paddingBottom: "{spacing.3xl}"
---

# Design System — Winning Adventure Global

## Overview

WAG's design reflects the professionalism and reliability required for cross-border business relationships. The visual language balances Australian business sensibilities with Chinese manufacturing expertise — authoritative without being cold, approachable without being casual.

**Target audience:** Australian business owners and procurement managers seeking factory tours and supplier verification in China. Decision-makers who value trust, competence, and clear communication.

**Brand personality:** Professional, trustworthy, action-oriented. We help Australian businesses source from China with confidence.

---

## Colors

The palette centers on two primary brand colors — deep navy for authority and trustworthiness, amber for energy and action.

### Primary: Navy `#0F2D5E`

The dominant color representing professionalism, trust, and stability — critical qualities for Australian businesses entrusting us with their supply chain.

- **Use for:** Headlines, body text, primary buttons, footer, navigation
- **Light variant (#1A4A8A):** Hover states, secondary emphasis
- **Dark variant (#0A1F3D):** High-contrast text on light backgrounds

### Accent: Amber `#F59E0B`

A warm, energetic color that draws attention and signals action — used sparingly for CTAs and emphasis.

- **Use for:** Call-to-action buttons, highlights, badges, active states
- **Light variant (#FBBF24):** Hover states, subtle accents
- **Dark variant (#D97706):** Pressed states, high-emphasis CTAs

### Neutrals

| Token | Hex | Use |
|-------|-----|-----|
| Surface | `#FFFFFF` | Card backgrounds, input fields |
| Surface Warm | `#FEF9F3` | Section backgrounds, subtle warmth |
| Text Primary | `#0F2D5E` | Body copy, headings (on light backgrounds) |
| Text Secondary | `#4B5563` | Supporting text, descriptions |
| Text Muted | `#6B7280` | Captions, metadata, timestamps |
| Border | `#E5E7EB` | Card borders, dividers, input outlines |

### Semantic Color Usage

- **Navy backgrounds:** Hero sections, CTAs, primary buttons
- **Amber accents:** Key actions, "Book a Call" buttons, highlights
- **White surfaces:** Cards, content areas, form inputs
- **Warm backgrounds:** Alternating sections, testimonials

---

## Typography

IBM Plex provides the typographic foundation — a typeface designed for complex, professional communication with excellent screen readability.

### Font Families

**IBM Plex Sans** (primary) — Used for headings, body text, UI elements. Its geometric clarity projects competence and modernity.

**IBM Plex Serif** (accent) — Used sparingly for pull quotes, testimonial attribution, and special emphasis. Adds warmth and human touch.

### Type Scale

| Token | Font | Size | Weight | Line Height | Use |
|-------|------|------|--------|-------------|-----|
| `display` | Plex Sans | 48px | 700 | 1.1 | Hero headlines, section titles |
| `headline-lg` | Plex Sans | 36px | 600 | 1.2 | Page titles, major sections |
| `headline-md` | Plex Sans | 28px | 600 | 1.3 | Card titles, subsection headers |
| `headline-sm` | Plex Sans | 22px | 600 | 1.4 | Component titles, smaller headers |
| `body-lg` | Plex Sans | 18px | 400 | 1.6 | Lead paragraphs, marketing copy |
| `body-md` | Plex Sans | 16px | 400 | 1.6 | Default body text |
| `body-sm` | Plex Sans | 14px | 400 | 1.5 | Captions, footnotes, metadata |
| `label-lg` | Plex Sans | 16px | 600 | 1.4 | Buttons, navigation links |
| `label-md` | Plex Sans | 14px | 600 | 1.4 | Tags, badges, small labels |
| `serif-display` | Plex Serif | 32px | 400 | 1.3 | Pull quotes, testimonial text |

### Letter Spacing Guidelines

- **Display/Headlines:** `-0.02em` to `-0.01em` — tight tracking for large sizes improves readability
- **Body text:** `0` — default spacing for comfortable reading
- **Labels/Buttons:** `0.01em` — slight tracking for small text improves legibility

---

## Layout & Spacing

### Spacing Scale

The 8px base unit ensures consistent vertical rhythm throughout the interface.

| Token | Value | Use |
|-------|-------|-----|
| `xs` | 4px | Icon padding, tight gaps |
| `sm` | 8px | Between related elements |
| `md` | 16px | Default padding, component gaps |
| `lg` | 24px | Section internal spacing |
| `xl` | 32px | Between major elements |
| `2xl` | 48px | Section padding, large gaps |
| `3xl` | 64px | Section top/bottom padding |
| `4xl` | 96px | Hero spacing, major sections |

### Section Structure

**Content Width:** Max 1200px container, centered with 24px horizontal padding on mobile.

**Vertical Rhythm:** Sections alternate between `3xl` (96px) top/bottom padding for emphasis and `2xl` (64px) for standard content areas.

### Responsive Breakpoints

| Breakpoint | Width | Design Adjustments |
|------------|-------|-------------------|
| Mobile | < 640px | Single column, reduced padding, stacked elements |
| Tablet | 640-1024px | 2-column grids, moderate spacing |
| Desktop | > 1024px | Full layout, maximum spacing |

---

## Elevation & Shadows

Shadows provide depth hierarchy without overwhelming the clean, professional aesthetic.

| Token | Value | Use |
|-------|-------|-----|
| `sm` | `0 1px 2px rgba(15, 45, 94, 0.05)` | Subtle lift, inactive elements |
| `md` | `0 4px 6px rgba(15, 45, 94, 0.08)` | Cards, hover states |
| `lg` | `0 10px 15px rgba(15, 45, 94, 0.1)` | Elevated cards, modals |
| `xl` | `0 20px 25px rgba(15, 45, 94, 0.12)` | Major elevation, featured cards |

**Shadow tint:** All shadows use the navy color (`#0F2D5E`) at low opacity, maintaining color coherence with the brand palette.

---

## Shapes

Border radius follows a consistent scale from sharp to fully rounded.

| Token | Value | Use |
|-------|-------|-----|
| `none` | 0px | Sharp edges, decorative elements |
| `sm` | 4px | Small inputs, tags |
| `md` | 8px | Buttons, cards, form elements |
| `lg` | 12px | Large cards, feature blocks |
| `xl` | 16px | Modal backgrounds, large containers |
| `full` | 9999px | Avatars, pills, circular buttons |

---

## Components

### Buttons

**Primary Button** — Used for main CTAs like "Book a Call" and "Get a Quote". Navy background with white text creates maximum contrast and draws attention.

```yaml
button-primary:
  backgroundColor: "{colors.navy}"
  textColor: "{colors.on-navy}"
  typography: "{typography.label-lg}"
  rounded: "{rounded.md}"
  padding: "{spacing.md} {spacing.lg}"
```

**Hover state:** Navy light (`#1A4A8A`) background
**Active state:** Navy dark (`#0A1F3D`) background

**Secondary Button** — Used for secondary actions. Amber background with navy text.

```yaml
button-secondary:
  backgroundColor: "{colors.amber}"
  textColor: "{colors.on-amber}"
  typography: "{typography.label-lg}"
  rounded: "{rounded.md}"
  padding: "{spacing.md} {spacing.lg}"
```

**Ghost Button** — Outlined style for tertiary actions or when primary would be too dominant.

```yaml
button-ghost:
  backgroundColor: "transparent"
  textColor: "{colors.navy}"
  border: "1px solid {colors.navy}"
  typography: "{typography.label-lg}"
  rounded: "{rounded.md}"
  padding: "{spacing.md} {spacing.lg}"
```

### Cards

Cards contain related content with consistent padding, border radius, and shadow.

```yaml
card:
  backgroundColor: "{colors.surface}"
  border: "1px solid {colors.border}"
  rounded: "{rounded.lg}"
  padding: "{spacing.lg}"
  shadow: "{shadows.md}"
```

**Usage patterns:**
- Service cards with icon, title, description
- Testimonial cards with quote, attribution, photo
- Blog preview cards with image, title, date
- Team member cards with photo, name, role

### Form Inputs

```yaml
input-field:
  backgroundColor: "{colors.surface}"
  border: "1px solid {colors.border}"
  textColor: "{colors.text-primary}"
  typography: "{typography.body-md}"
  rounded: "{rounded.md}"
  padding: "{spacing.md}"
```

**Focus state:** Border changes to navy with subtle shadow
**Error state:** Border changes to red (`#DC2626`) with error message below

### Navigation

**Nav Links:**
```yaml
nav-link:
  textColor: "{colors.text-primary}"
  typography: "{typography.label-md}"
```

- **Hover:** Color changes to navy, underline appears
- **Active:** Navy color with bottom border indicator
- **Mobile:** Hamburger menu with full-screen overlay

---

## Do's and Don'ts

### Do

- Use navy for primary headings and key information
- Use amber for CTAs and action-oriented elements
- Maintain 44px minimum touch targets for interactive elements
- Use `body-lg` for marketing copy and lead paragraphs
- Keep paragraphs at `body-md` (16px) with 1.6 line height for readability
- Use card shadows (`md`) for elevated content
- Apply `rounded.lg` to cards for a modern, approachable feel

### Don't

- Use more than two primary colors in a single composition
- Apply amber backgrounds to large areas (too high-energy)
- Use `display` size on mobile (reduce to `headline-lg` or smaller)
- Add shadows to bordered cards (use one or the other, not both)
- Use decorative fonts for body text (Plex Serif is for emphasis only)
- Place light text on navy backgrounds with opacity — use white directly

---

## Animation Guidelines

### Transitions

**Button hover:** 200ms ease-out for background color transitions
**Card hover:** 300ms ease-out for shadow elevation change
**Page elements:** 400ms ease-out for fade-in on scroll

### Motion Preferences

Respect `prefers-reduced-motion` — disable animations for users who have indicated this preference in their system settings.

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

### Loading States

Use subtle pulse animation (`animate-pulse-ring`) for loading indicators — the ring animation scales gently without being distracting.

---

## Accessibility

- **Color contrast:** All text combinations meet WCAG 4.5:1 minimum
- **Touch targets:** Minimum 44x44px for all interactive elements
- **Focus indicators:** Visible focus rings for keyboard navigation
- **Semantic HTML:** Proper heading hierarchy (h1 → h2 → h3)
- **Alt text:** All images include descriptive alt attributes

---

## CSS Custom Properties Reference

```css
:root {
  /* Colors */
  --color-navy: #0F2D5E;
  --color-navy-light: #1A4A8A;
  --color-navy-dark: #0A1F3D;
  --color-amber: #F59E0B;
  --color-amber-light: #FBBF24;
  --color-amber-dark: #D97706;
  --color-surface: #FFFFFF;
  --color-text-primary: #0F2D5E;
  --color-text-secondary: #4B5563;

  /* Typography */
  --font-sans: var(--font-ibm-plex-sans);
  --font-serif: var(--font-ibm-plex-serif);

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
}
```

---

*Document version: 1.0 — Last updated: 2026-05-13*