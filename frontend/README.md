# Winning Adventure Global (WAG)

澳大利亚企业B2B中国商务旅行定制服务平台。

## 技术栈

- **Next.js 14** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS**
- **Google Fonts**: IBM Plex Sans + IBM Plex Serif

### 设计规范
- 主色：Navy `#0F2D5E`
- 强调色：Amber `#F59E0B`

---

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 其他命令

| 命令 | 说明 |
|------|------|
| `npm run build` | 生产构建（必须通过后再提交） |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | ESLint 检查 |

---

## 项目结构

```
wa-global-nextjs/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 根布局（字体、全局样式）
│   ├── page.tsx            # 首页
│   ├── globals.css         # 全局 CSS 变量
│   ├── about/              # 关于页面
│   ├── services/           # 服务页面
│   ├── enquiry/            # 询价页面
│   ├── resources/          # 资源页面
│   │   └── [slug]/         # 资源详情（动态路由）
│   └── components/         # 可复用组件
├── components/             # 根级组件（旧版，保持兼容）
├── public/                 # 静态资源
├── tailwind.config.ts      # Tailwind 配置
├── tsconfig.json           # TypeScript 配置
└── package.json
```

---

## 页面路由

| 路径 | 说明 |
|------|------|
| `/` | 首页 |
| `/services` | 服务介绍 |
| `/about` | 关于我们 |
| `/resources` | 资源中心 |
| `/enquiry` | 在线询价 |

---

## 组件规范

### 文件命名
- PascalCase：`Hero.tsx`, `Navbar.tsx`, `FAQ.tsx`

### 组件类型
- **Server Components**（默认）：用于静态内容
- **Client Components**：`'use client'` 声明，用于交互（汉堡菜单、轮播、FAQ手风琴）

### 组件位置
- 全局复用组件 → `app/components/`
- 页面专用组件 → 放在页面文件旁边

---

## 开发规范

### TypeScript
- 严格模式已启用，禁止 `any`
- 使用 `interface` 定义对象类型

### Tailwind CSS
- 使用自定义颜色：`text-navy`, `bg-amber`
- 响应式断点：`md:`, `lg:` 前缀
- 避免内联复杂样式，使用 `@apply` 或组件化

### 路由
- 使用 Next.js `<Link>` 组件做内部链接
- 动态路由使用 `[slug]` 文件夹约定

### SEO
- 使用 Next.js Metadata API 配置元数据

### 必须遵守
- **构建验证**：每次重要改动后运行 `npm run build`，必须零错误通过
- **图片优化**：使用 `next/image`，配置 `alt` 和 `sizes`
- **字体优化**：使用 `next/font/google`

### 禁止事项
- 禁止 emoji（保留普通箭头符号 →）
- 禁止 "WA" 缩写，使用 "Winning Adventure Global" 或 "WAG"
- 禁止添加未经验证的依赖

### 代码质量
- 组件不超过 200 行，早拆分子组件
- 交互逻辑放在 Client Components 中

---

## 部署

### Vercel（推荐）

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 自动部署

或使用 Vercel CLI：

```bash
npm i -g vercel
vercel
```

### 验证部署

确保以下页面可访问：
- `/` - 首页
- `/services` - 服务页面
- `/about` - 关于页面
- `/resources` - 资源页面
- `/enquiry` - 询价页面

---

## 相关文档

- [CLAUDE.md](./CLAUDE.md) — 开发规范与架构
- [spec.md](./spec.md) — 项目转换规格书
