#!/usr/bin/env python3
"""WAG Content Pipeline — SQLite deployment & frequency tracker.

Usage:
  python3 scripts/pipeline-db.py init                        # Create DB + tables
  python3 scripts/pipeline-db.py status                       # Show pipeline overview
  python3 scripts/pipeline-db.py add-article <json>           # Record a written article
  python3 scripts/pipeline-db.py deploy <slug> <commit>       # Mark article as deployed
  python3 scripts/pipeline-db.py freq-check <category> <sub>  # Check 7-day count for sub-type
  python3 scripts/pipeline-db.py cluster-gaps [cluster]       # Show unfilled cluster slots
  python3 scripts/pipeline-db.py run-log [--last N]           # Show recent pipeline runs
  python3 scripts/pipeline-db.py record-run <json>            # Record a pipeline run
  python3 scripts/pipeline-db.py backfill                     # Scan git log + blog dir to backfill
  python3 scripts/pipeline-db.py gsc-update <slug> <state>    # Update indexation status
"""

import sqlite3
import json
import os
import sys
import subprocess
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "pipeline.db")
BLOG_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "content", "blog")

def get_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA foreign_keys=ON")
        return conn
    except sqlite3.Error as e:
        print(f"ERROR: Cannot open database at {DB_PATH}: {e}", file=sys.stderr)
        sys.exit(1)

