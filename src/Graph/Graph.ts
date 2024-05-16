import Node from "./Node"

const STARTING_DEPTH = 0

export default class Graph<G, A = null> {
  nodes: Node<A>[]
  rootNodeKeys: string[]
  depth: number

  constructor(nodes: Node<A>[], rootNodeKeys: string[]) {
    this.nodes = nodes
    this.rootNodeKeys = rootNodeKeys
    this.depth = STARTING_DEPTH
    this.setDepthNodes()
  }

  equalValues(graph: Graph<G, A>) {
    if (this.nodes.length !== graph.nodes.length) return false

    for (let i = 0; i < this.nodes.length; i++) {
      if (!this.nodes[i].equalValues(graph.nodes[i])) {
        return false
      }
    }
    return true
  }

  equalStructure(graph: Graph<G, A>) {
    if (this.rootNodeKeys.length !== graph.rootNodeKeys.length) return false
    this.rootNodeKeys.forEach((rootNodeKey) => {
      if (!graph.rootNodeKeys.includes(rootNodeKey)) {
        return false
      }
    })

    if (this.nodes.length !== graph.nodes.length) return false

    for (let i = 0; i < this.nodes.length; i++) {
      if (!this.nodes[i].equalStructure(graph.nodes[i])) {
        return false
      }
    }
    return true
  }

  getNodesAtDepth(depth: number): Node<A>[] {
    return this.nodes.filter((node) => node.depth === depth)
  }

  getRootNodes(): Node<A>[] {
    const rootNodes: Node<A>[] = []
    this.nodes.forEach((node: Node<A>) => {
      if (this.rootNodeKeys.includes(node.key)) {
        rootNodes.push(node)
      }
    })
    return rootNodes
  }

  setDepthNodes() {
    this.getRootNodes().forEach((node) => {
      this.setDepthNode(node, STARTING_DEPTH)
    })
  }

  setDepthNode(node: Node<A>, depth: number) {
    const nextDepth = depth + 1
    if (this.depth < depth) {
      this.depth = depth
    }
    node.depth = depth
    node.edges.forEach((destNode) => {
      this.setDepthNode(destNode, nextDepth)
    })
  }
}
