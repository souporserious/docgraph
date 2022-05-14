import esbuild from "esbuild"
import type { AsyncReturnType } from "type-fest"
import type { FileData } from "@docgraph/rehype"
import { rehypePlugin, getHighlighter } from "@docgraph/rehype"

let highlighter: AsyncReturnType<typeof getHighlighter>

export async function bundle({
  entryPoints,
  workingDirectory,
  theme,
}: {
  entryPoints: string[]
  workingDirectory?: string
  theme?: string
}) {
  let data = null

  /** Only load the shiki highlighter once. */
  if (highlighter === undefined) {
    highlighter = await getHighlighter()
  }

  const mdx = (await import("@mdx-js/esbuild")).default
  const allFileData: FileData[] = []
  const result = await esbuild.build({
    entryPoints: entryPoints,
    absWorkingDir: workingDirectory,
    target: "esnext",
    format: "esm",
    platform: "node",
    outdir: "dist",
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
              onFileData: (fileData: FileData) => {
                allFileData.push(fileData)
              },
            },
          ],
        ],
      }),
    ],
    external: ["react", "react-dom", "@mdx-js/react"],
  })
  const texts = result.outputFiles.map((file) => file.text)
  const getFileData = (filePath: string) => {
    const { path, ...data } = allFileData.find((fileData) => fileData.path === filePath) || {}
    return data
  }

  return entryPoints.map((path, index) => ({
    path,
    data: getFileData(path),
    code: texts[index],
  }))
}
