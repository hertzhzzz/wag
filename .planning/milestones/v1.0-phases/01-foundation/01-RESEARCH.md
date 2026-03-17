<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **移动端布局**: 单列堆叠 (flex-col, 各区块垂直排列)
- **Hero 高度**: 半屏 Hero (50-60vh)，让用户能看到下一区块入口
- **装饰图片**: 保留图片，但使用优化版本
- **内容调整**: 保持内容不变，仅调整宽度
- **导航菜单展开动画**: 侧边栏滑入 (slide-in from right)
- **导航菜单关闭机制**: X 按钮 + 点击遮罩关闭 (两者都要)
- **链接排列**: 垂直列表，易于点击
- **链接点击后**: 立即关闭菜单并跳转
- **触摸区域最小尺寸**: 44x44px (遵循 Apple/Google 标准)
- **相邻间距**: 8px 间距
- **文字链接**: 保持原样，不扩展触摸区域
- **垂直间距**: 32-48px (宽松间距，滚动体验更好)
- **两侧内边距**: 16px (px-4)
- **断点策略**: 使用 Tailwind 默认断点 (sm:640px, md:768px)

### Claude's Discretion
- 具体的 Tailwind 工具类选择 (如 space-y-8 vs space-y-12)
- Hero 背景图片的优化策略 (使用 next/image 或 picture 标签)
- 导航菜单的动画时长和缓动函数
- 如何处理横屏移动设备的布局

### Deferred Ideas (OUT OF SCOPE)
- Phase 2 会处理 Services 和 About 页面的响应式
- Phase 3 会处理 Enquiry 表单的响应式
- Phase 4 会处理 Resources 页面

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| RESP-01 | Home page adapts to mobile screens (320px to 1920px+) | Tailwind responsive breakpoints, mobile-first patterns |
| RESP-05 | No horizontal scroll on any page at 320px width | CSS overflow-x: hidden, max-width: 100% |
| TOUCH-01 | All buttons have minimum 44px height | WCAG 2.1 SC 2.5.5 target size guidelines |
| TOUCH-02 | All clickable links have adequate touch spacing (8px minimum between targets) | CSS gap utilities, padding for spacing |
| TOUCH-03 | Navigation menu is thumb-friendly on mobile | 44px touch targets, vertical list layout |
| TYPE-01 | Body text is minimum 16px on mobile | Base font size + responsive typography |
| TYPE-02 | Text is readable without pinch-to-zoom | viewport meta, text scaling |
| TYPE-03 | Line height provides adequate breathing room on mobile | leading utilities |
| NAV-01 | Mobile navigation menu opens and closes properly | State management + animation classes |
| NAV-02 | Navigation has clear close mechanism | X button + overlay click handler |
| NAV-03 | All navigation links are easily tappable on mobile | 44px minimum touch targets |
| SPACE-01 | Adequate vertical spacing on mobile layouts | Tailwind space-y, gap utilities |
| SPACE-02 | Padding prevents content from feeling cramped on small screens | px-4 (16px) side padding |

</phase_requirements>

# Phase 1: Foundation - Research

**Researched:** 2026-03-11
**Domain:** Mobile Responsive Design + Navigation UX
**Confidence:** HIGH

## Summary

Phase 1 focuses on establishing responsive layout patterns for the home page and fixing global navigation for mobile devices. This phase addresses 13 requirements covering responsive design, touch targets, typography, navigation, and spacing.

The project uses **Next.js 14.2 with Tailwind CSS 3.4**, which provides excellent mobile-first tooling. Key technical decisions are already locked: single-column mobile layout, half-screen Hero (50-60vh), slide-in navigation with both X button and overlay close mechanisms, and 44px minimum touch targets per WCAG 2.1 guidelines.

**Primary recommendation:** Use Tailwind's mobile-first responsive utilities (`text-base md:text-lg`, `px-4 md:px-6`), implement slide-in navigation with `translate-x-full` to `translate-x-0` transitions, and add a global `max-w-full overflow-x-hidden` to prevent horizontal scroll.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 14.2 | Framework | App Router with built-in responsive meta handling |
| Tailwind CSS | 3.4 | Styling | Mobile-first utilities, responsive breakpoints |
| TypeScript | (from Next.js) | Type safety | Catches responsive prop errors |
| Lucide React | (from project) | Icons | Menu, X icons for navigation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tailwindcss/typography | latest | Prose styling | Not needed for this phase (home page) |

