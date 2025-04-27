import { TransportErrorCode, type FeedErrorOptions } from '../types/index.js';

export class FeedError extends Error {
	override name: TransportErrorCode;
	code: string | number;
	target: string | null;
	details: NonNullable<FeedErrorOptions['details']>;
	constructor(opts: FeedErrorOptions) {
		super(opts.message);

		this.code = opts.code ?? 500;
		this.target = opts.target ?? null;
		this.details = opts.details ?? [];

		switch (this.code) {
			case 400:
				this.name = TransportErrorCode.BadRequest;
				break;
			case 403:
				this.name = TransportErrorCode.Forbidden;
				break;
			case 404:
				this.name = TransportErrorCode.NotFound;
				break;
			case 413:
				this.name = TransportErrorCode.RequestEntityTooLarge;
				break;
			case 415:
				this.name = TransportErrorCode.UnsupportedMedia;
				break;
			case 429:
				this.name = TransportErrorCode.TooManyRequests;
				break;
			case 500:
				this.name = TransportErrorCode.InternalServerError;
				break;
			case 501:
				this.name = TransportErrorCode.NotImplemented;
				break;
			case 503:
				this.name = TransportErrorCode.ServiceUnavailable;
				break;

			default:
				this.name = TransportErrorCode.Unknown;
				break;
		}
	}

	override toString() {
		return `${this.name} [${this.code}]: ${this.message}`;
	}
}
