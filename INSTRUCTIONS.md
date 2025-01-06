Below is one possible approach to creating a `TypedKy` type (and corresponding instance type) which augments **ky** usage with strongly-typed `json` and `searchParams` for each route/method.

## 1\. Defining `RouteTypes`

You mentioned an example `RouteTypes` might look like:

```ts
interface RouteTypes {
  "things/add": {
    POST: {
      requestJson: {
        name: string
      }
      responseJson: {
        thing: { name: string; thing_id: string }
      }
    }
  }
  "things/get": {
    GET: {
      searchParams: { thing_id: string }
      responseJson: {
        thing: { name: string; thing_id: string }
      }
    }
  }
}
```

Such a shape indicates that each key is a route (e.g. `"things/add"`), whose value is an object keyed by HTTP method (`"GET" | "POST" | "PUT" | ...`) with an optional `requestJson`, an optional `searchParams`, and a `responseJson`.

## 2\. Creating a `TypedKyInstance<T>`

Typically, **ky** usage looks like:

```ts
ky.get('some/path', { searchParams: { ... } })
ky.post('some/path', { json: { ... } })
```

To preserve that style (rather than something like `ky('POST', 'some/path')`), we can create a `TypedKyInstance<T>` that has strongly-typed `get`, `post`, `put`, `patch`, and `delete` methods. Each method only allows you to call routes that have that method defined, and will type `options.json` / `options.searchParams` correctly based on the route’s definition.

### Step A: A helper type for extracting which routes can be called with a given method

```ts
/**
 * For a given RouteTypes T and method M, this picks out all route keys
 * that define that method M.
 */
type RoutesWithMethod<T extends RouteTypes, M extends string> = {
  [K in keyof T]: M extends keyof T[K] ? K : never
}[keyof T]
// If M = "GET", then for each route K in T, we check if T[K] has a "GET" key.
```

### Step B: A helper type for building the options for a given route & method

We want to combine the usual **ky** `Options` but exclude `method`, `json`, and `searchParams` (so that we can re-type them). We then conditionally add `json` if the route’s method includes a `requestJson` field, and `searchParams` if the route’s method includes a `searchParams` field.

```ts
import { Options as KyOptions } from "ky"

type MethodOptions<
  T extends RouteTypes,
  R extends keyof T,
  M extends keyof T[R]
> = Omit<KyOptions, "method" | "json" | "searchParams"> &
  // If the route method has a requestJson, require `json`; else it's optional
  (T[R][M] extends { requestJson: infer RJ }
    ? { json: RJ }
    : { json?: undefined }) &
  // If the route method has searchParams, require `searchParams`; else it's optional
  (T[R][M] extends { searchParams: infer SP }
    ? { searchParams: SP }
    : { searchParams?: undefined })
```

### Step C: Define the `TypedKyInstance<T>` interface

We now create the main interface for a typed ky-like instance. It has five methods—`get`, `post`, `put`, `patch`, `delete`—each restricting route usage to those that define that method and returning `Promise` of the `responseJson` type:

```ts
export interface TypedKyInstance<T extends RouteTypes> {
  get<R extends RoutesWithMethod<T, "GET">>(
    route: R,
    options?: MethodOptions<T, R, "GET">
  ): Promise<T[R]["GET"]["responseJson"]>

  post<R extends RoutesWithMethod<T, "POST">>(
    route: R,
    options?: MethodOptions<T, R, "POST">
  ): Promise<T[R]["POST"]["responseJson"]>

  put<R extends RoutesWithMethod<T, "PUT">>(
    route: R,
    options?: MethodOptions<T, R, "PUT">
  ): Promise<T[R]["PUT"]["responseJson"]>

  patch<R extends RoutesWithMethod<T, "PATCH">>(
    route: R,
    options?: MethodOptions<T, R, "PATCH">
  ): Promise<T[R]["PATCH"]["responseJson"]>

  delete<R extends RoutesWithMethod<T, "DELETE">>(
    route: R,
    options?: MethodOptions<T, R, "DELETE">
  ): Promise<T[R]["DELETE"]["responseJson"]>
}
```

### Step D: Putting it all together

For reference, here is a minimal complete snippet:

