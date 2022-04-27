import urlSlug from "url-slug"

/**
 * Parses headings from a plain Markdown or MDX file.
 */
export function getHeadingsFromMarkdown(content: string, maxDepth: number = 3) {
  return content
    .split("\n")
    .filter((line) => line.match(/^#{1,6}\s/))
    .filter((_, index) => index <= maxDepth)
    .map((line) => {
      const [, level, title] = line.match(/(#{1,6})\s(.*)/)
      return {
        slug: `#${urlSlug(title)}`,
        level: level.length,
        title,
      }
    })
}
