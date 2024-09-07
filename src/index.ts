import "dotenv/config";

import { GraphAI } from "graphai";
import * as llm_agents from "@graphai/llm_agents";
import * as vanilla_agents from "@graphai/vanilla";

import { readYamlFile } from "./utils";

const questions = readYamlFile(__dirname + "/../questions.yaml");

const getGraphData = (llmAgentName: string, params: any = {}) => {
  const graphData = {
    version: 0.5,
    nodes: {
      inputs: {
        value: questions,
      },
      map: {
        agent: "mapAgent",
        graph: {
          nodes: {
            ai: {
              agent: llmAgentName,
              isResult: true,
              params,
              inputs: { prompt: ":row" },
            },
          },
        },
        inputs: { rows: ":inputs" },
        isResult: true,
      },
    },
  };
  return graphData;
};

const main = async () => {
  const graphData = getGraphData("openAIAgent", {});
  // const graphData = getGraphData("groqAgent", { model: "llama3-8b-8192" });

  const graph = new GraphAI(graphData, { ...llm_agents, ...vanilla_agents });
  const result = await graph.run();

  Array.from(questions.keys()).map((key) => {
    console.log("Question: ");
    console.log(questions[key]);
    console.log("Answer: ");
    console.log(result.map.ai[key].choices[0].message.content);
    console.log("");
  });

};

main();
