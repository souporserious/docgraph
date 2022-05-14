import type { Element, ElementContent } from "hast"
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
  code: string
  language: shiki.Lang
  tokens: shiki.IThemedToken[][]
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
          const code = toString(node)
          const tokens = highlighter(code, language)

          codeBlocks.push({ code, language, tokens })

          node.children = tokensToHast(tokens)
        }
      }
    })

    onFileData?.({
      path: file.path,
      headings,
      codeBlocks,
    })
  }
}
