import { ShapeType } from "@ldo/ldo";
import { kaplanMeier_statisticAccessRuleSchemaSchema } from "./kaplanMeier_termPolicySchema.schema";
import { kaplanMeier_statisticAccessRuleSchemaContext } from "./kaplanMeier_termPolicySchema.context";
import { KaplanMeierStatisticAccessRule } from "./kaplanMeier_termPolicySchema.typings";

/**
 * =============================================================================
 * LDO ShapeTypes kaplanMeier_statisticAccessRuleSchema
 * =============================================================================
 */

/**
 * KaplanMeierStatisticAccessRule ShapeType
 */
export const KaplanMeierStatisticAccessRuleShapeType: ShapeType<KaplanMeierStatisticAccessRule> =
  {
    schema: kaplanMeier_statisticAccessRuleSchemaSchema,
    shape: "https://fedresda.setmeld.org/statistics#KaplanMeierStatisticAccessRuleShape",
    context: kaplanMeier_statisticAccessRuleSchemaContext,
  };
