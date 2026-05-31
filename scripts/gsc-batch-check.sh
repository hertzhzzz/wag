#!/bin/bash
# Batch GSC Inspect for all existing WAG blog articles (excluding 20 new ones)
RESULTS_FILE=/tmp/gsc-check-results.txt
> "$RESULTS_FILE"

check_url() {
  local slug="$1"
  local url="https://www.winningadventure.com.au/resources/${slug}"
  local output
  output=$(cd /Users/mark/.agents/skills/seo && .venv/bin/python scripts/gsc_inspect.py "$url" --site-url sc-domain:winningadventure.com.au --json 2>/dev/null)
  local verdict
  verdict=$(echo "$output" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('index_status',{}).get('verdict','?'))" 2>/dev/null)
  echo "$slug | $verdict" >> "$RESULTS_FILE"
  sleep 1
}

NEW_20="carlton-vs-geelong-afl-merchandise-sourcing-guide new-south-wales-blues-nrl-merchandise-sourcing-guide sharks-vs-sea-eagles-2026-nrl-merchandise-sourcing-guide ipl-2026-cricket-merchandise-china-sourcing-guide champions-league-final-football-merchandise-sourcing-guide monaco-grand-prix-f1-motorsport-merchandise-sourcing-guide supercars-championship-motorsport-merchandise-sourcing-guide cricket-sports-equipment-china-sourcing-guide avg-travels-liquidation-business-assets-sourcing-guide dashdot-property-collapse-asset-liquidation-guide china-ev-market-decline-supply-chain-guide electric-battery-supply-chain-china-sourcing-guide australia-capital-gains-tax-sme-finance-guide roland-garros-2026-tennis-equipment-sourcing-guide sydney-vs-richmond-afl-merchandise-sourcing-guide rr-vs-gt-ipl-cricket-merchandise-sourcing-guide west-indies-women-vs-pakistan-women-cricket-sourcing-guide gold-precious-metals-china-supply-guide toy-story-licensed-merchandise-china-sourcing-guide star-wars-mandalorian-grogu-licensed-merchandise-sourcing-guide"

cd /Users/mark/Projects/wag/frontend/content/blog
for f in *.mdx; do
  slug="${f%.mdx}"
  # Skip if in NEW_20
  skip=false
  for ns in $NEW_20; do
    if [ "$slug" = "$ns" ]; then
      skip=true
      break
    fi
  done
  if [ "$skip" = true ]; then
    continue
  fi
  check_url "$slug"
done

echo "=== DONE ===" >> "$RESULTS_FILE"
total=$(wc -l < "$RESULTS_FILE")
echo "Checked $((total - 1)) articles" | tee -a "$RESULTS_FILE"
