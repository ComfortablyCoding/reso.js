import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createFeed } from './create-feed.js';
import { Feed } from './feed.js';

vi.mock('./feed');

beforeEach(() => {
	vi.resetAllMocks();
});

describe('createFeed', () => {
	it('Returns an error if no baseURL is provided', () => {
		// @ts-expect-error js test
		expect(() => createFeed()).toThrowError('A baseURL is required');
		// @ts-expect-error js test
		expect(() => createFeed({})).toThrowError('A baseURL is required');
	});

	it('Returns a feed with http options and error handler when only http options are provided', () => {
		createFeed({ http: { baseURL: 'http://my-reso-api.com' } });
		expect(Feed).toBeCalledWith({
			hooks: {
				onRequest: [],
				onRequestError: [expect.any(Function)],
				onResponse: [],
				onResponseError: [],
			},
			http: {
				baseURL: 'http://my-reso-api.com',
			},
		});
	});

	it('Returns a feed with http options and error + limiter handlers when http + limiter options are provided', () => {
		createFeed({
			http: { baseURL: 'http://my-reso-api.com' },
			limiter: { duration: 1 },
		});
		expect(Feed).toBeCalledWith({
			hooks: {
				onRequest: [expect.any(Function)],
				onRequestError: [expect.any(Function)],
				onResponse: [],
				onResponseError: [],
			},
			http: {
				baseURL: 'http://my-reso-api.com',
			},
		});
	});

	it('Returns a feed with http options and error + limiter + auth handlers when http + limiter + auth options are provided', () => {
		createFeed({
			http: { baseURL: 'http://my-reso-api.com' },
			limiter: { duration: 1 },
			auth: { type: 'bearer', credentials: { token: '' } },
		});
		expect(Feed).toBeCalledWith({
			hooks: {
				onRequest: [expect.any(Function), expect.any(Function)],
				onRequestError: [expect.any(Function)],
				onResponse: [],
				onResponseError: [],
			},
			http: {
				baseURL: 'http://my-reso-api.com',
			},
		});
	});
});
