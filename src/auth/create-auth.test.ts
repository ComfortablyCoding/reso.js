import { describe, expect, it } from 'vitest';
import { AuthBearer } from './bearer.js';
import { createAuth } from './create-auth.js';
import { AuthClientCredentials } from './credential.js';

describe('createAuth', () => {
	it('Returns AuthBearer for type:bearer', () => {
		expect(createAuth({ type: 'bearer', credentials: { token: '' } })).instanceOf(AuthBearer);
	});

	it('Returns AuthClientCredentials for type:credentials', () => {
		expect(
			createAuth({
				type: 'credentials',
				credentials: {
					tokenURL: 'http://my-token-url',
					clientId: 'clientId',
					clientSecret: 'clientSecret',
				},
			}),
		).instanceOf(AuthClientCredentials);
	});
});