def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            sub_type TEXT NOT NULL DEFAULT '',
            traffic TEXT DEFAULT '',
            word_count INTEGER DEFAULT 0,
            date_created TEXT NOT NULL,
            date_deployed TEXT,
            commit_hash TEXT,
            batch_number INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pending',
            gsc_state TEXT DEFAULT '',
            cluster_name TEXT DEFAULT '',
            notes TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS pipeline_runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            keywords_total INTEGER DEFAULT 0,
            candidates_wag INTEGER DEFAULT 0,
            articles_written INTEGER DEFAULT 0,
            articles_deployed INTEGER DEFAULT 0,
            skill_version TEXT DEFAULT '',
            notes TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS cluster_definition (
            cluster_name TEXT PRIMARY KEY,
            pillar_title TEXT NOT NULL,
            pillar_slug TEXT NOT NULL,
            sub_type TEXT NOT NULL,
            status TEXT DEFAULT 'planned',
            target_keywords TEXT DEFAULT '',
            filled_by_slug TEXT DEFAULT '',
            updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
        CREATE INDEX IF NOT EXISTS idx_articles_date ON articles(date_created);
        CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category, sub_type);
        CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
    """)
    conn.commit()
    conn.close()
    print(f"DB initialized: {DB_PATH}")

def add_article(data):
    """data: JSON string or dict with slug, title, category, sub_type, traffic, word_count, date, cluster"""
    if isinstance(data, str):
        data = json.loads(data)
    conn = get_db()
    conn.execute("""
        INSERT OR IGNORE INTO articles (slug, title, category, sub_type, traffic, word_count, date_created, cluster_name, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    """, (
        data["slug"], data["title"], data["category"], data.get("sub_type", ""),
        data.get("traffic", ""), data.get("word_count", 0), data["date"],
        data.get("cluster_name", "")
    ))
    if conn.total_changes == 0:
        print(f"WARNING: {data['slug']} already exists — not overwritten")
    conn.commit()
    conn.close()
    print(f"Article recorded: {data['slug']}")

def deploy_article(slug, commit_hash):
    conn = get_db()
    today = datetime.now().strftime("%Y-%m-%d")
    conn.execute("""
        UPDATE articles SET status='deployed', date_deployed=?, commit_hash=?, updated_at=datetime('now')
        WHERE slug=? AND status='pending'
    """, (today, commit_hash, slug))
    if conn.total_changes == 0:
        print(f"WARNING: {slug} not found or already deployed")
    else:
        print(f"Deployed: {slug} → {commit_hash}")
    conn.commit()
    conn.close()

def freq_check(category, sub_type):
    """Count articles of given category+sub_type in last 7 days (including today)."""
    conn = get_db()
    seven_days_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    row = conn.execute("""
        SELECT COUNT(*) as cnt FROM articles
        WHERE category=? AND sub_type=? AND date_created >= ? AND status IN ('pending','deployed','indexed')
    """, (category, sub_type, seven_days_ago)).fetchone()
    conn.close()
    count = row["cnt"]
    print(f"{category}/{sub_type}: {count}/3 in last 7 days (since {seven_days_ago})")
    return count

def freq_summary():
    """Show frequency counts for all active categories."""
    conn = get_db()
    seven_days_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    rows = conn.execute("""
        SELECT category, sub_type, COUNT(*) as cnt FROM articles
        WHERE date_created >= ? AND status IN ('pending','deployed','indexed')
        GROUP BY category, sub_type ORDER BY category, cnt DESC
    """, (seven_days_ago,)).fetchall()
    conn.close()
    if not rows:
        print("No articles in last 7 days.")
        return
    print(f"{'Category':<30} {'Sub-type':<25} {'Count':>5}  {'Limit':>5}")
    print("-" * 70)
    for r in rows:
        bar = "█" * min(r["cnt"], 10) + "░" * max(0, 10 - r["cnt"]) if r["cnt"] <= 10 else "█" * 10
        print(f"{r['category']:<30} {r['sub_type']:<25} {r['cnt']:>5}    {'':>5}  {bar}")

def status():
    """Pipeline overview."""
    conn = get_db()
    total = conn.execute("SELECT COUNT(*) as c FROM articles").fetchone()["c"]
    pending = conn.execute("SELECT COUNT(*) as c FROM articles WHERE status='pending'").fetchone()["c"]
    deployed = conn.execute("SELECT COUNT(*) as c FROM articles WHERE status='deployed'").fetchone()["c"]
    indexed = conn.execute("SELECT COUNT(*) as c FROM articles WHERE status='indexed' OR gsc_state LIKE '%indexed%'").fetchone()["c"]
    runs = conn.execute("SELECT COUNT(*) as c FROM pipeline_runs").fetchone()["c"]

    print(f"=== Pipeline Status ===")
    print(f"Articles: {total} total | {deployed} deployed | {pending} pending | {indexed} indexed")
    print(f"Pipeline runs: {runs}")
    print()

    # Pending articles
    pending_rows = conn.execute("""
        SELECT slug, title, category, sub_type, date_created, batch_number
        FROM articles WHERE status='pending' ORDER BY date_created
    """).fetchall()
    if pending_rows:
        print(f"--- Pending ({len(pending_rows)}) ---")
        for r in pending_rows:
            print(f"  [{r['batch_number']}] {r['slug']} | {r['category']}/{r['sub_type']} | {r['date_created']}")

    # Recent deployments
    recent = conn.execute("""
        SELECT slug, date_deployed, commit_hash FROM articles
        WHERE status='deployed' ORDER BY date_deployed DESC LIMIT 10
    """).fetchall()
    if recent:
        print(f"\n--- Recent Deployments ---")
        for r in recent:
            ch = (r['commit_hash'] or '')[:8]
            print(f"  {r['date_deployed']} | {r['slug']} | {ch}")

    conn.close()

def cluster_gaps(cluster_name=None):
    """Show unfilled cluster slots."""
    conn = get_db()
    if cluster_name:
        rows = conn.execute("""
            SELECT * FROM cluster_definition WHERE cluster_name=? AND status='planned'
        """, (cluster_name,)).fetchall()
    else:
        rows = conn.execute("""
            SELECT * FROM cluster_definition WHERE status='planned' ORDER BY cluster_name
        """).fetchall()
    conn.close()
    if not rows:
        cluster_label = cluster_name or "all clusters"
        print(f"No gaps in {cluster_label}.")
        return
    print(f"{'Cluster':<35} {'Sub-type':<15} {'Target Keywords'}")
    print("-" * 80)
    for r in rows:
        print(f"{r['cluster_name']:<35} {r['sub_type']:<15} {r['target_keywords'] or '(any)'}")

def record_run(data):
    """Record a pipeline run."""
    if isinstance(data, str):
        data = json.loads(data)
    conn = get_db()
    conn.execute("""
        INSERT INTO pipeline_runs (date, keywords_total, candidates_wag, articles_written, articles_deployed, skill_version, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        data["date"], data.get("keywords_total", 0), data.get("candidates_wag", 0),
        data.get("articles_written", 0), data.get("articles_deployed", 0),
        data.get("skill_version", ""), data.get("notes", "")
    ))
    conn.commit()
    run_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
    conn.close()
    print(f"Run recorded: id={run_id} date={data['date']}")

def run_log(last=5):
    conn = get_db()
    rows = conn.execute("""
        SELECT * FROM pipeline_runs ORDER BY date DESC LIMIT ?
    """, (last,)).fetchall()
    conn.close()
    if not rows:
        print("No pipeline runs recorded.")
        return
    print(f"{'Date':<12} {'KW':>5} {'Cand':>5} {'Wrote':>5} {'Deploy':>6} {'v'}")
    print("-" * 45)
    for r in rows:
        print(f"{r['date']:<12} {r['keywords_total']:>5} {r['candidates_wag']:>5} "
              f"{r['articles_written']:>5} {r['articles_deployed']:>6} {r['skill_version']}")

def gsc_update(slug, state):
    conn = get_db()
    conn.execute("""
        UPDATE articles SET gsc_state=?, updated_at=datetime('now')
        WHERE slug=? OR slug=?
    """, (state, slug, f"/resources/{slug}"))
    if state in ("Submitted and indexed",):
        conn.execute("UPDATE articles SET status='indexed' WHERE slug=? OR slug=?", (slug, f"/resources/{slug}"))
    conn.commit()
    conn.close()
    print(f"GSC: {slug} → {state}")

