import { DirectedGraph } from "graphology"
import { Project } from "ts-morph"
import { NodeHtmlMarkdown, NodeHtmlMarkdownOptions } from "node-html-markdown"
import { transformCode } from "./transform-code"
import { compile, evaluate } from "@mdx-js/mdx"
import { executeServerCode } from "./execute-server-code"
import * as runtime from "react/jsx-runtime"
import { renderToString } from "react-dom/server"
import { createElement } from "react"

export { executeClientCode } from "./execute-client-code"
export { executeServerCode } from "./execute-server-code"
export { mdxToMarkdown } from "./mdx-to-markdown"
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
 * import { addFile } from 'topodoc'
 * addFile('components/index.ts')
 */
export async function addFile(path: string) {
  const sourceFile = project.addSourceFileAtPath(path)

  project.resolveSourceFileDependencies()

  //   const runtimeDefault = await runtime.default()

  //   return evaluate(sourceFile.getFullText(), runtimeDefault)

  const { compile } = await import("@mdx-js/mdx")
  const compiledCode = await compile(sourceFile.getFullText())
  const executedCode = await executeServerCode(compiledCode.value.toString())
  const element = createElement(executedCode as any)
  const markdown = NodeHtmlMarkdown.translate(renderToString(element))

  return null
  // return transformCode(compiledCode.value)
}

/**
 * Adds source files to the documentation graph.
 *
 * @example
 * import { addFile } from 'topodoc'
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
