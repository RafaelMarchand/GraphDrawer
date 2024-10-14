import { expect, test } from "vitest"
import { groupNodes, spreadAllongY } from "../src/positioning"
import { convert } from "../src/utils"
import { Graph, NodeAttributes, graphMethods } from "./Graph"
import Graphology from "graphology"

const inputGraph = new Graphology({ type: "directed" })

inputGraph.addNode("1", { value: 0.0 })

inputGraph.addNode("2", { value: 5, h: "gg" })
inputGraph.addNode("3", { value: 0 })
inputGraph.addNode("4", { value: -2.5 })
inputGraph.addNode("5", { value: -5 })

inputGraph.addNode("7", { value: 3 })
inputGraph.addNode("8", { value: -1 })

inputGraph.addNode("9", { value: -1 })

inputGraph.addEdge("1", "2")
inputGraph.addEdge("1", "3")
inputGraph.addEdge("1", "4")
inputGraph.addEdge("1", "5")

inputGraph.addEdge("4", "7")
inputGraph.addEdge("2", "7")
inputGraph.addEdge("5", "7")
inputGraph.addEdge("3", "8")

inputGraph.addEdge("7", "9")

// long edges
inputGraph.addEdge("1", "9")
inputGraph.addEdge("3", "9")

const graph = convert<Graph, NodeAttributes>(inputGraph, ["1"], graphMethods)

test("Group Nodes", () => {
  spreadAllongY(graph.getNodesAtDepth(1), 400)
  const groups = groupNodes<NodeAttributes>(graph.getNodesAtDepth(2), 400)

  const node7 = graph.nodes.get("7")
  const node8 = graph.nodes.get("8")

  const expectedResult = [[node7], [node8]]
  expect(groups).toStrictEqual(expectedResult)
})
