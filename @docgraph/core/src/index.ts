import { DirectedGraph } from "graphology"
import { Project } from "ts-morph"

export class Graph {
  project: Project

  graph: DirectedGraph

  constructor({ tsConfigFilePath = "tsconfig.json" } = {}) {
    this.project = new Project({
      compilerOptions: {
        noEmit: false,
        declaration: true,
        emitDeclarationOnly: true,
      },
      skipAddingFilesFromTsConfig: true,
      tsConfigFilePath,
    })

    this.graph = new DirectedGraph()
  }

  get sources() {
    return this.project.getSourceFiles()
  }

  /** Adds source files to the graph and optionally determines how to load the respective data. */
  async addSource({
    id,
    label,
    description,
    path,
    loader,
  }: {
    /** A unique identifier to access the graph by. */
    id: string

    /**
     * Used to more easily identify the source. Defaults to [[id]].
     */
    label?: string

    /**
     * Description of the source used for meta tags.
     */
    description?: string

    /**
     * The glob path[s] for the source files to be loaded. Note, this is optional
     * and data can be loaded from other sources in the graph or from an external
     * source through the [[loader]].
     */
    path?: string | string[]

    /**
     * Loaders are responsible for determining how each node's data is loaded
     * into the graph. When a loader accesses another source's data, it will halt
     * the loading process until all dependencies have loaded. Note, each loader
     * will be ran in the respective order it was accessed.
     */
    loader?: (graph: Graph) => Promise<
      Array<{
        /**
         * Used to more easily identify the source. Defaults to a capital case filename.
         */
        label: string

        /**
         * Provide a description used as metadata.
         */
        description?: string

        /**
         * The slug to be used for a route. This should be returned in parts if nested.
         *
         * @example
         * import { addSource } from 'docgraph'
         *
         * addSource({
         *   id: 'components',
         *   path: 'components/*.tsx',
         *   loader: async (graph) => [{
         *     label: 'Button',
         *     slug: ['components', 'button']
         *   }]
         * })
         */
        slug: string | string[]

        /** Data to be stored inside the graph. */
        data: any
      }>
    >
  }) {
    if (path) {
      const sourceFiles = this.project.addSourceFilesAtPaths(path)

      sourceFiles.forEach((sourceFile) => {
        const slug = sourceFile.getBaseName()
        this.graph.addNode(id, {
          label: slug,
          description,
          slug,
          data: {},
        })
      })

      this.project.resolveSourceFileDependencies()
    }

    if (loader) {
      const data = await loader(this)

      data.forEach((source) => {
        this.graph.addNode(id + source.label, {
          label: source.label,
          description: source.description,
          slug: source.slug,
          data: source.data,
        })
      })
    }
  }
}
