import { ShapeType } from "@ldo/ldo";
import { statistics_mean_term_policySchema } from "./statistics_mean_term_policy.schema";
import { statistics_mean_term_policyContext } from "./statistics_mean_term_policy.context";
import {
  MeanTermPolicy,
  AllowedPath,
  GraphPath,
  GraphNodeFilter,
  GraphTraversalStep,
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

/**
 * GraphPath ShapeType
 */
export const GraphPathShapeType: ShapeType<GraphPath> = {
  schema: statistics_mean_term_policySchema,
  shape: "https://fedresda.setmeld.org/statistics#GraphPathShape",
  context: statistics_mean_term_policyContext,
};

/**
 * GraphNodeFilter ShapeType
 */
export const GraphNodeFilterShapeType: ShapeType<GraphNodeFilter> = {
  schema: statistics_mean_term_policySchema,
  shape: "https://fedresda.setmeld.org/statistics#GraphNodeFilterShape",
  context: statistics_mean_term_policyContext,
};

/**
 * GraphTraversalStep ShapeType
 */
export const GraphTraversalStepShapeType: ShapeType<GraphTraversalStep> = {
  schema: statistics_mean_term_policySchema,
  shape: "https://fedresda.setmeld.org/statistics#GraphTraversalStepShape",
  context: statistics_mean_term_policyContext,
};
