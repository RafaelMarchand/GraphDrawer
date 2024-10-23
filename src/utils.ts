import Graph from "./Graph/Graph"
import { ConfigIntern, GraphMethods } from "./main"
import Position from "./Vec.js"

export function getConfig<A>(inputConfig: Partial<ConfigIntern<A>>) {
  const config: ConfigIntern<A> = {
    maxArrangements: 100,
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
    nodeText: (key: string, _attribute, _clicked: boolean, _mouseOver: boolean) => key,
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

export function convert<G, A>(inputGraph: G, rootNodeKeys: string[], graphMethods: GraphMethods<G, A>) {
  const graph = new Graph<A>()

  graphMethods.getNodeKeys(inputGraph).forEach((key: string) => {
    let attributes = undefined
    if (graphMethods.getNodeAttribute) {
      attributes = graphMethods.getNodeAttribute(inputGraph, key)
    }
    graph.addNode(key, attributes)
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

export function permutator<T>(inputArr: T[]) {
  let results: T[][] = []

  function permute(arr: T[], memo: T[] | undefined = undefined) {
    let cur: T[]
    memo = memo || []
    for (let i = 0; i < arr.length; i++) {
      cur = arr.splice(i, 1)
      if (arr.length === 0) {
        results.push(memo.concat(cur))
      }
      permute(arr.slice(), memo.concat(cur))
      arr.splice(i, 0, cur[0])
    }
    return results
  }
  return permute(inputArr)
}
