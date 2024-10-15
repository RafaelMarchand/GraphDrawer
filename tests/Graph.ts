import Graphology from "graphology"
import { GraphMethods } from "../src/utils"

export type Graph = Graphology
export type NodeAttributes = {
  value: number
}

export const graph = new Graphology()

graph.addNode("1", { value: 0.0 })

graph.addNode("2", { value: 5, h: "gg" })
graph.addNode("3", { value: 0 })
graph.addNode("4", { value: -2.5 })
graph.addNode("5", { value: -5 })

graph.addNode("7", { value: 3 })
graph.addNode("8", { value: -1 })

graph.addNode("9", { value: -1 })

graph.addEdge("1", "2")
graph.addEdge("1", "3")
graph.addEdge("1", "4")
graph.addEdge("1", "5")

graph.addEdge("4", "7")
graph.addEdge("2", "7")
graph.addEdge("5", "7")
graph.addEdge("3", "8")

graph.addEdge("7", "9")

export const graphMethods: GraphMethods<Graph, NodeAttributes> = {
  getNodeKeys: (graph) => graph.mapNodes((key) => key),
  getDestNodeKeys: (graph, nodeKey) =>
    graph.mapOutEdges(nodeKey, (_edge, _attributes, _source, target) => target),
  getNodeAttribute: (graph, nodeKey) => graph.getNodeAttribute(nodeKey, "value")
}
