# Google Search Console URL Inspection Script

使用 GSC Inspect 批量提交 URL，加速 Google 抓取和索引（通常 1-3 天 → 几小时）。

```bash
# 创建 URL 列表文件
echo -e "https://www.winningadventure.com.au/resources/slug-1\nhttps://www.winningadventure.com.au/resources/slug-2\nhttps://www.winningadventure.com.au/resources/slug-3" > /tmp/wag-gsc-urls.txt

# 批量 Inspect（每个 URL 间隔 2 秒）
python3 ~/.claude/skills/seo/scripts/gsc_inspect.py --batch /tmp/wag-gsc-urls.txt --delay 2 --json
```

**⚠️ 重要：** 提交后查看 `verdict` 字段：
- `NEUTRAL` = Google 尚未抓取，耐心等待（1-24 小时）
- `PASS` = 页面正常，可索引
- `FAIL` = 有问题，需要修复后重新提交

**Indexing API 限制说明：**
- service account (`wag-439@...`) 无法直接调 Indexing API，需要 OAuth 用户授权
- 当前配置（service account）仅支持：PageSpeed Insights、CrUX、GSC 查询、URL Inspection
- Indexing API（`indexing_notify.py --action URL_UPDATED`）需 OAuth token，每次需浏览器确认
- sitemap 提交是自动发现机制，Google 会通过 sitemap 抓取所有新 URL

**无需推送的情况：**
- sitemap.xml 已包含新文章 URL，Google 会自动抓取
- 构建 + git push 后等待 1-3 天 Google 自然发现
- 手动提交可加速，但非必须
