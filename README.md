# reso.js

**`reso.js`** is a robust, Typescript-first `Node.js` client designed for interacting with RESO Web API services.

It is _fully compliant_ with the current [RESO Web API specification](https://github.com/RESOStandards/transport) and provides commonly used features out-of-the-box, including:

- **Automatic Pagination**
- **Authentication**
- **Built-in Rate Limiting**

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

`reso.js` supports both **Bearer Token** and **Client Credentials** authentication strategies. Refer to your feed's documentation for your the supported strategy and how to obtain credentials.

#### Bearer Token Authentication

This strategy is used when you have a long-lived, non-expiring token.

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

This strategy is required when the provider uses the OAuth 2.0 Client Credentials flow, it will autemtically refresh the token before it expires.

```js
import { createFeed } from 'reso.js';

const feed = createFeed({
	http: {
		baseURL: 'http://my-reso-api.com',
	},
	auth: {
		type: 'credentials',
		credentials: {
			tokenURL: 'http://my-reso-api.com/token',
			clientId: 'MY_CLIENT_ID',
			clientSecret: 'MY_CLIENT_SECRET',
			// Optional: grantType and scope
		},
		// Optional: Custom refresh buffer (default is 30,000ms / 30 seconds)
		// refreshBuffer: 40000,
	},
});
```

### Types Safety (Typescript)

For an enhanced development experience, you can pass a generic type to `createFeed` to auto type the client to your resources shapes, enabling full type-safety for all operations.

```ts
import { createFeed } from 'reso.js';

// 1. Define the TypeScript interface for your RESO resources.
// This generic type maps resource names (e.g., 'Property') to their expected shape.
interface Resources {
	Property: {
		ListingId: string;
		ListPrice: number;
		// ... all other expected properties
	};
	Agent: { Name: string };
}

// 2. Create the feed instance, applying the Resources generic.
const feed = createFeed<Resources>({
	http: {
		baseURL: 'http://my-reso-api.com',
	},
	// ... config
});

// 3. Read a specific resource by ID.
// Because the feed is typed with <Resources>, the 'Property' resource
// and the 'myProperty' response are fully type-safe, preventing runtime errors.
const myProperty = await feed.readById('Property', 123);

// This access is now guaranteed to be type-safe!
console.log(myProperty.data.ListingId);
```

### Querying the API

#### `readByQuery`

Perform a RESO-compliant query. The function is an **async generator** that handles auto pagination for you. Use a `for await...of` loop to iterate through all pages of results.

```js
for await (let properties of feed.readByQuery('Property', '$filter=ListPrice gt 100000')) {
	for (property of properties.data) {
		console.log(property);
	}
}
```

#### `readById`

Retrieve a specific record by ID:

```js
const myProperty = await feed.readyById('Property', 123);
console.log(myProperty.data);
```

### Fetching `$metadata`

Get the feed’s metadata XML:

```js
const metadata = await feed.$metadata();
console.log(metadata); // The raw XML string
```

### Rate Limiting

Rate limiting is built-in for supported providers. You can also customize limits:

| Parameter      | Type          | Description                                       |
| :------------- | :------------ | :------------------------------------------------ |
| **`duration`** | `number` (ms) | The time window for the limit.                    |
| **`points`**   | `number`      | The maximum requests allowed within the duration. |

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

Customize the client's behavior by passing an object of supported hooks (based on [ofetch interceptors](https://github.com/unjs/ofetch?tab=readme-ov-file#%EF%B8%8F-interceptors)).

The clients behaviour can be customized with the following supported hooks:

| Hook              | Purpose                                               |
| :---------------- | :---------------------------------------------------- |
| `onRequest`       | Modify the request before it's sent.                  |
| `onRequestError`  | Handle errors during the request setup.               |
| `onResponse`      | Inspect/Modify the response data after it's received. |
| `onResponseError` | Handle HTTP errors (e.g., 4xx, 5xx) before throwing.  |

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

The client throws a custom `FeedError` with detailed RESO error information:

```js
try {
	const myProperty = await feed.readById('Property', 123);
	console.log(myProperty.data);
} catch (error) {
	if (error instanceof FeedError) {
		console.log(error.details);
	}
}
```

## Contributing

Bug reports, pull requests and feature discussions are welcome at [GitHub](https://github.com/ComfortablyCoding/reso.js)

## License

[MIT License](https://github.com/ComfortablyCoding/reso.js/blob/main/LICENSE)
