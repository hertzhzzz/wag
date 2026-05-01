// lib/exa.ts

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

const EXA_API_BASE = 'https://api.exa.ai';

export async function searchExa(
  query: string,
  options: SearchOptions = {}
): Promise<ExaResult[]> {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) {
    throw new Error('EXA_API_KEY environment variable is required');
  }

  const { numResults = 10, category, minDate, maxAgeHours } = options;

  const params = new URLSearchParams({
    query,
    numResults: numResults.toString(),
    ...(category && { category }),
    ...(minDate && { minDate }),
    ...(maxAgeHours && { maxAgeHours: maxAgeHours.toString() }),
  });

  const response = await fetch(`${EXA_API_BASE}/search?${params}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Exa search failed: ${response.statusText}`);
  }

  const data = await response.json();

  return (data.results || []).map((result: Record<string, unknown>) => ({
    title: result.title || '',
    url: result.url || '',
    snippet: result.snippet || '',
    publishedDate: result.publishedDate,
    score: result.score || 0,
  }));
}

export async function findSimilar(
  url: string,
  options: SearchOptions = {}
): Promise<ExaResult[]> {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) {
    throw new Error('EXA_API_KEY environment variable is required');
  }

  const { numResults = 10 } = options;

  const response = await fetch(`${EXA_API_BASE}/findSimilar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, numResults }),
  });

  if (!response.ok) {
    throw new Error(`Exa findSimilar failed: ${response.statusText}`);
  }

  const data = await response.json();

  return (data.results || []).map((result: Record<string, unknown>) => ({
    title: result.title || '',
    url: result.url || '',
    snippet: result.snippet || '',
    publishedDate: result.publishedDate,
    score: result.score || 0,
  }));
}
