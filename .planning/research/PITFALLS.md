# Domain Pitfalls: Vercel Deployment & Mobile Navbar

**Domain:** WAG Website v1.1 Deployment
**Researched:** 2026-03-17
**Confidence:** MEDIUM-HIGH

---

## Executive Summary

v1.1 里程碑聚焦于将网站部署到 Vercel 并修复移动端导航栏问题。基于 v1.0 响应式改进的研究，本阶段需要关注两类陷阱：

1. **Vercel 部署陷阱**：自定义域名配置、SSL 证书、环境变量构建问题
2. **移动端导航栏粘性陷阱**：fixed 定位在移动浏览器的兼容性问题、触摸交互问题

---

## Critical Pitfalls

### Pitfall 1: 自定义域名 SSL 证书配置失败

**What goes wrong:**
部署完成后，使用自定义域名（如 winningadventure.com.au）访问网站时显示 SSL 证书警告或 "Too Many Redirects" 错误。Vercel 默认提供的 SSL 证书无法正确绑定到自定义域名。

**Why it happens:**
- 域名 DNS 记录未正确配置（A 记录或 CNAME 指向 Vercel）
- 首次添加域名时 SSL 证书处于 "Pending" 状态，需要时间传播
- 域名注册商和 Vercel 的 DNS 解析存在缓存延迟
- 同时配置了 A 记录和 CNAME 记录导致冲突

**Consequences:**
- 用户访问自定义域名时收到安全警告
- SEO 排名下降，搜索引擎标记不安全
- 无法启用 HSTS，影响用户体验

**Prevention:**
1. 使用 Vercel 提供的 DNS 配置指南，添加正确的 CNAME 或 A 记录
2. 等待 SSL 证书自动签发（通常 5 分钟至 24 小时）
3. 在域名注册商处将 TTL 设置为较低值（如 300 秒）加快传播
4. 使用 Vercel CLI 验证域名配置：`vercel domains verify <domain>`

**Detection:**
- Vercel Dashboard 的 Domains 面板显示证书状态为 "Pending" 或 "Error"
- 使用 `dig winningadventure.com.au` 检查 DNS 记录是否正确解析
- 浏览器访问显示 "Your connection is not private"

**Phase to address:**
v1.1 部署阶段 — 需要在 DNS 配置后等待证书签发

---

### Pitfall 2: 环境变量在 Vercel 构建时缺失

**What goes wrong:**
本地开发正常，生产构建失败。控制台显示 "process.env.XXX is undefined" 或 Supabase/Resend 连接失败。表单提交功能在生产环境完全失效。

**Why it happens:**
- 环境变量仅在本地 `.env.local` 中设置，未添加到 Vercel Project Settings
- 环境变量名称不匹配（如本地用 `NEXT_PUBLIC_` 前缀，生产环境未加）
- 构建时访问了客户端未暴露的服务器端环境变量

**Consequences:**
- 构建失败或运行时崩溃
- 关键功能（询价表单、Supabase 认证）不可用
- 需要重新部署，增加上线时间

**Prevention:**
1. 在 Vercel Dashboard → Settings → Environment Variables 中添加所有环境变量
2. 确保客户端需要的环境变量有 `NEXT_PUBLIC_` 前缀
3. 使用 `.env.example` 文件记录所有必需的环境变量
4. 在本地运行 `vercel env pull` 同步环境变量到本地
5. 部署前在 Vercel Preview 环境测试所有环境变量

**Detection:**
- Vercel Build 日志显示环境变量相关错误
- 浏览器控制台显示 "NEXT_PUBLIC_" 相关警告
- 特定功能（如表单）在生产环境报错，本地正常

**Phase to address:**
v1.1 部署阶段 — 部署前必须配置完整

---

### Pitfall 3: 移动端 fixed 定位在 iOS Safari 失效

**What goes wrong:**
移动端滚动时导航栏随页面滚动消失，用户无法在滚动后快速点击导航菜单。需要滚动回页面顶部才能看到导航栏。

