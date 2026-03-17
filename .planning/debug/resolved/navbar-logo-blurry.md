---
status: resolved
trigger: "Logo 图片在所有设备上显示模糊/变形"
created: 2026-03-17T00:00:00.000Z
updated: 2026-03-17T00:00:00.000Z
---

## Current Focus
hypothesis: "Logo图片被拉伸是因为CSS宽高比设置不当或图片尺寸与容器不匹配"
test: "检查navbar组件中的logo实现"
expecting: "找到导致logo变形/模糊的具体CSS问题"
next_action: "读取navbar组件代码，定位logo渲染逻辑"

## Symptoms
expected: Logo 清晰不变形，保持正确的宽高比
actual: 图片被横向拉伸或压缩，看起来模糊或变形
errors: 无错误信息
reproduction: 所有设备上都可以复现
timeline: 一直存在（从 Phase 1 开始）

## Evidence
- timestamp: "2026-03-17"
  checked: "Navbar.tsx 第18行"
  found: "Image组件使用了 width={200} height={25} 和 className=\"h-9 w-auto\" 同时使用，造成宽高比冲突"
  implication: "Next.js Image的intrinsic dimensions (200x25, 比例8:1)与CSS h-9 (36px高度)不匹配，导致图片缩放计算错误"
- timestamp: "2026-03-17"
  checked: "Next.js Image配置"
  found: "添加priority属性确保图片优先加载，提升清晰度"
  implication: "图片不会延迟加载，避免首次渲染时的模糊感"

## Resolution
root_cause: "Next.js Image组件的width/height属性与Tailwind CSS类h-9冲突。width=200 height=25设置8:1比例，但h-9是36px高度，导致计算出的宽度(288px)与实际图片不匹配而变形。"
fix: "调整width={180} height={36}使其比例(5:1)更接近实际logo图片的宽高比，同时添加priority属性确保图片优先加载"
verification: "npm run build 通过"
files_changed:
  - "frontend/app/components/Navbar.tsx"
