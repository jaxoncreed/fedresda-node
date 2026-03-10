import { ShapeType } from "@ldo/ldo";
import { kaplanMeier_querySchemaSchema } from "./kaplanMeier_querySchema.schema";
import { kaplanMeier_querySchemaContext } from "./kaplanMeier_querySchema.context";
import { KaplanMeierQuery } from "./kaplanMeier_querySchema.typings";

/**
 * =============================================================================
 * LDO ShapeTypes kaplanMeier_querySchema
 * =============================================================================
 */

/**
 * KaplanMeierQuery ShapeType
 */
export const KaplanMeierQueryShapeType: ShapeType<KaplanMeierQuery> = {
  schema: kaplanMeier_querySchemaSchema,
  shape: "https://fedresda.setmeld.org/statistics#KaplanMeierQueryShape",
  context: kaplanMeier_querySchemaContext,
};
