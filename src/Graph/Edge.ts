import Position from "../Vec.js"
import Node from "./Node"

type BezierPoints = {
  cp1: Position
  cp2: Position
}
export type State = {
  clicked: boolean
  mouseOver: boolean
}

export default class Edge<A> {
  srcNode: Node<A>
  destNode: Node<A>
  bezierPoints: BezierPoints
  state: State
  constructor(srcNode: Node<A>, destNode: Node<A>, state?: State) {
    this.srcNode = srcNode
    this.destNode = destNode
    this.bezierPoints = { cp1: new Position(0, 0), cp2: new Position(0, 0) }
    this.state = state || { clicked: false, mouseOver: false }
  }
}
