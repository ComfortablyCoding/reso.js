import { ofetch, type FetchOptions } from 'ofetch';
import { parseQuery, parseURL } from 'ufo';
import type {
	FeedCollectionResponse,
	FeedEntityResponse,
	FeedOptions,
	IfAny,
	RequestOptions,
	ResourceId,
	ResolveResourceType,
	ResourceQuery,
} from '../types/index.js';

export class Feed<Schema> {
	http: FeedOptions['http'];
	hooks: FeedOptions['hooks'];
	constructor(opts: FeedOptions) {
		this.http = opts.http;
		this.hooks = opts.hooks ?? {};
	}

	/**
	 * Fetch the OData $metadata.
	 *
	 * @param [query] The optional query to apply for the metadata request (rarely used).
	 * @returns The raw metadata XML document
	 */
	$metadata(query?: ResourceQuery) {
		return this.request('/$metadata', { query }) as Promise<string>;
	}

	/**
	 * Fetch a single resource entity by its unique ID.
	 * @param resource The name of the resource collection.
	 * @param id The unique identifier for the specific entity.
	 * @param [query] The optional query to apply.
	 * @returns The entity
	 */
	async readById<R extends IfAny<Schema, string, keyof Schema>>(resource: R, id: ResourceId, query?: ResourceQuery) {
		const resourceId = `(${typeof id === 'string' ? `'${id}'` : id})`;

		return this.request(`/${(resource as string) + resourceId}`, { query }) as Promise<
			FeedEntityResponse<ResolveResourceType<Schema, R>>
		>;
	}

	/**
	 * Fetch a resource collection.
	 *
	 * The generator will yield a response for each page of results
	 * and automatically follow the `@odata.nextLink` until all entities are retrieved.
	 *
	 * @param resource The name of the resource collection.
	 * @param [query] The optional query to apply.
	 * @returns An async generator that yields paginated collection responses.
	 */
	async *readByQuery<R extends IfAny<Schema, string, keyof Schema>>(resource: R, query?: ResourceQuery) {
		let hasNext = false;
		let nextPath: string | null = null;
		do {
			const response = (await this.request(nextPath ?? `/${resource as string}`, { query })) as FeedCollectionResponse<
				ResolveResourceType<Schema, R>
			>;

			if (response.nextLink && response.nextLink?.length > 0) {
				const { search, pathname } = parseURL(response.nextLink);
				// parsePath.search returns '?key=value', '?' must be stripped for the query
				query = search.slice(1);
				nextPath = pathname;
				hasNext = query.length > 0;
			} else {
				hasNext = false;
			}

			yield response;
		} while (hasNext);
	}

	async request<R>(path: string, options?: RequestOptions) {
		let fetchOptions: FetchOptions = {};

		if (options?.query) {
			fetchOptions.query = parseQuery(options.query);
		}

		const rawResponse = await ofetch.raw(new URL(path, this.http.baseURL).toString(), {
			method: 'GET',
			...fetchOptions,
		});

		const rawData = rawResponse._data;
		if (!rawData) {
			throw new Error('No response received');
		}

		// Handle string (i.e. metadata) response
		if (typeof rawData === 'string') {
			return rawData;
		}

		// Handle entity or collection response
		const { '@odata.count': count, '@odata.nextLink': nextLink, '@odata.context': context, ...remaining } = rawData;

		const response: any = {
			data: 'value' in remaining ? remaining.value : remaining,
		};

		if ('@odata.context' in rawData) {
			response.context = context;
		}

		if ('value' in rawData && Array.isArray(rawData.value)) {
			if ('@odata.count' in rawData) {
				response.count = Number(count);
			}

			if ('@odata.nextLink' in rawData) {
				response.nextLink = String(nextLink);
			}

			return response as FeedCollectionResponse<R>;
		}

		return response as FeedEntityResponse<R>;
	}
}
