---
status: investigating
trigger: "SEO文章未被Google收录 - site:winningadventure.com.au 搜索完全无结果"
created: 2026-03-23T00:00:00+08:00
updated: 2026-03-23T07:00:00+08:00
---

## Current Focus
hypothesis: "site: 查询不带 www 的根域名，但实际 Google 索引的是 www 子域名。307 临时重定向导致 Google 没有将非www版本作为canonical处理。此外 2个 redirect 失败页面可能指向了有问题的 URL。"
test: "用 site:www.winningadventure.com.au 确认是否有结果；检查 GSC 中失败的 2个 redirect URL"
expecting: "找到根域名 vs www 子域名的索引差异，以及 redirect 失败的具体页面"
next_action: "需要确认 site:www.winningadventure.com.au 搜索结果，以及那 2个 redirect 失败的具体 URL"

## Symptoms
expected: "所有 /resources 文章应被 Google 收录"
actual: "site:winningadventure.com.au 搜索完全无结果（但 GSC 显示 8 pages 已索引）"
errors: "GSC Coverage: 2 pages 'Page with redirect' (Failed), 7 pages 'Discovered - currently not indexed'"
reproduction: "在 Google 搜索 site:winningadventure.com.au"
started: "域名注册 < 3个月，GSC 两个版本均已验证"
tried: "提交sitemap到GSC + 在GSC请求索引 + 使用Indexing API"

## Eliminated
- **robots.txt 问题**: robots.txt 正确，允许所有爬虫，sitemap 指向正确
- **sitemap.xml 问题**: 线上 sitemap.xml 包含全部 10 篇文章 URL，格式正确
- **文章页面 meta robots 问题**: 文章页面有 `<meta name="robots" content="index, follow"/>`
- **canonical 标签问题**: 所有 URL 在代码中硬编码为 www.winningadventure.com.au，canonical 正确
- **x-robots-tag HTTP 头问题**: 未发现阻止索引的 HTTP 头
- **public/sitemap.xml 冲突**: Next.js App Router 动态 sitemap 正常工作
- **DNS 配置问题**: DNS 正确解析到 Vercel（216.198.79.1）

## Evidence
- timestamp: 2026-03-23T00:10:00+08:00
  checked: "/public/robots.txt"
  found: "User-agent: * / Allow: / / Sitemap: https://www.winningadventure.com.au/sitemap.xml"
  implication: "robots.txt 配置正确，不阻止爬虫"

- timestamp: 2026-03-23T00:15:00+08:00
  checked: "线上 sitemap.xml"
  found: "包含 15 个 URL：5 个主页面 + 10 篇文章"
  implication: "sitemap 完整，10 篇文章全部在列"

- timestamp: 2026-03-23T00:20:00+08:00
  checked: "app/sitemap.ts"
  found: "动态从 content/blog 读取所有 .mdx 文件生成 sitemap，逻辑正确"
  implication: "sitemap 生成机制正确，新文章会自动包含"

- timestamp: 2026-03-23T00:25:00+08:00
  checked: "文章页面 HTML 源码 (china-factory-tour-guide)"
  found: "<meta name=\"robots\" content=\"index, follow\"/> 和 <link rel=\"canonical\" href=\"https://www.winningadventure.com.au/resources/china-factory-tour-guide\"/>"
  implication: "文章页面 meta 标签正确，不阻止索引"

- timestamp: 2026-03-23T00:35:00+08:00
  checked: "HTTP 响应头"
  found: "无 x-robots-tag，HTTP 200，Vercel 正常服务"
  implication: "服务器配置无阻止爬虫的响应头"

- timestamp: 2026-03-23T06:44:00+08:00
  checked: "non-www → www 重定向 (curl -sI https://winningadventure.com.au/)"
  found: "HTTP 307 Temporary Redirect → location: https://www.winningadventure.com.au/"
  implication: "Vercel 默认使用 307 而非 301，Google 可能将 non-www 和 www 视为不同页面，影响索引合并"

- timestamp: 2026-03-23T06:45:00+08:00
  checked: "所有代码中的 URL 引用"
  found: "所有页面 canonical、OG URL、sitemap baseUrl 均使用 www.winningadventure.com.au"
  implication: "无内部链接指向 non-www，不存在自引用 redirect 问题"

- timestamp: 2026-03-23T06:50:00+08:00
  checked: "DNS 配置 (dig/nslookup)"
  found: "winningadventure.com.au → 216.198.79.1 (Vercel)，www CNAME → vercel-dns-017.com"
  implication: "DNS 配置正确，域名正确指向 Vercel"

## Resolution
root_cause:
fix:
verification:
files_changed: []
