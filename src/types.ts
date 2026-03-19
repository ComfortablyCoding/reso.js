// Helper
/**
 * A conditional type utility that resolves based on whether  type `T` is `any`.
 *
 * @template T - The type to evaluate.
 * @template Y - The type to return if `T` is `any`.
 * @template N - The type to return if `T` is not `any`.
 *
 * @example
 * type Result = IsAny<any, string, number>; // string
 * type Result = IsAny<boolean, string, number>; // number
 */
export type IsAny<T, Y, N> = 0 extends 1 & T ? Y : N;

/**
 * Extract a resource type from a Schema definition
 *
 * @template Schema - The resource schema definitions.
 * @template R - The resource to look up within the schema.
 * @returns
 * - `Schema[R]` if `R` is a valid resource of `Schema`.
 * - `Record<string, unknown>` if `Schema` is `any`.
 * - `never` if `Schema` is not an object or `R` is not a valid resource.
 */
export type ExtractResource<Schema, R> = IsAny<
  Schema,
  // fallback for 'any' or 'unknown' schema
  Record<string, unknown>,
  Schema extends Record<string, any> ? (R extends keyof Schema ? Schema[R] : never) : never
>;

// Feed
export interface FeedHttpConfig {
  baseURL: string;
  headers?: Record<string, string> | undefined;
  timeout?: number;
}

export interface FeedConfig {
  http: FeedHttpConfig;
  middleware?: Middleware[] | undefined;
}

export interface RequestOptions {
  query?: string | TransportQuery | undefined;
  headers?: Record<string, string> | undefined;
}

export type ResourceOptions = RequestOptions;

export type FeedMetadataResponse = TransportMetadataResponse;

export type FeedEntityResourceId = string | number;

export type FeedEntityResponse<R> = {
  context?: string;
  data: R;
};

export interface FeedCollectionResponse<R> {
  context?: string;
  count?: number;
  nextLink?: string;
  data: R[];
}

export type FeedResponse<R> = FeedEntityResponse<R> | FeedCollectionResponse<R> | FeedMetadataResponse;

export type FeedErrorOptions =
  | {
      status: number;
      message: string;
    }
  | ({
      status: number;
    } & TransportErrorResponse);

// Middleware
export interface MiddlewareContext {
  request: FeedHttpConfig & RequestOptions & { signal?: globalThis.AbortSignal; path: string };
  response?: {
    data: unknown;
    headers: FeedHttpConfig['headers'];
  };
}

export type Middleware = (ctx: MiddlewareContext, next: () => Promise<void> | void) => Promise<void> | void;

// Transport
export interface TransportQuery {
  /** Maximum number of records to return */
  $top?: number;

  /** Number of records to skip (for paging) */
  $skip?: number;

  /** Filter expression */
  $filter?: string;

  /** Fields to select */
  $select?: string;

  /** Fields to order by */
  $orderby?: string;

  /** Include total count of records */
  $count?: boolean;

  /** Search expression */
  $search?: string;

  /** Expand related entities */
  $expand?: string;
}

export type TransportMetadataResponse = string;

export type TransportEntityResourceId = string | number;

export type TransportEntityResponse<R> = R & {
  '@odata.context'?: string;
};

export interface TransportCollectionResponse<R> {
  '@odata.context'?: string;
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
  value: R[];
}

export interface TransportErrorDetail {
  code: string;
  message: string;
  target?: string;
}

export interface TransportErrorResponse {
  error: {
    code: string;
    message: string;
    target?: string;
    details?: TransportErrorDetail[];
    innererror?: Record<string, unknown>;
  };
}

export type TransportResponse<T> =
  | TransportCollectionResponse<T>
  | TransportEntityResponse<T>
  | TransportMetadataResponse
  | TransportErrorResponse;
