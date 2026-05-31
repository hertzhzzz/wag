#!/usr/bin/env python3
"""Google Indexing API - Batch submit all 58 NEUTRAL articles for re-indexing."""
import json, sys, time
from pathlib import Path

URLS_FILE = "/tmp/wag-gsc-final-58.txt"
SCOPES = ["https://www.googleapis.com/auth/indexing"]
ENDPOINT = "https://indexing.googleapis.com/v3/urlNotifications:publish"

def get_urls():
    with open(URLS_FILE) as f:
        return [line.strip() for line in f if line.strip()]

def submit_url(url, access_token):
    import urllib.request, urllib.error
    payload = json.dumps({"url": url, "type": "URL_UPDATED"}).encode("utf-8")
    req = urllib.request.Request(
        ENDPOINT, data=payload,
        headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read()), None
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        return None, f"HTTP {e.code}: {body}"
    except Exception as e:
        return None, str(e)

def main():
    urls = get_urls()
    print(f"URLs to submit: {len(urls)}")
    
    # Get credentials
    try:
        import google.auth
        from google.oauth2 import service_account
        from google.auth.transport import requests as google_requests
        creds = service_account.Credentials.from_service_account_file(
            str(Path.home() / ".claude" / "gsc-service-account.json"),
            scopes=SCOPES
        )
        creds.refresh(google_requests.Request())
        access_token = creds.token
        print("[OK] Access token obtained")
    except Exception as e:
        print(f"[ERROR] Failed to get access token: {e}")
        sys.exit(1)
    
    # Submit with rate limiting (1 per second to stay under quota)
    success = 0
    failed = []
    
    for i, url in enumerate(urls, 1):
        result, error = submit_url(url, access_token)
        if error:
            print(f"  [{i}/{len(urls)}] ❌ {error[:80]}")
            failed.append(url)
        else:
            success += 1
            if i <= 5 or i % 10 == 0 or i == len(urls):
                print(f"  [{i}/{len(urls)}] ✅ {url}")
        time.sleep(0.5)  # Rate limit
    
    print(f"\nDone: {success} submitted, {len(failed)} failed")
    if failed:
        with open("/tmp/gsc-failed.txt", "w") as f:
            f.write("\n".join(failed))
        print(f"Failed URLs saved to /tmp/gsc-failed.txt")

if __name__ == "__main__":
    main()
