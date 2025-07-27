# node-multi-curl

A performant multi-curl class in Node.js that supports working with proxies and concurrent requests.

## Features

- Parallel HTTP requests with concurrency control
- Proxy support with automatic rotation
- Docker integration for HTTP/2 support
- Axios-like API for ease of use
- Request/response interceptors
- Automatic retry mechanism

## Installation

```bash
npm install node-multi-curl
```

## Quick Start

```javascript
const { MultiCurl } = require('node-multi-curl');

// Simple GET request
const response = await MultiCurl.get('https://example.com/api');

// Multiple concurrent requests
const client = new MultiCurl({ concurrency: 5 });
const responses = await client.execute([
  { url: 'https://example.com/api/users' },
  { url: 'https://example.com/api/products' },
  { url: 'https://example.com/api/orders' }
]);
```

## Documentation

For detailed documentation and examples, check the [examples](./examples) directory.

## License

MIT# node-multi-curl
# node-multi-curl
