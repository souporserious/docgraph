import { transformCode } from "./transform-code"

export async function executeClientCode(codeString: string, dependencies: Record<string, string>) {
  const transformedCode = await transformCode(codeString)
  const exports: Record<string, unknown> = {}
  const require = (path: string) => {
    if (dependencies[path]) {
      return dependencies[path]
    }
    throw Error(`Module not found: ${path}.`)
  }
  const result = new Function("exports", "require", transformedCode)

  result(exports, require)

  return exports.default
}
