import Node from "./Node"

export default class Variation<A> {
  generator: Generator<number[]>
  permutations: number[][]
  currentPermu: number[]
  nodes: Node<A>[]
  loopIndex: number

  constructor(nodes: Node<A>[], positions: number[]) {
    this.nodes = nodes
    this.generator = generator(positions)
    this.permutations = []
    this.currentPermu = []
    this.loopIndex = 0
  }

  setPermutation() {
    let generatorIsEmpty = false
    const permu: number[] | undefined = this.generator.next().value
    if (permu) {
      this.permutations.push(permu)
      for (let i = 0; i <= this.nodes.length; i++) {
        this.nodes[i].posY = permu[i]
      }
    }
    if (!permu) {
      for (let i = 0; i <= this.nodes.length; i++) {
        this.nodes[i].posY = this.permutations[this.loopIndex][i]
      }
      this.loopIndex = this.loopIndex++ % this.permutations.length
    }
    if (!permu && this.loopIndex === 0) {
      generatorIsEmpty = true
    }
    return generatorIsEmpty
  }
}

export function* generator<T>(inputArr: T[]): Generator<T[], void, unknown> {
  function* permute(arr: T[], memo: T[] = []): Generator<T[]> {
    let cur: T[]
    for (let i = 0; i < arr.length; i++) {
      cur = arr.splice(i, 1)
      if (arr.length === 0) {
        yield memo.concat(cur)
      }
      yield* permute(arr.slice(), memo.concat(cur))
      arr.splice(i, 0, cur[0])
    }
  }
  yield* permute(inputArr)
}
