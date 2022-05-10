import type { Element, ElementContent } from "hast"
import type { Node } from "hast-util-to-string"
import type { Project } from "ts-morph"
import type { AsyncReturnType } from "type-fest"
import * as shiki from "shiki"
import { dirname, resolve } from "path"
import { access, findAll, findIndexPath } from "tree-visit"

function tokensToHast(lines: shiki.IThemedToken[][]) {
  const tree: ElementContent[] = []

  lines.forEach((line) => {
    if (line.length === 0) {
      tree.push({ type: "text", value: "\n" })
    } else {
      line.forEach((token) => {
        let style = `color: ${token.color};`

        if (token.fontStyle === shiki.FontStyle.Italic) {
          style += " font-style: italic;"
        }
        if (token.fontStyle === shiki.FontStyle.Bold) {
          style += " font-weight: bold;"
        }
        if (token.fontStyle === shiki.FontStyle.Underline) {
          style += " text-decoration: underline;"
        }

        tree.push({
          type: "element",
          tagName: "span",
          properties: { style },
          children: [{ type: "text", value: token.content }],
        })
      })

      tree.push({ type: "text", value: "\n" })
    }
  })

  tree.pop()

  return tree
}

type Languages = shiki.Lang[]

const defaultLanguages: Languages = ["js", "jsx", "ts", "tsx", "bash", "json", "yaml"]

function getLanguage(className: string[] = []) {
  const language = className.find((name) => name.startsWith("language-"))

  return (language ? language.slice(9) : null) as Languages[number] | null
}

export async function getHighlighter(languages: Languages = defaultLanguages) {
  // const loadedTheme = await shiki.loadTheme(theme)
  const theme = "css-variables"
  const highlighter = await shiki.getHighlighter({ theme, langs: languages })

  return (code: string, language: shiki.Lang) => {
    return highlighter.codeToThemedTokens(code, language, theme, {
      includeExplanation: false,
    })
  }
}

const getChildren = (node: Node) => {
  return node.type === "root" || node.type === "element" ? node.children : []
}

export function rehypePlugin({
  project,
  highlighter,
}: {
  project: Project
  highlighter: AsyncReturnType<typeof getHighlighter>
}) {
  let toString: Awaited<typeof import("hast-util-to-string")>["toString"]

  return async function transformer(tree: Element, file: any, state: any) {
    toString = (await import("hast-util-to-string")).toString

    const codeBlockNodes = findAll(tree, {
      getChildren,
      predicate: (node) => {
        const indexPath = findIndexPath(tree, {
          getChildren,
          predicate: (nodeToCompare) => nodeToCompare === node,
        })

        if (!indexPath) {
          return false
        }

        const parentIndexPath = indexPath.slice(0, -1)
        const parentNode = access(tree, parentIndexPath, { getChildren })
        // const grandParentIndexPath = parentIndexPath.slice(0, -1)
        // const grandParentNode = access(tree, grandParentIndexPath, { getChildren })
        const isParentPreElement = parentNode.type === "element" && parentNode.tagName === "pre"
        const isCodeElement = node.type === "element" && node.tagName === "code"

        return isParentPreElement && isCodeElement
      },
    })

    const directoryPath = dirname(file.path)
    let exampleId = 0

    codeBlockNodes.forEach((node) => {
      if (node.type !== "element") {
        return
      }

      if (node.properties) {
        const classNames = (node.properties?.className || []) as string[]
        const language = getLanguage(classNames)

        if (language) {
          const codeString = toString(node)

          /** Include the code in TS Morph if it is JavaScripty. */
          if (["js", "jsx", "ts", "tsx"].includes(language)) {
            const examplePath = resolve(directoryPath, "examples", `${exampleId++}.tsx`)
            const exampleSource = project.getSourceFile(examplePath)

            if (exampleSource === undefined) {
              project.createSourceFile(examplePath, codeString)
            }
          }

          const tokens = highlighter(codeString, language)

          node.children = tokensToHast(tokens)
        }
      }
    })

    const exampleSourceFiles = project.getSourceFiles(resolve(directoryPath, "examples/*.tsx"))
    const exampleIndexPath = resolve(directoryPath, "examples/index.ts")
    let exampleIndexSourceFile = project.getSourceFile(exampleIndexPath)!

    if (exampleIndexSourceFile === undefined) {
      exampleIndexSourceFile = project.createSourceFile(exampleIndexPath)
    }

    exampleSourceFiles.forEach((sourceFile) => {
      const exportedDeclarations = Array.from(sourceFile.getExportedDeclarations())

      exampleIndexSourceFile.addExportDeclaration({
        moduleSpecifier: sourceFile.getRelativePathAsModuleSpecifierTo(sourceFile.getFilePath()),
        namedExports: exportedDeclarations.map(([name]) => name),
      })
    })
  }
}
