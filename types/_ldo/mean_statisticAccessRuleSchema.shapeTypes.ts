import { ShapeType } from "@ldo/ldo";
import { mean_statisticAccessRuleSchemaSchema } from "./mean_statisticAccessRuleSchema.schema";
import { mean_statisticAccessRuleSchemaContext } from "./mean_statisticAccessRuleSchema.context";
import {
  MeanStatisticAccessRule,
  AllowedPath,
  GraphPath,
  GraphNodeFilter,
  GraphTraversalStep,
} from "./mean_statisticAccessRuleSchema.typings";

/**
 * =============================================================================
 * LDO ShapeTypes mean_statisticAccessRuleSchema
 * =============================================================================
 */

/**
 * MeanStatisticAccessRule ShapeType
 */
export const MeanStatisticAccessRuleShapeType: ShapeType<MeanStatisticAccessRule> =
  {
    schema: mean_statisticAccessRuleSchemaSchema,
    shape:
      "https://fedresda.setmeld.org/statistics#MeanStatisticAccessRuleShape",
    context: mean_statisticAccessRuleSchemaContext,
  };

/**
 * AllowedPath ShapeType
 */
export const AllowedPathShapeType: ShapeType<AllowedPath> = {
  schema: mean_statisticAccessRuleSchemaSchema,
  shape: "https://fedresda.setmeld.org/statistics#AllowedPathShape",
  context: mean_statisticAccessRuleSchemaContext,
};

/**
 * GraphPath ShapeType
 */
export const GraphPathShapeType: ShapeType<GraphPath> = {
  schema: mean_statisticAccessRuleSchemaSchema,
  shape: "https://fedresda.setmeld.org/statistics#GraphPathShape",
  context: mean_statisticAccessRuleSchemaContext,
};

/**
 * GraphNodeFilter ShapeType
 */
export const GraphNodeFilterShapeType: ShapeType<GraphNodeFilter> = {
  schema: mean_statisticAccessRuleSchemaSchema,
  shape: "https://fedresda.setmeld.org/statistics#GraphNodeFilterShape",
  context: mean_statisticAccessRuleSchemaContext,
};

/**
 * GraphTraversalStep ShapeType
 */
export const GraphTraversalStepShapeType: ShapeType<GraphTraversalStep> = {
  schema: mean_statisticAccessRuleSchemaSchema,
  shape: "https://fedresda.setmeld.org/statistics#GraphTraversalStepShape",
  context: mean_statisticAccessRuleSchemaContext,
};