def backfill():
    """Scan git log and blog directory to backfill existing articles into DB."""
    conn = get_db()

    # Phase 1: Scan all MDX files for article metadata
    count = 0
    for fname in os.listdir(BLOG_DIR):
        if not fname.endswith(".mdx"):
            continue
        fpath = os.path.join(BLOG_DIR, fname)
        with open(fpath) as f:
            content = f.read(4096)  # Read only frontmatter portion

        # Parse basic frontmatter
        slug = _extract_fm(content, "slug")
        title = _extract_fm(content, "title")
        category = _extract_fm(content, "category")
        date = _extract_fm(content, "date")

        if not slug or not title:
            continue

        slug = slug.strip('"').removeprefix("/resources/")
        title = title.strip('"')
        category = category.strip('"') if category else "Unknown"
        date = date.strip('"') if date else ""

        # Normalize date format
        if date and not date.startswith("202"):
            try:
                dt = datetime.strptime(date, "%d %b %Y")
                date = dt.strftime("%Y-%m-%d")
            except ValueError:
                pass

        # Determine sub_type
        sub_type = _classify_sub_type(title, category)

        conn.execute("""
            INSERT OR IGNORE INTO articles (slug, title, category, sub_type, date_created, status)
            VALUES (?, ?, ?, ?, ?, 'deployed')
        """, (slug, title, category, sub_type, date))
        count += 1

    # Phase 2: Cross-reference with git log for deployment dates
    try:
        result = subprocess.run(
            ["git", "log", "--format=%H", "--name-only", "--diff-filter=A", "--", "content/blog/"],
            capture_output=True, text=True, cwd=os.path.dirname(BLOG_DIR)
        )
        current_commit = None
        for line in result.stdout.strip().split("\n"):
            line = line.strip()
            if not line:
                current_commit = None
                continue
            if len(line) == 40 and all(c in "0123456789abcdef" for c in line):
                current_commit = line
            elif line.startswith("content/blog/") and current_commit:
                fname = os.path.basename(line)
                slug = fname.replace(".mdx", "")
                conn.execute("""
                    UPDATE articles SET commit_hash=?, status='deployed'
                    WHERE slug=? AND commit_hash IS NULL
                """, (current_commit, slug))
    except Exception:
        pass  # git may not be available

    conn.commit()
    conn.close()
    print(f"Backfill complete: {count} articles imported")

def _extract_fm(content, field):
    """Extract a single frontmatter field value."""
    in_frontmatter = False
    for line in content.split("\n"):
        line = line.strip()
        if line == "---":
            if not in_frontmatter:
                in_frontmatter = True
                continue
            else:
                break  # Closing delimiter
        if in_frontmatter and line.startswith(f"{field}:"):
            val = line.split(":", 1)[1].strip()
            return val.strip('"')
    return ""

def _classify_sub_type(title, category):
    """Heuristic classification of article sub-type from title."""
    title_lower = title.lower()
    if " vs " in title_lower or " v " in title_lower:
        return "match"
    if any(w in title_lower for w in ["grand prix", "standings", "finals", "scores", "tournament"]):
        return "league"
    if "world cup" in title_lower and "stats" in title_lower:
        return "league"
    if "draft" in title_lower:
        return "league"
    if category == "Sports Merchandise Sourcing":
        return "player"
    if "supply chain" in title_lower or "procurement" in title_lower:
        return "supply_chain"
    if "retail" in title_lower:
        return "retail_case"
    if "factory" in title_lower or "verify" in title_lower or "supplier" in title_lower:
        return "factory_verification"
    if "tour" in title_lower or "visit" in title_lower:
        return "city_guide"
    return ""

# ---- CLI ----
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "init":
        init_db()
    elif cmd == "status":
        status()
    elif cmd == "freq":
        if len(sys.argv) == 4:
            freq_check(sys.argv[2], sys.argv[3])
        else:
            freq_summary()
    elif cmd == "add-article":
        add_article(sys.argv[2])
    elif cmd == "deploy":
        deploy_article(sys.argv[2], sys.argv[3])
    elif cmd == "cluster-gaps":
        cluster_gaps(sys.argv[2] if len(sys.argv) > 2 else None)
    elif cmd == "record-run":
        record_run(sys.argv[2])
    elif cmd == "run-log":
        n = int(sys.argv[2]) if len(sys.argv) > 2 else 5
        run_log(n)
    elif cmd == "gsc-update":
        gsc_update(sys.argv[2], sys.argv[3])
    elif cmd == "backfill":
        backfill()
    elif cmd == "pending":
        conn = get_db()
        rows = conn.execute("SELECT slug, title, category, sub_type, date_created FROM articles WHERE status='pending' ORDER BY date_created").fetchall()
        conn.close()
        for r in rows:
            print(f"[{r['date_created']}] {r['slug']} | {r['category']}/{r['sub_type']}")
    else:
        print(f"Unknown command: {cmd}")
        print(__doc__)
