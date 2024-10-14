import { usolve } from "mathjs"
import Graph from "./Graph/Graph"
import Node from "./Graph/Node"
import { ConfigIntern } from "./main"
import { draw } from "./draw"
import Position from "./Vec.js"
import Edge from "./Graph/Edge"

const Y_SCALING = 1.6

export type Spot<A> = {
  posY: number
  node: Node<A>
  optimalPosY: number
}

export type Arrangement<A> = {
  spots: Spot<A>[]
  intersections: number
  totalLengthEdges: number
}

// prettier-ignore
export function setPositions<A>(graph: Graph<A>, config: ConfigIntern<A>, canvas: HTMLCanvasElement) {
  setPositionX()
  setPositionY()
  setBezierCurvePoints()

  function setPositionX() {
    const positions = getPositionsX(config,graph)

    for (let i = 0; i <= graph.getDepth(); i++) {
      graph.getNodesAtDepth(i).forEach((node) => {
        node.setPosX(positions[i]) 
      })
    }
  }

  function setBezierCurvePoints(){
    const CONTROLPOINT = 0.7

    graph.nodes.forEach(node => {
      node.edges.forEach(edge => {
        let edgeWidth = edge.destNode.posX - node.posX
        let cp1 = new Position(Math.floor(edgeWidth * CONTROLPOINT + node.posX), node.posY)
        let cp2 = new Position(Math.floor(edge.destNode.posX - edgeWidth * CONTROLPOINT), edge.destNode.posY)

        edge.bezierPoints = {cp1, cp2 }
      })
    })
  }

  function setPositionY() {
    let arrangements: Arrangement<A>[] = []
    for (let i = 0; i <= graph.getDepth(); i++) {
      arrangements = getArrangements(i, arrangements)
    }
    const sorted = arrangements.sort((a, b) => {
      const intersectionDiff = a.intersections - b.intersections
      if (intersectionDiff === 0) {
        return a.totalLengthEdges - b.totalLengthEdges
      }
      return a.intersections - b.intersections
    })
    arrangements?.forEach(arrangment => {
      //setArrangementPositions(arrangment)
      // draw each arrangement for debugin purposes
      //draw(graph, canvas, config)
    })
    setArrangementPositions(sorted[0])
  }

  function setArrangementPositions(arrangement: Arrangement<A>) {
    arrangement.spots.forEach((spot) => {
      spot.node.posY = spot.posY
    })
  }

  function getArrangements(depth: number, prevArrangements: Arrangement<A>[]){
    const nodes = graph.getNodesAtDepth(depth)
    const positions = getPositionsY(nodes.length)

    if (depth === 0) {
      return permutator(nodes).map((permu): Arrangement<A> => {
        return {
          spots: permu.map((node, index): Spot<A> => {
            return {
              posY: positions[index],
              node: node,
              optimalPosY: 0
            }
          }),
          intersections: 0,
          totalLengthEdges: 0
        }
      })
    }

    let arrangements: Arrangement<A>[] = []

    for (const arrangement of prevArrangements) {
      const prevNodes = arrangement.spots.filter(spot => spot.node.depth === (depth - 1)).map(spot => spot.node)
      spreadAllongY(prevNodes, config.height)

      const orders = nodeOrders(graph.getNodesAtDepth(depth), config.height)

      orders.forEach(order => {
        spreadAllongY(order, config.height)
        
        const spots: Spot<A>[] = order.map((node, index) => {
          return {
            posY: positions[index],
            node: node,
            optimalPosY: 0
          }
        })
        arrangements.push(
          {
            spots: [...arrangement.spots, ...spots ],
            intersections: arrangement.intersections + intersectionCountOutEdges(prevNodes),
            totalLengthEdges: arrangement.totalLengthEdges +  edgeLength(prevNodes)
          }
        )
      })
     }
    return arrangements
  }

  function getPositionsY(spots: number) {
    if (spots === 1) {
      return [config.height / 2]
    }
    const spotsArr = []
    const padding = config.height / (spots * Y_SCALING)
    const nodeGap = (config.height - padding * 2) / (spots - 1)
    let posAct = padding
    for (let i = 0; i < spots; i++) {
      spotsArr.push(posAct + i * nodeGap)
    }
    return spotsArr
  }
}

export function getPositionsX<A>(config: ConfigIntern<A>, graph: Graph<A>) {
  const distanceBetweenNodes = (config.width - 2 * config.paddingGraph) / graph.getDepth()
  const positions = []

  for (let i = 0; i <= graph.getDepth(); i++) {
    positions.push(config.paddingGraph + i * distanceBetweenNodes)
  }
  return positions
}

