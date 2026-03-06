import { ShapeType } from "@ldo/ldo";
import { statistics_mean_querySchema } from "./statistics_mean_query.schema";
import { statistics_mean_queryContext } from "./statistics_mean_query.context";
import { MeanQuery } from "./statistics_mean_query.typings";

/**
 * =============================================================================
 * LDO ShapeTypes statistics_mean_query
 * =============================================================================
 */

/**
 * MeanQuery ShapeType
 */
export const MeanQueryShapeType: ShapeType<MeanQuery> = {
  schema: statistics_mean_querySchema,
  shape: "https://fedresda.setmeld.org/statistics#MeanQueryShape",
  context: statistics_mean_queryContext,
};
