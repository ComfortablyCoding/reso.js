import type { CreateAuthOptions } from '../types/index.js';
import { AuthBearer } from './bearer.js';
import { AuthClientCredentials } from './credential.js';

export function createAuth(opts: CreateAuthOptions) {
	if (opts.type === 'bearer') {
		return new AuthBearer(opts);
	}

	return new AuthClientCredentials(opts);
}
