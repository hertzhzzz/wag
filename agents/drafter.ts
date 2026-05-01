import { ResearchResult } from './researcher';
import { detectAI } from '../lib/ai-detector';
import { checkOriginality } from '../lib/originality';
import { retryWithBackoff } from '../lib/retry';
import { logToFile, getLogPath } from '../lib/notify';

export interface DraftResult {
  frontmatter: Frontmatter;
  content: string;
  wordCount: number;
  aiScore: number;
  originalityScore: number;
  qualityPassed: boolean;
}

export interface Frontmatter {
  title: string;
  seoTitle: string;
  description: string;
  category: string;
  author: string;
  date: string;
  updatedDate: string;
  readTime: string;
  subtitle: string;
  desc: string;
  slug: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  tags: string[];
  ctaTitle: string;
  ctaText: string;
  ctaButtonText: string;
  ctaButtonLink: string;
  coverImage: string;
}

export interface DrafterOptions {
  research: ResearchResult;
  style?: 'informative' | 'guide' | 'comparison';
}

export class DrafterAgent {
  private research: ResearchResult;
  private style: DrafterOptions['style'];
  private logPath: string;

  constructor(options: DrafterOptions) {
    this.research = options.research;
    this.style = options.style || 'guide';
    this.logPath = getLogPath();
  }

  async generate(options: { maxRewrites?: number } = {}): Promise<DraftResult> {
    const { maxRewrites = 3 } = options;

    await logToFile(this.logPath, `Drafter starting for: ${this.research.keyword}`, 'info');

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRewrites; attempt++) {
      try {
        const draft = await this.generateDraft();

        // Quality checks
        const [aiScore, originalityScore] = await Promise.all([
          this.checkQuality(draft.content),
          this.checkOriginality(draft.content),
        ]);

        const qualityPassed = aiScore < 30 && originalityScore > 80;

        await logToFile(this.logPath, `Draft attempt ${attempt} - AI: ${aiScore}, Originality: ${originalityScore}`, 'info');

        if (qualityPassed) {
          return {
            ...draft,
            aiScore,
            originalityScore,
            qualityPassed: true,
          };
        }

        lastError = new Error(`Quality check failed: AI=${aiScore}, Originality=${originalityScore}`);
      } catch (error) {
        lastError = error as Error;
        await logToFile(this.logPath, `Draft attempt ${attempt} failed: ${lastError.message}`, 'warn');
      }
    }

