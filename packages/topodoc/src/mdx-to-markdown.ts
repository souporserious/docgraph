import type { CompileOptions } from "@mdx-js/mdx"
import { NodeHtmlMarkdown } from "node-html-markdown"
import { renderToString } from "react-dom/server"
import { createElement } from "react"
import { readFile } from "fs/promises"
import { dirname, resolve } from "path"
import { executeServerCode } from "./execute-server-code"

const htmlToMarkdown = new NodeHtmlMarkdown()

/**
 * Converts MDX to Markdown. This is useful for rendering dynamic README.md files.
 *
 * @example
 * import { readFile } from "fs/promises"
 * import { mdxToMarkdown } from 'topodoc'
 *
 * const contents = await readFile('README.mdx', 'utf8')
 */
export async function mdxToMarkdown(
  /** The path to the MDX file. */
  path: string,
  {
    cwd,
    compileOptions,
  }: {
    /** The current working directory. Defaults to process.cwd(). */
    cwd?: string

    /** MDX [compile options](https://mdxjs.com/packages/mdx/#compilefile-options) */
    compileOptions?: CompileOptions
  } = {}
) {
  const contents = await readFile(resolve(cwd ?? process.cwd(), path), "utf-8")
  const { compile } = await import("@mdx-js/mdx")
  const compiledCode = await compile(contents, compileOptions)
  const executedCode = await executeServerCode(compiledCode.value.toString(), dirname(path))
  const element = createElement(executedCode as any)
  const markdown = htmlToMarkdown.translate(renderToString(element))

  return markdown
}
