<claude-mem-context>
# Memory Context

# [frontend] recent context, 2026-06-15 12:59pm GMT+9:30

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 100 obs (24,499t read) | 4,373,364t work | 99% savings

### May 6, 2026
676 12:52p ✅ Brisbane location added to sitemap
684 12:56p 🟣 Team task created for uncrawled pages fix
686 " 🔵 Schema implementation pattern confirmed across three page types
689 12:57p 🔵 Case studies are thin content: 700-800 words vs 1500+ target
690 12:58p 🔵 E-E-A-T author mismatch: PersonSchema says Andy Liu, articles say Mark He
696 " 🟣 Installing avoid-ai-writing skill for natural content
698 1:03p ✅ Case study frontmatter additions confirmed
697 1:07p 🟣 avoid-ai-writing skill installed globally
699 1:10p ✅ Case study frontmatter complete, content expansion underway
700 1:12p 🔵 WAG SEO task inventory shows 17 active tasks
704 " 🟣 Content expansion subagent spawned for 19 case study files
701 " 🔵 Case study content expansion progress tracked
708 " 🟣 WAG Case Studies Expanded with Long-Term Impact and Why This Matters Sections
702 1:13p ✅ Content-agent nudged with priority order for case study expansion
703 " 🔵 Idle state vs task completion distinction
705 1:14p ✅ Case study expansion status and pending verification
706 " ✅ Content expansion scaled to 3 parallel subagents
707 1:18p ✅ All 20 case studies modified, build in progress
709 1:19p ✅ Build passed successfully with all case study pages
711 " 🔵 Complete LED high-bay case study discovered with specification verification approach
710 " ✅ WAG SEO fix session status snapshot
712 " ✅ Both agents nudged with specific file paths
717 1:20p 🟣 Furniture/Homewares case study added to WAG frontend
713 " 🔵 All WAG team agents confirmed running
714 1:21p ✅ Content expansion progressing rapidly
716 " 🔵 Content refinement in progress with AI-writing removal
715 " ✅ 7 of 20 case studies now exceed 1500-word target
720 " ✅ 5 frontend tasks completed by frontend-agent
718 1:22p 🔵 Case study content review in progress
719 " 🔵 All 13 case study files below 1500-word target
721 1:23p 🟣 Content expansion project launched for all 13 case studies
722 1:24p ✅ Build passed after all frontend fixes
723 " ✅ Major task milestone: 9 of 10 tasks completed
### May 19, 2026
1457 4:50p 🔵 CSP blocks ahrefs analytics on winningadventure.com.au
1459 " 🔵 Ahrefs analytics script loaded in Next.js layout
1460 " 🔵 Ahrefs script tag location confirmed in layout.tsx
1461 " 🔵 CSP header configuration found in next.config.js
S1440 Fix CSP blocking Ahrefs analytics + investigate broken hero/cover images on resources and blog pages (May 19 at 4:50 PM)
S1441 Fix CSP blocking Ahrefs analytics + investigate broken hero/cover images on resources and blog pages (May 19 at 4:51 PM)
S1442 Fix CSP blocking ahrefs analytics and broken cover images on winningadventure.com.au (May 19 at 4:53 PM)
S1447 Fix CSP blocking ahrefs analytics and broken hero images on winningadventure.com.au/resources (May 19 at 4:53 PM)
S1449 Fix CSP and hero/cover image display issues (May 19 at 4:55 PM)
S1450 Migrate hero video from HEVC to H.264 for cross-browser compatibility (May 19 at 4:59 PM)
1468 5:08p 🔵 WAG design system loaded from impeccable skill
1469 " 🔵 Hero component uses mobile-first image + desktop video strategy
1470 " 🔵 HowItWorks uses IntersectionObserver for scroll-triggered stagger animations
1471 " 🔵 BlogPreview reads MDX content dynamically from content/blog directory
1462 5:12p 🔵 OAuth callback endpoint active on localhost:63403
1463 " 🟣 Hero video migrated to Cloudflare R2 storage
1464 " ✅ Old video URLs found in three additional pages
1465 5:14p ✅ Hero video URL updated across all page templates
1466 " 🔵 Video migration build verification passed
S1454 Fix build errors and add hero entrance animations to WAG frontend (May 19 at 5:14 PM)
1472 5:21p ✅ Hero video source changed from R2 Cloudflare URL to local file path
1473 " 🟣 Hero entrance animations added via CSS keyframes
1474 " 🟣 Hero component integrated with CSS animation classes
1475 " 🟣 Headline spans wired to animation classes
1485 5:22p 🔴 Next.js module resolution path corrected for getArticles.ts
1483 5:35p 🔴 CSS syntax error with cubic-bezier in Hero.css
1484 5:36p 🔴 Fixed invalid CSS cubic-bezier declaration in Hero.css
1487 5:41p 🟣 Hero entrance animations migrated to globals.css and build passes
1488 " 🔴 Animation classes missing from Hero.tsx JSX elements
S1457 Services page hero background change — video to image, text width constrained; now searching for OG image to use as hero background (May 19 at 5:41 PM)
1489 5:42p 🔵 grep confirms hero animation classes not applied in Hero.tsx
1490 " 🟣 Hero animation classNames applied to Hero.tsx elements
1491 " 🔵 grep shows Edit didn't persist to file
1492 " 🟣 Hero buttons animation classes applied
1495 " ✅ Hero section background switching from video to image
1496 " ✅ Services hero simplified: video removed, text width constrained
S1456 Add hero entrance animations with CSS keyframes and deploy to Vercel (May 19 at 5:42 PM)
1493 5:43p 🟣 Secondary CTA animation class applied - only hero-trust remaining
1494 " 🟣 All hero animation classes applied - hero entrance animations complete
1497 " 🟣 Animation replay on every page visit
1498 " 🟣 Animation replay via client-side mount detection
S1455 Change services page hero background from video to static image; constrain title/subtitle width to occupy less space (May 19 at 5:43 PM)
1500 5:44p 🔵 Hero animation CSS missing from globals.css
S1460 Add hero entrance animations with replay-on-visit behavior (May 19 at 5:44 PM)
1499 5:46p ✅ Services hero now uses og-image.jpg instead of hero-image.webp
1501 5:48p 🟣 Hero animation CSS definitions added to globals.css
S1458 Change services page hero: video → image, constrain title/subtitle width, use OG image as background (May 19 at 5:48 PM)
S1461 Services hero — deployed and live (May 19 at 5:49 PM)
1502 5:50p ✅ Services hero section height reduced
S1462 Categorize all uncategorized blog articles and generate cover images (May 19 at 5:50 PM)
S1459 Services hero height reduction — final state (May 19 at 5:50 PM)
1507 5:54p ✅ Vercel deployment initiated for WAG frontend
1509 " ✅ Vercel deployment triggered via git push
1513 " ✅ WAG frontend deployed to Vercel production via vercel --prod
1503 " 🟣 Article categorization workflow initiated
1505 " 🔵 Accurate article inventory: 48 need tags, 39 have tags
1504 5:55p 🔵 43 articles lack tags/categories
1506 5:57p 🔵 Subagent dispatched for article categorization audit
S1463 Categorize all uncategorized blog articles and generate cover images (May 19 at 5:57 PM)
S1464 Vercel production deployment — confirmation pending (May 19 at 5:58 PM)
1508 5:59p 🔵 baoyu-article-illustrator skill configured
1510 " 🟣 Article categorization and cover image generation workflow initiated
1515 " 🔵 Homepage architecture scanned for performance investigation
S1466 Generate cover images for blog posts - creating image prompts and running AI image generation (May 19 at 5:59 PM)
1511 6:55p 🟣 Batch tagging workflow initiated for 59 MDX articles
1516 " 🔵 Homepage image assets audited for performance
1512 " 🔵 baoyu-imagine CLI image generation providers and syntax discovered
1514 6:56p 🟣 Batch cover image generation workflow launched for 48 blog articles
S1475 Accelerate homepage loading speed (May 19 at 6:57 PM)
S1465 Categorize all uncategorized WAG blog articles and generate cover images (May 19 at 6:57 PM)
S1468 Standardize blog article tags and generate cover images for WAG website articles (May 19 at 7:05 PM)
S1467 Accelerate homepage loading speed (May 19 at 7:05 PM)
S1469 Convert blog article tags from inline YAML array format to multi-line YAML list format for consistency (May 19 at 7:07 PM)
S1470 Fix YAML syntax errors in blog articles blocking Next.js build (May 19 at 7:07 PM)
S1471 Fix YAML syntax errors in blog articles blocking Next.js build and complete tag standardization (May 19 at 7:08 PM)
S1472 Fix YAML syntax errors and complete blog article tag standardization with cover images (May 19 at 7:09 PM)
S1477 Accelerate homepage loading speed + fix deployment build failure (May 19 at 7:12 PM)
S1473 Fix YAML syntax errors and complete blog tag standardization for WAG frontend (May 19 at 7:12 PM)
S1476 Fix YAML syntax errors, add blog article tags, generate cover images, and document learnings in CLAUDE.md (May 19 at 7:13 PM)
S1480 Add MDX tags format warning to CLAUDE.md Known Gotchas section (May 19 at 7:14 PM)
S1478 Accelerate homepage loading + optimize hero video poster (May 19 at 7:15 PM)
S1474 Fix YAML syntax errors in blog articles and complete tag standardization (May 19 at 7:15 PM)
S1481 Fix YAML syntax errors, add blog article tags, generate cover images, and document learnings in CLAUDE.md (May 19 at 7:15 PM)
S1484 Optimize homepage hero image for faster LCP (Largest Contentful Paint) (May 19 at 7:15 PM)
S1482 Blog tag standardization and YAML error fix (May 19 at 7:16 PM)
S1479 Homepage performance optimization (May 19 at 7:16 PM)
S1486 Optimize homepage hero image for faster LCP (May 19 at 7:17 PM)
S1483 Blog tag standardization + YAML error fix + Vercel deployment (May 19 at 7:17 PM)
S1485 Blog tag standardization + YAML fix + Vercel deploy + git commit (May 19 at 7:19 PM)
S1487 Optimize homepage LCP via video poster WebP conversion (May 19 at 7:20 PM)
1517 7:21p 🔵 Technical SEO audit completed — score 82/100
1518 " 🔵 Duplicate title tag on /resources page
1519 " 🔵 ByteDance Bytespider not in robots.txt
1520 " 🔵 og-image.jpg 3.1MB — performance issue for social sharing
S1489 Homepage LCP optimization via WebP image conversion (May 19 at 7:21 PM)
S1491 Homepage and services page LCP optimization via WebP (May 19 at 7:21 PM)
S1488 Homepage LCP optimization via WebP image conversion (May 19 at 7:21 PM)
S1492 Technical SEO audit completed, user wants to execute all fixes in one batch (May 19 at 7:23 PM)
S1490 Homepage LCP optimization via WebP image conversion (May 19 at 7:23 PM)
1521 7:23p 🔄 Homepage LCP optimization via WebP
S1493 Homepage and services page LCP optimization (May 19 at 7:24 PM)
S1494 Homepage LCP optimization via WebP image conversion (May 19 at 7:25 PM)
S1495 优化首页加载速度 - WebP 图片转换 + LCP 预加载优化 (May 19 at 7:25 PM)
S1496 加速加载 - 图片/WebP + 视频预加载优化 (May 19 at 7:29 PM)
1522 7:30p ✅ resources/page.tsx OG title fixed, but page title still duplicated
1523 7:31p 🔵 Duplicate title still present — edit reverted, page metadata title untouched
1524 " ✅ resources/page.tsx page-level title fixed — duplicate eliminated
1525 7:33p ✅ resources/page.tsx title fixed — robots.txt Bytespider added — og-image.jpg 3.1MB confirmed
1526 " ✅ og-image.jpg converted to WebP — 3.1MB → 120KB
1527 7:34p 🔵 layout.tsx edit failing — openGraph.images object format not matched by replace_all
1530 " 🔵 Vercel CLI outdated, project linked, git shows uncommitted changes
1528 7:36p 🔵 openGraph.images object format prevents replace_all from matching — edit keeps succeeding on no-op
1529 " 🟣 Video preload request
1532 8:02p ✅ SEO fixes committed — 3 files, ready for deployment
1533 " ✅ SEO fixes deployed to production — commit 14ca2b0d live
1531 " 🟣 Video preload added to layout
S1497 Fix openGraph images in layout.tsx - change og-image.jpg to og-image.webp (May 19 at 8:06 PM)
**Investigated**: Verified twitter:image now correctly serves og-image.webp (120KB) in live production. Previous edit only fixed twitter.images array but not the openGraph.images object.

**Learned**: openGraph.images uses object format `{ url, width, height, alt }` vs twitter.images uses array `['/path']`. Need to target the object property specifically.

**Completed**: Committed 14ca2b0d to master. Production URL verified working.

**Next Steps**: Fix openGraph.images in layout.tsx — change `{ url: '/og-image.jpg'` → `{ url: '/og-image.webp'`. Then commit, deploy, verify og:image meta tag serves WebP, delete og-image.jpg.


Access 4373k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>