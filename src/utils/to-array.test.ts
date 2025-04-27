import { describe, expect, it } from 'vitest';
import { toArray } from './to-array.js';

describe('toArray', () => {
	it('Returns an empty array for null and undefined', () => {
		expect(toArray(undefined)).toStrictEqual([]);
		expect(toArray(null)).toStrictEqual([]);
	});

	it('Returns an array equivalent for primitive values', () => {
		expect(toArray(1)).toStrictEqual([1]);
		expect(toArray(0)).toStrictEqual([0]);
		expect(toArray(true)).toStrictEqual([true]);
		expect(toArray(false)).toStrictEqual([false]);
		expect(toArray('')).toStrictEqual(['']);
	});

	it('Returns an array equivalent for a comma seperate string', () => {
		expect(toArray('1,2,3')).toStrictEqual(['1', '2', '3']);
	});

	it('Returns an unchanged array when array is provided', () => {
		expect(toArray([1, 2, 3])).toStrictEqual([1, 2, 3]);
	});
});