**Why it happens:**
- iOS Safari 对 `position: fixed` 有特殊处理，当地址栏显示/隐藏时可能重新计算视口
- 某些情况下 fixed 元素会变为 relative 定位
- 页面内容滚动时 fixed 定位的参考框架可能发生偏移

**Consequences:**
- 用户无法随时访问导航，必须滚回顶部
- 移动端用户体验严重下降
- 违背了导航栏应始终可访问的设计原则

**Prevention:**
1. 使用 `position: sticky` 替代 `position: fixed` 作为主要方案：
   ```css
   position: sticky;
   top: 0;
   ```
2. 如必须使用 fixed，添加以下 CSS 属性：
   ```css
   position: fixed;
   top: 0;
   left: 0;
   right: 0;
   transform: translateZ(0);  /* 强制 GPU 渲染 */
   -webkit-backface-visibility: hidden;
   ```
3. 为 body 添加 `-webkit-overflow-scrolling: touch` 改善滚动性能
4. 使用 JavaScript 监听 scroll 事件作为 fallback：
   ```javascript
   window.addEventListener('scroll', () => {
     if (window.scrollY > 50) {
       document.body.classList.add('scrolled');
     }
   });
   ```

**Detection:**
- 在真实 iOS 设备（而非模拟器）上测试
- 滚动页面后观察导航栏是否保持固定
- 反复滚动多次，检查是否稳定

**Phase to address:**
v1.1 修复阶段 — 用户已报告此问题

---

### Pitfall 4: 移动端 hamburger 菜单按钮点击区域不足

**What goes wrong:**
用户点击 hamburger 菜单按钮时需要精确点击图标区域，多次尝试才能打开菜单。手指粗大的用户尤其容易误触。

**Why it happens:**
- 按钮仅设置了图标大小，未扩大点击热区
- iOS Safari 不会放大 touch 目标，即使视觉上看起来足够大
- 按钮周围的元素可能抢占点击事件

**Consequences:**
- 用户无法顺利打开导航菜单
- 多次点击导致菜单反复打开/关闭
- 用户体验沮丧，可能直接离开网站

**Prevention:**
1. 确保按钮最小尺寸为 44x44px（符合 Apple HIG）：
   ```jsx
   <button className="min-h-11 min-w-11 ...">
   ```
2. 使用 `padding` 扩大点击区域：
   ```jsx
   className="p-2 min-h-11 min-w-11"
   ```
3. 添加触摸反馈（active 状态）：
   ```css
   .mobile-menu-btn:active {
     background-color: rgba(0,0,0,0.1);
   }
   ```
4. 确保按钮 `z-index` 高于页面其他内容

**Current Status (WAG):**
Navbar.tsx 第 60 行已设置 `min-h-11 min-w-11`，符合标准。

**Phase to address:**
v1.1 验证阶段 — 需在真实设备测试确认

---

### Pitfall 5: Vercel 构建缓存导致样式未更新

**What goes wrong:**
修改 Tailwind CSS 类名或样式后，Vercel 部署的页面仍显示旧样式。清除浏览器缓存后问题依旧。

**Why it happens:**
- Vercel 构建缓存保留了旧的 CSS 文件
- Next.js 的 `_next/static` 目录被缓存
- 浏览器缓存了带有旧哈希的 CSS 文件

**Consequences:**
- 用户看不到最新的 UI 更改
- 误以为是代码问题，反复检查
- 延迟上线时间

**Prevention:**
1. 触发重新构建：
   - 提交新的 commit
   - 使用 `vercel --force` 强制重新部署
2. 在 next.config.js 中配置正确的缓存策略：
   ```javascript
   module.exports = {
     reactStrictMode: true,
     trailingSlash: true,
   }
   ```
3. 使用 Vercel 的 "Clear Cache" 按钮（在 Deployment 设置中）
4. 确保构建命令包含清理步骤：`next build`（通常已包含）

**Detection:**
- 同一代码在本地正常，生产环境异常
- 多次刷新后问题依旧
- 部署历史显示使用了缓存

**Phase to address:**
v1.1 部署阶段 — 如遇到此问题，使用 --force 重新部署

---

