import esbuild from "esbuild"
import matter from "gray-matter"
import { dirname, resolve } from "path"
import { StringDecoder } from "string_decoder"
import type { AsyncReturnType } from "type-fest"
import { getHighlighter, rehypeShikiPlugin } from "@docgraph/rehype-shiki-plugin"
import { getHeadingsFromMarkdown } from "./get-headings-from-markdown"
// import { rehypeMetaPlugin } from "./rehype-meta-plugin"
import { remarkPlugin } from "./remark-plugin"
import { transformCode } from "./transform-code"

let highlighter: AsyncReturnType<typeof getHighlighter>

export async function bundleMDX(path: string, theme: string) {
  let data = null

  /** Only load the shiki highlighter once. */
  if (highlighter === undefined) {
    highlighter = await getHighlighter()
  }

  const examples: any = []
  const workingDirectory = dirname(path)
  const mdx = (await import("@mdx-js/esbuild")).default
  const remarkFrontmatter = (await import("remark-frontmatter")).default
  const result = await esbuild.build({
    entryPoints: [path],
    absWorkingDir: workingDirectory,
    target: "esnext",
    format: "esm",
    platform: "node",
    bundle: true,
    write: false,
    minify: process.env.NODE_ENV === "production",
    plugins: [
      mdx({
        providerImportSource: "@mdx-js/react",
        remarkPlugins: [
          remarkFrontmatter,
          [
            remarkPlugin,
            {
              examples,
              workingDirectory,
              onData: (yaml: any) => (data = yaml),
            },
          ],
        ],
        rehypePlugins: [[rehypeShikiPlugin, highlighter]],
        // rehypePlugins: [rehypeMetaPlugin, [rehypeShikiPlugin, highlighter]],
      }),
    ],
    external: ["react", "react-dom", "@mdx-js/react"],
  })
  const bundledMDX = new StringDecoder("utf-8").write(Buffer.from(result.outputFiles[0].contents))

  return {
    code: bundledMDX,
    data,
    examples,
  }
}

export async function bundle({
  path,
  themePath = "",
  contents,
}: {
  path: string
  themePath?: string
  contents: string
}) {
  try {
    const result = matter(contents)
    const { code, examples } = await bundleMDX(path, themePath)
    // const transformedCode = await transformCode(code)

    return {
      data: {
        ...result.data,
        headings: getHeadingsFromMarkdown(contents),
      },
      code,
      // code: transformedCode,
      examples,
    }
  } catch (error) {
    throw Error(`Error parsing MDX at "${path}": ${error}`)
  }
}