**Installation:**
No new packages needed - all requirements met with existing stack.

## Architecture Patterns

### Recommended Project Structure
```
frontend/
├── app/
│   ├── components/
│   │   ├── Navbar.tsx          # Mobile menu + hamburger
│   │   ├── Hero.tsx            # Responsive hero section
│   │   ├── StatsBar.tsx        # Grid to stack on mobile
│   │   ├── HowItWorks.tsx      # 5-col to 1-col
│   │   ├── industries/
│   │   │   ├── index.tsx       # Sidebar+panel to stacked
│   │   │   ├── IndustryCard.tsx
│   │   │   └── FeaturedPanel.tsx
│   │   ├── FAQ.tsx             # Accordion spacing
│   │   ├── CTABand.tsx         # Flex wrap
│   │   └── Footer.tsx          # Mobile footer
│   └── globals.css              # Add overflow-x: hidden
```

### Pattern 1: Mobile-First Responsive Classes
**What:** Tailwind's mobile-first approach - unprefixed utilities apply to all sizes, `md:` prefix applies at 768px+

**When to use:** Every responsive component

**Example:**
```tsx
// Source: Tailwind CSS Responsive Design Docs
// Mobile: single column, text-base, px-4
// Desktop: multi-column, text-lg, px-6
<div className="flex flex-col md:flex-row gap-4 px-4 md:px-6 text-base md:text-lg">
  {/* content */}
</div>
```

### Pattern 2: Slide-In Mobile Navigation
**What:** Full-height sidebar slides in from right edge

**When to use:** Mobile hamburger menu implementation

**Example:**
```tsx
// Source: Tailwind CSS Translate Docs
{/* Overlay */}
{mobileMenuOpen && (
  <div
    className="fixed inset-0 bg-black/50 z-40"
    onClick={() => setMobileMenuOpen(false)}
  />
)}

{/* Slide-in panel */}
<aside
  className={`
    fixed top-0 right-0 h-full w-64 bg-white z-50
    transform transition-transform duration-300 ease-in-out
    ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
  `}
>
  <button onClick={() => setMobileMenuOpen(false)}>
    <X size={24} />
  </button>
  {/* Navigation links */}
</aside>
```

### Pattern 3: Touch Target Minimum 44px
**What:** WCAG 2.1 requires minimum 44x44 CSS pixels for touch targets

**When to use:** All buttons and clickable elements

**Example:**
```tsx
// Source: WCAG 2.1 SC 2.5.5
// Use min-h-11 (44px) for buttons
<button className="min-h-11 px-4 py-2">
  Click me
</button>

// Or use padding to reach 44px
<button className="px-4 py-2.5">  {/* ~44px with line-height */}
  Button
</button>
```

### Pattern 4: Prevent Horizontal Scroll
**What:** Ensure no horizontal overflow at 320px width

**When to use:** Root layout and all containers

**Example:**
```css
/* globals.css */
body {
  overflow-x: hidden;
  max-width: 100vw;
}

/* Component level */
<div className="max-w-full overflow-x-hidden">
```

### Anti-Patterns to Avoid
- **Using `sm:` to target mobile:** Incorrect - unprefixed utilities target mobile, `sm:` targets 640px+
- **Fixed widths on mobile:** Use `w-full` or `max-w` instead of fixed `w-64`
- **Horizontal scroll from negative margins:** Use `transform` or padding instead
- **Touch targets smaller than 44px:** Causes usability issues, fails WCAG

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Responsive breakpoints | Custom @media queries | Tailwind `md:`, `lg:` prefixes | Built-in, tested, consistent |
| Touch target sizing | Calculate px manually | Tailwind `min-h-11` (44px) | Matches WCAG exactly |
| Slide animation | CSS keyframes | Tailwind `transition-transform` | Simpler, more maintainable |
| Horizontal scroll fix | JavaScript overflow detection | CSS `overflow-x: hidden` | More reliable |

**Key insight:** Tailwind's utility-first approach handles 95% of responsive patterns out of the box. The combination of mobile-first classes, translate transitions, and spacing utilities covers all Phase 1 requirements.

## Common Pitfalls

