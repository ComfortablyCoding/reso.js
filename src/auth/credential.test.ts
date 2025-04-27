import { $fetch } from 'ofetch';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthClientCredentials } from './credential.js';

vi.mock('ofetch');

let auth: AuthClientCredentials;

beforeEach(() => {
	auth = new AuthClientCredentials({
		credentials: {
			tokenURL: 'http://my-token-url',
			clientId: 'clientId',
			clientSecret: 'clientSecret',
		},
	});

	vi.resetAllMocks();
});

describe('AuthClientCredentials', () => {
	describe('isExpired', () => {
		it('Returns expired when expiresAt < currentTime', () => {
			expect(auth.isExpired()).eq(true);
		});
	});

	describe('refresh', () => {
		it('Calls refresh with expected parameters', async () => {
			vi.mocked($fetch).mockImplementation(async () => ({}));

			await auth.refresh();

			expect($fetch).toBeCalledWith('http://my-token-url', {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				method: 'POST',
				query: {
					client_id: 'clientId',
					client_secret: 'clientSecret',
				},
			});
		});
	});

	describe('getToken', () => {
		it('Returns token with default type when no token_type in response payload', async () => {
			vi.mocked($fetch).mockImplementation(async () => ({
				access_token: 'myToken',
			}));

			const token = await auth.getToken();

			expect(token.token).eq('myToken');
			expect(token.tokenType).eq('Bearer');
		});

		it('Returns token with specified type when token_type is in response payload', async () => {
			vi.mocked($fetch).mockImplementation(async () => ({
				access_token: 'myToken',
				token_type: 'myType',
			}));

			const token = await auth.getToken();

			expect(token.token).eq('myToken');
			expect(token.tokenType).eq('myType');
		});
	});
});
