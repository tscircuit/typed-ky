import type { Options as KyOptions } from "ky"
import ky from "ky"

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
  M extends keyof T[R],
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
    options?: MethodOptions<T, R, "GET">,
  ): Promise<T[R]["GET"]["responseJson"]>

  post<R extends RoutesWithMethod<T, "POST">>(
    route: R,
    options?: MethodOptions<T, R, "POST">,
  ): Promise<T[R]["POST"]["responseJson"]>

  put<R extends RoutesWithMethod<T, "PUT">>(
    route: R,
    options?: MethodOptions<T, R, "PUT">,
  ): Promise<T[R]["PUT"]["responseJson"]>

  patch<R extends RoutesWithMethod<T, "PATCH">>(
    route: R,
    options?: MethodOptions<T, R, "PATCH">,
  ): Promise<T[R]["PATCH"]["responseJson"]>

  delete<R extends RoutesWithMethod<T, "DELETE">>(
    route: R,
    options?: MethodOptions<T, R, "DELETE">,
  ): Promise<T[R]["DELETE"]["responseJson"]>
}

export function createTypedKy<T extends RouteTypes>(
  prefixUrl: string,
): TypedKyInstance<T> {
  const kyInstance = ky.create({ prefixUrl })

  return {
    get(route, options) {
      return kyInstance.get(route, options).json()
    },
    post(route, options) {
      return kyInstance.post(route, options).json()
    },
    put(route, options) {
      return kyInstance.put(route, options).json()
    },
    patch(route, options) {
      return kyInstance.patch(route, options).json()
    },
    delete(route, options) {
      return kyInstance.delete(route, options).json()
    },
  }
}
