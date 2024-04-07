import Node from "./Graph/Node"
import Graph from "./Graph/Graph"
import { Config } from "./main"

const Y_SCALING = 1.6

export default class GraphArrangement<A> {
  arrangements: Arrangement<A>[]
  config: Config<A>

  constructor(config: Config<A>) {
    this.config = config
    this.arrangements = []
  }

  arange(nodes: Node<A>[]) {
    if (this.arrangements.length === 0) {
      this.arrangements = this.variableNodes(nodes)
      return
    }
    this.arrangements.forEach(arrangement => {
      arrangement.addLayer(nodes)
    })
  }

  variableNodes(nodes: Node<A>[]) {
    const positions = this.getPositionsY(nodes.length)
    return permutator(nodes).map((permu) => {
      const spots = permu.map((node, index): Spot<A> => {
        return {
          posY: positions[index],
          node: node
        }
      })
      return new Arrangement(spots)
    })
  }

  getPositionsY(spots: number) {
    if (spots === 1) {
      return [this.config.heigth / 2]
    }
    const spotsArr = []
    const padding = this.config.heigth / (spots * Y_SCALING)
    const nodeGap = (this.config.heigth - padding * 2) / (spots - 1)
    let posAct = padding
    for (let i = 0; i < spots; i++) {
      spotsArr.push(posAct + i * nodeGap)
    }
    return spotsArr
  }
}

type Spot<A> = {
  posY: number
  node: Node<A>
}

class Arrangement<A> {
  spots: Spot<A>[][]
  value: number
  constructor(spots: Spot<A>[]) {
    this.spots = [spots]
    this.value = 0
  }
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
