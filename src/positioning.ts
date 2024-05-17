import { usolve } from "mathjs"
import Graph from "./Graph/Graph"
import Node from "./Graph/Node"
import { Config } from "./main"

const Y_SCALING = 1.6

type Edge<A> = { srcNode: Node<A>; destNode: Node<A> }

type Edge1<A> = { srcNode: Spot<A>; destNode: Spot<A> }

type Spot<A> = {
  posY: number
  node: Node<A>
  optimalPosY: number
}

export type Arrangement<A> = {
  spots: Spot<A>[]
  intersections: number
}

// prettier-ignore
export function setPositions<G, A>(graph: Graph<G, A>, config: Config<A>) {
  console.log(graph)
  setPositionX()
  setPositionY()

  function setPositionX() {
    const distanceBetweenNodes = (config.width - 2 * config.paddingGraph) / graph.depth

    for (let i = 0; i <= graph.depth; i++) {
      graph.getNodesAtDepth(i).forEach((node) => {
        node.posX = config.paddingGraph + i * distanceBetweenNodes
      })
    }
  }

  function setPositionY() {
    let arrangements: Arrangement<A>[] = []
    for (let i = 0; i <= graph.depth; i++) {
      arrangements = getArrangements(i, arrangements)
      //console.log(arrangements)
    }
    //arrangements?.forEach(arrangment => {
      // setArrangementPositions(arrangment)
      // draw(graph, canvas, config)
      // console.log(arrangment)
      // debugger
    //})
    const sorted = arrangements.sort((a, b) => {
      return a.intersections - b.intersections
    })
    console.log(sorted)
    setArrangementPositions(sorted[13])
  }

  function setArrangementPositions(arrangement: Arrangement<A>) {
    arrangement.spots.forEach((spot) => {
      spot.node.posY = spot.posY
    })
  }
  

  // prettier-ignore
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
          intersections: 0
        }
      })
    }

    let arrangements: Arrangement<A>[] = []

    for (const arrangement of prevArrangements) {
      const prevNodes = arrangement.spots.filter(spot => spot.node.depth === (depth - 1)).map(spot => spot.node)
      spreadAllongY(prevNodes, config.heigth)

      const orders = nodeOrders(graph.getNodesAtDepth(depth), config.heigth, arrangement)
      const ordersSpos = spotOrders(graph.getNodesAtDepth(depth), config.heigth, arrangement)

      // console.log(orders)
      // console.log(ordersSpos)

      // ordersSpos.forEach((order) => {
      //   spreadAllongY(order.map(spot => spot.node), config.heigth)
      //   order.forEach((spot, index) => {
      //     spot.posY = positions[index]
      //   })
      //   console.log(order)
      //   arrangements.push(
      //     {
      //       spots: [...arrangement.spots, ...order ],
      //       intersections: arrangement.intersections + intersectionCountOutEdges(prevNodes)
      //     }
      //   )
      // })


      orders.forEach(order => {
        spreadAllongY(order, config.heigth)
        
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
            intersections: arrangement.intersections + intersectionCountOutEdges(prevNodes)
          }
        )
      })
     }
    return arrangements
  }

  function getPositionsY(spots: number) {
    if (spots === 1) {
      return [config.heigth / 2]
    }
    const spotsArr = []
    const padding = config.heigth / (spots * Y_SCALING)
    const nodeGap = (config.heigth - padding * 2) / (spots - 1)
    let posAct = padding
    for (let i = 0; i < spots; i++) {
      spotsArr.push(posAct + i * nodeGap)
    }
    return spotsArr
  }

}

function intersectionCountOutEdges<A>(nodes: Node<A>[]) {
  let count = 0
  const edges = getEdges(nodes)
  const edgesToCompare = [...edges]

  // comare all edges with each other to check for intersection
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


function getEdges<A>(nodes: Node<A>[]) {
  const edges: Edge<A>[] = []
  nodes.forEach((node) => {
    node.edges.forEach((destNode) => {
      edges.push({ srcNode: node, destNode: destNode })
    })
  })
  return edges
}

function optimalPositionYSpots<A>(srcSpots: Spot<A>[], canvasHeigth: number) {
  let minimalDistance = Infinity
  let optimalPosition = 0
  for (let y = 0; y < canvasHeigth; y++) {
    const distance = srcSpots.reduce((distance, srcSpot) => {
      return Math.floor(distance + Math.pow(srcSpot.posY - y, 2))
    }, 0)
    if (distance < minimalDistance) {
      minimalDistance = distance
      optimalPosition = y
    }
  }
  return optimalPosition
}

function optimalPositionY<A>(srcNodes: Node<A>[], canvasHeigth: number) {
  let minimalDistance = Infinity
  let optimalPosition = 0
  for (let y = 0; y < canvasHeigth; y++) {
    const distance = srcNodes.reduce((distance, srcNode) => {
      return Math.floor(distance + Math.pow(srcNode.posY - y, 2))
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
    node.optimalPosY = optimalPositionY(node.inEdges, canvasHeight)
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
 * Groups spots by their optimal y position. Groups will be sorted ascending.
 */
export function groupSpots<A>(nodes: Node<A>[], canvasHeight: number, arrangement: Arrangement<A>) {
  const spots: Spot<A>[] = []

  nodes.forEach(node => {
    const srcSpots = arrangement.spots.filter(spot => {
      return spot.node.edges.map(node => node.key).includes(node.key) 
    })
    spots.push({
        node: node,
        posY: 0,
        optimalPosY: optimalPositionYSpots(srcSpots, canvasHeight)
      })
  })

  spots.sort((spotA, spotB) => spotA.optimalPosY - spotB.optimalPosY)

  const groups: Spot<A>[][] = []
  const currentGroup:  Spot<A>[] = []
  let prevSpot: null |  Spot<A>

  spots.forEach((spot) => {
    if (!prevSpot) {
      currentGroup.push(spot)
    }
    if (prevSpot && prevSpot.optimalPosY === spot.optimalPosY) {
      currentGroup.push(spot)
    }
    if (prevSpot && prevSpot.optimalPosY !== spot.optimalPosY) {
      groups.push([...currentGroup])
      currentGroup.length = 0
      currentGroup.push(spot)
    }
    prevSpot = spot
  })

  groups.push(currentGroup)
  return groups
}

/**
 * Computes all possible node orders (top to bottom) for nodes of a certain depth
 * based on their optimal position which depends on the source nodes of each node
 */
export function nodeOrders<A>(nodes: Node<A>[], canvasHeight: number, arrangement: Arrangement<A>) {
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

export function spotOrders<A>(nodes: Node<A>[], canvasHeight: number, arrangement: Arrangement<A>) {
  const groups = groupSpots(nodes, canvasHeight, arrangement)

  return groups.reduce((accumulator: Spot<A>[][], group) => {
    if (accumulator.length === 0) {
      return permutator(group)
    }
    const newOrders: Spot<A>[][] = []
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
      return 1
    } else {
      return false
    }
  } catch (error) {
    return true
  }
}

function checkIntersection1<A>(edgeA: Edge1<A>, edgeB: Edge1<A>) {
  let [a1, b1] = linearCoefficient(edgeA.srcNode.node, edgeA.destNode.node)
  let [a2, b2] = linearCoefficient(edgeB.srcNode.node, edgeB.destNode.node)
  try {
    const [[intersectionX]]: any = usolve([[a2 - a1]], [b1 - b2])
    if (intersectionX > edgeA.srcNode.node.posX + 1 && intersectionX < edgeB.destNode.node.posX - 1) {
      return 1
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
