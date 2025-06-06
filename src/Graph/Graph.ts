import Edge, { State } from "./Edge";
import Node, { DummyValues } from "./Node";
import Position from "../Vec.js";

export default class Graph<A> {
    nodes: Map<string, Node<A>>;
    rootNodeKeys: string[];
    isDepthSet: Boolean;

    constructor() {
        this.nodes = new Map();
        this.rootNodeKeys = [];
        this.isDepthSet = false;
    }

    addNode(key: string, attributes?: A, dummyValues?: DummyValues<A>) {
        const node = new Node(key, attributes, dummyValues);
        this.nodes.set(key, node);
        return node;
    }

    addEdge(srcNodeKey: string, destNodeKey: string, sharedState?: State) {
        const srcNode = this.nodes.get(srcNodeKey);
        const destNode = this.nodes.get(destNodeKey);

        if (srcNode && destNode) {
            const edge = new Edge(srcNode, destNode, sharedState);
            srcNode.edges.push(edge);
            destNode.inEdges.push(edge);
        } else {
            console.error("Can not add edge, source or destination Node doesnt exist");
        }
    }

    initialize(rootNodeKeys: string[]) {
        this.rootNodeKeys = rootNodeKeys;
        this.setDepthNodes();
        this.createDummyNodes();
    }

    createDummyNodes() {
        this.nodes.forEach((node) => {
            node.edges.forEach(({ destNode }) => {
                const edgeLength = destNode.depth - node.depth;
                const dummyNodes: Node<A>[] = [];
                const sharedEdgeState = { clicked: false, mouseOver: false };
                const dummyValues: DummyValues<A> = {
                    srcNodeKey: node.key,
                    srcNodeAttributes: node.attributes,
                    destNodeKey: destNode.key,
                    destNodeAttributes: destNode.attributes
                };

                for (let i = 1; i < edgeLength; i++) {
                    dummyNodes.push(this.addNode(`src_${node.key}_dest${destNode.key}_nr${i}`, undefined, dummyValues));
                }

                dummyNodes.forEach((dummy, index) => {
                    if (index === 0) {
                        this.addEdge(node.key, dummy.key, sharedEdgeState);
                    }
                    if (index === dummyNodes.length - 1) {
                        this.addEdge(dummy.key, destNode.key, sharedEdgeState);
                    } else {
                        this.addEdge(dummy.key, dummyNodes[index + 1].key, sharedEdgeState);
                    }
                    dummy.depth = node.depth + index + 1;
                });
                if (dummyNodes.length > 0) this.removeEdge(node, destNode);
            });
        });
    }

    removeEdge(srcNode: Node<A>, destNode: Node<A>) {
        srcNode.edges = srcNode.edges.filter((edge) => edge.destNode.key !== destNode.key);
        destNode.inEdges = destNode.inEdges.filter((edge) => edge.srcNode.key !== srcNode.key);
    }

    getDepth() {
        if (!this.isDepthSet) {
            this.setDepthNodes();
        }
        let depth = 0;
        this.nodes.forEach((node) => {
            if (node.depth > depth) {
                depth = node.depth;
            }
        });
        return depth;
    }

    equalValues(graph: Graph<A>) {
        if (this.nodes.size !== graph.nodes.size) return false;

        for (const [key, node] of this.nodes) {
            const compareNode = graph.nodes.get(key);
            if (compareNode && !node.equalValues(compareNode)) {
                return false;
            }
        }
        return true;
    }

    equalStructure(graph: Graph<A>) {
        if (this.rootNodeKeys.length !== graph.rootNodeKeys.length) return false;

        for (const rootNodeKey of this.rootNodeKeys) {
            if (!graph.rootNodeKeys.includes(rootNodeKey)) {
                return false;
            }
        }

        if (this.nodes.size !== graph.nodes.size) return false;

        for (const [key, node] of this.nodes) {
            const compareNode = graph.nodes.get(key);
            if (compareNode && !node.equalStructure(compareNode)) {
                return false;
            }
        }
        return true;
    }

    getNodesAtDepth(depth: number) {
        if (!this.isDepthSet) {
            this.setDepthNodes();
        }
        const nodes: Node<A>[] = [];
        this.nodes.forEach((node) => {
            if (node.depth === depth) nodes.push(node);
        });
        return nodes;
    }

    setDepthNodes() {
        function setDepthNode(node: Node<A>, depth: number) {
            const nextDepth = depth + 1;
            if (node.depth < depth) {
                node.depth = depth;
            }
            node.edges.forEach(({ destNode }) => {
                setDepthNode(destNode, nextDepth);
            });
        }

        const STARTING_DEPTH = 0;
        const rootNodes: Node<A>[] = [];

        this.nodes.forEach((node: Node<A>) => {
            if (this.rootNodeKeys.includes(node.key)) {
                rootNodes.push(node);
            }
        });

        rootNodes.forEach((node) => {
            setDepthNode(node, STARTING_DEPTH);
        });
        this.isDepthSet = true;
    }

    getWidth() {
        let maxWidth = 0;
        for (let i = 0; i <= this.getDepth(); i++) {
            const length = this.getNodesAtDepth(i).length;
            if (length > maxWidth) {
                maxWidth = length;
            }
        }
        return maxWidth;
    }

    static clone<A>(graph: Graph<A>) {
        const newGraph = new Graph<A>();
        graph.nodes.forEach((node) => {
            const newNode = newGraph.addNode(node.key);
            newNode.position = new Position(node.posX, node.posY);
            newNode.depth = node.depth;
            newNode.orderNr = node.orderNr;
        });
        graph.nodes.forEach((node) => {
            node.edges.forEach((edge) => {
                newGraph.addEdge(edge.srcNode.key, edge.destNode.key);
            });
        });
        return newGraph;
    }
}
