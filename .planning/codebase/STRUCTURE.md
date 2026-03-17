# STRUCTURE.md - Directory Structure

**Analysis Date:** 2026-03-17

## Root Structure

```
wag/                      # Project root
├── app/                  # Next.js App Router
│   ├── page.tsx          # Home page
│   ├── layout.tsx        # Root layout
│   ├── services/         # Services page
│   ├── about/           # About page
│   ├── resources/       # Blog listing
│   ├── enquiry/         # Enquiry form
│   ├── api/             # API routes
│   ├── components/      # Shared components
│   └── sitemap.ts       # Sitemap
├── content/              # MDX blog content
├── lib/                  # Utility functions
├── public/               # Static assets
├── .next/                # Build output
├── vercel.json           # Vercel config
└── package.json
```

## Key Locations

| Path | Purpose |
|------|---------|
| `app/components/Navbar.tsx` | Navigation component |
| `app/components/Footer.tsx` | Footer component |
| `app/api/enquiry/route.ts` | Enquiry form handler |
| `content/blog/` | MDX blog posts |

---

*Structure analysis: 2026-03-17*
