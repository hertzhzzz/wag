// lib/google-trends.ts
// Uses browser-harness CDP to access Google Trends Explore (user's logged-in Chrome, no API key)

import { execSync } from 'child_process';

export interface TrendQuery {
  title: string;
  change?: string; // e.g. "+100%", "BREAKOUT"
  traffic?: string;
  rising?: boolean;
}

export interface GoogleTrendsData {
  keyword: string;
  geo: string;
  timeframe: string;
  topQueries: TrendQuery[];
  risingQueries: TrendQuery[];
}

export interface GoogleTrendsOptions {
  geo?: string; // default 'AU'
  timeframe?: string; // default 'today 3-m'
  browserName?: string;
}

const BH_BIN = '/Users/mark/Projects/browser-harness/.venv/bin/browser-harness';
const SCRIPT_PATH = '/Users/mark/Projects/browser-harness/src';

function execBh(script: string, browserName = 'default'): string {
  const escaped = script
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');
  return execSync(`${BH_BIN} -c "${escaped}"`, {
    env: { ...process.env, BU_NAME: browserName },
    encoding: 'utf8',
    timeout: 90000,
    maxBuffer: 8 * 1024 * 1024,
  });
}

function parseTrendsBody(body: string): { topQueries: TrendQuery[]; risingQueries: TrendQuery[] } {
  const topQueries: TrendQuery[] = [];
  const risingQueries: TrendQuery[] = [];

  const lines = body.split('\n');
  let section: 'top' | 'rising' | 'none' = 'none';

  // Section headers detected first (before isNoise filtering)
  const isSectionHeader = (trimmed: string): boolean =>
    trimmed === 'Top queries' || trimmed.startsWith('Top queries') ||
    trimmed === 'Rising queries' || trimmed.startsWith('Rising queries');

  // Widget/metadata patterns
  const widgetPatterns = new Set([
    'info', 'download', 'Download CSV', 'Got it', 'Close', 'Privacy',
    'Terms', 'Send feedback', 'About', 'help', 'Help', 'language',
    'lightbulb_tips', 'Suggest search terms', 'Find search terms',
    'Gemini in Google Trends', 'This site uses cookies', 'Learn more',
    'Commonly searched queries', 'People who searched for',
    'more_vert', 'More query actions',
    'Query', 'Search interest', 'Change',
    'Trends', 'Home', 'Explore',
    'Search term', 'manage_search', 'Search it', 'edit', 'delete', 'Remove',
    'add', 'Add a search term', 'location_on', 'calendar_month',
    'Web Search', 'Google Trends', 'Interest over time',
  ]);

  const isNoise = (trimmed: string): boolean => {
    if (!trimmed) return true;
    if (widgetPatterns.has(trimmed)) return true;
    if (trimmed.match(/^Go to (previous|next) page$/)) return true;
    if (trimmed.match(/^\d+–\d+ of \d+$/)) return true;
    if (trimmed.match(/^\d{4}$/)) return true;
    if (trimmed.includes('Australia') && trimmed.includes('Past year') && trimmed.length < 40) return true;
    if (trimmed.match(/^English \(Australia\)/)) return true;
    if (trimmed === 'Australia') return true;
    if (trimmed.match(/^Back to Classic/)) return true;
    if (trimmed.match(/^Dismiss$/)) return true;
    if (trimmed.match(/^New! /)) return true;
    if (trimmed.match(/^A quick/)) return true;
    if (trimmed.match(/^What's your area of interest/)) return true;
    if (trimmed.match(/^[+-]?[\d,\s]+%?$/)) return true; // bare change values with commas
    if (trimmed.match(/^[A-Z]{3,}$/)) return true;
    if (trimmed.length <= 1) return true;
    if (trimmed.match(/^[\d\s\.–-]+$/)) return true;
    return false;
  };

  const isDirectionWord = (trimmed: string): boolean =>
    ['north', 'south', 'east', 'west'].includes(trimmed.toLowerCase());

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect section headers FIRST
    if (isSectionHeader(line)) {
      section = line.startsWith('Top') ? 'top' : 'rising';
      continue;
    }

    if (isNoise(line)) continue;
    if (section === 'none') continue;
    if (line.match(/^-+$/)) continue;

    // We have a query title — look ahead for [direction,] [+X%|BREAKOUT|range], [widget...]
    let change: string | undefined;
    let traffic: string | undefined;
    let consumed = i;

    for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
      const next = lines[j].trim();
      // Strip tab indentation for BREAKOUT/value check (Rising queries use tab-indented values)
      const raw = lines[j];
      const clean = raw.replace(/\t/g, '').trim();
      if (!next) continue;
      // BREAKOUT can appear tab-indented and would be caught by isNoise — bypass first
      if (clean === 'BREAKOUT') { change = 'BREAKOUT'; consumed = j; break; }
      if (isNoise(next)) continue;

      // BREAKOUT is the value itself — not a direction word label
      if (clean === 'BREAKOUT') { change = 'BREAKOUT'; consumed = j; break; }

      // Skip bare percentage noise (e.g. +4,250%)
      if (next.match(/^\+\d[,\d]*%$/)) continue;

      if (isDirectionWord(next)) {
        // Direction word is a label; the actual value is on the next non-noise line
        for (let k = j + 1; k < Math.min(j + 4, lines.length); k++) {
          const valRaw = lines[k];
          const val = valRaw.replace(/\t/g, '').trim();
          // +X,XXX% format — capture before isNoise filters it out
          if (val.match(/^\+\d[,\d]*%$/)) { change = val; consumed = k; break; }
          if (!val) continue;
          if (isNoise(val)) continue;
          if (val === 'BREAKOUT') { change = 'BREAKOUT'; consumed = k; break; }
          if (val.match(/^\+[\d,]+%?$/)) { change = val; consumed = k; break; }
          if (val.match(/^\d+\s*[-–]\s*\d+$/)) { traffic = val; consumed = k; break; }
          consumed = k - 1;
          break;
        }
        break;
      }

      if (clean === 'BREAKOUT') { change = 'BREAKOUT'; consumed = j; break; }
      if (next.match(/^\+[\d,]+%?$/)) { change = next; consumed = j; break; }
      if (next.match(/^\d+\s*[-–]\s*\d+$/)) { traffic = next; consumed = j; break; }

      consumed = j - 1;
      break;
    }

    const query: TrendQuery = {
      title: line,
      change,
      traffic,
      rising: section === 'rising' || change === 'BREAKOUT',
    };

    if (section === 'top') topQueries.push(query);
    else risingQueries.push(query);

    i = consumed;
  }

  // Deduplicate and filter noise
  const seen = new Set<string>();
  const isValidQuery = (q: TrendQuery): boolean => {
    if (!q.title || q.title.length < 2) return false;
    if (q.title.match(/^[+-]?[\d,\s]+%?$/)) return false; // bare change value treated as title
    if (q.title.match(/^\d+\s*[-–]\s*\d+$/)) return false; // bare range treated as title
    if (q.title.match(/^[A-Z]{3,}$/)) return false; // ALL-CAPS acronyms
    if (q.title.match(/^\d{4}$/)) return false; // standalone years
    if (['north', 'south', 'east', 'west'].includes(q.title.toLowerCase())) return false;
    if (q.title.match(/^What's your area of interest/)) return false;
    if (q.title.match(/^Close/)) return false;
    if (q.title.includes('Gemini in Google Trends')) return false;
    if (q.title.includes('cookies from Google')) return false;
    return true;
  };
  return {
    topQueries: topQueries.filter((q) => {
      if (!isValidQuery(q)) return false;
      if (seen.has(q.title)) return false;
      seen.add(q.title);
      return true;
    }),
    risingQueries: risingQueries.filter((q) => {
      if (!isValidQuery(q)) return false;
      if (seen.has(q.title)) return false;
      seen.add(q.title);
      return true;
    }),
  };
}

export async function getGoogleTrends(
  keyword: string,
  options: GoogleTrendsOptions = {}
): Promise<GoogleTrendsData> {
  const geo = options.geo || 'AU';
  const timeframe = options.timeframe || 'today 3-m';
  const browserName = options.browserName || 'default';

  const escapedKeyword = keyword.replace(/'/g, "\\'");

  const script = `
import sys
sys.path.insert(0, '${SCRIPT_PATH}')

from browser_harness.helpers import *

goto_url('https://trends.google.com/explore?geo=${geo}')
wait_for_load()
wait(2)

try:
    btn = js("document.querySelector('[class~=cookieBarButton]')")
    if btn:
        btn.click()
        print('cookie accepted')
        wait(1)
except:
    pass

body = js('document.body.innerText')
if 'Oops' in body or 'Not available' in body:
    print('Trends error page, retrying...')
    goto_url('https://trends.google.com/trends')
    wait_for_load()
    wait(2)
    js("(function(){var a=document.querySelector('a[href*=\\"explore\\"]'); if(a)a.click();})()")
    wait_for_load()
    wait(3)

js("(function(){var inp=document.querySelector('input[aria-label=\\"Add a search term\\"]'); if(inp){inp.focus();} })()")
wait(1)

type_text('${escapedKeyword}')
wait(1)
press_key('Enter')
wait_for_load()
wait(4)

body = js('document.body.innerText')
print('BODY_START')
print(body[:12000])
print('BODY_END')
`;

  const output = execBh(script, browserName);
  const bodyMatch = output.match(/BODY_START\n([\s\S]*?)\nBODY_END/);
  const body = bodyMatch ? bodyMatch[1] : output;

  const { topQueries, risingQueries } = parseTrendsBody(body);

  return { keyword, geo, timeframe, topQueries, risingQueries };
}

// Backwards-compatible aliases
export const getTrends = getGoogleTrends;
export const getTrendData = getGoogleTrends;
