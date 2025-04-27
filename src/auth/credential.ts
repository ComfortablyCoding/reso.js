import { $fetch } from 'ofetch';
import type { AuthClientCredentialsOptions } from '../types/index.js';
import { Auth } from './auth.js';

export class AuthClientCredentials extends Auth {
	expiresAt: number;
	credentials: AuthClientCredentialsOptions['credentials'];
	refreshBuffer: number;
	constructor(opts: Omit<AuthClientCredentialsOptions, 'type'>) {
		super();

		this.credentials = opts.credentials;
		this.refreshBuffer = opts.refreshBuffer ?? 30 * 1000;

		this.expiresAt = 0;
	}

	isExpired(): boolean {
		return this.expiresAt < Date.now();
	}

	async refresh() {
		const { clientId, clientSecret, grantType, scope, tokenURL } = this.credentials;

		const clientCredentialQuery: Record<string, unknown> = {
			client_id: clientId,
			client_secret: clientSecret,
		};

		if (grantType) {
			clientCredentialQuery['grant_type'] = grantType;
		}

		if (scope) {
			clientCredentialQuery['scope'] = scope;
		}

		const authResponse = await $fetch(tokenURL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			query: clientCredentialQuery,
		});

		const { access_token, expires_in, token_type } = authResponse;

		this.token = access_token;
		this.expiresAt = Date.now() + Number(expires_in) - this.refreshBuffer;
		this.tokenType = token_type ?? 'Bearer';
	}

	async getToken() {
		if (this.isExpired()) {
			await this.refresh();
		}

		return { token: this.token!, tokenType: this.tokenType! };
	}
}
