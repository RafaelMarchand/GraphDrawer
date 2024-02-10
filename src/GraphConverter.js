import CanvasEdge from "./CanvasEdge.js"
import CanvasNode from "./CanvasNode.js"

export default function graphConverter(graph, graphMethods, rootNodeKeys) {
  let canvasNodes = []
  let canvasRootNodes = []
  let nodeValue = null
  let nodeFocus = null

  graphMethods.getNodeKeys(graph).forEach((nodeKey) => {
    if (graphMethods.getNodeValue && graphMethods.getNodeValue != null) {
      nodeValue = graphMethods.getNodeValue(graph, nodeKey)
    }
    // get the node key(s) for the focused node(s)
    if (graphMethods.getNodeFocus && graphMethods.getNodeFocus != null) {
      nodeFocus = graphMethods.getNodeFocus(graph, nodeKey)
    }
    canvasNodes.push(
      new CanvasNode(nodeKey, graphMethods.getOutEdgesKeys(graph, nodeKey), nodeValue, nodeFocus)
    )
  })

  canvasNodes.forEach((canvasNode) => {
    canvasNode.edges = canvasNode.edges.map((edgeKey) => {
      return new CanvasEdge(
        canvasNode,
        canvasNodes.find((cNode) => {
          return cNode.name === graphMethods.getDestNodeKey(graph, edgeKey)
        })
      )
    })
  })

  rootNodeKeys.forEach((nodeKey) => {
    canvasRootNodes.push(canvasNodes.find((canvasNode) => canvasNode.name === nodeKey))
  })
  return [canvasNodes, canvasRootNodes]
}
