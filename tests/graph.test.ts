import { expect, test } from "vitest"
import Graph from "../src/Graph/Graph"

//________________ Graph1 ____________________
const graph1 = new Graph<Object>()
graph1.addNode("1", "hi")
graph1.addNode("2", "hi")
graph1.addNode("3", "hi")
graph1.addNode("4", "hi")

graph1.addEdge("1", "2")
graph1.addEdge("1", "3")
graph1.addEdge("1", "4")

//   / ¯¯¯¯¯¯¯¯ 2
// 1 ---------- 3
//   \_________ 4

//________________ Graph2 ____________________
const graph2 = new Graph<string>()
graph2.addNode("1", "hi")
graph2.addNode("2", "hi")
graph2.addNode("3", "hi")
graph2.addNode("4", "hi")

graph2.addEdge("1", "2")
graph2.addEdge("1", "3")
graph2.addEdge("1", "4")

//   / ¯¯¯¯¯¯¯¯ 2
// 1 ---------- 3
//   \_________ 4

//________________ Graph3 ____________________
const graph3 = new Graph<Object>()
graph3.addNode("1", { test: 1 })
graph3.addNode("2", { test: 1 })
graph3.addNode("3", { test: 1 })
graph3.addNode("5", { test: 1 })

graph3.addEdge("1", "2")
graph3.addEdge("1", "5")
graph3.addEdge("1", "3")

//   / ¯¯¯¯¯¯¯¯ 2
// 1 ---------- 4
//   \_________ 3

//________________ Graph4 ____________________
const graph4 = new Graph<Object>()
graph4.addNode("1", { test: 1 })
graph4.addNode("2", { test: 1 })
graph4.addNode("3", { test: 1 })
graph4.addNode("4", { test: 1, test2: 2 })

graph4.addEdge("1", "2")
graph4.addEdge("2", "3")
graph4.addEdge("2", "4")

//             / ¯¯¯¯¯¯¯¯ 3
// 1 ------- 2
//             \_________ 4

//________________ Graph5 ____________________
const graph5 = new Graph<Object>()
graph5.addNode("1", { test: 1 })
graph5.addNode("2", { test: 1 })
graph5.addNode("3", { test: 1 })
graph5.addNode("4", { test: 1 })

graph5.addEdge("1", "2")
graph5.addEdge("1", "3")
graph5.addEdge("1", "4")

//   / ¯¯¯¯¯¯¯¯ 2
// 1 ---------- 4
//   \_________ 3

test("equal structure", () => {
  // equal graphs
  expect(graph1.equalStructure(graph2)).toBe(true)

  // different node keys
  expect(graph1.equalStructure(graph3)).toBe(false)

  // different structure
  expect(graph1.equalStructure(graph4)).toBe(false)
})

test("equal values", () => {
  // same string values
  expect(graph1.equalValues(graph2)).toBe(true)

  // different string values
  graph2.nodes.get("4")!.attributes = "bye"
  expect(graph1.equalValues(graph2)).toBe(false)

  // different objects
  expect(graph5.equalValues(graph4)).toBe(false)

  // same objects
  graph4.nodes.get("4")!.attributes = { test: 1 }
  expect(graph5.equalValues(graph4)).toBe(true)

  // same object different values
  graph4.nodes.get("4")!.attributes = { test: 2 }
  expect(graph5.equalValues(graph4)).toBe(false)
})
