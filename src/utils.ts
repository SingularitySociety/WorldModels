import fs from "fs";
import YAML from "yaml";

export const readYamlFile = (fileName: string) => {
  const fileText = fs.readFileSync(fileName, "utf8");
  const data = YAML.parse(fileText);
  return data;
};
