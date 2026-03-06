import type { StatisticPlugin } from "../StatisticsPlugin";

/** Placeholder query type for mean statistic. */
export interface MeanQuery {
  // TODO: define query shape
}

/** Placeholder output type for mean statistic. */
export interface MeanOutput {
  // TODO: define output shape
}

/** Placeholder term policy type for mean statistic. */
export interface MeanTermPolicy {
  // TODO: define term policy shape
}

export const meanPlugin: StatisticPlugin<
  MeanQuery,
  MeanOutput,
  MeanTermPolicy
> = {
  name: "mean",
  route: "mean",
  termPolicySchema: {
    type: "object",
    properties: {
      // TODO: define term policy schema
    },
  },
  querySchema: {
    type: "object",
    properties: {
      // TODO: define term policy schema
    },
  },
  evaluateTermPolicy(_query, _termPolicy): true | Error {
    // TODO: implement term policy evaluation
    return true;
  },
  async performQuery(_query): Promise<MeanOutput> {
    // TODO: implement mean calculation
    return {};
  },
};
