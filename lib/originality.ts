import fs from 'fs';
import path from 'path';
import { diff_match_patch, Diff } from 'diff-match-patch';
import matter from 'gray-matter';
import { searchExa } from './exa';

const dmp = new diff_match_patch();

/**
 * Calculate text similarity using diff_levenshtein approach.
 * Returns a value between 0 (completely different) and 1 (identical).
 */
export function calculateTextSimilarity(text1: string, text2: string): number {
  if (!text1 && !text2) return 1;
  if (!text1 || !text2) return 0;

  const diffs = dmp.diff_main(text1, text2);
  dmp.diff_cleanupSemantic(diffs);

  let levenshtein = 0;
  for (const [operation, text] of diffs) {
    if (operation !== 0) {
      levenshtein += text.length;
    }
  }

  const maxLength = Math.max(text1.length, text2.length);
  if (maxLength === 0) return 1;

  return Math.max(0, Math.min(1, 1 - levenshtein / maxLength));
}

/**
 * Result from originality check
 */
export interface OriginalityResult {
  isOriginal: boolean;
  localSimilarity: number;
  webSimilarity: number;
  maxSimilarity: number;
  similarContent: SimilarContent[];
  suggestions: string[];
}

export interface SimilarContent {
  source: 'local' | 'web';
  title: string;
  url?: string;
  similarity: number;
  excerpt?: string;
}

/**
 * Check content against local blog articles.
 * Returns the most similar article and its similarity score.
 */
export async function checkLocalOriginality(
  content: string,
  excludeSlug?: string
): Promise<{ slug: string; title: string; similarity: number }[]> {
  const blogDir = path.join(process.cwd(), 'content', 'blog');

  if (!fs.existsSync(blogDir)) {
    return [];
  }

  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.mdx'));
  const results: { slug: string; title: string; similarity: number }[] = [];

  for (const file of files) {
    const slug = file.replace('.mdx', '');
    if (slug === excludeSlug) continue;

    const filePath = path.join(blogDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content: blogContent } = matter(fileContent);

    const similarity = calculateTextSimilarity(content, blogContent);
    if (similarity > 0.3) {
      results.push({
        slug,
        title: data.title || slug,
        similarity,
      });
    }
  }

  return results.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Check content against the web using Exa search.
 * Returns similar web content and their similarity scores.
 */
export async function checkWebOriginality(
  content: string,
  title: string
): Promise<SimilarContent[]> {
  try {
    const query = title.length > 10 ? title.substring(0, 50) : title;

    const results = await searchExa(`${query} ${content.substring(0, 200)}`, {
      numResults: 5,
    });

    const similarContent: SimilarContent[] = [];

    for (const item of results) {
      const snippetSimilarity = calculateTextSimilarity(content, item.snippet || '');
      if (snippetSimilarity > 0.3 || item.snippet.length > 0) {
        similarContent.push({
          source: 'web',
          title: item.title || 'Unknown',
          url: item.url,
          similarity: snippetSimilarity,
          excerpt: item.snippet?.substring(0, 200),
        });
      }
    }

    return similarContent;
  } catch (error) {
    console.error('[Originality] Web search failed:', error);
    return [];
  }
}

/**
 * Main originality check function.
 * Checks content against local articles and web sources.
 */
export async function checkOriginality(
  content: string,
  options: {
    title: string;
    excludeSlug?: string;
    localThreshold?: number;
    webThreshold?: number;
  }
): Promise<OriginalityResult> {
  const { title, excludeSlug, localThreshold = 0.5, webThreshold = 0.5 } = options;

  const [localResults, webResults] = await Promise.all([
    checkLocalOriginality(content, excludeSlug),
    checkWebOriginality(content, title),
  ]);

  const similarContent: SimilarContent[] = [
    ...localResults.map((r) => ({
      source: 'local' as const,
      title: r.title,
      url: `/resources/${r.slug}`,
      similarity: r.similarity,
    })),
    ...webResults,
  ];

  const localSimilarity = localResults[0]?.similarity || 0;
  const webSimilarity = webResults[0]?.similarity || 0;
  const maxSimilarity = Math.max(localSimilarity, webSimilarity);

  const suggestions: string[] = [];

  if (maxSimilarity > localThreshold) {
    suggestions.push(
      `High similarity detected with existing content (${Math.round(maxSimilarity * 100)}%). Consider adding unique insights or reframing the content.`
    );
  }

  if (webSimilarity > webThreshold) {
    suggestions.push(
      `Content overlaps with published web sources. Ensure proper attribution or differentiate your angle.`
    );
  }

  if (similarContent.length === 0) {
    suggestions.push('Content appears to be original. No significant matches found.');
  }

  return {
    isOriginal: maxSimilarity < localThreshold,
    localSimilarity,
    webSimilarity,
    maxSimilarity,
    similarContent,
    suggestions,
  };
}