```ts
import { Options as KyOptions } from "ky"

/** Shape of your route definitions */
export interface RouteTypes {
  [route: string]: {
    [method: string]: {
      requestJson?: any
      searchParams?: Record<string, any>
      responseJson: any
    }
  }
}

/** Return only routes that define method M */
type RoutesWithMethod<T extends RouteTypes, M extends string> = {
  [K in keyof T]: M extends keyof T[K] ? K : never
}[keyof T]

/** Merge ky's options with typed json/searchParams from T[route][method]. */
type MethodOptions<
  T extends RouteTypes,
  R extends keyof T,
  M extends keyof T[R]
> = Omit<KyOptions, "method" | "json" | "searchParams"> &
  (T[R][M] extends { requestJson: infer RJ }
    ? { json: RJ }
    : { json?: undefined }) &
  (T[R][M] extends { searchParams: infer SP }
    ? { searchParams: SP }
    : { searchParams?: undefined })

/** The main typed-ky interface */
export interface TypedKyInstance<T extends RouteTypes> {
  get<R extends RoutesWithMethod<T, "GET">>(
    route: R,
    options?: MethodOptions<T, R, "GET">
  ): Promise<T[R]["GET"]["responseJson"]>

  post<R extends RoutesWithMethod<T, "POST">>(
    route: R,
    options?: MethodOptions<T, R, "POST">
  ): Promise<T[R]["POST"]["responseJson"]>

  put<R extends RoutesWithMethod<T, "PUT">>(
    route: R,
    options?: MethodOptions<T, R, "PUT">
  ): Promise<T[R]["PUT"]["responseJson"]>

  patch<R extends RoutesWithMethod<T, "PATCH">>(
    route: R,
    options?: MethodOptions<T, R, "PATCH">
  ): Promise<T[R]["PATCH"]["responseJson"]>

  delete<R extends RoutesWithMethod<T, "DELETE">>(
    route: R,
    options?: MethodOptions<T, R, "DELETE">
  ): Promise<T[R]["DELETE"]["responseJson"]>
}
```

## 3\. Example Usage

Suppose we define:

```ts
// Your RouteTypes
interface MyRoutes {
  "things/add": {
    POST: {
      requestJson: { name: string }
      responseJson: { thing: { name: string; thing_id: string } }
    }
  }
  "things/get": {
    GET: {
      searchParams: { thing_id: string }
      responseJson: { thing: { name: string; thing_id: string } }
    }
  }
}

// Then you might have a function that creates your typedKy instance:
function createTypedKy<T extends RouteTypes>(kyBase: any): TypedKyInstance<T> {
  return {
    get(route, options) {
      return kyBase.get(route, { ...options }).json()
    },
    post(route, options) {
      return kyBase.post(route, { ...options }).json()
    },
    put(route, options) {
      return kyBase.put(route, { ...options }).json()
    },
    patch(route, options) {
      return kyBase.patch(route, { ...options }).json()
    },
    delete(route, options) {
      return kyBase.delete(route, { ...options }).json()
    },
  }
}

// Create an instance for our MyRoutes
const typedKy = createTypedKy<MyRoutes>(ky)

// Now usage is strongly typed:
async function test() {
  // POST to "things/add" => must pass `json: { name: string }`
  const addRes = await typedKy.post("things/add", { json: { name: "MyThing" } })
  // addRes is { thing: { name: string; thing_id: string } }

  // GET from "things/get" => must pass `searchParams: { thing_id: string }`
  const getRes = await typedKy.get("things/get", {
    searchParams: { thing_id: "ABC123" },
  })
  // getRes is { thing: { name: string; thing_id: string } }
}
```

Because of the type definitions, you’ll get immediate compile-time warnings if you leave out required `json` or `searchParams`, supply the wrong property names, or call the wrong HTTP method on a route that doesn’t support it.

---

### That’s it!

With this pattern:

1. You define an interface describing each route and which methods it supports.
2. The `TypedKyInstance` type infers `json` and `searchParams` from your `RouteTypes`.
3. You get type-safe calls that mirror **ky**’s usual `.get()/.post()` usage but with strongly typed request and response objects.
