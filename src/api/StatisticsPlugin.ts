import { JSONSchema4 } from "json-schema";

export interface StatisticPlugin<Query, Output, TermPolicy> {
  // The name of the plugin
  name: string;
  // The uri route to the plugin. For example, if this is "kaplan-meier", the
  // you can send a request to the plugin at `/.api/stat/kaplan-meier`
  route: string;
  // A JSON Schema that defines what a term policy for this specific statistic
  // looks like. This should match the type TermPolicy.
  termPolicySchema: JSONSchema4;
  // A JSON Schema that defines what a query can look like.
  querySchema: JSONSchema4;
  // Evaluates if the given query is allowed under the given term policy.
  // Returns true if it is allowed and an error if not.
  evaluateTermPolicy(query: Query, termPolicy: TermPolicy): true | Error;
  // Performs the query and returns the output
  performQuery(query: Query): Promise<Output>;
}
