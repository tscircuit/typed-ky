import { test, expect } from "bun:test"
import { getExampleServer } from "./fixtures/example-server"
import { createTypedKy } from "../lib"
import type { ExampleApiRoutes } from "./fixtures/example-server"

test("basic example with types", async () => {
  const testServerUrl = await getExampleServer()
  const api = createTypedKy<keyof ExampleApiRoutes, ExampleApiRoutes>({
    prefixUrl: testServerUrl,
  })

  // Add a new thing
  const addResponse = await api.post("things/add", {
    json: { name: "test thing" },
  })
  expect(addResponse.thing.name).toBe("test thing")
  expect(typeof addResponse.thing.thing_id).toBe("string")

  // Get the thing we just created
  const getResponse = await api.get("things/get", {
    searchParams: { thing_id: addResponse.thing.thing_id },
  })
  expect(getResponse.thing).toEqual(addResponse.thing)
})
