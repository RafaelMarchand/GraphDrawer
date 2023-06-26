export default class CanvasNode {
    constructor(name, edges, value = null, focus = null) {
        this.name = name
        this.posX = 0
        this.posY = 0
        this.depth = null
        this.distances = new Map()
        this.edges = edges
        this.value = value
        this.focus = focus
    }

    getOptimalPos(){
        let minDistance = null
        let y = 0
        this.distances.forEach((value, key)=> {
            if (minDistance == null || minDistance > value) {
                minDistance = value
                y = key
            }
        })
        return y
    }

    hasEdges() {
        if (this.edges.length !== null) {
            return true
        }
        return false
    }

    setPosX(pos) {
        this.posX = Math.floor(pos)
    }

    setPosY(pos) {
        this.posY = Math.floor(pos)
    }

    setDepth(depth){
        if (this.depth === null || this.depth < depth){
            this.depth = depth
        }
    }
}