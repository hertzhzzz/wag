// lib/exa.ts
// Uses mcporter CLI for Exa MCP access — no API key required

import { execSync } from 'child_process';
import { logToFile, getLogPath } from './notify';

export interface ExaResult {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
  score: number;
}

export interface SearchOptions {
  numResults?: number;
  category?: 'news' | 'research_paper' | 'company' | 'article';
  minDate?: string;
  maxAgeHours?: number;
}

function execMcporter(command: string): string {
  const logPath = getLogPath();
  try {
    // Use --output text (JSON mode has a bug with Exa's multi-line strings)
    const result = execSync(`mcporter call ${command} --output text`, {
      encoding: 'utf8',
      timeout: 30000,
      maxBuffer: 10 * 1024 * 1024,
    });
    return result;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logToFile(logPath, `mcporter call failed: ${msg}`, 'warn');
    throw new Error(`Exa MCP call failed: ${msg}`);
  }
}

// Parse Exa's text output format:
// Title: ...
// URL: ...
// Published: ...
// Author: ...
// Highlights:
// [snippets...]
// ---
function parseExaTextOutput(raw: string): ExaResult[] {
  const items: ExaResult[] = [];
  // Split into entries by "---" separator
  const entries = raw.split(/^---$/m);

  for (const entry of entries) {
    const trimmed = entry.trim();
    if (!trimmed) continue;

    const titleMatch = trimmed.match(/^Title:\s*(.+)$/m);
    const urlMatch = trimmed.match(/^URL:\s*(https?:\/\/.+)$/m);
    const publishedMatch = trimmed.match(/^Published:\s*(.+)$/m);
    const highlightsMatch = trimmed.match(/^Highlights:\s*\n([\s\S]+)$/m);

    if (titleMatch && urlMatch) {
      items.push({
        title: titleMatch[1].trim(),
        url: urlMatch[1].trim(),
        snippet: highlightsMatch ? highlightsMatch[1].trim().replace(/\[\.\.\.\]/g, '').slice(0, 300) : '',
        publishedDate: publishedMatch ? publishedMatch[1].trim() : undefined,
        score: 0,
      });
    }
  }

  return items;
}

export async function searchExa(
  query: string,
  options: SearchOptions = {}
): Promise<ExaResult[]> {
  const { numResults = 10 } = options;

  const raw = execMcporter(`exa.web_search_exa query="${query.replace(/"/g, '\\"')}" numResults=${numResults}`);
  return parseExaTextOutput(raw);
}

export async function findSimilar(
  url: string,
  options: SearchOptions = {}
): Promise<ExaResult[]> {
  const { numResults = 10 } = options;

  const raw = execMcporter(`exa.web_fetch_exa urls="[\\"${url}\\"]" maxCharacters=5000`);
  return parseExaTextOutput(raw);
}
