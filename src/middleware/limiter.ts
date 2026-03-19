import type { Middleware } from '@/types';

export type RESOProviders = 'bridge' | 'mlsgrid' | 'trestle' | 'spark';

export type RateLimitMiddlewareConfig =
  | {
      /** Maximum request per interval. Defaults to 100 */
      points?: number;
      /** Interval duration in milliseconds. Defaults to 60_000 */
      duration?: number;
    }
  | {
      /** Specify provider to use smart defaults */
      provider: RESOProviders;
    };

const providers = new Map<RESOProviders, number>([
  ['bridge', 334],
  ['spark', 300],
  ['mlsgrid', 120],
  ['trestle', 600],
]);

/**
 * Rate limits outgoing requests. Requires `p-ratelimit` optional dependency
 *
 * @param opts
 */
export function withRateLimit(opts?: RateLimitMiddlewareConfig): Middleware {
  let duration = 60_000;
  let points = 100;

  if (opts) {
    if ('points' in opts || 'duration' in opts) {
      if (opts.points) points = opts.points;
      if (opts.duration) duration = opts.duration;
    } else if ('provider' in opts) {
      let providerPoints = providers.get(opts.provider);

      if (!providerPoints) {
        throw new Error(
          `"${opts.provider}" is not a supported provider. Valid providers are "bridge", "mlsgrid", "trestle" or "spark"`,
        );
      }

      points = providerPoints;
    }
  }

  let limiter: <T>(fn: () => Promise<T>) => Promise<T>;
  async function useLimiter() {
    if (limiter) return limiter;

    const { pRateLimit } = await import('p-ratelimit');

    limiter = pRateLimit({
      interval: duration,
      rate: points,
      concurrency: 1,
    });

    return limiter;
  }

  return async (ctx, next) => {
    const limiter = await useLimiter();

    await limiter(async () => next());
  };
}