### Pitfall 1: Horizontal Scroll at 320px
**What goes wrong:** Page scrolls horizontally on small screens, breaking layout

**Why it happens:** Fixed widths, negative margins, or content overflow

**How to avoid:**
- Use `max-w-full` on all containers
- Add `overflow-x-hidden` to body
- Test at exactly 320px width

**Warning signs:** `width: 640px` hardcoded, negative `margin-left/right`

### Pitfall 2: Touch Targets Too Small
**What goes wrong:** Users can't tap links accurately, especially on mobile

**Why it happens:** Default button/link padding insufficient for 44px minimum

**How to avoid:**
- Add `min-h-11` to buttons
- Add padding to links to reach 44px height
- Use `gap-2` (8px) between clickable elements

**Warning signs:** `h-8` or smaller buttons, no padding on links

### Pitfall 3: Navigation Menu Missing Close Mechanism
**What goes wrong:** User stuck in menu, can't close it

**Why it happens:** Only X button provided, no overlay or tap-outside-to-close

**How to avoid:**
- Add both X button AND overlay click handler
- Close menu on link click
- Ensure close mechanism is visible

**Warning signs:** No overlay, only one close method

### Pitfall 4: Text Too Small on Mobile
**What goes wrong:** Content unreadable without zooming

**Why it happens:** Base font too small, no responsive typography

**How to avoid:**
- Use `text-base` (16px) as minimum
- Use Tailwind's `clamp()` for headings
- Don't override with smaller sizes on mobile

**Warning signs:** `text-sm` on body text, no responsive font sizes

## Code Examples

### Responsive Hero Section
```tsx
// Source: Based on existing Hero.tsx + mobile-first patterns
export default function Hero() {
  return (
    <section className="relative min-h-[50vh] md:min-h-[600px] flex items-center">
      {/* Background video/image */}
      <div className="absolute inset-0">
        <video className="w-full h-full object-cover" ... />
        <div className="absolute inset-0 bg-navy/70" />
      </div>

      {/* Content - responsive padding */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 md:px-6 lg:px-20 py-12 md:py-16">
        <h1 className="text-[clamp(36px,5vw,64px))] ...">
          {/* Headlines */}
        </h1>
        <p className="text-base md:text-sm ...">
          {/* Description */}
        </p>
        {/* Buttons with min-h-11 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link className="min-h-11 px-8 py-4 ...">
            Book a Call
          </Link>
        </div>
      </div>
    </section>
  )
}
```

