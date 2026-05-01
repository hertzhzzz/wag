import { SEOPipeline } from './run';
import { KeywordLibrary } from './keywords';

// Mock the notify function to avoid sending real notifications during tests
jest.mock('../lib/notify', () => ({
  logToFile: jest.fn().mockResolvedValue(undefined),
  getLogPath: jest.fn().mockReturnValue('/tmp/test.log'),
  notify: jest.fn().mockResolvedValue(undefined),
}));

// Mock retry to succeed on first try
jest.mock('../lib/retry', () => ({
  retryWithBackoff: jest.fn((fn) => fn()),
}));

describe('SEOPipeline', () => {
  let pipeline: SEOPipeline;

  beforeEach(() => {
    pipeline = new SEOPipeline();
  });

  describe('Pipeline', () => {
    it('should initialize without errors', async () => {
      await expect(pipeline.initialize()).resolves.not.toThrow();
    });
  });

  describe('run()', () => {
    it('should return success result structure', async () => {
      // This will fail due to no actual API keys, but verifies the structure
      const result = await pipeline.run({ keyword: 'test-keyword' });

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('keyword', 'test-keyword');
      expect(result).toHaveProperty('attempts');
      expect(typeof result.attempts).toBe('number');
    });

    it('should handle empty keyword gracefully', async () => {
      const result = await pipeline.run({ keyword: '' });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('runBatch()', () => {
    it('should process multiple keywords', async () => {
      const keywords = ['keyword-1', 'keyword-2'];
      const results = await pipeline.runBatch(keywords);

      expect(results).toHaveLength(2);
      expect(results[0].keyword).toBe('keyword-1');
      expect(results[1].keyword).toBe('keyword-2');
    });
  });

  describe('runScheduled()', () => {
    it('should not throw when no keywords available', async () => {
      await expect(pipeline.runScheduled()).resolves.not.toThrow();
    });
  });
});

describe('KeywordLibrary', () => {
  let library: KeywordLibrary;

  beforeEach(() => {
    library = new KeywordLibrary({ storagePath: '/tmp/test-keywords.json' });
  });

  describe('initialize()', () => {
    it('should create storage directory if not exists', async () => {
      await expect(library.initialize()).resolves.not.toThrow();
    });
  });

  describe('addKeyword()', () => {
    it('should add keyword with partial data', async () => {
      await library.initialize();
      await library.addKeyword('test keyword', {
        searchVolume: 1000,
        source: 'manual',
      });

      const kw = await library.getKeyword('test keyword');
      expect(kw).toBeDefined();
      expect(kw?.searchVolume).toBe(1000);
    });
  });

  describe('size()', () => {
    it('should return keyword count', async () => {
      await library.initialize();
      const size = await library.size();
      expect(typeof size).toBe('number');
      expect(size).toBeGreaterThanOrEqual(0);
    });
  });
});