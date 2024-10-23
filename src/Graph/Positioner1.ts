import { ConfigIntern } from "../main"
import { permutator } from "../utils"
import Drawer from "./Drawer"
import Graph from "./Graph"
import GraphArrangement from "./GraphArrangement"
import Position from "../Vec.js"
import Node from "./Node"
import { number, usolve } from "mathjs"
import Edge from "./Edge"
import Layer from "./Layer"

enum State {
  setUpNextLayer = "setUpNextLayer",
  solveLayer = "solveLayer"
}
enum Action {
  start = "start",
  found = "found"
}

export default class Positioner<A> {
  graph: Graph<A>
  config: ConfigIntern<A>
  layers: Layer<A>[]
  drawer: Drawer<A>

  constructor(config: ConfigIntern<A>, drawer: Drawer<A>) {
    this.graph = new Graph<A>()
    this.config = config
    this.layers = []
    this.drawer = drawer // for debugging
  }

  setPositions(inputGraph: Graph<A>) {
    this.graph = Graph.clone(inputGraph)
    this.setPositionX()
    this.solveLayers()

    inputGraph.nodes.forEach((node, key) => {
      node.position = this.graph.nodes.get(key)!.position
    })
  }

  solveLayers() {
    let state = State.setUpNextLayer
    let layerIndex = 0

    switch (state as State) {
      case State.setUpNextLayer:
        const layer = new Layer(this.graph.getNodesAtDepth(layerIndex), this.config)
        this.layers.push(layer)
        if (layerIndex !== 0){
          state = State.solveLayer
          layerIndex--
        }
        if (layerIndex === 0){
          layerIndex++
        }
        break
      case State.solveLayer:
        const solved = this.layers[layerIndex].solve()
        
        if (!solved){
          //backtracking
        }
        if (solved){
          layerIndex+=2
          state = State.setUpNextLayer
        }
        break
    }
  }

  getPositionsY(nodeCount: number) {
    const Y_SCALING = 1.6
    if (nodeCount === 1) {
      return [this.config.height / 2]
    }
    const positions = []
    const padding = this.config.height / (nodeCount * Y_SCALING)
    const nodeGap = (this.config.height - padding * 2) / (nodeCount - 1)
    let posAct = padding
    for (let i = 0; i < nodeCount; i++) {
      positions.push(posAct + i * nodeGap)
    }
    return positions
  }

  setPositionX() {
    const positions = getPositionsX(this.graph.getDepth(), this.config)

    for (let i = 0; i <= this.graph.getDepth(); i++) {
      this.graph.getNodesAtDepth(i).forEach((node) => {
        node.posX = positions[i]
      })
    }
  }

  setPositionYforNodeOrder(nodeKeyOrder: string[]) {
    const Y_SCALING = 1.6
    const nodes = nodeKeyOrder.map((key) => this.graph.nodes.get(key)!)

    if (nodes.length === 1) {
      nodes[0].posY = this.config.height / 2
      return
    }
    const padding = this.config.height / (nodes.length * Y_SCALING)
    const nodeGap = (this.config.height - padding * 2) / (nodes.length - 1)
    let posAct = padding
    nodes.forEach((node, index) => {
      node.posY = posAct + index * nodeGap
    })
  }

  /**
   * Computes all possible node orders (top to bottom) for nodes of a certain depth
   * based on their optimal position which depends on the source nodes of each node
   */
  nodeOrders(depth: number) {
    const nodes = this.graph.getNodesAtDepth(depth)
    const groups = this.groupNodes(nodes)
    console.log("Groups", groups)

    return groups.reduce((accumulator: Node<A>[][], group) => {
      if (accumulator.length === 0) {
        return permutator(group)
      }
      const newOrders: Node<A>[][] = []
      accumulator.forEach((order) => {
        permutator(group).forEach((permu) => {
          newOrders.push([...order, ...permu])
        })
      })
      return newOrders
    }, [])
  }

  /**
   * Groups nodes by their optimal y position. Groups will be sorted ascending.
   * Nodes with equal optimalYPos will be in the same group.
   */
  groupNodes(nodes: Node<A>[]) {
    nodes.forEach((node) => {
      node.optimalPosY = this.optimalPositionY(node)
    })
    nodes.sort((nodeA, nodeB) => nodeA.optimalPosY - nodeB.optimalPosY)

    const groups: Node<A>[][] = []
    const currentGroup: Node<A>[] = []
    let prevNode: null | Node<A>

    nodes.forEach((node) => {
      if (!prevNode) {
        currentGroup.push(node)
      }
      if (prevNode && prevNode.optimalPosY === node.optimalPosY) {
        currentGroup.push(node)
      }
      if (prevNode && prevNode.optimalPosY !== node.optimalPosY) {
        groups.push([...currentGroup])
        currentGroup.length = 0
        currentGroup.push(node)
      }
      prevNode = node
    })

    groups.push(currentGroup)
    return groups
  }

