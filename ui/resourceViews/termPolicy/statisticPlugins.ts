import type { Schema } from "shexj";
import {
  mean_termPolicySchemaSchema,
  kaplanMeier_termPolicySchemaSchema,
} from "@fedresda/types";

export type StatisticPluginDefinition = {
  name: string;
  termPolicySchema: Schema;
};

export const statisticPlugins: StatisticPluginDefinition[] = [
  {
    name: "mean",
    termPolicySchema: mean_termPolicySchemaSchema,
  },
  {
    name: "kaplan-meier",
    termPolicySchema: kaplanMeier_termPolicySchemaSchema,
  },
];

export function getTermPolicySchemasByStatisticPlugin(): Record<string, Schema> {
  const schemas = statisticPlugins.reduce<Record<string, Schema>>((agg, plugin) => {
    agg[plugin.name] = plugin.termPolicySchema;
    return agg;
  }, {});
  return schemas;
}
