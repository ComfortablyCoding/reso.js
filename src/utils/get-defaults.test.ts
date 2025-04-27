import { describe, expect, it } from 'vitest';
import { getDefaults } from './get-defaults.js';

describe('getDefaults', () => {
	it('Returns overrides + defaults for unknown provider', () => {
		expect(
			getDefaults({
				http: {
					baseURL: 'https://my-reso-api',
				},
			}),
		).toStrictEqual({
			http: {
				baseURL: 'https://my-reso-api',
			},
		});
	});

	it('Returns overrides + defaults + provider overrides for known provider', () => {
		expect(
			getDefaults({
				http: {
					baseURL: 'https://api.mlsgrid.com/v2',
				},
			}),
		).toStrictEqual({
			http: {
				baseURL: 'https://api.mlsgrid.com/v2',
			},
			limiter: {
				duration: 60000,
				points: 120,
			},
		});
	});
});
