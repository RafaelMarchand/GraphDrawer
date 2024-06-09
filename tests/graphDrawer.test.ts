import { expect, test } from "vitest"
import { groupNodes, spreadAllongY } from "../src/positioning"
import { convert } from "../src/utils"
import { Graph, NodeAttributes, graph, graphMethods } from "./Graph"

const convertedGraph = convert<Graph, NodeAttributes>(graph, ["1"], graphMethods)

test("Convert"),
  () => {
    expect(true).toBe(true)
  }

test("Group Nodes", () => {
  spreadAllongY(convertedGraph.getNodesAtDepth(1), 400)
  const groups = groupNodes<NodeAttributes>(convertedGraph.getNodesAtDepth(2), 400)

  const node7 = convertedGraph.nodes.filter((node) => node.key === "7")[0]
  const node8 = convertedGraph.nodes.filter((node) => node.key === "8")[0]

  const expectedResult = [[node8], [node7]]
  expect(groups).toStrictEqual(expectedResult)
})

// console.log(
//   optimalPositionYSpots(
//     [
//       {
//         posY: 1,
//         node: new Node("3", [], [], null),
//         optimalPosY: 0
//       },
//       {
//         posY: 20,
//         node: new Node("3", [], [], null),
//         optimalPosY: 0
//       },
//       {
//         posY: 5,
//         node: new Node("3", [], [], null),
//         optimalPosY: 0
//       }
//     ],
//     30
//   ),
//   "HI"
// )
