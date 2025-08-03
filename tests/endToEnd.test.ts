import Graphology from "graphology";
import { expect, test } from "vitest";
import GraphDrawer, { GraphMethods } from "../src/main";
import { graph1, graph2, graph3, graph4 } from "./testGraphs";

type Attributes = {
    value: number;
};

const graphMethods: GraphMethods<Graphology, Attributes> = {
    getNodeKeys: (graph) => graph.mapNodes((key) => key),
    getDestNodeKeys: (graph, nodeKey) => graph.mapOutEdges(nodeKey, (_edge, _attributes, _source, target) => target),
    getNodeAttribute: (graph, nodeKey) => graph.getNodeAttributes(nodeKey) as Attributes
};
const containerG1 = document.createElement('div');

//postion test graph 1
const graphDrawerG1 = new GraphDrawer<Graphology, Attributes>(graphMethods, containerG1,{}) ;
graphDrawerG1.update(graph1, ["1"]);

const graph1TestValues = JSON.parse('[{"key":"1","position":{"x":10,"y":208}},{"key":"2","position":{"x":136,"y":101}},{"key":"3","position":{"x":136,"y":35}},{"key":"4","position":{"x":136,"y":233}},{"key":"5","position":{"x":136,"y":167}},{"key":"7","position":{"x":263,"y":200}},{"key":"8","position":{"x":263,"y":101}},{"key":"9","position":{"x":390,"y":200}},{"key":"10","position":{"x":390,"y":101}},{"key":"src_1_dest7_nr1","position":{"x":136,"y":299}},{"key":"src_1_dest9_nr1","position":{"x":136,"y":365}},{"key":"src_1_dest9_nr2","position":{"x":263,"y":365}},{"key":"src_3_dest9_nr1","position":{"x":263,"y":35}}]');

test("node positions graph 1", () => {
    graph1TestValues.forEach(test => {
        expect(graphDrawerG1.graph.nodes.get(test.key)?.posX).toBe(test.x);
        expect(graphDrawerG1.graph.nodes.get(test.key)?.posY).toBe(test.y);
    })
})
//postion test graph 1
const graphDrawerG2 = new GraphDrawer<Graphology, Attributes>(graphMethods, containerG1,{}) ;
graphDrawerG2.update(graph2, ["1"]);

const graph2TestValues = JSON.parse('[{"key":"0_1","position":{"x":20,"y":200}},{"key":"1_1","position":{"x":110,"y":200}},{"key":"2_1","position":{"x":200,"y":134}},{"key":"2_2","position":{"x":200,"y":200}},{"key":"2_3","position":{"x":200,"y":266}},{"key":"3_1","position":{"x":290,"y":134}},{"key":"3_2","position":{"x":290,"y":200}},{"key":"3_3","position":{"x":290,"y":266}},{"key":"4_1","position":{"x":380,"y":38}},{"key":"4_2","position":{"x":380,"y":104}},{"key":"4_3","position":{"x":380,"y":170}},{"key":"4_4","position":{"x":380,"y":230}},{"key":"4_5","position":{"x":380,"y":296}},{"key":"4_6","position":{"x":380,"y":362}}]')

test("node positions graph 2", () => {
    graph2TestValues.forEach(test => {
        expect(graphDrawerG2.graph.nodes.get(test.key)?.posX).toBe(test.x);
        expect(graphDrawerG2.graph.nodes.get(test.key)?.posY).toBe(test.y);
    })
})

//postion test graph 1
const graphDrawerG3 = new GraphDrawer<Graphology, Attributes>(graphMethods, containerG1,{}) ;
graphDrawerG3.update(graph3, ["1"]);

const graph3TestValues = JSON.parse('[{"key":"0_1","position":{"x":20,"y":200}},{"key":"1_1","position":{"x":110,"y":200}},{"key":"2_1","position":{"x":200,"y":134}},{"key":"2_2","position":{"x":200,"y":200}},{"key":"2_3","position":{"x":200,"y":266}},{"key":"3_1","position":{"x":290,"y":134}},{"key":"3_2","position":{"x":290,"y":200}},{"key":"3_3","position":{"x":290,"y":266}},{"key":"4_1","position":{"x":380,"y":38}},{"key":"4_2","position":{"x":380,"y":104}},{"key":"4_3","position":{"x":380,"y":170}},{"key":"4_4","position":{"x":380,"y":230}},{"key":"4_5","position":{"x":380,"y":296}},{"key":"4_6","position":{"x":380,"y":362}}]');

test("node positions graph 3", () => {
    graph3TestValues.forEach(test => {
        expect(graphDrawerG3.graph.nodes.get(test.key)?.posX).toBe(test.x);
        expect(graphDrawerG3.graph.nodes.get(test.key)?.posY).toBe(test.y);
    })
})

//postion test graph 1
const graphDrawerG4 = new GraphDrawer<Graphology, Attributes>(graphMethods, containerG1,{}) ;
graphDrawerG4.update(graph4, ["1"]);

const graph4TestValues = JSON.parse('[{"key":"0_1","position":{"x":20,"y":200}},{"key":"1_1","position":{"x":110,"y":200}},{"key":"2_1","position":{"x":200,"y":134}},{"key":"2_2","position":{"x":200,"y":200}},{"key":"2_3","position":{"x":200,"y":266}},{"key":"3_1","position":{"x":290,"y":134}},{"key":"3_2","position":{"x":290,"y":200}},{"key":"3_3","position":{"x":290,"y":266}},{"key":"4_1","position":{"x":380,"y":38}},{"key":"4_2","position":{"x":380,"y":104}},{"key":"4_3","position":{"x":380,"y":170}},{"key":"4_4","position":{"x":380,"y":230}},{"key":"4_5","position":{"x":380,"y":296}},{"key":"4_6","position":{"x":380,"y":362}}]')

test("node positions graph 4", () => {
    graph1TestValues.forEach(test => {
        expect(graphDrawerG4.graph.nodes.get(test.key)?.posX).toBe(test.x);
        expect(graphDrawerG4.graph.nodes.get(test.key)?.posY).toBe(test.y);
    })
})