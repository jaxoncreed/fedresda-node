import type { StatisticPlugin } from "../StatisticsPlugin";
import { getPluginTermPolicy } from "./termPolicyAdapter";
import { statistics_kaplan_meier_term_policySchema } from "../../../ui/.ldo/statistics_kaplan_meier_term_policy.schema";
import { statistics_kaplan_meier_querySchema } from "../../../ui/.ldo/statistics_kaplan_meier_query.schema";

/** Placeholder query type for Kaplan-Meier statistic. */
export type KaplanMeierQuery = Record<string, never>;

/** Placeholder output type for Kaplan-Meier statistic. */
export type KaplanMeierOutput = Record<string, never>;

/** Placeholder term policy type for Kaplan-Meier statistic. */
export type KaplanMeierTermPolicy = Record<string, never>;

export const kaplanMeierPlugin: StatisticPlugin<
  KaplanMeierQuery,
  KaplanMeierOutput,
  KaplanMeierTermPolicy
> = {
  name: "kaplan-meier",
  route: "kaplan-meier",
  termPolicySchema: statistics_kaplan_meier_term_policySchema,
  querySchema: statistics_kaplan_meier_querySchema,
  evaluateTermPolicy(_query, termPolicyInput): true | Error {
    const adapted = getPluginTermPolicy("kaplan-meier", termPolicyInput);
    if (!adapted) {
      return new Error(
        "No kaplan-meier term policy found in term policy document.",
      );
    }
    // Kaplan-Meier plugin policy shape is not finalized yet.
    return true;
  },
  async performQuery(_query): Promise<KaplanMeierOutput> {
    // TODO: implement Kaplan-Meier calculation
    return {};
  },
};
