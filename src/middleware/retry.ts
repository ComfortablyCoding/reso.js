import type { Middleware } from '@/types.js';

export interface RetryMiddlewareConfig {
  /** Maximum number of attempts. Defaults to 3  */
  maxRetries?: number;
  /** HTTP status code to trigger a retry on. Defaults to 429 */
  retryableStatuses?: number[];
}

/**
 * Retry failed requests
 *
 * @param opts
 */
export function withRetry(opts?: RetryMiddlewareConfig): Middleware {
  const maxRetries = opts?.maxRetries ?? 3;

  return async (_, next) => {
    let lastError: unknown;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await next();
        return;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  };
}
