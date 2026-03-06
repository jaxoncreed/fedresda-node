import type { StatisticPlugin } from "../StatisticsPlugin";
import { getPluginTermPolicy } from "./termPolicyAdapter";
import { statistics_mean_term_policySchema } from "../../../ui/.ldo/statistics_mean_term_policy.schema";
import { statistics_mean_querySchema } from "../../../ui/.ldo/statistics_mean_query.schema";
import type { GraphPath } from "./util/graphPath";

/** Placeholder query type for mean statistic. */
export type MeanQuery = Record<string, never>;

/** Placeholder output type for mean statistic. */
export type MeanOutput = Record<string, never>;

/** Placeholder term policy type for mean statistic. */
export interface MeanTermPolicy {
  allowedPath: {
    graphPath: GraphPath;
    minValues: number;
    filterValue?: string;
  }[];
}

export const meanPlugin: StatisticPlugin<
  MeanQuery,
  MeanOutput,
  MeanTermPolicy
> = {
  name: "mean",
  route: "mean",
  termPolicySchema: statistics_mean_term_policySchema,
  querySchema: statistics_mean_querySchema,
  evaluateTermPolicy(_query, termPolicyInput): true | Error {
    const adapted = getPluginTermPolicy("mean", termPolicyInput);
    if (!adapted) {
      return new Error("No mean term policy found in term policy document.");
    }
    const allowedPath =
      (adapted as { allowedPath?: unknown }).allowedPath ??
      (adapted as { allowedPaths?: unknown }).allowedPaths;
    if (!Array.isArray(allowedPath) || allowedPath.length === 0) {
      return new Error(
        "mean term policy requires at least one allowedPath entry.",
      );
    }
    return true;
  },
  async performQuery(_query): Promise<MeanOutput> {
    // TODO: implement mean calculation
    return {};
  },
};
