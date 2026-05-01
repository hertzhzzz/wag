import { searchExa, findSimilar, SearchOptions } from './exa';

describe('Exa API', () => {
  const testQuery = 'China factory visit Australia';

  it('should search for relevant content', async () => {
    const results = await searchExa(testQuery, { numResults: 5 });
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
  }, 30000);

  it('should find similar pages', async () => {
    const results = await findSimilar(
      'https://www.winningadventure.com.au/services',
      { numResults: 3 }
    );
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
  }, 30000);
});