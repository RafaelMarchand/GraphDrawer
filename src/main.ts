import Edge from "./Graph/Edge.js"
import Graph from "./Graph/Graph.js"
import Drawer from "./Graph/Drawer.js"
import Node from "./Graph/Node.js"
import Position from "./Vec.js"
import { convert, getConfig, getValue } from "./utils.js"
import Positioner, { getPositionsX } from "./Graph/Positioner.js"

export type GraphMethods<G, A> = {
  getNodeKeys: (graph: G) => string[]
  getDestNodeKeys: (graph: G, nodeKey: string) => string[]
  getNodeAttribute?: (graph: G, nodeKey: string) => A
}

export type ConfigIntern<A> = {
  maxArrangements: number // defaults to 100, lower values will increase performance but can also lead to less pleasing node arrangments
  maxIntersections: number // This is the number of edge inersections the algorythm is aiming for, for big and complex graphs a low value might cause computational based crashes
  width: number
  height: number
  paddingGraph: number
  nodeClick: (key: string, position: { x: number; y: number }, event: MouseEvent, draw: () => void) => void
  nodeHover: (key: string | null, position: { x: number; y: number } | null, event: MouseEvent, draw: () => void) => void
  edgeClick: (srcNodeKey: string, destNodeKey: string, event: MouseEvent, draw: () => void) => void
  edgeHover: (srcNodeKey: string | null, destNodeKey: string | null, event: MouseEvent, draw: () => void) => void
  nodeEventThreshold: number
  edgeEventThreshold: number
  backgroundColor: string
  nodeRadius: ((key: string, attribute: A, clicked: boolean, mouseOver: boolean) => number) | number
  nodeBorderWidth: ((key: string, attribute: A, clicked: boolean, mouseOver: boolean) => number) | number
  nodeBorderColor: ((key: string, attribute: A, clicked: boolean, mouseOver: boolean) => string) | string
  nodeColor: ((key: string, attribute: A, clicked: boolean, mouseOver: boolean) => string) | string
  nodeHasText: boolean
  nodeTextOffset: { x: number; y: number }
  nodeFontColor: string
  nodeFontSize: number
  nodeFont: string
  nodeText: ((key: string, attribute: A, clicked: boolean, mouseOver: boolean) => string) | string
  edgeWidth: ((srcNodeKey: string, destNodeKey: string, srcAttribute: A, destNodeAttribute: A, clicked: boolean, mouseOver: boolean) => number) | number
  edgeColor: ((srcNodeKey: string, destNodeKey: string, srcAttribute: A, destNodeAttribute: A, clicked: boolean, mouseOver: boolean) => string) | string
  styleCanvas: Partial<CSSStyleDeclaration>
}

export type Config<A> = Partial<ConfigIntern<A>>

export default class GraphDrawer<G, A = undefined> {
  graphMethods: GraphMethods<G, A>
  config: ConfigIntern<A>
  graph: Graph<A>
  canvas: HTMLCanvasElement
  drawer: Drawer<A>
  positioner: Positioner<A>

  constructor(graphMethods: GraphMethods<G, A>, container: HTMLElement, config: Partial<ConfigIntern<A>>) {
    this.graphMethods = graphMethods
    this.config = getConfig(config)
    this.graph = new Graph()
    this.canvas = this.createCanvas(container)
    this.drawer = new Drawer(this.config, this.canvas)
    this.positioner = new Positioner(this.config, this.drawer)
    this.setupMouseClickListener()
    this.setupMouseMoveListener()
  }

  createCanvas(container: HTMLElement): HTMLCanvasElement {
    const canvas = document.createElement("canvas")
    canvas.width = this.config.width
    canvas.height = this.config.height
    Object.assign(canvas.style, this.config.styleCanvas)
    while (container.firstElementChild) {
      container.firstElementChild.remove()
    }
    container.append(canvas)
    return canvas
  }

