#!/usr/bin/env python3
"""
Google Indexing API - Batch URL Submission
向 Google Indexing API 批量提交 URL，通知页面已更新。
"""

import json
import sys
from pathlib import Path

# URLs to submit
URLS = [
    "https://www.winningadventure.com.au/resources/how-to-plan",
    "https://www.winningadventure.com.au/resources/china-business-tours",
    "https://www.winningadventure.com.au/resources/supplier-verification-guide",
]

SCOPES = ["https://www.googleapis.com/auth/indexing"]
ENDPOINT = "https://indexing.googleapis.com/v3/urlNotifications:publish"

def get_credentials():
    """Load service account credentials."""
    cred_path = Path.home() / ".claude" / "gsc-service-account.json"
    if not cred_path.exists():
        raise FileNotFoundError(f"Service account not found: {cred_path}")
    with open(cred_path) as f:
        return json.load(f)

def submit_url(url, access_token):
    """Submit a single URL to Indexing API."""
    import urllib.request
    import urllib.error

    payload = json.dumps({
        "url": url,
        "type": "URL_UPDATED"
    }).encode("utf-8")

    req = urllib.request.Request(
        ENDPOINT,
        data=payload,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
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
    print("=" * 60)
    print("Google Indexing API - Batch Submission")
    print("=" * 60)
    print()

    # Get access token
    try:
        import google.auth
        from google.oauth2 import service_account

        creds = service_account.Credentials.from_service_account_file(
            str(Path.home() / ".claude" / "gsc-service-account.json"),
            scopes=SCOPES
        )

        from google.auth.transport import requests as google_requests
        request = google_requests.Request()
        creds.refresh(request)
        access_token = creds.token
        print(f"[OK] Access token obtained")
        print()

    except Exception as e:
        print(f"[ERROR] Failed to get access token: {e}")
        print("Make sure google-auth is installed: pip install google-auth")
        sys.exit(1)

    # Submit each URL
    results = []
    for i, url in enumerate(URLS, 1):
        print(f"[{i}/{len(URLS)}] Submitting: {url}")
        result, error = submit_url(url, access_token)

        if error:
            print(f"    [ERROR] {error}")
            results.append({"url": url, "status": "error", "error": error})
        else:
            print(f"    [OK] Submitted successfully")
            if result:
                latest = result.get("urlNotificationMetadata", {}).get("latestUpdate", {})
                print(f"        notifyTime: {latest.get('notifyTime', 'N/A')}")
            results.append({"url": url, "status": "success", "result": result})

        print()

    # Summary
    print("=" * 60)
    print("Summary")
    print("=" * 60)
    success = sum(1 for r in results if r["status"] == "success")
    failed = sum(1 for r in results if r["status"] == "error")
    print(f"Total: {len(URLS)} | Success: {success} | Failed: {failed}")

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    main()
