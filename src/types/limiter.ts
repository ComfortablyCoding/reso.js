import PQueue from 'p-queue';

export interface CreateLimiterOptions {
	duration?: number;
	points?: number;
}

export type FeedLimiter = PQueue;