### Pitfall 6: 移动端滚动时触发了意外的触摸手势

**What goes wrong:**
用户在页面滚动时意外触发了导航菜单的打开/关闭操作。滑动屏幕时手指触发了按钮的点击事件。

**Why it happens:**
- 触摸事件和点击事件在移动端同时触发
- 滚动过程中的意外触摸被误判为点击
- 未使用 `touchstart` 事件防抖

**Consequences:**
- 用户在滚动时菜单突然打开
- 用户体验困惑和沮丧

**Prevention:**
1. 使用 `onPointerDown` 而非 `onClick` 捕获更精确的交互
2. 检测滚动状态：
   ```javascript
   let isScrolling = false;
   window.addEventListener('scroll', () => { isScrolling = true; });
   window.addEventListener('scrollend', () => {
     setTimeout(() => isScrolling = false, 100);
   });
   ```
3. 或者在按钮上添加 CSS 防止意外触发：
   ```css
   button {
     touch-action: manipulation;
   }
   ```

**Current Status (WAG):**
Navbar.tsx 使用 `onClick`，标准实现。如遇问题可考虑增强。

**Phase to address:**
v1.1 验证阶段 — 需在真实移动设备测试

---

## Moderate Pitfalls

### Pitfall 7: Vercel 默认域名与自定义域名冲突

**What goes wrong:**
同时通过 `xxx.vercel.app` 和 `winningadventure.com.au` 访问网站，搜索引擎可能将两者视为重复内容，导致 SEO 排名下降。

**Prevention:**
1. 在 next.config.js 中配置域名重定向：
   ```javascript
   async redirects() {
     return [
       {
         source: '/:path*',
         destination: 'https://winningadventure.com.au/:path*',
         permanent: true, // 301 重定向
       },
     ]
   }
   ```
2. 在 Vercel Dashboard 设置 default 域名

### Pitfall 8: 构建日志未保存导致问题排查困难

**What goes wrong:**
部署失败但未保存构建日志，无法定位问题根因。

**Prevention:**
- 在 Vercel Dashboard 保留构建历史
- 本地运行 `vercel build` 复现问题

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| 自定义域名配置 | SSL 证书 Pending | 提前配置 DNS，耐心等待传播 |
| 环境变量 | 缺失导致构建失败 | 部署前在 Preview 环境测试 |
| 移动端导航栏 | fixed 定位 iOS 失效 | 改用 sticky 或添加 transform |
| 表单功能 | 生产环境连接失败 | 验证所有环境变量正确配置 |

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| SSL 证书失败 | LOW | 检查 DNS 配置，等待 24 小时，或使用 Vercel DNS |
| 环境变量缺失 | LOW | 添加到 Vercel Settings，重新部署 |
| iOS fixed 失效 | MEDIUM | 修改 CSS，添加 transform 或改用 sticky |
| 构建缓存 | LOW | 使用 --force 重新部署 |

---

## Pre-Deployment Checklist

- [ ] 所有环境变量已添加到 Vercel Settings
- [ ] 自定义域名 DNS 记录已配置
- [ ] SSL 证书状态显示 "Ready"（非 Pending）
- [ ] 在 Vercel Preview 环境测试所有页面
- [ ] 询价表单在生产环境可正常提交
- [ ] 移动端导航栏在 iOS 设备上测试通过
- [ ] 运行 `npm run build` 本地通过
- [ ] 运行 `npm run lint` 无错误

---

## Sources

- [Vercel Domains Documentation](https://vercel.com/docs/domains)
- [Vercel SSL Certificate Troubleshooting](https://vercel.com/docs/domains/troubleshooting)
- [Next.js Deployment Documentation](https://nextjs.org/docs/app/building-your-application/deploying)
- [iOS Safari position:fixed Issues (Stack Overflow)](https://stackoverflow.com/questions/41540001/ios-safari-position-fixed-bugs)
- [MDN: position sticky](https://developer.mozilla.org/en-US/docs/Web/CSS/position)

---

*Pitfalls research for: WAG Website v1.1 Deployment*
*Researched: 2026-03-17*
