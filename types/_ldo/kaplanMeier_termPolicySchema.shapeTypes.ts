import { ShapeType } from "@ldo/ldo";
import { kaplanMeier_termPolicySchemaSchema } from "./kaplanMeier_termPolicySchema.schema";
import { kaplanMeier_termPolicySchemaContext } from "./kaplanMeier_termPolicySchema.context";
import { KaplanMeierTermPolicy } from "./kaplanMeier_termPolicySchema.typings";

/**
 * =============================================================================
 * LDO ShapeTypes kaplanMeier_termPolicySchema
 * =============================================================================
 */

/**
 * KaplanMeierTermPolicy ShapeType
 */
export const KaplanMeierTermPolicyShapeType: ShapeType<KaplanMeierTermPolicy> =
  {
    schema: kaplanMeier_termPolicySchemaSchema,
    shape: "https://fedresda.setmeld.org/statistics#KaplanMeierTermPolicyShape",
    context: kaplanMeier_termPolicySchemaContext,
  };
