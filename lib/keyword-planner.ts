// lib/keyword-planner.ts
// Uses browser-harness (CDP/Chrome) for Google Ads Keyword Planner access — no API key required

import { execSync } from 'child_process';
import { logToFile, getLogPath } from './notify';
import { searchExa } from './exa';

export interface KeywordIdea {
  keyword: string;
  monthlySearches?: number;
  competition?: 'LOW' | 'MEDIUM' | 'HIGH';
  suggestedBid?: number;
}

export interface KeywordPlannerOptions {
  language?: string;
  location?: string;
  browserName?: string;
}

const BH_BIN = '/Users/mark/Projects/browser-harness/.venv/bin/browser-harness';
const KW_PLANNER_URL = 'https://ads.google.com/aw/keywordplanner/home';

function execBh(script: string, browserName = 'default'): string {
  const logPath = getLogPath();
  try {
    // Escape for shell double-quoting: escape $ ` \ and "
    const escaped = script
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/`/g, '\\`')
      .replace(/\$/g, '\\$');
    const result = execSync(`${BH_BIN} -c "${escaped}"`, {
      env: { ...process.env, BU_NAME: browserName },
      encoding: 'utf8',
      timeout: 90000,
      maxBuffer: 8 * 1024 * 1024,
    });
    return result;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logToFile(logPath, `browser-harness call failed: ${msg}`, 'warn');
    throw new Error(`browser-harness failed: ${msg}`);
  }
}

// Parse the Keyword Planner results from page body text
// Expected pattern in body:
// Keyword (by relevance)    Avg. monthly searches  Competition  Top of page bid (low range)  ...
// [keyword text]    [search range]    [competition]    [$bid_low - $bid_high]  ...
function parseKeywordPlannerBody(body: string): KeywordIdea[] {
  const results: KeywordIdea[] = [];

  // Extract all keyword rows — they appear in table format after "Keyword (by relevance)" header
  // Each row has keyword name followed by numbers on subsequent lines
  const lines = body.split('\n');

  let inKeywordSection = false;
  let foundHeader = false;
  let prevKeyword = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Start of keyword ideas section
    if (line.includes('Keyword ideas')) {
      inKeywordSection = true;
      continue;
    }

    // End sections
    if (line.includes('Keyword Planner can be used') || line.includes('Refine keywords')) {
      break;
    }

    if (!inKeywordSection) continue;

    // Skip navigation and header lines
    if (line.startsWith('Keyword (by relevance)')) {
      foundHeader = true;
      continue;
    }
    if (!foundHeader) continue;

    // Skip meta lines
    if (line.includes('Add filter') || line.includes('Columns') ||
        line.includes('Download keyword') || line.includes('Broaden your search') ||
        line.includes('Search volume') || line.includes('Filters Applied')) continue;

    // Skip blank / single tokens
    if (!line || line.length < 2) continue;

    // Lines that are just numbers / currency / percentages
    if (/^[\d,.\-–]+\$|^[\d,.\-–]+%|^\d[\d,.\-–]*$/.test(line)) continue;

    // Lines that look like months (Apr, May etc)
    if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/.test(line)) continue;

    // Skip column headers that appear inline
    if (line.includes('Avg. monthly searches') || line.includes('Competition') ||
        line.includes('Top of page bid')) continue;

    // Skip contextual chips like "add\nchina factory"
    if (line === 'add') continue;

    // Lines starting with "add" are chip labels
    if (line.startsWith('add')) continue;

    // Skip date range lines
    if (line.includes('2025') || line.includes('2026') || line.includes('GMT')) continue;

    // Skip empty text
    if (line === 'Keyword' || line === 'search') continue;

    // The actual keyword row: check if it's followed by numbers
    // Keyword names are phrases (multiple words, no numbers-only)
    const isKeyword = line.length > 3 &&
                      !/^\$[\d.]+/.test(line) &&
                      !/^[\d.]+ – [\d.]+$/.test(line) &&
                      !line.includes('search volume') &&
                      !line.includes('help_outline') &&
                      !line.includes('view_column') &&
                      !line.includes('filter_alt');

    if (isKeyword && !line.includes('help_outline') && line.split(' ').length >= 1) {
      prevKeyword = line;
      // Look ahead for the data row (searches, competition, bid)
      for (let j = i + 1; j < Math.min(i + 10, lines.length) && prevKeyword; j++) {
        const dataLine = lines[j].trim();
        // Search volume pattern: "10 – 100" or "1,000 – 10,000"
        const searchMatch = dataLine.match(/^([\d,]+)\s*–\s*([\d,]+)$/);
        if (searchMatch) {
          const low = parseInt(searchMatch[1].replace(/,/g, ''));
          const high = parseInt(searchMatch[2].replace(/,/g, ''));
          results.push({
            keyword: prevKeyword,
            monthlySearches: Math.round((low + high) / 2),
            competition: 'MEDIUM' as const,
          });
          prevKeyword = '';
          i = j; // advance past data line
          break;
        }
        // If we hit another keyword before finding numbers, this isn't a keyword row
        if (dataLine.length > 3 && !/^[\d,.\-–]+$/.test(dataLine) &&
            !dataLine.includes('%') && !dataLine.includes('$')) {
          break;
        }
      }
    }
  }

  return results.slice(0, 50);
}

