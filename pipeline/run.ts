import { ResearcherAgent } from '../agents/researcher';
import { DrafterAgent } from '../agents/drafter';
import { PublisherAgent } from '../agents/publisher';
import { KeywordLibrary } from './keywords';
import { logToFile, getLogPath, notify } from '../lib/notify';
import { retryWithBackoff } from '../lib/retry';

export interface PipelineConfig {
  keyword: string;
  maxRewrites?: number;
  publishAfterGenerate?: boolean;
}

export interface PipelineResult {
  success: boolean;
  keyword: string;
  slug?: string;
  url?: string;
  wordCount?: number;
  aiScore?: number;
  originalityScore?: number;
  error?: string;
  attempts: number;
}

export class SEOPipeline {
  private keywordLibrary: KeywordLibrary;
  private logPath: string;

  constructor() {
    this.keywordLibrary = new KeywordLibrary();
    this.logPath = getLogPath();
  }

  async initialize(): Promise<void> {
    await this.keywordLibrary.initialize();
    await logToFile(this.logPath, 'SEOPipeline initialized', 'info');
  }

  async run(config: PipelineConfig): Promise<PipelineResult> {
    const { keyword, maxRewrites = 3, publishAfterGenerate = true } = config;

    await logToFile(this.logPath, `Pipeline starting for keyword: ${keyword}`, 'info');

    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < maxRewrites) {
      attempts++;

      try {
        // Step 1: Research
        await logToFile(this.logPath, `Research phase starting (attempt ${attempts})`, 'info');

        const researcher = new ResearcherAgent({ keyword });
        const research = await retryWithBackoff(
          () => researcher.research(),
          `Research for: ${keyword}`
        );

        await logToFile(this.logPath, `Research completed for: ${keyword}`, 'info');

        // Step 2: Draft
        await logToFile(this.logPath, `Drafting phase starting`, 'info');

        const drafter = new DrafterAgent({ research, style: 'guide' });
        const draft = await retryWithBackoff(
          () => drafter.generate({ maxRewrites: 1 }),
          `Draft for: ${keyword}`
        );

        await logToFile(this.logPath, `Draft completed - AI: ${draft.aiScore}, Originality: ${draft.originalityScore}`, 'info');

        // Step 3: Publish (if quality passed)
        if (publishAfterGenerate && draft.qualityPassed) {
          await logToFile(this.logPath, `Publishing: ${draft.frontmatter.title}`, 'info');

          const publisher = new PublisherAgent();
          const result = await retryWithBackoff(
            () => publisher.publish(draft),
            `Publish: ${draft.frontmatter.title}`
          );

          // Mark keyword as processed
          await this.keywordLibrary.markProcessed(keyword);

          await logToFile(this.logPath, `Pipeline SUCCESS: ${result.url}`, 'info');
          await notify(`Article published: ${draft.frontmatter.title}`, 'success');

          return {
            success: true,
            keyword,
            slug: result.slug,
            url: result.url,
            wordCount: draft.wordCount,
            aiScore: draft.aiScore,
            originalityScore: draft.originalityScore,
            attempts,
          };
        } else if (!draft.qualityPassed) {
          lastError = new Error(`Quality gates failed: AI=${draft.aiScore}, Originality=${draft.originalityScore}`);
          await logToFile(this.logPath, `Quality gates failed: ${lastError.message}`, 'warn');
        }

        break; // Success or quality failed, don't retry
      } catch (error) {
        lastError = error as Error;
        await logToFile(this.logPath, `Pipeline attempt ${attempts} failed: ${lastError.message}`, 'warn');
      }
    }

    // All retries exhausted
    const errorMsg = lastError?.message || 'Pipeline failed after max retries';
    await logToFile(this.logPath, `Pipeline FAILED: ${errorMsg}`, 'error');
    await notify(`Pipeline failed for "${keyword}": ${errorMsg}`, 'error');

    return {
      success: false,
      keyword,
      error: errorMsg,
      attempts,
    };
  }

  async runBatch(keywords: string[]): Promise<PipelineResult[]> {
    const results: PipelineResult[] = [];

    for (const keyword of keywords) {
      try {
        const result = await this.run({ keyword });
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          keyword,
          error: (error as Error).message,
          attempts: 0,
        });
      }
    }

    return results;
  }

  async runScheduled(): Promise<void> {
    await this.initialize();

    // Get unprocessed keywords
    const keywords = await this.keywordLibrary.getUnprocessedKeywords(5);

    if (keywords.length === 0) {
      await logToFile(this.logPath, 'No unprocessed keywords found', 'info');
      return;
    }

    await logToFile(this.logPath, `Found ${keywords.length} keywords to process`, 'info');

    for (const kw of keywords) {
      try {
        await this.run({ keyword: kw.keyword });
      } catch (error) {
        await logToFile(this.logPath, `Scheduled run failed for ${kw.keyword}: ${(error as Error).message}`, 'error');
      }
    }

    await notify(`Scheduled pipeline completed. Processed ${keywords.length} keywords.`, 'info');
  }
}

// CLI entry point
async function main() {
  const keyword = process.argv[2];

  if (!keyword) {
    console.error('Usage: npx ts-node pipeline/run.ts <keyword>');
    process.exit(1);
  }

  const pipeline = new SEOPipeline();
  await pipeline.initialize();

  const result = await pipeline.run({ keyword });

  if (result.success) {
    console.log(`✓ Published: ${result.url}`);
    process.exit(0);
  } else {
    console.error(`✗ Failed: ${result.error}`);
    process.exit(1);
  }
}

main().catch(console.error);