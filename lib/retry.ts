export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  operationName: string,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 5, baseDelayMs = 1000, onRetry } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      const delay = baseDelayMs * Math.pow(2, attempt - 1);

      if (onRetry) {
        onRetry(attempt, lastError);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

export function createRetryLogger(logPath: string): (attempt: number, error: Error) => void {
  return (attempt: number, error: Error) => {
    const fs = require('fs');
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] Retry ${attempt}: ${error.message}\n`;
    fs.appendFileSync(logPath, logEntry);
  };
}