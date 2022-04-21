<!--- This README was auto-generated from "packages/topodoc/README.mdx" using "yarn build:readme" --> 

 # topodoc

A [topological](https://en.wikipedia.org/wiki/Network%5Ftopology) documentation generator for JavaScript with first-class support for React.

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
yarn add topodoc

```

```bash
npm install topodoc

```

## Usage

Start by importing the \[\[addProject\]\] helper:

```ts
import { addProject } from "topodoc"

const project = addProject()

project.addFile("README.md")

```

Now that we've added a project, we can start to add information to it and describe our system. Let's add a local `components` directory of React components:

```ts
const components = project.getSourceFiles("components/index.ts")

```

If you've chosen to [skip adding files automatically](%5B%5B#index.options.skip%5D%5D) or want to add specific files to your documentation graph, you can use the \[\[addSourceFiles\]\] helper:

```ts
const components = project.addSourceFiles("components/index.ts")

```

We can now look at any export and get the related information for it:

```ts
const component = components.getExport("Button")

component.references // array of references to this component

```

```ts
component.emit()

```

## Options