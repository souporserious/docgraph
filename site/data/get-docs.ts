import { capitalCase, kebabCase } from "case-anything"
import { parseMDX } from "./parse-mdx"
import { docsSourceFiles } from "./project"

export async function getDocs() {
  const allMDXDocs = await Promise.all(
    docsSourceFiles.map((sourceFile) =>
      parseMDX(sourceFile.getFilePath(), sourceFile.getSourceFile().getFullText())
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
