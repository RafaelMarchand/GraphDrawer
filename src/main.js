import DrawCanvas from "./DrawCanvas.js"
import graphConverter from "./GraphConverter.js"
import NodePositioning from "./NodePositioning.js"
import Vec from "./Vec.js"

const NODE_HOVER_RADIUS_FACTOR = 2

const DEFAULT_OPTIONS = {
  width: 1000,
  height: 600,
  nodeRadius: 5,
  nodeRadiusHover: 10,
  nodeRadiusFocus: 10,
  style: {
    borderRadius: "2rem",
    backgroundColor: "black",
    edgeColor: "white",
    nodeBorder: "white",
    edgeWidth: 5, // first hsl value to determine color
    nodeColorPositive: 0,
    nodeColorNegative: 240,
    maxLightness: 4
  }
}

export default class GraphDrawer {
  constructor(graphMethods, container = null, options, onNodeClick = null, onNodeHover = null) {
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
    if (container) {
      this.#createCanvas(container)
      this.#setUpListener()
    }
  }

  addToDOM(container, onNodeClick = null, onNodeHover = null) {
    this.onNodeClick = onNodeClick
    this.onNodeHover = onNodeHover
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
          this.drawCanvas.drawNode(nodeHoverOver, this.options.nodeRadiusHover)
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

  drawGraph(graph, rootNodes) {
    let [canvasNodes, canvasRootNodes] = graphConverter(graph, this.graphMethods, rootNodes)

    if (canvasNodes.length === this.canvasNodes.length) {
      this.#updateNodeValues(canvasNodes)
    } else {
      this.canvasNodes = canvasNodes
    }

    if (canvasNodes.lenght !== 0 && rootNodes.length !== 0) {
      this.nodePositioning = new NodePositioning(this.canvasNodes, canvasRootNodes, this.options)
      this.nodePositioning.position()
    }
    this.drawCanvas.draw(this.canvasNodes)
  }

  #posHasNode(pos) {
    let nodeMatch = null
    this.canvasNodes.forEach((node) => {
      if (
        pos.x > node.posX - this.options.nodeRadiusHover * NODE_HOVER_RADIUS_FACTOR &&
        pos.x < node.posX + this.options.nodeRadiusHover * NODE_HOVER_RADIUS_FACTOR &&
        pos.y > node.posY - this.options.nodeRadiusHover * NODE_HOVER_RADIUS_FACTOR &&
        pos.y < node.posY + this.options.nodeRadiusHover * NODE_HOVER_RADIUS_FACTOR
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
    this.canvas.style.borderRadius = this.options.style.borderRadius
    while (container.firstElementChild) {
      container.firstElementChild.remove()
    }
    container.append(this.canvas)

    let ctx = this.canvas.getContext("2d")
    ctx.fillRect
    this.drawCanvas = new DrawCanvas(ctx, this.options)
    this.drawCanvas.drawBackground()
  }
}
