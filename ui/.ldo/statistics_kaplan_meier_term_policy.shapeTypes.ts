import { ShapeType } from "@ldo/ldo";
import { statistics_kaplan_meier_term_policySchema } from "./statistics_kaplan_meier_term_policy.schema";
import { statistics_kaplan_meier_term_policyContext } from "./statistics_kaplan_meier_term_policy.context";
import { KaplanMeierTermPolicy } from "./statistics_kaplan_meier_term_policy.typings";

/**
 * =============================================================================
 * LDO ShapeTypes statistics_kaplan_meier_term_policy
 * =============================================================================
 */

/**
 * KaplanMeierTermPolicy ShapeType
 */
export const KaplanMeierTermPolicyShapeType: ShapeType<KaplanMeierTermPolicy> =
  {
    schema: statistics_kaplan_meier_term_policySchema,
    shape: "https://fedresda.setmeld.org/statistics#KaplanMeierTermPolicyShape",
    context: statistics_kaplan_meier_term_policyContext,
  };
