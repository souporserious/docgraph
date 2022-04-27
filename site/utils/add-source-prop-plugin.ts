// adapted from: https://gisthub.com/babel/babel/blob/master/packages/babel-plugin-transform-react-jsx-source/
import type { PluginObj, PluginPass } from '@babel/core'
import jsx from '@babel/plugin-syntax-jsx'
import * as t from '@babel/types'

export type Position = {
  startLine: number
  startColumn: number
  endLine: number
  endColumn: number
}

export type Node = {
  name: string
  position: Position
}

export type Result = {
  list: Array<Node>
  tree: Array<
    Node & {
      children: Array<Array<Node>>
    }
  >
}

const TRACE_ID = '__jsxSource'

function makeTrace({ startLine, startColumn, endLine, endColumn }) {
  const startLineProperty = t.objectProperty(
    t.identifier('startLine'),
    startLine != null ? t.numericLiteral(startLine) : t.nullLiteral()
  )
  const startColumnProperty = t.objectProperty(
    t.identifier('startColumn'),
    startColumn != null ? t.numericLiteral(startColumn) : t.nullLiteral()
  )
  const endLineProperty = t.objectProperty(
    t.identifier('endLine'),
    endLine != null ? t.numericLiteral(endLine) : t.nullLiteral()
  )
  const endColumnProperty = t.objectProperty(
    t.identifier('endColumn'),
    endColumn != null ? t.numericLiteral(endColumn) : t.nullLiteral()
  )
  return t.objectExpression([
    startLineProperty,
    startColumnProperty,
    endLineProperty,
    endColumnProperty,
  ])
}

const isComponent = (name) => /[A-Z]/.test(name.charAt(0))

export function addSourceProp(): PluginObj<PluginPass> {
  return {
    inherits: jsx,
    visitor: {
      Program: {
        enter() {
          this.tree = []
          this.list = []
        },
        exit(_, state) {
          state.opts.onReady({
            tree: this.tree[0],
            list: this.list,
          })
        },
      },
      FunctionDeclaration: {
        enter(path) {
          const name = path.node.id.name

          if (!isComponent(name)) {
            return
          }

          const position = {
            startLine: path.node.loc.start.line,
            startColumn: path.node.loc.start.column,
            endLine: path.node.loc.end.line,
            endColumn: path.node.loc.end.column,
          }

          this.tree.push({
            name,
            position,
            children: [],
            type: 'component',
          })

          this.list.push({
            name,
            position,
            type: 'component',
          })
        },
        exit() {
          if (this.tree.length > 1) {
            const child = this.tree.pop()
            const parent = this.tree[this.tree.length - 1]
            parent.children.push(child)
          }
        },
      },
      JSXElement: {
        enter(path) {
          if (
            path.node.openingElement.name.name === 'Fragment' ||
            path.node.openingElement.name.property?.name === 'Fragment'
          ) {
            return
          }

          const name = path.node.openingElement.name.name
          const position = {
            startLine: path.node.loc.start.line,
            startColumn: path.node.loc.start.column,
            endLine: path.node.loc.end.line,
            endColumn: path.node.loc.end.column,
          }
          const trace = makeTrace(position)

          path.node.openingElement.attributes.push(
            t.jsxAttribute(
              t.jsxIdentifier(TRACE_ID),
              t.jsxExpressionContainer(trace)
            )
          )

          this.tree.push({
            name,
            position,
            children: [],
            type: 'element',
          })

          this.list.push({
            name,
            position,
            type: isComponent(name) ? 'instance' : 'element',
          })
        },
        exit() {
          if (this.tree.length > 1) {
            const child = this.tree.pop()
            const parent = this.tree[this.tree.length - 1]
            parent.children.push(child)
          }
        },
      },
    },
  }
}
