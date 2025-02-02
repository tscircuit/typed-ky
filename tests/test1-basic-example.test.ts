import { test, expect } from "bun:test"
import { getExampleServer } from "./fixtures/example-server"
import { createTypedKy } from "../lib"
import type { ExampleApiRoutes } from "./fixtures/example-server"
import { expectType } from "ts-expect"

test("basic example with types", async () => {
  const testServerUrl = await getExampleServer()
  const api = createTypedKy<keyof ExampleApiRoutes, ExampleApiRoutes>({
    prefixUrl: testServerUrl,
  })

  // Add a new thing
  const addResponse = await api
    .post("things/add", {
      json: { name: "test thing" },
    })
    .json()
  expect(addResponse.thing_count).toBe(1)
  expect(typeof addResponse.thing_count).toBe("number")

  // Get the thing we just created
  const getResponse = await api
    .get("things/get", {
      searchParams: { thing_id: "1" },
    })
    .json()

  expectType<{ thing: { name: string; thing_id: string } }>(getResponse)
})
