import { Feed } from './feed';
import type { FeedConfig } from './types';

export function createFeed<Schema = any>(config: FeedConfig): Feed<Schema> {
  if (!config.http.baseURL || globalThis.URL.canParse(config.http.baseURL) === false) {
    throw new TypeError('"opts.http.baseURL" must be a valid URL');
  }

  return new Feed<Schema>(config);
}
