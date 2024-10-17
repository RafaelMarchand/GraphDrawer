import { ConfigIntern } from "../main"
import { permutator } from "../utils"
import Drawer from "./Drawer"
import Graph from "./Graph"
import GraphArrangement from "./GraphArrangement"

export default class Positioner<A> {
  graph: Graph<A>
  config: ConfigIntern<A>
  arrangements: GraphArrangement<A>[]
  drawer: Drawer<A>
  constructor(config: ConfigIntern<A>, drawer: Drawer<A>) {
    this.graph = new Graph<A>()
    this.config = config
    this.arrangements = []
    this.drawer = drawer // for debugging
  }

  setPositions(graph: Graph<A>) {
    //lower values will increase performance but also make it more likely to have intersections
    this.graph = graph
    this.setPositionX()

    for (let i = 0; i <= this.graph.getDepth(); i++) {
      this.arrangements = this.createArrangements(i)
      console.log(this.arrangements)

      if (this.arrangements.length > this.config.maxArrangements) {
        this.arrangements.length = this.config.maxArrangements
      }
      // this.arrangements.forEach((arrangement) => {
      //   console.log(arrangement)
      //   this.drawer.draw(arrangement.graph)
      // })
    }
    this.arrangements.sort((a, b) => {
      const difference = a.intersections - b.intersections
      if (difference === 0) {
        return a.totalLengthEdges - b.totalLengthEdges
      }
      return difference
    })

    this.graph.nodes.forEach((node) => {
      node.position = this.arrangements[0].graph.nodes.get(node.key)!.position
    })
  }

  createArrangements(depth: number) {
    const nodes = this.graph.getNodesAtDepth(depth)

    if (depth === 0) {
      return permutator(nodes).map((permu): GraphArrangement<A> => {
        const arrangement = new GraphArrangement<A>(this.graph, this.config)
        arrangement.setPositionYforNodeOrder(permu.map((node) => node.key))
        return arrangement
      })
    }

    const newArrangements: GraphArrangement<A>[] = []

    for (const arrangement of this.arrangements) {
      const orders = arrangement.nodeOrders(depth)
      orders.forEach((order) => {
        const newArrangement = new GraphArrangement<A>(arrangement.graph, this.config, arrangement)
        newArrangement.setPositionYforNodeOrder(order.map((node) => node.key))
        newArrangement.addIntersections(depth - 1)
        newArrangement.addEdgeLength(depth - 1)
        newArrangements.push(newArrangement)
      })
    }
    return newArrangements
  }

  getPositionsY(nodeCount: number) {
    const Y_SCALING = 1.6
    if (nodeCount === 1) {
      return [this.config.height / 2]
    }
    const spotsArr = []
    const padding = this.config.height / (nodeCount * Y_SCALING)
    const nodeGap = (this.config.height - padding * 2) / (nodeCount - 1)
    let posAct = padding
    for (let i = 0; i < nodeCount; i++) {
      spotsArr.push(posAct + i * nodeGap)
    }
    return spotsArr
  }

  setPositionX() {
    const positions = getPositionsX(this.graph.getDepth(), this.config)

    for (let i = 0; i <= this.graph.getDepth(); i++) {
      this.graph.getNodesAtDepth(i).forEach((node) => {
        node.posX = positions[i]
      })
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
