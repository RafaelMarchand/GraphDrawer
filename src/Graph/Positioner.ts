import { ConfigIntern } from "../main";
import Drawer from "./Drawer";
import Graph from "./Graph";
import Node from "./Node";
import Edge from "./Edge";
import { forEach, usolve } from "mathjs";
import NodeLayout from "./NodeLayout";

export default class Positioner<A> {
    config: ConfigIntern<A>;
    drawer: Drawer<A>;

    constructor(config: ConfigIntern<A>, drawer: Drawer<A>) {
        this.config = config;
        this.drawer = drawer; // for debugging
    }

    public setPositions(inputGraph: Graph<A>) {
        const orderedGraph = this.ordering(inputGraph);
        this.setPositionX(orderedGraph);
        this.setPositionY_1(orderedGraph);

        inputGraph.nodes.forEach((node, key) => {
            node.position = orderedGraph.nodes.get(key)!.position;
        });
    }

    private setCoordinates(graph: Graph<A>) {
        this.setPositionX(graph);
        this.setPositionY(graph);
    }

    private getPositionsY(nodeCount: number) {
        const Y_SCALING = 1.6;
        if (nodeCount === 1) {
            return [this.config.height / 2];
        }
        const positions = [];
        const padding = this.config.height / (nodeCount * Y_SCALING);
        const nodeGap = (this.config.height - padding * 2) / (nodeCount - 1);
        let posAct = padding;
        for (let i = 0; i < nodeCount; i++) {
            positions.push(posAct + i * nodeGap);
        }
        return positions;
    }

    private setPositionY(graph: Graph<A>) {
        for (let i = 0; i <= graph.getDepth(); i++) {
            const nodes = graph.getNodesAtDepth(i);
            nodes.sort((a, b) => a.orderNr - b.orderNr);
            const positions = this.getPositionsY(nodes.length);
            nodes.forEach((node, index) => {
                node.posY = positions[index];
            });
        }
    }

    private setPositionY_1(graph: Graph<A>) {
        const nodes = graph.getNodesAtDepth(0);
        nodes.sort((a, b) => a.orderNr - b.orderNr);
        nodes.forEach((node, index) => {
            node.posY = this.getPositionsY(nodes.length)[index];
            node.orderNr = index;
        });

        for (let i = 1; i <= graph.getDepth(); i++) {
            console.log("dept", i);
            const nodes = graph.getNodesAtDepth(i);
            nodes.sort((a, b) => a.orderNr - b.orderNr);
            nodes.forEach((node, index) => {
                node.posY = this.getPositionsY(nodes.length)[index];
                node.orderNr = index;
            });
            this.setPositionYOfLayer(nodes, "inEdges", graph);
        }
        for (let i = graph.getDepth() - 1; i >= 0; i--) {
            console.log("dept", i);
            const nodes = graph.getNodesAtDepth(i);
            this.setPositionYOfLayer(nodes, "edges", graph);
        }
        for (let i = 1; i <= graph.getDepth(); i++) {
            console.log("dept", i);
            const nodes = graph.getNodesAtDepth(i);
            this.setPositionYOfLayer(nodes, "inEdges", graph);
        }
    }

    private setPositionYOfLayer(nodes: Node<A>[], edgeType: "inEdges" | "edges", graph: Graph<A>) {
        type PriorityGroup = {
            [key: number]: Node<A>[];
        };
        const DUMMY_PRIORITY = 1000000;
        const MIN_NODE_PADDING = 20;
        const priorityGroups: PriorityGroup = {};

        nodes.forEach((node) => {
            let priority = DUMMY_PRIORITY;
            if (!node.dummy) {
                priority = node[edgeType].length;
            }
            if (priorityGroups[priority]) {
                priorityGroups[priority].push(node);
            } else {
                priorityGroups[priority] = [node];
            }
        });

        const prioritiesOrdered = Object.keys(priorityGroups)
            .map((key) => parseInt(key))
            .sort((a, b) => a - b);

        const nodeLayout = new NodeLayout<A>(MIN_NODE_PADDING, edgeType);

        prioritiesOrdered.forEach((priority) => {
            const group = priorityGroups[priority];
            debugger;
            nodeLayout.feedNodes(group, this.drawer, graph);
        });
    }

    private setPositionX(graph: Graph<A>) {
        const positions = getPositionsX(graph.getDepth(), this.config);

        for (let i = 0; i <= graph.getDepth(); i++) {
            graph.getNodesAtDepth(i).forEach((node) => {
                node.posX = positions[i];
            });
        }
    }

    private ordering(graph: Graph<A>) {
        graph.getNodesAtDepth(0).forEach((node, index) => (node.orderNr = index + 1));
        this.setCoordinates(graph);
        let bestOrder = Graph.clone(graph);

        for (let i = 0; i < 3; i++) {
            if (i % 2 === 0) {
                this.sweepLeftToRight(graph);
            } else {
                this.sweepRightToLeft(graph);
            }
            this.transpose(graph);
            this.setCoordinates(graph);
            if (this.crossings(graph) < this.crossings(bestOrder)) {
                bestOrder = Graph.clone(graph);
            }
        }
        return bestOrder;
    }

