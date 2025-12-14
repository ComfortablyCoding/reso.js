import { createAuth } from '../auth/create-auth.js';
import { createLimiter } from '../limiter.js';
import type { CreateFeedOptions, FeedHooksOptions, FeedLimiter } from '../types/index.js';
import { getDefaults } from '../utils/get-defaults.js';
import { toArray } from '../utils/to-array.js';
import { FeedError } from './error.js';
import { Feed } from './feed.js';

export function createFeed<Schema>(opts: CreateFeedOptions) {
	const { hooks, ...overrides } = opts ?? {};

	if (!opts?.http?.baseURL) {
		throw new Error('A baseURL is required');
	}

	const options = getDefaults(overrides);

	const globalHooks: FeedHooksOptions = {
		onRequest: [],
		onRequestError: [
			({ error }) => {
				throw new FeedError({
					message: error.message,
					code: 503,
				});
			},
		],
		onResponse: [],
		onResponseError: [],
	};

	let limiter: FeedLimiter | undefined;
	if (options.limiter) {
		limiter = createLimiter(options.limiter);

		globalHooks.onRequest?.push(() => new Promise((r) => limiter?.add(() => r())));
	}

	if (options.auth) {
		const auth = createAuth(options.auth);

		globalHooks.onRequest?.push(async ({ options }) => {
			if (auth.isExpired()) {
				limiter?.pause();
				await auth.refresh();
				limiter?.start();
			}

			const { token, tokenType } = await auth.getToken();

			options.headers['Authorization'] = `${tokenType} ${token}`;
		});
	}

	return new Feed<Schema>({
		http: options.http,
		hooks: {
			onRequest: [...toArray(globalHooks.onRequest), ...toArray(hooks?.onRequest)],
			onRequestError: [...toArray(globalHooks.onRequestError), ...toArray(hooks?.onRequestError)],
			onResponse: [...toArray(globalHooks.onResponse), ...toArray(hooks?.onResponse)],
			onResponseError: [...toArray(globalHooks.onResponseError), ...toArray(hooks?.onResponseError)],
		},
	});
}
