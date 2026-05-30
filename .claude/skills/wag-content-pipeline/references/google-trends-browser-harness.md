# Google Trends — browser-harness (local Chrome CDP)

通过 browser-harness 连接本地 Chrome CDP，访问 Google Trends Australia 并提取上升趋势词。**无需云端，无 API 限制。**

**browser-harness binary:** `/Users/mark/Projects/browser-harness/.venv/bin/browser-harness`

## 完整抓取脚本

```python
import sys
sys.path.insert(0, '/Users/mark/Projects/browser-harness/src')

from browser_harness.helpers import *
import re

# Step 1: 重置 SPA 状态 — 必须先用 about:blank 再导航到 Google Trends
goto_url('about:blank')
wait(2)
goto_url('https://trends.google.com/trending?geo=AU&sort=search-volume')
wait(5)
js('window.scrollTo(0, 0)')
wait(2)

# Step 2: 点击 "Go to first page" 确保在第一页
js('''
(function() {
  const btns = document.querySelectorAll('button');
  for (const b of btns) {
    if (b.textContent.trim().includes('first page')) {
      b.disabled = false;
      b.click();
      return 'ok';
    }
  }
  return 'not found';
})()
''')
wait(4)  # SPA 导航需要等待

# Step 3: 设置 50 rows per page
js('''
(function() {
  const all = document.querySelectorAll('*');
  for (const el of all) {
    if (el.textContent.trim() === '50' && el.textContent.length < 5) {
      el.click();
    }
  }
})()
''')
wait(2)

# Step 4: 验证分页（应在第一页）
body = js('document.body.innerText')
lines = body.split('\n')
for i, l in enumerate(lines):
    if '1–' in l and 'of' in l:
        print(f'Pagination: {l}', file=sys.stderr)
        break

# 解析函数 — 使用 location_on 边界 + 距离检测
SKIP = [
    'Trends', 'Home', 'Explore', 'Trending now', 'Google Trends',
    'location_on', 'calendar_month', 'grid_3x3', 'ios_share', 'Export',
    'Search trends', 'Sort by', 'Updated', 'info', 'Trend breakdown',
    'Past 24 hours', 'Privacy', 'Terms', 'Send feedback', 'About',
    'help', 'language', 'Sort by title', 'Sort by search volume',
    'Sort by recency', 'By relevance', 'All categories', 'All trends',
    'Trending Now', 'arrow_upward', 'trending_up', 'Active', 'timelapse',
    'Search trends', 'Trending Now – Google Trends',
    'category', 'sort', 'search', 'Rows per page',
    'Go to first page', 'Go to previous page', 'Go to next page',
    'Go to last page', 'Help',
    'Australia', 'By search volume', 'Search volume', 'Started',
    'Sort by recency',
    # Related keywords (appear after +N more, not main trends)
    '+ 19 more', '+ 7 more', '+ 4 more', '+ 2 more', '+ 1 more',
    'big freeze 2026', 'knicks vs cavs', 'james harden', 'nba finals',
    'new york knicks', 'landry shamet', 'sorry day', 'melbourne cup',
    'ferrari', 'shane mcadam afl retirement', 'kokkinakis',
    'terence atmane', 'daria kasatkina', 'roland garros 2026', 'monfils',
    'gaël monfils', 'vivid drone show', 'drone show vivid 2026',
    'state of origin 2026', 'mitch moses', 'ethan strange',
    'ticketmaster', 'brad scott news', 'essendon', 'de minaur',
    'french open day one upsets', 'weather', 'power outage',
    'mitch moses', 'melbourne power outage',
    'btn',  # reconciliation week button artifact
]

def parse_page(body):
    lines = body.split('\n')

    # 找到 location_on 位置 — 这是 UI 元数据和真实趋势的分界标记
    loc_idx = None
    for i, line in enumerate(lines):
        if 'location_on' in line:
            loc_idx = i
            break

    trends = []
    current = {}
    for i, line in enumerate(lines):
        line = line.strip()
        if not line or line in SKIP:
            continue

        # Boundary check: UI 元数据出现在 location_on 附近，跳过
        if loc_idx is not None and i <= loc_idx + 2:
            continue

        # 流量值检测
        if re.match(r'^\d+K?\+$', line) or re.match(r'^\d+K$', line):
            if current.get('title'):
                current['traffic'] = line
                trends.append(current)
                current = {}

        # 涨幅值检测（无 + 前缀）
        elif re.match(r'^\+[\d,]+%$', line) or line == 'BREAKOUT':
            if current.get('title'):
                current['change'] = line

        # 标题候选检测 — 必须距离下一个流量值在 5 行以内
        elif len(line) > 3 and len(line) < 80 and not any(c.isdigit() for c in line):
            has_traffic_soon = False
            for j in range(i + 1, min(len(lines), i + 6)):
                if re.match(r'^\d+K?\+$', lines[j].strip()) or re.match(r'^\d+K$', lines[j].strip()):
                    has_traffic_soon = True
                    break
            if not has_traffic_soon:
                continue  # 相关词块里的词，距离上一个 traffic > 5 行，跳过

            if not current.get('title'):
                current = {'title': line}
            elif current.get('title') and not current.get('traffic'):
                related = current.get('related', [])
                if line not in SKIP:
                    related.append(line)
                current['related'] = related
            elif current.get('traffic'):
                current = {'title': line}

    if current.get('title') and not current.get('traffic'):
        trends.append(current)
    return trends

# Step 5: 抓取所有页面
all_trends = []
for page in range(1, 4):
    body = js('document.body.innerText')
    trends = parse_page(body)
    all_trends.extend(trends)
    print(f'Page {page}: +{len(trends)} trends', file=sys.stderr)

    if page < 3:
        clicked = js('''
        (function() {
          const spans = document.querySelectorAll('#trend-table > div > div > div > span');
          for (const span of spans) {
            const btn = span.querySelector('button');
            if (btn && btn.textContent.trim() === 'Go to next page') {
              btn.click();
              return 'ok';
            }
          }
          const nb = document.querySelector('[aria-label="Go to next page"], [aria-label="Next page"]');
          if (nb) { nb.click(); return 'aria ok'; }
          return 'done';
        })()
        ''')
        if 'done' in clicked:
            break
        wait(2)

# Step 6: 去重
seen = set()
deduped = []
for t in all_trends:
    if t.get('title') and t['title'] not in seen:
        seen.add(t['title'])
        deduped.append(t)

# Step 7: 过滤 1K+ 并排序
filtered = []
for t in deduped:
    traffic = t.get('traffic', '0')
    match = re.search(r'(\d+)', traffic)
    if match:
        val = int(match.group(1))
        if 'K' in traffic and val >= 1:
            filtered.append(t)

def traffic_sort(t):
    traffic = t.get('traffic', '0')
    match = re.search(r'(\d+)', traffic)
    return int(match.group(1)) if match else 0

filtered.sort(key=traffic_sort, reverse=True)

print(f"{'#':<3} {'Keyword':<50} {'Traffic':<8} {'Change':<10}")
print("-" * 75)
for i, t in enumerate(filtered[:50], 1):
    print(f"{i:<3} {t.get('title',''):<50} {t.get('traffic',''):<8} {t.get('change',''):<10}")
```

