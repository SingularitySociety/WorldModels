import "dotenv/config";

import { GraphAI } from "graphai";
import * as llm_agents from "@graphai/llm_agents";
import * as vanilla_agents from "@graphai/vanilla";
const graph_data = {
  version: 0.5,
  nodes: {
    inputs: {
      value: [
        "「引く」と書いてあるドアを反対側から押すとどうなりますか？",
        " 綿菓子の高さは８センチ、レンガの高さは７センチ。綿菓子の上にレンガを置くと、高さは何センチ？",
        " 渋谷駅の公園のベンチの上に財布を3時間放置しました。その日は39度を超える暑さで、財布には直射日光が当たっていました。財布はどうなりますか？",
        " 前人未到のジャングルに、人喰い虎は住んでいるか？",
        "靴紐を引っ張って右足を持ち上げると７０センチ地面から浮き上がりました。靴紐を引っ張って左足を持ち上げると８０センチ地面から浮き上がりました。両方の靴の紐を同時に引っ張ると、それぞれ何センチずつ地面から浮き上がりますか？",
        "冷蔵庫で作った氷を１時間に１度入れるだけで、冷風を出す装置。付属のソラーパネルで中の扇風機を回し、電源は不要。一人暮らしの人にエアコンの代用として販売。価格は通常のエアコンの１０分の１。この装置を評価して。",
      ]
    },
    map: {
      agent: "mapAgent",
      graph: {
        nodes: {
          ai: {
            agent: "openAIAgent",
            isResult: true,
            inputs: {prompt: ":row"}
          },
        }
      },
      inputs: {rows: ":inputs"},
      isResult: true,
    },
  },
};

const main = async () => {
  
  const graph = new GraphAI(graph_data, {...llm_agents, ...vanilla_agents});
  const result = await graph.run();
  
  result.map.ai.map(result => {
    console.log(JSON.stringify(result.choices[0].message.content));
  });
};


main();
