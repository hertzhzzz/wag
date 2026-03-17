# Winning Adventure Global — Next.js 转换规格书

## 目标
将 /Users/mark/.openclaw/workspace/wa-global-designs/pages/ 中的5个HTML原型页面，
转换为生产就绪的 Next.js 14 App Router 项目。

## 技术栈
- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- Google Fonts: IBM Plex Sans + IBM Plex Serif

## 设计规范（严格遵守，不得改动）
- 主色：Navy #0F2D5E
- 强调色：Amber #F59E0B
- 字体：IBM Plex Sans（正文）+ IBM Plex Serif（标题）
- 风格：与原型HTML完全一致，像素级还原

## 页面路由映射
- final-page-v1.html  →  app/page.tsx (首页)
- services.html       →  app/services/page.tsx
- about.html          →  app/about/page.tsx
- resources.html      →  app/resources/page.tsx
- enquiry.html        →  app/enquiry/page.tsx

## 组件拆分（最小化）
- components/Navbar.tsx   — 所有页面共用导航栏（含移动端汉堡菜单）
- components/Footer.tsx   — 所有页面共用页脚
- components/CTABand.tsx  — 复用CTA区块
- 其余内容直接写在各页面文件中，不过度拆分

## 验收标准（PASS/FAIL）
- npm run build 零错误 ✅
- 5个页面均可访问，无404 ✅
- 所有内部链接正常跳转 ✅
- TypeScript 无类型错误 ✅
- 视觉效果与原型HTML一致 ✅

## 参照物
原型HTML路径：/Users/mark/.openclaw/workspace/wa-global-designs/pages/
- final-page-v1.html（主页，最重要）
- services.html / about.html / resources.html / enquiry.html

## 注意事项
1. CSS动画（数字滚动、fade-in）用 Tailwind + useEffect 实现
2. 移动端汉堡菜单需实现（useState 控制展开/收起）
3. 图片用 next/image + 占位符，不需要真实图片
4. 纯静态展示，无需后端/API
5. 完成后必须运行 npm run build 确认通过再汇报
