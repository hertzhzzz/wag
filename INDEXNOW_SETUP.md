# IndexNow Setup Guide

## What is IndexNow?

IndexNow is a protocol that allows websites to instantly notify search engines (Bing, Yandex, Naver) about new or updated content. Google does NOT support IndexNow.

## Current Status

✅ API endpoint created at `/api/indexnow`
✅ Accepts POST requests with URL payload
❌ Requires API key for production use

## Setup Steps

### 1. Generate IndexNow API Key

Visit: https://www.indexnow.org/ (Bing Webmaster Tools)

Or generate your own key:
```bash
openssl rand -hex 32
```

### 2. Create Key File

The key file must be accessible at:
```
https://www.winningadventure.com.au/<KEY>.txt
```

Where `<KEY>` is your generated key.

### 3. Add Environment Variable

In Vercel dashboard, add:
```
INDEXNOW_API_KEY=your_generated_key
```

### 4. Verify Setup

```bash
# Test POST
curl -X POST https://www.winningadventure.com.au/api/indexnow \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.winningadventure.com.au/services"}'

# Test key verification
curl https://www.winningadventure.com.au/api/indexnow?key=YOUR_KEY
```

## Usage

The API can be called:
- When new blog posts are published
- When pages are significantly updated
- When new services are added

## Reference

- IndexNow Protocol: https://www.indexnow.org/
- Bing Webmaster: https://www.bing.com/webmasters
