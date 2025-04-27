import type { TransportError } from './transport.js';

export type FeedErrorOptions = {
	message?: string;
} & Partial<Pick<TransportError, 'code' | 'target' | 'details'>>;
