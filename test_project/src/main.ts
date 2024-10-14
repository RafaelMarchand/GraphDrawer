import Graphology from "graphology"
import GraphDrawer, { Config } from "../../src/main"
import { GraphMethods } from "../../src/utils"
import Graph from "../../src/Graph/Graph"

const graph = new Graphology({ type: "directed" })

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

// long edges
graph.addEdge("1", "9")
graph.addEdge("1", "7")
graph.addEdge("3", "9")

const container = document.getElementById("app")

const config: Config<Attributes> = {
  edgeWidth: 5,
  nodeColor: (key, attributes, clicked, mouseOver) => {
    if (key === "3" && mouseOver) {
      return "yellow"
    }
    if (clicked && key === "8") {
      return "violet"
    }

    if (attributes?.value === 5) {
      return "red"
    }
    return "blue"
  },
  nodeRadius: (key, _attributes, _clicked, mouseOver) => {
    if (key === "3" && mouseOver) {
      return 10
    }
    return 6
  },
  nodeBorderWidth: (key, _attributes, _clicked, mouseOver) => {
    if (key === "3" && mouseOver) {
      return 10
    }
    return 2
  },
  nodeBorderColor: (key, _attributes, _clicked, mouseOver) => {
    if (key === "3" && mouseOver) {
      return "red"
    }
    return "white"
  },
  edgeColor(srcNodeKey, destNodeKey, srcAttribute, destNodeAttribute, clicked, mouseOver) {
    if (srcNodeKey === "3" && clicked) {
      return "violet"
    }
    if (mouseOver) {
      return "orange"
    }
    return "white"
  },
  nodeClick(key, position, event, draw) {
    // console.log(key, position, event)
    draw()
  },
  edgeClick(key, destNodeKey, event, draw) {
    draw()
  },
  nodeHover(key, position, event, draw) {
    //console.log(key)
    draw()
  },
  edgeHover(key, destNodeKey, event, draw) {
    draw()
  },
  styleCanvas: {
    borderRadius: "0.3rem"
  }
}
const graphMethods: GraphMethods<Graphology, Attributes> = {
  getNodeKeys: (graph) => graph.mapNodes((key) => key),
  getDestNodeKeys: (graph, nodeKey) =>
    graph.mapOutEdges(nodeKey, (_edge, _attributes, _source, target) => target),
  getNodeAttribute: (graph, nodeKey) => graph.getNodeAttributes(nodeKey) as Attributes
}

type Attributes = {
  value: number
}

const graphDrawer = new GraphDrawer<Graphology, Attributes>(graphMethods, container!, config)
graphDrawer.update(graph, ["1"])

const methods: GraphMethods<Graph<string>, string> = {
  getNodeKeys: (graph) => {
    const keys: string[] = []
    graph.nodes.forEach((_value, key) => {
      keys.push(key)
    })
    return keys
  },
  getDestNodeKeys: (graph, nodeKey) => graph.nodes.get(nodeKey)!.edges.map((edge) => edge.destNode.key),
  getNodeAttribute: (graph, nodeKey) => graph.nodes.get(nodeKey)!.attributes as string
}

const graph1 = new Graph<string>()
graph1.addNode("1", "hi")
graph1.addNode("2", "hi")
graph1.addNode("3", "hi")
graph1.addNode("4", "hi")

graph1.addEdge("1", "2")
graph1.addEdge("1", "3")
graph1.addEdge("1", "4")

const graph2 = new Graph<string>()
graph2.addNode("1", "hi")
graph2.addNode("2", "hi")
graph2.addNode("3", "hi")
graph2.addNode("4", "bye")

graph2.addEdge("1", "2")
graph2.addEdge("1", "3")
graph2.addEdge("1", "4")

const graph3 = new Graph<string>()
graph3.addNode("1", "hi")
graph3.addNode("2", "hi")
graph3.addNode("3", "hi")
graph3.addNode("4", "hi")

graph3.addEdge("1", "2")
graph3.addEdge("2", "3")
graph3.addEdge("2", "4")

const containerG1 = document.getElementById("Graph1")
const containerG2 = document.getElementById("Graph2")
const containerG3 = document.getElementById("Graph3")

const graphDrawerG1 = new GraphDrawer<Graph<string>, string>(methods, containerG1!, {})
const graphDrawerG2 = new GraphDrawer<Graph<string>, string>(methods, containerG2!, {})
const graphDrawerG3 = new GraphDrawer<Graph<string>, string>(methods, containerG3!, {})

graphDrawerG1.update(graph1, ["1"])
graphDrawerG2.update(graph2, ["1"])
graphDrawerG3.update(graph3, ["1"])
