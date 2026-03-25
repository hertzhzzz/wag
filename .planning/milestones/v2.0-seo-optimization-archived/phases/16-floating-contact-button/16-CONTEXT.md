# Phase 16: Floating Contact Button - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

在所有页面右下角显示悬浮联系按钮（fixed position, 20px from edges），点击弹出联系表单 Modal。全站可见，作为持续的行动号召入口。

</domain>

<decisions>
## Implementation Decisions

### Button Design
- **颜色:** Navy (#0F2D5E) 主体色
- **装饰:** 脉冲圆环动画（pulse ring effect）+ 邮件图标 + "Contact Us" 文字
- **差异化:** 与竞品蓝色 (#1d4ed8) 区分，建立品牌识别

### Button Position
- **固定位置:** bottom-right, 20px from edges
- **移动端:** 保持相同位置，但适当缩小尺寸

### Modal Design
- **动画:** Fade in + Scale up（从 95% 缩放到 100%）
- **关闭机制:** ESC 键 + overlay 点击关闭
- **背景:** Navy/60 半透明遮罩 + backdrop-blur

### Form Fields
- **字段:** Email + Message（去掉 Name，减少填写门槛）
- **按钮文案:** "Send Message"
- **提交逻辑:** POST 到 `/api/enquiry`（复用现有 API）

### Integration
- **集成位置:** layout.tsx（直接添加，避免过度封装）
- **z-index:** 9999（低于 Navbar z-100，高于页面内容）

### Animation Details
- **脉冲动画:** 圆环 opacity 在 0.5-1.0 之间循环，2s 周期
- **悬停效果:** 按钮 scale(1.05) + 阴影加深
- **Modal 动画:** 200ms fade-in + zoom-in-95

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Scope
- `.planning/ROADMAP.md` § Phase 16 — Floating Contact Button 任务定义
- `.planning/REQUIREMENTS.md` § SEO-02 — Floating Contact Button 需求

### Existing Components
- `app/components/DirectoryAccessModal.tsx` — 现有 Modal 模式参考（动画、结构）
- `app/layout.tsx` — 集成位置（已是 'use client'）
- `.planning/research/AGENT4-FLOATING-BUTTON.md` — 竞品浮动按钮分析

### Brand Design System
- `app/components/Navbar.tsx` — z-index 参考（100）
- Tailwind tokens: `navy`, `amber` 颜色已在 tailwind.config.ts 定义

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `DirectoryAccessModal.tsx` — Modal overlay + form 模式可参考
- `lucide-react` icons — 使用 `Mail` 或 `MessageSquare` 图标
- Tailwind design tokens: `navy`, `amber`

### Established Patterns
- Modal 结构: `fixed inset-0 z-[200] flex items-center justify-center`
- 动画: `animate-in fade-in zoom-in-95 duration-200`
- ESC 关闭: `useEffect` 监听 `keydown` 事件

### Integration Points
- `app/layout.tsx` — 添加 FloatingContactButton 组件
- `/api/enquiry` — 表单提交 API（已存在）

</code_context>

<specifics>
## Specific Ideas

- 脉冲圆环动画让按钮更醒目，参考市面上常见的悬浮联系按钮
- Email + Message 组合比完整表单门槛更低
- Navy 品牌色与竞品蓝色形成差异

</specifics>

<deferred>
## Deferred Ideas

- 滚动时隐藏按钮（用户向下滚动一段距离后消失，向上滚动时重新出现）— 未来优化
- 追踪悬浮按钮点击率（GA event）— 未来 SEO Phase

</deferred>

---

*Phase: 16-floating-contact-button*
*Context gathered: 2026-03-20*
