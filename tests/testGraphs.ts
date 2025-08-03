import Graphology from "graphology";
import Graph from "../src/Graph/Graph";

export const graph1 = new Graphology({ type: "directed" });

graph1.addNode("1", { value: 0.0 });

graph1.addNode("2", { value: 5, h: "gg" });
graph1.addNode("3", { value: 0 });
graph1.addNode("4", { value: -2.5 });
graph1.addNode("5", { value: -5 });

graph1.addNode("7", { value: 3 });
graph1.addNode("8", { value: -1 });

graph1.addNode("9", { value: -1 });
graph1.addNode("10", { value: -1 });

graph1.addEdge("1", "2");
graph1.addEdge("1", "3");
graph1.addEdge("1", "4");
graph1.addEdge("1", "5");

graph1.addEdge("4", "7");
graph1.addEdge("2", "7");
graph1.addEdge("5", "7");
graph1.addEdge("3", "8");

graph1.addEdge("7", "9");

// long edges
graph1.addEdge("1", "9");
graph1.addEdge("1", "7");
graph1.addEdge("3", "9");
//graph1.addEdge("5", "9")
graph1.addEdge("5", "8");
graph1.addEdge("8", "10");

export const graph2 = new Graph<string>();
graph2.addNode("0_1", "hi");

graph2.addNode("1_1", "hi");

graph2.addNode("2_1", "hi");
graph2.addNode("2_2", "hi");
graph2.addNode("2_3", "hi");

graph2.addNode("3_1", "hi");
graph2.addNode("3_2", "hi");
graph2.addNode("3_3", "hi");

graph2.addNode("4_1", "hi");
graph2.addNode("4_2", "hi");
graph2.addNode("4_3", "hi");
graph2.addNode("4_4", "hi");
graph2.addNode("4_5", "hi");
graph2.addNode("4_6", "hi");

graph2.addEdge("0_1", "1_1");

graph2.addEdge("1_1", "2_1");
graph2.addEdge("1_1", "2_2");
graph2.addEdge("1_1", "2_3");

graph2.addEdge("2_1", "3_1");
graph2.addEdge("2_2", "3_2");
graph2.addEdge("2_3", "3_3");

graph2.addEdge("3_1", "4_1");
graph2.addEdge("3_1", "4_2");
graph2.addEdge("3_1", "4_3");

graph2.addEdge("3_3", "4_4");
graph2.addEdge("3_3", "4_5");
graph2.addEdge("3_3", "4_6");


export const graph3 = new Graph<string>();
graph3.addNode("0_1", "hi");

graph3.addNode("1_1", "hi");
graph3.addNode("1_2", "hi");

graph3.addNode("2_1", "hi");
graph3.addNode("2_2", "hi");

graph3.addEdge("0_1", "1_1");
graph3.addEdge("0_1", "1_2");

graph3.addEdge("1_1", "2_1");
graph3.addEdge("1_2", "2_2");
graph3.addEdge("1_1", "2_2");
graph3.addEdge("1_2", "2_1");

export const graph4 = new Graph<string>();
graph4.addNode("0_1", "hi");
graph4.addNode("0_2", "hi");
graph4.addNode("0_3", "hi");
graph4.addNode("0_4", "hi");

graph4.addNode("1_1", "hi");
graph4.addNode("1_2", "hi");

graph4.addNode("2_1", "hi");
graph4.addNode("2_2", "hi");
graph4.addNode("2_3", "hi");

graph4.addEdge("0_1", "1_1");
graph4.addEdge("0_1", "1_2");
graph4.addEdge("0_2", "1_2");
graph4.addEdge("0_3", "1_1");
graph4.addEdge("0_4", "1_2");

graph4.addEdge("1_1", "2_1");
graph4.addEdge("1_1", "2_2");
graph4.addEdge("1_2", "2_3");