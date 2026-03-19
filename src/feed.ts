import type {
  ExtractResource,
  FeedCollectionResponse,
  FeedConfig,
  FeedEntityResourceId,
  FeedEntityResponse,
  FeedHttpConfig,
  FeedMetadataResponse,
  IsAny,
  Middleware,
  MiddlewareContext,
  RequestOptions,
  ResourceOptions,
} from './types.js';
import { fetcher, runMiddleware } from './util.js';

export class Feed<Schema> {
  #http: FeedHttpConfig;
  #middleware: Middleware[];
  constructor(config: FeedConfig) {
    this.#http = config.http;
    this.#middleware = [...(config.middleware ?? [])];
  }

  /**
   * Fetch the OData $metadata.
   *
   * @param [options] Request options
   * @returns The raw metadata XML document
   */
  $metadata(options?: ResourceOptions): Promise<FeedMetadataResponse> {
    return this.request<FeedMetadataResponse>('$metadata', options);
  }

  /**
   * Fetch a single resource entity by its unique ID.
   *
   * @param resource The name of the resource collection.
   * @param id The unique identifier for the specific entity.
   * @param [options] Request options
   * @returns The entity
   */
  async readById<R extends IsAny<Schema, string, keyof Schema & string>>(
    resource: R,
    id: FeedEntityResourceId,
    options?: ResourceOptions,
  ): Promise<FeedEntityResponse<ExtractResource<Schema, R>>> {
    const resourceId = `(${typeof id === 'string' ? `'${id}'` : id})`;

    return this.request<FeedEntityResponse<ExtractResource<Schema, R>>>(`${resource + resourceId}`, options);
  }

  /**
   * Fetch a resource collection.
   *
   * Yields a response per page, automatically following `@odata.nextLink` until exhausted
   *
   * @param resource The name of the resource collection.
   * @param [options]  Request options
   * @yields paginated collection responses.
   */
  async *readByQuery<R extends IsAny<Schema, string, keyof Schema & string>>(
    resource: R,
    options?: ResourceOptions,
  ): AsyncGenerator<FeedCollectionResponse<ExtractResource<Schema, R>>> {
    let path = `${resource}`;
    let query = options?.query;

    do {
      const response = await this.request<FeedCollectionResponse<ExtractResource<Schema, R>>>(path, {
        ...options,
        query,
      });

      yield response;

      if (!response.nextLink) break;

      const nextLink = new globalThis.URL(response.nextLink, this.#http.baseURL);

      path = nextLink.pathname;
      query = nextLink.searchParams.toString();

      // oxlint-disable-next-line no-constant-condition
    } while (true);
  }

  /**
   * Execute a request through the middleware pipeline
   *
   * @param path endpoint (resource)
   * @param [options] Request options
   */
  async request<R>(path: string, options?: RequestOptions): Promise<R> {
    const ctx: MiddlewareContext = {
      request: {
        baseURL: this.#http.baseURL,
        headers: this.#http.headers,
        path,
        query: options?.query,
      },
    };

    if (Number.isNaN(this.#http.timeout) === false && Number(this.#http.timeout) > 0) {
      ctx.request.signal = AbortSignal.timeout(Number(this.#http.timeout));
    }

    await runMiddleware(this.#middleware, ctx, () => fetcher(ctx));

    return ctx.response?.data as R;
  }
}
