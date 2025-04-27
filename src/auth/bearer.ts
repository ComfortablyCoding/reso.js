import type { AuthBearerOptions } from '../types/index.js';
import { Auth } from './auth.js';

export class AuthBearer extends Auth {
	constructor(opts: Omit<AuthBearerOptions, 'type'>) {
		super({
			token: opts.credentials.token,
			tokenType: opts.credentials.tokenType,
		});
	}

	isExpired(): boolean {
		return false;
	}

	async refresh() {
		return;
	}

	async getToken() {
		return { token: this.token!, tokenType: this.tokenType };
	}
}
