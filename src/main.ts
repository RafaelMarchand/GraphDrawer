import Graph from "./Graph/Graph.js"
import Node from "./Graph/Node.js"
import Position from "./Position.js"
import { draw } from "./draw.js"
import { setPositions } from "./positioning.js"
import { GraphMethods, convert, getConfig, getValue } from "./utils.js"

export type ConfigInput<A> = {
  width?: number
  heigth?: number
  paddingGraph?: number
  nodeClick?: (key: string, position: Position, event: MouseEvent) => void
  nodeHover?: (key: string | null, position: Position | null, event: MouseEvent) => void
  nodeEventRadiusFactor?: number
  backgroundColor?: string
  nodeRadius?: ((attribute: A) => number) | number
  nodeBorderWidth?: ((attribute: A) => number) | number
  nodeBorderColor?: ((attribute: A) => string) | string
  nodeColor?: ((attribute: A) => string) | string
  edgeWidth?: ((srcAttribute: A, destNodeAttribute: A) => number) | number
  edgeColor?: ((srcAttribute: A, destNodeAttribute: A) => string) | string
}

export type Config<A> = {
  width: number
  heigth: number
  paddingGraph: number
  nodeClick: (key: string, position: Position, event: MouseEvent) => void
  nodeHover: (key: string | null, position: Position | null, event: MouseEvent) => void
  nodeEventRadiusFactor: number
  backgroundColor: string
  nodeRadius: ((attribute: A) => number) | number
  nodeBorderWidth: ((attribute: A) => number) | number
  nodeBorderColor: ((attribute: A) => string) | string
  nodeColor: ((attribute: A) => string) | string
  edgeWidth: ((srcAttribute: A, destNodeAttribute: A) => number) | number
  edgeColor: ((srcAttribute: A, destNodeAttribute: A) => string) | string
}

export default class GraphDrawer<G, A> {
  graphMethods: GraphMethods<G, A>
  config: Config<A>
  canvas: HTMLCanvasElement
  graph: Graph<G, A>

  constructor(graphMethods: GraphMethods<G, A>, container: HTMLElement, config: ConfigInput<A>) {
    this.graphMethods = graphMethods
    this.config = getConfig<A>(config)
    this.canvas = this.initialize(container)
    this.graph = new Graph<G, A>([], [])
  }

  initialize(container: HTMLElement): HTMLCanvasElement {
    const canvas = document.createElement("canvas")
    canvas.width = this.config.width
    canvas.height = this.config.heigth
    canvas.style.borderRadius = "0.3rem" // temporary
    while (container.firstElementChild) {
      container.firstElementChild.remove()
    }
    container.append(canvas)

    canvas.addEventListener("mouseup", (event) => {
      const node = this.nodeAtPosition(new Position(event.offsetX, event.offsetY))
      if (node) {
        this.config.nodeClick(node.key, new Position(node.posX, node.posY), event)
      }
    })
    let hoverCallbackFired = false
    canvas.addEventListener("mousemove", (event) => {
      const node = this.nodeAtPosition(new Position(event.offsetX, event.offsetY))
      if (node && !hoverCallbackFired) {
        hoverCallbackFired = true
        this.config.nodeHover(node.key, new Position(node.posX, node.posY), event)
      }
      if (!node && hoverCallbackFired) {
        hoverCallbackFired = false
        this.config.nodeHover(null, null, event)
      }
    })
    return canvas
  }

  nodeAtPosition(pos: Position): Node<A> | null {
    const nodeRadius = getValue(this.config.nodeRadius)
    let nodeMatch = null
    this.graph.nodes.forEach((node) => {
      if (
        pos.x > node.posX - nodeRadius * this.config.nodeEventRadiusFactor &&
        pos.x < node.posX + nodeRadius * this.config.nodeEventRadiusFactor &&
        pos.y > node.posY - nodeRadius * this.config.nodeEventRadiusFactor &&
        pos.y < node.posY + nodeRadius * this.config.nodeEventRadiusFactor
      ) {
        nodeMatch = node
      }
    })
    return nodeMatch
  }

  update(graph: G, rootNodes: string[]) {
    const newGraph = convert<G, A>(graph, rootNodes, this.graphMethods)

    const equalStructure = this.graph.equalStructure(newGraph)
    const equalValues = this.graph.equalValues(newGraph)

    this.graph = newGraph

    if (!equalStructure) {
      setPositions(this.graph, this.config)
    }

    if (!equalStructure || !equalValues) {
      draw<G, A>(this.graph, this.canvas, this.config)
    }
  }
}
