import Position from "../Vec.js"
import Edge from "./Edge.js"

export default class Node<A> {
  key: string
  depth: number
  position: Position
  optimalPosY: number
  attributes: A | null
  clicked: boolean
  mouseOver: boolean
  dummy: boolean
  edges: Edge<A>[]
  inEdges: Edge<A>[]
  constructor(key: string, attributes: A | null) {
    this.key = key
    this.depth = 0
    this.position = new Position(0, 0)
    this.optimalPosY = 0
    this.attributes = attributes
    this.clicked = false
    this.mouseOver = false
    this.dummy = false
    this.edges = []
    this.inEdges = []
  }

  get posX() {
    return this.position.x
  }

  set posX(x) {
    this.position.x = Math.floor(x)
  }

  get posY() {
    return this.position.y
  }

  set posY(y) {
    this.position.y = Math.floor(y)
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

    for (const edgeA of this.edges) {
      if (!node.edges.find((edge) => edge.destNode.key === edgeA.destNode.key)) {
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
