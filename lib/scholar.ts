// lib/scholar.ts

export interface PaperResult {
  title: string;
  authors: string[];
  abstract?: string;
  year?: number;
  citationCount?: number;
  url: string;
  venue?: string;
}

export interface SearchPapersOptions {
  limit?: number;
  year?: string;
}

const SEMANTIC_SCHOLAR_API = 'https://api.semanticscholar.org/graph/v1';

export async function searchPapers(
  query: string,
  options: SearchPapersOptions = {}
): Promise<PaperResult[]> {
  const { limit = 10, year } = options;

  const params = new URLSearchParams({
    query,
    limit: limit.toString(),
    fields: 'title,authors,abstract,year,citationCount,url,venue',
    ...(year && { year }),
  });

  try {
    const response = await fetch(`${SEMANTIC_SCHOLAR_API}/paper/search?${params}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Semantic Scholar search failed: ${response.statusText}`);
    }

    const data = await response.json();

    return (data.data || []).map((paper: Record<string, unknown>) => ({
      title: paper.title as string || '',
      authors: ((paper.authors as Array<{name: string}>) || []).map(a => a.name),
      abstract: paper.abstract as string | undefined,
      year: paper.year as number | undefined,
      citationCount: paper.citationCount as number | undefined,
      url: (paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`) as string,
      venue: paper.venue as string | undefined,
    }));
  } catch (error) {
    console.error('Semantic Scholar API error:', error);
    return [];
  }
}