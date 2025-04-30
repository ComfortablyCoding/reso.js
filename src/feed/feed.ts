import type { $Fetch, FetchError } from 'ofetch';
import { $fetch } from 'ofetch';
import { getQuery, parsePath, parseQuery, stringifyQuery } from 'ufo';
import type {
	FeedMultiResponse,
	FeedOptions,
	FeedRequestOptions,
	FeedResponse,
	FeedSingleResponse,
	TransportError,
	TransportResponse,
} from '../types/index.js';
import { FeedError } from './error.js';

export class Feed {
	http: FeedOptions['http'];
	hooks: FeedOptions['hooks'];
	client: $Fetch;
	constructor(opts: FeedOptions) {
		this.http = opts.http;
		this.hooks = opts.hooks ?? {};

		this.client = $fetch.create({
			...this.http,
			onRequest: this.hooks.onRequest ?? [],
			onRequestError: this.hooks.onRequestError ?? [],
			onResponse: this.hooks.onResponse ?? [],
			onResponseError: this.hooks.onResponseError ?? [],
		});
	}

	$metadata(query?: string) {
		const requestOptions: Partial<FeedRequestOptions> = {};

		if (query) {
			requestOptions['query'] = parseQuery(query);
		}

		return this.request('/$metadata', requestOptions) as unknown as string;
	}

	async *readByQuery<V extends Record<string, unknown>>(
		resource: string,
		query?: string,
	): AsyncGenerator<FeedMultiResponse<V>> {
		let url: null | string = resource;

		let q = query;

		do {
			const readResponse = (await this.request<V>(url || resource, {
				query: parseQuery(q),
			})) as FeedMultiResponse<V>;

			url = null;
			if (readResponse && 'nextLink' in readResponse) {
				url = parsePath(readResponse.nextLink).pathname;
				q = stringifyQuery(getQuery(readResponse.nextLink));
			}

			yield readResponse;
		} while (url);
	}

	async readById<V extends Record<string, unknown>>(
		resource: string,
		id: string | number,
		query?: string,
	): Promise<FeedSingleResponse<V>> {
		const resourceId = `(${typeof id === 'string' ? `'${id}'` : id})`;

		const requestOptions: Partial<FeedRequestOptions> = {};

		if (query) {
			requestOptions['query'] = parseQuery(query);
		}

		return this.request<V>(resource + resourceId, requestOptions) as unknown as FeedSingleResponse<V>;
	}

	async request<R extends Record<string, unknown>>(
		path: string,
		opts?: FeedRequestOptions,
	): Promise<string | FeedResponse<R> | null> {
		const response = await this.client.raw(path, opts ?? {}).catch((error: FetchError<{ error: TransportError }>) => {
			throw new FeedError({
				message: error.data?.error.message ?? error.message,
				code: error.statusCode ?? error.data?.error.code ?? 0,
				...error.data?.error,
			});
		});

		const data = response._data as null | string | TransportResponse<R>;

		if (!data) {
			return null;
		}

		if (typeof data === 'string') {
			return data;
		}

		const { '@odata.count': count, '@odata.nextLink': nextLink, '@odata.context': context, ...remaining } = data;

		const providerResponse: FeedResponse<R> =
			'value' in remaining
				? {
						values: remaining.value,
					}
				: { value: remaining };

		if (typeof count === 'string' || typeof count === 'number') {
			providerResponse.count = Number(count);
		}

		if (nextLink) {
			providerResponse.nextLink = nextLink;
		}

		if (context) {
			providerResponse.context = context;
		}

		return providerResponse;
	}
}