  /**
   * Calculates the optimal y position.
   * Function is minimizing the edge length from the incoming edges of a node.
   */
  optimalPositionY(node: Node<A>) {
    let minimalDistance = Infinity
    let optimalPosition = 0
    const stepSize = Math.floor(this.config.height / 10)
    for (let y = 0; y < this.config.height; y += stepSize) {
      const distance = node.inEdges.reduce((distance, edge) => {
        return Math.floor(distance + Math.abs(edge.srcNode.posY - y))
      }, 0)
      if (distance < minimalDistance) {
        minimalDistance = distance
        optimalPosition = y
      }
    }
    return optimalPosition
  }

  hasIntersections(depth: number) {
    const nodes = this.graph.getNodesAtDepth(depth)
    const intersectingEdges: Edge<A>[][] = []
    let edges: Edge<A>[] = []

    nodes.forEach((node) => {
      edges = [...edges, ...node.edges]
    })
    const edgesToCompare = [...edges]

    // compare all edges with each other to check for intersection
    for (let i = edges.length - 1; i >= 0; i--) {
      for (let j = edgesToCompare.length - 1; j >= 0; j--) {
        if (i !== j) {
          if (checkIntersection(edges[i], edgesToCompare[j])) {
            intersectingEdges.push([edges[i], edgesToCompare[j]])
          }
        }
      }
      edgesToCompare.pop()
    }
    return intersectingEdges

    function linearCoefficient<A>(srcNode: Node<A>, destNode: Node<A>) {
      let x1 = srcNode.posX
      let x2 = destNode.posX
      let y1 = srcNode.posY
      let y2 = destNode.posY

      let a = (y2 - y1) / (x2 - x1)
      let b = y1 - x1 * a
      return [a, b]
    }

    function checkIntersection(edgeA: Edge<A>, edgeB: Edge<A>) {
      let [a1, b1] = linearCoefficient(edgeA.srcNode, edgeA.destNode)
      let [a2, b2] = linearCoefficient(edgeB.srcNode, edgeB.destNode)

      if (a1 === a2) {
        // lines are parallel
        return false
      }
      try {
        const [[intersectionX]]: any = usolve([[a2 - a1]], [b1 - b2])
        if (intersectionX > edgeA.srcNode.posX + 1 && intersectionX < edgeB.destNode.posX - 1) {
          return true
        } else {
          return false
        }
      } catch (error) {
        console.error(error)
        return false
      }
    }
  }

  intersectionsVariation(variation: Variation<A>) {
    const nodes = this.graph.getNodesAtDepth(depth)
    const intersectingEdges: Edge<A>[][] = []
    let edges: Edge<A>[] = []

    nodes.forEach((node) => {
      edges = [...edges, ...node.edges]
    })
    const edgesToCompare = [...edges]

    // compare all edges with each other to check for intersection
    for (let i = edges.length - 1; i >= 0; i--) {
      for (let j = edgesToCompare.length - 1; j >= 0; j--) {
        if (i !== j) {
          if (checkIntersection(edges[i], edgesToCompare[j])) {
            intersectingEdges.push([edges[i], edgesToCompare[j]])
          }
        }
      }
      edgesToCompare.pop()
    }
    return intersectingEdges

    function linearCoefficient<A>(srcNode: Node<A>, destNode: Node<A>) {
      let x1 = srcNode.posX
      let x2 = destNode.posX
      let y1 = srcNode.posY
      let y2 = destNode.posY

      let a = (y2 - y1) / (x2 - x1)
      let b = y1 - x1 * a
      return [a, b]
    }

    function checkIntersection(edgeA: Edge<A>, edgeB: Edge<A>) {
      let [a1, b1] = linearCoefficient(edgeA.srcNode, edgeA.destNode)
      let [a2, b2] = linearCoefficient(edgeB.srcNode, edgeB.destNode)

      if (a1 === a2) {
        // lines are parallel
        return false
      }
      try {
        const [[intersectionX]]: any = usolve([[a2 - a1]], [b1 - b2])
        if (intersectionX > edgeA.srcNode.posX + 1 && intersectionX < edgeB.destNode.posX - 1) {
          return true
        } else {
          return false
        }
      } catch (error) {
        console.error(error)
        return false
      }
    }
  }
}

export function getPositionsX<A>(graphDepth: number, config: ConfigIntern<A>) {
  const distanceBetweenNodes = (config.width - 2 * config.paddingGraph) / graphDepth
  const positions: number[] = []

  for (let i = 0; i <= graphDepth; i++) {
    positions.push(config.paddingGraph + i * distanceBetweenNodes)
  }
  return positions
}
