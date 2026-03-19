import { FeedError } from '@/error.js';
import type { Middleware } from '@/types.js';

export interface RetryMiddlewareConfig {
  /** Maximum number of attempts. Defaults to 3 */
  maxRetries?: number;
  /** HTTP status codes to trigger a retry on. Defaults to [429] */
  retryableStatuses?: number[];
  /** Base delay in ms for exponential backoff. Defaults to 1000 */
  baseDelay?: number;
}

/**
 * Retry failed requests with exponential backoff
 *
 * @param opts
 */
export function withRetry(opts?: RetryMiddlewareConfig): Middleware {
  const maxRetries = opts?.maxRetries ?? 3;
  const retryableStatuses = opts?.retryableStatuses ?? [429];
  const baseDelay = opts?.baseDelay ?? 1000;

  return async (_, next) => {
    let lastError: unknown;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await next();
        return;
      } catch (error) {
        lastError = error;

        const isRetryable = error instanceof FeedError && retryableStatuses.includes(error.status);
        if (!isRetryable) throw error;

        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, baseDelay * 2 ** attempt));
        }
      }
    }

    throw lastError;
  };
}
