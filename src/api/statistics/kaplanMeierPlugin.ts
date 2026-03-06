import type { StatisticPlugin } from "../StatisticsPlugin";

/** Placeholder query type for Kaplan-Meier statistic. */
export interface KaplanMeierQuery {
  // TODO: define query shape
}

/** Placeholder output type for Kaplan-Meier statistic. */
export interface KaplanMeierOutput {
  // TODO: define output shape
}

/** Placeholder term policy type for Kaplan-Meier statistic. */
export interface KaplanMeierTermPolicy {
  // TODO: define term policy shape
}

export const kaplanMeierPlugin: StatisticPlugin<
  KaplanMeierQuery,
  KaplanMeierOutput,
  KaplanMeierTermPolicy
> = {
  name: "kaplan-meier",
  route: "kaplan-meier",
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
  async performQuery(_query): Promise<KaplanMeierOutput> {
    // TODO: implement Kaplan-Meier calculation
    return {};
  },
};
