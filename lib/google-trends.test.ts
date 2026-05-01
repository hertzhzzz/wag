import { getTrends, getTrendData } from './google-trends';

describe('Google Trends API', () => {
  it('should fetch trending searches for a topic', async () => {
    const trends = await getTrends('China manufacturing', 'Australia');
    expect(trends).toBeDefined();
    expect(Array.isArray(trends)).toBe(true);
  }, 30000);

  it('should get detailed trend data', async () => {
    const data = await getTrendData('import from china');
    expect(data).toBeDefined();
  }, 30000);
});