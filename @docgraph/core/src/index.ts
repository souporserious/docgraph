import { DirectedGraph } from "graphology"
import { Project } from "ts-morph"

export { executeClientCode } from "./execute-client-code"
export { executeServerCode } from "./execute-server-code"
export { transformCode } from "./transform-code"

const graph = new DirectedGraph()
const map = new Map<string, Project>()

export function Types({ children }: { children: any }) {
  return null
}

const project = new Project({
  compilerOptions: {
    noEmit: false,
    declaration: true,
    emitDeclarationOnly: true,
  },
  tsConfigFilePath: "tsconfig.json",
  skipAddingFilesFromTsConfig: true,
})

/**
 * Adds source files to the documentation graph.
 *
 * @example
 * import { addFile } from 'docgraph'
 * addFile('components/index.ts')
 */
export async function addFile(path: string) {
  const sourceFile = project.addSourceFileAtPath(path)

  project.resolveSourceFileDependencies()

  //   const runtimeDefault = await runtime.default()

  //   return evaluate(sourceFile.getFullText(), runtimeDefault)

  // const { compile } = await import("@mdx-js/mdx")
  // const compiledCode = await compile(sourceFile.getFullText())

  return null
  // return transformCode(compiledCode.value)
}

/**
 * Adds source files to the documentation graph.
 *
 * @example
 * import { addFile } from 'docgraph'
 * addFile('docs/*.mdx')
 */
export function addFiles(path: string) {
  const sourceFile = project.addSourceFilesAtPaths(path)

  project.resolveSourceFileDependencies()

  return sourceFile
}

/**
 * Retrieve information about a specific node in the graph.
 */
export function getNode() {}
