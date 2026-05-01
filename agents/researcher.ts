import { searchExa, ExaResult } from '../lib/exa';
import { searchPapers, PaperResult } from '../lib/scholar';
import { retryWithBackoff } from '../lib/retry';
import { logToFile, getLogPath } from '../lib/notify';

export interface ResearchResult {
  keyword: string;
  exaResults: ExaResult[];
  papers: PaperResult[];
  competitorContent: CompetitorContent[];
  timestamp: string;
}

export interface CompetitorContent {
  url: string;
  title: string;
  keyPoints: string[];
}

export interface ResearcherOptions {
  keyword: string;
  numExaResults?: number;
  numPapers?: number;
  competitors?: string[];
}

export class ResearcherAgent {
  private keyword: string;
  private numExaResults: number;
  private numPapers: number;
  private competitors: string[];
  private logPath: string;

  constructor(options: ResearcherOptions) {
    this.keyword = options.keyword;
    this.numExaResults = options.numExaResults || 10;
    this.numPapers = options.numPapers || 5;
    this.competitors = options.competitors || [];
    this.logPath = getLogPath();
  }

  async research(): Promise<ResearchResult> {
    await logToFile(this.logPath, `Researcher starting for: ${this.keyword}`, 'info');

    const [exaResults, papers, competitorContent] = await Promise.all([
      this.researchWithExa(),
      this.researchWithScholar(),
      this.researchCompetitors(),
    ]);

    await logToFile(this.logPath, `Researcher completed for: ${this.keyword}`, 'info', {
      exaResults: exaResults.length,
      papers: papers.length,
      competitors: competitorContent.length,
    });

    return {
      keyword: this.keyword,
      exaResults,
      papers,
      competitorContent,
      timestamp: new Date().toISOString(),
    };
  }

  private async researchWithExa(): Promise<ExaResult[]> {
    const operation = async () => {
      const results = await searchExa(this.keyword, {
        numResults: this.numExaResults,
        maxAgeHours: 4380, // 6 months
      });
      return results;
    };

    return retryWithBackoff(operation, `Exa research: ${this.keyword}`);
  }

  private async researchWithScholar(): Promise<PaperResult[]> {
    const operation = async () => {
      const papers = await searchPapers(this.keyword, {
        limit: this.numPapers,
      });
      return papers;
    };

    try {
      return await retryWithBackoff(operation, `Scholar research: ${this.keyword}`);
    } catch (error) {
      await logToFile(this.logPath, `Scholar research failed: ${(error as Error).message}`, 'warn');
      return []; // Graceful degradation
    }
  }

  private async researchCompetitors(): Promise<CompetitorContent[]> {
    const results: CompetitorContent[] = [];

    for (const competitor of this.competitors) {
      try {
        const { findSimilar } = await import('../lib/exa');
        const similarPages = await retryWithBackoff(
          () => findSimilar(competitor, { numResults: 3 }),
          `Competitor research: ${competitor}`
        );

        results.push({
          url: competitor,
          title: similarPages[0]?.title || competitor,
          keyPoints: similarPages.map(p => p.snippet).slice(0, 3),
        });
      } catch (error) {
        await logToFile(this.logPath, `Competitor research failed: ${competitor}`, 'warn');
      }
    }

    return results;
  }
}