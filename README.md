## ⚠️ Currently under development, not ready for use yet

This library is currently unstable and the API is in flux. It is being worked on in the open for better exposure, please feel free to add to the [discussion](https://github.com/souporserious/docgraph/discussions/1) if you have any questions or suggestions. As of right now, packages aren't published yet and documentation may be lacking or stale.

# DocGraph

A topological documentation generator for JavaScript with first-class support for React.

Built with [ts-morph](https://ts-morph.com/), [graphology](https://graphology.github.io/) [swc](https://swc.rs/), and [mdx](https://github.com/mdx-js/mdx).

## Features

🕸 Directed documentation graph

🪶 Minimal DSL for building rich documentation

📝 MDX for mixing Markdown and JSX

🖼 Compile code examples

📰 Compile MDX to Markdown

🐇 Quick links to source code for development and production

## Install

```bash
yarn add @docgraph/bundle
```

```bash
npm install @docgraph/bundle
```

## Usage

```js
import { bundle } from "@docgraph/bundle"

const tsxString = `
export const HelloWorld = ({ name = 'World' }) => <div>Hello {name}</div>
`

const mdxString = `# Hello World`

const json = bundle({
  "hello-world.tsx": tsxString,
  "hello-world.mdx": mdxString,
})
```
