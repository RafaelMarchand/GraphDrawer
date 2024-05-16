export default class Node<A> {
  key: string
  posX: number
  posY: number
  depth: number | null
  optimalPosY: number
  edges: Node<A>[]
  inEdges: Node<A>[]
  attributes: A | null
  constructor(key: string, edges: Node<A>[], inEdges: Node<A>[], attributes: A | null) {
    this.key = key
    this.posX = 0
    this.posY = 0
    this.depth = null
    this.optimalPosY = 0
    this.edges = edges
    this.inEdges = inEdges
    this.attributes = attributes
  }

  equalValues(node: Node<A>) {
    if (this.key !== node.key) return false

    if (node.attributes === Object(node.attributes)) {
      // is Object
      const values = Object.values(this.attributes!)
      const newValues = Object.values(node.attributes!)

      if (newValues.length !== values.length) return false

      for (let i = 0; i < values.length; i++) {
        if (values[i] !== newValues[i]) {
          return false
        }
      }
    } else {
      // is Primitive
      if (this.attributes !== node.attributes) {
        return false
      }
    }
    return true
  }

  equalStructure(node: Node<A>) {
    if (this.key !== node.key) return false
    if (this.edges.length !== node.edges.length) return false

    for (let i = 0; i < this.edges.length; i++) {
      if (this.edges[i] !== node.edges[i]) {
        return false
      }
    }
    return true
  }

  setOptimalPositionY(srcNodes: Node<A>[], canvasHeigth: number) {
    let minimalDistance = Infinity
    for (let y = 0; y < canvasHeigth; y++) {
      const distance = srcNodes.reduce((distance, srcNode) => {
        return Math.floor(distance + Math.pow(srcNode.posY - y, 2))
      }, 0)
      if (distance < minimalDistance) {
        minimalDistance = distance
        this.optimalPosY = y
      }
    }
  }

  hasEdges() {
    return this.edges.length !== 0
  }

  setPosX(pos: number) {
    this.posX = Math.floor(pos)
  }

  setPosY(pos: number) {
    this.posY = Math.floor(pos)
  }

  setDepth(depth: number) {
    if (this.depth === null || this.depth < depth) {
      this.depth = depth
    }
  }
}
