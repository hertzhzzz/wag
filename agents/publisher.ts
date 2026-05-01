import { DraftResult } from './drafter';
import { logToFile, getLogPath, notify } from '../lib/notify';
import matter from 'gray-matter';

export interface PublishResult {
  slug: string;
  url: string;
  frontmatter: DraftResult['frontmatter'];
  wordCount: number;
  publishedAt: string;
}

export interface PublisherOptions {
  contentDir?: string;
  baseUrl?: string;
}

export class PublisherAgent {
  private contentDir: string;
  private baseUrl: string;
  private logPath: string;

  constructor(options: PublisherOptions = {}) {
    this.contentDir = options.contentDir || 'content/blog';
    this.baseUrl = options.baseUrl || 'https://www.winningadventure.com.au';
    this.logPath = getLogPath();
  }

  async publish(draft: DraftResult): Promise<PublishResult> {
    await logToFile(this.logPath, `Publisher starting for: ${draft.frontmatter.title}`, 'info');

    try {
      const slug = await this.writeMdxFile(draft);
      const url = `${this.baseUrl}/resources/${slug}`;

      await logToFile(this.logPath, `Published: ${url}`, 'info');

      // Send notification
      await notify(`Article published: ${draft.frontmatter.title}`, 'success');

      return {
        slug: `/resources/${slug}`,
        url,
        frontmatter: draft.frontmatter,
        wordCount: draft.wordCount,
        publishedAt: new Date().toISOString(),
      };
    } catch (error) {
      await logToFile(this.logPath, `Publisher failed: ${(error as Error).message}`, 'error');
      throw error;
    }
  }

  private async writeMdxFile(draft: DraftResult): Promise<string> {
    const { frontmatter, content } = draft;
    const slug = frontmatter.slug.replace(/^\/resources\//, '');

    // Build MDX frontmatter
    const fileContent = matter.stringify(content, {
      title: frontmatter.title,
      date: frontmatter.date,
      updatedDate: frontmatter.updatedDate,
      description: frontmatter.description,
      author: frontmatter.author,
      tags: frontmatter.tags,
      category: frontmatter.category,
      readTime: frontmatter.readTime,
      subtitle: frontmatter.subtitle,
      primaryKeyword: frontmatter.primaryKeyword,
      secondaryKeywords: frontmatter.secondaryKeywords,
      ctaTitle: frontmatter.ctaTitle,
      ctaText: frontmatter.ctaText,
      ctaButtonText: frontmatter.ctaButtonText,
      ctaButtonLink: frontmatter.ctaButtonLink,
      coverImage: frontmatter.coverImage,
      slug: slug,
    });

    const fs = await import('fs/promises');
    const path = await import('path');

    const filePath = path.join(process.cwd(), this.contentDir, `${slug}.mdx`);

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, fileContent, 'utf-8');

    await logToFile(this.logPath, `Wrote MDX file: ${filePath}`, 'info');

    return slug;
  }

  async unpublish(slug: string): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');

    const filePath = path.join(process.cwd(), this.contentDir, `${slug}.mdx`);

    try {
      await fs.unlink(filePath);
      await logToFile(this.logPath, `Unpublished: ${slug}`, 'info');
    } catch (error) {
      await logToFile(this.logPath, `Failed to unpublish ${slug}: ${(error as Error).message}`, 'warn');
    }
  }

  async listPublished(): Promise<string[]> {
    const fs = await import('fs/promises');
    const path = await import('path');

    const dirPath = path.join(process.cwd(), this.contentDir);

    try {
      const files = await fs.readdir(dirPath);
      return files.filter(f => f.endsWith('.mdx')).map(f => f.replace('.mdx', ''));
    } catch (error) {
      await logToFile(this.logPath, `Failed to list published: ${(error as Error).message}`, 'warn');
      return [];
    }
  }
}