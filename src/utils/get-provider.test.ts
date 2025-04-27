import { describe, expect, it } from 'vitest';
import { getProvider } from './get-provider.js';

describe('getProvider', () => {
	it('Returns expected provider for respevtive URL', () => {
		expect(getProvider('https://api.mlsgrid.com/v2')).eq('mlsgrid');
		expect(getProvider('https://api-trestle.corelogic.com')).eq('trestle');
		expect(getProvider('https://api.bridgedataoutput.com/api/v2')).eq('bridge');
		expect(getProvider('https://replication.sparkapi.com/Version/3/')).eq('spark');
	});

	it('Returns null for unknown url', () => {
		expect(getProvider('https://my-reso-api')).eq(null);
	});
});
