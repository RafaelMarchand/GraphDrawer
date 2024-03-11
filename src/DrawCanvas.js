import Vec from "./Vec.js"

const CONTROLPOINT = 0.7

export default class DrawCanvas {
  constructor(context, options) {
    this.ctx = context
    this.options = options
    this.style = options.style
  }

  drawBackground() {
    this.ctx.fillStyle = this.options.graphStyle.backgroundColor
    this.ctx.fillRect(0, 0, this.options.width, this.options.height)
  }

  draw(canvasNodes) {
    this.drawBackground()
    canvasNodes.forEach((node) => {
      this.#drawEdge(node)
      if (node.focus && node.focus === true) {
        this.drawFocusNode(node)
      } else {
        this.drawNode(node)
      }
    })
  }

  drawNode(node) {
    this.ctx.strokeStyle =
      this.options.graphStyle.nodeBorder === undefined
        ? this.#getEvalColor(node.value)
        : this.options.graphStyle.nodeBorder
    this.ctx.beginPath()

    this.ctx.arc(node.posX, node.posY, this.options.nodeRadius, 0, 2 * Math.PI)

    this.ctx.stroke()
    this.ctx.fillStyle = this.#getEvalColor(node.value)
    this.ctx.fill()
  }

  drawFocusNode(node) {
    this.ctx.strokeStyle = this.options.graphStyle.nodeBorderFocusColor
    this.ctx.lineWidth = this.options.graphStyle.nodeBorderFocusWidth
    this.ctx.beginPath()

    this.ctx.arc(node.posX, node.posY, this.options.nodeRadiusFocus, 0, 2 * Math.PI)

    this.ctx.stroke()
    this.ctx.fillStyle = this.options.graphStyle.nodeColorFocus
    this.ctx.fill()
  }

  #drawEdge(node) {
    node.edges.forEach((edge) => {
      let xGap = edge.destNode.posX - node.posX
      let p1 = new Vec(Math.floor(xGap * CONTROLPOINT + node.posX), node.posY)
      let p2 = new Vec(Math.floor(edge.destNode.posX - xGap * CONTROLPOINT), edge.destNode.posY)

      this.ctx.lineWidth = this.options.graphStyle.edgeWidth
      if (node.value !== null && edge.destNode.value !== null) {
        this.ctx.strokeStyle = this.#createGradient(node, edge.destNode)
      } else {
        this.ctx.strokeStyle = this.options.graphStyle.edgeColor
      }
      this.ctx.beginPath()
      this.ctx.moveTo(node.posX, node.posY)
      this.ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, edge.destNode.posX, edge.destNode.posY)
      this.ctx.stroke()
    })
  }

  #createGradient(node, destNode) {
    let grd = this.ctx.createLinearGradient(node.posX, node.posY, destNode.posX, destNode.posY)
    grd.addColorStop(0, this.#getEvalColor(node.value))
    grd.addColorStop(1, this.#getEvalColor(destNode.value))
    return grd
  }

  #getEvalColor(value) {
    let l = Math.floor((-Math.abs(value) * 100) / this.options.graphStyle.maxLightness) + 100
    let color
    if (l < 50) {
      l = 50
    }
    if (value >= 0) {
      color = `hsl(${this.options.graphStyle.nodeColorPositive}, 100%, ${l}%)`
    } else {
      color = `hsl(${this.options.graphStyle.nodeColorNegative}, 100%, ${l}%)`
    }
    return color
  }
}
