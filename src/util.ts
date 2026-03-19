import { FeedError } from './error';
import type { Middleware, MiddlewareContext } from './types';

/**
 * Execute a middleware chain in an onion (koa) like manner
 */
export function runMiddleware(
  middleware: Middleware[],
  ctx: MiddlewareContext,
  core: Parameters<Middleware>[1],
): Promise<void> | void {
  function peel(i: number): Promise<void> | void {
    if (i < middleware.length) {
      return middleware[i]!(ctx, () => peel(i + 1));
    }

    return core();
  }

  return peel(0);
}

/**
 * Execute the HTTP fetch and populate `ctx.response`
 *
 * @param ctx Middleware context
 */
export async function fetcher(ctx: MiddlewareContext): Promise<void> {
  // All request should have a content type set
  if (!ctx.request.headers) {
    ctx.request.headers = {};
  }

  if (typeof ctx.request.headers?.['Accept'] !== 'string') {
    ctx.request.headers['Accept'] = ctx.request.path === '$metadata' ? 'application/xml' : 'application/json';
  }

  let url = new globalThis.URL(ctx.request.path, ctx.request.baseURL);

  if (typeof ctx.request.query === 'string') {
    url.search = ctx.request.query;
  } else if (typeof ctx.request.query === 'object') {
    for (const [key, value] of Object.entries(ctx.request.query)) {
      url.searchParams.set(key, value);
    }
  }

  const response = await globalThis.fetch(url, {
    method: 'GET',
    headers: ctx.request.headers,
    signal: ctx.request.signal,
  });

  let data: unknown;

  const type = response.headers.get('Content-Type')?.toLowerCase();

  if (type?.startsWith('application/json')) {
    const result = await response.json();

    if (!response.ok || 'error' in result) {
      throw new FeedError({
        message: response.statusText,
        status: response.status,
        ...result.error,
      });
    }

    data = normalizeODataResponse(result);
  } else if (type?.startsWith('text/plain') || type?.startsWith('text/html') || type?.startsWith('application/xml')) {
    const result = await response.text();
    if (!response.ok) {
      throw new FeedError({
        message: response.statusText,
        status: response.status,
      });
    }

    data = result;
  } else if (response.status === 204) {
    throw new FeedError({
      message: response.statusText,
      status: response.status,
    });
  } else {
    throw new Error(`"${type ?? 'unknown'}" content type is not supported`);
  }

  let headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  ctx.response = {
    headers,
    data,
  };
}

/**
 * Normalize an entity/collection odata response into a unified shape
 *
 * - `@odata.*` keys are stripped of the prefix
 * - `value` is mapped to `data` (collection responses)
 * - Remaining keys are collected into `data` (entity responses)
 */
export function normalizeODataResponse(result: Record<string, unknown>): Record<string, unknown> {
  const payload: Record<string, any> = {};

  for (const [key, value] of Object.entries(result)) {
    if (key.startsWith('@odata.')) {
      payload[key.slice(7)] = value;
    } else if (key === 'value') {
      payload['data'] = value;
    } else {
      if (!payload['data']) {
        payload['data'] = {};
      }

      payload['data'][key] = value;
    }
  }

  return payload;
}
