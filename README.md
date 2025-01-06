# typed-ky 🚀

Type-safe HTTP requests with [ky](https://github.com/sindresorhus/ky) and TypeScript.

## Features

- 🎯 Full TypeScript support with route-level type safety
- 🔒 Type-checked request bodies and search parameters
- 📦 Built on top of the excellent [ky](https://github.com/sindresorhus/ky) HTTP client
- 🪶 Zero runtime overhead
- 📝 Great IDE autocompletion

## Installation

```bash
npm install typed-ky
# or
yarn add typed-ky
# or
pnpm add typed-ky
# or
bun add typed-ky
```

## Usage

1. Define your API routes and their types:

```typescript
interface MyApiRoutes {
  "users/create": {
    POST: {
      requestJson: { name: string; email: string }
      responseJson: { id: string; name: string }
    }
  }
  "users/get": {
    GET: {
      searchParams: { id: string }
      responseJson: { user: { id: string; name: string } }
    }
  }
}
```

2. Create a typed client:

```typescript
import { createTypedKy } from 'typed-ky'

const api = createTypedKy<keyof MyApiRoutes, MyApiRoutes>({
  prefixUrl: 'https://api.example.com'
})
```

3. Make type-safe requests:

```typescript
// POST request with typed body
const newUser = await api.post('users/create', {
  json: { 
    name: 'John Doe',
    email: 'john@example.com'
  }
})
// newUser is typed as { id: string; name: string }

// GET request with typed search params
const user = await api.get('users/get', {
  searchParams: { id: '123' }
})
// user is typed as { user: { id: string; name: string } }
```

## Why typed-ky?

- **Type Safety**: Catch API integration errors at compile time
- **Developer Experience**: Get autocomplete for routes, parameters, and response types
- **Maintainable**: Single source of truth for API types
- **Lightweight**: Just a thin wrapper around ky with zero runtime overhead

## API

### `createTypedKy<Paths, Routes>(options)`

Creates a typed HTTP client instance.

- `Paths`: Union type of all route paths
- `Routes`: Route definitions with request/response types
- `options`: All [ky options](https://github.com/sindresorhus/ky#options) are supported

Returns an instance with typed methods:
- `get(route, options)`
- `post(route, options)`
- `put(route, options)`
- `patch(route, options)`
- `delete(route, options)`

## License

MIT
