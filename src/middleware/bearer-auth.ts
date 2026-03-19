import type { Middleware } from '@/types.js';

export interface BearerAuthMiddlewareConfig {
  tokenType?: string;
  token: string;
}

/**
 * Attach a static bearer token to each request
 *
 * @param opts
 */
export function withBearerAuth(opts: BearerAuthMiddlewareConfig): Middleware {
  if (typeof opts.token !== 'string') {
    throw new TypeError('"opts.token" must be a string');
  }

  const header = `${opts.tokenType ?? 'Bearer'} ${opts.token}`;

  return async (ctx, next) => {
    if (!ctx.request.headers) {
      ctx.request.headers = {};
    }

    ctx.request.headers['Authorization'] = header;

    await next();
  };
}
