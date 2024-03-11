import { usolve } from "mathjs"

export default function count(nodes) {
  let intersections = 0
  nodes.forEach((node, currentIndex) => {
    node.edges.forEach((edge) => {
      getEdgesToCompare(nodes, currentIndex).forEach((edgeToCompare) => {
        intersections += checkIntersection(edge, edgeToCompare)
      })
    })
  })
  return intersections / 2
}

function checkIntersection(edge1, edge2) {
  let [a1, b1] = linFuncConstants(edge1)
  let [a2, b2] = linFuncConstants(edge2)
  try {
    let [[intersectionX]] = usolve([[a2 - a1]], [b1 - b2])
    if (intersectionX > edge1.srcNode.posX + 1 && intersectionX < edge1.destNode.posX - 1) {
      return 1
    } else {
      return 0
    }
  } catch (error) {
    return 0
  }
}

function getEdgesToCompare(permu, currentIndex) {
  let edgesToCheckIntersection = []
  permu
    .filter((_node, index) => currentIndex !== index) // Array with all other nodes
    .forEach((node) => {
      node.edges.forEach((edge) => {
        edgesToCheckIntersection.push(edge)
      })
    })
  return edgesToCheckIntersection
}

function linFuncConstants(edge) {
  let x1 = edge.srcNode.posX
  let x2 = edge.destNode.posX
  let y1 = edge.srcNode.posY
  let y2 = edge.destNode.posY

  let a = (y2 - y1) / (x2 - x1)
  let b = y1 - x1 * a
  return [a, b]
}
