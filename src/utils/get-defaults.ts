import type { Defu } from 'defu';
import { defu } from 'defu';
import type { CreateFeedOptions } from '../types/index.js';
import { getProvider } from './get-provider.js';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type GetDefaultsReturn = Defu<{}, [Omit<CreateFeedOptions, 'hooks'>]>;

export function getDefaults(overrides: Omit<CreateFeedOptions, 'hooks'>): GetDefaultsReturn {
	const provider = getProvider(overrides.http.baseURL);

	const defaults = {};

	if (provider === null) {
		return defu(defaults, overrides);
	}

	let providerOverrides: Partial<Omit<CreateFeedOptions, 'hooks'>> = {
		limiter: {
			duration: 60 * 1000, // 1m
		},
	};

	if (provider === 'spark') {
		providerOverrides = defu(providerOverrides, {
			limiter: {
				points: 300,
			},
		});
	} else if (provider === 'bridge') {
		providerOverrides = defu(providerOverrides, {
			limiter: {
				points: 334,
			},
		});
	} else if (provider === 'mlsgrid') {
		providerOverrides = defu(providerOverrides, {
			limiter: {
				points: 120,
			},
		});
	}

	return defu(defaults, overrides, providerOverrides);
}
