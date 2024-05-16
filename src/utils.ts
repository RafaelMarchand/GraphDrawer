import Graph from "./Graph/Graph"
import Node from "./Graph/Node"
import { Config, ConfigInput } from "./main"

export function getConfig<A>(inputConfig: ConfigInput<A>): Config<A> {
  const config: Config<A> = {
    width: 400,
    heigth: 400,
    paddingGraph: 10,
    nodeClick: (_key, _position, _event) => {},
    nodeHover: (_key, _position, _event) => {},
    nodeEventRadiusFactor: 1,
    backgroundColor: "black",
    nodeRadius: 5,
    nodeBorderWidth: 2,
    nodeBorderColor: "white",
    nodeColor: "white",
    edgeWidth: 2,
    edgeColor: "white"
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
  getSrcNodeKeys: (graph: G, nodeKey: string) => string[]
  getNodeAttribute: ((graph: G, nodeKey: string) => A) | null
}

type TempNode<A> = {
  key: string
  edges: string []
  inEdges: string []
  attribute: A | null
}

export function convert<G, A>(graph: G, rootNodeKeys: string[], graphMethods: GraphMethods<G, A>) {
  const tempNodes: TempNode<A> [] = []
  const nodes: Node<A>[] = []

  graphMethods.getNodeKeys(graph).forEach((key: string) => {
    let attribute = null
    if (graphMethods.getNodeAttribute) {
      attribute = graphMethods.getNodeAttribute(graph, key)
    }
    const edges = graphMethods.getDestNodeKeys(graph, key)
    const inEdges = graphMethods.getSrcNodeKeys(graph, key)

    tempNodes.push({key, edges, inEdges, attribute})
    nodes.push(new Node(key, [], [], attribute))
  })

  nodes.forEach((node, index) => {
    node.inEdges = nodes.filter(n => tempNodes[index].inEdges.includes(n.key))
    node.edges = nodes.filter(n => tempNodes[index].edges.includes(n.key))
  })

  return new Graph<G, A>(nodes, rootNodeKeys)
}
