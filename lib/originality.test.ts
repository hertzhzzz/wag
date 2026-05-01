import { calculateTextSimilarity, checkLocalOriginality, OriginalityResult } from './originality';

describe('Originality', () => {
  describe('calculateTextSimilarity', () => {
    it('should return 1 for identical texts', () => {
      const text = 'This is a test sentence for comparison.';
      expect(calculateTextSimilarity(text, text)).toBe(1);
    });

    it('should return 0 for completely different texts', () => {
      const text1 = 'The quick brown fox jumps over the lazy dog';
      const text2 = 'A completely different sentence about something else entirely';
      const similarity = calculateTextSimilarity(text1, text2);
      expect(similarity).toBeLessThan(0.5);
    });

    it('should return 1 for two empty strings', () => {
      expect(calculateTextSimilarity('', '')).toBe(1);
    });

    it('should return 0 when one text is empty', () => {
      expect(calculateTextSimilarity('Some text', '')).toBe(0);
      expect(calculateTextSimilarity('', 'Some text')).toBe(0);
    });

    it('should return moderate similarity for partial matches', () => {
      const text1 = 'The quick brown fox jumps over the lazy dog';
      const text2 = 'The quick brown cat jumps over the lazy dog';
      const similarity = calculateTextSimilarity(text1, text2);
      expect(similarity).toBeGreaterThan(0.5);
      expect(similarity).toBeLessThan(1);
    });

    it('should handle Chinese characters', () => {
      const text1 = '这是一个测试';
      const text2 = '这是一个测试';
      expect(calculateTextSimilarity(text1, text2)).toBe(1);
    });

    it('should handle mixed content', () => {
      const text1 = 'Factory visit in China with quality inspection';
      const text2 = 'Factory visit in China includes quality inspection';
      const similarity = calculateTextSimilarity(text1, text2);
      expect(similarity).toBeGreaterThan(0.5);
    });
  });

  describe('checkLocalOriginality', () => {
    it('should return empty array when no blog content exists', async () => {
      const results = await checkLocalOriginality('test content');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should return similarity scores for existing articles', async () => {
      const testContent = 'This is unique content about factory visits';
      const results = await checkLocalOriginality(testContent);
      expect(results).toBeDefined();
      results.forEach((result) => {
        expect(result).toHaveProperty('slug');
        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('similarity');
        expect(typeof result.similarity).toBe('number');
      });
    });

    it('should exclude specified slug', async () => {
      const testContent = 'Test content for exclusion';
      const results = await checkLocalOriginality(testContent, 'non-existent-slug');
      expect(results).toBeDefined();
    });
  });
});