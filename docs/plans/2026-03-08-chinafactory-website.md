# ChinaFactory.com.au Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建一个 B2B 工厂目录网站，帮助澳洲采购商搜索和筛选经过认证的中国工厂，为 WAG 引流。

**Architecture:** Next.js 14 App Router + Supabase (PostgreSQL) + Tailwind CSS。数据通过 Crawl4AI 从广交会官网抓取，存储到 Supabase。前端使用 Server Components，默认 'use client' 仅在需要交互时使用。

**Tech Stack:** Next.js 14.2, TypeScript, Tailwind CSS 3.4, Supabase, Lucide Icons

---

## 项目初始化

### Task 1: 初始化 Next.js 项目

**Files:**
- Create: `web/chinafactory/package.json`
- Create: `web/chinafactory/tsconfig.json`
- Create: `web/chinafactory/tailwind.config.ts`
- Create: `web/chinafactory/next.config.js`
- Create: `web/chinafactory/.env.local.example`

**Step 1: 创建 package.json**

```json
{
  "name": "chinafactory",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "lucide-react": "^0.309.0",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.2.0"
  }
}
```

**Step 2: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Step 3: 创建 tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F2D5E',
        accent: '#F59E0B',
        background: '#F8FAFC',
        text: '#1E293B',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        serif: ['IBM Plex Serif', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
```

**Step 4: 创建 next.config.js**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cantonfair.org',
      },
    ],
  },
}

module.exports = nextConfig
```

**Step 5: 创建 .env.local.example**

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Step 6: 安装依赖**

Run: `cd web/chinafactory && npm install`
Expected: 安装成功，生成 node_modules

**Step 7: Commit**

```bash
cd web/chinafactory
git init
git add package.json tsconfig.json tailwind.config.ts next.config.js .env.local.example
git commit -m "chore: initialize Next.js 14 project with Tailwind"
```

---

### Task 2: 创建基础项目结构

**Files:**
- Create: `web/chinafactory/app/layout.tsx`
- Create: `web/chinafactory/app/globals.css`
- Create: `web/chinafactory/app/page.tsx`
- Create: `web/chinafactory/lib/supabase.ts`
- Create: `web/chinafactory/components/Navbar.tsx`
- Create: `web/chinafactory/components/Footer.tsx`

**Step 1: 创建 app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Serif:wght@400;500;600;700&display=swap');

:root {
  --primary: #0F2D5E;
  --accent: #F59E0B;
  --background: #F8FAFC;
  --text: #1E293B;
}

body {
  background-color: var(--background);
  color: var(--text);
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
}
```

**Step 2: 创建 lib/supabase.ts**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Step 3: 创建 app/layout.tsx**

```typescript
import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'ChinaFactory.com.au - Verified Chinese Factories for Australian Buyers',
  description: 'Find and connect with verified Chinese manufacturers from Canton Fair. Get quotes and book factory visits with WAG sourcing experts.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

**Step 4: 创建 components/Navbar.tsx**

```typescript
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold">
            ChinaFactory
          </Link>
          <div className="flex space-x-8">
            <Link href="/factories" className="hover:text-accent transition">
              Factories
            </Link>
            <Link href="/about" className="hover:text-accent transition">
              About
            </Link>
            <Link href="/contact" className="hover:text-accent transition">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
```

**Step 5: 创建 components/Footer.tsx**

```typescript
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-primary text-white py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-lg font-bold">ChinaFactory.com.au</p>
            <p className="text-sm text-gray-300">Your bridge to verified Chinese manufacturers</p>
          </div>
          <div className="flex space-x-6">
            <Link href="/about" className="hover:text-accent transition">About</Link>
            <Link href="/contact" className="hover:text-accent transition">Contact</Link>
            <a href="https://wag.com.au" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition">
              WAG Website
            </a>
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-400">
          Powered by WAG - Winning Adventure Global
        </div>
      </div>
    </footer>
  )
}
```

**Step 6: 创建 app/page.tsx (临时首页)**

```typescript
export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Verified Chinese Factories
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            Connect with Canton Fair verified manufacturers
          </p>
          <p>Homepage coming soon...</p>
        </div>
      </section>
    </div>
  )
}
```

**Step 7: 验证开发服务器**

Run: `cd web/chinafactory && npm run dev`
Expected: 开发服务器启动在 localhost:3000

**Step 8: Commit**

```bash
git add app/ components/ lib/
git commit -m "feat: create base project structure"
```

---

## 数据库设计

### Task 3: 创建 Supabase 数据库 Schema

**Files:**
- Create: `web/chinafactory/supabase/schema.sql`

**Step 1: 创建 schema.sql**

```sql
-- Factories table
CREATE TABLE factories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name_en VARCHAR(255) NOT NULL,
  company_name_cn VARCHAR(255),
  province VARCHAR(100),
  city VARCHAR(100),
  industry VARCHAR(100),
  products TEXT[],
  certifications TEXT[],
  employee_count VARCHAR(50),
  established_year INTEGER,
  booth_number VARCHAR(50),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(100),
  website VARCHAR(255),
  description TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for filtering
CREATE INDEX idx_factories_province ON factories(province);
CREATE INDEX idx_factories_city ON factories(city);
CREATE INDEX idx_factories_industry ON factories(industry);
CREATE INDEX idx_factories_certifications ON factories USING GIN(certifications);

-- Quote requests table
CREATE TABLE quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id UUID REFERENCES factories(id),
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_company VARCHAR(255),
  user_message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Industries lookup table
CREATE TABLE industries (
  id SERIAL PRIMARY KEY,
  name_en VARCHAR(100) NOT NULL,
  name_cn VARCHAR(100),
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(50)
);

-- Certifications lookup table
CREATE TABLE certifications (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL
);
```

**Step 2: 说明如何执行**

需要在 Supabase Dashboard 中执行此 SQL，或使用 Supabase CLI:
```bash
supabase db push
```

**Step 3: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add Supabase database schema"
```

---

## 首页开发

### Task 4: 开发首页 - Hero 和搜索

**Files:**
- Modify: `web/chinafactory/app/page.tsx`
- Create: `web/chinafactory/components/home/HeroSearch.tsx`

**Step 1: 创建 HeroSearch 组件**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

const popularSearches = [
  'Electronics',
  'Textiles',
  'Machinery',
  'Furniture',
]

export default function HeroSearch() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/factories?search=${encodeURIComponent(query)}`)
    }
  }

  return (
    <section className="bg-primary text-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Verified Chinese Factories
          </h1>
          <p className="text-xl text-gray-200">
            Connect with Canton Fair verified manufacturers for your sourcing needs
          </p>
        </div>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="flex items-center bg-white rounded-lg overflow-hidden shadow-lg">
            <Search className="w-6 h-6 text-gray-400 ml-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search factories, products, or categories..."
              className="flex-1 px-4 py-4 text-gray-900 outline-none text-lg"
            />
            <button
              type="submit"
              className="bg-accent hover:bg-amber-600 text-gray-900 font-semibold px-8 py-4 transition"
            >
              Search
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-300 mb-2">Popular searches:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => router.push(`/factories?search=${term}`)}
                className="px-4 py-1 bg-white/10 hover:bg-white/20 rounded-full text-sm transition"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
```

**Step 2: 更新首页**

```typescript
import HeroSearch from '@/components/home/HeroSearch'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSearch />
    </div>
  )
}
```

**Step 3: 验证**

Run: `cd web/chinafactory && npm run dev`
Expected: 首页显示搜索框，搜索可跳转

**Step 4: Commit**

```bash
git add components/home/ app/page.tsx
git commit -m "feat: add hero search to homepage"
```

---

### Task 5: 开发首页 - 行业分类

**Files:**
- Create: `web/chinafactory/components/home/IndustryCategories.tsx`

**Step 1: 创建 IndustryCategories 组件**

```typescript
import Link from 'next/link'
import { Factory, Shirt, Cog, Sofa, Package, Laptop, Wrench, Hammer } from 'lucide-react'

