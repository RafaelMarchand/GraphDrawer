import Node from "./Node";

export default class NodeLayout<A> {
    edgeType: "inEdges" | "edges";
    nodeType: "srcNode" | "destNode";
    nodes: Node<A>[];
    padding: number;

    constructor(padding: number, edgeType: "inEdges" | "edges") {
        this.edgeType = edgeType;
        this.nodeType = edgeType === "inEdges" ? "srcNode" : "destNode";
        this.padding = padding;
        this.nodes = [];
    }

    public feedNodes(nodes: Node<A>[], drawer: any, graph: any) {
        drawer.draw(graph);
        this.instertInOrder(nodes);
        this.movingNodes(nodes, drawer, graph);
    }

    private instertInOrder(nodes: Node<A>[]): void {
        nodes.forEach((node) => {
            let left = 0;
            let right = this.nodes.length;

            while (left < right) {
                const mid = Math.floor((left + right) / 2);
                if (this.nodes[mid].orderNr < node.orderNr) {
                    left = mid + 1;
                } else {
                    right = mid;
                }
            }

            this.nodes.splice(left, 0, node);
        });
    }

    private movingNodes(nodes: Node<A>[], draw: any, graph: any) {
        debugger;
        nodes.forEach((node) => {
            node.optimalPosY = Math.round(node[this.edgeType].reduce((acc, edge) => edge[this.nodeType].posY + acc, 0) / node[this.edgeType].length);
        });

        let nodeMoved = true;
        while (nodeMoved) {
            nodeMoved = false;
            nodes.forEach((node) => {
                switch (this.getMovingDirection(node)) {
                    case "up":
                        nodeMoved = this.moveNodeUp(node);
                        break;
                    case "down":
                        nodeMoved = this.moveNodeDown(node);
                        break;
                    case "static":
                        break;
                }
            });
            draw.draw(graph);
            debugger;
        }
    }

    private moveNodeUp(node: Node<A>) {
        const neigbour = this.getNeighbourUp(node);
        if (neigbour) {
            if (neigbour.posY + this.padding === node.posY - this.padding) {
                return false;
            }
            // check if neibour is blocking optimal position
            const yPosNeigbour = neigbour.priority === node.priority ? neigbour.optimalPosY : neigbour.posY;
            if (yPosNeigbour + this.padding < node.optimalPosY - this.padding) {
                node.posY = node.optimalPosY;
                return true;
            }
            // optimal position is blocked by neigbour
            switch (this.getMovingDirection(neigbour)) {
                case "up":
                    node.posY = neigbour.posY + 2 * this.padding;
                    break;
                case "down":
                    const movingDist = Math.abs(node.optimalPosY - node.posY);
                    const movingDistNeigbour = Math.abs(neigbour.optimalPosY - neigbour.posY);
                    const distanceBetween = node.posY - neigbour.posY - this.padding * 2;

                    const distanceFraction = distanceBetween / (movingDist + movingDistNeigbour);
                    node.posY -= distanceFraction * movingDist;
                    neigbour.posY += distanceFraction * movingDistNeigbour;
                    break;
                case "static":
                    node.posY = neigbour.posY + 2 * this.padding;
                    break;
            }
        } else {
            node.posY = node.optimalPosY;
        }
        debugger;
        return true;
    }

    private moveNodeDown(node: Node<A>) {
        const neigbour = this.getNeighbourDown(node);
        if (neigbour) {
            if (neigbour.posY - this.padding === node.posY + this.padding) {
                return false;
            }
            // check if neibour is blocking optimal position
            const yPosNeigbour = neigbour.priority === node.priority ? neigbour.optimalPosY : neigbour.posY;
            if (yPosNeigbour - this.padding > node.optimalPosY + this.padding) {
                node.posY = node.optimalPosY;
                return true;
            }
            // optimal position is blocked by neigbour
            switch (this.getMovingDirection(neigbour)) {
                case "up":
                    debugger;
                    const movingDist = Math.abs(node.optimalPosY - node.posY);
                    const movingDistNeigbour = Math.abs(neigbour.optimalPosY - neigbour.posY);
                    const distanceBetween = neigbour.posY - node.posY - this.padding * 2;

                    const distanceFraction = distanceBetween / (movingDist + movingDistNeigbour);
                    node.posY += distanceFraction * movingDist;
                    neigbour.posY -= distanceFraction * movingDistNeigbour;
                    break;
                case "down":
                    node.posY = neigbour.posY - 2 * this.padding;
                    break;
                case "static":
                    node.posY = neigbour.posY - 2 * this.padding;
                    break;
            }
        } else {
            node.posY = node.optimalPosY;
        }
        debugger;
        return true;
    }

    private getMovingDirection(node: Node<A>) {
        if (node.optimalPosY < node.posY) {
            return "up";
        } else if (node.optimalPosY > node.posY) {
            return "down";
        }
        return "static";
    }

    private getNeighbourUp(nodeToMove: Node<A>): Node<A> | undefined {
        let neighbourUp: Node<A> | undefined = undefined;
        this.nodes.forEach((node) => {
            if (node.orderNr < nodeToMove.orderNr) {
                if (!neighbourUp || node.orderNr > neighbourUp.orderNr) {
                    neighbourUp = node;
                }
            }
        });
        return neighbourUp;
    }

    private getNeighbourDown(nodeToMove: Node<A>): Node<A> | undefined {
        let neighbourDown: Node<A> | undefined = undefined;
        this.nodes.forEach((node) => {
            if (node.orderNr > nodeToMove.orderNr) {
                if (!neighbourDown || node.orderNr < neighbourDown.orderNr) {
                    neighbourDown = node;
                }
            }
        });
        return neighbourDown;
    }
}