    private sweepLeftToRight(graph: Graph<A>) {
        for (let i = 1; i <= graph.getDepth(); i++) {
            const nodes = graph.getNodesAtDepth(i);
            nodes.forEach((node) => {
                node.orderNr = this.median(node.inEdges.map((edge) => edge.srcNode.orderNr));
            });
            nodes
                .sort((a, b) => a.orderNr - b.orderNr)
                .forEach((node, index) => {
                    node.orderNr = index + 1;
                });
        }
    }

    private sweepRightToLeft(graph: Graph<A>) {
        for (let i = graph.getDepth() - 1; i >= 0; i--) {
            const nodes = graph.getNodesAtDepth(i);
            nodes.forEach((node) => {
                node.orderNr = this.median(node.edges.map((edge) => edge.destNode.orderNr));
            });
            nodes
                .sort((a, b) => a.orderNr - b.orderNr)
                .forEach((node, index) => {
                    node.orderNr = index + 1;
                });
        }
    }

    private transpose(graph: Graph<A>) {
        let improved = true;
        while (improved) {
            improved = false;
            for (let i = 0; i <= graph.getDepth(); i++) {
                const nodes = graph.getNodesAtDepth(i);
                for (let j = 0; j < nodes.length - 1; j++) {
                    const v = nodes[j];
                    const w = nodes[j + 1];

                    const crossings = this.crossingAdjacentLayers(i, graph);
                    const vTempOrderNr = v.orderNr;

                    v.orderNr = w.orderNr;
                    w.orderNr = vTempOrderNr;

                    if (this.crossingAdjacentLayers(i, graph) < crossings) {
                        improved = true;
                        nodes.sort((a, b) => a.orderNr - b.orderNr);
                    } else {
                        w.orderNr = v.orderNr;
                        v.orderNr = vTempOrderNr;
                    }
                }
            }
        }
    }

    private median(arr: number[]) {
        arr.sort((a, b) => a - b);

        const mid = Math.floor(arr.length / 2);

        if (arr.length % 2 !== 0) {
            return arr[mid];
        } else {
            return (arr[mid - 1] + arr[mid]) / 2;
        }
    }

    private linearCoefficient<A>(srcNode: Node<A>, destNode: Node<A>) {
        let x1 = srcNode.posX;
        let x2 = destNode.posX;
        let y1 = srcNode.posY;
        let y2 = destNode.posY;

        let a = (y2 - y1) / (x2 - x1);
        let b = y1 - x1 * a;
        return [a, b];
    }

    private checkIntersection(edgeA: Edge<A>, edgeB: Edge<A>) {
        let [a1, b1] = this.linearCoefficient(edgeA.srcNode, edgeA.destNode);
        let [a2, b2] = this.linearCoefficient(edgeB.srcNode, edgeB.destNode);

        if (a1 === a2) {
            // lines are parallel
            return false;
        }
        try {
            const [[intersectionX]]: any = usolve([[a2 - a1]], [b1 - b2]);
            if (intersectionX > edgeA.srcNode.posX + 1 && intersectionX < edgeB.destNode.posX - 1) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    private crossingAdjacentLayers(depth: number, graph: Graph<A>) {
        this.setCoordinates(graph);

        let crossingPreviousLayer = 0;
        if (depth > 0) {
            crossingPreviousLayer = this.crossingsLayer(graph.getNodesAtDepth(depth - 1));
        }
        let crossingLayer = 0;
        if (depth < graph.getDepth()) {
            crossingLayer = this.crossingsLayer(graph.getNodesAtDepth(depth));
        }

        return crossingLayer + crossingPreviousLayer;
    }

    private crossingsLayer(nodes: Node<A>[]) {
        let crossingCount = 0;
        let edges: Edge<A>[] = [];

        nodes.forEach((node) => {
            edges = [...edges, ...node.edges];
        });
        const edgesToCompare = [...edges];
        // compare all edges with each other to check for intersection
        for (let i = edges.length - 1; i >= 0; i--) {
            for (let j = edgesToCompare.length - 1; j >= 0; j--) {
                if (i !== j) {
                    if (this.checkIntersection(edges[i], edgesToCompare[j])) {
                        crossingCount++;
                    }
                }
            }
            edgesToCompare.pop();
        }
        return crossingCount;
    }

    private crossings(graph: Graph<A>) {
        let crossingCount = 0;
        for (let i = 0; i < graph.getDepth(); i++) {
            const nodes = graph.getNodesAtDepth(i);
            crossingCount += this.crossingsLayer(nodes);
        }
        return crossingCount;
    }
}

export function getPositionsX<A>(graphDepth: number, config: ConfigIntern<A>) {
    const distanceBetweenNodes = (config.width - 2 * config.paddingGraph) / graphDepth;
    const positions: number[] = [];

    for (let i = 0; i <= graphDepth; i++) {
        positions.push(config.paddingGraph + i * distanceBetweenNodes);
    }
    return positions;
}
