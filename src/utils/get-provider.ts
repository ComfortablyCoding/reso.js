export function getProvider(url: string) {
	if (url.includes('api.mlsgrid.com')) {
		return 'mlsgrid';
	}
	if (url.includes('api.bridgedataoutput.com')) {
		return 'bridge';
	}
	if (url.includes('sparkapi.com')) {
		return 'spark';
	}
	if (url.includes('api-trestle.corelogic.com')) {
		return 'trestle';
	}

	return null;
}
