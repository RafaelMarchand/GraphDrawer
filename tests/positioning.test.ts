import Graphology from "graphology"
import { expect, test } from "vitest"
import { groupNodes, spreadAllongY } from "../src/positioning"
import { GraphMethods, convert } from "../src/utils"

type G = Graphology

type A = {
  value: number
}
const graph: Graphology<A> = new Graphology()

graph.addNode("1", { value: 0.0 })

graph.addNode("2", { value: 5 })
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

const graphMethods: GraphMethods<G, A> = {
  getNodeKeys: (graph) => graph.mapNodes((key) => key),
  getDestNodeKeys: (graph, nodeKey) =>
    graph.mapOutEdges(nodeKey, (_edge, _attributes, _source, target) => target),
  getSrcNodeKeys: (graph, nodeKey) =>
    graph.mapInEdges(nodeKey, (_edge, _attributes, _source, target) => target),
  getNodeAttribute: (graph, nodeKey) => graph.getNodeAttribute(nodeKey, "value")
}

const convertedGraph = convert<G, A>(graph, ["1"], graphMethods)

test("Group Nodes", () => {
  spreadAllongY(convertedGraph.getNodesAtDepth(1), 400)
  const groups = groupNodes<G, A>(2, convertedGraph, 400)

  const node7 = convertedGraph.nodes.filter((node) => node.key === "7")[0]
  const node8 = convertedGraph.nodes.filter((node) => node.key === "8")[0]

  const expectedResult = [[node8], [node7]]
  expect(groups).toStrictEqual(expectedResult)
})
