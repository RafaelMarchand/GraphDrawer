import count from "./Intersection.js"

const STARTING_DEPTH = 0
const X_PADDING_FACTOR = 4 // 0...infinity 0 => max Padding, infinity => min Padding
const Y_SCALING = 1.6

export default class NodePositioning {
  constructor(nodes, rootNodes, options) {
    this.nodes = nodes
    this.options = options
    this.nodeGap = 0
    this.graphDepth = 0
    this.nodesDept = []
    this.maxNodeCount = 0
    this.maxEdgesDepht = 0
    this.#getNodesDept(rootNodes)
    const [maxNodeCount, maxEdgesDepht] = this.#maxElementsDepth()
    this.maxEdgesDepht = maxEdgesDepht
    this.maxNodeCount = maxNodeCount
  }

  position_2() {
    let startingDepth = this.maxEdgesDepht
    if (this.graphDepth - (this.maxEdgesDepht + 1) > this.maxEdgesDepht) {
      startingDepth = this.maxEdgesDepht + 1
    }
    this.#nodePosX()
    this.nodePosY(startingDepth)
    return this.nodes
  }

  position() {
    this.#nodePosX()
    this.nodePosY_1()
    return this.nodes
  }

  #getNodesDept(nodes) {
    nodes.forEach((node) => {
      this.#getDepthNode(node, STARTING_DEPTH)
    })
  }

  #getDepthNode(node, depth) {
    if (this.graphDepth < depth) {
      this.graphDepth = depth
    }
    node.depth = depth
    let nextDept = depth + 1
    node.edges.forEach((edge) => {
      if (edge.destNode.depth === null || edge.destNode.depth < depth) {
        this.#getDepthNode(edge.destNode, nextDept)
      }
    })
  }

  nodePosY_1() {
    for (let i = -1; i < this.graphDepth; i++) {
      this.#verticalNodePos(i + 1, i)
    }
  }

  nodePosY(startingDepth) {
    const startNodes = this.nodesDept[startingDepth]
    const permutations = this.#permutator(startNodes)
    let intersectionCounts = []
    let minIntersectionCount = null
    let minIntersectionCountIndex

    permutations.forEach((perm) => {
      let intersectionCountPermu = 0
      this.#setAllNodePosY(perm, startingDepth)
      this.nodesDept.forEach((nodes) => {
        intersectionCountPermu += count(nodes)
      })
      intersectionCounts.push(intersectionCountPermu)
    })

    intersectionCounts.forEach((intersectionCount, index) => {
      if (minIntersectionCount === null || minIntersectionCount > intersectionCount) {
        minIntersectionCountIndex = index
        minIntersectionCount = intersectionCount
      }
    })
    this.#setAllNodePosY(permutations[minIntersectionCountIndex], startingDepth)
  }

  #setAllNodePosY(nodes, startingDepth) {
    this.#centerNodesAlongY(nodes)
    for (let i = startingDepth; i < this.graphDepth; i++) {
      this.#verticalNodePos(i + 1, i)
    }
    for (let i = startingDepth; i > 0; i--) {
      this.#verticalNodePos(i - 1, i)
    }
  }

  #permutator(inputArr) {
    var results = []

    function permute(arr, memo) {
      var cur,
        memo = memo || []
      for (var i = 0; i < arr.length; i++) {
        cur = arr.splice(i, 1)
        if (arr.length === 0) {
          results.push(memo.concat(cur))
        }
        permute(arr.slice(), memo.concat(cur))
        arr.splice(i, 0, cur[0])
      }
      return results
    }
    return permute(inputArr)
  }

  #verticalNodePos(depthRePos, depthFixed) {
    let nodes = this.nodesDept[depthRePos]
    this.nodeGap = this.options.height / (5 * nodes.length)
    nodes.forEach((node) => {
      let nodesFixed = node.edges.map((edge) => edge.destNode.posY)
      if (depthFixed < depthRePos) {
        nodesFixed = this.incomingEdges(node).map((edge) => edge.srcNode.posY)
      }
      this.veticalDist(node, nodesFixed)
    })
    nodes.sort((a, b) => {
      return a.getOptimalPos() - b.getOptimalPos()
    })

    this.#centerNodesAlongY(nodes)
  }

  #centerNodesAlongY(nodes) {
    if (nodes.length === 1) {
      nodes[0].setPosY(this.options.height / 2)
      return
    }
    const padding = this.options.height / (nodes.length * Y_SCALING)
    const nodeGap = (this.options.height - padding * 2) / (nodes.length - 1)
    nodes.sort((a, b) => {
      return a.posY - b.posY
    })
    let posAct = padding
    nodes.forEach((node, index) => {
      node.setPosY(posAct + index * nodeGap)
    })
  }

  #nodePosX() {
    let padding = this.options.width / 2
    let nodeGap = 0

    if (this.graphDepth !== 0) {
      padding = this.options.width / (this.graphDepth * X_PADDING_FACTOR)
      nodeGap = (this.options.width - 2 * padding) / this.graphDepth
    }
    let posAct = padding
    for (let i = 0; i <= this.graphDepth; i++) {
      this.nodesDept[i].forEach((node) => {
        node.setPosX(posAct + i * nodeGap)
      })
    }
  }

  incomingEdges(nodeIn) {
    let edges = []
    this.nodes.forEach((node) => {
      node.edges.forEach((edge) => {
        if (edge.destNode.name === nodeIn.name) {
          edges.push(edge)
        }
      })
    })
    return edges
  }

  veticalDist(node, nodesFixed) {
    for (let y = 0; y < this.options.height; y++) {
      node.distances.set(
        y,
        nodesFixed.reduce((dist, yNode) => {
          return Math.floor(dist + Math.pow(yNode - y, 2))
        }, 0)
      )
    }
  }

  #maxElementsDepth() {
    let edgeCountMax = 0
    let maxEdgesDepht = null
    let maxNodeCount = null
    for (let i = 0; i <= this.graphDepth; i++) {
      let edgeCount = 0
      let nodes = this.nodes.filter((node) => node.depth === i)
      this.nodesDept.push(nodes)
      if (maxNodeCount === null || maxNodeCount < nodes.length) {
        maxNodeCount = nodes.length
      }
      nodes.forEach((node) => {
        edgeCount += node.edges.length
      })
      if (edgeCount > edgeCountMax || maxEdgesDepht === null) {
        edgeCountMax = edgeCount
        maxEdgesDepht = i
      }
    }
    return [maxNodeCount, maxEdgesDepht]
  }
}
