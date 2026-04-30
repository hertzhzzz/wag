---
name: new-component
description: Generate a new Next.js component following WAG conventions (<200 lines, PascalCase, Tailwind, IBM Plex fonts)
disable-model-invocation: true
---

# new-component Skill

Generate a new Next.js component following WAG's strict conventions.

## Usage

User invokes with: `/new-component ComponentName [description]`

## Component Conventions

| Rule | Standard |
|------|----------|
| File naming | PascalCase (e.g., `HeroSection.tsx`) |
| Max lines | < 200 lines |
| Styling | Tailwind utility classes |
| Font | IBM Plex Sans for UI, IBM Plex Serif for headings |
| Brand colors | Primary: `#0F2D5E` (Navy), Accent: `#F59E0B` (Amber) |
| Export | Named export by default |
| Props | TypeScript interface |

## Template

```tsx
'use client';

import { type ReactNode } from 'react';

interface {{ComponentName}}Props {
  children?: ReactNode;
  className?: string;
}

export function {{ComponentName}}({ children, className = '' }: {{ComponentName}}Props) {
  return (
    <div className={`font-sans text-[#0F2D5E] ${className}`}>
      {children}
    </div>
  );
}
```

## Brand System Tokens

```
Primary:   #0F2D5E (Navy)
Accent:    #F59E0B (Amber)
Fonts:     IBM Plex Sans (UI), IBM Plex Serif (headings)
```

## Steps

1. Ask for component name and brief description
2. Generate component file with proper naming and structure
3. Verify < 200 lines
4. Return file path for user to review
