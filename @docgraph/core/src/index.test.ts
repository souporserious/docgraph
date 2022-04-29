import { Graph } from "."

it("adds source to graph", () => {
  const graph = new Graph()

  graph.addSource({
    id: "utils",
    path: "src/transform-code.ts",
  })

  expect(graph.sources.length).toBe(1)
})

it("adds source with loader to graph", async () => {
  const graph = new Graph()

  graph.addSource({
    id: "icons",
    loader: () =>
      Promise.resolve([
        {
          label: "icons",
          slug: "icons",
          data: {},
        },
      ]),
  })

  console.log(graph)
})
