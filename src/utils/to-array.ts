export function toArray<T = unknown>(val?: T | T[]): T[] {
	if (val === undefined || val === null) {
		return [];
	}

	if (typeof val === 'string') {
		return val.split(',') as unknown as T[];
	}

	return Array.isArray(val) ? val : [val];
}
