#!/usr/bin/env python3
"""
Read-only GSC weekly helper for China Sourcing Agent money cluster.

Auth: ~/.claude/gsc-service-account.json (Owner on sc-domain:winningadventure.com.au)
Does not submit Indexing API notifications. Does not write site files.

Usage:
  python3 scripts/gsc-china-sourcing-agent-weekly.py
  python3 scripts/gsc-china-sourcing-agent-weekly.py --days 28
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.parse
import urllib.request
from datetime import date, timedelta
from pathlib import Path

try:
    import google.oauth2.service_account
    from google.auth.transport.requests import Request
except ImportError:
    print("Missing google-auth. Install: pip install google-auth", file=sys.stderr)
    sys.exit(1)

SITE = "sc-domain:winningadventure.com.au"
SCOPE = "https://www.googleapis.com/auth/webmasters.readonly"
ENDPOINT = (
    "https://www.googleapis.com/webmasters/v3/sites/"
    f"{urllib.parse.quote(SITE, safe='')}/searchAnalytics/query"
)

QUERIES = [
    "china sourcing agent australia",
    "china sourcing agent",
    "sourcing agent australia",
    "sourcing agent",
]

# Prefer equals/exact host paths so "/china-sourcing-agent" does not match
# "/article/china-sourcing-agent-vs-direct" via substring contains.
PAGE_FILTERS = [
    ("/china-sourcing-agent (root)", "equals", "https://www.winningadventure.com.au/china-sourcing-agent"),
    ("/", "equals", "https://www.winningadventure.com.au/"),
    ("/article/sourcing-agent-australia", "equals", "https://www.winningadventure.com.au/article/sourcing-agent-australia"),
    ("/article/china-sourcing-agent-vs-direct", "equals", "https://www.winningadventure.com.au/article/china-sourcing-agent-vs-direct"),
    ("/services", "equals", "https://www.winningadventure.com.au/services"),
    ("/article/china-sourcing-agent (legacy)", "equals", "https://www.winningadventure.com.au/article/china-sourcing-agent"),
]


def creds_path() -> Path:
    candidates = [
        Path.home() / ".claude" / "gsc-service-account.json",
        Path(__file__).resolve().parents[2] / ".secrets" / "gsc-service-account.json",
        Path.home() / ".Codex" / "gsc-service-account.json",
    ]
    for p in candidates:
        if p.is_file():
            return p
    raise FileNotFoundError(
        "No GSC service account JSON found. Tried:\n  " + "\n  ".join(str(c) for c in candidates)
    )


def bearer_token() -> str:
    credentials = google.oauth2.service_account.Credentials.from_service_account_file(
        str(creds_path()), scopes=[SCOPE]
    )
    credentials.refresh(Request())
    return credentials.token


def query_api(body: dict) -> dict:
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        ENDPOINT,
        data=data,
        headers={
            "Authorization": f"Bearer {bearer_token()}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode())


def main() -> int:
    parser = argparse.ArgumentParser(description="GSC weekly China sourcing agent metrics")
    parser.add_argument("--days", type=int, default=28, help="Lookback days (default 28)")
    args = parser.parse_args()

    end = date.today() - timedelta(days=3)
    start = end - timedelta(days=args.days - 1)

    print(f"Property: {SITE}")
    print(f"Window:   {start.isoformat()} → {end.isoformat()} ({args.days}d, end lag-adjusted)")
    print(f"Key file: {creds_path()}")
    print()

    print("=== Query cluster (equals) ===")
    for q in QUERIES:
        body = {
            "startDate": start.isoformat(),
            "endDate": end.isoformat(),
            "dimensions": ["query"],
            "dimensionFilterGroups": [
                {
                    "filters": [
                        {
                            "dimension": "query",
                            "operator": "equals",
                            "expression": q,
                        }
                    ]
                }
            ],
            "rowLimit": 5,
        }
        try:
            result = query_api(body)
        except Exception as e:
            print(f"  {q}: ERROR {e}")
            continue
        rows = result.get("rows") or []
        if not rows:
            print(f"  {q}: (no rows)")
            continue
        r = rows[0]
        print(
            f"  {q}: clicks={r.get('clicks', 0)} impr={r.get('impressions', 0)} "
            f"ctr={r.get('ctr', 0):.4f} pos={r.get('position', 0):.1f}"
        )

    print()
    print("=== Page filter ===")
    for label, operator, expression in PAGE_FILTERS:
        body = {
            "startDate": start.isoformat(),
            "endDate": end.isoformat(),
            "dimensions": ["page"],
            "dimensionFilterGroups": [
                {
                    "filters": [
                        {
                            "dimension": "page",
                            "operator": operator,
                            "expression": expression,
                        }
                    ]
                }
            ],
            "rowLimit": 10,
        }
        try:
            result = query_api(body)
        except Exception as e:
            print(f"  {label}: ERROR {e}")
            continue
        rows = result.get("rows") or []
        if not rows:
            print(f"  {label}: (no rows)")
            continue
        clicks = sum(r.get("clicks", 0) for r in rows)
        impr = sum(r.get("impressions", 0) for r in rows)
        pos_num = sum(r.get("position", 0) * r.get("impressions", 0) for r in rows)
        pos = (pos_num / impr) if impr else 0
        print(f"  {label}: clicks={clicks} impr={impr} pos≈{pos:.1f} (rows={len(rows)})")

    print()
    print("Done (read-only). See docs/seo/2026-07-24-china-sourcing-agent-measurement.md")
    return 0


if __name__ == "__main__":
    sys.exit(main())
