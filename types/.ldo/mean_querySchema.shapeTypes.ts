import { ShapeType } from "@ldo/ldo";
import { mean_querySchemaSchema } from "./mean_querySchema.schema";
import { mean_querySchemaContext } from "./mean_querySchema.context";
import { MeanQuery } from "./mean_querySchema.typings";

/**
 * =============================================================================
 * LDO ShapeTypes mean_querySchema
 * =============================================================================
 */

/**
 * MeanQuery ShapeType
 */
export const MeanQueryShapeType: ShapeType<MeanQuery> = {
  schema: mean_querySchemaSchema,
  shape: "https://fedresda.setmeld.org/statistics#MeanQueryShape",
  context: mean_querySchemaContext,
};
