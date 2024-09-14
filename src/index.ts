import "dotenv/config";

import { GraphAI } from "graphai";
import * as llm_agents from "@graphai/llm_agents";
import * as vanilla_agents from "@graphai/vanilla";

import { readYamlFile } from "./utils";

const questions = readYamlFile(__dirname + "/../Questions.yaml");

const getGraphData = (llms: { agent: string; params: Record<string, any> }[]) => {
  const graphData = {
    version: 0.5,
    nodes: {
      models: {
        value: llms,
      },
      map: {
        agent: "mapAgent",
        inputs: { rows: ":models" },
        isResult: true,
        graph: {
          nodes: {
            questions: {
              value: questions,
            },
            map2: {
              agent: "mapAgent",
              inputs: { rows: ":questions", model: ":row" },
              isResult: true,
              graph: {
                nodes: {
                  graphData: {
                    agent: "stringTemplateAgent",
                    inputs: {
                      agent: ":model.agent",
                      row: ":row",
                      params: ":model.params",
                    },
                    params: {
                      template: {
                        version: 0.5,
                        nodes: {
                          ai: {
                            agent: "${agent}",
                            isResult: true,
                            params: "${params}",
                            inputs: { prompt: "${row}" },
                          },
                        },
                      },
                    },
                  },
                  run: {
                    agent: "nestedAgent",
                    graph: ":graphData",
                    isResult: true,
                  },
                },
              },
            },
          },
        },
      },
    },
  };
  return graphData;
};

const main = async () => {
  const llms = [
    { agent: "openAIAgent", params: {} },
    // {agent: "groqAgent", params: { model: "llama3-8b-8192" }}
  ];
  const graphData = getGraphData(llms);

  const graph = new GraphAI(graphData, { ...llm_agents, ...vanilla_agents });
  const result = await graph.run();
  // console.log(JSON.stringify(result));

  Array.from(llms.keys()).map((llmKey) => {
    const llm = llms[llmKey];
    console.log("## " + llm.agent);
    Array.from(questions.keys()).map((key) => {
      const llmResponses = result.map[llmKey].map2[key].run.ai;
      console.log("Question: ");
      console.log(questions[key]);
      console.log("Answer: ");
      console.log(llmResponses.choices[0].message.content);
      console.log("");
    });
  });
};

main();
