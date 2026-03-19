import { FeedError } from '@/error.js';
import type { Middleware } from '@/types.js';

export interface CredentialAuthMiddlewareConfig {
  tokenURL: string;
  clientId: string;
  clientSecret: string;
  scope?: string;
  grantType?: string;
  /** Authorization schema prefix. Defaults to '"Bearer"' */
  tokenType?: string;
  /** Milliseconds before actual expiry to trigger refresh. Defaukts ti 30_000 */
  refreshBuffer?: number;
}

interface OAuthTokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number | string;
}

/**
 * Automatically attach and refresh a OAuth2 client credentials token
 *
 * @param opts
 * @returns
 */
export function withClientCredentials(opts: CredentialAuthMiddlewareConfig): Middleware {
  if (!opts.tokenURL) throw new TypeError('"opts.tokenURL" is required');
  if (!opts.clientId) throw new TypeError('"opts.clientId" is required');
  if (!opts.clientSecret) throw new TypeError('"opts.clientSecret" is required');

  const refreshBuffer = opts.refreshBuffer ?? 30_000;
  let tokenType = opts.tokenType;

  let token: string | null = null;
  let expiresAt = 0;
  let refreshPromise: Promise<void> | null = null;

  async function fetchToken() {
    const body = new URLSearchParams({
      grant_type: opts.grantType ?? 'client_credentials',
      client_id: opts.clientId,
      client_secret: opts.clientSecret,
    });

    if (opts.scope) {
      body.set('scope', opts.scope);
    }

    const response = await fetch(opts.tokenURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (response.ok === false) {
      const type = response.headers.get('Content-Type')?.toLowerCase();
      if (type?.startsWith('application/json')) {
        const result = await response.json();

        throw new FeedError({
          message: response.statusText,
          status: response.status,
          ...result.error,
        });
      }

      throw new FeedError({
        message: response.statusText,
        status: response.status,
      });
    }

    const data = (await response.json()) as OAuthTokenResponse;

    token = data.access_token;

    if (data.token_type && !tokenType) {
      tokenType = data.token_type ?? 'Bearer';
    }

    const ttl = Number(data.expires_in);

    expiresAt = Date.now() + ttl * 1000 - refreshBuffer;
  }

  async function refresh() {
    refreshPromise ??= fetchToken().finally(() => {
      refreshPromise = null;
    });

    await refreshPromise;
  }

  return async (ctx, next) => {
    if (!token || Date.now() >= expiresAt) {
      await refresh();
    }

    if (!ctx.request.headers) {
      ctx.request.headers = {};
    }

    const header = `${tokenType} ${token}`;

    ctx.request.headers['Authorization'] = header;

    await next();
  };
}
