import { usolve } from "mathjs"
import { ConfigIntern } from "../main"
import Edge from "./Edge"
import Graph from "./Graph"
import Node from "./Node"
import Position from "../Vec.js"
import { permutator } from "../utils"

function createGraph<A>(graph: Graph<A>) {
  const newGraph = new Graph<A>()
  graph.nodes.forEach((node) => {
    const newNode = newGraph.addNode(node.key)
    newNode.position = new Position(node.posX, node.posY)
    newNode.depth = node.depth
  })
  graph.nodes.forEach((node) => {
    node.edges.forEach((edge) => {
      newGraph.addEdge(edge.srcNode.key, edge.destNode.key)
    })
  })
  return newGraph
}

export default class GraphArrangement<A> {
  graph: Graph<A>
  config: ConfigIntern<A>
  intersections: number
  totalLengthEdges: number

  constructor(graph: Graph<A>, config: ConfigIntern<A>, arrangement?: GraphArrangement<A>) {
    this.graph = createGraph(graph)
    this.config = config
    this.intersections = arrangement?.intersections ?? 0
    this.totalLengthEdges = arrangement?.totalLengthEdges ?? 0
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

  addIntersections(depth: number) {
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

    const nodes = this.graph.getNodesAtDepth(depth)
    let count = 0
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
            count++
          }
        }
      }
      edgesToCompare.pop()
    }
    this.intersections += count
  }

  addEdgeLength(depth: number) {
    const nodes = this.graph.getNodesAtDepth(depth)
    nodes.forEach((node) => {
      node.edges.forEach((edge) => {
        this.totalLengthEdges += Math.abs(node.posY - edge.destNode.posY)
      })
    })
  }

  /**
   * Computes all possible node orders (top to bottom) for nodes of a certain depth
   * based on their optimal position which depends on the source nodes of each node
   */
  nodeOrders(depth: number) {
    const nodes = this.graph.getNodesAtDepth(depth)
    const groups = this.groupNodes(nodes)

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
    for (let y = 0; y < this.config.height; y++) {
      const distance = node.inEdges.reduce((distance, edge) => {
        return Math.floor(distance + Math.pow(edge.srcNode.posY - y, 2))
      }, 0)
      if (distance < minimalDistance) {
        minimalDistance = distance
        optimalPosition = y
      }
    }
    return optimalPosition
  }
}
