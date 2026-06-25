---
name: Winning Adventure Global
description: China sourcing agent design system for Australian B2B audiences
version: "1.2"

colors:
  navy: "#0F2D5E"
  navy-light: "#1A4A8A"
  navy-dark: "#0A1F3D"
  amber: "#C97A0A"
  amber-light: "#FBBF24"
  amber-dark: "#D97706"
  white: "#FFFFFF"
  surface: "#FFFFFF"
  surface-warm: "#F8F9FB"
  green: "#059669"
  red: "#DC2626"
  text-primary: "#0F2D5E"
  text-secondary: "#4B5563"
  text-muted: "#6B7280"
  border: "#E5E7EB"

typography:
  display-hero:
    fontFamily: "IBM Plex Serif"
    fontSize: "clamp(36px,4.4vw,90px)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.02em
  display-xl:
    fontFamily: "IBM Plex Serif"
    fontSize: "clamp(32px,5vw,48px)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.01em
  display-lg:
    fontFamily: "IBM Plex Serif"
    fontSize: "clamp(28px,4vw,42px)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.01em
  headline:
    fontFamily: "IBM Plex Serif"
    fontSize: "clamp(22px,2.8vw,36px)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.02em
  body:
    fontFamily: "IBM Plex Sans"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "IBM Plex Sans"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "IBM Plex Sans"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.4
  label-sm:
    fontFamily: "IBM Plex Sans"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0.01em
  badge:
    fontFamily: "IBM Plex Sans"
    fontSize: 10px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0.04em

rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  4xl: 96px

components:
  button-primary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.white}"
    typography: "{label}"
    rounded: "{rounded.none}"
    padding: "{spacing.md} {spacing.lg}"
  button-primary-hover:
    backgroundColor: "{colors.navy-light}"
  button-secondary:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.text-primary}"
    typography: "{label}"
    rounded: "{rounded.none}"
    padding: "{spacing.md} {spacing.lg}"
  button-secondary-hover:
    backgroundColor: "{colors.amber-dark}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    border: "1px solid {colors.navy}"
    typography: "{label}"
    rounded: "{rounded.none}"
    padding: "{spacing.md} {spacing.lg}"
  input-field:
    backgroundColor: "{colors.white}"
    border: "1px solid {colors.border}"
    textColor: "{colors.text-primary}"
    typography: "{body}"
    rounded: "{rounded.none}"
    padding: "12px {spacing.md}"
  lead-form:
    backgroundColor: "{colors.white}"
    padding: "{spacing.lg} {spacing.xl}"
    shadow: "0 12px 40px rgba(15,45,94,0.18)"
---
# Design System: Winning Adventure Global — The Factory Floor Edition

## 1. Overview

**Creative North Star: "The Factory Floor"**

The visual system treats every interaction as part of an efficient, trustworthy industrial process — clean, direct, no wasted motion. Deep navy (`#0F2D5E`) carries authority and stability; amber (`#C97A0A`) provides a warm, energetic accent used sparingly. IBM Plex Sans (UI clarity) and IBM Plex Serif (editorial warmth) form the typographic backbone.

The system explicitly rejects: generic corporate B2B aesthetics (stock photos of handshakes, blue gradients), high-pressure sales funnels (countdown timers, "limited time offer"), and bureaucratic complexity. Confidence without coldness — authority comes from specificity and proof (real factory numbers, the 1,200+ database), not from corporate polish.

**Key Characteristics:**
- Flat by default, tactile on interaction (cards lift on hover, buttons nudge up)
- Copy is the design — clarity over cleverness, every element earns its place
- Hero images are real CC0 industrial/shipping photography, not generic stock
- Color tells hierarchy: white text is normal, amber is italic-emphasized
- Journey-aware for anxious first-time China sourcers

## 2. Colors: The Factory Floor Palette

Two primary roles, no excess. Navy carries the system; amber signals action.

### Primary
- **Factory Navy** (`#0F2D5E`): The dominant color — professionalism, trust, stability. Used for headlines, body text, primary buttons, footer, navigation, hero backgrounds. Light variant (`#1A4A8A`) for hover states. Dark variant (`#0A1F3D`) for high-contrast text.

### Accent
- **Warning Amber** (`#C97A0A`): Warm, energetic, used sparingly — CTAs, highlights, the active "Do" in the color-split hero slogan. Light variant (`#FBBF24`) for hover. Dark variant (`#D97706`) for pressed.

