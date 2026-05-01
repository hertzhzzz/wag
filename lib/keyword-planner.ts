export interface KeywordIdea {
  keyword: string;
  monthlySearches?: number;
  competition?: 'LOW' | 'MEDIUM' | 'HIGH';
  suggestedBid?: number;
}

export interface KeywordPlannerOptions {
  language?: string;
  location?: string;
}

const GOOGLE_ADS_API = 'https://googleads.googleapis.com/v17';

export async function getKeywordIdeas(
  seedKeyword: string,
  options: KeywordPlannerOptions = {}
): Promise<KeywordIdea[]> {
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const accessToken = process.env.GOOGLE_ADS_ACCESS_TOKEN;

  if (!customerId || !developerToken || !accessToken) {
    console.warn('Google Ads credentials not configured, using fallback');
    return getKeywordIdeasFallback(seedKeyword);
  }

  const { language = '1000', location = '2841' } = options;

  try {
    const response = await fetch(
      `${GOOGLE_ADS_API}/customers/${customerId}/keywordPlannerIdea:search`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': developerToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: {
            keywords: [seedKeyword],
            language,
            geo_target_constants: [`geoTargetConstants/${location}`],
          },
          page_size: 100,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Keyword Planner API failed: ${response.statusText}`);
    }

    const data = await response.json();
    return parseKeywordIdeas(data);
  } catch (error) {
    console.error('Keyword Planner API error:', error);
    return getKeywordIdeasFallback(seedKeyword);
  }
}

function parseKeywordIdeas(data: Record<string, unknown>): KeywordIdea[] {
  const results: KeywordIdea[] = [];

  if (data.results) {
    for (const result of data.results as Array<Record<string, unknown>>) {
      const metrics = result.keyword_metrics as Record<string, unknown> | undefined;
      results.push({
        keyword: result.text as string || '',
        monthlySearches: metrics?.monthly_searches as number,
        competition: metrics?.competition as 'LOW' | 'MEDIUM' | 'HIGH',
        suggestedBid: metrics?.low_top_of_page_bid as number,
      });
    }
  }

  return results;
}

async function getKeywordIdeasFallback(seedKeyword: string): Promise<KeywordIdea[]> {
  try {
    const { searchExa } = await import('./exa');
    const results = await searchExa(seedKeyword, { numResults: 10 });

    return results.map(r => ({
      keyword: r.title.split(' ').slice(0, 4).join(' '),
      monthlySearches: undefined,
      competition: 'MEDIUM' as const,
    }));
  } catch {
    // Exa not configured or search failed - return empty results
    return [];
  }
}