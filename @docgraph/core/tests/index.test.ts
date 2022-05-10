// import { Graph } from '../src'

// it('adds source to graph', () => {
//   const graph = new Graph({
//     workingDirectory: __dirname,
//     tsConfig: '../tsconfig.json',
//   })

//   graph.addSource({
//     id: 'utils',
//     path: 'utils/index.ts',
//   })

//   expect(graph.sources.length).toBe(1)
// })

// it('adds source to graph strictly from loader', async () => {
//   const graph = new Graph({
//     workingDirectory: __dirname,
//     tsConfig: '../tsconfig.json',
//   })

//   graph.addSource({
//     id: 'icons',
//     loader: () =>
//       Promise.resolve([
//         {
//           label: 'Icons',
//           slug: 'icons',
//           data: [],
//         },
//       ]),
//   })
// })

// it('link two sources to each other', async () => {
//   const graph = new Graph({
//     workingDirectory: __dirname,
//     tsConfig: '../tsconfig.json',
//   })

//   const utils = graph.addSource({
//     id: 'utils',
//     path: 'utils/index.ts',
//   })

//   const docs = graph.addSource({
//     id: 'examples',
//     path: 'README.mdx',
//   })

//   const examples = graph.addSource({
//     id: 'examples',
//     path: 'examples/*.ts',
//     // links: [utils, docs], // searches sources for all [[utils]] and [[docs]] links including any exported symbols
//     // loader: async () => { // more granular control over how to load and transform data
//     //   return new Function("return []")()
//     // },
//   })
// })

// it('generates a list of links for a source', async () => {
//   const graph = new Graph({
//     workingDirectory: __dirname,
//     tsConfig: '../tsconfig.json',
//   })

//   const examples = graph.addSource({
//     id: 'examples',
//     path: 'examples/*.ts',
//   })

//   const utils = await graph.addSource({
//     id: 'utils',
//     path: 'utils/index.ts',
//   })

//   expect(utils.links).toMatchObject([
//     {
//       id: 'add',
//       label: 'add',
//       slug: 'add',
//       links: { utils },
//       // references
//       // note the name here comes from the source id, might be best to scope to references.examples: []
//       // examples: [], // link is created here and will have all examples that reference the "add" function, this can be scoped based on relevance
//     },
//   ])
// })

// it("generates a list of links for a source", async () => {
//   const graph = new Graph({
//     workingDirectory: __dirname,
//     tsConfigFilePath: "../tsconfig.json",
//   })

//   const utils = await graph.addSource({
//     id: "utils",
//     path: "utils/index.ts",
//   })

//   expect(utils.links).toMatchObject([
//     {
//       id: "add",
//       label: "add",
//       slug: "add",
//       source: "utils",
//       target: "utils",
//     },
//     {
//       id: "addTwoNumbers",
//       label: "addTwoNumbers",
//       slug: "add-two-numbers",
//       source: "utils",
//       target: "utils",
//     },
//     {
//       id: "addManyNumbers",
//       label: "addManyNumbers",
//       slug: "add-many-numbers",
//       source: "utils",
//       target: "utils",
//     },
//   ])
// })
