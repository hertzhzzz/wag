# ARCHITECTURE.md - Architecture Analysis

**Analysis Date:** 2026-03-17

## Pattern Overview

**Overall**: Next.js 14 App Router with Server-First Component Architecture

### Key Characteristics
- Server components by default, `'use client'` only when interactivity needed
- File-based routing via `app/` directory
- API routes via `app/api/` for server-side endpoints
- Static site generation (SSG) for blog content
- Path aliasing via `@/` for cleaner imports

## Layers

### Pages (Routes)
- Location: `app/`
- Contains: Page components, layouts, API routes

### Components
- Location: `app/components/`, `app/enquiry/components/`
- Contains: Navbar, Footer, Hero, IndustryCard, etc.

### API Routes
- `app/api/enquiry/route.ts` - POST /api/enquiry
- `app/api/newsletter/route.ts` - POST /api/newsletter
- Uses: Zod validation, Nodemailer

### Content (MDX)
- Location: `content/blog/`
- Processed by: gray-matter, next-mdx-remote

## Data Flow

1. Next.js receives request
2. Route file executes on server
3. Data passed to client components as props
4. Components render to HTML/React

## Error Handling

- Next.js built-in error boundaries
- `app/error.tsx` - React error boundary
- `app/not-found.tsx` - Custom 404 page
- API routes return structured JSON errors

---

*Architecture analysis: 2026-03-17*
