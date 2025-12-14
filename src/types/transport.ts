export interface TransportError {
	code: string | number;
	message: string;
	target: string;
	details: TransportErrorDetail[];
	[key: string]: unknown;
}

export interface TransportErrorDetail {
	code: string;
	target: string;
	message: string;
}

export enum TransportErrorCode {
	ServiceUnavailable = 'SERVICE_UNAVAILABLE',
	Forbidden = 'FORBIDDEN',
	BadRequest = 'BAD_REQUEST',
	NotFound = 'NOT_FOUND',
	RequestEntityTooLarge = 'REQUEST_ENTITY_TO_LARGE',
	UnsupportedMedia = 'UNSUPPORTED_MEDIA',
	TooManyRequests = 'TOO_MANY_REQUESTS',
	InternalServerError = 'INTERNAL_SERVER_ERROR',
	NotImplemented = 'NOT_IMPLEMENTED',
	Unknown = 'UNKNOWN',
}