### Neutral
- **Surface** (`#FFFFFF`): Card backgrounds, form inputs, lead form.
- **Surface Warm** (`#F8F9FB`): Alternating section backgrounds, case study areas.
- **Text Primary** (`#0F2D5E`): Body copy on light backgrounds.
- **Text Secondary** (`#4B5563`): Supporting text, descriptions.
- **Text Muted** (`#6B7280`): Captions, metadata.
- **Border** (`#E5E7EB`): Card borders, dividers, input outlines.

### Named Rules
**The Amber-Italic Rule.** In the hero slogan, theme-colored words (highlighted concepts: *factories*, *middleman*, *markup*) are rendered in amber italic. All surrounding words are white normal weight. This pattern expresses: "the emphasized word IS the value." Never apply amber to a block of text — only to single words or short phrases.

**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to state (card hover, form focus elevation). The system has no persistent shadows on cards.

## 3. Typography

**Display Font:** IBM Plex Serif (geometric serif, editorial warmth)
**Body Font:** IBM Plex Sans (geometric sans, UI clarity)

**Character:** IBM Plex Serif in display sizes carries authority without stuffiness — like a well-lettered factory sign. IBM Plex Sans provides crisp, no-nonsense body copy. The contrast axis is serif (for headlines and trust) vs. sans (for action and information).

### Hierarchy

- **Display Hero** (700, `clamp(36px,4.4vw,90px)`, 1.05): Hero slogan — the single most important line on the page. Only used on the homepage.
- **Display XL** (600, `clamp(32px,5vw,48px)`, 1.2): Major section titles (e.g. "Your China Trip, End to End").
- **Display LG** (600, `clamp(28px,4vw,42px)`, 1.2): Section titles, service page H1.
- **Headline** (700, `clamp(22px,2.8vw,36px)`, 1.1): Hero supporting lines ("No middleman. No markup."), smaller H2s.
- **Body** (400, 16px, 1.6): Default text. Cap at 65–75ch width.
- **Body SM** (400, 14px, 1.5): Captions, footnotes, meta.
- **Label** (600, 14px, 1.4): Buttons, nav links, form labels.
- **Label SM** (600, 12px, 1.4, 0.01em): Small UI labels, badges.
- **Badge** (600, 10px, 1.2, 0.04em): Tiny uppercase metadata — trust markers, "AUSTRALIA", section badges.

### Named Rules
**The One Weight Rule.** System text (body, labels, inputs) uses font-weight 400 (normal) or 600 (semibold). No 300, no 700 beyond headings. IBM Plex Sans is already legible; extra weights add noise, not hierarchy.

## 4. Elevation

The system is fundamentally flat. Depth is communicated through tonal layering (navy-tinted backgrounds, white surface cards) rather than shadows. Shadows appear only as interaction feedback.

### Shadow Vocabulary
- **Navbar** (`0 1px 3px rgba(15,45,94,0.08)`): Subtle separation, barely perceptible.
- **Card hover** (`0 10px 15px rgba(15,45,94,0.1)`): The factory-card lift effect.
- **Lead Form** (`0 12px 40px rgba(15,45,94,0.18)`): The only persistent shadow — the inline lead capture form floats above the hero. This is intentional: the form IS the conversion point.
- **Mega Menu** (`0 20px 56px -12px rgba(15,45,94,0.22)`): Deepest shadow, reserved for the dropdown panel.

### Named Rules
**The Tonal-Layer Rule.** Section backgrounds alternate between white and `#F8F9FB` (surface warm). This creates rhythm without shadows. Never use a shadow to separate sections that could be separated by a background change.

## 5. Components

### Buttons
- **Shape:** Square (0px radius). No rounded corners on primary/secondary CTAs. Ghost buttons follow the same square convention.
- **Primary (Navy):** Navy (`#0F2D5E`) background, white text, 14px/600. Transition: `hover:bg-[#1A4A8A]`. No shadow at rest; slight shadow on hover.
- **Secondary (Amber):** Amber (`#C97A0A`) background, navy text, 14px/600. Used sparingly — only for the "Book Free Consult" CTA.
- **Ghost:** Transparent, 1px navy border, navy text. Used for secondary actions ("How factory visits work").
- **All buttons:** Minimum 44px touch target. `transition: 200ms ease-out`.

### Lead Form (`LeadForm.tsx`)
- **Container:** White background, `0 12px 40px` persistent shadow. 24px/32px padding.
- **Heading:** ShieldCheck icon (amber) + "Book your free consult" in serif/navy.
- **Fields:** 3 fields only (full name, work email, what are you sourcing). Each has an explicit visible `<label>` (not placeholder-only). Focus state: navy border + amber ring. Placeholder text: `placeholder:text-navy/40`.
- **Button:** Full-width amber, "Book Free Consult". Hover: navy background + white text (inversion).
- **Success state:** Check icon + "Thanks — we've got it." message.
- **Error state:** Red text with mailto link to `mark@winningadventure.com.au`.
- **Subcopy:** "Your details go straight to our Australia-based team." (11px, navy/50).

