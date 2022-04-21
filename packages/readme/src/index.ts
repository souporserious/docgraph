import { writeFile } from "fs/promises"
import { mdxToMarkdown } from "topodoc"

mdxToMarkdown("../topodoc/README.mdx").then((markdown) => {
  const banner = `This README was auto-generated from "packages/topodoc/README.mdx" using "yarn build:readme"`
  const readme = `<!--- ${banner} --> \n\n ${markdown}`

  writeFile("../../README.md", readme).then(() => {
    console.log("📝 Converted README.mdx -> README.md")
  })
})