export async function getKeywordIdeas(
  seedKeyword: string,
  options: KeywordPlannerOptions = {}
): Promise<KeywordIdea[]> {
  const { browserName = 'default' } = options;
  const logPath = getLogPath();

  try {
    await logToFile(logPath, `Keyword Planner search for: ${seedKeyword}`, 'info');

    // Use the exact Keyword Planner URL with campaign session params
    const kwUrl = options['kwUrl'] as string | undefined;
    const targetUrl = kwUrl || KW_PLANNER_URL;

    const script = `
goto_url('${targetUrl}')
wait_for_load()
wait(2)
js('window.scrollTo(0, 400)')
wait(1)
type_text('${seedKeyword.replace(/'/g, "\\'")}')
wait(0.5)
press_key('Enter')
wait_for_load()
wait(4)
try:
    dismiss = js('document.querySelector("[aria-label=dismiss]") || document.querySelector("[aria-label=close]")')
    if dismiss: dismiss.click()
except: pass
wait(1)
js('window.scrollTo(0, 600)')
wait(1)
body = js('document.body.innerText')
print('PAGE_START')
print(body)
print('PAGE_END')
`;

    const raw = execBh(script, browserName);

    const startMarker = 'PAGE_START';
    const endMarker = 'PAGE_END';
    const startIdx = raw.indexOf(startMarker);
    const endIdx = raw.indexOf(endMarker);

    if (startIdx === -1 || endIdx === -1) {
      await logToFile(logPath, `Could not parse Keyword Planner output: ${raw.slice(0, 300)}`, 'warn');
      return getKeywordIdeasFallback(seedKeyword);
    }

    const pageText = raw.slice(startIdx + startMarker.length, endIdx);
    const ideas = parseKeywordPlannerBody(pageText);

    await logToFile(logPath, `Keyword Planner extracted ${ideas.length} keywords for "${seedKeyword}"`, 'info');

    if (ideas.length === 0) {
      // Fallback: try extracting just the seed keyword row
      const seedMatch = pageText.match(/([\w\s]+)\s+(\d+[\d,]*)\s*–\s*(\d+[\d,]*)\s+([\d.]+%)\s+(Low|Medium|High)/);
      if (seedMatch) {
        ideas.push({
          keyword: seedKeyword,
          monthlySearches: Math.round((parseInt(seedMatch[2].replace(/,/g,'')) + parseInt(seedMatch[3].replace(/,/g,''))) / 2),
          competition: (seedMatch[5].toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH'),
        });
      }
    }

    return ideas.length > 0 ? ideas : getKeywordIdeasFallback(seedKeyword);

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    await logToFile(logPath, `Keyword Planner failed: ${msg}`, 'warn');
    return getKeywordIdeasFallback(seedKeyword);
  }
}

async function getKeywordIdeasFallback(seedKeyword: string): Promise<KeywordIdea[]> {
  try {
    const results = await searchExa(seedKeyword, { numResults: 10 });
    return results.map(r => ({
      keyword: r.title.split(' ').slice(0, 4).join(' '),
      monthlySearches: undefined,
      competition: 'MEDIUM' as const,
    }));
  } catch {
    return [];
  }
}
