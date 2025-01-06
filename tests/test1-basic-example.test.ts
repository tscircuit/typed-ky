import { test, expect } from "bun:test"
import { getExampleServer } from "./fixtures/example-server"

test("basic example with types", async () => {
  const testServerUrl = await getExampleServer()

  // TODO use the type ky thing
})
