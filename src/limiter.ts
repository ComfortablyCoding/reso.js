import PQueue from 'p-queue';
import type { CreateLimiterOptions, FeedLimiter } from './types/index.js';

export function createLimiter(opts: CreateLimiterOptions): FeedLimiter {
	return new PQueue({
		concurrency: 1,
		interval: opts.duration ?? 60 * 1000,
		intervalCap: opts.points ?? 100,
		carryoverConcurrencyCount: true,
	});
}
