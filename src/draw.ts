import Graph from "./Graph/Graph"
import Node, { DummyValues } from "./Graph/Node"
import { ConfigIntern } from "./main"
import { getValue } from "./utils"

export function draw<A>(graph: Graph<A>, context: CanvasRenderingContext2D, config: ConfigIntern<A>) {
  drawBackground()
  graph.nodes.forEach((node) => {
    drawEdges(node)
  })
  graph.nodes.forEach((node) => {
    drawNode(node)
  })

  function drawBackground() {
    context.fillStyle = config.backgroundColor
    context.fillRect(0, 0, config.width, config.height)
  }
  function drawNode(node: Node<A>) {
    if (node.dummy) return
    context.strokeStyle = getValue(config.nodeBorderColor, node.key, node.attributes, node.clicked, node.mouseOver)
    context.lineWidth = getValue(config.nodeBorderWidth, node.key, node.attributes, node.clicked, node.mouseOver)
    context.beginPath()
    context.arc(node.posX, node.posY, getValue(config.nodeRadius, node.key, node.attributes, node.clicked, node.mouseOver), 0, 2 * Math.PI)
    context.stroke()
    context.fillStyle = getValue(config.nodeColor, node.key, node.attributes, node.clicked, node.mouseOver)
    context.fill()

    if (config.nodeHasText) {
      context.fillStyle = config.nodeFontColor
      context.font = config.nodeFont
      const text = getValue(config.nodeText, node.key, node.attributes, node.clicked, node.mouseOver)
      context.fillText(text, node.posX + config.nodeTextOffset.x, node.posY + config.nodeTextOffset.y)
      context.font = `${config.nodeFontSize}px ${config.nodeFont}`
    }
  }

  function drawEdges(node: Node<A>) {
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

      context.lineWidth = getValue(config.edgeWidth, vals.srcNodeKey, vals.destNodeKey, vals.srcNodeAttributes, vals.destNodeAttributes, state.clicked, state.mouseOver)
      context.strokeStyle = getValue(config.edgeColor, vals.srcNodeKey, vals.destNodeKey, vals.srcNodeAttributes, vals.destNodeAttributes, state.clicked, state.mouseOver)
      context.beginPath()
      context.moveTo(node.posX, node.posY)
      context.bezierCurveTo(bezierPoints!.cp1.x, bezierPoints!.cp1.y, bezierPoints!.cp2.x, bezierPoints!.cp2.y, destNode.posX, destNode.posY)
      context.stroke()
    })
  }

  //************************************************************
  // Drawing edges on buffer might be helpfull in future
  //************************************************************

  // function drawEdges1(node: Node<A>) {
  //   node.edges.forEach((destNode: Node<A>) => {
  //     const lineWidth = getValue(config.edgeWidth, node.attributes, destNode.attributes)
  //     const buffer = document.createElement("canvas")
  //     const bufferContext = buffer.getContext("2d")!

  //     buffer.width = destNode.posX - node.posX
  //     buffer.height = Math.abs(node.posY - destNode.posY) + lineWidth
  //     const edgDirection = node.posY - destNode.posY // positve -> curve goes up, negative -> curve goes down

  //     const nodeY = edgDirection > 0 ? buffer.height - lineWidth / 2 : lineWidth / 2
  //     const destNodeY = edgDirection > 0 ? lineWidth / 2 : buffer.height - lineWidth / 2

  //     let p1 = new Position(Math.floor(buffer.width * CONTROLPOINT), nodeY)
  //     let p2 = new Position(Math.floor(buffer.width - buffer.width * CONTROLPOINT), destNodeY)

  //     // bufferContext.lineWidth = 1
  //     // bufferContext.strokeStyle = "green"

  //     // bufferContext.beginPath()
  //     // bufferContext.rect(0, 0, buffer.width, buffer.height)
  //     // bufferContext.stroke()

  //     bufferContext.lineWidth = lineWidth
  //     bufferContext.strokeStyle = getValue(config.edgeColor, node.attributes, destNode.attributes)

  //     bufferContext.beginPath()
  //     bufferContext.moveTo(0, nodeY)
  //     bufferContext.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, buffer.width, destNodeY)
  //     bufferContext.stroke()

  //     const bufferY = edgDirection > 0 ? node.posY - buffer.height + lineWidth / 2 : node.posY - lineWidth / 2
  //     context.drawImage(buffer, node.posX, bufferY)

  //     // bufferContext.getImageData(0, 0, config.width, config.heigth).data.forEach((pixel, index) => {
  //     //   if (pixel !== 0) {
  //     //     const x = index % buffer.width
  //     //     const y = Math.floor(index / buffer.width)
  //     //     node.pixels.push(new Position(x, y))
  //     //   }
  //     // })

  //     //console.log(node.key, node.posY, destNode.key)
  //   })
  // }
}
