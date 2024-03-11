import DrawCanvas from "./DrawCanvas.js"
import graphConverter from "./GraphConverter.js"
import NodePositioning from "./NodePositioning.js"
import Vec from "./Vec.js"

const DEFAULT_OPTIONS = {
  width: 1000,
  height: 600,
  nodeRadius: 5,
  nodeRadiusFocus: 10,
  nodeHoverRadiusFactor: 1,
  style: {
    borderRadius: "2rem"
  },
  graphStyle: {
    backgroundColor: "black",
    edgeColor: "white",
    nodeBorder: "white",
    edgeWidth: 5, // first hsl value to determine color
    nodeColorPositive: 0,
    nodeColorNegative: 240,
    nodeColorFocus: "blue",
    nodeBorderFocusWidth: 0,
    nodeBorderFocusColor: "white",
    maxLightness: 4
  }
}

export default class GraphDrawer {
  constructor(graphMethods, container, options, onNodeClick = null, onNodeHover = null) {
    if ((options != null && Object.keys(options).length === 0) || !options) {
      this.options = DEFAULT_OPTIONS
    } else {
      this.options = options
    }
    this.graphMethods = graphMethods
    this.onNodeClick = onNodeClick
    this.onNodeHover = onNodeHover
    this.canvas = null
    this.drawCanvas = null
    this.canvasNodes = []
    this.nodePositioning = null
    this.#createCanvas(container)
    this.#setUpListener()
  }

  #setUpListener() {
    if (this.onNodeClick) {
      this.canvas.addEventListener("mouseup", (event) => {
        let clickedOnNode = this.#posHasNode(new Vec(event.offsetX, event.offsetY))
        if (clickedOnNode !== null) {
          this.onNodeClick(clickedOnNode.name, { x: clickedOnNode.posX, y: clickedOnNode.posY }, event)
        }
      })
    }
    if (this.onNodeHover) {
      let onNode = false
      this.canvas.addEventListener("mousemove", (event) => {
        let nodeHoverOver = this.#posHasNode(new Vec(event.offsetX, event.offsetY))
        if (nodeHoverOver !== null && !onNode) {
          this.drawCanvas.drawFocusNode(nodeHoverOver)
          onNode = true
          this.onNodeHover(nodeHoverOver.name, { x: nodeHoverOver.posX, y: nodeHoverOver.posY }, event)
        }
        if (nodeHoverOver === null && onNode) {
          this.drawCanvas.draw(this.canvasNodes)
          this.onNodeHover(undefined, { x: null, y: null }, event)
          onNode = false
        }
      })
    }
  }

  #updateNodeValues(canvasNodes) {
    if (canvasNodes.length === this.canvasNodes.length) {
      for (let i = 0; i < this.canvasNodes.length; i++) {
        this.canvasNodes[i].value = canvasNodes[i].value
        this.canvasNodes[i].focus = canvasNodes[i].focus
      }
    }
  }

  compareGraph(graph1, graph2) {
    if (graph1.length !== graph2.length) return false

    for (let i = 0; i < graph1.length; i++) {
      if (!this.compareNode(graph1[i], graph2[i])) {
        return false
      }
    }
    return true
  }

  compareNode(nodeA, nodeB) {
    if (nodeA.name !== nodeB.name) return false
    if (nodeA.edges.length !== nodeB.edges.length) return false

    for (let i = 0; i < nodeA.edges.length; i++) {
      if (nodeA.edges[i].destNode.name !== nodeB.edges[i].destNode.name) {
        return false
      }
    }
    return true
  }

  drawGraph(graph, rootNodes) {
    const [canvasNodes, canvasRootNodes] = graphConverter(graph, this.graphMethods, rootNodes)

    const structuralEqual = this.compareGraph(this.canvasNodes, canvasNodes)
    if (canvasNodes.length === this.canvasNodes.length) {
      this.#updateNodeValues(canvasNodes)
    } else {
      this.canvasNodes = canvasNodes
    }

    if (canvasNodes.length !== 0 && rootNodes.length !== 0 && !structuralEqual) {
      this.nodePositioning = new NodePositioning(this.canvasNodes, canvasRootNodes, this.options)
      this.nodePositioning.position()
    }
    this.drawCanvas.draw(this.canvasNodes)
  }

  #posHasNode(pos) {
    let nodeMatch = null
    this.canvasNodes.forEach((node) => {
      if (
        pos.x > node.posX - this.options.nodeRadiusHover * this.options.nodeHoverRadiusFactor &&
        pos.x < node.posX + this.options.nodeRadiusHover * this.options.nodeHoverRadiusFactor &&
        pos.y > node.posY - this.options.nodeRadiusHover * this.options.nodeHoverRadiusFactor &&
        pos.y < node.posY + this.options.nodeRadiusHover * this.options.nodeHoverRadiusFactor
      ) {
        nodeMatch = node
      }
    })
    return nodeMatch
  }

  #createCanvas(container) {
    this.canvas = document.createElement("canvas")
    this.canvas.width = this.options.width
    this.canvas.height = this.options.height
    this.canvas.style.borderRadius = "0.3rem"
    while (container.firstElementChild) {
      container.firstElementChild.remove()
    }
    container.append(this.canvas)

    this.drawCanvas = new DrawCanvas(this.canvas.getContext("2d"), this.options)
    this.drawCanvas.drawBackground()
  }
}
