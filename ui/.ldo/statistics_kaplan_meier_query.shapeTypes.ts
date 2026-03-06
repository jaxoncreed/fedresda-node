import { ShapeType } from "@ldo/ldo";
import { statistics_kaplan_meier_querySchema } from "./statistics_kaplan_meier_query.schema";
import { statistics_kaplan_meier_queryContext } from "./statistics_kaplan_meier_query.context";
import { KaplanMeierQuery } from "./statistics_kaplan_meier_query.typings";

/**
 * =============================================================================
 * LDO ShapeTypes statistics_kaplan_meier_query
 * =============================================================================
 */

/**
 * KaplanMeierQuery ShapeType
 */
export const KaplanMeierQueryShapeType: ShapeType<KaplanMeierQuery> = {
  schema: statistics_kaplan_meier_querySchema,
  shape: "https://fedresda.setmeld.org/statistics#KaplanMeierQueryShape",
  context: statistics_kaplan_meier_queryContext,
};
