import type { Schema } from "shexj";
import type { JSONSchema4 } from "json-schema";
import { IntegrationPodGlobals } from "../../globals";

export interface StatisticPlugin<Query, Output, StatisticAccessRule> {
  // The name of the plugin
  name: string;
  // The uri route to the plugin. For example, if this is "kaplan-meier", the
  // you can send a request to the plugin at `/.api/stat/kaplan-meier`
  route: string;
  // A ShexJ schema that defines what a statistic access rule for this specific
  // statistic looks like. This should match the type StatisticAccessRule.
  statisticAccessRuleSchema: Schema;
  // JSON schema that defines what a query for this statistic looks like.
  // This should match the type Query.
  querySchema: JSONSchema4;
  // Evaluates if the given query is allowed under the given statistic access rule.
  // Returns true if it is allowed and an error if not.
  evaluateStatisticAccessRule(
    query: Query,
    statisticAccessRule: StatisticAccessRule,
  ): true | Error;
  // Performs the query and returns the output
  performQuery(query: Query, globals: IntegrationPodGlobals): Promise<Output>;
}
