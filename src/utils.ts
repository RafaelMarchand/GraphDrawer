import Graph from "./Graph/Graph"
import { ConfigIntern } from "./main"
import Position from "./Vec.js"

export function getConfig<A>(inputConfig: Partial<ConfigIntern<A>>): ConfigIntern<A> {
  const config: ConfigIntern<A> = {
    width: 400,
    height: 400,
    paddingGraph: 10,
    nodeClick: (_key, _position, _event) => {},
    nodeHover: (_key, _position, _event) => {},
    edgeClick(_srcNodeKey, _destNodeKey, _event, _draw) {},
    edgeHover(_srcNodeKey, _destNodeKey, _event, _draw) {},
    nodeEventThreshold: 1,
    edgeEventThreshold: 4,
    backgroundColor: "black",
    nodeRadius: 5,
    nodeBorderWidth: 2,
    nodeBorderColor: "white",
    nodeColor: "white",
    nodeHasText: true,
    nodeTextOffset: new Position(0, -15),
    nodeFontColor: "white",
    nodeFontSize: 15,
    nodeText: (key: string, _attribute: A, _clicked: boolean, _mouseOver: boolean) => key,
    nodeFont: "serif",
    edgeWidth: 2,
    edgeColor: "white",
    styleCanvas: {}
  }
  return Object.assign(config, inputConfig)
}

export function getValue<R>(property: ((...args: any) => R) | R, ...args: any): R {
  if (property instanceof Function) {
    return property(...args)
  } else {
    return property
  }
}

export type GraphMethods<G, A> = {
  getNodeKeys: (graph: G) => string[]
  getDestNodeKeys: (graph: G, nodeKey: string) => string[]
  getNodeAttribute: ((graph: G, nodeKey: string) => A) | null
}

export function convert<G, A>(inputGraph: G, rootNodeKeys: string[], graphMethods: GraphMethods<G, A>) {
  const graph = new Graph<A>()

  graphMethods.getNodeKeys(inputGraph).forEach((key: string) => {
    let attributes = null
    if (graphMethods.getNodeAttribute) {
      attributes = graphMethods.getNodeAttribute(inputGraph, key)
    }
    graph.addNode(key, attributes as null)
  })

  graphMethods.getNodeKeys(inputGraph).forEach((key: string) => {
    const destNodeKeys = graphMethods.getDestNodeKeys(inputGraph, key)

    destNodeKeys.forEach((destNodeKey) => {
      graph.addEdge(key, destNodeKey)
    })
  })
  graph.initialize(rootNodeKeys)
  return graph
}
