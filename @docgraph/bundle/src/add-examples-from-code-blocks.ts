import type { FileData } from "@docgraph/rehype"
import type { Project } from "ts-morph"
import { resolve } from "path"

export function addExamplesFromCodeBlocks({
  codeBlocks,
  directoryPath,
  project,
}: {
  codeBlocks: FileData["codeBlocks"]
  directoryPath: string
  project: Project
}) {
  let exampleId = 0

  codeBlocks.forEach(({ text, language }) => {
    if (["js", "jsx", "ts", "tsx"].includes(language)) {
      const examplePath = resolve(directoryPath, "examples", `${exampleId++}.tsx`)
      const exampleSource = project.getSourceFile(examplePath)

      if (exampleSource === undefined) {
        project.createSourceFile(examplePath, text)
      }
    }
  })

  // const exampleSourceFiles = project.getSourceFiles(resolve(directoryPath, "examples/*.tsx"))
  // const exampleIndexPath = resolve(directoryPath, "examples/index.ts")
  // let exampleIndexSourceFile = project.getSourceFile(exampleIndexPath)!

  // if (exampleIndexSourceFile === undefined) {
  //   exampleIndexSourceFile = project.createSourceFile(exampleIndexPath)
  // }

  // exampleSourceFiles.forEach((sourceFile) => {
  //   const exportedDeclarations = Array.from(sourceFile.getExportedDeclarations())

  //   exampleIndexSourceFile.addExportDeclaration({
  //     moduleSpecifier: sourceFile.getRelativePathAsModuleSpecifierTo(sourceFile.getFilePath()),
  //     namedExports: exportedDeclarations.map(([name]) => name),
  //   })
  // })
}
