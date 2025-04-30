import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Feed } from './feed.js';

vi.mock('ofetch', () => ({
	$fetch: {
		create: vi.fn(() => ({
			raw: vi.fn(async (path) => {
				if (path === '/string') {
					return { _data: 'lorem' };
				} else if (path === '/multi-obj') {
					return {
						_data: {
							value: [],
							'@odata.context': 'context',
							'@odata.nextLink': 'nextLink',
							'@odata.count': 0,
						},
					};
				} else if (path === '/single-obj') {
					return {
						_data: {
							'@odata.context': 'context',
							'@odata.nextLink': 'nextLink',
							'@odata.count': 0,
							ListingId: 123,
						},
					};
				}

				return { _data: null };
			}),
		})),
	},
}));

let feed: Feed;

beforeEach(() => {
	feed = new Feed({
		http: { baseURL: 'http://my-reso-api.com' },
	});
	vi.spyOn(feed, 'request');

	vi.resetAllMocks();
});

describe('Feed', () => {
	describe('$metadata', () => {
		it('Calls the /$metadata endpoint for $metadata', () => {
			feed.$metadata();

			expect(feed.request).toBeCalledWith('/$metadata', {});
		});
	});

	describe('readById', () => {
		it('Constructs singleton key query for number without qoutes', async () => {
			vi.mocked(feed.request);

			await feed.readById('/Property', 123);
			expect(feed.request).toHaveBeenCalledWith('/Property(123)', {});
		});

		it('Constructs singleton key query for string with qoutes', async () => {
			vi.mocked(feed.request);

			await feed.readById('/Property', '123');
			expect(feed.request).toHaveBeenCalledWith("/Property('123')", {});
		});
	});

	describe('readByQuery', () => {
		it('Return next page when nextLink is present', async () => {
			vi.mocked(feed.request)
				.mockResolvedValueOnce({
					values: [],
					nextLink: 'https://my-reso-api/v2/Property?$filter=ListingPrice%20eq%20200000%20&$top=1000&$skip=4000',
				})
				.mockResolvedValueOnce({ values: [] });

			const readByQuery = feed.readByQuery('Property', '$filter=ListingPrice eq 200000 &$top=1000');
			expect((await readByQuery.next()).value).toStrictEqual(
				expect.objectContaining({
					values: [],
					nextLink: 'https://my-reso-api/v2/Property?$filter=ListingPrice%20eq%20200000%20&$top=1000&$skip=4000',
				}),
			);

			expect(feed.request).toHaveBeenCalledWith('Property', {
				query: {
					$filter: 'ListingPrice eq 200000 ',
					$top: '1000',
				},
			});
			expect((await readByQuery.next()).value).toStrictEqual(expect.objectContaining({ values: [] }));

			expect(feed.request).toHaveBeenCalledWith('https://my-reso-api/v2/Property', {
				query: {
					$filter: 'ListingPrice eq 200000 ',
					$top: '1000',
					$skip: '4000',
				},
			});

			expect((await readByQuery.next()).value).eq(undefined);
		});
	});

	describe('request', () => {
		it('Return null for null response', async () => {
			expect(await feed.request('/')).eq(null);
		});

		it('Return string for string response', async () => {
			expect(await feed.request('/string')).eq('lorem');
		});

		it('Return feed response for transport multi obj response', async () => {
			expect(await feed.request('/multi-obj')).toStrictEqual({
				context: 'context',
				count: 0,
				nextLink: 'nextLink',
				values: [],
			});
		});

		it('Return feed response for transport single obj response', async () => {
			expect(await feed.request('/single-obj')).toStrictEqual({
				context: 'context',
				count: 0,
				nextLink: 'nextLink',
				value: {
					ListingId: 123,
				},
			});
		});
	});
});
