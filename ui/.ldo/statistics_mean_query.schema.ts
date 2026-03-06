import { Schema } from "shexj";

/**
 * =============================================================================
 * statistics_mean_querySchema: ShexJ Schema for statistics_mean_query
 * =============================================================================
 */
export const statistics_mean_querySchema: Schema = {
  type: "Schema",
  shapes: [
    {
      id: "https://fedresda.setmeld.org/statistics#MeanQueryShape",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "TripleConstraint",
          predicate: "https://fedresda.setmeld.org/statistics#queryVersion",
          valueExpr: {
            type: "NodeConstraint",
            datatype: "http://www.w3.org/2001/XMLSchema#string",
          },
          min: 0,
          max: 1,
        },
      },
    },
  ],
};
