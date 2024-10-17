import { ConfigIntern } from "../main"
import Graph from "./Graph"
import Node, { DummyValues } from "./Node"
import Position from "../Vec.js"
import { getValue } from "../utils"

export default class Drawer<A> {
  graph: Graph<A>
  config: ConfigIntern<A>
  context: CanvasRenderingContext2D

  constructor(config: ConfigIntern<A>, canvas: HTMLCanvasElement) {
    this.graph = new Graph<A>()
    this.config = config
    this.context = canvas.getContext("2d")!
    this.setBezierCurvePoints()
  }

  setBezierCurvePoints() {
    const CONTROLPOINT = 0.7
    this.graph.nodes.forEach((node) => {
      node.edges.forEach((edge) => {
        let edgeWidth = edge.destNode.posX - node.posX
        let cp1 = new Position(Math.floor(edgeWidth * CONTROLPOINT + node.posX), node.posY)
        let cp2 = new Position(Math.floor(edge.destNode.posX - edgeWidth * CONTROLPOINT), edge.destNode.posY)

        edge.bezierPoints = { cp1, cp2 }
      })
    })
  }

  draw(graph?: Graph<A>) {
    if (graph) {
      this.graph = graph
      this.setBezierCurvePoints()
    }
    this.drawBackground()
    this.graph.nodes.forEach((node) => {
      this.drawEdges(node)
    })
    this.graph.nodes.forEach((node) => {
      this.drawNode(node)
    })
  }

  drawBackground() {
    this.context.fillStyle = this.config.backgroundColor
    this.context.fillRect(0, 0, this.config.width, this.config.height)
  }

  drawNode(node: Node<A>) {
    if (node.dummy) return
    this.context.strokeStyle = getValue(this.config.nodeBorderColor, node.key, node.attributes, node.clicked, node.mouseOver)
    this.context.lineWidth = getValue(this.config.nodeBorderWidth, node.key, node.attributes, node.clicked, node.mouseOver)
    this.context.beginPath()
    this.context.arc(node.posX, node.posY, getValue(this.config.nodeRadius, node.key, node.attributes, node.clicked, node.mouseOver), 0, 2 * Math.PI)
    this.context.stroke()
    this.context.fillStyle = getValue(this.config.nodeColor, node.key, node.attributes, node.clicked, node.mouseOver)
    this.context.fill()

    if (this.config.nodeHasText) {
      this.context.fillStyle = this.config.nodeFontColor
      this.context.font = this.config.nodeFont
      const text = getValue(this.config.nodeText, node.key, node.attributes, node.clicked, node.mouseOver)
      this.context.fillText(text, node.posX + this.config.nodeTextOffset.x, node.posY + this.config.nodeTextOffset.y)
      this.context.font = `${this.config.nodeFontSize}px ${this.config.nodeFont}`
    }
  }

  drawEdges(node: Node<A>) {
    node.edges.forEach(({ destNode, bezierPoints, state }) => {
      let vals: DummyValues<A> = {
        srcNodeKey: node.key,
        srcNodeAttributes: node.attributes,
        destNodeKey: destNode.key,
        destNodeAttributes: destNode.attributes
      }
      if (node.dummy) {
        vals = node.dummyValues!
      }
      if (destNode.dummy) {
        vals = destNode.dummyValues!
      }

      this.context.lineWidth = getValue(
        this.config.edgeWidth,
        vals.srcNodeKey,
        vals.destNodeKey,
        vals.srcNodeAttributes,
        vals.destNodeAttributes,
        state.clicked,
        state.mouseOver
      )
      this.context.strokeStyle = getValue(
        this.config.edgeColor,
        vals.srcNodeKey,
        vals.destNodeKey,
        vals.srcNodeAttributes,
        vals.destNodeAttributes,
        state.clicked,
        state.mouseOver
      )
      this.context.beginPath()
      this.context.moveTo(node.posX, node.posY)
      this.context.bezierCurveTo(bezierPoints!.cp1.x, bezierPoints!.cp1.y, bezierPoints!.cp2.x, bezierPoints!.cp2.y, destNode.posX, destNode.posY)
      this.context.stroke()
    })
  }
}
