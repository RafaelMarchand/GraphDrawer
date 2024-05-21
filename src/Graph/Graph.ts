import Node from "./Node"

const STARTING_DEPTH = 0

export default class Graph<A = null> {
  nodes: Node<A>[]
  rootNodeKeys: string[]
  isDepthSet: Boolean

  constructor(nodes: Node<A>[] = [], rootNodeKeys: string[] = []) {
    this.nodes = nodes
    this.rootNodeKeys = rootNodeKeys
    this.isDepthSet = true
    this.setDepthNodes()
    this.createDummyNodes()
  }

  createDummyNodes() {
    this.nodes.forEach(node => {
      node.edges.forEach(destNode => {
        const edgeLength = destNode.depth - node.depth
        this.createDummyNode(node, destNode, edgeLength)

      })
    }) 
  }

  createDummyNode(node: Node<A>, destNode: Node<A>, edgeLength: number, i = 1) {
    if (i + 1 < edgeLength) {
      this.addNode(new Node<A>(
        `${node.key}_to_${destNode.key}_${i}`,
        [],
        [node],
        null
      ))
    }

    this.addNode(new Node<A>(
      `${node.key}_to_${destNode.key}_${i}`,
      [destNode],
      [node],
      null
    ))

    const destKey = i + 1 < edgeLength ?  `${node.key}_to_${destNode.key}_${i + 1}` : destNode.key
    this.addNode(new Node<A>(
      `${node.key}_to_${destNode.key}_${i}`,
      [],
      [],
      null
    ))
  }

  addRootNode(node: Node<A>) {
    node.depth = 0
    this.nodes.push(node)
    this.rootNodeKeys.push(node.key)
  }

  addNode(node: Node<A>) {
    this.nodes.push(node)
    node.edges.forEach((edgeNode) => {
      edgeNode.inEdges.push(node)
    })
    node.inEdges.forEach((edgeNode) => {
      edgeNode.edges.push(node)
    })
    this.isDepthSet = false
  }

  getDepth() {
    if (!this.isDepthSet) {
      this.setDepthNodes()
    }
    let depth = 0
    this.nodes.forEach((node) => {
      if (node.depth > depth) {
        depth = node.depth
      }
    })
    return depth
  }

  equalValues(graph: Graph<A>) {
    if (this.nodes.length !== graph.nodes.length) return false

    for (let i = 0; i < this.nodes.length; i++) {
      if (!this.nodes[i].equalValues(graph.nodes[i])) {
        return false
      }
    }
    return true
  }

  equalStructure(graph: Graph<A>) {
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
    if (!this.isDepthSet) {
      this.setDepthNodes()
    }
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
    this.isDepthSet = true
  }

  setDepthNode(node: Node<A>, depth: number) {
    const nextDepth = depth + 1
    if (node.depth < depth) {
      node.depth = depth
    }
    node.edges.forEach((destNode) => {
      this.setDepthNode(destNode, nextDepth)
    })
  }
}