### Mobile Navigation Component
```tsx
// Source: Based on existing Navbar.tsx + slide-in pattern
'use client'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/resources', label: 'Resources' },
    { href: '/about', label: 'About' },
  ]

  const handleLinkClick = () => setMobileMenuOpen(false)

  return (
    <nav className="h-[72px] flex items-center px-4 md:px-10 border-b border-gray-200 sticky top-0 z-[100] bg-white">
      {/* Logo */}
      <Link href="/" className="flex-shrink-0">
        <Image src="/logo.png" alt="WAG" width={200} height={25} className="h-9 w-auto" />
      </Link>

      {/* Desktop Navigation */}
      <ul className="hidden md:flex gap-9">
        {navLinks.map(link => (
          <li key={link.href}>
            <Link href={link.href} className="nav-link">{link.label}</Link>
          </li>
        ))}
      </ul>

      {/* Desktop CTA */}
      <div className="hidden md:flex">
        <Link href="/enquiry" className="...">
          Start Your Factory Tour
        </Link>
      </div>

      {/* Mobile Hamburger */}
      <button
        className="md:hidden ml-auto min-h-11 min-w-11 flex items-center justify-center"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
        aria-expanded={mobileMenuOpen}
      >
        <Menu size={22} />
      </button>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={`
          fixed top-0 right-0 h-full w-64 bg-white z-50
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex justify-end p-4">
          <button
            className="min-h-11 min-w-11 flex items-center justify-center"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>
        <ul className="flex flex-col gap-2 p-4">
          {navLinks.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={handleLinkClick}
                className="block min-h-11 px-4 flex items-center text-navy"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="pt-4">
            <Link
              href="/enquiry"
              onClick={handleLinkClick}
              className="block min-h-11 px-4 flex items-center bg-navy text-white"
            >
              Start Your Factory Tour
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
```

### Responsive Stats Grid
```tsx
// Source: Based on StatsBar.tsx
export default function StatsBar() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-7 px-4 md:px-12 bg-white border-b border-gray-200">
      {/* Stats - 2 columns on mobile, 4 on desktop */}
      <Stat ... />
      <Stat ... />
      <Stat ... />
      <Stat ... />
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Desktop-first CSS | Mobile-first Tailwind | Pre-existing | Simpler responsive code |
| px-only sizing | rem-based + Tailwind classes | Pre-existing | Better accessibility |
| Custom hamburger menu | Slide-in with both close mechanisms | Current phase | Better UX |
| Fixed widths | max-width + responsive classes | Current phase | No horizontal scroll |

**Deprecated/outdated:**
- CSS-only responsive menus (replaced by JavaScript state)
- Hardcoded pixel widths on containers (use max-w and percentages)
- Touch targets under 44px (WCAG 2.1 violation)

## Open Questions

1. **Hero Background Optimization**
   - What we know: Currently uses `<video>` with poster, can use `next/image` for optimization
   - What's unclear: Whether to keep video on mobile or show poster only
   - Recommendation: Keep video on mobile if it loads quickly, otherwise show poster

2. **Navigation Animation Timing**
   - What we know: 300ms is standard for slide transitions
   - What's unclear: Exact easing curve preference
   - Recommendation: `duration-300 ease-in-out` (Tailwind default)

3. **Landscape Mobile Handling**
   - What we know: User deferred this to Claude's discretion
   - What's unclear: How to handle very short viewport heights
   - Recommendation: Use `min-h-[50vh]` instead of fixed heights, test on actual devices

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None currently installed |
| Config file | N/A |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RESP-01 | Home page adapts to 320px-1920px+ | Manual | N/A - visual test | No |
| RESP-05 | No horizontal scroll at 320px | Manual | N/A - visual test | No |
| TOUCH-01 | Buttons minimum 44px height | Manual | N/A - visual inspection | No |
| TOUCH-02 | 8px spacing between clickables | Manual | N/A - visual inspection | No |
| TOUCH-03 | Navigation thumb-friendly | Manual | N/A - user testing | No |
| TYPE-01 | Body text 16px minimum | Manual | N/A - computed style check | No |
| TYPE-02 | Readable without pinch-zoom | Manual | N/A - visual test | No |
| TYPE-03 | Adequate line height | Manual | N/A - visual test | No |
| NAV-01 | Menu opens/closes properly | Manual | N/A - interaction test | No |
| NAV-02 | Clear close mechanism | Manual | N/A - visual test | No |
| NAV-03 | Links easily tappable (44px) | Manual | N/A - visual inspection | No |
| SPACE-01 | Adequate vertical spacing | Manual | N/A - visual test | No |
| SPACE-02 | Padding prevents cramped feeling | Manual | N/A - visual test | No |

### Sampling Rate
- **Per task commit:** Manual visual verification
- **Per wave merge:** N/A
- **Phase gate:** Manual verification on actual devices/browsers

### Wave 0 Gaps
- [ ] Test framework not installed (no test scripts in package.json)
- [ ] No visual regression testing setup
- [ ] No automated responsive testing

**Recommendation:** For Phase 1, manual testing on actual devices is appropriate given the visual/UX nature of requirements. Consider adding Playwright for future phases if automated visual testing becomes necessary.

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design) - Mobile-first breakpoint system, default breakpoints table
- [Tailwind CSS Translate](https://tailwindcss.com/docs/translate) - translate-x classes for slide-in animation
- [WCAG 2.1 SC 2.5.5 Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html) - 44x44px minimum requirement

### Secondary (MEDIUM confidence)
- [Next.js 14 Documentation](https://nextjs.org/docs) - Framework specifics (already in use)
- [Project CLAUDE.md](/Users/mark/Projects/wag/CLAUDE.md) - Tech stack confirmation

### Tertiary (LOW confidence)
- N/A - All requirements covered by primary sources

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH - Tailwind/Next.js stack confirmed, all requirements met with existing tools
- Architecture: HIGH - Clear patterns from official docs, project conventions established
- Pitfalls: HIGH - Common issues well-documented, prevention strategies clear

**Research date:** 2026-03-11
**Valid until:** 2026-04-11 (30 days - stable technology)
