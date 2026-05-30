# GSC Request Indexing — browser-harness Sequential Workflow

## Overview

Sequential GSC URL inspection + request indexing via browser-harness. Each URL: 30s wait after submit, 60s wait after button click. Uses `BU_NAME=default` single Chrome session.

## Scripts

### gsc-seq.py (main script)
Location: `/tmp/gsc-seq.py`

```python
#!/usr/bin/env python3
"""
GSC Request Indexing — single URL, sequential, with explicit waits.
Wait 30s after URL submit, wait 60s after clicking Request Indexing.
"""
import sys, time, os
sys.path.insert(0, '/Users/mark/Projects/browser-harness/src')

os.environ['BU_NAME'] = 'default'

TARGET_URL = sys.argv[1] if len(sys.argv) > 1 else sys.exit("Usage: python gsc-seq.py <url>")

from browser_harness.helpers import *

GSC_BASE = "https://search.google.com/search-console?resource_id=sc-domain%3Awinningadventure.com.au"

print(f"Target: {TARGET_URL}")

# Step 1: Navigate to GSC
goto_url(GSC_BASE)
wait_for_load()
wait(2)

# Step 2: Focus input field
js('''
(function() {
  const input = document.querySelector('input[aria-label*="Inspect any URL"]');
  if (input) { input.focus(); }
})()
''')
wait(0.5)

# Step 3: Type URL and press Enter
type_text(TARGET_URL)
wait(0.5)
press_key('Enter')

print("URL submitted, waiting 30s for inspection to load...")
wait_for_load()
wait(30)

# Step 4: Click Request Indexing button
result = js('''
(function() {
  const buttons = document.querySelectorAll('button');
  for (const btn of buttons) {
    const text = btn.textContent.trim();
    if (text.includes('Request indexing')) {
      btn.click();
      return 'clicked: ' + text;
    }
  }
  const ariaBtn = document.querySelector('[aria-label*="Request indexing"]');
  if (ariaBtn) { ariaBtn.click(); return 'aria clicked'; }
  return 'NOT FOUND';
})()
''')
print(f"Button: {result}")

print("Waiting 60s after clicking Request Indexing...")
wait(60)

# Step 5: Check for confirmation text
text = js('document.body.innerText')
if 'Indexing requested' in text or 'Requested' in text:
    print("Indexing requested — confirmed!")
elif 'not found' in result.lower() or result == 'NOT FOUND':
    print("WARNING: Request Indexing button not found. Check page manually.")
else:
    print(f"Page text snippet: {text[:300]}")

print("Done.")
```

## Prerequisite: Ensure daemon is running

```bash
# Check if daemon is running
ls /tmp/bu-default.sock 2>/dev/null && echo "daemon running" || echo "start daemon"

# Start daemon if needed
BU_NAME=default /Users/mark/Projects/browser-harness/.venv/bin/python -m browser_harness.daemon &
sleep 3
```

## Sequential Execution (10 URLs)

```bash
for url in \
  "https://www.winningadventure.com.au/resources/neale-daniher-death" \
  "https://www.winningadventure.com.au/resources/kimi-antonelli" \
  "https://www.winningadventure.com.au/resources/tottenham-hotspur" \
  "https://www.winningadventure.com.au/resources/west-ham-united" \
  "https://www.winningadventure.com.au/resources/stateside-sports" \
  "https://www.winningadventure.com.au/resources/andrew-abdo" \
  "https://www.winningadventure.com.au/resources/tennis-australia" \
  "https://www.winningadventure.com.au/resources/spurs-vs-thunder" \
  "https://www.winningadventure.com.au/resources/liverpool-vs-brentford" \
  "https://www.winningadventure.com.au/resources/liverpool-brentford-standings"; do
  echo "=== $url ==="
  BU_NAME=default /Users/mark/Projects/browser-harness/.venv/bin/python /tmp/gsc-seq.py "$url"
  echo ""
done
```

## Key Timing Parameters

| Phase | Wait | Reason |
|-------|------|--------|
| After URL submit + Enter | 30s | GSC fetches indexing state from Google |
| After clicking "Request Indexing" | 60s | Google processes request, confirmation appears |
| Between URLs | 0s | Sequential, reuse same Chrome session |

## Output Interpretation

- `Indexing requested — confirmed!` → Success, Google received request
- `NOT FOUND` on button → GSC UI may have changed, check page manually
- Page text snippet (sidebar only) → Normal for some URLs, confirmation may not appear in extracted text

## Notes

- Uses `BU_NAME=default` — single Chrome session, not multiple tabs
- Parallel execution (multiple agents with same BU_NAME) causes CDP session conflicts
- If daemon not running: `FileNotFoundError: [Errno 2] No such file or directory` on socket
- GSC URL: `https://search.google.com/search-console?resource_id=sc-domain%3Awinningadventure.com.au`
- Button selector: `button` containing text "Request indexing" or `aria-label` containing "Request indexing"