function edgeLength<A>(nodes: Node<A>[]) {
  let length = 0
  nodes.forEach((node) => {
    node.edges.forEach((edge) => {
      length += Math.abs(node.posY - edge.destNode.posY)
    })
  })
  return length
}

function intersectionCountOutEdges<A>(nodes: Node<A>[]) {
  let count = 0
  let edges: Edge<A>[] = []

  nodes.forEach((node) => {
    edges = [...edges, ...node.edges]
  })
  const edgesToCompare = [...edges]

  // compare all edges with each other to check for intersection
  for (let i = edges.length - 1; i >= 0; i--) {
    for (let j = edgesToCompare.length - 1; j >= 0; j--) {
      if (i !== j) {
        if (checkIntersection(edges[i], edgesToCompare[j])) {
          count++
        }
      }
    }
    edgesToCompare.pop()
  }
  return count
}

function optimalPositionY<A>(edges: Edge<A>[], canvasHeigth: number) {
  let minimalDistance = Infinity
  let optimalPosition = 0
  for (let y = 0; y < canvasHeigth; y++) {
    const distance = edges.reduce((distance, edge) => {
      return Math.floor(distance + Math.pow(edge.srcNode.posY - y, 2))
    }, 0)
    if (distance < minimalDistance) {
      minimalDistance = distance
      optimalPosition = y
    }
  }
  return optimalPosition
}

export function spreadAllongY<A>(nodes: Node<A>[], canvasHeight: number) {
  if (nodes.length === 1) {
    nodes[0].posY = canvasHeight / 2
    return
  }
  const padding = canvasHeight / (nodes.length * Y_SCALING)
  const nodeGap = (canvasHeight - padding * 2) / (nodes.length - 1)
  let posAct = padding
  nodes.forEach((node, index) => {
    node.setPosY(posAct + index * nodeGap)
  })
}

/**
 * Groups nodes by their optimal y position. Groups will be sorted ascending.
 */
export function groupNodes<A>(nodes: Node<A>[], canvasHeight: number) {
  nodes.forEach((node) => {
    node.optimalPosY = optimalPositionY(node.edges, canvasHeight)
  })
  nodes.sort((nodeA, nodeB) => nodeA.optimalPosY - nodeB.optimalPosY)

  const groups: Node<A>[][] = []
  const currentGroup: Node<A>[] = []
  let prevNode: null | Node<A>

  nodes.forEach((node) => {
    if (!prevNode) {
      currentGroup.push(node)
    }
    if (prevNode && prevNode.optimalPosY === node.optimalPosY) {
      currentGroup.push(node)
    }
    if (prevNode && prevNode.optimalPosY !== node.optimalPosY) {
      groups.push([...currentGroup])
      currentGroup.length = 0
      currentGroup.push(node)
    }
    prevNode = node
  })

  groups.push(currentGroup)
  return groups
}

/**
 * Computes all possible node orders (top to bottom) for nodes of a certain depth
 * based on their optimal position which depends on the source nodes of each node
 */
export function nodeOrders<A>(nodes: Node<A>[], canvasHeight: number) {
  const groups = groupNodes(nodes, canvasHeight)

  return groups.reduce((accumulator: Node<A>[][], group) => {
    if (accumulator.length === 0) {
      return permutator(group)
    }
    const newOrders: Node<A>[][] = []
    accumulator.forEach((order) => {
      permutator(group).forEach((permu) => {
        newOrders.push([...order, ...permu])
      })
    })
    return newOrders
  }, [])
}

function checkIntersection<A>(edgeA: Edge<A>, edgeB: Edge<A>) {
  let [a1, b1] = linearCoefficient(edgeA.srcNode, edgeA.destNode)
  let [a2, b2] = linearCoefficient(edgeB.srcNode, edgeB.destNode)
  try {
    const [[intersectionX]]: any = usolve([[a2 - a1]], [b1 - b2])
    if (intersectionX > edgeA.srcNode.posX + 1 && intersectionX < edgeB.destNode.posX - 1) {
      return true
    } else {
      return false
    }
  } catch (error) {
    return true
  }
}

function linearCoefficient<A>(srcNode: Node<A>, destNode: Node<A>) {
  let x1 = srcNode.posX
  let x2 = destNode.posX
  let y1 = srcNode.posY
  let y2 = destNode.posY

  let a = (y2 - y1) / (x2 - x1)
  let b = y1 - x1 * a
  return [a, b]
}

function permutator<T>(inputArr: T[]) {
  let results: T[][] = []

  function permute(arr: T[], memo: T[] | undefined = undefined) {
    let cur: T[]
    memo = memo || []
    for (let i = 0; i < arr.length; i++) {
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
