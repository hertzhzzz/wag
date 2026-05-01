import { detectAI, AIAnalysis } from './ai-detector';

describe('AI Detector', () => {
  it('should analyze text for AI indicators', async () => {
    const result = await detectAI('Sample text to analyze');
    expect(result).toBeDefined();
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('should return detailed metrics', async () => {
    const result = await detectAI('Test content');
    expect(result.burstiness).toBeDefined();
    expect(result.perplexity).toBeDefined();
    expect(result.hedgingRatio).toBeDefined();
  });

  it('should flag low burstiness as AI-like', async () => {
    const uniformText = 'This is a test. This is a test. This is a test. This is a test.';
    const result = await detectAI(uniformText);
    expect(result.score).toBeGreaterThan(30); // Uniform text = higher AI score
  });
});