import type { FetchContext, FetchHook, FetchOptions, FetchResponse, ResponseType } from 'ofetch';
import type { CreateAuthOptions } from './auth.js';
import type { CreateLimiterOptions } from './limiter.js';

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

export interface FeedOptions {
	http: FeedHttpOptions;
	hooks?: FeedHooksOptions;
}

export interface CreateFeedOptions {
	http: FeedHttpOptions;
	hooks?: FeedHooksOptions;
	limiter?: CreateLimiterOptions;
	auth?: CreateAuthOptions;
}

export interface RequestOptions {
	query?: string | undefined;
}

export type ResourceId = string | number;
export type ResourceQuery = string;

export interface FeedBaseResponse<R> {
	context?: string;
	data: R | R[];
}

export interface FeedEntityResponse<R> extends FeedBaseResponse<R> {
	data: R;
}

export interface FeedCollectionResponse<R> extends FeedBaseResponse<R> {
	nextLink?: string;
	count?: string | number;
	data: R[];
}
