import type { Project } from "ts-morph"
import esbuild from "esbuild"
import matter from "gray-matter"
import { dirname } from "path"
import { StringDecoder } from "string_decoder"
import type { AsyncReturnType } from "type-fest"
import type { FileData } from "@docgraph/rehype"
import { rehypePlugin, getHighlighter } from "@docgraph/rehype"
import { addExamplesFromCodeBlocks } from "./add-examples-from-code-blocks"
import { getHeadingsFromMarkdown } from "./get-headings-from-markdown"

let highlighter: AsyncReturnType<typeof getHighlighter>

export async function bundleMDX({
  path,
  theme,
  project,
}: {
  path: string
  theme?: string
  project?: Project
}) {
  let data = null

  /** Only load the shiki highlighter once. */
  if (highlighter === undefined) {
    highlighter = await getHighlighter()
  }

  const workingDirectory = dirname(path)
  const mdx = (await import("@mdx-js/esbuild")).default
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
        rehypePlugins: [
          [
            rehypePlugin,
            {
              highlighter,
              onFileData: (data: FileData) => {
                if (project) {
                  addExamplesFromCodeBlocks({
                    directoryPath: dirname(data.path),
                    codeBlocks: data.codeBlocks,
                    project,
                  })
                }
              },
            },
          ],
        ],
      }),
    ],
    external: ["react", "react-dom", "@mdx-js/react"],
  })
  const bundledMDX = new StringDecoder("utf-8").write(Buffer.from(result.outputFiles[0].contents))

  return {
    code: bundledMDX,
    data,
  }
}

export async function bundle({
  path,
  project,
  theme,
  contents,
}: {
  path: string
  project?: Project
  theme?: string
  contents: string
}) {
  try {
    const result = matter(contents)
    const { code } = await bundleMDX({ path, project, theme })

    return {
      data: {
        ...result.data,
        headings: getHeadingsFromMarkdown(contents),
      },
      // code: await transformCode(code)
      code,
    }
  } catch (error) {
    throw Error(`Error parsing MDX at "${path}": ${error}`)
  }
}
