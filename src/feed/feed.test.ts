import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Feed } from './feed.js';
import { ofetch } from 'ofetch';

vi.mock('ofetch');

let feed: Feed<any>;

describe('Feed', () => {
	beforeEach(() => {
		feed = new Feed({
			http: { baseURL: 'http://my-reso-api.com' },
		});

		vi.spyOn(feed, 'request');

		vi.resetAllMocks();
	});

	describe('$metadata', () => {
		test('should call request with /$metadata for $metadata', async () => {
			vi.mocked(ofetch.raw).mockResolvedValue({ _data: 'metadata' } as any);

			await feed.$metadata();

			expect(feed.request).toBeCalledWith('/$metadata', {});
		});
	});

	describe('readById', () => {
		test('should correctly format number id with no qoutes', async () => {
			vi.mocked(ofetch.raw).mockResolvedValue({ _data: {} } as any);

			await feed.readById('Property', 123);
			expect(feed.request).toHaveBeenCalledWith('/Property(123)', {});
		});

		test('should correctly format string id with qoutes', async () => {
			vi.mocked(ofetch.raw).mockResolvedValue({ _data: {} } as any);

			await feed.readById('Property', '123');
			expect(feed.request).toHaveBeenCalledWith("/Property('123')", {});
		});
	});

	describe('readByQuery', () => {
		test('should auto paginate pages until no nextLink is present', async () => {
			vi.mocked(ofetch.raw)
				.mockResolvedValueOnce({
					_data: {
						value: [],
						'@odata.nextLink': 'https://my-reso-api/Property?$filter=ListingPrice%20eq%20200000&$top=1000&$skip=4000',
					},
				} as any)
				.mockResolvedValueOnce({ _data: { value: [] } } as any);

			const readByQuery = feed.readByQuery('Property', '$filter=ListingPrice eq 200000&$top=1000');

			// first call
			await expect(readByQuery.next().then((v) => v.value)).resolves.toStrictEqual({
				data: [],
				nextLink: 'https://my-reso-api/Property?$filter=ListingPrice%20eq%20200000&$top=1000&$skip=4000',
			});

			expect(feed.request).toHaveBeenCalledWith('/Property', {
				query: '$filter=ListingPrice eq 200000&$top=1000',
			});

			// paginate
			await expect(readByQuery.next().then((v) => v.value)).resolves.toStrictEqual({
				data: [],
			});

			expect(feed.request).toHaveBeenCalledWith('/Property', {
				query: '$filter=ListingPrice%20eq%20200000&$top=1000&$skip=4000',
			});

			// end of line
			await expect(readByQuery.next().then((v) => v.value)).resolves.eq(undefined);
		});
	});

	describe('request', () => {
		test('should correctly join base url + path', async () => {
			vi.mocked(ofetch.raw).mockResolvedValue({ _data: {} } as any);

			await feed.request('/Property');

			expect(ofetch.raw).toHaveBeenCalledWith('http://my-reso-api.com/Property', { method: 'GET' });
		});

		test('should correctly join non root base url + path', async () => {
			vi.mocked(ofetch.raw).mockResolvedValue({ _data: {} } as any);

			feed = new Feed({
				http: { baseURL: 'http://my-reso-api.com/v2' },
			});

			await feed.request('/v2/Property');

			expect(ofetch.raw).toHaveBeenCalledWith('http://my-reso-api.com/v2/Property', { method: 'GET' });
		});

		test('should correctly format query', async () => {
			vi.mocked(ofetch.raw).mockResolvedValue({ _data: {} } as any);

			await feed.request('/Property', { query: '$filter=ListingPrice%20eq%20200000&$top=1000&$skip=4000' });

			expect(ofetch.raw).toHaveBeenCalledWith('http://my-reso-api.com/Property', {
				method: 'GET',
				query: {
					$filter: 'ListingPrice eq 200000',
					$top: '1000',
					$skip: '4000',
				},
			});
		});

		test('Return string for string response', async () => {
			vi.mocked(ofetch.raw).mockResolvedValue({ _data: 'string' } as any);

			await expect(feed.request('/string')).resolves.eq('string');
		});

		test('should transform collection response and extract odata fields', async () => {
			vi.mocked(ofetch.raw).mockResolvedValue({
				_data: { value: [], '@odata.context': 'context', '@odata.nextLink': 'nextLink', '@odata.count': 0 },
			} as any);

			await expect(feed.request('/collection')).resolves.toStrictEqual({
				context: 'context',
				count: 0,
				nextLink: 'nextLink',
				data: [],
			});
		});

		test('should transform entity response and exclude odata fields', async () => {
			vi.mocked(ofetch.raw).mockResolvedValue({
				_data: {
					'@odata.context': 'context',
					'@odata.nextLink': 'nextLink',
					'@odata.count': 0,
					ListingId: 123,
				},
			} as any);

			await expect(feed.request('/entity')).resolves.toStrictEqual({
				context: 'context',
				data: {
					ListingId: 123,
				},
			});
		});

		test('should throw error if no data received', async () => {
			vi.mocked(ofetch.raw).mockResolvedValue({ _data: null } as any);

			await expect(feed.request('/')).rejects.throws(Error);
		});
	});
});
