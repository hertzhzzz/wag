import { searchPapers, PaperResult } from './scholar';

describe('Semantic Scholar API', () => {
  it('should search for academic papers', async () => {
    const papers = await searchPapers('China manufacturing quality', { limit: 5 });
    expect(papers).toBeDefined();
    expect(Array.isArray(papers)).toBe(true);
  }, 30000);

  it('should return paper metadata', async () => {
    const papers = await searchPapers('supply chain China', { limit: 3 });
    if (papers.length > 0) {
      expect(papers[0].title).toBeDefined();
      expect(papers[0].authors).toBeDefined();
    }
  }, 30000);
});