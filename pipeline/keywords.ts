import { logToFile, getLogPath } from '../lib/notify';

export interface KeywordData {
  keyword: string;
  searchVolume?: number;
  competition?: 'low' | 'medium' | 'high';
  trends?: number[]; // last 12 months
  relatedKeywords?: string[];
  discoveredAt: string;
  source: 'google_trends' | 'keyword_planner' | 'manual' | 'competitor';
}

export interface KeywordLibraryOptions {
  storagePath?: string;
  minSearchVolume?: number;
}

export class KeywordLibrary {
  private keywords: Map<string, KeywordData> = new Map();
  private storagePath: string;
  private minSearchVolume: number;
  private logPath: string;

  constructor(options: KeywordLibraryOptions = {}) {
    this.storagePath = options.storagePath || 'data/keywords.json';
    this.minSearchVolume = options.minSearchVolume || 100;
    this.logPath = getLogPath();
  }

  async initialize(): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');

      const dirPath = path.dirname(this.storagePath);
      await fs.mkdir(dirPath, { recursive: true });

      try {
        const data = await fs.readFile(this.storagePath, 'utf-8');
        const parsed = JSON.parse(data) as KeywordData[];
        parsed.forEach(kw => this.keywords.set(kw.keyword, kw));
        await logToFile(this.logPath, `Loaded ${this.keywords.size} keywords from storage`, 'info');
      } catch {
        await logToFile(this.logPath, 'No existing keyword storage found, starting fresh', 'info');
      }
    } catch (error) {
      await logToFile(this.logPath, `KeywordLibrary init failed: ${(error as Error).message}`, 'warn');
    }
  }

  async addKeyword(keyword: string, data: Partial<KeywordData>): Promise<void> {
    const existing = this.keywords.get(keyword);

    const keywordData: KeywordData = {
      keyword,
      searchVolume: data.searchVolume ?? existing?.searchVolume,
      competition: data.competition ?? existing?.competition,
      trends: data.trends ?? existing?.trends,
      relatedKeywords: data.relatedKeywords ?? existing?.relatedKeywords,
      discoveredAt: existing?.discoveredAt || new Date().toISOString(),
      source: data.source || 'manual',
    };

    this.keywords.set(keyword, keywordData);
    await this.persist();
  }

  async addKeywords(keywords: Array<{ keyword: string; data: Partial<KeywordData> }>): Promise<void> {
    for (const { keyword, data } of keywords) {
      await this.addKeyword(keyword, data);
    }
  }

  async getKeyword(keyword: string): Promise<KeywordData | undefined> {
    return this.keywords.get(keyword);
  }

  async getKeywordsBySource(source: KeywordData['source']): Promise<KeywordData[]> {
    return Array.from(this.keywords.values()).filter(kw => kw.source === source);
  }

  async getUnprocessedKeywords(limit: number = 10): Promise<KeywordData[]> {
    const processed = await this.getProcessedKeywords();
    const processedSet = new Set(processed);

    return Array.from(this.keywords.values())
      .filter(kw => !processedSet.has(kw.keyword))
      .slice(0, limit);
  }

  async getProcessedKeywords(): Promise<string[]> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const processedPath = path.join(path.dirname(this.storagePath), 'processed-keywords.txt');

      const content = await fs.readFile(processedPath, 'utf-8');
      return content.split('\n').filter(Boolean);
    } catch {
      return [];
    }
  }

  async markProcessed(keyword: string): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const processedPath = path.join(path.dirname(this.storagePath), 'processed-keywords.txt');

      await fs.appendFile(processedPath, `${keyword}\n`, 'utf-8');
    } catch (error) {
      await logToFile(this.logPath, `Failed to mark ${keyword} as processed: ${(error as Error).message}`, 'warn');
    }
  }

  async getTopKeywords(limit: number = 20): Promise<KeywordData[]> {
    return Array.from(this.keywords.values())
      .filter(kw => (kw.searchVolume || 0) >= this.minSearchVolume)
      .sort((a, b) => (b.searchVolume || 0) - (a.searchVolume || 0))
      .slice(0, limit);
  }

  async getRecentKeywords(days: number = 7): Promise<KeywordData[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return Array.from(this.keywords.values())
      .filter(kw => new Date(kw.discoveredAt) >= cutoff)
      .sort((a, b) => new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime());
  }

  private async persist(): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const data = JSON.stringify(Array.from(this.keywords.values()), null, 2);
      await fs.writeFile(this.storagePath, data, 'utf-8');
    } catch (error) {
      await logToFile(this.logPath, `Failed to persist keywords: ${(error as Error).message}`, 'error');
    }
  }

  async size(): Promise<number> {
    return this.keywords.size;
  }
}