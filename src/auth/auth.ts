export abstract class Auth {
	token: null | string;
	tokenType: string;
	constructor(opts?: { token?: string; tokenType?: string | undefined }) {
		this.token = opts?.token ?? null;
		this.tokenType = opts?.tokenType ?? 'Bearer';
	}
	abstract isExpired(): boolean;
	abstract refresh(): Promise<void>;
	abstract getToken(): Promise<{ token: string; tokenType: string }>;
}
