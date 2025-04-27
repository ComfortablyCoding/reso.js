import PQueue from 'p-queue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createLimiter } from './limiter.js';

vi.mock('p-queue');

beforeEach(() => {
	vi.resetAllMocks();
});

describe('createLimiter', () => {
	it('Returns limiter instance when created', () => {
		expect(createLimiter({})).instanceOf(PQueue);
	});

	it('Returns limiter with default options if none are provided', () => {
		createLimiter({});

		expect(PQueue).toBeCalledWith({
			carryoverConcurrencyCount: true,
			concurrency: 1,
			interval: 60000,
			intervalCap: 100,
		});
	});

	it('Returns limiter with custom options if overrides are provided', () => {
		createLimiter({
			duration: 30000,
			points: 10,
		});

		expect(PQueue).toBeCalledWith({
			carryoverConcurrencyCount: true,
			concurrency: 1,
			interval: 30000,
			intervalCap: 10,
		});
	});
});
