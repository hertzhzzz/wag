import { retryWithBackoff } from './retry';

describe('retryWithBackoff', () => {
  it('should retry failed operation 5 times with exponential backoff', async () => {
    let attempts = 0;
    const operation = async () => {
      attempts++;
      if (attempts < 5) throw new Error(`Attempt ${attempts} failed`);
      return 'success';
    };

    const result = await retryWithBackoff(operation, 'test-operation');
    expect(result).toBe('success');
    expect(attempts).toBe(5);
  });

  it('should throw after 5 failed attempts', async () => {
    let attempts = 0;
    const operation = async () => {
      attempts++;
      throw new Error(`Attempt ${attempts} failed`);
    };

    await expect(retryWithBackoff(operation, 'test-fail')).rejects.toThrow('Attempt 5 failed');
    expect(attempts).toBe(5);
  });
});