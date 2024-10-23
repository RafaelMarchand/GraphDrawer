import { usolve } from "mathjs"
import { ConfigIntern } from "../main"
import Edge from "./Edge"
import Node from "./Node"
import Variation from "./Variation"

enum ArrangementStatus {
  empty = "empty",
  found = "found"
}

export default class Layer<A> {
  config: ConfigIntern<A>
  nodes: Node<A>[]
  variations: Variation<A>[]
  currentVariation: number
  currentPermutation: number

  constructor(nodes: Node<A>[], config: ConfigIntern<A>) {
    this.config = config
    this.nodes = nodes
    this.variations = []
    this.currentVariation = 0
    this.currentPermutation = 0
    this.initialize()
  }

  initialize() {
    const positions = this.getPositionsY(this.nodes.length)
    const groups = this.groupNodes(this.nodes)
    for (let group of groups) {
      if (group.length === 1) {
        group[0].posY = positions.splice(0, 1)[0]
      } else {
        const variation = new Variation(group, positions.splice(0, group.length))
        variation.setPermutation()
        this.variations.push(variation)
      }
    }
  }

  solve() {
    let solved = false
    

    return solved
  }

  nextArrangement() {
    let intersections = this.hasIntersections()
    let variationIndex = 0

    while (intersections.length > this.config.maxIntersections){
        const end = this.variations[variationIndex].setPermutation()



        intersections = this.hasIntersections()
    }

    intersections.forEach((intersection) => {
        
    })

    this.variations[this.currentVariation]

    this.currentVariation
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

  hasIntersections() {
    const intersectingEdges: Edge<A>[][] = []
    let edges: Edge<A>[] = []

    this.nodes.forEach((node) => {
      edges = [...edges, ...node.edges]
    })
    const edgesToCompare = [...edges]

    // compare all edges with each other to check for intersection
    for (let i = edges.length - 1; i >= 0; i--) {
      for (let j = edgesToCompare.length - 1; j >= 0; j--) {
        if (i !== j) {
          if (this.checkIntersection(edges[i], edgesToCompare[j])) {
            intersectingEdges.push([edges[i], edgesToCompare[j]])
          }
        }
      }
      edgesToCompare.pop()
    }
    return intersectingEdges
  }

  linearCoefficient<A>(srcNode: Node<A>, destNode: Node<A>) {
    let x1 = srcNode.posX
    let x2 = destNode.posX
    let y1 = srcNode.posY
    let y2 = destNode.posY

    let a = (y2 - y1) / (x2 - x1)
    let b = y1 - x1 * a
    return [a, b]
  }

  checkIntersection(edgeA: Edge<A>, edgeB: Edge<A>) {
    let [a1, b1] = this.linearCoefficient(edgeA.srcNode, edgeA.destNode)
    let [a2, b2] = this.linearCoefficient(edgeB.srcNode, edgeB.destNode)

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
