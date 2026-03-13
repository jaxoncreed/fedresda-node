import { ShapeType } from "@ldo/ldo";
import { mean_termPolicySchemaSchema } from "./mean_termPolicySchema.schema";
import { mean_termPolicySchemaContext } from "./mean_termPolicySchema.context";
import {
  MeanTermPolicy,
  AllowedPath,
  GraphPath,
  GraphNodeFilter,
  GraphTraversalStep,
} from "./mean_termPolicySchema.typings";

/**
 * =============================================================================
 * LDO ShapeTypes mean_termPolicySchema
 * =============================================================================
 */

/**
 * MeanTermPolicy ShapeType
 */
export const MeanTermPolicyShapeType: ShapeType<MeanTermPolicy> = {
  schema: mean_termPolicySchemaSchema,
  shape: "https://fedresda.setmeld.org/statistics#MeanTermPolicyShape",
  context: mean_termPolicySchemaContext,
};

/**
 * AllowedPath ShapeType
 */
export const AllowedPathShapeType: ShapeType<AllowedPath> = {
  schema: mean_termPolicySchemaSchema,
  shape: "https://fedresda.setmeld.org/statistics#AllowedPathShape",
  context: mean_termPolicySchemaContext,
};

/**
 * GraphPath ShapeType
 */
export const GraphPathShapeType: ShapeType<GraphPath> = {
  schema: mean_termPolicySchemaSchema,
  shape: "https://fedresda.setmeld.org/statistics#GraphPathShape",
  context: mean_termPolicySchemaContext,
};

/**
 * GraphNodeFilter ShapeType
 */
export const GraphNodeFilterShapeType: ShapeType<GraphNodeFilter> = {
  schema: mean_termPolicySchemaSchema,
  shape: "https://fedresda.setmeld.org/statistics#GraphNodeFilterShape",
  context: mean_termPolicySchemaContext,
};

/**
 * GraphTraversalStep ShapeType
 */
export const GraphTraversalStepShapeType: ShapeType<GraphTraversalStep> = {
  schema: mean_termPolicySchemaSchema,
  shape: "https://fedresda.setmeld.org/statistics#GraphTraversalStepShape",
  context: mean_termPolicySchemaContext,
};
