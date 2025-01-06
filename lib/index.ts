import type { Options as KyOptions } from "ky"
import ky from "ky"

/** Shape of your route definitions */
export type RouteTypes<Paths extends string> = {
  [path in Paths]: Partial<
    Record<"GET" | "POST" | "PUT" | "DELETE" | "PATCH", any>
  >
}

/** Return only routes that define method M */
type RoutesWithMethod<
  Paths extends string,
  T extends RouteTypes<Paths>,
  M extends string,
> = {
  [K in keyof T]: M extends keyof T[K] ? K : never
}[keyof T]

/** Merge ky's options with typed json/searchParams from T[route][method]. */
type MethodOptions<
  Paths extends string,
  T extends RouteTypes<Paths>,
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
export interface TypedKyInstance<
  Paths extends string,
  T extends RouteTypes<Paths>,
> {
  get<R extends RoutesWithMethod<Paths, T, "GET">>(
    route: R,
    options?: MethodOptions<Paths, T, R, "GET">,
  ): Promise<T[R]["GET"]["responseJson"]>

  post<R extends RoutesWithMethod<Paths, T, "POST">>(
    route: R,
    options?: MethodOptions<Paths, T, R, "POST">,
  ): Promise<T[R]["POST"]["responseJson"]>

  put<R extends RoutesWithMethod<Paths, T, "PUT">>(
    route: R,
    options?: MethodOptions<Paths, T, R, "PUT">,
  ): Promise<T[R]["PUT"]["responseJson"]>

  patch<R extends RoutesWithMethod<Paths, T, "PATCH">>(
    route: R,
    options?: MethodOptions<Paths, T, R, "PATCH">,
  ): Promise<T[R]["PATCH"]["responseJson"]>

  delete<R extends RoutesWithMethod<Paths, T, "DELETE">>(
    route: R,
    options?: MethodOptions<Paths, T, R, "DELETE">,
  ): Promise<T[R]["DELETE"]["responseJson"]>
}

export function createTypedKy<
  Paths extends string,
  T extends RouteTypes<Paths>,
>(kyOptions: KyOptions): TypedKyInstance<Paths, T> {
  const kyInstance = ky.create(kyOptions)

  return {
    get(route, options) {
      return kyInstance.get(route as string, options as any).json()
    },
    post(route, options) {
      return kyInstance.post(route as string, options as any).json()
    },
    put(route, options) {
      return kyInstance.put(route as string, options as any).json()
    },
    patch(route, options) {
      return kyInstance.patch(route as string, options as any).json()
    },
    delete(route, options) {
      return kyInstance.delete(route as string, options as any).json()
    },
  }
}
