import "dotenv/config";

import { GraphAI } from "graphai";
import * as llm_agents from "@graphai/llm_agents";
import * as vanilla_agents from "@graphai/vanilla";

import { readYamlFile } from "./utils";

const getGraphData = (llmAgentName: string) => {
  const questions = readYamlFile(__dirname + "/../questions.yaml");
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
  const graphData = getGraphData("openAIAgent");
  const graph = new GraphAI(graphData, { ...llm_agents, ...vanilla_agents });
  const result = await graph.run();

  result.map.ai.map((result) => {
    console.log(JSON.stringify(result.choices[0].message.content));
  });
};

main();
