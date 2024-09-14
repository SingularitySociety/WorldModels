import "dotenv/config";

import { GraphAI } from "graphai";
import * as llm_agents from "@graphai/llm_agents";
import * as vanilla_agents from "@graphai/vanilla";

import fs from "fs";
import { readYamlFile } from "./utils";

type LLMAgentData = { agent: string; params: Record<string, any> };

const questions = readYamlFile(__dirname + "/../Questions.yaml");

const getGraphData = (llms: LLMAgentData[]) => {
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
              params: { resultAll: true },
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
            writeFile: {
              agent: (responses) => {
                const logs = responses.res.map((response) => {
                  return [
                    "Question: ",
                    response.row,
                    "Answer: ",
                    response.run.ai.choices[0].message.content,
                    "",
                  ].join("\n");
                });
                const fileName =
                  __dirname + "/../results/" + responses.model.agent + ".md";

                fs.writeFileSync(fileName, logs.join("\n\n"));
              },
              inputs: { res: ":map2", model: ":row" },
            },
          },
        },
      },
    },
  };
  return graphData;
};

const main = async () => {
  const llms: LLMAgentData[] = [];

  if (process.env["OPENAI_API_KEY"]) {
    llms.push({ agent: "openAIAgent", params: {} });
  }
  if (process.env["GROQ_API_KEY"]) {
    llms.push({ agent: "groqAgent", params: { model: "llama3-8b-8192" } });
  }
  if (llms.length === 0) {
    console.log(".envファイルを追加して、API_KEYを登録してください");
    return;
  }

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
