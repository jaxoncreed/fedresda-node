import type { Schema } from "shexj";
import {
  statistics_mean_term_policySchema,
  statistics_kaplan_meier_term_policySchema,
} from "@fedresda/types";

export type StatisticPluginDefinition = {
  name: string;
  termPolicySchema: Schema;
};

export const statisticPlugins: StatisticPluginDefinition[] = [
  {
    name: "mean",
    termPolicySchema: statistics_mean_term_policySchema,
  },
  {
    name: "kaplan-meier",
    termPolicySchema: statistics_kaplan_meier_term_policySchema,
  },
];

export function getTermPolicySchemasByStatisticPlugin(): Record<string, Schema> {
  return statisticPlugins.reduce<Record<string, Schema>>((agg, plugin) => {
    agg[plugin.name] = plugin.termPolicySchema;
    return agg;
  }, {});
}
