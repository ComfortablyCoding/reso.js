import type { $Fetch, FetchError } from 'ofetch';
import { $fetch } from 'ofetch';
import type {
	FeedOptions,
	FeedRequestOptions,
	FeedResponse,
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
		return this.request(this.buildURL('/$metadata', query)) as unknown as string;
	}

	buildURL(url: string, query?: string) {
		if (!query) {
			return url;
		}

		return url + '?' + query;
	}

	async *readByQuery<V extends Record<string, unknown>>(
		resource: string,
		query?: string,
	): AsyncGenerator<FeedResponse<V>> {
		let url: null | string = this.buildURL(resource, query);

		do {
			const readResponse = (await this.request<V>(url || resource)) as FeedResponse<V>;

			url = null;
			if (readResponse && 'nextLink' in readResponse) {
				url = readResponse.nextLink;
			}

			yield readResponse;
		} while (url);
	}

	async readById<V extends Record<string, unknown>>(
		resource: string,
		id: string | number,
		query?: string,
	): Promise<FeedResponse<V>> {
		return this.request<V>(
			this.buildURL(resource + `(${typeof id === 'string' ? `'${id}'` : id})`, query),
		) as unknown as FeedResponse<V>;
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
