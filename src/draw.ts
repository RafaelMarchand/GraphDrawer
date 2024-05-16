import Graph from "./Graph/Graph.ts"
import Node from "./Graph/Node.ts"
import Position from "./Position.ts"
import { Config } from "./main.ts"
import { getValue } from "./utils.ts"

type Context = CanvasRenderingContext2D

const CONTROLPOINT = 0.7

export function draw<G, A>(graph: Graph<G, A>, canvas: HTMLCanvasElement, config: Config<A>) {
  const context = canvas.getContext("2d")!

  drawBackground(context, config)
  graph.nodes.forEach((node) => {
    drawNode(node)
    drawEdges(node)
  })

  function drawBackground(context: Context, config: Config<A>) {
    context.fillStyle = config.backgroundColor
    context.fillRect(0, 0, canvas.width, canvas.height)
  }
  function drawNode(node: Node<A>) {
    context.strokeStyle = getValue(config.nodeBorderColor, node.attributes)
    context.lineWidth = getValue(config.nodeBorderWidth, node.attributes)
    context.beginPath()
    context.arc(node.posX, node.posY, getValue(config.nodeRadius, node.attributes), 0, 2 * Math.PI)
    context.stroke()
    context.fillStyle = getValue(config.nodeColor, node.attributes)
    context.fill()

    context.fillStyle = "white"
    context.font = "15px serif"
    context.fillText(node.key, node.posX + 10, node.posY - 15)
    context.font = "10px serif"
    //context.fillText(String(node.depth!), node.posX - 10, node.posY - 15)
  }

  function drawEdges(node: Node<A>) {
    node.edges.forEach((destNode: Node<A>) => {
      let xGap = destNode.posX - node.posX
      let p1 = new Position(Math.floor(xGap * CONTROLPOINT + node.posX), node.posY)
      let p2 = new Position(Math.floor(destNode.posX - xGap * CONTROLPOINT), destNode.posY)

      context.lineWidth = getValue(config.edgeWidth, node.attributes, destNode.attributes)
      context.strokeStyle = getValue(config.edgeColor, node.attributes, destNode.attributes)

      context.beginPath()
      context.moveTo(node.posX, node.posY)
      context.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, destNode.posX, destNode.posY)
      context.stroke()
    })
  }
}
