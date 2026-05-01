// lib/google-trends.ts

export interface TrendItem {
  title: string;
  traffic?: string;
  rising?: boolean;
}

export interface TrendData {
  query: string;
  timeframe: string;
  geo: string;
  results: TrendItem[];
}

const SERPAPI_GOOGLE_TRENDS = 'https://serpapi.com/search.json';

export async function getTrends(
  query: string,
  geo: string = 'Australia',
  timeframe: string = 'today 1-m'
): Promise<TrendItem[]> {
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    console.warn('SERPAPI_KEY not set, using fallback');
    return getTrendsFallback(query, geo);
  }

  const params = new URLSearchParams({
    engine: 'google_trends',
    q: query,
    data_type: 'RELATED_TOPICS',
    geo,
    timeframe,
    api_key: apiKey,
  });

  try {
    const response = await fetch(`${SERPAPI_GOOGLE_TRENDS}?${params}`);
    if (!response.ok) {
      throw new Error(`Google Trends API failed: ${response.statusText}`);
    }

    const data = await response.json();
    return parseTrendResults(data);
  } catch (error) {
    console.error('Trends API error, using fallback:', error);
    return getTrendsFallback(query, geo);
  }
}

async function getTrendsFallback(query: string, geo: string): Promise<TrendItem[]> {
  const exaKey = process.env.EXA_API_KEY;
  if (!exaKey) {
    console.warn('EXA_API_KEY not set, returning empty trends');
    return [{ title: query, traffic: '0', rising: false }];
  }

  try {
    const { searchExa } = await import('./exa');
    const newsResults = await searchExa(`${query} trends ${geo}`, {
      numResults: 5,
      category: 'news',
      maxAgeHours: 168,
    });

    return newsResults.map(r => ({
      title: r.title,
      traffic: undefined,
      rising: true,
    }));
  } catch (error) {
    console.error('Fallback search failed:', error);
    return [{ title: query, traffic: '0', rising: false }];
  }
}

function parseTrendResults(data: Record<string, unknown>): TrendItem[] {
  const results: TrendItem[] = [];

  if (data.related_topics) {
    const topics = data.related_topics as Record<string, unknown>[];
    for (const topic of topics) {
      results.push({
        title: (topic.topic_title as string) || (topic.title as string) || '',
        traffic: topic.traffic as string,
        rising: topic.rising === true,
      });
    }
  }

  return results;
}

export async function getTrendData(
  query: string,
  timeframe: string = 'today 3-m'
): Promise<TrendData> {
  const geo = 'AU';

  return {
    query,
    timeframe,
    geo,
    results: await getTrends(query, geo, timeframe),
  };
}