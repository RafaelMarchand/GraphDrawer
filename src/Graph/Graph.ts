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
        const dummyNodes: Node<A>[] = []
        for (let i = 1; i < edgeLength; i++){
          let srcNodeDummy = dummyNodes.length > 0 ? dummyNodes[dummyNodes.length - 1] : node

          dummyNodes.push(
            new Node<A>(
              `${node.key}_dummy_${i}`,
              [],
              [srcNodeDummy],
              null
            ))
        }
        dummyNodes.forEach((dummy, index) => {
          dummy.dummy = true
          if (index === 0)  node.edges.push(dummy)
          if (index === dummyNodes.length - 1){
            dummy.edges.push(destNode)
          } else {
            dummy.edges.push(dummyNodes[index + 1])
          }
          dummy.depth = node.depth + index + 1
        })
        if (dummyNodes.length > 0) this.removeEdge(node, destNode)
        this.nodes = [...this.nodes, ...dummyNodes]
      })
    }) 
  }

  removeEdge(node: Node<A>, destNode: Node<A>){
    node.edges = node.edges.filter(edgeNode => edgeNode.key !== destNode.key)
    destNode.inEdges = destNode.inEdges.filter(edgeNode => edgeNode.key !== node.key)
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
