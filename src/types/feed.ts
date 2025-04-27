import type { FetchContext, FetchHook, FetchOptions, FetchResponse, ResponseType } from 'ofetch';
import type { CreateAuthOptions } from './auth.js';
import type { CreateLimiterOptions } from './limiter.js';

export interface CreateFeedOptions {
	http: FeedHttpOptions;
	hooks?: FeedHooksOptions;
	limiter?: CreateLimiterOptions;
	auth?: CreateAuthOptions;
}

export type FeedHttpOptions = Omit<
	FetchOptions,
	'onResponse' | 'onResponseError' | 'onRequest' | 'onRequestError' | 'baseURL'
> &
	Required<Pick<FetchOptions, 'baseURL'>>;

export interface FeedHooksOptions<T = unknown, R extends ResponseType = ResponseType> {
	onRequest?: FetchHook<FetchContext<T, R>>[];
	onRequestError?: FetchHook<
		FetchContext<T, R> & {
			error: Error;
		}
	>[];
	onResponse?: FetchHook<
		FetchContext<T, R> & {
			response: FetchResponse<T>;
		}
	>[];
	onResponseError?: FetchHook<
		FetchContext<T, R> & {
			response: FetchResponse<T>;
		}
	>[];
}

export interface FeedBaseResponse {
	context?: string;
	nextLink?: string;
	count?: string | number;
}

export interface FeedMultiResponse<V> extends FeedBaseResponse {
	values: V[];
}

export interface FeedSingleResponse<V> extends FeedBaseResponse {
	value: V;
}

export type FeedResponse<V> = FeedMultiResponse<V> | FeedSingleResponse<V>;

export interface FeedOptions {
	http: FeedHttpOptions;
	hooks?: FeedHooksOptions;
}

export type FeedRequestOptions = Omit<
	FetchOptions,
	'onResponse' | 'onResponseError' | 'onRequest' | 'onRequestError' | 'baseURL'
>;