    throw lastError || new Error('Draft generation failed after max rewrites');
  }

  private async generateDraft(): Promise<Omit<DraftResult, 'aiScore' | 'originalityScore' | 'qualityPassed'>> {
    const keyword = this.research.keyword;
    const exaData = this.research.exaResults;
    const papers = this.research.papers;

    const sections = this.buildSections(keyword, exaData, papers);
    const content = sections.join('\n\n');
    const wordCount = content.split(/\s+/).length;

    const frontmatter = this.buildFrontmatter(keyword, wordCount);

    return {
      frontmatter,
      content,
      wordCount,
    };
  }

  private buildSections(keyword: string, exaData: any[], papers: any[]): string[] {
    const sections: string[] = [];

    sections.push(this.buildIntro(keyword, exaData));
    sections.push(this.buildMainContent(keyword, exaData));
    sections.push(this.buildCaseStudies(exaData));

    if (papers.length > 0) {
      sections.push(this.buildReferences(papers));
    }

    sections.push(this.buildPracticalGuide(keyword, exaData));
    sections.push(this.buildConclusion(keyword));

    return sections;
  }

  private buildIntro(keyword: string, data: any[]): string {
    const example = data[0];
    const snippet = example?.snippet || '';

    return `## Introduction

If you're an Australian business owner considering sourcing from China, you've probably wondered about ${keyword.toLowerCase()}. I get asked about this a lot, and honestly the answer isn't as simple as most guides make it sound.

Here's what I've found after looking into this properly: working directly with Chinese manufacturers can genuinely cut your costs by 20-40%, but only if you know what you're doing. ${snippet.slice(0, 150)}...

In this guide, I'm going to walk you through the real considerations, not the textbook version.`;
  }

  private buildMainContent(keyword: string, data: any[]): string {
    return `## What Most People Get Wrong About ${keyword}

There's a lot of bad advice out there. Most guides are written for big corporations with dedicated sourcing teams. For SME owners like you, the calculus is different.

**The biggest misconception?** That you need to be in China to make this work. You don't. But you do need the right support structure, and that's where WAG comes in.

Here's the thing — in my experience working with businesses across Australia, the companies that succeed with Chinese manufacturing aren't the ones with the biggest budgets. They're the ones who approach it systematically.`;
  }

  private buildCaseStudies(data: any[]): string {
    if (data.length === 0) return '';

    const cases = data.slice(0, 2).map((d, i) => {
      return `- **[${d.title}](${d.url})**: ${d.snippet.slice(0, 200)}...`;
    }).join('\n');

    return `## Real Examples from the Field

I think it's useful to look at what's actually working. Based on recent developments:

${cases}

These aren't cherry-picked success stories. They're representative of what proper factory engagement looks like in 2026.`;
  }

  private buildReferences(papers: any[]): string {
    const refs = papers.slice(0, 3).map((p, i) => {
      return `${i + 1}. [${p.title}](${p.url}) — ${p.authors?.join(', ') || 'Unknown'}, ${p.year || 'Recent'}`;
    }).join('\n');

    return `## What the Research Says

For those who want to dig deeper into the evidence:

${refs}

I find it reassuring that the academic literature supports what we're seeing in practice.`;
  }

  private buildPracticalGuide(keyword: string, data: any[]): string {
    return `## How to Actually Do This

Let me cut through the theory. Here's what working looks like:

**Step 1: Define your requirements clearly**

Before you start reaching out to factories, know exactly what you need. Specifications, quality tolerances, packaging requirements. Vague requests get vague results.

**Step 2: Get professional verification**

This is non-negotiable. Hire someone to visit the factory before you commit. WAG arranges this as part of our standard service.

**Step 3: Negotiate in person when possible**

Email negotiations work for commodities. For ${keyword.toLowerCase()}, you want someone on the ground who speaks the language and understands the culture.

**The process typically takes 6-8 weeks from first contact to sample approval.**`;
  }

  private buildConclusion(keyword: string): string {
    return `## Final Thoughts

I won't pretend this is simple. ${keyword} requires real investment in relationship-building and quality control. But for businesses that do it right, the rewards are substantial.

If you're serious about exploring this option, I'd suggest starting with a consultation. No obligation, just a conversation about whether this approach makes sense for your business.

WAG offers free initial consultations for qualifying Australian businesses. We're happy to walk through your specific situation and give you an honest assessment.`;
  }

  private buildFrontmatter(keyword: string, wordCount: number): Frontmatter {
    const date = new Date().toISOString().split('T')[0];
    const slug = keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const readTime = Math.ceil(wordCount / 200) + ' min read';

    return {
      title: `${keyword}: The Complete Guide for Australian Businesses`,
      seoTitle: `${keyword} Guide 2026 | WAG`,
      description: `Learn how Australian businesses are successfully navigating ${keyword.toLowerCase()}. Expert insights, real examples, and practical steps.`,
      category: 'China Sourcing',
      author: 'Mark He',
      date,
      updatedDate: date,
      readTime,
      subtitle: 'A practical guide for SME owners',
      desc: `Comprehensive guide covering ${keyword.toLowerCase()} for Australian businesses.`,
      slug: `/resources/${slug}`,
      primaryKeyword: keyword,
      secondaryKeywords: this.generateSecondaryKeywords(keyword),
      tags: this.generateTags(keyword),
      ctaTitle: 'Ready to explore factory visits?',
      ctaText: 'Get a free consultation about your China sourcing needs.',
      ctaButtonText: 'Book Free Consultation',
      ctaButtonLink: 'https://www.winningadventure.com.au/enquiry',
      coverImage: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80',
    };
  }

  private generateSecondaryKeywords(primary: string): string[] {
    const base = primary.toLowerCase();
    return [
      `${base} for small business`,
      `Australia ${base}`,
      `China manufacturing guide`,
      `factory visit tips`,
    ];
  }

  private generateTags(primary: string): string[] {
    return ['China sourcing', 'Manufacturing', 'Guide', 'Australia'];
  }

  private async checkQuality(content: string): Promise<number> {
    const result = await detectAI(content);
    return result.score;
  }

  private async checkOriginality(content: string): Promise<number> {
    // Title is approximate since we don't have it at this point
    const result = await checkOriginality(content, {
      title: 'Generated Content',
      localThreshold: 0.2,
      webThreshold: 0.3,
    });
    // Convert to score: isOriginal=true means 100, maxSimilarity=1 means 0
    const score = result.isOriginal ? 95 : Math.round((1 - result.maxSimilarity) * 100);
    return score;
  }
}