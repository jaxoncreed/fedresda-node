import { ShapeType } from "@ldo/ldo";
import { statistics_mean_term_policySchema } from "./statistics_mean_term_policy.schema";
import { statistics_mean_term_policyContext } from "./statistics_mean_term_policy.context";
import {
  MeanTermPolicy,
  AllowedPath,
} from "./statistics_mean_term_policy.typings";

/**
 * =============================================================================
 * LDO ShapeTypes statistics_mean_term_policy
 * =============================================================================
 */

/**
 * MeanTermPolicy ShapeType
 */
export const MeanTermPolicyShapeType: ShapeType<MeanTermPolicy> = {
  schema: statistics_mean_term_policySchema,
  shape: "https://fedresda.setmeld.org/statistics#MeanTermPolicyShape",
  context: statistics_mean_term_policyContext,
};

/**
 * AllowedPath ShapeType
 */
export const AllowedPathShapeType: ShapeType<AllowedPath> = {
  schema: statistics_mean_term_policySchema,
  shape: "https://fedresda.setmeld.org/statistics#AllowedPathShape",
  context: statistics_mean_term_policyContext,
};
