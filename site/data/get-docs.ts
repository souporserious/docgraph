import { capitalCase, kebabCase } from "case-anything"
import { bundle } from "@docgraph/bundle"
import { docsSourceFiles, project } from "./index"

export async function getDocs() {
  const allMDXDocs = await Promise.all(
    docsSourceFiles.map((sourceFile) =>
      bundle({
        path: sourceFile.getFilePath(),
        contents: sourceFile.getSourceFile().getFullText(),
        project,
      })
    )
  )

  const allDocs = docsSourceFiles.map((sourceFile, index) => {
    const path = sourceFile.getFilePath()
    const baseName = sourceFile.getBaseName()
    const mdx = allMDXDocs[index]
    let name = baseName.replace(/\.mdx$/, "")

    if (mdx.data?.title) {
      name = mdx.data.title
    } else {
      name = capitalCase(name.replace(/\.mdx$/, "")).replace("-", " ")
    }

    return {
      mdx,
      name,
      slug: kebabCase(name),
      path: process.env.NODE_ENV === "development" ? path : path.replace(process.cwd(), ""),
    }
  })

  return allDocs
}

// type Graph = any

// /** Adds source files to the graph and optionally determines how to load the respective data. */
// export function addSource({
//   id,
//   label,
//   description,
//   path,
//   loader,
// }: {
//   /** A unique identifier to access the graph by. */
//   id: string

//   /**
//    * Used to more easily identify the source. Defaults to [[id]].
//    */
//   label?: string

//   /**
//    * Description of the source used for meta tags.
//    */
//   description?: string

//   /**
//    * The glob path[s] for the source files to be loaded. Note, this is optional
//    * and data can be loaded from other sources in the graph or from an external
//    * source through the [[loader]].
//    */
//   path?: string | string[]

//   /**
//    * Loaders are responsible for determining how each node's data is loaded
//    * into the graph. When a loader accesses another source's data, it will halt
//    * the loading process until all dependencies have loaded. Note, each loader
//    * will be ran in the respective order it was accessed.
//    */
//   loader: <Data extends any>(
//     graph: Graph
//   ) => Promise<
//     {
//       /**
//        * Used to more easily identify the source. Defaults to a capital case filename.
//        */
//       label: string

//       /**
//        * Provide a description used as metadata.
//        */
//       description?: string

//       /**
//        * The slug to be used for a route. This should be returned in parts if nested.
//        *
//        * @example
//        * import { addSource } from 'docgraph'
//        *
//        * addSource({
//        *   id: 'components',
//        *   path: 'components/*.tsx',
//        *   loader: async (graph) => [{
//        *     label: 'Button',
//        *     slug: ['components', 'button']
//        *   }]
//        * })
//        */
//       slug: string | string[]

//       /** Data to be stored inside the graph. */
//       data: Data
//     }[]
//   >
// }) {
//   //
// }

// // Now, in practice we can use "addSource" to build a directed graph of our codebase:

// // This will have a similar TS Morph style API for accessing and manipulating files
// const docsSource = addSource({
//   // Helpful meta info
//   id: "docs",
//   label: "Docs",
//   description: "The documentation for the design system.",

//   // Watch for changes
//   path: "docs/**/*.mdx",

//   // Load any data that should be added to the graph.
//   //
//   // Once the data has been accessed from the source through proxies it will create
//   // a relationship between the source and the data which can be visualized.
//   loader: async <{ title: string }>(sourceGraph) => [],
// })

// // - After all sources are created each loader is ran in parallel
// // - If a loader uses a dependency of another portion of the graph it will be halted and wait for that loader to finish
// // - Once the loader dependencies are met the loader will continue to run
// // - This builds a declarative dependency graph between all of our data with minimal effort
// // - This allows us to see all of the relationships at a high-level, and update only the portions we care about

// function mdxLoader() {
//   //
// }

// function reactLoader() {
//   //
// }

// addSource({
//   id: "system",
//   path: "system/**/*.(ts|tsx)",
//   loader: async (sourceGraph) => {
//     // gather types for the entire system
//   },
// })

// addSource({
//   id: "system-examples",
//   path: "system/**/examples/*.(ts|tsx)",
//   loader: async (sourceGraph) => {
//     // link examples to system components, hooks, and utilities
//   },
// })

// addSource({
//   id: "docs",
//   path: "docs/**/*.mdx",
//   loader: async (sourceGraph) => {
//     // gather docs and link symbols from TS types
//   },
// })

// addSource({
//   id: "readmes",
//   path: "system/**/README.mdx",
//   loader: async (sourceGraph) => {
//     // link each README to the local index.ts if it exists
//   },
// })

// export const graph: any = {} // can export mutliple named graphs
