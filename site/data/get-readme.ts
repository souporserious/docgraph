import fs from "fs/promises"
import { bundle } from "@docgraph/bundle"
import { project } from "./index"

export async function getReadme(directoryPath) {
  const readmePath = `${directoryPath}/README.mdx`
  let readmeContents = null

  try {
    readmeContents = await fs.readFile(readmePath, "utf-8")
  } catch (error) {
    // Bail if README.mdx not found since it isn't required
    return null
  }

  return null

  // return bundle({
  //   path: readmePath,
  //   contents: readmeContents,
  //   project,
  // })
}

// Alt API:
// project.addSources()
// project.bundle() // bundle whole project
// project.bundle(path) // bundle matched file pattern
// project.bundle('**/README.mdx') // returns array of bundled code? or we can emit?