### Navigation (Navbar)
- **Background:** White, 95% opacity, `backdrop-blur-md`. Shadow: `0 1px 3px rgba(15,45,94,0.08)`.
- **Fixed position,** z-index 100. Logo left, links center, CTA right.
- **Desktop:** 5 links (Home, Services, Articles, About Us, Enquiry). Services has a `ChevronDown` indicator that rotates 180° when the mega menu is open.
- **Mega Menu (Services):** Full-width panel below navbar. Columns with vertical dividers. Link hover shows a left amber accent bar (animated `w-0 → w-1.5`). CTA block: "Not sure which service?" + "Book Free Consult" button.
- **Mobile:** Hamburger opens right slide-in. Services becomes an accordion. ChevronDown rotates on open.

### Cards
- **Factory Card:** White background, 1px `#E5E7EB` border, 12px radius, 24px padding. No shadow at rest. Hover: deeper border + `0 10px 15px` shadow. Transition: 200ms ease-out.

### Form Inputs
- **Style:** 1px `#E5E7EB` border, white background, 12px vertical padding, 16px horizontal.
- **Focus:** Border shifts to navy, ring appears (`0 0 0 3px rgba(201,122,10,0.4)`) in amber.
- **Text:** 15px navy, placeholder at 40% navy opacity.
- **Error:** Red (`#DC2626`) border + error message below. Never use toast-only error feedback.

### Mega Menu (`ServicesMegaMenu.tsx`)
- **Trigger:** Hover on "Services" nav link. ChevronDown rotates 180°.
- **Panel:** Full-width absolute below navbar. Navy-10 top border. Deep shadow.
- **Columns:** Each column separated by `border-l border-navy/10`. Column heading: 11px uppercase tracking, 40% navy.
- **Link hover:** Left amber-accent bar (rounded-full, animated width). Text shifts from navy/75 to navy.
- **CTA block:** "Not sure which service?" + supporting copy + "Book Free Consult" with ArrowRight icon.

### Hero Image Pattern
- All 4 service/content pages use CC0 free commercial photography from Openverse/rawpixel.
- **Treatment:** `fill` + `object-cover` + navy gradient overlay (`from-navy/90 via-navy/80 to-navy/70`).
- **Gradient opacity must use Tailwind default scale values** (/70, /80, /90, /95). Non-default opacities (e.g. /97) do not generate in the current Tailwind build.
- **Current images:** Services (cargo ship), About (container terminal), Supplier Verification (Port Melbourne terminal), Articles (industrial factory interior).

### Anchor Sections
- All scroll-target sections with `id` attributes must include `scroll-mt-20` to account for the 64px fixed navbar.

## 6. Do's and Don'ts

### Do:
- **Do** use navy for primary headings, buttons, and hero backgrounds.
- **Do** use amber for CTAs and single-word emphasis in hero text.
- **Do** keep the hero color-split pattern: white = normal, amber = italic.
- **Do** use CC0 industrial/shipping photography with navy gradient overlay.
- **Do** maintain 44px minimum touch targets on all interactive elements.
- **Do** use `scroll-mt-20` on any section with an `id` anchor.
- **Do** use "Book Free Consult" as the site-wide primary CTA.
- **Do** import LeadForm from `@/components/LeadForm` for any new lead capture.
- **Do** link new landing pages in `nav-links.ts` with `live: true` to auto-register in menu + sitemap.

### Don't:
- **Don't** use "WAG" or "WA" abbreviations — always "Winning Adventure Global".
- **Don't** use emoji anywhere in the frontend codebase.
- **Don't** use Chinese in page content, UI text, buttons, or labels. (Exception: code comments.)
- **Don't** claim "no deposit required" or "free service" — only the consultation is free.
- **Don't** use non-standard Tailwind opacity values (no `/8`, `/94`, `/97`) — they silently fail to generate.
- **Don't** use academic reference lists on landing pages (they belong in reports).
- **Don't** hard-code colors — use Tailwind's `navy`/`amber` tokens.
- **Don't** use generic stock photography — use CC0 industrial/shipping/trade images.
- **Don't** link to non-existent anchor IDs (the `/#industries` footer links were removed for this reason).
- **Don't** put side-stripe borders on cards — use full background tints instead.
- **Don't** use the eyebrow (tiny uppercase tracked label) as every-section scaffolding.

---

*Document version: 1.2 — Last updated: 2026-06-25. Refreshed via /impeccable document after session: hero restructure, lead form, mega menu, CC0 images, slogan coloring, floating widget removal.*
