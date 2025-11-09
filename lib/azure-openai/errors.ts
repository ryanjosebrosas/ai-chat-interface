/**
 * Custom error class for Azure OpenAI errors
 */
export class AzureOpenAIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'AzureOpenAIError';
  }
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(attempt: number, config: Required<RetryConfig>): number {
  const delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt);
  return Math.min(delay, config.maxDelay);
}

/**
 * Determine if an error is retryable
 */
function isRetryableError(error: any): boolean {
  // Retry on network errors, rate limits, and server errors
  if (error?.statusCode) {
    return error.statusCode === 429 || error.statusCode >= 500;
  }
  return error?.code === 'ECONNRESET' || error?.code === 'ETIMEDOUT';
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === retryConfig.maxRetries || !isRetryableError(error)) {
        throw error;
      }

      const delay = calculateDelay(attempt, retryConfig);
      console.warn(
        `Azure OpenAI request failed (attempt ${attempt + 1}/${retryConfig.maxRetries + 1}). ` +
          `Retrying in ${delay}ms...`,
        error
      );

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Error handler middleware for Azure OpenAI operations
 */
export function handleAzureOpenAIError(error: any): never {
  if (error?.status) {
    throw new AzureOpenAIError(
      error.message || 'Azure OpenAI request failed',
      error.status,
      error.code
    );
  }

  if (error instanceof AzureOpenAIError) {
    throw error;
  }

  throw new AzureOpenAIError(
    error?.message || 'Unknown Azure OpenAI error',
    undefined,
    error?.code
  );
}