## 执行命令

```bash
BU_NAME=default /Users/mark/Projects/browser-harness/.venv/bin/python /path/to/script.py
```

## 关键修复点（对比旧版本）

### 问题 1：SPA Session 状态残留
- **旧：** 直接 `goto_url` 到 Google Trends，多次运行后停在最后一页（101-141 of 141）
- **新：** 先 `goto_url('about:blank')` 重置，再导航到目标 URL

### 问题 2：UI 元数据被误识别为趋势标题
- **旧：** `'Australia'` 等出现在 UI 导航区，被当成第一个趋势
- **新：** `location_on` 作为分界标记，`i <= loc_idx + 2` 的行全部跳过

### 问题 3：相关词块里的词被误识别为主趋势
- **旧：** `dean solomon`（20K+）被当成主趋势，实际它是 `brad scott` 的相关词
- **新：** 距离检测——标题行后 5 行内必须有流量值才算有效趋势

## 页面结构（693 行 innerText）

```
idx 0-37:   UI 元数据（nav bar, sort controls, etc.）
idx 38:     neale daniher         ← 第一个真实趋势
idx 39:     100K+
idx 40:     arrow_upward
idx 41:     1,000%
idx 42-50:  相关词块 (neale daniher death, big freeze 2026, + 19 more)
idx 53:     brad scott            ← 第二个主趋势
idx 54:     20K+
idx 62:     dean solomon          ← brad scott 的相关词（不是主趋势！）
idx 680:    1–50 of 141          ← 分页信息
```

## 已知问题

1. **Chrome 未启动：** 确保本地 Chrome 已运行，`BU_NAME=default` 指向正确的 CDP session
2. **等待时间不足：** SPA 导航后至少等 `wait(4)`，不然页面内容未渲染完成
3. **rows per page 设置失败：** 点击 "50" 选项后等 `wait(2)` 再继续