import type { FeedErrorOptions, TransportErrorDetail } from './types';

/**
 * Structure odata error
 */
export class FeedError extends Error {
  status: number;
  code: string;
  target: string | null;
  details: TransportErrorDetail[];
  constructor(opts: FeedErrorOptions) {
    let message = 'error' in opts ? opts.error.message : opts.message;
    super(message ?? 'Unknown');

    this.name = 'FeedError';
    this.status = opts.status;
    this.message = message;
    this.code = 'UNKNOWN';
    this.target = null;
    this.details = [];

    if ('error' in opts) {
      this.message = opts.error.message;
      this.code = opts.error.code;
      this.target = opts.error.target ?? null;
      this.details = opts.error.details ?? [];
    }
  }

  override toString() {
    return `${this.name} [${this.code}]: ${this.message}`;
  }
}
