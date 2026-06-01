```markdown
# wag Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns, coding conventions, and team workflows for the `wag` codebase—a TypeScript project built with Next.js. It covers file and code style, commit practices, documentation and planning routines, feature and content publication, and testing patterns. Use this guide to onboard quickly, contribute consistently, and leverage the repository's established workflows.

## Coding Conventions

- **File Naming:**  
  Use `kebab-case` for all file names.  
  _Example:_  
  ```
  user-profile.tsx
  navbar-menu.ts
  ```

- **Import Style:**  
  Both default and named imports are used.  
  _Examples:_  
  ```typescript
  import React from 'react';
  import { useState } from 'react';
  import Navbar from './navbar';
  ```

- **Export Style:**  
  Both default and named exports are present.  
  _Examples:_  
  ```typescript
  // Default export
  export default function Navbar() { ... }

  // Named export
  export function getUser() { ... }
  ```

- **Commit Messages:**  
  Follow [Conventional Commits](https://www.conventionalcommits.org/) with these prefixes: `docs`, `feat`, `refactor`, `fix`.  
  _Example:_  
  ```
  feat: add phone button to navbar
  fix: correct logo alignment in navbar
  docs: update architecture documentation
  ```

## Workflows

### Codebase Documentation Refresh
**Trigger:** When you need to document or update the current state of the codebase for onboarding or planning.  
**Command:** `/refresh-codebase-docs`

1. Edit or create markdown files in `.planning/codebase/` (e.g., `ARCHITECTURE.md`, `STACK.md`, etc.).
2. Summarize or update each file with current information.
3. Commit all updated documentation files together.

_Files involved:_  
- `.planning/codebase/ARCHITECTURE.md`
- `.planning/codebase/STACK.md`
- `.planning/codebase/INTEGRATIONS.md`
- `.planning/codebase/CONCERNS.md`
- `.planning/codebase/CONVENTIONS.md`
- `.planning/codebase/STRUCTURE.md`
- `.planning/codebase/TESTING.md`

---

### Navbar Feature or Style Update
**Trigger:** When you want to add, update, or fix features or styles in the Navbar.  
**Command:** `/update-navbar`

1. Edit `app/components/Navbar.tsx` to add or update a feature (e.g., add a phone button, update the logo).
2. Update related assets if needed (e.g., logo images in `public/`).
3. Test the Navbar visually and functionally.
4. Commit changes, ideally in small, focused commits.

_Files involved:_  
- `app/components/Navbar.tsx`
- `public/logo-nav-trans-cropped.png`
- `public/logo-nav-trans.png`
- `public/logos/logo-nav-trans.png`

---

### Blog or Social Content Publication
**Trigger:** When you want to publish a new article and/or a related social media campaign.  
**Command:** `/new-blog-social-campaign`

1. Create a new `.mdx` file in `content/blog/` for the article.
2. Add related images to `public/social/[platform]/[post-slug]/imgs/`.
3. Create outline, post, and prompt markdown files in `social/[platform]-post/[date-slug]/`.
4. Optionally add `preview.html` or `batch.json` for social publishing.
5. Commit all related files together.

_Files involved:_  
- `content/blog/*.mdx`
- `public/social/[platform]*/[date-slug]*/imgs/*.png`
- `social/[platform]-post/[date-slug]*/outline.md`
- `social/[platform]-post/[date-slug]*/post.md`
- `social/[platform]-post/[date-slug]*/prompts/*.md`
- `social/[platform]-post/[date-slug]*/preview.html`
- `social/[platform]-post/[date-slug]*/batch.json`

---

### Feature Development with Planning Phase
**Trigger:** When you want to develop a significant new feature or architectural change, especially for AI/agent-related work.  
**Command:** `/init-feature-phase`

1. Create or update planning files in `.planning/` (e.g., `PROJECT.md`, `ROADMAP.md`, `REQUIREMENTS.md`, `phases/*/CONTEXT.md`, etc.).
2. Implement the feature in the codebase (e.g., `app/`, `.claude/`).
3. Commit planning and implementation files, sometimes in separate commits.

_Files involved:_  
- `.planning/PROJECT.md`
- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/phases/*/CONTEXT.md`
- `.planning/phases/*/RESEARCH.md`
- `.planning/phases/*/PLAN.md`
- `.planning/phases/*/SUMMARY.md`
- `.claude/teams/wag-ai/state/*`
- `.claude/teams/wag-ai/checkpoints/*`
- `.claude/settings.json`

---

## Testing Patterns

- **Test File Naming:**  
  Test files follow the pattern `*.test.*` (e.g., `navbar.test.tsx`).
- **Framework:**  
  The specific testing framework is not detected, but standard Next.js/TypeScript projects often use [Jest](https://jestjs.io/) or [React Testing Library](https://testing-library.com/).

_Example test file:_  
```typescript
// navbar.test.tsx
import { render, screen } from '@testing-library/react';
import Navbar from './Navbar';

test('renders logo', () => {
  render(<Navbar />);
  expect(screen.getByAltText('Logo')).toBeInTheDocument();
});
```

## Commands

| Command                     | Purpose                                                        |
|-----------------------------|----------------------------------------------------------------|
| /refresh-codebase-docs      | Refresh and update codebase documentation                      |
| /update-navbar              | Add or update features/styles in the Navbar                    |
| /new-blog-social-campaign   | Publish a new blog article and related social content          |
| /init-feature-phase         | Start a new feature or refactor with a planning phase          |
```