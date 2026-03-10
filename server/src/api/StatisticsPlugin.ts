import type { Schema } from "shexj";

export interface StatisticPlugin<Query, Output, TermPolicy> {
  // The name of the plugin
  name: string;
  // The uri route to the plugin. For example, if this is "kaplan-meier", the
  // you can send a request to the plugin at `/.api/stat/kaplan-meier`
  route: string;
  // A ShexJ schema that defines what a term policy for this specific statistic
  // looks like. This should match the type TermPolicy.
  termPolicySchema: Schema;
  // A ShexJ schema that defines what a query can look like.
  querySchema: Schema;
  // Evaluates if the given query is allowed under the given term policy.
  // Returns true if it is allowed and an error if not.
  evaluateTermPolicy(query: Query, termPolicy: TermPolicy): true | Error;
  // Performs the query and returns the output
  performQuery(query: Query): Promise<Output>;
}