  setupMouseMoveListener() {
    const draw = this.drawer.draw.bind(this.drawer)
    let nodeHoverCallbackFired = false
    let edgeHoverCallbackFired = false
    let lastEdge: Edge<A> | null = null

    this.canvas.addEventListener("mousemove", (event) => {
      const mousePos = new Position(event.offsetX, event.offsetY)
      const node = this.nodeAtPosition(mousePos)
      const edge = this.edgeAtPosition(mousePos)
      if (node && !nodeHoverCallbackFired) {
        nodeHoverCallbackFired = true
        node.mouseOver = true
        this.config.nodeHover(node.key, node.position, event, draw)
      }
      if (!node && nodeHoverCallbackFired) {
        nodeHoverCallbackFired = false
        this.graph.nodes.forEach((node) => (node.mouseOver = false))
        this.config.nodeHover(null, null, event, draw)
      }
      if (!node && edge && !edgeHoverCallbackFired) {
        lastEdge = edge
        edgeHoverCallbackFired = true
        edge.state.mouseOver = !edge.state.mouseOver
        this.config.edgeHover(edge.srcNode.key, edge.destNode.key, event, draw)
      }
      if (!edge && edgeHoverCallbackFired && lastEdge) {
        edgeHoverCallbackFired = false
        lastEdge.state.mouseOver = false
        this.config.edgeHover(null, null, event, draw)
      }
    })
  }

  setupMouseClickListener() {
    const draw = this.drawer.draw.bind(this.drawer)

    this.canvas.addEventListener("mouseup", (event) => {
      const mousePos = new Position(event.offsetX, event.offsetY)
      const node = this.nodeAtPosition(mousePos)
      const edge = this.edgeAtPosition(mousePos)

      if (node) {
        node.clicked = !node.clicked
        this.config.nodeClick(node.key, node.position, event, draw)
      }
      if (edge && !node) {
        edge.state.clicked = !edge.state.clicked
        this.config.edgeClick(edge.srcNode.key, edge.destNode.key, event, draw)
      }
    })
  }

  distance(p1: Position, p2: Position) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
  }

  cubicBezier(t: number, P0: Position, P1: Position, P2: Position, P3: Position) {
    const x = (1 - t) ** 3 * P0.x + 3 * (1 - t) ** 2 * t * P1.x + 3 * (1 - t) * t ** 2 * P2.x + t ** 3 * P3.x

    const y = (1 - t) ** 3 * P0.y + 3 * (1 - t) ** 2 * t * P1.y + 3 * (1 - t) * t ** 2 * P2.y + t ** 3 * P3.y

    return new Position(x, y)
  }

  edgeAtPosition(pos: Position) {
    const positions = getPositionsX(this.graph.getDepth(), this.config)
    let xLess = 0
    let depth = Infinity

    for (let i = 0; i < positions.length; i++) {
      if (pos.x > positions[i] && xLess < positions[i]) {
        xLess = positions[i]
        depth = i
      }
    }

    if (depth >= this.graph.getDepth()) return null

    for (const node of this.graph.getNodesAtDepth(depth)) {
      for (const edge of node.edges) {
        let isNearCurve = false

        for (let t = 0; t <= 1; t += 0.02) {
          const pointOnCurve = this.cubicBezier(t, node.position, edge.bezierPoints.cp1, edge.bezierPoints.cp2, edge.destNode.position)
          const dist = this.distance(pos, pointOnCurve)

          if (dist < this.config.edgeEventThreshold) {
            isNearCurve = true
            //console.log(node.key, edge.destNode.key)
            break
          }
        }
        if (isNearCurve) {
          return edge
        }
      }
    }
    return null
  }

  nodeAtPosition(pos: Position): Node<A> | null {
    for (const [_key, node] of this.graph.nodes) {
      if (node.dummy) continue
      const dist = this.distance(pos, node.position)
      const nodeRadius = getValue(this.config.nodeRadius, node.key, node.attributes, node.clicked, node.mouseOver)

      if (dist < this.config.nodeEventThreshold + nodeRadius) {
        return node
      }
    }
    return null
  }

  update(inputGraph: G, rootNodes: string[]) {
    const graph = convert<G, A>(inputGraph, rootNodes, this.graphMethods)

    const equalStructure = this.graph.equalStructure(graph)
    const equalValues = this.graph.equalValues(graph)

    if (!equalStructure) {
      this.graph = graph
      this.positioner.setPositions(this.graph)
    }
    if (!equalStructure || !equalValues) {
      this.drawer.draw(this.graph)
    }
  }
}
