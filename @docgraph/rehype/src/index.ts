// Forked from: https://github.com/rehypejs/rehype-slug
import type { Element, ElementContent } from "hast"
// import type { Node } from "hast-util-to-string"
// import type { Project } from "ts-morph"
import type { AsyncReturnType } from "type-fest"
import Slugger from "github-slugger"
import * as shiki from "shiki"

const slugs = new Slugger()

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

type Headings = {
  id: any
  text: string
  level: number
}[]

type CodeBlocks = {
  language: shiki.Lang
  tokens: shiki.IThemedToken[][]
  code: string
}[]

export type FileData = {
  path: string
  headings: Headings
  codeBlocks: CodeBlocks
}

export function rehypePlugin({
  onFileData,
  highlighter,
}: {
  onFileData: (data: FileData) => void
  highlighter: AsyncReturnType<typeof getHighlighter>
}) {
  /** There's probably a much better way to do this, not sure how to work around ESM. */
  let hasProperty: Awaited<typeof import("hast-util-has-property")>["hasProperty"]
  let headingRank: Awaited<typeof import("hast-util-heading-rank")>["headingRank"]
  let toString: Awaited<typeof import("hast-util-to-string")>["toString"]
  let visit: Awaited<typeof import("unist-util-visit")>["visit"]

  return async function transformer(tree: Element, file: any) {
    slugs.reset()

    if (hasProperty === undefined) {
      hasProperty = (await import("hast-util-has-property")).hasProperty
    }
    if (headingRank === undefined) {
      headingRank = (await import("hast-util-heading-rank")).headingRank
    }
    if (toString === undefined) {
      toString = (await import("hast-util-to-string")).toString
    }
    if (visit === undefined) {
      visit = (await import("unist-util-visit")).visit
    }

    const headings: Headings = []

    visit(tree, "element", (node) => {
      const level = headingRank(node)

      if (level && node.properties) {
        if (!hasProperty(node, "id")) {
          node.properties.id = slugs.slug(toString(node))
        }

        headings.push({
          level,
          id: node.properties.id,
          text: node.children.map((child) => toString(child)).join(""),
        })
      }
    })

    const codeBlocks: CodeBlocks = []

    visit(tree, "element", (node) => {
      if (node.tagName === "code" && node.properties) {
        const classNames = (node.properties?.className || []) as string[]
        const language = getLanguage(classNames)

        if (language) {
          const codeString = toString(node)
          const tokens = highlighter(codeString, language)

          codeBlocks.push({
            language,
            tokens,
            code: codeString,
          })

          node.children = tokensToHast(tokens)
        }
      }
    })

    onFileData?.({
      path: file.path,
      headings,
      codeBlocks,
    })

    // const codeBlockNodes = findAll(tree, {
    //   getChildren,
    //   predicate: (node) => {
    //     const indexPath = findIndexPath(tree, {
    //       getChildren,
    //       predicate: (nodeToCompare) => nodeToCompare === node,
    //     })
    //     if (!indexPath) {
    //       return false
    //     }
    //     const parentIndexPath = indexPath.slice(0, -1)
    //     const parentNode = access(tree, parentIndexPath, { getChildren })
    //     // const grandParentIndexPath = parentIndexPath.slice(0, -1)
    //     // const grandParentNode = access(tree, grandParentIndexPath, { getChildren })
    //     const isParentPreElement = parentNode.type === "element" && parentNode.tagName === "pre"
    //     const isCodeElement = node.type === "element" && node.tagName === "code"
    //     return isParentPreElement && isCodeElement
    //   },
    // })
    // const directoryPath = dirname(file.path)
    // let exampleId = 0
    // codeBlockNodes.forEach((node) => {
    //   if (node.type !== "element") {
    //     return
    //   }
    //   if (node.properties) {
    //     const classNames = (node.properties?.className || []) as string[]
    //     const language = getLanguage(classNames)
    //     if (language) {
    //       const codeString = toString(node)
    //       /** Include the code in TS Morph if it is JavaScripty. */
    //       if (["js", "jsx", "ts", "tsx"].includes(language)) {
    //         const examplePath = resolve(directoryPath, "examples", `${exampleId++}.tsx`)
    //         const exampleSource = project.getSourceFile(examplePath)
    //         if (exampleSource === undefined) {
    //           project.createSourceFile(examplePath, codeString)
    //         }
    //       }
    //       const tokens = highlighter(codeString, language)
    //       node.children = tokensToHast(tokens)
    //     }
    //   }
    // })
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
}
