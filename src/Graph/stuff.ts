nextArrangement(intersections: Edge<A>[][]) {
    intersections.forEach(([edgeA, edgeB]) => {
      const affectedVariationA = this.variations.find((variation) => {
        variation.nodes.find((node) => node.key === edgeA.srcNode.key)
      })
      const affectedVariationB = this.variations.find((variation) => {
        variation.nodes.find((node) => node.key === edgeB.srcNode.key)
      })

      while (true) {
        // found arrangment that satisfies max intersections
        if (intersections.length <= this.config.maxIntersections) {
          return { status: ArrangementStatus.found, variation: null }
        }

        // only one Variation is affected
        if (affectedVariationA === affectedVariationB) {
          const generatorIsEmpty = affectedVariationA?.setPermutation()
          if (generatorIsEmpty) {
            return { status: ArrangementStatus.empty, variation: affectedVariationA }
          }
          this.checkIntersection(edgeA, edgeB)
        }
        if (affectedVariationA !== affectedVariationB) {
          const generatorIsEmpty = affectedVariationA?.setPermutation()
          if (generatorIsEmpty) {
            return { status: ArrangementStatus.empty, variation: affectedVariationA }
          }
          this.checkIntersection(edgeA, edgeB)
        }
      }
    })

    this.variations[this.currentVariation]

    this.currentVariation
  }