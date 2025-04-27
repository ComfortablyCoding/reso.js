export type AuthOptionType = 'bearer' | 'credentials';

export interface BaseAuthOptions {
	type: AuthOptionType;
}

export interface AuthBearerOptions extends BaseAuthOptions {
	type: 'bearer';
	credentials: {
		token: string;
		tokenType?: string;
	};
}

export interface AuthClientCredentialsOptions extends BaseAuthOptions {
	type: 'credentials';
	credentials: {
		tokenURL: string;
		clientId: string;
		clientSecret: string;
		scope?: string;
		grantType?: string;
	};
	refreshBuffer?: number;
}

export type AuthOptions = AuthBearerOptions | AuthClientCredentialsOptions;
export type CreateAuthOptions = AuthOptions;
