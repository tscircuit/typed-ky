import { afterEach } from "bun:test"
import getPort from "get-port"
import type { RouteTypes } from "../../lib"

export const getExampleServer = async () => {
  const things: { name: string; thing_id: string }[] = []
  const port = await getPort()

  const server = Bun.serve({
    port,
    async fetch(req: Request) {
      const url = new URL(req.url)
      const path = url.pathname.slice(1)

      if (path === "things/add" && req.method === "POST") {
        const body = await req.json()
        const thing = {
          name: body.name,
          thing_id: crypto.randomUUID(),
        }
        things.push(thing)
        return Response.json({ thing })
      }

      if (path === "things/get" && req.method === "GET") {
        const thing_id = url.searchParams.get("thing_id")
        const thing = things.find((t) => t.thing_id === thing_id)
        if (!thing) {
          return new Response("Not found", { status: 404 })
        }
        return Response.json({ thing })
      }

      return new Response("Not found", { status: 404 })
    },
  })

  afterEach(() => {
    server.stop()
  })

  return `http://localhost:${port}`
}

export interface ExampleApiRoutes {
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

// ----------- TYPE TEST ----------------
const fn = <T extends string>(a: RouteTypes<T>) => {}
fn(null as any as ExampleApiRoutes)
