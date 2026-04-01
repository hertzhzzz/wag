# WAG Content Engine Project

## Project Overview
WAG (Winning Adventure Global) content generation engine with self-evolution for 4 channels: LinkedIn, X/Twitter, Facebook, SEO Blog.

## Current Status
- Design complete, implementation pending
- Progress saved to: wag-content-engine-v3-progress.md

## Key Decisions
- Daily feedback loop (publish → collect data → update rules → optimize)
- Chrome CDP + GSC API for data collection
- baoyu-skills REGISTERED in settings.json (github: jimliu/baoyu-skills)
- baoyu-* symlinks DELETED from ~/.claude/skills/

## Next Actions
1. [DONE] 10-subagent 分析完成 → WAG-CONTENT-HUB-ARCHITECTURE.md
2. 创建 wag-content-hub 主入口 SKILL.md
3. 创建 x-post skill
4. 创建 wag-analytics-collector skill
5. 测试 GSC API

## File Location
All content-related work: /Users/mark/Projects/wag/.claude/content/
