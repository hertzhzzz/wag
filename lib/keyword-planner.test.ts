import { getKeywordIdeas, KeywordIdea } from './keyword-planner';

describe('Keyword Planner API', () => {
  it('should fetch keyword ideas', async () => {
    const ideas = await getKeywordIdeas('factory visit China');
    expect(ideas).toBeDefined();
    expect(Array.isArray(ideas)).toBe(true);
  }, 30000);
});