const industries = [
  { name: 'Electronics', icon: Laptop, count: 1250 },
  { name: 'Textiles & Apparel', icon: Shirt, count: 980 },
  { name: 'Machinery', icon: Cog, count: 750 },
  { name: 'Furniture', icon: Sofa, count: 620 },
  { name: 'Packaging', icon: Package, count: 480 },
  { name: 'Hardware', icon: Hammer, count: 390 },
  { name: 'Tools', icon: Wrench, count: 280 },
  { name: 'Manufacturing', icon: Factory, count: 1100 },
]

export default function IndustryCategories() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12 text-primary">
          Browse by Industry
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {industries.map((industry) => {
            const Icon = industry.icon
            return (
              <Link
                key={industry.name}
                href={`/factories?industry=${encodeURIComponent(industry.name)}`}
                className="group p-6 border border-gray-200 rounded-lg hover:border-accent hover:shadow-md transition cursor-pointer"
              >
                <Icon className="w-10 h-10 text-primary group-hover:text-accent mb-4 transition" />
                <h3 className="font-semibold text-lg mb-1">{industry.name}</h3>
                <p className="text-gray-500 text-sm">{industry.count} factories</p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
```

**Step 2: 更新首页**

```typescript
import HeroSearch from '@/components/home/HeroSearch'
import IndustryCategories from '@/components/home/IndustryCategories'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSearch />
      <IndustryCategories />
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add components/home/ app/page.tsx
git commit -m "feat: add industry categories to homepage"
```

---

### Task 6: 开发首页 - 为什么通过 WAG

**Files:**
- Create: `web/chinafactory/components/home/WhyWag.tsx`

**Step 1: 创建 WhyWag 组件**

```typescript
import { Award, Shield, Users, Globe } from 'lucide-react'

const benefits = [
  {
    icon: Shield,
    title: 'Verified Factories',
    description: 'All factories verified through Canton Fair official data',
  },
  {
    icon: Award,
    title: '10+ Years Experience',
    description: 'Expert sourcing team with deep China manufacturing knowledge',
  },
  {
    icon: Users,
    title: '1000+ Factory Network',
    description: 'Direct connections to quality manufacturers across China',
  },
  {
    icon: Globe,
    title: 'Australian Owned',
    description: 'Local support with understanding of Australian standards',
  },
]

export default function WhyWag() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-4 text-primary">
          Why Source with WAG?
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Your trusted bridge to verified Chinese manufacturers
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit) => {
            const Icon = benefit.icon
            return (
              <div key={benefit.title} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
                  <Icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <a
            href="https://wag.com.au"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-primary hover:bg-blue-900 text-white font-semibold px-8 py-3 rounded-lg transition"
          >
            Learn More About WAG
          </a>
        </div>
      </div>
    </section>
  )
}
```

**Step 2: 更新首页**

```typescript
import HeroSearch from '@/components/home/HeroSearch'
import IndustryCategories from '@/components/home/IndustryCategories'
import WhyWag from '@/components/home/WhyWag'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSearch />
      <IndustryCategories />
      <WhyWag />
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add components/home/ app/page.tsx
git commit -m "feat: add why WAG section to homepage"
```

---

## 工厂列表页

### Task 7: 开发工厂列表页 - 布局和筛选

**Files:**
- Create: `web/chinafactory/app/factories/page.tsx`
- Create: `web/chinafactory/components/factories/FactoryFilters.tsx`
- Create: `web/chinafactory/components/factories/FactoryList.tsx`
- Create: `web/chinafactory/types/index.ts`

**Step 1: 创建 types/index.ts**

```typescript
export interface Factory {
  id: string
  company_name_en: string
  company_name_cn?: string
  province?: string
  city?: string
  industry?: string
  products?: string[]
  certifications?: string[]
  employee_count?: string
  established_year?: number
  booth_number?: string
  contact_email?: string
  contact_phone?: string
  is_verified: boolean
}
```

**Step 2: 创建 FactoryFilters 组件**

```typescript
'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const industries = [
  'Electronics',
  'Textiles & Apparel',
  'Machinery',
  'Furniture',
  'Packaging',
  'Hardware',
]

const provinces = [
  'Guangdong',
  'Zhejiang',
  'Jiangsu',
  'Fujian',
  'Shandong',
]

const certifications = ['CE', 'ISO9001', 'ISO14001', 'GMP', 'BSCI']

export default function FactoryFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/factories?${params.toString()}`)
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Industry</h3>
        <select
          className="w-full p-2 border border-gray-300 rounded-md"
          onChange={(e) => updateFilter('industry', e.target.value)}
          defaultValue={searchParams.get('industry') || ''}
        >
          <option value="">All Industries</option>
          {industries.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Province</h3>
        <select
          className="w-full p-2 border border-gray-300 rounded-md"
          onChange={(e) => updateFilter('province', e.target.value)}
          defaultValue={searchParams.get('province') || ''}
        >
          <option value="">All Provinces</option>
          {provinces.map((prov) => (
            <option key={prov} value={prov}>
              {prov}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Certifications</h3>
        <div className="space-y-2">
          {certifications.map((cert) => (
            <label key={cert} className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams.toString())
                  const current = params.get('certifications')?.split(',') || []
                  if (e.target.checked) {
                    current.push(cert)
                  } else {
                    const idx = current.indexOf(cert)
                    if (idx > -1) current.splice(idx, 1)
                  }
                  if (current.length) {
                    params.set('certifications', current.join(','))
                  } else {
                    params.delete('certifications')
                  }
                  router.push(`/factories?${params.toString()}`)
                }}
              />
              {cert}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Step 3: 创建 FactoryList 组件**

```typescript
import Link from 'next/link'
import { MapPin, Users, Award } from 'lucide-react'
import type { Factory } from '@/types'

interface FactoryListProps {
  factories: Factory[]
}

export default function FactoryList({ factories }: FactoryListProps) {
  if (factories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No factories found</p>
        <p className="text-gray-400 mt-2">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {factories.map((factory) => (
        <Link
          key={factory.id}
          href={`/factories/${factory.id}`}
          className="block bg-white p-6 rounded-lg border border-gray-200 hover:border-accent hover:shadow-md transition cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-primary">
                {factory.company_name_en}
              </h3>
              {factory.company_name_cn && (
                <p className="text-gray-500">{factory.company_name_cn}</p>
              )}
            </div>
            {factory.is_verified && (
              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                <Award className="w-3 h-3 mr-1" />
                Verified
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
            {factory.city && factory.province && (
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {factory.city}, {factory.province}
              </span>
            )}
            {factory.employee_count && (
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {factory.employee_count}
              </span>
            )}
            {factory.industry && <span>{factory.industry}</span>}
          </div>

          {factory.products && factory.products.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {factory.products.slice(0, 4).map((product) => (
                <span
                  key={product}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                >
                  {product}
                </span>
              ))}
              {factory.products.length > 4 && (
                <span className="text-gray-400 text-xs">
                  +{factory.products.length - 4} more
                </span>
              )}
            </div>
          )}

          {factory.certifications && factory.certifications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {factory.certifications.map((cert) => (
                <span
                  key={cert}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                >
                  {cert}
                </span>
              ))}
            </div>
          )}
        </Link>
      ))}
    </div>
  )
}
```

**Step 4: 创建工厂列表页**

```typescript
import { supabase } from '@/lib/supabase'
import FactoryFilters from '@/components/factories/FactoryFilters'
import FactoryList from '@/components/factories/FactoryList'
import type { Factory } from '@/types'

interface Props {
  searchParams: {
    search?: string
    industry?: string
    province?: string
    certifications?: string
  }
}

export default async function FactoriesPage({ searchParams }: Props) {
  let query = supabase.from('factories').select('*')

  if (searchParams.search) {
    query = query.or(`company_name_en.ilike.%${searchParams.search}%,products.cs.{${searchParams.search}}`)
  }
  if (searchParams.industry) {
    query = query.eq('industry', searchParams.industry)
  }
  if (searchParams.province) {
    query = query.eq('province', searchParams.province)
  }
  if (searchParams.certifications) {
    const certs = searchParams.certifications.split(',')
    query = query.overlaps('certifications', certs)
  }

  const { data: factories } = await query.limit(20)

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8 text-primary">Find Factories</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 flex-shrink-0">
            <FactoryFilters />
          </aside>

          <div className="flex-1">
            <FactoryList factories={(factories as Factory[]) || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Step 5: Commit**

```bash
git add app/factories/ components/factories/ types/
git commit -m "feat: add factories listing page with filters"
```

---

## 工厂详情页

### Task 8: 开发工厂详情页

**Files:**
- Create: `web/chinafactory/app/factories/[id]/page.tsx`
- Create: `web/chinafactory/components/factories/FactoryContact.tsx`
- Create: `web/chinafactory/components/factories/QuoteModal.tsx`

**Step 1: 创建 FactoryContact 组件**

```typescript
'use client'

import { Mail, Phone, ExternalLink } from 'lucide-react'
import type { Factory } from '@/types'

interface FactoryContactProps {
  factory: Factory
}

export default function FactoryContact({ factory }: FactoryContactProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="font-semibold text-lg mb-4">Contact Information</h3>

      <div className="space-y-4">
        {factory.contact_email && (
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-gray-400 mr-3" />
            <a
              href={`mailto:${factory.contact_email}`}
              className="text-primary hover:underline"
            >
              {factory.contact_email}
            </a>
          </div>
        )}

        {factory.contact_phone && (
          <div className="flex items-center">
            <Phone className="w-5 h-5 text-gray-400 mr-3" />
            <span>{factory.contact_phone}</span>
          </div>
        )}

        {!factory.contact_email && !factory.contact_phone && (
          <p className="text-gray-500">Contact WAG for details</p>
        )}
      </div>

      <div className="mt-6 space-y-3">
        <button className="w-full bg-accent hover:bg-amber-600 text-gray-900 font-semibold py-3 px-4 rounded-lg transition">
          Get Quote
          <span className="block text-xs font-normal mt-1">
            Get competitive quotes from WAG's sourcing experts
          </span>
        </button>

        <a
          href="https://wag.com.au/factory-visit"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full border-2 border-primary text-primary font-semibold py-3 px-4 rounded-lg hover:bg-primary hover:text-white transition flex items-center justify-center"
        >
          Visit Factory
          <ExternalLink className="w-4 h-4 ml-2" />
          <span className="block text-xs font-normal mt-1">
            Book a guided factory tour with WAG experts
          </span>
        </a>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-500">Powered by</p>
        <p className="font-semibold text-primary">WAG</p>
        <p className="text-xs text-gray-400">Winning Adventure Global</p>
      </div>
    </div>
  )
}
```

**Step 2: 创建工厂详情页**

```typescript
import { notFound } from 'next/navigation'
import { MapPin, Users, Calendar, Award } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import FactoryContact from '@/components/factories/FactoryContact'
import type { Factory } from '@/types'

interface Props {
  params: { id: string }
}

export default async function FactoryDetailPage({ params }: Props) {
  const { data: factory } = await supabase
    .from('factories')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!factory) {
    notFound()
  }

  const f = factory as Factory

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">
                {f.company_name_en}
              </h1>
              {f.company_name_cn && (
                <p className="text-xl text-gray-500">{f.company_name_cn}</p>
              )}
            </div>
            {f.is_verified && (
              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                <Award className="w-4 h-4 mr-1" />
                Verified
              </span>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {f.industry && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Industry</p>
                <p className="font-medium">{f.industry}</p>
              </div>
            )}
            {(f.city || f.province) && (
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  Location
                </p>
                <p className="font-medium">
                  {[f.city, f.province].filter(Boolean).join(', ')}
                </p>
              </div>
            )}
            {f.established_year && (
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Established
                </p>
                <p className="font-medium">{f.established_year}</p>
              </div>
            )}
            {f.employee_count && (
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  Employees
                </p>
                <p className="font-medium">{f.employee_count}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {f.products && f.products.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Products</h2>
                <div className="flex flex-wrap gap-2">
                  {f.products.map((product) => (
                    <span
                      key={product}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full"
                    >
                      {product}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {f.certifications && f.certifications.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Certifications</h2>
                <div className="flex flex-wrap gap-2">
                  {f.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {f.description && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">About</h2>
                <p className="text-gray-600">{f.description}</p>
              </div>
            )}

            {f.booth_number && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Canton Fair</h2>
                <p className="text-gray-600">Booth: {f.booth_number}</p>
              </div>
            )}
          </div>

          <div>
            <div className="sticky top-8">
              <FactoryContact factory={f} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add app/factories/ components/factories/
git commit -m "feat: add factory detail page with contact CTA"
```

---

## About 和 Contact 页面

### Task 9: 开发 About 和 Contact 页面

**Files:**
- Create: `web/chinafactory/app/about/page.tsx`
- Create: `web/chinafactory/app/contact/page.tsx`

**Step 1: 创建 About 页面**

```typescript
import { Award, Users, Globe, Heart } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">About ChinaFactory</h1>

        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <p className="text-lg text-gray-600 mb-6">
            ChinaFactory.com.au is a B2B platform connecting Australian buyers
            with verified Chinese manufacturers from the Canton Fair.
          </p>
          <p className="text-gray-600">
            Our mission is to make sourcing from China transparent, reliable, and
            accessible for Australian businesses of all sizes.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-primary mb-6">Powered by WAG</h2>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <Award className="w-10 h-10 text-accent mb-4" />
            <h3 className="font-semibold text-lg mb-2">10+ Years Experience</h3>
            <p className="text-gray-600">
              Deep expertise in China manufacturing and sourcing
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <Users className="w-10 h-10 text-accent mb-4" />
            <h3 className="font-semibold text-lg mb-2">1000+ Factory Network</h3>
            <p className="text-gray-600">
              Direct connections to quality manufacturers
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <Globe className="w-10 h-10 text-accent mb-4" />
            <h3 className="font-semibold text-lg mb-2">Australian Owned</h3>
            <p className="text-gray-600">
              Local support with understanding of Australian standards
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <Heart className="w-10 h-10 text-accent mb-4" />
            <h3 className="font-semibold text-lg mb-2">Trusted Partner</h3>
            <p className="text-gray-600">
              Commitment to quality and reliability
            </p>
          </div>
        </div>

        <div className="text-center">
          <a
            href="https://wag.com.au"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-primary hover:bg-blue-900 text-white font-semibold px-8 py-3 rounded-lg transition"
          >
            Visit WAG Website
          </a>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: 创建 Contact 页面**

```typescript
'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Thank You!
            </h2>
            <p className="text-gray-600">
              Your message has been received. WAG team will get back to you shortly.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">Contact Us</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-xl font-semibold mb-6">Get in Touch</h2>

            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <a href="mailto:info@wag.com.au" className="text-primary hover:underline">
                  info@wag.com.au
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400 mr-3" />
                <span>+61 2 1234 5678</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                <span>Sydney, Australia</span>
              </div>
            </div>

            <p className="text-gray-600 text-sm">
              For factory sourcing inquiries, please include:
            </p>
            <ul className="text-gray-600 text-sm list-disc list-inside mt-2">
              <li>Industry you're interested in</li>
              <li>Estimated order quantity</li>
              <li>Any specific requirements</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-xl font-semibold mb-6">Send a Message</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-accent hover:bg-amber-600 text-gray-900 font-semibold py-3 rounded-lg transition"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add app/about/ app/contact/
git commit -m "feat: add about and contact pages"
```

---

## 询价功能

### Task 10: 实现询价表单提交功能

**Files:**
- Create: `web/chinafactory/app/api/quote/route.ts`
- Modify: `web/chinafactory/components/factories/QuoteModal.tsx`

**Step 1: 创建 API 路由**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { factory_id, user_name, user_email, user_company, user_message } = body

    if (!factory_id || !user_name || !user_email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('quote_requests')
      .insert({
        factory_id,
        user_name,
        user_email,
        user_company,
        user_message,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to submit quote request' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Step 2: 创建 QuoteModal 组件**

```typescript
'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { Factory } from '@/types'

interface QuoteModalProps {
  factory: Factory
  isOpen: boolean
  onClose: () => void
}

export default function QuoteModal({ factory, isOpen, onClose }: QuoteModalProps) {
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_company: '',
    user_message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factory_id: factory.id,
          ...formData,
        }),
      })

      if (response.ok) {
        setSuccess(true)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <h3 className="text-xl font-semibold text-green-600 mb-4">
            Request Submitted!
          </h3>
          <p className="text-gray-600 mb-4">
            Thank you for your inquiry. WAG's sourcing team will contact you shortly with a competitive quote.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-900 transition"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Get Quote</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Requesting quote for: <strong>{factory.company_name_en}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              required
              value={formData.user_name}
              onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.user_email}
              onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Company</label>
            <input
              type="text"
              value={formData.user_company}
              onChange={(e) => setFormData({ ...formData, user_company: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              rows={3}
              value={formData.user_message}
              onChange={(e) => setFormData({ ...formData, user_message: e.target.value })}
              placeholder="Describe your requirements..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-amber-600 disabled:bg-gray-300 text-gray-900 font-semibold py-3 rounded-lg transition"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

**Step 3: 更新 FactoryContact 使用 Modal**

```typescript
'use client'

import { useState } from 'react'
import { Mail, Phone, ExternalLink } from 'lucide-react'
import QuoteModal from './QuoteModal'
import type { Factory } from '@/types'

interface FactoryContactProps {
  factory: Factory
}

export default function FactoryContact({ factory }: FactoryContactProps) {
  const [showQuoteModal, setShowQuoteModal] = useState(false)

  return (
    <>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-lg mb-4">Contact Information</h3>

        <div className="space-y-4">
          {factory.contact_email && (
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-400 mr-3" />
              <a href={`mailto:${factory.contact_email}`} className="text-primary hover:underline">
                {factory.contact_email}
              </a>
            </div>
          )}

          {factory.contact_phone && (
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-400 mr-3" />
              <span>{factory.contact_phone}</span>
            </div>
          )}

          {!factory.contact_email && !factory.contact_phone && (
            <p className="text-gray-500">Contact WAG for details</p>
          )}
        </div>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => setShowQuoteModal(true)}
            className="w-full bg-accent hover:bg-amber-600 text-gray-900 font-semibold py-3 px-4 rounded-lg transition"
          >
            Get Quote
            <span className="block text-xs font-normal mt-1">
              Get competitive quotes from WAG's sourcing experts
            </span>
          </button>

          <a
            href="https://wag.com.au/factory-visit"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full border-2 border-primary text-primary font-semibold py-3 px-4 rounded-lg hover:bg-primary hover:text-white transition flex items-center justify-center"
          >
            Visit Factory
            <ExternalLink className="w-4 h-4 ml-2" />
            <span className="block text-xs font-normal mt-1">
              Book a guided factory tour with WAG experts
            </span>
          </a>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">Powered by</p>
          <p className="font-semibold text-primary">WAG</p>
          <p className="text-xs text-gray-400">Winning Adventure Global</p>
        </div>
      </div>

      <QuoteModal
        factory={factory}
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
      />
    </>
  )
}
```

**Step 4: Commit**

```bash
git add app/api/ components/factories/
git commit -m "feat: add quote request functionality"
```

---

## 数据抓取脚本

### Task 11: 创建广交会数据抓取脚本

**Files:**
- Create: `web/chinafactory/scripts/scrape_cantonfair.py`

**Step 1: 创建抓取脚本**

```python
#!/usr/bin/env python3
"""
Canton Fair Factory Data Scraper
Usage: python scripts/scrape_cantonfair.py
"""

import asyncio
import json
from crawl4ai import AsyncWebCrawler

CANTONFAIR_URL = "https://exhibitor.cantonfair.org.cn/en/index.aspx"

async def main():
    async with AsyncWebCrawler() as crawler:
        # This is a placeholder - actual implementation would need
        # to handle pagination, CAPTCHA, and data parsing
        print("Canton Fair scraper - placeholder")
        print("Actual implementation requires:")
        print("1. Proper authentication handling")
        print("2. CAPTCHA solving or alternative data source")
        print("3. Rate limiting and politeness")
        print("4. Data cleaning and normalization")

if __name__ == "__main__":
    asyncio.run(main())
```

**Step 2: 创建数据导入脚本**

```typescript
// scripts/import-factories.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

interface FactoryData {
  company_name_en: string
  company_name_cn?: string
  province?: string
  city?: string
  industry?: string
  products?: string[]
  certifications?: string[]
  employee_count?: string
  established_year?: number
  booth_number?: string
  contact_email?: string
  contact_phone?: string
  is_verified: boolean
}

async function importFactories(data: FactoryData[]) {
  const { data: result, error } = await supabase
    .from('factories')
    .upsert(data, { onConflict: 'company_name_en' })
    .select()

  if (error) {
    console.error('Import error:', error)
    return
  }

  console.log(`Imported ${result?.length || 0} factories`)
}

export { importFactories, FactoryData }
```

**Step 3: Commit**

```bash
git add scripts/
git commit -f scripts/scrape_cantonfair.py scripts/import-factories.ts
git commit -m "feat: add data scraping and import scripts"
```

---

## 最终验证

### Task 12: 构建和验证

**Step 1: 运行构建**

Run: `cd web/chinafactory && npm run build`
Expected: 构建成功，无错误

**Step 2: 运行 lint**

Run: `cd web/chinafactory && npm run lint`
Expected: 无错误

**Step 3: 验证页面可访问**

- 首页: localhost:3000
- 工厂列表: localhost:3000/factories
- About: localhost:3000/about
- Contact: localhost:3000/contact

**Step 4: 最终 Commit**

```bash
git add .
git commit -m "feat: complete ChinaFactory website"
```

---

## 总结

| Task | 描述 | 预估时间 |
|------|------|----------|
| 1 | 初始化 Next.js 项目 | 15 min |
| 2 | 创建基础项目结构 | 20 min |
| 3 | Supabase 数据库 Schema | 10 min |
| 4 | 首页 - Hero 搜索 | 20 min |
| 5 | 首页 - 行业分类 | 15 min |
| 6 | 首页 - 为什么通过 WAG | 15 min |
| 7 | 工厂列表页 | 30 min |
| 8 | 工厂详情页 | 25 min |
| 9 | About 和 Contact 页面 | 15 min |
| 10 | 询价表单功能 | 20 min |
| 11 | 数据抓取脚本 | 15 min |
| 12 | 构建验证 | 10 min |

**总预估时间: ~3.5 小时**
