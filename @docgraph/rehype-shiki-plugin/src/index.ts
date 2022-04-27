import type { Node } from "hast-util-to-string"
import { toString } from "hast-util-to-string"
import * as shiki from "shiki"
import { access, findAll, findIndexPath } from "tree-visit"
import type { AsyncReturnType } from "type-fest"

function tokensToHast(lines: shiki.IThemedToken[][]) {
  const tree: Node[] = []

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

export function rehypeShikiPlugin(highlighter: AsyncReturnType<typeof getHighlighter>) {
  return async function transformer(tree: any) {
    const languageCodeBlocks = findAll(tree, {
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

        return node.type === "element"
          ? parentNode.type === "element" && parentNode.tagName === "pre" && node.tagName === "code"
          : false
      },
    })

    languageCodeBlocks.forEach((node) => {
      if (node.type !== "element") return

      if (node.properties) {
        const classNames = (node.properties?.className || []) as string[]
        const language = getLanguage(classNames)

        if (language) {
          const tokens = highlighter(toString(node), language)
          // @ts-ignore
          node.children = tokensToHast(tokens)
        }
      }
    })
  }
}
