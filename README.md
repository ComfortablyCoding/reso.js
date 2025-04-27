# reso.js

**`reso.js`** is a `Node.js` client for interacting with RESO Web API services, fully aligned with the current [RESO Web API specification](https://github.com/RESOStandards/transport).

It includes features like custom request/response hooks, automatic authentication token refresh, and built-in rate limiting.

## Table of Contents

- [Installation](#installation)
- [Compatibility](#compatibility)
- [Usage](#usage)
  - [Getting Started](#getting-started)
    - [Bearer Token Authentication](#bearer-token-authentication)
    - [Client Credentials Authentication](#client-credentials-authentication)
  - [Querying the API](#querying-the-api)
    - [readByQuery](#readbyquery)
    - [readById](#readbyid)
  - [Fetching $metadata](#fetching-metadata)
  - [Rate Limiting](#rate-limiting)
  - [Hooks](#hooks)
  - [Error Handling](#error-handling)
- [Contributing](#contributing)
- [License](#license)

## Installation

Install with your preferred package manager:

```bash
pnpm add reso.js
# or
npm install reso.js
# or
yarn add reso.js
```

## Compatibility

This library works with any RESO-compliant server following the [RESO Web API spec](https://github.com/RESOStandards/transport). Additionally, it provides official support for:

- [Spark Platform](https://sparkplatform.com)
- [Trestle](https://trestle.corelogic.com)
- [Bridge Interactive](https://www.bridgeinteractive.com)
- [MLS Grid](https://www.mlsgrid.com)

## Usage

### Getting Started

`reso.js` supports both **Bearer Token** and **Client Credentials** authentication strategies. Refer to your feed's documentation for your feeds supported strategy and how to obtain credentials.

#### Bearer Token Authentication

```js
import { createFeed } from 'reso.js';

const feed = createFeed({
	http: {
		baseURL: 'http://my-reso-api.com',
	},
	auth: {
		type: 'token',
		credentials: {
			token: 'MY_TOKEN',
		},
	},
});
```

> The bearer token provided must not expire.

#### Client Credentials Authentication

```js
import { createFeed } from 'reso.js';

const feed = createFeed({
	http: {
		baseURL: 'http://my-reso-api.com',
	},
	auth: {
		type: 'credentials',
		 credentials :{
      tokenURL: 'http://my-reso-api.com/token'
      clientId: 'MY_CLIENT_ID'
      clientSecret: 'MY_CLIENT_SECRET'
    }
	},
});
```

You can optionally include `grantType` and `scope`. Tokens will automatically refresh 30 seconds before expiry by default.

To custom the refresh buffer it can be passed in the with the auth strategy:

```js
import { createFeed } from 'reso.js';

const feed = createFeed({
	http: {
		baseURL: 'http://my-reso-api.com',
	},
	auth: {
		type: 'credentials',
    credentials :{
      tokenURL: 'http://my-reso-api.com/token'
      clientId: 'MY_CLIENT_ID'
      clientSecret: 'MY_CLIENT_SECRET'
    },
		refreshBuffer:40000,
	},
});
```

### Querying the API

#### `readByQuery`

Perform a RESO-compliant query. The function is an async generator that will auto paginate any next pages if the nextLink is present every time `.next()` is called or the result is looped over.

```js
for await (let properties of feed.readByQuery('Property', '$filter=ListPrice gt 100000')) {
	for (property of properties.values) {
		console.log(property);
	}
}
```

#### `readById`

Retrieve a specific record by ID:

```js
const myProperty = await feed.readyById('Property', 123);
console.log(myProperty.value);
```

### Fetching `$metadata`

Get the feed’s metadata XML:

```js
const metadata = await feed.$metadata();
console.log(metadata);
```

### Rate Limiting

Rate limiting is built-in for supported providers. You can also customize limits:

```js
const feed = createFeed({
	http: {
		baseURL: 'http://my-reso-api.com',
	},
	limiter: {
		duration: 30000, // 30 seconds
		points: 5, // max 5 requests per duration
	},
});
```

> `duration` defines the time window in milliseconds, and `points` sets the maximum number of requests allowed within that window.

### Hooks

The clients behaviour can be customized with the following supported hooks:

- `onRequest`
- `onRequestError`
- `onResponse`
- `onResponseError`

These are backed by [ofetch interceptors](https://github.com/unjs/ofetch?tab=readme-ov-file#%EF%B8%8F-interceptors). Additional hooks will be added/supported as needed.

**Example** – Appending `/replication` to `Property` requests:

```js
hooks: {
  onRequest: [
    ({ request }) => {
      if (request.toLowerCase().includes('property')) {
        request += '/replication';
      }
    },
  ],
},
```

### Error Handling

The client throws a `FeedError` with detailed RESO error info:

```js
try {
	const myProperty = await feed.readById('Property', 123);
	console.log(myProperty.value);
} catch (error) {
	if (error instanceof FeedError) {
		console.log(error.details);
	}
}
```

## Contributing

Bug reports, pull requests and feature discussions are welcome on [GitHub](https://github.com/ComfortablyCoding/reso.js)

## License

[MIT License](https://github.com/ComfortablyCoding/reso.js/blob/main/LICENSE)
