import { describe, expect, it } from 'vitest';
import { AuthBearer } from './bearer.js';

describe('AuthBearer', () => {
	describe('isExpired', () => {
		it('Returns non expired no matter the time', () => {
			const auth = new AuthBearer({
				credentials: {
					token: 'myToken',
				},
			});
			expect(auth.isExpired()).eq(false);
		});
	});

	describe('getToken', () => {
		it('Returns token with default type when no token_type is provided', async () => {
			const auth = new AuthBearer({
				credentials: {
					token: 'myToken',
				},
			});

			const token = await auth.getToken();

			expect(token.token).eq('myToken');
			expect(token.tokenType).eq('Bearer');
		});

		it('Returns token with specified type when token_type is in response payload', async () => {
			const auth = new AuthBearer({
				credentials: {
					token: 'myToken',
					tokenType: 'myType',
				},
			});
			const token = await auth.getToken();

			expect(token.token).eq('myToken');
			expect(token.tokenType).eq('myType');
		});
	});
});
