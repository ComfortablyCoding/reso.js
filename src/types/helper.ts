/**
 * Conditional type utility that determines if a given type 'T' resolves to 'any'.
 *
 * If T is any it resolves to type 'Y'
 * If T is not any it resolves to type 'N'
 */
export type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;

/**
 * Resolves the type of the Resource (R) based on the Schema and the requested Resource.
 *
 * If Schema is 'any', it defaults to Record<string, unknown>.
 * If Schema is specific, it looks up Schema[R].
 */
export type ResolveResourceType<Schema, R> = IfAny<
	Schema,
	Record<string, unknown>, // Fallback for 'any' or 'unknown' Schema
	Schema extends Record<string, any> ? (R extends keyof Schema ? Schema[R] : never) : never
>;
